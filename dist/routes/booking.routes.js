"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookingController = __importStar(require("../controllers/booking.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Protect all routes
router.use(auth_middleware_1.protect);
// IMPORTANT: Define specific routes BEFORE generic parameter routes
// Routes for students
router.post('/', (0, auth_middleware_1.restrictTo)('student'), bookingController.createBooking);
// Fix: Split the optional parameter route into two separate routes
router.get('/student', // Route for current user's bookings
(0, auth_middleware_1.restrictTo)('student', 'admin'), bookingController.getBookingsByStudent);
router.get('/student/:studentId', // Route for specific student's bookings
(0, auth_middleware_1.restrictTo)('student', 'admin'), bookingController.getBookingsByStudent);
router.patch('/:id/rate', (0, auth_middleware_1.restrictTo)('student'), bookingController.addBookingRating);
// Routes for drivers
// Fix: Split the optional parameter route into two separate routes
router.get('/driver', // Route for current user's bookings
(0, auth_middleware_1.restrictTo)('driver', 'admin'), bookingController.getBookingsByDriver);
router.get('/driver/:driverId', // Route for specific driver's bookings
(0, auth_middleware_1.restrictTo)('driver', 'admin'), bookingController.getBookingsByDriver);
// Routes for admins - this needs to come before /:id
router.get('/', (0, auth_middleware_1.restrictTo)('admin'), bookingController.getAllBookings);
// Generic routes should come LAST
router.get('/:id', bookingController.getBookingById);
router.patch('/:id/status', (0, auth_middleware_1.restrictTo)('driver', 'admin'), bookingController.updateBookingStatus);
exports.default = router;
