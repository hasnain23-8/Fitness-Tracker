const router = require('express').Router();
const { getLeaderboard, getCombinedLeaderboard } = require('../controllers/leaderboardController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', getLeaderboard);
router.get('/combined', getCombinedLeaderboard);

module.exports = router;
