'use client';

import { MoreHorizontal, Smile, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function Message({ message }) {
  const [isHovered, setIsHovered] = useState(false);

  // This will be replaced with real data from API
  const mockMessage = {
    id: '1',
    content: 'Hello world! This is a test message.',
    timestamp: new Date(),
    user: {
      name: 'Kriss Strikis',
      avatar: null,
      isOnline: true,
    },
    reactions: [
      { emoji: '👍', count: 3, users: ['user1', 'user2', 'user3'] },
    ],
    ...message,
  };

  return (
    <div
      className="group relative flex gap-x-3 px-4 py-2 hover:bg-accent/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* User Avatar */}
      <div className="relative flex-none">
        <div className="relative h-9 w-9 rounded bg-primary/10">
          {/* Avatar image will go here */}
        </div>
        {mockMessage.user.isOnline && (
          <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
        )}
      </div>

      {/* Message Content */}
      <div className="min-w-0 flex-auto">
        {/* Message Header */}
        <div className="flex items-center gap-x-2">
          <p className="text-sm font-semibold">{mockMessage.user.name}</p>
          <p className="text-xs text-muted-foreground">
            {mockMessage.timestamp.toLocaleTimeString([], { 
              hour: 'numeric', 
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Message Text */}
        <p className="text-sm text-foreground">{mockMessage.content}</p>

        {/* Reactions */}
        {mockMessage.reactions?.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {mockMessage.reactions.map((reaction, index) => (
              <button
                key={index}
                className="inline-flex items-center gap-1 rounded-full bg-accent/50 px-2 py-0.5 text-xs hover:bg-accent"
              >
                <span>{reaction.emoji}</span>
                <span className="text-muted-foreground">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Message Actions */}
      {isHovered && (
        <div className="absolute right-4 top-2 flex items-center gap-x-2 rounded-md bg-background p-1 shadow-sm ring-1 ring-border">
          <button
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Add reaction"
          >
            <Smile className="h-4 w-4" />
          </button>
          <button
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Reply in thread"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <button
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="More actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
} 