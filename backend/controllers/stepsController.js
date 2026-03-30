const db = require('../config/db');

const getSteps = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM steps WHERE user_id=$1 ORDER BY step_date DESC LIMIT 30',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addSteps = async (req, res) => {
  const { step_count, step_date } = req.body;
  try {
    // Upsert: insert or update on conflict (unique user_id + step_date)
    const { rows } = await db.query(
      `INSERT INTO steps (user_id, step_count, step_date) VALUES ($1,$2,$3)
       ON CONFLICT (user_id, step_date)
       DO UPDATE SET step_count = EXCLUDED.step_count
       RETURNING id`,
      [req.user.id, step_count, step_date]
    );
    // 10K badge
    if (parseInt(step_count) >= 10000) {
      await db.query(
        `INSERT INTO achievements (user_id,title,description,badge_icon) VALUES ($1,$2,$3,$4)
         ON CONFLICT DO NOTHING`,
        [req.user.id, '10K Steps Champion', 'Walked 10,000+ steps in a day', 'footprints']
      );
    }
    res.status(201).json({ message: 'Steps logged', id: rows[0].id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteSteps = async (req, res) => {
  try {
    await db.query('DELETE FROM steps WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Steps deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getWeeklySteps = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT step_date AS date, step_count FROM steps
       WHERE user_id=$1 AND step_date >= CURRENT_DATE - INTERVAL '7 days'
       ORDER BY step_date`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getSteps, addSteps, deleteSteps, getWeeklySteps };
