import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';

const prisma = new PrismaClient();

// Track online users and their socket connections
const onlineUsers = new Map(); // userId -> Set<socketId>
const userSockets = new Map(); // socketId -> userId

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-do-not-use-in-production';

export function setupWebSocketServer(httpServer) {
  logger.info('Setting up WebSocket server with config:', {
    cors: process.env.CORS_ORIGIN,
    path: process.env.SOCKET_PATH || '/socket.io'
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || true,
      methods: ['GET', 'POST', 'OPTIONS'],
      credentials: true,
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Accept',
        'Connection',
        'Upgrade',
        'Sec-WebSocket-Key',
        'Sec-WebSocket-Version',
        'Sec-WebSocket-Extensions'
      ],
      exposedHeaders: [
        'Content-Length', 
        'Content-Type',
        'Connection',
        'Upgrade',
        'Sec-WebSocket-Accept',
        'Sec-WebSocket-Protocol',
        'Sec-WebSocket-Version',
        'Sec-WebSocket-Extensions'
      ]
    },
    path: process.env.SOCKET_PATH || '/socket.io',
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 10000,
    pingInterval: 5000,
    connectTimeout: 45000,
    allowUpgrades: true,
    upgradeTimeout: 10000,
    maxHttpBufferSize: 1e8,
    allowRequest: (req, callback) => {
      // Log the request for debugging
      logger.debug('Socket.IO allowRequest:', {
        url: req.url,
        method: req.method,
        headers: req.headers,
        query: req._query
      });
      callback(null, true);
    }
  });

  // Log upgrade requests with more detail
  httpServer.on('upgrade', (request, socket, _head) => {
    logger.debug('WebSocket upgrade request:', {
      url: request.url,
      headers: {
        ...request.headers,
        connection: request.headers.connection,
        upgrade: request.headers.upgrade,
        'sec-websocket-key': request.headers['sec-websocket-key'],
        'sec-websocket-version': request.headers['sec-websocket-version'],
        'sec-websocket-extensions': request.headers['sec-websocket-extensions']
      },
      method: request.method,
      path: new URL(request.url, 'http://localhost').pathname,
      timestamp: new Date().toISOString()
    });

    // Set WebSocket upgrade headers
    socket.setNoDelay(true);
    socket.setKeepAlive(true, 0);
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      logger.debug('Socket authentication attempt:', {
        handshake: {
          auth: socket.handshake.auth,
          query: socket.handshake.query,
          headers: socket.handshake.headers
        }
      });

      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        logger.error('Socket auth: No token provided');
        return next(new Error('Authentication token required'));
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
        
        // Handle both userId and id formats
        let userId = decoded.userId || decoded.id;
        
        // Convert to string if it exists but isn't a string
        if (userId && typeof userId !== 'string') {
          userId = String(userId);
        }

        logger.info('Socket auth: Token decoded:', { 
          decodedToken: JSON.stringify(decoded, null, 2),
          tokenKeys: Object.keys(decoded),
          hasUserId: 'userId' in decoded,
          hasId: 'id' in decoded,
          userId,
          isGuest: decoded.isGuest
        });

        // Validate token structure
        if (!decoded || typeof decoded !== 'object') {
          logger.error('Socket auth: Invalid token structure', { 
            decoded,
            type: typeof decoded 
          });
          return next(new Error('Invalid token structure'));
        }

        if (!userId) {
          logger.error('Socket auth: Missing userId in token', { 
            decoded: JSON.stringify(decoded, null, 2),
            hasUserId: 'userId' in decoded,
            hasId: 'id' in decoded
          });
          return next(new Error('Invalid token structure'));
        }

        // Store user info in socket
        socket.userId = userId;
        socket.isGuest = !!decoded.isGuest; // Ensure boolean

        // Verify user exists
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            username: true,
            isGuest: true,
            lastSeen: true
          }
        });

        if (!user) {
          logger.error('Socket auth: User not found', { userId });
          return next(new Error('User not found'));
        }

        // Update user's last seen
        await prisma.user.update({
          where: { id: userId },
          data: { lastSeen: new Date() }
        });

        logger.info('Socket authenticated:', { 
          userId,
          socketId: socket.id,
          isGuest: socket.isGuest,
          username: user.username
        });
        next();
      } catch (jwtError) {
        logger.error('Socket auth: JWT verification failed', { 
          error: jwtError.message,
          token: token.substring(0, 10) + '...' // Log only first 10 chars for debugging
        });
        return next(new Error('Invalid authentication token'));
      }
    } catch (error) {
      logger.error('Socket authentication error:', { 
        error: error.message, 
        stack: error.stack,
        type: error.constructor.name
      });
      next(new Error('Authentication failed'));
    }
  });

  // Connection handling
  io.on('connection', async (socket) => {
    const userId = socket.userId;
    logger.info('User connected:', { 
      userId, 
      socketId: socket.id,
      transport: socket.conn.transport.name,
      protocol: socket.conn.protocol,
      headers: socket.handshake.headers
    });

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

  // Error handling
  io.on('error', (error) => {
    logger.error('Socket.IO server error:', {
      message: error.message,
      type: error.type,
      stack: error.stack
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