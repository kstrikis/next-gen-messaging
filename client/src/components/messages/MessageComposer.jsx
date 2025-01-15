'use client';

import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  Smile,
  Paperclip,
  AtSign,
  Send,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';
import logger from '@/lib/logger';

export default function MessageComposer({ onSend, placeholder = 'Message', error = null }) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const composerRef = useRef(null);
  const textareaRef = useRef(null);

  // Clear error when message changes
  useEffect(() => {
    if (error && message.trim()) {
      onSend(message.trim());
    }
  }, [message, error, onSend]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      logger.info('💬 Message submitted from composer:', { message: trimmedMessage, timestamp: new Date().toISOString() });
      onSend?.(trimmedMessage);
      setMessage('');
      logger.info('🧹 Message input cleared');
    } else {
      logger.warn('⚠️ Attempted to submit empty message');
    }
  };

  const handleFormatting = (type, e) => {
    e.preventDefault(); // Prevent button from stealing focus
    logger.info('🔤 Formatting requested:', { type, message });
    
    // Keep focus on textarea
    textareaRef.current?.focus();
    
    // TODO: Implement text formatting
    switch (type) {
      case 'bold':
        logger.info('Making text bold');
        break;
      case 'italic':
        logger.info('Making text italic');
        break;
      case 'link':
        logger.info('Adding link to text');
        break;
      default:
        logger.warn('Unknown formatting type:', type);
    }
  };

  const handleQuickAction = (action, e) => {
    e.preventDefault(); // Prevent button from stealing focus
    textareaRef.current?.focus();
    
    switch (action) {
      case 'emoji':
        logger.info('😊 Emoji picker requested');
        // TODO: Implement emoji picker
        break;
      case 'attachment':
        logger.info('📎 File attachment requested');
        // TODO: Implement file attachment
        break;
      case 'mention':
        logger.info('@ Mention requested');
        // TODO: Implement mentions
        break;
      default:
        logger.warn('Unknown quick action:', action);
    }
  };

  const handleFocus = () => {
    logger.info('🎯 Composer focused');
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    // Don't blur if clicking within the composer component
    if (composerRef.current?.contains(e.relatedTarget)) {
      return;
    }
    logger.info('⚪ Composer blurred');
    setIsFocused(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow Shift+Enter for new line
        return;
      }
      // Enter without shift submits the form
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div ref={composerRef} className="flex flex-col">
      <form className="flex flex-col" onSubmit={handleSubmit} data-testid="message-form">
        {/* Formatting Toolbar */}
        {isFocused && (
          <div className="flex items-center gap-1 border-b border-border px-4 py-2">
            <button
              type="button"
              onClick={(e) => handleFormatting('bold', e)}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => handleFormatting('italic', e)}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => handleFormatting('link', e)}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Add link"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Message Input */}
        <div className="flex items-end gap-2 p-4">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                const newValue = e.target.value;
                setMessage(newValue);
                logger.debug('✏️ Message input changed:', { 
                  length: newValue.length, 
                  text: newValue,
                  isEmpty: !newValue.trim(),
                });
              }}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              className={cn(
                "block w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                error ? "border-red-500 focus:ring-red-500" : "border-border"
              )}
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

            {/* Error Message */}
            {error && (
              <p className="absolute -bottom-6 left-0 text-sm text-red-500">{error}</p>
            )}

            {/* Quick Actions */}
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => handleQuickAction('emoji', e)}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Add emoji"
              >
                <Smile className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => handleQuickAction('attachment', e)}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => handleQuickAction('mention', e)}
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
    </div>
  );
}

MessageComposer.propTypes = {
  onSend: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
};

MessageComposer.defaultProps = {
  placeholder: 'Message',
  error: null,
}; 