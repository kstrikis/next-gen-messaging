import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';

const prisma = new PrismaClient();

// Track online users and their socket connections
const onlineUsers = new Map(); // userId -> Set<socketId>
const userSockets = new Map(); // socketId -> userId

export function setupWebSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: process.env.SOCKET_PATH || '/socket.io'
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.isGuest = decoded.isGuest;

      // Update user's last seen
      await prisma.user.update({
        where: { id: socket.userId },
        data: { lastSeen: new Date() }
      });

      next();
    } catch (error) {
      logger.error('Socket authentication error:', { error: error.message });
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    logger.info('User connected:', { userId, socketId: socket.id });

    // Add user to online tracking
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    userSockets.set(socket.id, userId);

    // Broadcast user online status
    socket.broadcast.emit('user:online', { userId });

    // Join user's channels
    const userChannels = await prisma.channel.findMany({
      where: {
        members: {
          some: {
            id: userId
          }
        }
      },
      select: { id: true }
    });
    
    userChannels.forEach(channel => {
      socket.join(`channel:${channel.id}`);
    });

    // Handle new message
    socket.on('message:send', async (data) => {
      try {
        const { channelId, content } = data;

        // Extract mentions
        const mentionedUsernames = content.match(/@(\w+)/g)?.map(mention => mention.slice(1)) || [];
        const mentionedUsers = mentionedUsernames.length > 0 
          ? await prisma.user.findMany({
              where: {
                username: {
                  in: mentionedUsernames
                }
              }
            })
          : [];

        // Create message
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

        // Broadcast to channel
        io.to(`channel:${channelId}`).emit('message:received', message);

        // Send notifications to mentioned users
        mentionedUsers.forEach(user => {
          const userSocketIds = onlineUsers.get(user.id);
          if (userSocketIds) {
            userSocketIds.forEach(socketId => {
              io.to(socketId).emit('user:mentioned', {
                messageId: message.id,
                channelId,
                mentionedBy: message.sender.username
              });
            });
          }
        });
      } catch (error) {
        logger.error('Error handling message:', { error: error.message });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('user:typing', (data) => {
      const { channelId, isTyping } = data;
      socket.to(`channel:${channelId}`).emit('user:typing', {
        userId,
        channelId,
        isTyping
      });
    });

    // Handle message reactions
    socket.on('message:reaction', async (data) => {
      try {
        const { messageId, emoji, type } = data; // type: 'add' or 'remove'

        if (type === 'add') {
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

          // Get the message's channel to broadcast to
          const message = await prisma.message.findUnique({
            where: { id: messageId },
            select: { channelId: true }
          });

          io.to(`channel:${message.channelId}`).emit('message:reaction:added', {
            messageId,
            reaction
          });
        } else {
          // Find and remove the reaction
          const reaction = await prisma.reaction.findFirst({
            where: {
              messageId,
              userId,
              emoji
            }
          });

          if (reaction) {
            await prisma.reaction.delete({
              where: { id: reaction.id }
            });

            const message = await prisma.message.findUnique({
              where: { id: messageId },
              select: { channelId: true }
            });

            io.to(`channel:${message.channelId}`).emit('message:reaction:removed', {
              messageId,
              reactionId: reaction.id
            });
          }
        }
      } catch (error) {
        logger.error('Error handling reaction:', { error: error.message });
        socket.emit('error', { message: 'Failed to process reaction' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info('User disconnected:', { userId, socketId: socket.id });

      // Remove socket from tracking
      const userSocketIds = onlineUsers.get(userId);
      if (userSocketIds) {
        userSocketIds.delete(socket.id);
        if (userSocketIds.size === 0) {
          onlineUsers.delete(userId);
          // Broadcast offline status only if user has no other active connections
          socket.broadcast.emit('user:offline', { userId });
        }
      }
      userSockets.delete(socket.id);

      // Update last seen
      prisma.user.update({
        where: { id: userId },
        data: { lastSeen: new Date() }
      }).catch(error => {
        logger.error('Error updating last seen:', { error: error.message });
      });
    });
  });

  return io;
}

// Helper to check if a user is online
export function isUserOnline(userId) {
  return onlineUsers.has(userId);
}

// Helper to get all online users
export function getOnlineUsers() {
  return Array.from(onlineUsers.keys());
}

// Helper to get user's socket IDs
export function getUserSockets(userId) {
  return onlineUsers.get(userId) || new Set();
} 