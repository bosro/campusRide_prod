import mongoose, { Schema } from 'mongoose';
import { NotificationDocument, NotificationType } from '../types';

const notificationSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['booking', 'trip', 'system', 'feedback'],
    default: 'system'
  },
  relatedItemId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'refModel'
  },
  refModel: {
    type: String,
    enum: ['Booking', 'User', 'Shuttle'],
    default: 'Booking'
  }
}, {
  timestamps: true
});

// Index for faster querying of user notifications
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model<NotificationDocument>('Notification', notificationSchema);

export default Notification;