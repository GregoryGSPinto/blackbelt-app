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
        className="fixed bottom-0 left-0 right-0 z-30 safe-area-bottom"
        style={{
          background: 'var(--bb-depth-2)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--bb-glass-border)',
        }}
      >
        <div className="flex items-center justify-around py-2">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-all"
                style={{
                  color: isActive ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                  transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                }}
              >
                <span className="h-5 w-5">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-1 rounded-full"
                    style={{
                      width: '4px',
                      height: '4px',
                      background: 'var(--bb-brand)',
                    }}
                  />
                )}
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
