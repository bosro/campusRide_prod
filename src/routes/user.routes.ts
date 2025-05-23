import express from 'express';
import * as userController from '../controllers/user.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes for all authenticated users
router.get('/me', userController.getUserById);
router.patch('/update-profile', userController.updateUser);

// Routes for drivers
router.patch(
  '/update-availability',
  restrictTo('driver'),
  userController.updateDriverAvailability
);

// Routes for admins
router.get(
  '/',
  restrictTo('admin'),
  userController.getAllUsers
);

router.get(
  '/students',
  restrictTo('admin'),
  userController.getAllStudents
);

router.get(
  '/drivers',
  restrictTo('admin'),
  userController.getAllDrivers
);

router.patch(
  '/drivers/:id/approve',
  restrictTo('admin'),
  userController.approveDriver
);

export default router;