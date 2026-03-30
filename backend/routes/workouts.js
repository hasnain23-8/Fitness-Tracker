const router = require('express').Router();
const { getWorkouts, addWorkout, updateWorkout, deleteWorkout, getWeeklyStats, getMonthlyStats } = require('../controllers/workoutController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/stats/weekly', getWeeklyStats);
router.get('/stats/monthly', getMonthlyStats);
router.get('/', getWorkouts);
router.post('/', addWorkout);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

module.exports = router;
