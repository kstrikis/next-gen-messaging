import rateLimit from 'express-rate-limit';
import logger from '../config/logger.js';

// Create a limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes by default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    res.status(429).json({ error: 'Too many requests from this IP, please try again later' });
  }
}); 