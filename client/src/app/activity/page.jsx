import ActivityFeed from '@/components/activity/ActivityFeed';

export const metadata = {
  title: 'Activity - ChatGenius',
  description: 'Your activity and notifications',
};

export default function Activity() {
  return (
    <div className="h-full flex flex-col">
      <ActivityFeed />
    </div>
  );
} 