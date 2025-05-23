import http from 'http';
import mongoose from 'mongoose';
import app from './app';
import { initializeSocket } from './config/socket';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_shuttle';
console.log('Mongo URI:', process.env.MONGODB_URI);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Initialize Socket.io
    const io = initializeSocket(server);
    
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
process.on('unhandledRejection', (err: any) => {
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