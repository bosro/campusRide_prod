import mongoose from 'mongoose';

/**
 * Checks if a value is a valid MongoDB ObjectId
 * @param id - The value to check
 * @returns boolean indicating if the value is a valid ObjectId
 */
export const isValidObjectId = (id: any): boolean => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validates that an ID is a valid MongoDB ObjectId and returns a standardized error response if not
 * @param id - The ID to validate
 * @param res - Express Response object
 * @param entityName - Name of the entity (e.g., 'User', 'Booking') for error message
 * @returns boolean indicating if validation passed
 */
export const validateObjectId = (id: any, res: any, entityName: string = 'item'): boolean => {
  if (!isValidObjectId(id)) {
    res.status(400).json({
      status: 'fail',
      message: `Invalid ${entityName} ID format`
    });
    return false;
  }
  return true;
};