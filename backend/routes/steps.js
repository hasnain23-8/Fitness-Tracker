const router = require('express').Router();
const { getSteps, addSteps, deleteSteps, getWeeklySteps } = require('../controllers/stepsController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/weekly', getWeeklySteps);
router.get('/', getSteps);
router.post('/', addSteps);
router.delete('/:id', deleteSteps);

module.exports = router;
