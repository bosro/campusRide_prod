import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { UserRole } from '../types';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Interface for JWT payload
interface JwtPayload {
  id: string;
}

// Protect routes - require authentication
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`🔐 AUTH: ${req.method} ${req.path}`);
    console.log('🔐 Headers:', {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent']?.substring(0, 50) + '...'
    });
    
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔐 Token extracted:', token ? `${token.substring(0, 10)}...` : 'null');
    } else {
      console.log('🔐 No Bearer token found in authorization header');
    }
    
    // Check if token exists
    if (!token) {
      console.log('🔐 ❌ No token provided');
      res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access'
      });
      return;
    }
    
    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('🔐 ❌ JWT_SECRET not configured!');
      res.status(500).json({
        status: 'error',
        message: 'Server configuration error'
      });
      return;
    }
    
    // Verify token
    console.log('🔐 Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    console.log('🔐 ✅ Token verified, user ID:', decoded.id);
    
    // Check if user still exists
    console.log('🔐 Looking up user in database...');
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      console.log('🔐 ❌ User not found in database for ID:', decoded.id);
      res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists'
      });
      return;
    }
    
    console.log('🔐 ✅ User found:', currentUser.email, 'Role:', currentUser.role);
    
    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error: any) {
    console.log('🔐 ❌ Auth error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      console.log('🔐 ❌ Invalid JWT token');
    } else if (error.name === 'TokenExpiredError') {
      console.log('🔐 ❌ JWT token expired');
    }
    
    res.status(401).json({
      status: 'fail',
      message: 'Not authorized to access this route'
    });
  }
};

// Restrict access to specific roles
export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log(`🔒 ROLE CHECK: User role: ${req.user?.role}, Required roles: ${roles.join(', ')}`);
    
    if (!roles.includes(req.user.role as UserRole)) {
      console.log('🔒 ❌ Role access denied');
      res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
      return;
    }
    
    console.log('🔒 ✅ Role access granted');
    next();
  };
};