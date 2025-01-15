import express from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';
import authenticateJWT from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get messages for a channel
router.get('/channels/:channelId/messages', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { limit = 50, before } = req.query;

    const messages = await prisma.message.findMany({
      where: {
        channelId,
        ...(before && {
          createdAt: {
            lt: new Date(before)
          }
        })
      },
      take: parseInt(limit),
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        mentions: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.json(messages);
  } catch (error) {
    logger.error('Error fetching messages:', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create a new message
router.post('/channels/:channelId/messages', authenticateJWT, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { content } = req.body;
    const userId = req.user.id; // Get user ID from the authenticated request

    // Extract mentions from content (usernames starting with @)
    const mentionedUsernames = content.match(/@(\w+)/g)?.map(mention => mention.slice(1)) || [];
    
    // Find mentioned users
    const mentionedUsers = mentionedUsernames.length > 0 
      ? await prisma.user.findMany({
          where: {
            username: {
              in: mentionedUsernames
            }
          }
        })
      : [];

    const message = await prisma.message.create({
      data: {
        content,
        sender: {
          connect: { id: userId }
        },
        channel: {
          connect: { id: channelId }
        },
        mentions: {
          connect: mentionedUsers.map(user => ({ id: user.id }))
        }
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true
          }
        },
        mentions: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    logger.info('Message created successfully', { 
      messageId: message.id,
      userId,
      channelId,
      mentionCount: mentionedUsers.length
    });

    res.status(201).json(message);
  } catch (error) {
    logger.error('Error creating message:', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Update a message
router.put('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    // Extract mentions from content
    const mentionedUsernames = content.match(/@(\w+)/g)?.map(mention => mention.slice(1)) || [];
    
    // Find mentioned users
    const mentionedUsers = mentionedUsernames.length > 0 
      ? await prisma.user.findMany({
          where: {
            username: {
              in: mentionedUsernames
            }
          }
        })
      : [];

    const message = await prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        mentions: {
          set: mentionedUsers.map(user => ({ id: user.id }))
        }
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true
          }
        },
        mentions: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.json(message);
  } catch (error) {
    logger.error('Error updating message:', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Delete a message
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;

    await prisma.message.delete({
      where: { id: messageId }
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting message:', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Add a reaction to a message
router.post('/messages/:messageId/reactions', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji, userId } = req.body;

    const reaction = await prisma.reaction.create({
      data: {
        emoji,
        user: {
          connect: { id: userId }
        },
        message: {
          connect: { id: messageId }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.status(201).json(reaction);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Reaction already exists' });
    } else {
      logger.error('Error adding reaction:', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Failed to add reaction' });
    }
  }
});

// Remove a reaction from a message
router.delete('/messages/:messageId/reactions/:reactionId', async (req, res) => {
  try {
    const { reactionId } = req.params;

    await prisma.reaction.delete({
      where: { id: reactionId }
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Error removing reaction:', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
});

export default router; 