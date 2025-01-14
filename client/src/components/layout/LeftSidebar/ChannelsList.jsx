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

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          logger.warn('No token found, cannot fetch channels');
          return;
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/channels`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChannels(response.data.channels);

        // Find general channel and set it as active if no active channel
        const generalChannel = response.data.channels.find(c => c.name === 'general');
        if (generalChannel && !activeChannel) {
          setActiveChannel(generalChannel.id);
          router.push(`/channel/${generalChannel.id}`);
        }
      } catch (error) {
        logger.error('Failed to fetch channels:', error.response?.data?.error || error.message);
      }
    };

    fetchChannels();
  }, []);

  const handleChannelClick = (channel) => {
    setActiveChannel(channel.id);
    router.push(`/channel/${channel.id}`);
  };

  return (
    <div className="space-y-2 px-2">
      {channels.map((channel) => (
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