import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

// Basic security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:5173"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CORS configuration
export const corsOptions = cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://localhost:5173",
      "https://localhost:5174"
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
});

// Rate limiting configurations
export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // Default: 15 minutes
    max: options.max || 100, // Default: limit each IP to 100 requests
    message: {
      error: 'Too many requests',
      message: options.message || 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((options.windowMs || 900000) / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: options.message || 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil((options.windowMs || 900000) / 1000)
      });
    }
  });
};

// Specific rate limiters for different endpoints
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});

export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: 'Too many file uploads, please try again later.'
});

export const reportLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 report generations per hour
  message: 'Too many report generation requests, please try again later.'
});

// IP whitelist middleware
export const ipWhitelist = (whitelist: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress ||
                    req.socket.remoteAddress ||
                    (req.connection as any)?.socket?.remoteAddress;

    if (!clientIP) {
      return res.status(403).json({
        success: false,
        error: 'Unable to determine client IP'
      });
    }

    // Skip IP whitelist in development or if no whitelist provided
    if (process.env.NODE_ENV === 'development' || whitelist.length === 0) {
      return next();
    }

    if (whitelist.includes(clientIP)) {
      return next();
    }

    res.status(403).json({
      success: false,
      error: 'Access denied from this IP address'
    });
  };
};

// Request size limiter
export const requestSizeLimiter = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.get('content-length');

    if (contentLength) {
      const sizeInBytes = parseInt(contentLength);
      const maxSizeInBytes = parseSize(maxSize);

      if (sizeInBytes > maxSizeInBytes) {
        return res.status(413).json({
          success: false,
          error: 'Request entity too large',
          message: `Maximum request size is ${maxSize}`
        });
      }
    }

    next();
  };
};

// Prevent parameter pollution
export const preventParameterPollution = (req: Request, res: Response, next: NextFunction) => {
  // Remove duplicate query parameters
  const sanitizedQuery: any = {};

  Object.keys(req.query).forEach(key => {
    // Only keep the first value of each parameter
    if (Array.isArray(req.query[key])) {
      sanitizedQuery[key] = (req.query[key] as string[])[0];
    } else {
      sanitizedQuery[key] = req.query[key];
    }
  });

  req.query = sanitizedQuery;
  next();
};

// Sanitize input middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: any): any => {
    if (typeof str !== 'string') return str;

    // Remove potentially dangerous characters
    return str
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) return obj;

    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'string') {
          sanitized[key] = sanitizeString(obj[key]);
        } else if (Array.isArray(obj[key])) {
          sanitized[key] = obj[key].map(item =>
            typeof item === 'string' ? sanitizeString(item) : sanitizeObject(item)
          );
        } else if (typeof obj[key] === 'object') {
          sanitized[key] = sanitizeObject(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
    }
    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Validate user agent
export const validateUserAgent = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent');

  if (!userAgent) {
    return res.status(400).json({
      success: false,
      error: 'User-Agent header is required'
    });
  }

  // Check for suspicious user agents
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));

  if (isSuspicious && process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Access denied: suspicious user agent'
    });
  }

  next();
};

// Health check endpoint protection
export const protectHealthCheck = (req: Request, res: Response, next: NextFunction) => {
  // Only allow health checks from localhost or specific IP ranges
  const clientIP = req.ip || req.connection.remoteAddress;
  const allowedIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

  if (process.env.NODE_ENV === 'production' && clientIP && !allowedIPs.includes(clientIP)) {
    return res.status(403).json({
      success: false,
      error: 'Health check access denied'
    });
  }

  next();
};

// API key validation for sensitive endpoints
export const validateAPIKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.get('X-API-Key');
  const validAPIKey = process.env.API_KEY;

  if (!validAPIKey) {
    return next(); // Skip validation if no API key is configured
  }

  if (!apiKey || apiKey !== validAPIKey) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or missing API key'
    });
  }

  next();
};

// Prevent HTTP parameter pollution attacks
export const preventHTTPParameterPollution = (req: Request, res: Response, next: NextFunction) => {
  // Use express query parser with custom settings
  req.query = req.query as any;
  next();
};

// Add security headers manually
export const addCustomSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Remove server information
  res.removeHeader('Server');
  res.removeHeader('X-Powered-By');

  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Cache control for API endpoints
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }

  next();
};

// Check for common attack patterns
export const detectCommonAttacks = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /exec\s*\(/gi,
    /union\s+select/gi,
    /drop\s+table/gi,
    /insert\s+into/gi,
    /delete\s+from/gi,
    /update\s+.*\s+set/gi
  ];

  const checkString = (str: string): boolean => {
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };

  // Check request body
  if (req.body && typeof req.body === 'object') {
    const bodyStr = JSON.stringify(req.body);
    if (checkString(bodyStr)) {
      return res.status(400).json({
        success: false,
        error: 'Suspicious content detected in request body'
      });
    }
  }

  // Check query parameters
  if (req.query && typeof req.query === 'object') {
    const queryStr = JSON.stringify(req.query);
    if (checkString(queryStr)) {
      return res.status(400).json({
        success: false,
        error: 'Suspicious content detected in query parameters'
      });
    }
  }

  // Check URL parameters
  if (req.params && typeof req.params === 'object') {
    const paramsStr = JSON.stringify(req.params);
    if (checkString(paramsStr)) {
      return res.status(400).json({
        success: false,
        error: 'Suspicious content detected in URL parameters'
      });
    }
  }

  next();
};

// Helper function to parse size strings (like "10mb") to bytes
function parseSize(sizeStr: string): number {
  const units: { [key: string]: number } = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };

  const match = sizeStr.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([a-z]+)?$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';

  return Math.floor(value * (units[unit] || 1));
}

// Export combined security middleware
export const securityMiddleware = [
  securityHeaders,
  corsOptions,
  detectCommonAttacks,
  sanitizeInput,
  preventParameterPollution,
  preventHTTPParameterPollution,
  addCustomSecurityHeaders,
  validateUserAgent,
  generalLimiter
];