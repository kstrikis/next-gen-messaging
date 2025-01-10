'use client';

import WorkspaceSwitcher from './WorkspaceSwitcher';
import NavigationMenu from './NavigationMenu';
import ChannelsList from './ChannelsList';
import DirectMessagesList from './DirectMessagesList';

export default function LeftSidebar({ onToggle }) {
  return (
    <div className="flex h-full flex-col">
      {/* Workspace Switcher */}
      <div className="h-12 border-b border-border">
        <WorkspaceSwitcher />
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto">
        <NavigationMenu />
        
        {/* Divider */}
        <div className="mx-2 border-t border-border" />
        
        {/* Channels and DMs */}
        <div className="pb-4">
          <ChannelsList />
          <DirectMessagesList />
        </div>
      </div>

      {/* Add Channel Button */}
      <div className="border-t border-border p-4">
        <button
          onClick={onToggle}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add Channels
        </button>
      </div>
    </div>
  );
} 