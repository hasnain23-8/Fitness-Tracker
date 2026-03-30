const db = require('../config/db');

const getWeightLogs = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM weight_logs WHERE user_id=$1 ORDER BY log_date DESC LIMIT 30',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addWeightLog = async (req, res) => {
  const { weight_kg, log_date, note } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO weight_logs (user_id,weight_kg,log_date,note) VALUES ($1,$2,$3,$4) RETURNING id',
      [req.user.id, weight_kg, log_date, note || null]
    );
    res.status(201).json({ message: 'Weight logged', id: rows[0].id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateWeightLog = async (req, res) => {
  const { weight_kg, note } = req.body;
  try {
    await db.query(
      'UPDATE weight_logs SET weight_kg=$1, note=$2 WHERE id=$3 AND user_id=$4',
      [weight_kg, note || null, req.params.id, req.user.id]
    );
    res.json({ message: 'Weight updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteWeightLog = async (req, res) => {
  try {
    await db.query('DELETE FROM weight_logs WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Weight log deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getWeightLogs, addWeightLog, updateWeightLog, deleteWeightLog };
