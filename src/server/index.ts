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

// Import external API routes
import aiChatRoutes from './routes/aiChat.js';
import appointmentRoutes from './routes/appointments.js';
import telemedicineRoutes from './routes/telemedicine.js';
import providerRoutes from './routes/providers.js';
import billingRoutes from './routes/billing.js';
import emergencyRoutes from './routes/emergency.js';
import pharmacyRoutes from './routes/pharmacy.js';

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
        diet: '/api/diet',
        'ai-chat': '/api/ai-chat',
        appointments: '/api/appointments',
        telemedicine: '/api/telemedicine',
        providers: '/api/providers',
        billing: '/api/billing',
        emergency: '/api/emergency',
        pharmacy: '/api/pharmacy'
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

// API routes with specific rate limiters
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/diet', dietRoutes);

// External API routes
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/telemedicine', telemedicineRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/pharmacy', pharmacyRoutes);

// Protected upload routes
app.use('/api/upload', uploadLimiter, (req, res) => {
  res.status(501).json({ success: false, error: 'Upload endpoint not implemented yet' });
});

// Protected report generation routes
app.use('/api/reports', reportLimiter, (req, res) => {
  res.status(501).json({ success: false, error: 'Report endpoint not implemented yet' });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Medical App API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      authentication: '/api/auth',
      users: '/api/users',
      medications: '/api/medications',
      healthMetrics: '/api/health',
      diet: '/api/diet',
      'ai-chat': '/api/ai-chat',
      appointments: '/api/appointments',
      telemedicine: '/api/telemedicine',
      providers: '/api/providers',
      billing: '/api/billing',
      emergency: '/api/emergency',
      pharmacy: '/api/pharmacy',
      documentation: '/docs'
    },
    documentation: 'https://api.medicalapp.com/docs'
  });
});

// 404 handler for undefined routes
app.use('*', notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Initialize services and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting Medical App Server...');

    // Initialize database
    console.log('📊 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');

    // Initialize PDF service
    console.log('📄 Initializing PDF service...');
    await PDFService.initialize();
    console.log('✅ PDF service initialized');

    // Initialize Socket.IO
    console.log('🔌 Initializing Socket.IO...');
    initializeSocket(server);
    console.log('✅ Socket.IO initialized');

    // Seed database in development or if explicitly requested
    if (process.env.NODE_ENV === 'development' || process.env.SEED_DATABASE === 'true') {
      console.log('🌱 Checking database seeding...');
      await DatabaseSeeder.initialize();
      const isSeeded = await DatabaseSeeder.checkIfSeeded();
      if (!isSeeded) {
        await DatabaseSeeder.seedAll();
      } else {
        console.log('📊 Database already seeded');
      }
    }

    // Start listening
    server.listen(PORT, () => {
      console.log('');
      console.log('🎉 Medical App Server Started Successfully!');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📖 API docs: http://localhost:${PORT}/api`);
      console.log('');
      console.log('Available endpoints:');
      console.log('  GET  /health              - Health check');
      console.log('  GET  /health/ready         - Readiness check');
      console.log('  GET  /health/live          - Liveness check');
      console.log('  GET  /api                  - API overview');
      console.log('  POST /api/auth/login       - User login');
      console.log('  POST /api/auth/register    - User registration');
      console.log('  GET  /api/medications      - Get medications');
      console.log('  GET  /api/health/metrics   - Get health metrics');
      console.log('  GET  /api/diet/plans       - Get diet plans');
      console.log('');
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🔄 ${signal} received, starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(async () => {
        console.log('✅ HTTP server closed');

        try {
          // Shutdown Socket.IO
          const socketController = getSocketController();
          if (socketController) {
            socketController.shutdown();
            console.log('✅ Socket.IO shutdown complete');
          }

          // Close PDF service
          await PDFService.cleanup();
          console.log('✅ PDF service cleanup complete');

          // Close database connection
          await sequelize.close();
          console.log('✅ Database connection closed');

          console.log('🎉 Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown due to timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;