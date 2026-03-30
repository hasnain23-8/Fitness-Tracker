const router = require('express').Router();
const { getWeightLogs, addWeightLog, updateWeightLog, deleteWeightLog } = require('../controllers/weightController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', getWeightLogs);
router.post('/', addWeightLog);
router.put('/:id', updateWeightLog);
router.delete('/:id', deleteWeightLog);

module.exports = router;
