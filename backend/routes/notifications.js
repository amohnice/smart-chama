const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createSystemNotification,
  getNotificationPreferences,
  updateNotificationPreferences
} = require('../controllers/notificationController');

// Protected routes
router.get('/', auth, getUserNotifications);
router.get('/unread/count', auth, getUnreadCount);
router.patch('/:id/read', auth, markAsRead);
router.patch('/read/all', auth, markAllAsRead);
router.delete('/:id', auth, deleteNotification);
router.delete('/', auth, deleteAllNotifications);
router.post('/system', auth, createSystemNotification);
router.get('/preferences', auth, getNotificationPreferences);
router.patch('/preferences', auth, updateNotificationPreferences);

module.exports = router; 