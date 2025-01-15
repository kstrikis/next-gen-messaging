'use client';

import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Message from './Message';
import logger from '@/lib/logger';
import socketService from '@/lib/socket';

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
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
        logger.info(`📥 Messages fetched: channelId: ${channelId}, count: ${transformedMessages.length}`);
        scrollToBottom();
      } catch (error) {
        logger.error('Failed to fetch messages:', error.response?.data?.error || error.message);
        setError(error.response?.data?.error || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to real-time message updates
    const messageHandler = (message) => {
      setMessages(prevMessages => {
        // Check if message already exists
        if (prevMessages.some(m => m.id === message.id)) {
          return prevMessages;
        }

        // Transform the message to match our format
        const newMessage = {
          id: message.id,
          content: message.content,
          timestamp: new Date(message.createdAt),
          user: {
            name: message.sender.username,
            avatar: null,
            isOnline: true,
          },
          reactions: message.reactions?.map(reaction => ({
            emoji: reaction.emoji,
            count: 1,
            users: [reaction.user.username],
          })) || [],
        };

        const updatedMessages = [...prevMessages, newMessage];
        logger.info('📨 New message received:', { messageId: message.id });
        setHasNewMessages(true);
        return updatedMessages;
      });
    };

    // Subscribe to reaction updates
    const reactionHandler = (data) => {
      setMessages(prevMessages => {
        return prevMessages.map(message => {
          if (message.id !== data.messageId) return message;

          let updatedReactions = [...(message.reactions || [])];

          if (data.type === 'add') {
            updatedReactions.push({
              emoji: data.reaction.emoji,
              count: 1,
              users: [data.reaction.user.username],
            });
          } else {
            updatedReactions = updatedReactions.filter(r => r.id !== data.reactionId);
          }

          return {
            ...message,
            reactions: updatedReactions,
          };
        });
      });
    };

    const unsubscribeMessage = socketService.onMessage(messageHandler);
    const unsubscribeReaction = socketService.onReaction(reactionHandler);

    return () => {
      unsubscribeMessage();
      unsubscribeReaction();
    };
  }, [channelId, type]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (hasNewMessages) {
      scrollToBottom();
      setHasNewMessages(false);
    }
  }, [hasNewMessages]);

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
      <div className="flex h-full items-center justify-center" data-testid="message-list-empty">
        <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse" data-testid="message-list-loaded">
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

      {/* Messages end marker for scrolling */}
      <div ref={messagesEndRef} />
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