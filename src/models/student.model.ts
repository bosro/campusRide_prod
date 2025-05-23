import mongoose from 'mongoose';
import User from './user.model';
import { StudentDocument } from '../types';

const Student = User.discriminator('student', new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true
  }
}));

export default Student;