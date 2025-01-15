'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import logger from '@/lib/logger';

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
};

export default function DirectMessagesList() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Get current channel ID from pathname
        const channelMatch = pathname.match(/^\/channel\/([^/]+)$/);
        const channelId = channelMatch ? channelMatch[1] : null;

        if (!channelId) {
          throw new Error('No channel ID found');
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/members`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUsers(response.data.members);
        logger.info('📥 Channel members fetched:', { 
          channelId,
          count: response.data.members.length,
        });
      } catch (error) {
        logger.error('Failed to fetch channel members:', error.response?.data?.error || error.message);
        setError(error.response?.data?.error || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [pathname]);

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
        <span className="font-medium">Channel Members</span>
        <Plus className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>

      {/* Users List */}
      {isExpanded && (
        <div className="mt-1 space-y-[2px] px-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="px-2 py-1 text-sm text-red-500">{error}</div>
          ) : users.length === 0 ? (
            <div className="px-2 py-1 text-sm text-muted-foreground">No members found</div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="group flex items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <div className="relative flex h-4 w-4 items-center justify-center">
                  <div className="h-4 w-4 rounded bg-primary/10" />
                  <div
                    className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ring-1 ring-background ${
                      user.isOnline ? statusColors.online : statusColors.offline
                    }`}
                  />
                </div>
                <span>{user.username}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 