import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';

const prisma = new PrismaClient();

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        isGuest: true,
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const allowGuests = (req, res, next) => {
  if (!req.user.isGuest) {
    return res.status(403).json({ error: 'This route is for guest users only.' });
  }
  return next();
};

export const requireAuth = (req, res, next) => {
  if (req.user.isGuest) {
    return res.status(403).json({ error: 'This route requires full authentication.' });
  }
  return next();
}; 