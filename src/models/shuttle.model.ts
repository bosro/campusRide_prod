import mongoose, { Schema } from 'mongoose';
import { ShuttleDocument } from '../types';

const shuttleSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Shuttle name is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  route: {
    type: String,
    required: [true, 'Route is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for driver data
shuttleSchema.virtual('driver', {
  ref: 'User',
  localField: 'driverId',
  foreignField: '_id',
  justOne: true
});

const Shuttle = mongoose.model<ShuttleDocument>('Shuttle', shuttleSchema);

export default Shuttle;