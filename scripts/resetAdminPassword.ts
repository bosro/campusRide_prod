// scripts/resetAdminPassword.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Import your models
import User from '../src/models/user.model';
import Admin from '../src/models/admin.model';
import { UserDocument, AdminDocument } from '../src/types';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_shuttle';

console.log('Connecting to MongoDB...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    resetAdminPassword();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

const resetAdminPassword = async () => {
  try {
    console.log('\n=== RESETTING ADMIN PASSWORD ===');
    
    // Find the admin user
    const admin = await User.findOne({ 
      email: 'admin@university.edu',
      role: 'admin'
    }) as UserDocument | null;
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }
    
    console.log('✅ Found admin:', admin.name, admin.email);
    
    // Set new password
    const newPassword = 'admin123'; // Use this as the new password
    console.log('Setting new password to:', newPassword);
    
    // Hash the new password manually (same way as in the model)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log('New password hash:', hashedPassword);
    
    // Update the admin's password directly
    admin.password = hashedPassword;
    
    // Save without running pre-save hooks (to avoid double hashing)
    await User.updateOne(
      { _id: admin._id },
      { $set: { password: hashedPassword } }
    );
    
    console.log('✅ Password updated successfully!');
    
    // Test the new password
    console.log('\n=== TESTING NEW PASSWORD ===');
    
    // Fetch the updated admin
    const updatedAdmin = await User.findById(admin._id).select('+password') as UserDocument;
    
    // Test with bcrypt directly
    const directTest = await bcrypt.compare(newPassword, updatedAdmin.password);
    console.log('Direct bcrypt test:', directTest ? '✅ SUCCESS' : '❌ FAILED');
    
    // Test with model method
    const modelTest = await updatedAdmin.comparePassword(newPassword);
    console.log('Model method test:', modelTest ? '✅ SUCCESS' : '❌ FAILED');
    
    if (directTest && modelTest) {
      console.log('\n🎉 SUCCESS! You can now login with:');
      console.log('Email: admin@university.edu');
      console.log('Password: admin123');
    } else {
      console.log('\n❌ Something went wrong with password reset');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  }
};