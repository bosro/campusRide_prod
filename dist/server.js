"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const socket_1 = require("./config/socket");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// MongoDB Connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_shuttle';
console.log('Mongo URI:', process.env.MONGODB_URI);
// Connect to MongoDB
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB');
    // Create HTTP server
    const server = http_1.default.createServer(app_1.default);
    // Initialize Socket.io
    const io = (0, socket_1.initializeSocket)(server);
    // Define server port
    const PORT = process.env.PORT || 5000;
    // Start server
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
    });
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Close server & exit process
    process.exit(1);
});
// import mongoose from 'mongoose';
// import app from './app';
// // MongoDB Connection URL
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_shuttle';
// // Connect to MongoDB
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     console.log('Connected to MongoDB');
//     // Define server port
//     const PORT = process.env.PORT || 5000;
//     // Start Express server
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error('MongoDB connection error:', error);
//     process.exit(1);
//   });
// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err: any) => {
//   console.error('Unhandled Rejection:', err);
//   // Close server & exit process
//   process.exit(1);
// });
