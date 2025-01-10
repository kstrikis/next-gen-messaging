'use client';

import { ChevronDown } from 'lucide-react';

export default function WorkspaceSwitcher() {
  return (
    <button className="flex w-full items-center justify-between px-4 py-2 hover:bg-accent">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded bg-primary/10">
          {/* Workspace icon will go here */}
        </div>
        <span className="font-semibold">GauntletAI</span>
      </div>
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    </button>
  );
} 