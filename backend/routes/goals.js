const router = require('express').Router();
const { getGoals, addGoal, updateGoal, deleteGoal, getCompletedGoals } = require('../controllers/goalsController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/completed', getCompletedGoals);
router.get('/', getGoals);
router.post('/', addGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
