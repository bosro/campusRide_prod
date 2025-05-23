import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export let io: Server;

// Initialize Socket.IO server
export const initializeSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      socket.data.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });
  
  // Handle socket connections
  io.on('connection', (socket) => {
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
  return io;
};

// Functions to emit events

// Send a notification to a specific user
export const emitNotification = (userId: string, notification: any) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
};

// Broadcast a booking status change to relevant users
export const emitBookingStatusChange = (bookingId: string, status: string, userId: string) => {
  if (io) {
    io.to(`user:${userId}`).emit('booking_status_change', { bookingId, status });
  }
};

// Update shuttle availability to all clients
export const emitShuttleAvailabilityUpdate = (shuttleId: string, availableSeats: number) => {
  if (io) {
    io.emit('shuttle_availability', { shuttleId, availableSeats });
  }
};

// Send shuttle location update to all subscribed clients
export const emitShuttleLocationUpdate = (shuttleId: string, location: any) => {
  if (io) {
    io.to(`shuttle:${shuttleId}`).emit('shuttle_location', location);
  }
};