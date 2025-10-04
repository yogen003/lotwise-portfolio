import dbPool from '../config/db.js'; 

async function createLot(trade) {
    const { symbol, qty, price, timestamp } = trade;
    
    const query = `
        INSERT INTO lots (symbol, quantity_remaining, original_quantity, cost_basis, open_timestamp)
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id;
    `;
    await dbPool.query(query, [symbol, qty, qty, price, timestamp]);
    console.log(`WORKER: Created new lot for ${symbol} qty ${qty} @ ${price}`);
}

async function processSell(sellTrade) {
    const { symbol, qty: sellQty, price: sellPrice } = sellTrade;
    let remainingToSell = Math.abs(sellQty); 
    const sellTimestamp = sellTrade.timestamp;

    // 1. Fetch open lots, ordered by FIFO (First-In, First-Out)
    const openLotsResult = await dbPool.query(
        `SELECT * FROM lots 
         WHERE symbol = $1 AND quantity_remaining > 0 
         ORDER BY open_timestamp ASC`, 
        [symbol]
    );
    
    // Start Transaction for atomic update
    const client = await dbPool.connect();
    try {
        await client.query('BEGIN'); 
        
        for (const lot of openLotsResult.rows) {
            if (remainingToSell <= 0) break; 

            const lotId = lot.id;
            const lotQty = parseFloat(lot.quantity_remaining);
            const lotCost = parseFloat(lot.cost_basis);
            
            let quantityClosed = Math.min(lotQty, remainingToSell);
            remainingToSell -= quantityClosed;

            // 2. Calculate Realized P&L
            const pnl = (sellPrice - lotCost) * quantityClosed;

            // 3. Update the lot
            // NOTE: We separate the index of the variables used in the SET clause 
            // from those used only in jsonb_build_object to prevent the 42P18 error.
            // $1 and $2 are used in the main SET clause. $3, $4, $5 are reserved for the JSON object,
            // and $6 is reserved for the WHERE clause.
            const updateQuery = `
                UPDATE lots 
                SET quantity_remaining = quantity_remaining - $1, 
                    realized_pnl = realized_pnl + $2,
                    closing_trades = COALESCE(closing_trades, '[]'::JSONB) || jsonb_build_object(
                        'trade_qty', $3::numeric,      
                        'trade_price', $4::numeric,     
                        'trade_timestamp', $5::text    
                    )
                WHERE id = $6;
            `;
            
            // Execute query with 6 parameters corresponding to $1 through $6
            await client.query(updateQuery, [
                quantityClosed,  // $1: quantity to subtract (NUMERIC)
                pnl,             // $2: P&L to add (NUMERIC)
                quantityClosed,  // $3: trade_qty (for JSON, forced to NUMERIC)
                sellPrice,       // $4: trade_price (for JSON, forced to NUMERIC)
                sellTimestamp,   // $5: trade_timestamp (for JSON, forced to TEXT)
                lotId            // $6: WHERE clause ID
            ]);
            
            console.log(`WORKER: Closed ${quantityClosed} of Lot #${lotId}. P&L: ${pnl.toFixed(2)}`);
        }
        
        await client.query('COMMIT'); 
    } catch (error) {
        await client.query('ROLLBACK');
        // Log the rollback and the error code for confirmation
        console.error('WORKER: Error processing SELL trade (ROLLED BACK):', error);
        throw error;
    } finally {
        client.release();
    }
}

export { createLot, processSell };