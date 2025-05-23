import mongoose from 'mongoose';
import User from './user.model';
import { DriverDocument } from '../types';

const Driver = User.discriminator('driver', new mongoose.Schema({
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  shuttleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shuttle'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalTrips: {
    type: Number,
    default: 0
  }
}));

export default Driver;