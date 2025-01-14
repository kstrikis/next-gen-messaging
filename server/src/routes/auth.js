import express from 'express';
import { login, register, guestLogin } from '../controllers/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/guest', guestLogin);
router.get('/me', authenticateToken, (req, res) => {
  // User info is already attached by authenticateToken middleware
  res.json({ user: req.user });
});

export default router; 