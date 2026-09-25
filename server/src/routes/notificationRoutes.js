const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/authMiddleware');
const {
  listNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { readNotificationValidator } = require('../validators/notificationValidator');

router.get('/', authenticateJWT, listNotifications);
router.patch('/read-all', authenticateJWT, markAllAsRead);
router.patch('/:id/read', authenticateJWT, readNotificationValidator, markAsRead);

module.exports = router;
