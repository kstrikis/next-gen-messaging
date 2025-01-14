'use client';

import { HelpCircle, Settings } from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';
import UserInfo from './UserInfo';

export default function ActionsMenu() {
  return (
    <div className="flex items-center gap-2">
      <UserInfo />
      <button
        className="rounded-sm p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        aria-label="Help"
      >
        <HelpCircle className="h-5 w-5" />
      </button>
      <button
        className="rounded-sm p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        aria-label="Settings"
      >
        <Settings className="h-5 w-5" />
      </button>
      <div className="ml-2 flex -space-x-2">
        {/* Placeholder for user avatars */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="relative h-7 w-7 rounded-full border-2 border-background bg-primary/10"
          />
        ))}
      </div>
      <button className="ml-1 rounded-full border-2 border-dashed border-muted-foreground/25 p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
        <span className="sr-only">Start Huddle</span>
        <svg
          className="h-4 w-4"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7 2v11c0 .55-.45 1-1 1H2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-4c-.55 0-1-.45-1-1V2c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1Z" />
        </svg>
      </button>
      <LogoutButton />
    </div>
  );
} 