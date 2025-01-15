import { io } from 'socket.io-client';
import logger from './logger';

class SocketService {
  constructor() {
    this.socket = null;
    this.messageHandlers = new Set();
    this.typingHandlers = new Set();
    this.reactionHandlers = new Set();
    this.presenceHandlers = new Set();
    this.errorHandlers = new Set();
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 3;
    this.reconnectTimer = null;
  }

  connect() {
    if (this.socket?.connected) {
      logger.info('Socket already connected');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      const error = 'No token available for socket connection';
      logger.error(error);
      this.notifyError(error);
      return;
    }

    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      const error = `Failed to connect after ${this.maxConnectionAttempts} attempts`;
      logger.error(error);
      this.notifyError(error);
      return;
    }

    if (this.socket) {
      logger.info('Cleaning up existing socket connection');
      this.socket.removeAllListeners();
      this.socket.close();
      this.socket = null;
    }

    try {
      logger.info('Initializing socket connection with token:', token.substring(0, 10) + '...');
      
      this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
        path: process.env.NEXT_PUBLIC_SOCKET_PATH || '/socket.io',
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 10000,
        query: { token },
        autoConnect: false
      });

      this.setupListeners();
      
      // Add connection timeout
      const connectionTimeout = setTimeout(() => {
        if (!this.socket?.connected) {
          logger.error('Socket connection timeout');
          this.socket?.close();
          this.notifyError('Connection timeout');
          this.scheduleReconnect();
        }
      }, 5000);

      this.socket.on('connect', () => {
        clearTimeout(connectionTimeout);
      });

      this.socket.connect();
      logger.info('🔌 Socket connection initialized');
    } catch (error) {
      this.connectionAttempts++;
      logger.error('Failed to initialize socket:', error);
      this.notifyError('Failed to initialize socket connection');
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.reconnectTimer = setTimeout(() => {
      if (!this.socket?.connected && this.connectionAttempts < this.maxConnectionAttempts) {
        logger.info('Attempting to reconnect...');
        this.connect();
      }
    }, 2000);
  }

  setupListeners() {
    this.socket.on('connect', () => {
      logger.info('🟢 Socket connected');
      this.connectionAttempts = 0;
    });

    this.socket.on('connect_error', (error) => {
      this.connectionAttempts++;
      logger.error('Socket connection error:', error);
      
      if (error.message?.toLowerCase().includes('authentication') || 
          error.message?.toLowerCase().includes('token') ||
          error.message?.toLowerCase().includes('unauthorized')) {
        logger.error('Authentication error details:', {
          message: error.message,
          data: error.data,
          type: error.type
        });
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }

      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        this.notifyError(`Failed to connect after ${this.maxConnectionAttempts} attempts`);
        return;
      }

      this.notifyError(error.message || 'Connection error');
      this.scheduleReconnect();
    });

    this.socket.on('disconnect', (reason) => {
      logger.info('🔴 Socket disconnected:', reason);
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.scheduleReconnect();
      }
    });

    this.socket.on('error', (error) => {
      logger.error('Socket error:', error);
      if (typeof error === 'object' && error.message && (
        error.message.toLowerCase().includes('authentication') || 
        error.message.toLowerCase().includes('token') ||
        error.message.toLowerCase().includes('unauthorized')
      )) {
        logger.error('Authentication error details:', {
          message: error.message,
          data: error.data,
          type: error.type
        });
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      this.notifyError(typeof error === 'string' ? error : error.message || 'Unknown socket error');
      this.scheduleReconnect();
    });

    this.socket.on('message:received', (message) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('user:typing', (data) => {
      this.typingHandlers.forEach(handler => handler(data));
    });

    this.socket.on('message:reaction:added', (data) => {
      this.reactionHandlers.forEach(handler => handler({ type: 'add', ...data }));
    });

    this.socket.on('message:reaction:removed', (data) => {
      this.reactionHandlers.forEach(handler => handler({ type: 'remove', ...data }));
    });

    this.socket.on('user:online', (data) => {
      this.presenceHandlers.forEach(handler => handler({ type: 'online', ...data }));
    });

    this.socket.on('user:offline', (data) => {
      this.presenceHandlers.forEach(handler => handler({ type: 'offline', ...data }));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionAttempts = 0;
      logger.info('Socket disconnected');
    }
  }

  // Message events
  onMessage(handler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  sendMessage(channelId, content) {
    if (!this.socket?.connected) {
      const error = 'Socket not connected';
      logger.error(error);
      this.notifyError(error);
      return;
    }
    this.socket.emit('message:send', { channelId, content });
  }

  // Typing events
  onTyping(handler) {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  sendTyping(channelId, isTyping) {
    if (!this.socket?.connected) return;
    this.socket.emit('user:typing', { channelId, isTyping });
  }

  // Reaction events
  onReaction(handler) {
    this.reactionHandlers.add(handler);
    return () => this.reactionHandlers.delete(handler);
  }

  sendReaction(messageId, emoji, type) {
    if (!this.socket?.connected) return;
    this.socket.emit('message:reaction', { messageId, emoji, type });
  }

  // Presence events
  onPresence(handler) {
    this.presenceHandlers.add(handler);
    return () => this.presenceHandlers.delete(handler);
  }

  // Error events
  onError(handler) {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  notifyError(error) {
    this.errorHandlers.forEach(handler => handler(error));
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService; 