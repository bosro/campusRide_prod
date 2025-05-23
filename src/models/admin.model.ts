import mongoose from 'mongoose';
import User from './user.model';
import { AdminDocument } from '../types';

const Admin = User.discriminator('admin', new mongoose.Schema({
  adminLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 3
  },
  department: {
    type: String,
    default: 'Transportation',
    trim: true
  },
  canApproveDrivers: {
    type: Boolean,
    default: true
  },
  canManageShuttles: {
    type: Boolean,
    default: true
  },
  canViewAllReports: {
    type: Boolean,
    default: true
  },
  lastLoginDate: {
    type: Date,
    default: Date.now
  }
}));

export default Admin;