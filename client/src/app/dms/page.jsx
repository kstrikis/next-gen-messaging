import MessagesContainer from '@/components/messages/MessagesContainer';

export const metadata = {
  title: 'Direct Messages - ChatGenius',
  description: 'Your direct messages',
};

export default function DirectMessages() {
  return (
    <div className="h-full">
      <MessagesContainer type="dm" />
    </div>
  );
} 