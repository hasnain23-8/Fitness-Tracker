require('dotenv').config();
const db = require('./config/db');

async function test() {
  try {
    const { rows } = await db.query('SELECT * FROM steps ORDER BY step_date DESC');
    console.log('--- ALL STEPS ---');
    rows.forEach(r => {
      console.log(`ID: ${r.id}, User: ${r.user_id}, Date: ${r.step_date}, Steps: ${r.step_count}`);
      console.log('Type of step_date:', typeof r.step_date);
      if (r.step_date instanceof Date) {
        console.log('ISO String:', r.step_date.toISOString());
      }
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
