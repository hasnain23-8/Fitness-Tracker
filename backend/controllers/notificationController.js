const db = require('../config/db');

const getNotifications = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const markAsRead = async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read=TRUE WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const markAllRead = async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read=TRUE WHERE user_id=$1', [req.user.id]);
    res.json({ message: 'All marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getNotifications, markAsRead, markAllRead };
