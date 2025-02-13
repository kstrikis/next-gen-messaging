// Import modules
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import logger from './config/logger.js';
import authRoutes from './routes/auth.routes.js';
import channelsRoutes from './routes/channels.js';
import messagesRoutes from './routes/messages.js';
import { setupWebSocketServer } from './socket/index.js';

logger.info('📊 Server configuration:', { 
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT ? process.env.SERVER_PORT : 3001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL
});

// Required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NODE_ENV',
  'CORS_ORIGIN',
  'JWT_SECRET',
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH0_AUDIENCE'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  logger.error('Missing required environment variables:', { missingEnvVars });
  process.exit(1);
}

const app = express();
const port = process.env.PORT ? process.env.SERVER_PORT : 3001;

logger.info('Server configuration:', { 
  port,
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
});

// CORS configuration
const corsOptions = {
  origin: [
    process.env.CORS_ORIGIN,
    `https://${process.env.AUTH0_DOMAIN}`
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

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

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request:', { 
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length ? JSON.stringify(req.query) : undefined,
    body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'authorization': req.headers.authorization ? 'Bearer [redacted]' : undefined
    }
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelsRoutes);
app.use('/api', messagesRoutes); // Mount messages routes at /api

// Health check route
app.get('/api/health', async (req, res) => {
  const databaseUrl = process.env.DATABASE_URL || 'unknown';
  // Parse database name from URL, handling both standard and query param formats
  const dbName = databaseUrl.match(/\/([^/?]+)(?:\?|$)/)?.[1] || 'unknown';
  
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error) {
    logger.error('Database health check failed:', { error: error.message });
  }
  
  res.json({
    status: 'ok',
    database: {
      status: dbStatus,
      name: dbName,
      environment: process.env.NODE_ENV
    }
  });
});

// User Management Context - only enabled if database is connected
app.get('/api/users/profile', async (req, res) => {
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
    return res.status(503).json({ error: 'Database query failed' });
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

// Set up WebSocket server
export const io = setupWebSocketServer(server);
logger.info('WebSocket server initialized');

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
    // Force immediate shutdown on Ctrl+C
    if (signal === 'SIGINT') {
      logger.info('Received Ctrl+C, forcing immediate shutdown');
      if (io) {
        io.close();
        logger.info('WebSocket server closed');
      }
      if (prisma) {
        await prisma.$disconnect();
        logger.info('Database disconnected');
      }
      process.exit(0);
    }

    // For other signals, attempt graceful shutdown
    if (io) {
      io.close();
      logger.info('WebSocket server closed');
    }

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

export default app; 