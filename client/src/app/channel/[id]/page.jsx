import MessagesContainer from '@/components/messages/MessagesContainer';

export const metadata = {
  title: 'Channel - ChatGenius',
  description: 'Channel messages',
};

export default async function Channel({ params }) {
  const { id } = await Promise.resolve(params);

  return (
    <div className="h-full">
      <MessagesContainer type="channel" channelId={id} />
    </div>
  );
} 