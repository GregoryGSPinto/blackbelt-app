'use client';

import { forwardRef } from 'react';
import { BottomNav } from './BottomNav';
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
      <div ref={ref} className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 pb-20">
        <header className="sticky top-0 z-20 bg-white/80 px-4 py-3 backdrop-blur-sm">
          <h1 className="text-center text-xl font-bold text-bb-red">BlackBelt Kids</h1>
        </header>
        <main>{children}</main>
        <BottomNav items={navItems} />
      </div>
    );
  },
);

KidsShell.displayName = 'KidsShell';

export { KidsShell };
