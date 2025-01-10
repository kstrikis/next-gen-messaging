'use client';

import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// Placeholder data - will be replaced with real data from API
const directMessages = [
  { id: 1, name: 'Aaron Gallant', status: 'online', unread: false },
  { id: 2, name: 'Kriss Strikis', status: 'offline', unread: true },
  { id: 3, name: 'Riley Bird', status: 'online', unread: false },
  { id: 4, name: 'Tom Tarpey', status: 'away', unread: false },
  { id: 5, name: 'Tyler Puig', status: 'offline', unread: false },
];

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
};

export default function DirectMessagesList() {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();

  return (
    <div className="py-2">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex w-full items-center px-4 py-1 text-sm text-muted-foreground hover:text-foreground"
      >
        {isExpanded ? (
          <ChevronDown className="mr-1 h-3 w-3" />
        ) : (
          <ChevronRight className="mr-1 h-3 w-3" />
        )}
        <span className="font-medium">Direct Messages</span>
        <Plus className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>

      {/* DMs List */}
      {isExpanded && (
        <div className="mt-1 space-y-[2px] px-2">
          {directMessages.map((dm) => {
            const isActive = pathname === `/dm/${dm.id}`;
            return (
              <Link
                key={dm.id}
                href={`/dm/${dm.id}`}
                className={`group flex items-center gap-2 rounded-md px-2 py-1 text-sm ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <div className="relative flex h-4 w-4 items-center justify-center">
                  <div className="h-4 w-4 rounded bg-primary/10" />
                  <div
                    className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ring-1 ring-background ${
                      statusColors[dm.status]
                    }`}
                  />
                </div>
                <span className={dm.unread ? 'font-semibold' : ''}>
                  {dm.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
} 