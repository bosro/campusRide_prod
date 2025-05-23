import express from 'express';
import * as bookingController from '../controllers/booking.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

// Protect all routes
router.use(protect);

// IMPORTANT: Define specific routes BEFORE generic parameter routes

// Routes for students
router.post(
  '/',
  restrictTo('student'),
  bookingController.createBooking
);

// Fix: Split the optional parameter route into two separate routes
router.get(
  '/student', // Route for current user's bookings
  restrictTo('student', 'admin'),
  bookingController.getBookingsByStudent
);

router.get(
  '/student/:studentId', // Route for specific student's bookings
  restrictTo('student', 'admin'),
  bookingController.getBookingsByStudent
);

router.patch(
  '/:id/rate',
  restrictTo('student'),
  bookingController.addBookingRating
);

// Routes for drivers
// Fix: Split the optional parameter route into two separate routes
router.get(
  '/driver', // Route for current user's bookings
  restrictTo('driver', 'admin'),
  bookingController.getBookingsByDriver
);

router.get(
  '/driver/:driverId', // Route for specific driver's bookings
  restrictTo('driver', 'admin'),
  bookingController.getBookingsByDriver
);

// Routes for admins - this needs to come before /:id
router.get(
  '/',
  restrictTo('admin'),
  bookingController.getAllBookings
);

// Generic routes should come LAST
router.get('/:id', bookingController.getBookingById);

router.patch(
  '/:id/status',
  restrictTo('driver', 'admin'),
  bookingController.updateBookingStatus
);

export default router;