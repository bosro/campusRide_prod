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
exports.addBookingRating = exports.updateBookingStatus = exports.createBooking = exports.getBookingById = exports.getBookingsByDriver = exports.getBookingsByStudent = exports.getAllBookings = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const booking_model_1 = __importDefault(require("../models/booking.model"));
const shuttle_model_1 = __importDefault(require("../models/shuttle.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const notification_service_1 = require("../services/notification.service");
const mongoose_2 = require("../utils/mongoose");
// Get all bookings
const getAllBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield booking_model_1.default.find()
            .populate('shuttle', 'name')
            .populate('student', 'name')
            .populate('driver', 'name');
        res.status(200).json({
            status: 'success',
            results: bookings.length,
            data: {
                bookings
            }
        });
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});
exports.getAllBookings = getAllBookings;
// Get bookings by student
const getBookingsByStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fix: Don't use req.params.studentId directly without validation
        // Use req.user._id as the default value
        const studentId = req.params.studentId || req.user._id;
        // Important: Validate that studentId is a valid ObjectId before querying
        if (!mongoose_1.default.Types.ObjectId.isValid(studentId)) {
            res.status(400).json({
                status: 'fail',
                message: 'Invalid student ID'
            });
            return; // Return without a value - just to exit the function
        }
        const bookings = yield booking_model_1.default.find({ studentId })
            .populate('shuttle', 'name')
            .populate('driver', 'name')
            .sort('-createdAt');
        // Format the response
        const formattedBookings = bookings.map(booking => {
            const { _id, status, bookingTime, tripTime, pickupLocation, dropoffLocation, route, rating, feedback, shuttle, driver } = booking;
            return {
                id: _id,
                shuttleId: shuttle === null || shuttle === void 0 ? void 0 : shuttle._id,
                shuttleName: shuttle === null || shuttle === void 0 ? void 0 : shuttle.name,
                studentId,
                studentName: req.user.name,
                driverId: driver === null || driver === void 0 ? void 0 : driver._id,
                driverName: driver === null || driver === void 0 ? void 0 : driver.name,
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
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});
exports.getBookingsByStudent = getBookingsByStudent;
// Get bookings by driver
const getBookingsByDriver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const driverId = req.params.driverId || req.user._id;
        // Validate that driverId is a valid ObjectId before querying
        if (!mongoose_1.default.Types.ObjectId.isValid(driverId)) {
            res.status(400).json({
                status: 'fail',
                message: 'Invalid driver ID'
            });
            return; // Return without a value - just to exit the function
        }
        const bookings = yield booking_model_1.default.find({ driverId })
            .populate('shuttle', 'name')
            .populate('student', 'name')
            .sort('-createdAt');
        // Format the response
        const formattedBookings = bookings.map(booking => {
            const { _id, status, bookingTime, tripTime, pickupLocation, dropoffLocation, route, rating, feedback, shuttle, student } = booking;
            return {
                id: _id,
                shuttleId: shuttle === null || shuttle === void 0 ? void 0 : shuttle._id,
                shuttleName: shuttle === null || shuttle === void 0 ? void 0 : shuttle.name,
                studentId: student === null || student === void 0 ? void 0 : student._id,
                studentName: student === null || student === void 0 ? void 0 : student.name,
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
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});
exports.getBookingsByDriver = getBookingsByDriver;
// Get booking by ID
const getBookingById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate booking ID
        if (!(0, mongoose_2.validateObjectId)(req.params.id, res, 'booking')) {
            return;
        }
        const booking = yield booking_model_1.default.findById(req.params.id)
            .populate('shuttle', 'name')
            .populate('student', 'name')
            .populate('driver', 'name');
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
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});
exports.getBookingById = getBookingById;
// Create a new booking
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { shuttleId, tripTime, pickupLocation, dropoffLocation, route } = req.body;
        const studentId = req.user._id;
        // Validate shuttle ID
        if (!(0, mongoose_2.validateObjectId)(shuttleId, res, 'shuttle')) {
            return;
        }
        // Check if shuttle exists and has available seats
        const shuttle = yield shuttle_model_1.default.findById(shuttleId);
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
        const newBooking = yield booking_model_1.default.create({
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
        yield shuttle.save({ session });
        // Create notifications
        // For student
        yield (0, notification_service_1.createNotification)({
            userId: studentId,
            title: 'Booking Submitted',
            message: `Your booking request for ${shuttle.name} has been submitted and is pending confirmation.`,
            type: 'booking',
            relatedItemId: newBooking.id,
            refModel: 'Booking'
        });
        // For driver
        yield (0, notification_service_1.createNotification)({
            userId: shuttle.driverId,
            title: 'New Booking Request',
            message: `You have a new booking request for your shuttle.`,
            type: 'trip',
            relatedItemId: newBooking.id,
            refModel: 'Booking'
        });
        yield session.commitTransaction();
        // Format the response
        const student = yield user_model_1.default.findById(studentId);
        const driver = yield user_model_1.default.findById(shuttle.driverId);
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
    }
    catch (error) {
        yield session.abortTransaction();
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
    finally {
        session.endSession();
    }
});
exports.createBooking = createBooking;
// Update booking status
const updateBookingStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // Validate booking ID
        if (!(0, mongoose_2.validateObjectId)(req.params.id, res, 'booking')) {
            return;
        }
        const { status } = req.body;
        // Validate status
        if (!['pending', 'confirmed', 'canceled', 'completed'].includes(status)) {
            res.status(400).json({
                status: 'fail',
                message: 'Invalid status'
            });
            return;
        }
        const booking = yield booking_model_1.default.findById(req.params.id);
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
        yield booking.save({ session });
        // If canceled, return the seat to the shuttle
        if (status === 'canceled' && oldStatus !== 'canceled') {
            const shuttle = yield shuttle_model_1.default.findById(booking.shuttleId);
            if (shuttle) {
                shuttle.availableSeats++;
                yield shuttle.save({ session });
            }
        }
        // Create notification based on status
        let notificationTitle = '';
        let notificationMessage = '';
        const shuttle = yield shuttle_model_1.default.findById(booking.shuttleId);
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
            yield (0, notification_service_1.createNotification)({
                userId: booking.studentId,
                title: notificationTitle,
                message: notificationMessage,
                type: 'booking',
                relatedItemId: booking.id,
                refModel: 'Booking'
            });
        }
        yield session.commitTransaction();
        // Format the response
        const student = yield user_model_1.default.findById(booking.studentId);
        const driver = yield user_model_1.default.findById(booking.driverId);
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
    }
    catch (error) {
        yield session.abortTransaction();
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
    finally {
        session.endSession();
    }
});
exports.updateBookingStatus = updateBookingStatus;
// Add rating and feedback to a booking
const addBookingRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate booking ID
        if (!(0, mongoose_2.validateObjectId)(req.params.id, res, 'booking')) {
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
        const booking = yield booking_model_1.default.findById(req.params.id);
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
        yield booking.save();
        // Create notification for driver
        yield (0, notification_service_1.createNotification)({
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
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});
exports.addBookingRating = addBookingRating;
