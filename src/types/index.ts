import { Document, Types } from 'mongoose';

export type UserRole = 'student' | 'driver' | 'admin';

export type BookingStatus = 'pending' | 'confirmed' | 'canceled' | 'completed';

export type NotificationType = 'booking' | 'trip' | 'system' | 'feedback';

export interface UserDocument extends Document {
  _id: Types.ObjectId; 
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: UserRole;
  profilePicture?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface StudentDocument extends UserDocument {
  studentId: string;
}

export interface DriverDocument extends UserDocument {
  licenseNumber: string;
  isApproved: boolean;
  isAvailable: boolean;
  shuttleId?: string;
  rating?: number;
  totalTrips?: number;
  lastLoginDate?: Date;
}

export interface AdminDocument extends UserDocument {
  adminLevel: number;  // Different admin levels (1=standard, 2=supervisor, 3=superadmin)
  department: string;  // Department the admin is responsible for
  canApproveDrivers: boolean;  // Permission to approve drivers
  canManageShuttles: boolean;  // Permission to manage shuttles
  canViewAllReports: boolean;  // Permission to access all reports
  lastLoginDate: Date;  // Track admin activity
}

export interface ShuttleDocument extends Document {
  name: string;
  capacity: number;
  availableSeats: number;
  driverId?: string;
  route: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingDocument extends Document {
  shuttleId: string;
  studentId: string;
  driverId: string;
  status: BookingStatus;
  bookingTime: Date;
  tripTime: Date;
  pickupLocation: string;
  dropoffLocation: string;
  route: string;
  rating?: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationDocument extends Document {
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: NotificationType;
  relatedItemId?: string;
  refModel?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PopulatedBookingDocument extends Omit<BookingDocument, 'shuttleId' | 'studentId' | 'driverId'> {
  shuttle: ShuttleDocument;
  student: UserDocument;
  driver: UserDocument;
  shuttleId?: string;
  studentId?: string;
  driverId?: string;
}