'use client';

import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import axios from 'axios';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import logger from '@/lib/logger';

export default function MessagesContainer({ type = 'channel', channelId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    logger.info('🚀 MessagesContainer mounted', { type, channelId });

    // Get user info from token
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setUser(response.data.user);
        })
        .catch(error => {
          logger.error('Failed to fetch user info:', error);
        });
    }

    return () => {
      logger.info('👋 MessagesContainer unmounting', { type, channelId });
    };
  }, [type, channelId]);

  const handleSendMessage = (message) => {
    // This will be replaced with actual API call
    logger.info('📨 Message received by container:', { message, type, channelId, timestamp: new Date().toISOString() });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Channel Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">#{channelId}</h1>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Logged in as</span>
            <span className="font-medium">{user.username}</span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <MessageList type={type} channelId={channelId} />
      </div>

      {/* Composer */}
      <div className="border-t border-border">
        <MessageComposer onSend={handleSendMessage} placeholder={`Message ${type === 'dm' ? 'user' : channelId ? `#${channelId}` : 'channel'}`} />
      </div>
    </div>
  );
}

MessagesContainer.propTypes = {
  type: PropTypes.oneOf(['channel', 'dm']),
  channelId: PropTypes.string,
};

MessagesContainer.defaultProps = {
  type: 'channel',
  channelId: undefined,
}; 