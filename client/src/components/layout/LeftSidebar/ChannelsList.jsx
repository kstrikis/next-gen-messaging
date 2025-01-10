'use client';

import { ChevronDown, ChevronRight, Hash, Lock, Plus } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// Placeholder data - will be replaced with real data from API
const channels = [
  { id: 1, name: 'announcements', isPrivate: false, unread: false },
  { id: 2, name: 'help', isPrivate: false, unread: true },
  { id: 3, name: 'introductions', isPrivate: false, unread: false },
  { id: 4, name: 'social', isPrivate: false, unread: false },
  { id: 5, name: 'brainlifts', isPrivate: true, unread: true },
];

export default function ChannelsList() {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();

  return (
    <div className="py-2">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center px-4 py-1 text-sm text-muted-foreground hover:text-foreground"
      >
        {isExpanded ? (
          <ChevronDown className="mr-1 h-3 w-3" />
        ) : (
          <ChevronRight className="mr-1 h-3 w-3" />
        )}
        <span className="font-medium">Channels</span>
        <Plus className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>

      {/* Channels List */}
      {isExpanded && (
        <div className="mt-1 space-y-[2px] px-2">
          {channels.map((channel) => {
            const isActive = pathname === `/channel/${channel.id}`;
            return (
              <Link
                key={channel.id}
                href={`/channel/${channel.id}`}
                className={`group flex items-center gap-2 rounded-md px-2 py-1 text-sm ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {channel.isPrivate ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  <Hash className="h-3 w-3" />
                )}
                <span className={channel.unread ? 'font-semibold' : ''}>
                  {channel.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
} 