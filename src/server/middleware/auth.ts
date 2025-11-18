import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

interface AuthRequest extends Request {
  user?: any;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Verify JWT token and attach user to request
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Get user from database to ensure they still exist and are active
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    if (!user.emailVerified) {
      res.status(401).json({
        success: false,
        error: 'Email not verified'
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    } else {
      console.error('Authentication middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
};

// Optional authentication - doesn't fail if no token, but attaches user if token exists
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
        const user = await User.findById(decoded.userId).select('-password');
        if (user && user.emailVerified) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on token errors
    next();
  }
};

// Check if user has specific roles (for future role-based access)
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (roles.length && !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

// Check if user can access specific resource (ownership or admin)
export const checkResourceOwnership = (resourceIdParam: string = 'id', resourceModel: any) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
        return;
      }

      // Check if user owns the resource or is admin
      const userId = req.user._id.toString();
      const resourceUserId = resource.user?.toString() || resource._id?.toString();

      if (userId !== resourceUserId && req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Access denied'
        });
        return;
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Resource ownership check error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
};

// Generate JWT token
export const generateToken = (userId: string, email: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    { userId, email },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
};

// Generate refresh token
export const generateRefreshToken = (userId: string): string => {
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  if (!jwtRefreshSecret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    { userId, type: 'refresh' },
    jwtRefreshSecret,
    { expiresIn: jwtRefreshExpiresIn }
  );
};

// Verify refresh token
export const verifyRefreshToken = (token: string): { userId: string } => {
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!jwtRefreshSecret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }

  const decoded = jwt.verify(token, jwtRefreshSecret) as { userId: string; type: string };

  if (decoded.type !== 'refresh') {
    throw new Error('Invalid refresh token');
  }

  return { userId: decoded.userId };
};

export default authenticateToken;