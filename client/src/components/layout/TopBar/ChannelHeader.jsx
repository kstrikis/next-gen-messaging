'use client';

import { Hash, Users } from 'lucide-react';

export default function ChannelHeader({ channel }) {
  // This will be replaced with real data from API
  const mockChannel = {
    name: 'help',
    topic: 'Get help with ChatGenius features and functionality',
    memberCount: 212,
    ...channel,
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-muted-foreground" />
        <h1 className="text-sm font-semibold">{mockChannel.name}</h1>
      </div>

      <div className="hidden items-center gap-2 sm:flex">
        <div className="h-4 w-[1px] bg-border" />
        <button className="flex items-center gap-1 rounded px-1 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          <Users className="h-3 w-3" />
          <span>{mockChannel.memberCount}</span>
        </button>
      </div>

      {mockChannel.topic && (
        <div className="hidden items-center gap-2 lg:flex">
          <div className="h-4 w-[1px] bg-border" />
          <p className="truncate text-xs text-muted-foreground">
            {mockChannel.topic}
          </p>
        </div>
      )}
    </div>
  );
} 