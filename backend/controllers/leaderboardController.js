const db = require('../config/db');

// Friend filter sub-query (reused)
const friendFilter = (param = '$1') => `
  (u.id = ${param} OR u.id IN (
    SELECT CASE WHEN user_id = ${param} THEN friend_id ELSE user_id END
    FROM friends
    WHERE (user_id = ${param} OR friend_id = ${param}) AND status = 'accepted'
  ))`;

const getLeaderboard = async (req, res) => {
  const { sort = 'steps', period = 'week' } = req.query;
  const intervals = { week: '7 days', month: '30 days', all: '36500 days' };
  const interval = intervals[period] || '7 days';

  try {
    let query;
    if (sort === 'steps') {
      query = `
        SELECT u.id, u.name, u.profile_picture,
          COALESCE(SUM(s.step_count),0)::int AS total_steps,
          0 AS total_calories, 0 AS workout_count
        FROM users u
        LEFT JOIN steps s ON u.id = s.user_id AND s.step_date >= CURRENT_DATE - INTERVAL '${interval}'
        WHERE ${friendFilter()}
        GROUP BY u.id ORDER BY total_steps DESC LIMIT 20`;
    } else if (sort === 'calories') {
      query = `
        SELECT u.id, u.name, u.profile_picture,
          0 AS total_steps,
          COALESCE(SUM(w.calories_burned),0)::int AS total_calories,
          0 AS workout_count
        FROM users u
        LEFT JOIN workouts w ON u.id = w.user_id AND w.workout_date >= CURRENT_DATE - INTERVAL '${interval}'
        WHERE ${friendFilter()}
        GROUP BY u.id ORDER BY total_calories DESC LIMIT 20`;
    } else {
      query = `
        SELECT u.id, u.name, u.profile_picture,
          0 AS total_steps, 0 AS total_calories,
          COUNT(w.id)::int AS workout_count
        FROM users u
        LEFT JOIN workouts w ON u.id = w.user_id AND w.workout_date >= CURRENT_DATE - INTERVAL '${interval}'
        WHERE ${friendFilter()}
        GROUP BY u.id ORDER BY workout_count DESC LIMIT 20`;
    }
    const { rows } = await db.query(query, [req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Combined leaderboard — all 3 metrics in one response, sorted by primary metric
const getCombinedLeaderboard = async (req, res) => {
  const { sort = 'steps', period = 'week' } = req.query;
  const intervals = { week: '7 days', month: '30 days', all: '36500 days' };
  const interval = intervals[period] || '7 days';

  try {
    const query = `
      SELECT
        u.id, u.name, u.profile_picture,
        COALESCE(SUM(s.step_count), 0)::int            AS total_steps,
        COALESCE(SUM(w.calories_burned), 0)::int       AS total_calories,
        COUNT(DISTINCT w.id)::int                      AS workout_count
      FROM users u
      LEFT JOIN steps s
        ON s.user_id = u.id AND s.step_date >= CURRENT_DATE - INTERVAL '${interval}'
      LEFT JOIN workouts w
        ON w.user_id = u.id AND w.workout_date >= CURRENT_DATE - INTERVAL '${interval}'
      WHERE ${friendFilter()}
      GROUP BY u.id
      ORDER BY
        CASE '${sort}'
          WHEN 'steps'    THEN COALESCE(SUM(s.step_count), 0)
          WHEN 'calories' THEN COALESCE(SUM(w.calories_burned), 0)
          ELSE COUNT(DISTINCT w.id)
        END DESC
      LIMIT 20`;

    const { rows } = await db.query(query, [req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getLeaderboard, getCombinedLeaderboard };
