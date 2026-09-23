const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getNotificationsController,
  markAsReadController,
  markAllAsReadController,
  deleteNotificationController
} = require('../controllers/notificationController');

// Get notifications
router.get('/', authMiddleware, getNotificationsController);

// Mark as read
router.put('/:id/read', authMiddleware, markAsReadController);

// Mark all as read
router.put('/read-all', authMiddleware, markAllAsReadController);

// Delete notification
router.delete('/:id', authMiddleware, deleteNotificationController);

const {
  getAdminNotificationsController,
  markAdminNotificationAsReadController,
} = require('../controllers/notificationController');

router.get('/admin', getAdminNotificationsController);
// PUT Admin Mark Read
router.put('/admin/:id/read', markAdminNotificationAsReadController);
// Get notifications
router.get('/', authMiddleware, getNotificationsController);

// Mark as read
router.put('/:id/read', authMiddleware, markAsReadController);

// Mark all as read
router.put('/read-all', authMiddleware, markAllAsReadController);

// Delete notification
router.delete('/:id', authMiddleware, deleteNotificationController);

module.exports = router;