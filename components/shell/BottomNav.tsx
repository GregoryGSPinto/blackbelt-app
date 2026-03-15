'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface BottomNavProps {
  items: NavItem[];
}

const BottomNav = forwardRef<HTMLElement, BottomNavProps>(
  function BottomNav({ items }, ref) {
    const pathname = usePathname();

    return (
      <nav
        ref={ref}
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-bb-gray-300 bg-white safe-area-bottom"
      >
        <div className="flex items-center justify-around py-2">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                  isActive ? 'text-bb-red' : 'text-bb-gray-500 hover:text-bb-gray-700'
                }`}
              >
                <span className="h-5 w-5">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  },
);

BottomNav.displayName = 'BottomNav';

export { BottomNav };
