'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Hash } from 'lucide-react';
import logger from '@/lib/logger';

export default function ChannelsList() {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/channels`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setChannels(response.data.channels);
        logger.info('📥 Channels fetched:', { count: response.data.channels.length });

        // Find and set general channel as active if no channel is currently active
        const generalChannel = response.data.channels.find(c => c.name === 'general');
        if (generalChannel && !activeChannel) {
          setActiveChannel(generalChannel.id);
          router.push(`/channel/${generalChannel.id}`);
        }
      } catch (error) {
        logger.error('Failed to fetch channels:', error.response?.data?.error || error.message);
        setError(error.response?.data?.error || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [activeChannel, router]);

  const handleChannelClick = (channel) => {
    setActiveChannel(channel.id);
    router.push(`/channel/${channel.id}`);
  };

  return (
    <div className="space-y-2 px-2">
      {isLoading ? (
        <div className="flex items-center justify-center py-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="px-2 py-1 text-sm text-red-500">{error}</div>
      ) : channels.map((channel) => (
        <Button
          key={channel.id}
          variant="ghost"
          className={cn(
            'w-full justify-start gap-2',
            activeChannel === channel.id && 'bg-accent'
          )}
          onClick={() => handleChannelClick(channel)}
        >
          <Hash className="h-4 w-4" />
          <span className="truncate">{channel.name}</span>
        </Button>
      ))}
    </div>
  );
} 