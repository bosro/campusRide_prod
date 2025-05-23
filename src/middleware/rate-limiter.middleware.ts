import { Request, Response, NextFunction } from 'express';
import { apiLimiter } from '../config/redis';

// Rate limiting middleware
export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use IP address as key if user is not authenticated
    const userId = req.user?.id || req.ip;
    
    await apiLimiter.consume(userId);
    next();
  } catch (error) {
    res.status(429).json({
      status: 'error',
      message: 'Too many requests. Please try again later.'
    });
  }
};