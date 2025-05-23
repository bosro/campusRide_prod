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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bookingSchema = new mongoose_1.Schema({
    shuttleId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Shuttle',
        required: [true, 'Shuttle ID is required']
    },
    studentId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Student ID is required']
    },
    driverId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Driver ID is required']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'canceled', 'completed'],
        default: 'pending'
    },
    bookingTime: {
        type: Date,
        default: Date.now
    },
    tripTime: {
        type: Date,
        required: [true, 'Trip time is required']
    },
    pickupLocation: {
        type: String,
        required: [true, 'Pickup location is required'],
        trim: true
    },
    dropoffLocation: {
        type: String,
        required: [true, 'Dropoff location is required'],
        trim: true
    },
    route: {
        type: String,
        required: [true, 'Route is required'],
        trim: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    feedback: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Virtual fields for related data
bookingSchema.virtual('student', {
    ref: 'User',
    localField: 'studentId',
    foreignField: '_id',
    justOne: true
});
bookingSchema.virtual('driver', {
    ref: 'User',
    localField: 'driverId',
    foreignField: '_id',
    justOne: true
});
bookingSchema.virtual('shuttle', {
    ref: 'Shuttle',
    localField: 'shuttleId',
    foreignField: '_id',
    justOne: true
});
const Booking = mongoose_1.default.model('Booking', bookingSchema);
exports.default = Booking;
