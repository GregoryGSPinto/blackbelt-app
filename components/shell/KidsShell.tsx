'use client';

import { forwardRef } from 'react';
import { BottomNav } from './BottomNav';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { HomeIcon, AwardIcon, HeartIcon } from './icons';
import type { NavItem } from './BottomNav';

interface KidsShellProps {
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/kids', label: 'Início', icon: <HomeIcon className="h-6 w-6" /> },
  { href: '/kids/conquistas', label: 'Conquistas', icon: <AwardIcon className="h-6 w-6" /> },
  { href: '/kids/perfil', label: 'Eu', icon: <HeartIcon className="h-6 w-6" /> },
];

const KidsShell = forwardRef<HTMLDivElement, KidsShellProps>(
  function KidsShell({ children }, ref) {
    return (
      <div
        ref={ref}
        className="min-h-screen pb-20"
        style={{
          background: 'var(--bb-depth-2)',
          borderRadius: 'var(--bb-radius-2xl)',
        }}
      >
        <header
          className="sticky top-0 z-20 px-4 py-3 backdrop-blur-sm"
          style={{ background: 'var(--bb-depth-2)' }}
        >
          <div className="flex items-center justify-between">
            <div />
            <h1
              className="text-xl font-bold"
              style={{ color: 'var(--bb-brand)' }}
            >
              BlackBelt Kids
            </h1>
            <ThemeToggle />
          </div>
        </header>
        <main>{children}</main>
        <BottomNav items={navItems} />
      </div>
    );
  },
);

KidsShell.displayName = 'KidsShell';

export { KidsShell };
