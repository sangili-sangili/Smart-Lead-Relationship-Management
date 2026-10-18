const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', clearAll);

module.exports = router;
