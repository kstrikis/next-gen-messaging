'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Message from './Message';
import logger from '@/lib/logger';

function DateDivider({ date }) {
  return (
    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center px-4" aria-hidden="true">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-2 text-xs text-muted-foreground">
          {date.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
}

DateDivider.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
};

export default function MessageList({ type = 'channel', channelId }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        if (!channelId) {
          throw new Error('No channel ID provided');
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Transform messages for display
        const transformedMessages = response.data.map(message => ({
          id: message.id,
          content: message.content,
          timestamp: new Date(message.createdAt),
          user: {
            name: message.sender.username,
            avatar: null, // TODO: Add avatar support
            isOnline: true, // TODO: Add online status support
          },
          reactions: message.reactions?.map(reaction => ({
            emoji: reaction.emoji,
            count: 1,
            users: [reaction.user.username],
          })),
        }));

        setMessages(transformedMessages);
        logger.info('📥 Messages fetched:', { 
          channelId,
          count: transformedMessages.length,
        });
      } catch (error) {
        logger.error('Failed to fetch messages:', error.response?.data?.error || error.message);
        setError(error.response?.data?.error || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [channelId, type]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading messages...</p>
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

  // Group messages by date
  const messagesByDate = messages.reduce((groups, message) => {
    const date = message.timestamp.toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse">
      {/* Current Messages */}
      <div className="space-y-4">
        {Object.entries(messagesByDate).map(([date, dateMessages]) => (
          <div key={date}>
            <DateDivider date={new Date(date)} />
            <div className="space-y-1">
              {dateMessages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* New Message Indicator - TODO: Implement with WebSocket */}
      {/* <div className="sticky top-0 z-10 mx-4 mb-4">
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
            New Messages
          </div>
        </div>
      </div> */}
    </div>
  );
}

MessageList.propTypes = {
  type: PropTypes.oneOf(['channel', 'dm']),
  channelId: PropTypes.string,
};

MessageList.defaultProps = {
  type: 'channel',
  channelId: undefined,
}; 