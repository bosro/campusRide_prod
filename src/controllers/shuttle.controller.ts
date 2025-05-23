import { Request, Response } from 'express';
import Shuttle from '../models/shuttle.model';
import Driver from '../models/driver.model';
import { DriverDocument, ShuttleDocument } from '../types';
import { validateObjectId } from '../utils/mongoose';

interface PopulatedShuttleDocument extends Omit<ShuttleDocument, 'driverId'> {
  driver?: {
    _id: any;
    name: string;
  };
  driverId?: string;
}

// Get all shuttles
export const getAllShuttles = async (req: Request, res: Response) => {
  try {
    const shuttles = await Shuttle.find().populate({
      path: 'driver',
      select: 'name _id'
    }) as unknown as PopulatedShuttleDocument[];
    
    // Format the response
    const formattedShuttles = shuttles.map(shuttle => {
      const { _id, name, capacity, availableSeats, route, isActive, driver } = shuttle;
      return {
        id: _id,
        name,
        capacity,
        availableSeats,
        route,
        isActive,
        driverId: driver ? driver._id : undefined,
        driverName: driver ? driver.name : undefined
      };
    });
    
    res.status(200).json({
      status: 'success',
      results: shuttles.length,
      data: {
        shuttles: formattedShuttles
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get available shuttles
export const getAvailableShuttles = async (req: Request, res: Response) => {
  try {
    const shuttles = await Shuttle.find({ 
      isActive: true,
      availableSeats: { $gt: 0 } 
    }).populate({
      path: 'driver',
      select: 'name _id'
    }) as unknown as PopulatedShuttleDocument[];
    
    // Format the response
    const formattedShuttles = shuttles.map(shuttle => {
      const { _id, name, capacity, availableSeats, route, isActive, driver } = shuttle;
      return {
        id: _id,
        name,
        capacity,
        availableSeats,
        route,
        isActive,
        driverId: driver ? driver._id : undefined,
        driverName: driver ? driver.name : undefined
      };
    });
    
    res.status(200).json({
      status: 'success',
      results: shuttles.length,
      data: {
        shuttles: formattedShuttles
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get shuttle by ID
export const getShuttleById = async (req: Request, res: Response) => {
  try {
    // Validate shuttle ID
    if (!validateObjectId(req.params.id, res, 'shuttle')) {
      return;
    }
    
    const shuttle = await Shuttle.findById(req.params.id).populate({
      path: 'driver',
      select: 'name _id'
    }) as unknown as PopulatedShuttleDocument;
    
    if (!shuttle) {
      res.status(404).json({
        status: 'fail',
        message: 'Shuttle not found'
      });
      return;
    }
    
    // Format the response
    const { _id, name, capacity, availableSeats, route, isActive, driver } = shuttle;
    const formattedShuttle = {
      id: _id,
      name,
      capacity,
      availableSeats,
      route,
      isActive,
      driverId: driver ? driver._id : undefined,
      driverName: driver ? driver.name : undefined
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        shuttle: formattedShuttle
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Create a new shuttle
export const createShuttle = async (req: Request, res: Response) => {
  try {
    const { name, capacity, route, driverId } = req.body;
    
    // Validate driver ID if provided
    if (driverId && !validateObjectId(driverId, res, 'driver')) {
      return;
    }
    
    // Create shuttle first
    const newShuttle = await Shuttle.create({
      name,
      capacity,
      availableSeats: capacity, // Initially all seats are available
      driverId,
      route,
      isActive: true
    });
    
    // Validate driver exists and is approved (after creating shuttle to get the ID)
    if (driverId) {
      const driver = await Driver.findById(driverId) as DriverDocument | null;
      
      if (!driver) {
        res.status(404).json({
          status: 'fail',
          message: 'Driver not found'
        });
        return;
      }
      
      if (!driver.isApproved) {
        res.status(400).json({
          status: 'fail',
          message: 'Driver is not approved'
        });
        return;
      }
      
      // Update driver's shuttleId
      driver.shuttleId = newShuttle.id;
      await driver.save();
    }
    
    res.status(201).json({
      status: 'success',
      data: {
        shuttle: newShuttle
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update shuttle
export const updateShuttle = async (req: Request, res: Response) => {
  try {
    // Validate shuttle ID
    if (!validateObjectId(req.params.id, res, 'shuttle')) {
      return;
    }
    
    const { name, capacity, route, isActive, driverId } = req.body;
    
    // Validate driver ID if provided
    if (driverId && !validateObjectId(driverId, res, 'driver')) {
      return;
    }
    
    const shuttle = await Shuttle.findById(req.params.id) as ShuttleDocument | null;
    
    if (!shuttle) {
      res.status(404).json({
        status: 'fail',
        message: 'Shuttle not found'
      });
      return;
    }
    
    // Update driver if changed
    if (driverId && driverId !== shuttle.driverId?.toString()) {
      // Validate new driver exists and is approved
      const newDriver = await Driver.findById(driverId) as DriverDocument | null;
      
      if (!newDriver) {
        res.status(404).json({
          status: 'fail',
          message: 'Driver not found'
        });
        return;
      }
      
      if (!newDriver.isApproved) {
        res.status(400).json({
          status: 'fail',
          message: 'Driver is not approved'
        });
        return;
      }
      
      // Remove shuttle assignment from old driver if exists
      if (shuttle.driverId) {
        const oldDriver = await Driver.findById(shuttle.driverId) as DriverDocument | null;
        if (oldDriver && oldDriver.shuttleId?.toString() === shuttle.id) {
          oldDriver.shuttleId = undefined;
          await oldDriver.save();
        }
      }
      
      // Update new driver's shuttleId
      newDriver.shuttleId = shuttle.id;
      await newDriver.save();
    }
    
    // Update shuttle
    const updatedShuttle = await Shuttle.findByIdAndUpdate(
      req.params.id,
      { name, capacity, route, isActive, driverId },
      { new: true, runValidators: true }
    ).populate({
      path: 'driver',
      select: 'name _id'
    }) as unknown as PopulatedShuttleDocument;
    
    res.status(200).json({
      status: 'success',
      data: {
        shuttle: updatedShuttle
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update shuttle availability
export const updateShuttleAvailability = async (req: Request, res: Response) => {
  try {
    // Validate shuttle ID
    if (!validateObjectId(req.params.id, res, 'shuttle')) {
      return;
    }
    
    const { availableSeats } = req.body;
    
    if (availableSeats === undefined) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide available seats'
      });
      return;
    }
    
    const shuttle = await Shuttle.findById(req.params.id) as ShuttleDocument | null;
    
    if (!shuttle) {
      res.status(404).json({
        status: 'fail',
        message: 'Shuttle not found'
      });
      return;
    }
    
    // Validate available seats is not greater than capacity
    if (availableSeats > shuttle.capacity) {
      res.status(400).json({
        status: 'fail',
        message: 'Available seats cannot exceed capacity'
      });
      return;
    }
    
    // Update shuttle
    shuttle.availableSeats = availableSeats;
    await shuttle.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        shuttle
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Toggle shuttle active status
export const toggleShuttleStatus = async (req: Request, res: Response) => {
  try {
    // Validate shuttle ID
    if (!validateObjectId(req.params.id, res, 'shuttle')) {
      return;
    }
    
    const shuttle = await Shuttle.findById(req.params.id) as ShuttleDocument | null;
    
    if (!shuttle) {
      res.status(404).json({
        status: 'fail',
        message: 'Shuttle not found'
      });
      return;
    }
    
    // Toggle status
    shuttle.isActive = !shuttle.isActive;
    await shuttle.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        shuttle
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};