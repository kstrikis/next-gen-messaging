'use client';

import { ChevronDown, ChevronRight, Hash, Lock, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function ChannelsList() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [channels, setChannels] = useState([]);
  const [error, setError] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/channels`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChannels(response.data.channels);
      } catch (err) {
        console.error('Failed to fetch channels:', err);
        setError(err.message);
      }
    };

    fetchChannels();
  }, []);

  if (error) {
    return (
      <div className="py-2 px-4 text-sm text-red-500">
        Error loading channels: {error}
      </div>
    );
  }

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
            const isActive = pathname === `/channel/${channel.name}`;
            return (
              <Link
                key={channel.id}
                href={`/channel/${channel.name}`}
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
                <span>{channel.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
} 