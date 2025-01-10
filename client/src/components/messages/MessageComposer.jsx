'use client';

import { 
  Bold, 
  Italic, 
  Link, 
  Smile,
  Paperclip,
  AtSign,
  Send,
} from 'lucide-react';
import { useState } from 'react';

export default function MessageComposer({ onSend }) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend?.(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {/* Formatting Toolbar */}
      {isFocused && (
        <div className="flex items-center gap-1 border-b border-border px-4 py-2">
          <button
            type="button"
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Add link"
          >
            <Link className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="flex items-end gap-2 p-4">
        <div className="relative flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Message #help"
            className="block w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            rows={1}
            style={{
              minHeight: '40px',
              maxHeight: '200px',
              height: 'auto',
            }}
            onInput={(e) => {
              // Auto-resize textarea
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
            }}
          />

          {/* Quick Actions */}
          <div className="absolute bottom-2 right-2 flex items-center gap-2">
            <button
              type="button"
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Add emoji"
            >
              <Smile className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Mention someone"
            >
              <AtSign className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
} 