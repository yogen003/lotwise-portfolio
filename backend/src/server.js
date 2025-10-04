// backend/src/server.js
import express from 'express';
import cors from 'cors';
import dbPool from './config/db.js';
import { producer, connectProducer } from './config/kafka.js';

const app = express();
app.use(express.json());
// CORS setup: Allow frontend (default Next.js port) to talk to API
app.use(cors({ origin: 'http://localhost:3001' })); 

connectProducer();

//  POST /trades (Add trade & publish to Kafka) ---
app.post('/trades', async (req, res) => {
    const { symbol, qty, price, timestamp } = req.body;

    if (!symbol || !qty || !price || !timestamp) {
        return res.status(400).send('Missing symbol, qty, price, or timestamp.');
    }
    
    const tradeEvent = {
        symbol: String(symbol).toUpperCase(),
        qty: Number(qty),
        price: Number(price),
        timestamp: new Date(timestamp).toISOString(),
    };

    try {
        await producer.send({
            topic: 'portfolio-trades',
            messages: [{ value: JSON.stringify(tradeEvent) }],
        });

        res.status(202).send({ message: 'Trade queued for processing.' });
    } catch (error) {
        console.error('Error publishing to Kafka:', error);
        res.status(500).send('Failed to process trade.');
    }
});

// GET /positions (List open lots + average cost) ---
app.get('/positions', async (req, res) => {
    try {
        const result = await dbPool.query(
            `SELECT symbol, SUM(quantity_remaining) as total_qty, 
                    SUM(quantity_remaining * cost_basis) as total_cost 
             FROM lots 
             WHERE quantity_remaining > 0 
             GROUP BY symbol`
        );

        const positions = result.rows.map(row => ({
            symbol: row.symbol,
            quantity: parseFloat(row.total_qty).toFixed(0),
            avg_cost: (parseFloat(row.total_cost) / parseFloat(row.total_qty)).toFixed(4)
        }));

        res.json(positions);
    } catch (error) {
        console.error('Error fetching positions:', error);
        res.status(500).send('Internal Server Error');
    }
});

//  GET /pnl (Realized P&L summary) ---
app.get('/pnl', async (req, res) => {
    try {
        const result = await dbPool.query(
            `SELECT symbol, SUM(realized_pnl) as total_realized_pnl 
             FROM lots 
             GROUP BY symbol`
        );
        
        const pnlSummary = result.rows.map(row => ({
            symbol: row.symbol,
            realized_pnl: parseFloat(row.total_realized_pnl).toFixed(2)
        }));

        res.json(pnlSummary);
    } catch (error) {
        console.error('Error fetching P&L:', error);
        res.status(500).send('Internal Server Error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Server running on port ${PORT}`));