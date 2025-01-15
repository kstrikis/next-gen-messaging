'use client';

import PropTypes from 'prop-types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/text';
import logger from '@/lib/logger';

function ReactionButton({ emoji, count, users, isActive, onClick }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 space-x-1 rounded-full bg-muted/50 px-3 hover:bg-muted',
              isActive && 'bg-primary/10 text-primary hover:bg-primary/20'
            )}
            onClick={onClick}
          >
            <span>{emoji}</span>
            <span className="text-xs">{count}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{users.join(', ')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

ReactionButton.propTypes = {
  emoji: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  users: PropTypes.arrayOf(PropTypes.string).isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
};

ReactionButton.defaultProps = {
  isActive: false,
  onClick: () => {},
};

export default function Message({ message }) {
  const [showActions, setShowActions] = useState(false);

  const handleReactionClick = (emoji) => {
    logger.info('Reaction clicked:', { emoji });
    // TODO: Implement reaction handling
  };

  return (
    <div
      className="group relative flex items-start space-x-3 px-4 py-2 hover:bg-muted/50"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Avatar className="h-9 w-9">
        {message.user.avatar ? (
          <img src={message.user.avatar} alt={message.user.name} />
        ) : (
          <AvatarFallback>{getInitials(message.user.name)}</AvatarFallback>
        )}
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{message.user.name}</span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        </div>

        <div className="text-sm">{message.content}</div>

        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {message.reactions.map((reaction, index) => (
              <ReactionButton
                key={`${reaction.emoji}-${index}`}
                emoji={reaction.emoji}
                count={reaction.count}
                users={reaction.users}
                onClick={() => handleReactionClick(reaction.emoji)}
              />
            ))}
          </div>
        )}
      </div>

      {showActions && (
        <div className="absolute right-4 top-2 flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <span className="text-lg">👍</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <span className="text-lg">❤️</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <span className="text-lg">😄</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <span className="text-lg">🎉</span>
          </Button>
        </div>
      )}
    </div>
  );
}

Message.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    timestamp: PropTypes.instanceOf(Date).isRequired,
    user: PropTypes.shape({
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
      isOnline: PropTypes.bool,
    }).isRequired,
    reactions: PropTypes.arrayOf(
      PropTypes.shape({
        emoji: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
        users: PropTypes.arrayOf(PropTypes.string).isRequired,
      })
    ),
  }).isRequired,
}; 