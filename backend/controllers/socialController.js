const db = require('../config/db');

// ─── Friends ────────────────────────────────────────────────
const getFriends = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email, u.profile_picture, f.id AS friendship_id
       FROM friends f
       JOIN users u ON (f.friend_id = u.id AND f.user_id = $1)
                    OR (f.user_id = u.id AND f.friend_id = $1)
       WHERE f.status = 'accepted'`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getPendingRequests = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT f.id, u.id AS user_id, u.name, u.email, u.profile_picture
       FROM friends f JOIN users u ON f.user_id = u.id
       WHERE f.friend_id = $1 AND f.status = 'pending'`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const sendFriendRequest = async (req, res) => {
  const { friend_id } = req.body;
  try {
    const { rows: ex } = await db.query(
      'SELECT id FROM friends WHERE (user_id=$1 AND friend_id=$2) OR (user_id=$2 AND friend_id=$1)',
      [req.user.id, friend_id]
    );
    if (ex.length > 0) return res.status(409).json({ message: 'Request already exists' });
    await db.query(
      'INSERT INTO friends (user_id, friend_id, status) VALUES ($1,$2,$3)',
      [req.user.id, friend_id, 'pending']
    );
    res.status(201).json({ message: 'Friend request sent' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const respondToFriendRequest = async (req, res) => {
  const { status } = req.body;
  try {
    await db.query(
      'UPDATE friends SET status=$1 WHERE id=$2 AND friend_id=$3',
      [status, req.params.id, req.user.id]
    );
    res.json({ message: `Request ${status}` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const searchUsers = async (req, res) => {
  const { q } = req.query;
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email, u.profile_picture,
        f.status AS friend_status,
        CASE WHEN f.user_id = $2 THEN 'sent' WHEN f.friend_id = $2 THEN 'received' ELSE NULL END AS request_direction
       FROM users u
       LEFT JOIN friends f ON (f.user_id = $2 AND f.friend_id = u.id)
                           OR (f.user_id = u.id AND f.friend_id = $2)
       WHERE (u.name ILIKE $1 OR u.email ILIKE $1) AND u.id != $2
       LIMIT 20`,
      [`%${q}%`, req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Remove a friend ─────────────────────────────────────────
const removeFriend = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM friends WHERE (user_id=$1 AND friend_id=$2) OR (user_id=$2 AND friend_id=$1)',
      [req.user.id, req.params.id]
    );
    res.json({ message: 'Friend removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Achievements ─────────────────────────────────────────────
const getAchievements = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM achievements WHERE user_id=$1 ORDER BY earned_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  getFriends, getPendingRequests, sendFriendRequest, respondToFriendRequest,
  searchUsers, removeFriend, getAchievements,
};
