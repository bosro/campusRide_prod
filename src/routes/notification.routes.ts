import express from 'express';
import * as notificationController from '../controllers/notification.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes for authenticated users
router.get('/', notificationController.getUserNotifications);
router.patch('/:id/read', notificationController.markNotificationAsRead);
router.patch('/read-all', notificationController.markAllNotificationsAsRead);

export default router;