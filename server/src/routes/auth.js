import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import logger from '../config/logger.js';
import authenticateJWT from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to generate unique guest username
async function findUniqueGuestUsername(baseUsername = '') {
  let username = baseUsername;
  if (!username) {
    const randomNumber = Math.floor(Math.random() * 10000);
    username = `guest${randomNumber}`;
  }

  // Check if username exists
  const existingUser = await prisma.user.findUnique({
    where: { username }
  });

  if (!existingUser) {
    return username;
  }

  // If username exists, append a random number
  const randomSuffix = Math.floor(Math.random() * 10000);
  return findUniqueGuestUsername(`${username}${randomSuffix}`);
}

// Get current user
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        isGuest: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      logger.warn('User not found:', { userId: req.user.id });
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('User info fetched successfully', { userId: user.id });
    res.json({ user });
  } catch (error) {
    logger.error('Error fetching user:', { error: error.message, userId: req.user.id });
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
});

// Auth0 callback handler - handles both GET and POST
router.get('/auth0/callback', async (req, res) => {
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
    // Get user info from Auth0
    const userInfoResponse = await axios.get(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const auth0User = userInfoResponse.data;
    logger.info('Auth0 user info received:', { 
      sub: auth0User.sub,
      email: auth0User.email
    });

    // Create or update user
    const user = await prisma.user.upsert({
      where: { email: auth0User.email },
      update: {
        auth0Id: auth0User.sub,
        email: auth0User.email,
        username: auth0User.nickname || auth0User.email.split('@')[0],
        isGuest: false
      },
      create: {
        auth0Id: auth0User.sub,
        email: auth0User.email,
        username: auth0User.nickname || auth0User.email.split('@')[0],
        isGuest: false
      }
    });

    // Generate JWT
    const appToken = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        username: user.username,
        isGuest: user.isGuest
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info('Auth0 callback successful', { userId: user.id });
    res.json({ token: appToken, user });
  } catch (error) {
    logger.error('Auth0 callback error:', { error: error.message });
    res.status(500).json({ error: 'Failed to process Auth0 callback' });
  }
});

// Guest login
router.post('/guest', async (req, res) => {
  try {
    const { username } = req.body;
    
    // Use the guest name generation functions from auth controller
    const uniqueUsername = await findUniqueGuestUsername(username || '');
    
    // Find or create the general channel
    let generalChannel = await prisma.channel.findFirst({
      where: { name: 'general' }
    });

    if (!generalChannel) {
      // Create general channel if it doesn't exist
      logger.info('Creating general channel');
      generalChannel = await prisma.channel.create({
        data: {
          name: 'general',
          description: 'General discussion channel'
        }
      });
    }
    
    // Create guest user and add to general channel
    const user = await prisma.user.create({
      data: {
        username: uniqueUsername,
        email: `${uniqueUsername}@guest.local`,
        isGuest: true,
        channels: {
          connect: { id: generalChannel.id }
        }
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        username: user.username,
        isGuest: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info('Guest login successful', { 
      userId: user.id,
      channelId: generalChannel.id 
    });
    res.json({ token, user });
  } catch (error) {
    logger.error('Guest login error:', { error: error.message });
    res.status(500).json({ error: 'Failed to create guest account' });
  }
});

export default router; 