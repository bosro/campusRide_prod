import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Booking from '../models/booking.model';
import Shuttle from '../models/shuttle.model';
import User from '../models/user.model';
import { createNotification } from '../services/notification.service';
import { BookingStatus, PopulatedBookingDocument } from '../types';
import { validateObjectId } from '../utils/mongoose';

// Get all bookings
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find()
      .populate('shuttle', 'name')
      .populate('student', 'name')
      .populate('driver', 'name') as unknown as PopulatedBookingDocument[];
    
    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get bookings by student
export const getBookingsByStudent = async (req: Request, res: Response) => {
  try {
    // Fix: Don't use req.params.studentId directly without validation
    // Use req.user._id as the default value
    const studentId = req.params.studentId || req.user._id;
    
    // Important: Validate that studentId is a valid ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid student ID'
      });
      return; // Return without a value - just to exit the function
    }
    
    const bookings = await Booking.find({ studentId })
      .populate('shuttle', 'name')
      .populate('driver', 'name')
      .sort('-createdAt') as unknown as PopulatedBookingDocument[];
    
    // Format the response
    const formattedBookings = bookings.map(booking => {
      const {
        _id, status, bookingTime, tripTime, pickupLocation,
        dropoffLocation, route, rating, feedback, shuttle, driver
      } = booking;
      
      return {
        id: _id,
        shuttleId: shuttle?._id,
        shuttleName: shuttle?.name,
        studentId,
        studentName: req.user.name,
        driverId: driver?._id,
        driverName: driver?.name,
        status,
        bookingTime,
        tripTime,
        pickupLocation,
        dropoffLocation,
        route,
        rating,
        feedback
      };
    });
    
    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings: formattedBookings
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get bookings by driver
export const getBookingsByDriver = async (req: Request, res: Response) => {
  try {
    const driverId = req.params.driverId || req.user._id;
    
    // Validate that driverId is a valid ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid driver ID'
      });
      return; // Return without a value - just to exit the function
    }
    
    const bookings = await Booking.find({ driverId })
      .populate('shuttle', 'name')
      .populate('student', 'name')
      .sort('-createdAt') as unknown as PopulatedBookingDocument[];
    
    // Format the response
    const formattedBookings = bookings.map(booking => {
      const {
        _id, status, bookingTime, tripTime, pickupLocation,
        dropoffLocation, route, rating, feedback, shuttle, student
      } = booking;
      
      return {
        id: _id,
        shuttleId: shuttle?._id,
        shuttleName: shuttle?.name,
        studentId: student?._id,
        studentName: student?.name,
        driverId,
        driverName: req.user.name,
        status,
        bookingTime,
        tripTime,
        pickupLocation,
        dropoffLocation,
        route,
        rating,
        feedback
      };
    });
    
    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings: formattedBookings
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};


// Get booking by ID
export const getBookingById = async (req: Request, res: Response) => {
  try {
    // Validate booking ID
    if (!validateObjectId(req.params.id, res, 'booking')) {
      return;
    }
    
    const booking = await Booking.findById(req.params.id)
      .populate('shuttle', 'name')
      .populate('student', 'name')
      .populate('driver', 'name') as unknown as PopulatedBookingDocument;
    
    if (!booking) {
      res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Create a new booking
export const createBooking = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { shuttleId, tripTime, pickupLocation, dropoffLocation, route } = req.body;
    const studentId = req.user._id;
    
    // Validate shuttle ID
    if (!validateObjectId(shuttleId, res, 'shuttle')) {
      return;
    }
    
    // Check if shuttle exists and has available seats
    const shuttle = await Shuttle.findById(shuttleId);
    
    if (!shuttle) {
      res.status(404).json({
        status: 'fail',
        message: 'Shuttle not found'
      });
      return;
    }
    
    if (!shuttle.isActive) {
      res.status(400).json({
        status: 'fail',
        message: 'Shuttle is not active'
      });
      return;
    }
    
    if (shuttle.availableSeats <= 0) {
      res.status(400).json({
        status: 'fail',
        message: 'No available seats on this shuttle'
      });
      return;
    }
    
    // Validate driver
    if (!shuttle.driverId) {
      res.status(400).json({
        status: 'fail',
        message: 'Shuttle has no assigned driver'
      });
      return;
    }
    
    // Create booking
    const newBooking = await Booking.create({
      shuttleId,
      studentId,
      driverId: shuttle.driverId,
      status: 'pending',
      bookingTime: new Date(),
      tripTime,
      pickupLocation,
      dropoffLocation,
      route: route || shuttle.route
    });
    
    // Update shuttle available seats
    shuttle.availableSeats--;
    await shuttle.save({ session });
    
    // Create notifications
    // For student
    await createNotification({
      userId: studentId,
      title: 'Booking Submitted',
      message: `Your booking request for ${shuttle.name} has been submitted and is pending confirmation.`,
      type: 'booking',
      relatedItemId: newBooking.id,
      refModel: 'Booking'
    });
    
    // For driver
    await createNotification({
      userId: shuttle.driverId,
      title: 'New Booking Request',
      message: `You have a new booking request for your shuttle.`,
      type: 'trip',
      relatedItemId: newBooking.id,
      refModel: 'Booking'
    });
    
    await session.commitTransaction();
    
    // Format the response
    const student = await User.findById(studentId);
    const driver = await User.findById(shuttle.driverId);
    
    const formattedBooking = {
      id: newBooking._id,
      shuttleId,
      shuttleName: shuttle.name,
      studentId,
      studentName: student ? student.name : '',
      driverId: shuttle.driverId,
      driverName: driver ? driver.name : '',
      status: newBooking.status,
      bookingTime: newBooking.bookingTime,
      tripTime: newBooking.tripTime,
      pickupLocation: newBooking.pickupLocation,
      dropoffLocation: newBooking.dropoffLocation,
      route: newBooking.route
    };
    
    res.status(201).json({
      status: 'success',
      data: {
        booking: formattedBooking
      }
    });
  } catch (error: any) {
    await session.abortTransaction();
    
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

// Update booking status
export const updateBookingStatus = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Validate booking ID
    if (!validateObjectId(req.params.id, res, 'booking')) {
      return;
    }
    
    const { status } = req.body as { status: BookingStatus };
    
    // Validate status
    if (!['pending', 'confirmed', 'canceled', 'completed'].includes(status)) {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid status'
      });
      return;
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
      return;
    }
    
    // Check if status already set to the requested status
    if (booking.status === status) {
      res.status(400).json({
        status: 'fail',
        message: `Booking status is already ${status}`
      });
      return;
    }
    
    const oldStatus = booking.status;
    
    // Update booking status
    booking.status = status;
    await booking.save({ session });
    
    // If canceled, return the seat to the shuttle
    if (status === 'canceled' && oldStatus !== 'canceled') {
      const shuttle = await Shuttle.findById(booking.shuttleId);
      
      if (shuttle) {
        shuttle.availableSeats++;
        await shuttle.save({ session });
      }
    }
    
    // Create notification based on status
    let notificationTitle = '';
    let notificationMessage = '';
    const shuttle = await Shuttle.findById(booking.shuttleId);
    
    switch (status) {
      case 'confirmed':
        notificationTitle = 'Booking Confirmed';
        notificationMessage = `Your booking for ${shuttle ? shuttle.name : 'the shuttle'} has been confirmed.`;
        break;
      case 'canceled':
        notificationTitle = 'Booking Canceled';
        notificationMessage = `Your booking for ${shuttle ? shuttle.name : 'the shuttle'} has been canceled.`;
        break;
      case 'completed':
        notificationTitle = 'Trip Completed';
        notificationMessage = `Your trip with ${shuttle ? shuttle.name : 'the shuttle'} has been completed. Please rate your experience.`;
        break;
      default:
        break;
    }
    
    if (notificationTitle) {
      await createNotification({
        userId: booking.studentId,
        title: notificationTitle,
        message: notificationMessage,
        type: 'booking',
        relatedItemId: booking.id,
        refModel: 'Booking'
      });
    }
    
    await session.commitTransaction();
    
    // Format the response
    const student = await User.findById(booking.studentId);
    const driver = await User.findById(booking.driverId);
    
    const formattedBooking = {
      id: booking._id,
      shuttleId: booking.shuttleId,
      shuttleName: shuttle ? shuttle.name : '',
      studentId: booking.studentId,
      studentName: student ? student.name : '',
      driverId: booking.driverId,
      driverName: driver ? driver.name : '',
      status: booking.status,
      bookingTime: booking.bookingTime,
      tripTime: booking.tripTime,
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      route: booking.route,
      rating: booking.rating,
      feedback: booking.feedback
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        booking: formattedBooking
      }
    });
  } catch (error: any) {
    await session.abortTransaction();
    
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

// Add rating and feedback to a booking
export const addBookingRating = async (req: Request, res: Response) => {
  try {
    // Validate booking ID
    if (!validateObjectId(req.params.id, res, 'booking')) {
      return;
    }
    
    const { rating, feedback } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({
        status: 'fail',
        message: 'Rating must be between 1 and 5'
      });
      return;
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
      return;
    }
    
    // Check if booking is completed
    if (booking.status !== 'completed') {
      res.status(400).json({
        status: 'fail',
        message: 'You can only rate completed trips'
      });
      return;
    }
    
    // Check if user is the booking's student
    if (booking.studentId.toString() !== req.user._id.toString()) {
      res.status(403).json({
        status: 'fail',
        message: 'You can only rate your own bookings'
      });
      return;
    }
    
    // Update booking with rating and feedback
    booking.rating = rating;
    booking.feedback = feedback;
    await booking.save();
    
    // Create notification for driver
    await createNotification({
      userId: booking.driverId,
      title: 'New Rating Received',
      message: `You received a ${rating}-star rating for your trip.`,
      type: 'feedback',
      relatedItemId: booking.id, 
      refModel: 'Booking'
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};