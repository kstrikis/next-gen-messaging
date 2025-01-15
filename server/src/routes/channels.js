import express from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';
import authenticateJWT from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all channels
router.get('/', authenticateJWT, async (req, res) => {
  try {
    logger.info('Fetching channels', { userId: req.user.id });

    const channels = await prisma.channel.findMany({
      where: {
        members: {
          some: {
            id: req.user.id
          }
        }
      }
    });

    logger.info('Channels fetched successfully', { 
      userId: req.user.id,
      channelCount: channels.length 
    });

    res.json({ channels });
  } catch (error) {
    logger.error('Failed to fetch channels:', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// Get channel by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    logger.info('Fetching channel', { 
      userId: req.user.id,
      channelId: req.params.id 
    });

    const channel = await prisma.channel.findUnique({
      where: { id: req.params.id },
      include: {
        members: true
      }
    });

    if (!channel) {
      logger.warn('Channel not found', { channelId: req.params.id });
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Check if user is a member of the channel
    const isMember = channel.members.some(member => member.id === req.user.id);
    if (!isMember) {
      logger.warn('Unauthorized channel access attempt', {
        userId: req.user.id,
        channelId: req.params.id
      });
      return res.status(403).json({ error: 'Not authorized to access this channel' });
    }

    logger.info('Channel fetched successfully', {
      userId: req.user.id,
      channelId: req.params.id
    });

    res.json({ channel });
  } catch (error) {
    logger.error('Failed to fetch channel:', error);
    res.status(500).json({ error: 'Failed to fetch channel' });
  }
});

// Get channel members
router.get('/:id/members', authenticateJWT, async (req, res) => {
  try {
    logger.info('Fetching channel members', { 
      userId: req.user.id,
      channelId: req.params.id 
    });

    const channel = await prisma.channel.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            lastSeen: true
          }
        }
      }
    });

    if (!channel) {
      logger.warn('Channel not found', { channelId: req.params.id });
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Check if user is a member of the channel
    const isMember = channel.members.some(member => member.id === req.user.id);
    if (!isMember) {
      logger.warn('Unauthorized channel members access attempt', {
        userId: req.user.id,
        channelId: req.params.id
      });
      return res.status(403).json({ error: 'Not authorized to access this channel' });
    }

    // Transform members data to include online status
    const members = channel.members.map(member => ({
      ...member,
      isOnline: member.lastSeen && (Date.now() - new Date(member.lastSeen).getTime() < 5 * 60 * 1000) // 5 minutes
    }));

    logger.info('Channel members fetched successfully', {
      userId: req.user.id,
      channelId: req.params.id,
      memberCount: members.length
    });

    res.json({ members });
  } catch (error) {
    logger.error('Failed to fetch channel members:', error);
    res.status(500).json({ error: 'Failed to fetch channel members' });
  }
});

export default router; 