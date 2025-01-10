import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import logger from './config/logger.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Initialize Prisma client with connection handling
let prisma;
try {
  prisma = new PrismaClient();
  await prisma.$connect();
  logger.info('Database connected successfully');
} catch (error) {
  logger.warn('Database connection failed:', { error: error.message });
  prisma = null;
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: prisma ? 'connected' : 'disconnected'
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
    logger.error('Database query failed:', { error: error.message });
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
    logger.error('JSON parsing error:', { error: err.message });
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next(err);
});

// Generic error handling middleware
app.use((err, req, res, _next) => {
  logger.error('Server error:', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const server = app.listen(port, () => {
  logger.info('Server running', { port });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { 
    error: error.message,
    stack: error.stack,
    type: error.name
  });
  // Give logger time to write
  setTimeout(() => process.exit(1), 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', {
    reason: reason instanceof Error ? reason.stack : reason,
    promise: promise.toString()
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing HTTP server and database connection...');
  server.close(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
    logger.info('Server closed');
    process.exit(0);
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
  if (prisma) {
    prisma.$disconnect();
  }
}); 