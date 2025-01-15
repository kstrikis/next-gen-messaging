import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

export default function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.warn('No authorization header provided');
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    logger.warn('No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    logger.warn('Invalid token:', { error: error.message });
    return res.status(401).json({ error: 'Invalid token' });
  }
} 