const { Pool, types } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Force DATE (OID 1082) to be returned as a string (YYYY-MM-DD)
// This avoids the automatic conversion to local Date objects and the subsequent timezone shift.
types.setTypeParser(1082, val => val);
// Force NUMERIC (OID 1700) to be returned as a float
types.setTypeParser(1700, val => parseFloat(val));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.query('SELECT 1')
  .then(() => console.log('✅ Neon PostgreSQL connected'))
  .catch(err => console.error('❌ DB connection failed:', err.message));

module.exports = pool;
