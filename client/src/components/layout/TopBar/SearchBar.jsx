'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative flex-1 max-w-[720px]">
      <div className={`relative rounded-md shadow-sm transition-colors ${
        isFocused ? 'bg-background' : 'bg-accent'
      }`}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <input
          type="text"
          name="search"
          id="search"
          className={`block w-full rounded-md border-0 py-1.5 pl-10 pr-14 text-sm 
            ring-1 ring-inset focus:ring-2 
            bg-transparent placeholder:text-muted-foreground
            ${isFocused 
              ? 'ring-ring focus:ring-ring' 
              : 'ring-transparent focus:ring-ring'
            }`}
          placeholder="Search GauntletAI"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <kbd className="hidden h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground sm:flex">
            ⌘K
          </kbd>
        </div>
      </div>
    </div>
  );
} 