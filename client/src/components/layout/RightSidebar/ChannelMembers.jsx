'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/text';
import logger from '@/lib/logger';

export default function ChannelMembers({ channelId }) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/members`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMembers(response.data.members);
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

    fetchMembers();
  }, [channelId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">No members found</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-sm font-medium">Members ({members.length})</h2>
      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/50"
          >
            <Avatar className="h-8 w-8">
              {member.avatar ? (
                <img src={member.avatar} alt={member.username} />
              ) : (
                <AvatarFallback>{getInitials(member.username)}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{member.username}</p>
              {member.isOnline && (
                <p className="text-xs text-green-500">Online</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

ChannelMembers.propTypes = {
  channelId: PropTypes.string.isRequired,
}; 