const db = require('../config/db');

const getGoals = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM goals WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addGoal = async (req, res) => {
  const { title, category, target_value, unit, deadline } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO goals (user_id,title,category,target_value,unit,deadline) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [req.user.id, title, category, target_value, unit || null, deadline || null]
    );
    res.status(201).json({ message: 'Goal created', id: rows[0].id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateGoal = async (req, res) => {
  const { title, target_value, current_value, unit, deadline, is_completed } = req.body;
  try {
    await db.query(
      'UPDATE goals SET title=$1,target_value=$2,current_value=$3,unit=$4,deadline=$5,is_completed=$6 WHERE id=$7 AND user_id=$8',
      [title, target_value, current_value, unit || null, deadline || null, is_completed || false, req.params.id, req.user.id]
    );
    if (is_completed) {
      await db.query(
        `INSERT INTO achievements (user_id,title,description,badge_icon) VALUES ($1,$2,$3,$4)
         ON CONFLICT DO NOTHING`,
        [req.user.id, 'Goal Crusher', 'Completed a fitness goal!', 'target']
      );
      await db.query(
        'INSERT INTO notifications (user_id,message,type) VALUES ($1,$2,$3)',
        [req.user.id, `🎉 You completed your goal: "${title}"`, 'goal']
      );
    }
    res.json({ message: 'Goal updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteGoal = async (req, res) => {
  try {
    await db.query('DELETE FROM goals WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Goal deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getCompletedGoals = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM goals WHERE user_id=$1 AND is_completed=TRUE ORDER BY updated_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getGoals, addGoal, updateGoal, deleteGoal, getCompletedGoals };
