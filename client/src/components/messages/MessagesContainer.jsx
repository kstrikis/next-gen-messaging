'use client';

import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import axios from 'axios';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import logger from '@/lib/logger';

export default function MessagesContainer({ type = 'channel', channelId }) {
  const [user, setUser] = useState(null);
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    logger.info('🚀 MessagesContainer mounted', { type, channelId });

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user info from token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch user info
        const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data.user);

        // Fetch channel info if in channel mode
        if (type === 'channel' && channelId) {
          const channelResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setChannel(channelResponse.data.channel);
        }
      } catch (err) {
        logger.error('Failed to fetch data:', err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      logger.info('👋 MessagesContainer unmounting', { type, channelId });
    };
  }, [type, channelId]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const handleSendMessage = (message) => {
    // This will be replaced with actual API call
    logger.info('📨 Message received by container:', { 
      message, 
      type, 
      channelId: channel?.name || channelId, 
      timestamp: new Date().toISOString() 
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Channel Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div>
          {type === 'channel' && channel ? (
            <div>
              <h1 className="text-lg font-semibold">#{channel.name}</h1>
              {channel.description && (
                <p className="text-sm text-muted-foreground">{channel.description}</p>
              )}
            </div>
          ) : (
            <h1 className="text-lg font-semibold">Direct Messages</h1>
          )}
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
        <MessageComposer 
          onSend={handleSendMessage} 
          placeholder={`Message ${type === 'dm' ? 'user' : channel ? `#${channel.name}` : 'channel'}`} 
        />
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