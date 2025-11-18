import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Import database configuration
import { sequelize } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import medicationRoutes from './routes/medicationRoutes.js';
import healthRoutes from './routes/health.js';
import dietRoutes from './routes/diet.js';

// Import middleware
import {
  securityMiddleware,
  authLimiter,
  uploadLimiter,
  reportLimiter,
  protectHealthCheck
} from './middleware/security.js';
import {
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
  setupProcessErrorHandlers
} from './middleware/errorHandler.js';

// Import Socket.IO controller
import { initializeSocket, getSocketController } from './controllers/socketController.js';

// Import services
import PDFService from './services/pdfService.js';
import DatabaseSeeder from './seeders/databaseSeeder.js';

// Load environment variables
dotenv.config();

// Setup process error handlers
setupProcessErrorHandlers();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8000;

// Request ID middleware (should be first)
app.use(requestIdMiddleware);

// Security middleware
app.use(securityMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint (protected in production)
app.get('/health', protectHealthCheck, async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();

    const socketController = getSocketController();
    const dbSeeder = DatabaseSeeder;

    const healthStatus = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'connected',
        socketio: socketController ? 'running' : 'stopped',
        pdfService: 'ready'
      },
      metrics: {
        connectedUsers: socketController?.getConnectedUsersCount() || 0,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      },
      endpoints: {
        api: '/api',
        auth: '/api/auth',
        medications: '/api/medications',
        health: '/api/health',
        diet: '/api/diet'
      }
    };

    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Additional health check endpoints
app.get('/health/ready', protectHealthCheck, async (req, res) => {
  try {
    // Check all critical services
    await sequelize.authenticate();

    res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        server: 'ready'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      error: 'Service not ready'
    });
  }
});

app.get('/health/live', (req, res) => {
  // Basic liveness check - just return OK if server is running
  res.status(200).json({
    status: 'LIVE',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/diet', dietRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize Socket.IO
initializeSocketIO(io);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start listening
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;