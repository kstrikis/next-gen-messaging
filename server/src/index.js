import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import logger from './config/logger.js';

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// User Management Context
app.get('/api/users/profile', async (req, res, next) => {
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

// Error handling middleware
app.use((err, req, res) => {
  logger.error('Server error:', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
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
    await prisma.$disconnect();
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
  prisma.$disconnect();
}); 