import { Request, Response } from 'express';
import User from '../models/user.model';
import Student from '../models/student.model';
import Driver from '../models/driver.model';
import Admin from '../models/admin.model';
import { UserRole, UserDocument, StudentDocument, DriverDocument, AdminDocument } from '../types';
import { validateObjectId } from '../utils/mongoose';

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find() as UserDocument[];
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get all students
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await Student.find() as StudentDocument[];
    
    res.status(200).json({
      status: 'success',
      results: students.length,
      data: {
        students
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get all drivers
export const getAllDrivers = async (req: Request, res: Response) => {
  try {
    const drivers = await Driver.find() as DriverDocument[];
    
    res.status(200).json({
      status: 'success',
      results: drivers.length,
      data: {
        drivers
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    // Use req.params.id if provided, otherwise use the authenticated user's ID
    const userId = req.params.id || req.user._id;
    
    // Validate user ID
    if (!validateObjectId(userId, res, 'user')) {
      return;
    }
    
    const user = await User.findById(userId) as UserDocument | null;
    
    if (!user) {
      res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Approve driver
export const approveDriver = async (req: Request, res: Response) => {
  try {
    // Validate driver ID
    if (!validateObjectId(req.params.id, res, 'driver')) {
      return;
    }
    
    const driver = await Driver.findById(req.params.id) as DriverDocument | null;
    
    if (!driver) {
      res.status(404).json({
        status: 'fail',
        message: 'Driver not found'
      });
      return;
    }
    
    // Update driver approval status
    driver.isApproved = true;
    await driver.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        driver
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    // Prevent password updates via this route
    if (req.body.password) {
      res.status(400).json({
        status: 'fail',
        message: 'This route is not for password updates. Please use /updatePassword'
      });
      return;
    }
    
    // Get fields to update
    const fieldsToUpdate = {
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      profilePicture: req.body.profilePicture
    };
    
    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key as keyof typeof fieldsToUpdate] === undefined) {
        delete fieldsToUpdate[key as keyof typeof fieldsToUpdate];
      }
    });
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ) as UserDocument | null;
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};



// Update driver availability
export const updateDriverAvailability = async (req: Request, res: Response) => {
  try {
    const { isAvailable } = req.body;
    
    if (isAvailable === undefined) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide availability status'
      });
      return;
    }
    
    const driver = await Driver.findById(req.user._id) as DriverDocument | null;
    
    if (!driver) {
      res.status(404).json({
        status: 'fail',
        message: 'Driver not found'
      });
      return;
    }
    
    // Update driver availability
    driver.isAvailable = isAvailable;
    await driver.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        driver
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};