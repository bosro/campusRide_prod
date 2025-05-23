import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.model';
import Student from '../models/student.model';
import Driver from '../models/driver.model';
import Admin from '../models/admin.model';
import { UserRole, DriverDocument, AdminDocument, UserDocument } from '../types';
import { sendPasswordResetEmail } from '../services/email.service';
import { userCache } from '../config/redis';

// Generate JWT token
const signToken = (id: string) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-for-development';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d'; // Default to 1 day
  
  return jwt.sign({ id }, secret, {
    expiresIn: expiresIn as any
  });
};

// Create and send token with response
const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = signToken(user._id.toString());
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phoneNumber, role, studentId, licenseNumber } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        status: 'fail',
        message: 'Email already in use'
      });
      return;
    }
    
    let newUser;
    
    // Create user based on role
    switch (role as UserRole) {
      case 'student':
        newUser = await Student.create({
          name,
          email,
          password,
          phoneNumber,
          role,
          studentId
        });
        break;
      case 'driver':
        newUser = await Driver.create({
          name,
          email,
          password,
          phoneNumber,
          role,
          licenseNumber,
          isApproved: false,
          isAvailable: false
        });
        break;
      case 'admin':
        newUser = await Admin.create({
          name,
          email,
          password,
          phoneNumber,
          role,
          adminLevel: 1,
          department: 'Transportation',
          canApproveDrivers: true,
          canManageShuttles: true,
          canViewAllReports: true,
          lastLoginDate: new Date()
        });
        break;
      default:
        res.status(400).json({
          status: 'fail',
          message: 'Invalid role'
        });
        return;
    }
    
    createSendToken(newUser, 201, res);
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password exist
    if (!email || !password) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
      return;
    }
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password') as UserDocument | null;
    
    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
      return;
    }
    
    // If driver is not approved
    if (user.role === 'driver') {
      const driver = await Driver.findById(user._id) as DriverDocument | null;
      if (driver && !driver.isApproved) {
        res.status(401).json({
          status: 'fail',
          message: 'Your driver account is pending approval'
        });
        return;
      }
      
      // Update driver's last login date
      if (driver) {
        driver.lastLoginDate = new Date();
        await driver.save({ validateBeforeSave: false });
      }
    }
    
    // If admin, update last login date
    if (user.role === 'admin') {
      const admin = await Admin.findById(user._id) as AdminDocument | null;
      if (admin) {
        admin.lastLoginDate = new Date();
        await admin.save({ validateBeforeSave: false });
      }
    }
    
    // Add user to cache
    await userCache.set(user._id.toString(), {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    createSendToken(user, 200, res);
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get current user profile
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // User is already available in req.user from the middleware
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Request password reset
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email }) as UserDocument | null;
    if (!user) {
      res.status(404).json({
        status: 'fail',
        message: 'There is no user with this email address'
      });
      return;
    }
    
    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set token expiry (10 minutes)
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    // Save the user with reset token
    await user.save({ validateBeforeSave: false });
    
    try {
      // Send email with reset token
      await sendPasswordResetEmail(user.email, user.name, resetToken);
      
      res.status(200).json({
        status: 'success',
        message: 'Reset token sent to email'
      });
    } catch (err) {
      // Reset token fields if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      throw new Error('Error sending email. Please try again later.');
    }
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, password } = req.body;
    
    // Hash the provided reset code
    const hashedToken = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');
    
    // Find user with the token and check if token is still valid
    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+password') as UserDocument | null;
    
    if (!user) {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid or expired reset token'
      });
      return;
    }
    
    // Set new password and remove reset token fields
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Save user
    await user.save();
    
    // Clear user from cache
    await userCache.invalidate(user._id.toString());
    
    // Log user in by sending JWT
    createSendToken(user, 200, res);
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};