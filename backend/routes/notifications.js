const router = require('express').Router();
const { getNotifications, markAsRead, markAllRead } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markAsRead);

module.exports = router;
