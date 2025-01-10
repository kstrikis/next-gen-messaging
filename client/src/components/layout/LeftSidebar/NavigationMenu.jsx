'use client';

import { Home, MessageSquare, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navigationItems = [
  { name: 'Home', icon: Home, href: '/', badge: null },
  { name: 'DMs', icon: MessageSquare, href: '/dms', badge: 1 },
  { name: 'Activity', icon: Bell, href: '/activity', badge: null },
];

export default function NavigationMenu() {
  const pathname = usePathname();

  return (
    <div className="px-2 py-4">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group mb-1 flex items-center gap-3 rounded-md px-2 py-2 text-sm ${
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
            {item.badge && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
} 