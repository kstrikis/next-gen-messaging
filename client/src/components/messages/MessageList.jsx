'use client';

import Message from './Message';

// Placeholder data - will be replaced with real data from API
const mockMessages = [
  {
    id: '1',
    content: 'Hey everyone! Welcome to the help channel.',
    timestamp: new Date(2024, 0, 10, 9, 30),
    user: {
      name: 'Aaron Gallant',
      avatar: null,
      isOnline: true,
    },
  },
  {
    id: '2',
    content: 'I have a question about the search functionality.',
    timestamp: new Date(2024, 0, 10, 10, 15),
    user: {
      name: 'Kriss Strikis',
      avatar: null,
      isOnline: true,
    },
  },
  {
    id: '3',
    content: 'What would you like to know?',
    timestamp: new Date(2024, 0, 10, 10, 16),
    user: {
      name: 'Aaron Gallant',
      avatar: null,
      isOnline: true,
    },
    reactions: [
      { emoji: '👍', count: 1, users: ['user1'] },
    ],
  },
];

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

export default function MessageList() {
  // Group messages by date
  const messagesByDate = mockMessages.reduce((groups, message) => {
    const date = message.timestamp.toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex flex-col-reverse">
      {/* Current Messages */}
      <div className="space-y-4">
        {Object.entries(messagesByDate).map(([date, messages]) => (
          <div key={date}>
            <DateDivider date={new Date(date)} />
            <div className="space-y-1">
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* New Message Indicator */}
      <div className="sticky top-0 z-10 mx-4 mb-4">
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
            New Messages
          </div>
        </div>
      </div>
    </div>
  );
} 