// scripts/checkDatabase.ts
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

console.log('Connecting to MongoDB:', MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    checkDatabase();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

const checkDatabase = async () => {
  try {
    console.log('\n=== DATABASE CHECK ===');
    
    // Check all users in the users collection
    console.log('\n1. All users in database:');
    const allUsers = await User.find({}).select('+password') as UserDocument[];
    console.log('Total users found:', allUsers.length);
    
    if (allUsers.length === 0) {
      console.log('❌ NO USERS FOUND! Your database might be empty.');
      console.log('Try running your seed script first.');
    }
    
    allUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        passwordPrefix: user.password ? user.password.substring(0, 10) + '...' : 'none'
      });
    });
    
    // Check specifically for admin
    console.log('\n2. Looking for admin user:');
    const adminUser = await User.findOne({ 
      email: 'admin@university.edu' 
    }).select('+password') as UserDocument | null;
    
    if (adminUser) {
      console.log('✅ Admin found in User collection:', {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        hasPassword: !!adminUser.password,
        passwordHash: adminUser.password
      });
      
      // Test password
      console.log('\n3. Testing admin password:');
      try {
        const testPasswords = ['password', 'admin123', 'admin'];
        
        for (const testPass of testPasswords) {
          const isMatch = await bcrypt.compare(testPass, adminUser.password);
          console.log(`Password "${testPass}" matches:`, isMatch ? '✅ YES' : '❌ NO');
          
          if (isMatch) {
            console.log(`🎉 FOUND WORKING PASSWORD: "${testPass}"`);
            break;
          }
        }
        
        // Test using the model method
        const isMatchModel = await adminUser.comparePassword('password');
        console.log('Model comparePassword method works:', isMatchModel ? '✅ YES' : '❌ NO');
      } catch (err) {
        console.error('❌ Error testing password:', err);
      }
    } else {
      console.log('❌ Admin NOT found in User collection');
    }
    
    // Check using Admin discriminator
    console.log('\n4. Using Admin discriminator:');
    const adminDiscriminator = await Admin.findOne({ 
      email: 'admin@university.edu' 
    }).select('+password') as AdminDocument | null;
    
    if (adminDiscriminator) {
      console.log('✅ Admin found using discriminator:', {
        id: adminDiscriminator._id,
        name: adminDiscriminator.name,
        email: adminDiscriminator.email,
        role: adminDiscriminator.role,
        adminLevel: adminDiscriminator.adminLevel,
        department: adminDiscriminator.department
      });
    } else {
      console.log('❌ Admin NOT found using discriminator');
    }
    
    // Check what collections exist
    console.log('\n5. Collections in database:');
    const collections = await mongoose.connection.db!.listCollections().toArray();
    collections.forEach(collection => {
      console.log('📁 ' + collection.name);
    });
    
    // Check for any user with admin role
    console.log('\n6. All users with admin role:');
    const adminUsers = await User.find({ role: 'admin' }).select('+password') as UserDocument[];
    console.log('Admin users found:', adminUsers.length);
    adminUsers.forEach((admin, index) => {
      console.log(`Admin ${index + 1}:`, {
        email: admin.email,
        name: admin.name,
        role: admin.role
      });
    });
    
    console.log('\n=== CHECK COMPLETE ===');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};