import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

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

// List users route (for testing DB connection)
app.get('/api/users', async (req, res, next) => {
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server and database connection...');
  await server.close();
  await prisma.$disconnect();
  process.exit(0);
}); 