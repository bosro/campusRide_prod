"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("../models/user.model"));
const student_model_1 = __importDefault(require("../models/student.model"));
const driver_model_1 = __importDefault(require("../models/driver.model"));
const admin_model_1 = __importDefault(require("../models/admin.model"));
const shuttle_model_1 = __importDefault(require("../models/shuttle.model"));
const booking_model_1 = __importDefault(require("../models/booking.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
dotenv_1.default.config();
// MongoDB Connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_shuttle';
// Connect to MongoDB
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB');
    seedDatabase();
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});
const seedDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Clear existing data
        yield user_model_1.default.deleteMany({});
        yield shuttle_model_1.default.deleteMany({});
        yield booking_model_1.default.deleteMany({});
        yield notification_model_1.default.deleteMany({});
        console.log('Previous data deleted');
        // Create users
        const hashedPassword = yield bcryptjs_1.default.hash('password', 10);
        // Create admin
        const admin = yield admin_model_1.default.create({
            name: 'Admin User',
            email: 'admin@university.edu',
            password: hashedPassword,
            phoneNumber: '+1234567896',
            role: 'admin'
        });
        // Create students
        const student1 = yield student_model_1.default.create({
            name: 'John Doe',
            email: 'john.doe@university.edu',
            password: hashedPassword,
            phoneNumber: '+1234567890',
            role: 'student',
            studentId: 'STU001'
        });
        const student2 = yield student_model_1.default.create({
            name: 'Jane Smith',
            email: 'jane.smith@university.edu',
            password: hashedPassword,
            phoneNumber: '+1234567891',
            role: 'student',
            studentId: 'STU002'
        });
        const student3 = yield student_model_1.default.create({
            name: 'Alice Johnson',
            email: 'alice.johnson@university.edu',
            password: hashedPassword,
            phoneNumber: '+1234567892',
            role: 'student',
            studentId: 'STU003'
        });
        // Create drivers
        const driver1 = yield driver_model_1.default.create({
            name: 'Michael Brown',
            email: 'michael.brown@university.edu',
            password: hashedPassword,
            phoneNumber: '+1234567893',
            role: 'driver',
            licenseNumber: 'DL001',
            isApproved: true,
            isAvailable: true
        });
        const driver2 = yield driver_model_1.default.create({
            name: 'Sarah Wilson',
            email: 'sarah.wilson@university.edu',
            password: hashedPassword,
            phoneNumber: '+1234567894',
            role: 'driver',
            licenseNumber: 'DL002',
            isApproved: true,
            isAvailable: false
        });
        const driver3 = yield driver_model_1.default.create({
            name: 'David Taylor',
            email: 'david.taylor@university.edu',
            password: hashedPassword,
            phoneNumber: '+1234567895',
            role: 'driver',
            licenseNumber: 'DL003',
            isApproved: false,
            isAvailable: false
        });
        // Create shuttles
        const shuttle1 = yield shuttle_model_1.default.create({
            name: 'Campus Express A',
            capacity: 20,
            availableSeats: 5,
            driverId: driver1.id,
            route: 'Main Campus - North Residence',
            isActive: true
        });
        const shuttle2 = yield shuttle_model_1.default.create({
            name: 'Campus Express B',
            capacity: 15,
            availableSeats: 0,
            driverId: driver2.id,
            route: 'Main Campus - South Residence',
            isActive: true
        });
        const shuttle3 = yield shuttle_model_1.default.create({
            name: 'Campus Express C',
            capacity: 25,
            availableSeats: 25,
            route: 'Main Campus - East Residence',
            isActive: false
        });
        // Update drivers with shuttle IDs
        driver1.shuttleId = shuttle1.id; // Use .id instead of ._id
        yield driver1.save();
        driver2.shuttleId = shuttle2.id; // Use .id instead of ._id
        yield driver2.save();
        // Create bookings
        const booking1 = yield booking_model_1.default.create({
            shuttleId: shuttle1.id,
            studentId: student1.id,
            driverId: driver1.id,
            status: 'confirmed',
            bookingTime: new Date(),
            tripTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
            pickupLocation: 'Main Campus',
            dropoffLocation: 'North Residence',
            route: 'Main Campus - North Residence'
        });
        const booking2 = yield booking_model_1.default.create({
            shuttleId: shuttle1.id,
            studentId: student2.id,
            driverId: driver1.id,
            status: 'pending',
            bookingTime: new Date(),
            tripTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
            pickupLocation: 'North Residence',
            dropoffLocation: 'Main Campus',
            route: 'North Residence - Main Campus'
        });
        const booking3 = yield booking_model_1.default.create({
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
        });
        const booking4 = yield booking_model_1.default.create({
            shuttleId: shuttle2.id,
            studentId: student1.id,
            driverId: driver2.id,
            status: 'canceled',
            bookingTime: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
            tripTime: new Date(Date.now() - 46 * 60 * 60 * 1000), // 46 hours ago
            pickupLocation: 'South Residence',
            dropoffLocation: 'Main Campus',
            route: 'South Residence - Main Campus'
        });
        // Create notifications
        const notification1 = yield notification_model_1.default.create({
            userId: student1.id,
            title: 'Booking Confirmed',
            message: `Your booking for Campus Express A has been confirmed.`,
            isRead: false,
            type: 'booking',
            relatedItemId: booking1.id,
            refModel: 'Booking'
        });
        const notification2 = yield notification_model_1.default.create({
            userId: driver1.id,
            title: 'New Trip Assigned',
            message: `You have been assigned a new trip.`,
            isRead: true,
            type: 'trip',
            relatedItemId: booking1.id,
            refModel: 'Booking'
        });
        const notification3 = yield notification_model_1.default.create({
            userId: student2.id,
            title: 'Booking Pending',
            message: `Your booking is pending confirmation. We will notify you once confirmed.`,
            isRead: false,
            type: 'booking',
            relatedItemId: booking2.id,
            refModel: 'Booking'
        });
        const notification4 = yield notification_model_1.default.create({
            userId: student1.id,
            title: 'Booking Canceled',
            message: `Your booking has been canceled.`,
            isRead: true,
            type: 'booking',
            relatedItemId: booking4.id,
            refModel: 'Booking'
        });
        const notification5 = yield notification_model_1.default.create({
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
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
});
