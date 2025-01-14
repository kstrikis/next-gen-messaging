'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import TopBar from './TopBar';

export default function MainLayout({ children }) {
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const pathname = usePathname();

  // Extract channel ID from pathname if it's a channel route
  const channelMatch = pathname.match(/^\/channel\/([^/]+)$/);
  const channelId = channelMatch ? channelMatch[1] : null;
  const type = channelId ? 'channel' : pathname.startsWith('/dm/') ? 'dm' : null;

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div
        className={`w-64 border-r border-border transition-all duration-300 ${
          showLeftSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <LeftSidebar onToggle={() => setShowLeftSidebar(!showLeftSidebar)} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <div className="h-12 border-b border-border">
          <TopBar
            showSidebarButton={!showLeftSidebar}
            onSidebarToggle={() => setShowLeftSidebar(true)}
          />
        </div>

        {/* Content Area */}
        <div className="flex flex-1">
          <div className="flex-1">{children}</div>

          {/* Right Sidebar */}
          <div className="w-64">
            <RightSidebar type={type} channelId={channelId} />
          </div>
        </div>
      </div>
    </div>
  );
} 