import express from 'express';
import * as shuttleController from '../controllers/shuttle.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', shuttleController.getAllShuttles);
router.get('/available', shuttleController.getAvailableShuttles);
router.get('/:id', shuttleController.getShuttleById);

// Protected routes
router.use(protect);

// Routes for admins
router.post(
  '/',
  restrictTo('admin'),
  shuttleController.createShuttle
);

router.patch(
  '/:id',
  restrictTo('admin'),
  shuttleController.updateShuttle
);

router.patch(
  '/:id/availability',
  restrictTo('admin', 'driver'),
  shuttleController.updateShuttleAvailability
);

router.patch(
  '/:id/toggle-status',
  restrictTo('admin'),
  shuttleController.toggleShuttleStatus
);

export default router;