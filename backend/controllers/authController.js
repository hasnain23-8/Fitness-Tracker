const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });
  try {
    const { rows: existing } = await db.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.length > 0) return res.status(409).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id',
      [name, email, hashed]
    );
    const userId = rows[0].id;
    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Registration successful', token, user: { id: userId, name, email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'All fields are required' });
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    const user = rows[0];
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, profile_picture: user.profile_picture } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, profile_picture, date_of_birth, gender, height_cm, weight_kg, created_at FROM users WHERE id=$1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateProfile = async (req, res) => {
  const { name, date_of_birth, gender, height_cm, weight_kg } = req.body;
  try {
    await db.query(
      'UPDATE users SET name=$1, date_of_birth=$2, gender=$3, height_cm=$4, weight_kg=$5 WHERE id=$6',
      [name, date_of_birth || null, gender || null, height_cm || null, weight_kg || null, req.user.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
