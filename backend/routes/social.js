const router = require('express').Router();
const {
  getFriends, getPendingRequests, sendFriendRequest, respondToFriendRequest,
  searchUsers, removeFriend, getAchievements
} = require('../controllers/socialController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/friends', getFriends);
router.get('/friends/pending', getPendingRequests);
router.post('/friends', sendFriendRequest);
router.put('/friends/:id/respond', respondToFriendRequest);
router.delete('/friends/:id', removeFriend);
router.get('/users/search', searchUsers);
router.get('/achievements', getAchievements);

module.exports = router;
