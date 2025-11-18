import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';
import jwt from 'jsonwebtoken';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  details?: any;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;
  details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error({
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    }
  });

  // Default error
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let details: any = error.details;

  // Mongoose/Sequelize validation errors
  if (err instanceof ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    details = {};

    if (err.errors) {
      details = Object.keys(err.errors).reduce((acc: any, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {});
    }
  }

  // JWT errors
  if (err instanceof jwt.JsonWebTokenError) {
    statusCode = 401;
    message = 'Invalid token';
    details = {
      type: 'jwt',
      message: 'The provided token is invalid'
    };
  }

  if (err instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    message = 'Token expired';
    details = {
      type: 'jwt',
      message: 'The provided token has expired',
      expiredAt: err.expiredAt
    };
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Duplicate entry';
    details = {
      field: (err as any).errors?.[0]?.path,
      value: (err as any).errors?.[0]?.value
    };
  }

  // Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference';
    details = {
      field: (err as any).index,
      table: (err as any).table
    };
  }

  // Database connection errors
  if (err.name === 'SequelizeConnectionError') {
    statusCode = 503;
    message = 'Database connection error';
    details = {
      type: 'database',
      message: 'Unable to connect to the database'
    };
  }

  // Syntax errors in JSON
  if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON';
    details = {
      type: 'syntax',
      message: 'The request body contains invalid JSON'
    };
  }

  // Node.js errors
  if (err.code === 'ENOENT') {
    statusCode = 404;
    message = 'File not found';
    details = {
      type: 'file_system',
      path: (err as any).path
    };
  }

  if (err.code === 'EACCES') {
    statusCode = 403;
    message = 'Permission denied';
    details = {
      type: 'file_system',
      path: (err as any).path
    };
  }

  // Production vs Development error response
  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorResponse: any = {
    success: false,
    error: message,
    statusCode,
    timestamp: new Date().toISOString()
  };

  // Include details in development or if explicitly provided
  if (isDevelopment || details) {
    errorResponse.details = details;
  }

  // Include stack trace in development
  if (isDevelopment && err.stack) {
    errorResponse.stack = err.stack;
  }

  // Add request ID if available
  if ((req as any).requestId) {
    errorResponse.requestId = (req as any).requestId;
  }

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

export const unhandledRejectionHandler = (reason: any, promise: Promise<any>): void => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to exit the process
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
};

export const uncaughtExceptionHandler = (error: Error): void => {
  console.error('Uncaught Exception:', error);
  // In production, you might want to exit the process
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
};

// Process error handlers
export const setupProcessErrorHandlers = (): void => {
  process.on('unhandledRejection', unhandledRejectionHandler);
  process.on('uncaughtException', uncaughtExceptionHandler);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    // Close database connections, servers, etc.
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    // Close database connections, servers, etc.
    process.exit(0);
  });
};

// Error logging service
export class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: any[] = [];
  private maxLogs = 1000;

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  log(error: any, req?: Request): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      request: req ? {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        params: req.params,
        query: req.query,
        ip: req.ip
      } : null,
      severity: this.getSeverity(error)
    };

    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console
    console.error('Error logged:', logEntry);

    // In production, you would send this to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      this.sendToExternalService(logEntry);
    }
  }

  private getSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    const statusCode = error.statusCode || error.status || 500;

    if (statusCode >= 500) return 'critical';
    if (statusCode >= 400) return 'high';
    if (statusCode >= 300) return 'medium';
    return 'low';
  }

  private sendToExternalService(logEntry: any): void {
    // Implement external logging service integration
    // Example: Sentry.captureException(logEntry.error);
    // Example: LogRocket.captureException(logEntry.error);
  }

  getLogs(severity?: string): any[] {
    if (severity) {
      return this.logs.filter(log => log.severity === severity);
    }
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }

  getErrorStats(): any {
    const stats = this.logs.reduce((acc, log) => {
      const errorName = log.error.name || 'Unknown';
      acc[errorName] = (acc[errorName] || 0) + 1;
      return acc;
    }, {});

    return {
      totalErrors: this.logs.length,
      errorTypes: stats,
      severityDistribution: this.logs.reduce((acc, log) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// Request ID middleware
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  (req as any).requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', (req as any).requestId);
  next();
};

// Error monitoring middleware
export const errorMonitoring = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  // Log the error
  ErrorLogger.getInstance().log(err, req);

  // Continue to the error handler
  next(err);
};

// Health check error handler
export const healthCheckErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  // For health check endpoints, we want to be more conservative
  if (req.path === '/health' || req.path === '/api/health') {
    res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // For other endpoints, use the standard error handler
  next(err);
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  CustomError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  setupProcessErrorHandlers,
  ErrorLogger,
  requestIdMiddleware,
  errorMonitoring,
  healthCheckErrorHandler
};