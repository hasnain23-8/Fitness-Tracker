const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/steps', require('./routes/steps'));
app.use('/api/weight', require('./routes/weight'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/social', require('./routes/social'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Fitness Tracker API running!' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
