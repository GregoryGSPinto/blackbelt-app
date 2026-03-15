'use client';

import { forwardRef } from 'react';
import { BottomNav } from './BottomNav';
import { ShellHeader } from './ShellHeader';
import { HomeIcon, CalendarIcon, AwardIcon, StarIcon, UserIcon } from './icons';
import type { NavItem } from './BottomNav';

interface TeenShellProps {
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/teen', label: 'Home', icon: <HomeIcon className="h-5 w-5" /> },
  { href: '/teen/turmas', label: 'Turmas', icon: <CalendarIcon className="h-5 w-5" /> },
  { href: '/teen/conquistas', label: 'Conquistas', icon: <AwardIcon className="h-5 w-5" /> },
  { href: '/teen/ranking', label: 'Ranking', icon: <StarIcon className="h-5 w-5" /> },
  { href: '/teen/perfil', label: 'Perfil', icon: <UserIcon className="h-5 w-5" /> },
];

const TeenShell = forwardRef<HTMLDivElement, TeenShellProps>(
  function TeenShell({ children }, ref) {
    return (
      <div ref={ref} className="min-h-screen bg-bb-gray-900 pb-16">
        {/* XP Bar */}
        <div className="sticky top-0 z-30 bg-bb-gray-900 px-4 pt-2">
          <div className="flex items-center justify-between text-xs text-bb-gray-500">
            <span className="font-bold text-bb-white">Nível 7</span>
            <span>2.450 / 3.000 XP</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-bb-gray-700">
            <div className="h-full rounded-full bg-gradient-to-r from-bb-red to-bb-warning" style={{ width: '81.7%' }} />
          </div>
        </div>
        <ShellHeader title="BlackBelt" subtitle="Teen" />
        <main>{children}</main>
        <BottomNav items={navItems} />
      </div>
    );
  },
);

TeenShell.displayName = 'TeenShell';

export { TeenShell };
