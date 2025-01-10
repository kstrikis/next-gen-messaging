'use client';

import { Bell, AtSign, Hash, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import logger from '@/lib/logger';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'mention', content: '@you in #general: "Hey, can you take a look at this?"', time: '5m ago' },
  { id: 2, type: 'channel', content: 'New message in #support', time: '10m ago' },
  { id: 3, type: 'dm', content: 'Direct message from Jane Smith', time: '15m ago' },
];

const MOCK_ACTIVITY = [
  { id: 1, content: 'You were added to #project-alpha', time: '1h ago' },
  { id: 2, content: 'Your message was reacted to with 👍', time: '2h ago' },
  { id: 3, content: 'You created #new-features channel', time: '1d ago' },
];

export default function ActivityFeed() {
  const handleTabChange = (value) => {
    logger.debug('Activity tab changed:', value);
  };

  return (
    <div className="h-full p-4">
      <Tabs defaultValue="notifications" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="mt-4">
          <div className="space-y-4">
            {MOCK_NOTIFICATIONS.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg border">
                {notification.type === 'mention' && <AtSign className="h-5 w-5 text-blue-500" />}
                {notification.type === 'channel' && <Hash className="h-5 w-5 text-green-500" />}
                {notification.type === 'dm' && <Bell className="h-5 w-5 text-purple-500" />}
                <div className="flex-1">
                  <p className="text-sm">{notification.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <div className="space-y-4">
            {MOCK_ACTIVITY.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm">{activity.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 