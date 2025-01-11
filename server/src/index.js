import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import logger from './config/logger.js';

// Load environment-specific .env file
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : 
                process.env.NODE_ENV === 'production' ? '.env' : 
                '.env.development';

logger.info('Loading environment configuration', { 
  nodeEnv: process.env.NODE_ENV,
  envFile,
  port: process.env.PORT || 3001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
});

// Required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NODE_ENV',
  'CORS_ORIGIN'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  logger.error('Missing required environment variables:', { missingEnvVars });
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3001;

logger.info('Server configuration:', { 
  port,
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

logger.info('ENV VARS', { ...process.env });

// Initialize Prisma client with connection handling
let prisma;
try {
  prisma = new PrismaClient();
  await prisma.$connect();
  logger.info('Database connected successfully');
} catch (error) {
  logger.error('Database connection failed:', { error: error.message, stack: error.stack });
  prisma = null;
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: prisma ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// User Management Context - only enabled if database is connected
app.get('/api/users/profile', async (req, res, next) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database service unavailable' });
  }
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    logger.error('Database query failed:', { error: error.message, stack: error.stack });
    next(error);
  }
});

// Test crash endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/test-crash', () => {
    logger.error('Simulating a crash');
    process.exit(1);
  });
}

// JSON parsing error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.error('JSON parsing error:', { error: err.message, stack: err.stack });
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next(err);
});

// Generic error handling middleware
app.use((err, req, res, _next) => {
  logger.error('Server error:', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler - must be after all routes
app.use((req, res) => {
  logger.warn('Route not found:', { path: req.path, method: req.method });
  res.status(404).json({ error: 'Not found' });
});

let isShuttingDown = false;

// Start server
const server = app.listen(port, () => {
  logger.info('Server running', { port });
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  try {
    logger.error('Uncaught Exception:', { 
      error: error.message,
      stack: error.stack,
      type: error.name
    });

    if (!isShuttingDown) {
      isShuttingDown = true;
      // Attempt graceful shutdown
      await gracefulShutdown('uncaught exception');
    }
  } catch (shutdownError) {
    logger.error('Error during shutdown:', { error: shutdownError.message });
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', {
    reason: reason instanceof Error ? reason.stack : reason,
    promise: promise.toString()
  });
});

// Graceful shutdown helper
async function gracefulShutdown(signal) {
  logger.info('Initiating graceful shutdown...', { signal });
  
  try {
    // Close server first (stop accepting new connections)
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          logger.error('Error closing server:', { error: err.message });
          reject(err);
        } else {
          logger.info('Server closed successfully');
          resolve();
        }
      });
    });

    // Disconnect database
    if (prisma) {
      await prisma.$disconnect();
      logger.info('Database disconnected successfully');
    }

    // Exit process
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', { error: error.message });
    process.exit(1);
  }
}

// Handle graceful shutdown signals
const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2']; // SIGUSR2 is used by nodemon
signals.forEach(signal => {
  process.on(signal, async () => {
    if (!isShuttingDown) {
      isShuttingDown = true;
      await gracefulShutdown(signal);
    }
  });
});

// Handle nodemon crashes
process.on('exit', (code) => {
  if (code !== 0) {
    logger.error('Process exit with code:', { 
      code,
      timestamp: new Date().toISOString()
    });
  }
  // Note: This is a synchronous event, async operations won't work here
  logger.info('Process exiting', { code });
}); 