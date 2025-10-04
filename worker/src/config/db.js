// worker/src/config/db.js
import pg from 'pg';
const { Pool } = pg;

const dbPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'lottrackers',
    password: process.env.DB_PASSWORD || 'admin',
    port: process.env.DB_PORT || 5432,
});

export default dbPool;