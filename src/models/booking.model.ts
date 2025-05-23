import mongoose, { Schema } from 'mongoose';
import { BookingDocument, BookingStatus } from '../types';

const bookingSchema = new Schema({
  shuttleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shuttle',
    required: [true, 'Shuttle ID is required']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Driver ID is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'canceled', 'completed'],
    default: 'pending'
  },
  bookingTime: {
    type: Date,
    default: Date.now
  },
  tripTime: {
    type: Date,
    required: [true, 'Trip time is required']
  },
  pickupLocation: {
    type: String,
    required: [true, 'Pickup location is required'],
    trim: true
  },
  dropoffLocation: {
    type: String,
    required: [true, 'Dropoff location is required'],
    trim: true
  },
  route: {
    type: String,
    required: [true, 'Route is required'],
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields for related data
bookingSchema.virtual('student', {
  ref: 'User',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true
});

bookingSchema.virtual('driver', {
  ref: 'User',
  localField: 'driverId',
  foreignField: '_id',
  justOne: true
});

bookingSchema.virtual('shuttle', {
  ref: 'Shuttle',
  localField: 'shuttleId',
  foreignField: '_id',
  justOne: true
});

const Booking = mongoose.model<BookingDocument>('Booking', bookingSchema);

export default Booking;