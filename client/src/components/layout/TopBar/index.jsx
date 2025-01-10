'use client';

import SearchBar from './SearchBar';
import ChannelHeader from './ChannelHeader';
import ActionsMenu from './ActionsMenu';

export default function TopBar({ showSidebarButton, onSidebarToggle }) {
  return (
    <div className="flex h-full items-center justify-between gap-4 px-4">
      <div className="flex items-center gap-4">
        {showSidebarButton && (
          <button
            onClick={onSidebarToggle}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Open Sidebar
          </button>
        )}
        <ChannelHeader />
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        <SearchBar />
        <ActionsMenu />
      </div>
    </div>
  );
} 