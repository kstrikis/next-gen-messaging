'use client';

import PropTypes from 'prop-types';
import { useEffect } from 'react';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import logger from '@/lib/logger';

export default function MessagesContainer({ type = 'channel', channelId }) {
  useEffect(() => {
    logger.info('🚀 MessagesContainer mounted', { type, channelId });
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