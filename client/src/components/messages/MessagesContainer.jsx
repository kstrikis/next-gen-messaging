'use client';

import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import logger from '@/lib/logger';

export default function MessagesContainer() {
  const handleSendMessage = (message) => {
    // This will be replaced with actual API call
    logger.debug('Message send attempt:', message);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <MessageList />
      </div>

      {/* Composer */}
      <div className="border-t border-border">
        <MessageComposer onSend={handleSendMessage} />
      </div>
    </div>
  );
} 