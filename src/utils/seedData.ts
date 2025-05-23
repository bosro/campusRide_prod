import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import Student from '../models/student.model';
import Driver from '../models/driver.model';
import Admin from '../models/admin.model';
import Shuttle from '../models/shuttle.model';
import Booking from '../models/booking.model';
import Notification from '../models/notification.model';
import { 
  DriverDocument, 
  StudentDocument, 
  AdminDocument, 
  ShuttleDocument, 
  BookingDocument,
  UserDocument
} from '../types'; // Import all document types

dotenv.config();

// MongoDB Connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_shuttle';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedDatabase();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Shuttle.deleteMany({});
    await Booking.deleteMany({});
    await Notification.deleteMany({});
    
    console.log('Previous data deleted');
    
    // Create users
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Create admin
    const admin = await Admin.create({
      name: 'Admin User',
      email: 'admin@university.edu',
      password: hashedPassword,
      phoneNumber: '+1234567896',
      role: 'admin'
    }) as unknown as AdminDocument;
    
    // Create students
    const student1 = await Student.create({
      name: 'John Doe',
      email: 'john.doe@university.edu',
      password: hashedPassword,
      phoneNumber: '+1234567890',
      role: 'student',
      studentId: 'STU001'
    }) as unknown as StudentDocument;
    
    const student2 = await Student.create({
      name: 'Jane Smith',
      email: 'jane.smith@university.edu',
      password: hashedPassword,
      phoneNumber: '+1234567891',
      role: 'student',
      studentId: 'STU002'
    }) as unknown as StudentDocument;
    
    const student3 = await Student.create({
      name: 'Alice Johnson',
      email: 'alice.johnson@university.edu',
      password: hashedPassword,
      phoneNumber: '+1234567892',
      role: 'student',
      studentId: 'STU003'
    }) as unknown as StudentDocument;
    
    // Create drivers
    const driver1 = await Driver.create({
      name: 'Michael Brown',
      email: 'michael.brown@university.edu',
      password: hashedPassword,
      phoneNumber: '+1234567893',
      role: 'driver',
      licenseNumber: 'DL001',
      isApproved: true,
      isAvailable: true
    }) as unknown as DriverDocument;
    
    const driver2 = await Driver.create({
      name: 'Sarah Wilson',
      email: 'sarah.wilson@university.edu',
      password: hashedPassword,
      phoneNumber: '+1234567894',
      role: 'driver',
      licenseNumber: 'DL002',
      isApproved: true,
      isAvailable: false
    }) as unknown as DriverDocument;
    
    const driver3 = await Driver.create({
      name: 'David Taylor',
      email: 'david.taylor@university.edu',
      password: hashedPassword,
      phoneNumber: '+1234567895',
      role: 'driver',
      licenseNumber: 'DL003',
      isApproved: false,
      isAvailable: false
    }) as unknown as DriverDocument;
    
    // Create shuttles
    const shuttle1 = await Shuttle.create({
      name: 'Campus Express A',
      capacity: 20,
      availableSeats: 5,
      driverId: driver1.id,
      route: 'Main Campus - North Residence',
      isActive: true
    }) as unknown as ShuttleDocument;
    
    const shuttle2 = await Shuttle.create({
      name: 'Campus Express B',
      capacity: 15,
      availableSeats: 0,
      driverId: driver2.id,
      route: 'Main Campus - South Residence',
      isActive: true
    }) as unknown as ShuttleDocument;
    
    const shuttle3 = await Shuttle.create({
      name: 'Campus Express C',
      capacity: 25,
      availableSeats: 25,
      route: 'Main Campus - East Residence',
      isActive: false
    }) as unknown as ShuttleDocument;
    
    // Update drivers with shuttle IDs
    driver1.shuttleId = shuttle1.id; // Use .id instead of ._id
    await driver1.save();
    
    driver2.shuttleId = shuttle2.id; // Use .id instead of ._id
    await driver2.save();
    
    // Create bookings
    const booking1 = await Booking.create({
      shuttleId: shuttle1.id,
      studentId: student1.id,
      driverId: driver1.id,
      status: 'confirmed',
      bookingTime: new Date(),
      tripTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
      pickupLocation: 'Main Campus',
      dropoffLocation: 'North Residence',
      route: 'Main Campus - North Residence'
    }) as unknown as BookingDocument;
    
    const booking2 = await Booking.create({
      shuttleId: shuttle1.id,
      studentId: student2.id,
      driverId: driver1.id,
      status: 'pending',
      bookingTime: new Date(),
      tripTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      pickupLocation: 'North Residence',
      dropoffLocation: 'Main Campus',
      route: 'North Residence - Main Campus'
    }) as unknown as BookingDocument;
    
    const booking3 = await Booking.create({
      shuttleId: shuttle2.id,
      studentId: student3.id,
      driverId: driver2.id,
      status: 'completed',
      bookingTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      tripTime: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
      pickupLocation: 'Main Campus',
      dropoffLocation: 'South Residence',
      route: 'Main Campus - South Residence',
      rating: 4,
      feedback: 'Good service, driver was punctual.'
    }) as unknown as BookingDocument;
    
    const booking4 = await Booking.create({
      shuttleId: shuttle2.id,
      studentId: student1.id,
      driverId: driver2.id,
      status: 'canceled',
      bookingTime: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      tripTime: new Date(Date.now() - 46 * 60 * 60 * 1000), // 46 hours ago
      pickupLocation: 'South Residence',
      dropoffLocation: 'Main Campus',
      route: 'South Residence - Main Campus'
    }) as unknown as BookingDocument;
    
    // Create notifications
    const notification1 = await Notification.create({
      userId: student1.id,
      title: 'Booking Confirmed',
      message: `Your booking for Campus Express A has been confirmed.`,
      isRead: false,
      type: 'booking',
      relatedItemId: booking1.id,
      refModel: 'Booking'
    });
    
    const notification2 = await Notification.create({
      userId: driver1.id,
      title: 'New Trip Assigned',
      message: `You have been assigned a new trip.`,
      isRead: true,
      type: 'trip',
      relatedItemId: booking1.id,
      refModel: 'Booking'
    });
    
    const notification3 = await Notification.create({
      userId: student2.id,
      title: 'Booking Pending',
      message: `Your booking is pending confirmation. We will notify you once confirmed.`,
      isRead: false,
      type: 'booking',
      relatedItemId: booking2.id,
      refModel: 'Booking'
    });
    
    const notification4 = await Notification.create({
      userId: student1.id,
      title: 'Booking Canceled',
      message: `Your booking has been canceled.`,
      isRead: true,
      type: 'booking',
      relatedItemId: booking4.id,
      refModel: 'Booking'
    });
    
    const notification5 = await Notification.create({
      userId: admin.id,
      title: 'Driver Approval Request',
      message: `David Taylor has requested approval to become a driver.`,
      isRead: false,
      type: 'system',
      relatedItemId: driver3.id,
      refModel: 'User'
    });
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};