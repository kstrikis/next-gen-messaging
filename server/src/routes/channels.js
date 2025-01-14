import express from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all channels
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const channels = await prisma.channel.findMany({
      where: {
        OR: [
          { isPrivate: false }, // Public channels
          {
            isPrivate: true,
            members: {
              some: {
                id: req.user.id
              }
            }
          } // Private channels where user is a member
        ]
      },
      orderBy: {
        name: 'asc'
      }
    });

    logger.info('Channels fetched successfully', { userId: req.user.id, channelCount: channels.length });
    res.json({ channels });
  } catch (error) {
    logger.error('Error fetching channels:', { error: error.message, userId: req.user.id });
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// Get a specific channel
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const channel = await prisma.channel.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    if (!channel) {
      logger.warn('Channel not found:', { channelId: req.params.id });
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (channel.isPrivate && !channel.members.some(member => member.id === req.user.id)) {
      logger.warn('Unauthorized channel access attempt:', { 
        userId: req.user.id, 
        channelId: req.params.id 
      });
      return res.status(403).json({ error: 'Not authorized to view this channel' });
    }

    logger.info('Channel fetched successfully', { 
      userId: req.user.id, 
      channelId: channel.id 
    });
    res.json({ channel });
  } catch (error) {
    logger.error('Error fetching channel:', { 
      error: error.message, 
      userId: req.user.id,
      channelId: req.params.id 
    });
    res.status(500).json({ error: 'Failed to fetch channel' });
  }
});

export default router; 