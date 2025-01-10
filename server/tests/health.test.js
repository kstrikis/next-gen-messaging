import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import logger from '../src/config/logger.js';

const prisma = new PrismaClient();
const app = express();
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
app.get('/api/users/profile', async (req, res) => {
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
    res.status(500).json({ error: 'Database error' });
  }
});

// Test crash endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/test-crash', (req, res, next) => {
    logger.error('Simulating a crash');
    const error = new Error('Simulating a crash');
    next(error);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal server error' });
  next(err);
});

describe('API Endpoints', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('User Management', () => {
    it('should list user profiles', async () => {
      const response = await request(app).get('/api/users/profile');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // Only run crash test in development
  if (process.env.NODE_ENV !== 'production') {
    describe('Error Handling', () => {
      it('should log crash events', async () => {
        const response = await request(app).get('/api/test-crash');
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Internal server error');
        
        // Give the logger time to write
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if the error was logged
        const fs = await import('fs');
        const path = await import('path');
        const logPath = path.join(process.cwd(), 'logs', 'error.log');
        const logContent = fs.readFileSync(logPath, 'utf8');
        expect(logContent).toContain('Simulating a crash');
      });
    });
  }
}); 