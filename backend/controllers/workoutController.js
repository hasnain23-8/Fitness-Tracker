const db = require('../config/db');

const getWorkouts = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM workouts WHERE user_id=$1 ORDER BY workout_date DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addWorkout = async (req, res) => {
  const { title, type, duration_mins, calories_burned, notes, workout_date } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO workouts (user_id,title,type,duration_mins,calories_burned,notes,workout_date) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [req.user.id, title, type, duration_mins, calories_burned || 0, notes || null, workout_date]
    );
    // First workout badge
    const { rows: cnt } = await db.query('SELECT COUNT(*) FROM workouts WHERE user_id=$1', [req.user.id]);
    if (parseInt(cnt[0].count) === 1) {
      await db.query(
        'INSERT INTO achievements (user_id,title,description,badge_icon) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING',
        [req.user.id, 'First Workout!', 'Logged your very first workout', 'dumbbell']
      );
    }
    res.status(201).json({ message: 'Workout added', id: rows[0].id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateWorkout = async (req, res) => {
  const { title, type, duration_mins, calories_burned, notes, workout_date } = req.body;
  try {
    await db.query(
      'UPDATE workouts SET title=$1,type=$2,duration_mins=$3,calories_burned=$4,notes=$5,workout_date=$6 WHERE id=$7 AND user_id=$8',
      [title, type, duration_mins, calories_burned, notes, workout_date, req.params.id, req.user.id]
    );
    res.json({ message: 'Workout updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteWorkout = async (req, res) => {
  try {
    await db.query('DELETE FROM workouts WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Workout deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getWeeklyStats = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT workout_date::date AS date,
        SUM(duration_mins) AS total_duration,
        SUM(calories_burned) AS total_calories,
        COUNT(*) AS workout_count
       FROM workouts
       WHERE user_id=$1 AND workout_date >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY workout_date::date ORDER BY date`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getMonthlyStats = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT workout_date::date AS date,
        SUM(duration_mins) AS total_duration,
        SUM(calories_burned) AS total_calories,
        COUNT(*) AS workout_count
       FROM workouts
       WHERE user_id=$1 AND workout_date >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY workout_date::date ORDER BY date`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getWorkouts, addWorkout, updateWorkout, deleteWorkout, getWeeklyStats, getMonthlyStats };
