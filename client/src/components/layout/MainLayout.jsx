'use client';

import { useState } from 'react';
import LeftSidebar from './LeftSidebar';
import TopBar from './TopBar';

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {/* Main Grid Layout */}
      <div className={`grid h-full ${isSidebarOpen ? 'grid-cols-[260px_1fr_auto]' : 'grid-cols-[0_1fr_auto]'}`}>
        {/* Left Sidebar */}
        <aside className={`border-r border-border bg-sidebar transition-all duration-300 ${isSidebarOpen ? 'w-[260px]' : 'w-0 opacity-0'}`}>
          <LeftSidebar onToggle={toggleSidebar} />
        </aside>

        {/* Main Content Area */}
        <main className="flex h-full flex-col">
          {/* Top Bar */}
          <header className="h-12 border-b border-border bg-header">
            <TopBar 
              showSidebarButton={!isSidebarOpen}
              onSidebarToggle={toggleSidebar}
            />
          </header>

          {/* Message Area */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </main>

        {/* Right Sidebar (optional) */}
        <aside className="w-[340px] border-l border-border bg-sidebar">
          {/* RightSidebar component will go here */}
        </aside>
      </div>
    </div>
  );
} 