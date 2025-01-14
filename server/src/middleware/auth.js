import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.warn('No authorization header present');
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    logger.warn('No token present in authorization header');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('JWT verification failed:', { error: error.message });
    return res.status(401).json({ error: 'Invalid token' });
  }
} 