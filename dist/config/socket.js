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
exports.emitShuttleLocationUpdate = exports.emitShuttleAvailabilityUpdate = exports.emitBookingStatusChange = exports.emitNotification = exports.initializeSocket = exports.io = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Initialize Socket.IO server
const initializeSocket = (server) => {
    var _a;
    exports.io = new socket_io_1.Server(server, {
        cors: {
            origin: ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(',')) || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    // Middleware to authenticate socket connections
    exports.io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.data.userId = decoded.id;
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    }));
    // Handle socket connections
    exports.io.on('connection', (socket) => {
        console.log(`User connected: ${socket.data.userId}`);
        // Join user-specific room for targeted messages
        socket.join(`user:${socket.data.userId}`);
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.data.userId}`);
        });
        // Join shuttle room if driver
        socket.on('join:shuttle', (shuttleId) => {
            socket.join(`shuttle:${shuttleId}`);
            console.log(`User ${socket.data.userId} joined shuttle room ${shuttleId}`);
        });
        socket.on('leave:shuttle', (shuttleId) => {
            socket.leave(`shuttle:${shuttleId}`);
            console.log(`User ${socket.data.userId} left shuttle room ${shuttleId}`);
        });
    });
    console.log('Socket.IO initialized');
    return exports.io;
};
exports.initializeSocket = initializeSocket;
// Functions to emit events
// Send a notification to a specific user
const emitNotification = (userId, notification) => {
    if (exports.io) {
        exports.io.to(`user:${userId}`).emit('notification', notification);
    }
};
exports.emitNotification = emitNotification;
// Broadcast a booking status change to relevant users
const emitBookingStatusChange = (bookingId, status, userId) => {
    if (exports.io) {
        exports.io.to(`user:${userId}`).emit('booking_status_change', { bookingId, status });
    }
};
exports.emitBookingStatusChange = emitBookingStatusChange;
// Update shuttle availability to all clients
const emitShuttleAvailabilityUpdate = (shuttleId, availableSeats) => {
    if (exports.io) {
        exports.io.emit('shuttle_availability', { shuttleId, availableSeats });
    }
};
exports.emitShuttleAvailabilityUpdate = emitShuttleAvailabilityUpdate;
// Send shuttle location update to all subscribed clients
const emitShuttleLocationUpdate = (shuttleId, location) => {
    if (exports.io) {
        exports.io.to(`shuttle:${shuttleId}`).emit('shuttle_location', location);
    }
};
exports.emitShuttleLocationUpdate = emitShuttleLocationUpdate;
