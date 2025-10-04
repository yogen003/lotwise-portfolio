// worker/src/consumer.js
import { Kafka } from 'kafkajs';
import { createLot, processSell } from './services/lotlogic.js';

const kafka = new Kafka({
    clientId: 'portfolio-worker',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'lot-tracker-group' });

async function runWorker() {
    await consumer.connect();
    await consumer.subscribe({ topic: 'portfolio-trades', fromBeginning: false });
    
    console.log('Kafka Worker is running and listening for trade events...');

    await consumer.run({
        eachMessage: async ({ message }) => {
            const trade = JSON.parse(message.value.toString());
            
            try {
                if (trade.qty > 0) {
                    await createLot(trade);
                } else if (trade.qty < 0) {
                    await processSell(trade);
                }
            } catch (error) {
                console.error(`WORKER: FAILED to process trade:`, trade, error);
            }
        },
    });
}

runWorker().catch(console.error);