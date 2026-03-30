const db = require('../config/db');

const uploadProfilePicture = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const url = `/uploads/profiles/${req.file.filename}`;
  try {
    await db.query('UPDATE users SET profile_picture=$1 WHERE id=$2', [url, req.user.id]);
    res.json({ message: 'Profile picture updated', url });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const uploadProgressPhoto = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const { caption } = req.body;
  const url = `/uploads/progress/${req.file.filename}`;
  try {
    const { rows } = await db.query(
      'INSERT INTO progress_photos (user_id, photo_url, caption) VALUES ($1,$2,$3) RETURNING id',
      [req.user.id, url, caption || null]
    );
    res.json({ message: 'Progress photo uploaded', url, id: rows[0].id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getProgressPhotos = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM progress_photos WHERE user_id=$1 ORDER BY uploaded_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteProgressPhoto = async (req, res) => {
  try {
    await db.query('DELETE FROM progress_photos WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Photo deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { uploadProfilePicture, uploadProgressPhoto, getProgressPhotos, deleteProgressPhoto };
