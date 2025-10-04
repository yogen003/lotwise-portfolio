// backend/src/config/kafka.js
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'portfolio-api',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();

async function connectProducer() {
    try {
        await producer.connect();
        console.log('Kafka Producer connected.');
    } catch (error) {
        console.error('Failed to connect Kafka Producer:', error);
    }
}

export { producer, connectProducer };