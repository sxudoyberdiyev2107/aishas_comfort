const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// DB connection string or parameter mapping
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'aishas_comfort',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database successfully.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
