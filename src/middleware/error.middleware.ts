import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

// Interface for custom errors
interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

// Error handling middleware
export const errorHandler: ErrorRequestHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Determine if development or production environment
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Production error response
    if (err.isOperational) {
      // Operational, trusted error: send message to client
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // Programming or unknown error: don't leak error details
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
      });
    }
  } else {
    // Development error response: send all details
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
};