'use client';

import { forwardRef } from 'react';
import { BottomNav } from './BottomNav';
import { ShellHeader } from './ShellHeader';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { HeaderHelpButton } from './HelpSection';
import { HomeIcon, CalendarIcon, StarIcon, UserIcon, BookOpenIcon } from './icons';
import type { NavItem } from './BottomNav';

interface TeenShellProps {
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/teen', label: 'Home', icon: <HomeIcon className="h-5 w-5" />, id: 'nav-home-teen' },
  { href: '/teen/turmas', label: 'Turmas', icon: <CalendarIcon className="h-5 w-5" />, id: 'nav-turmas-teen' },
  { href: '/teen/academia', label: 'Academia', icon: <BookOpenIcon className="h-5 w-5" />, id: 'nav-academia-teen' },
  { href: '/teen/ranking', label: 'Ranking', icon: <StarIcon className="h-5 w-5" />, id: 'nav-ranking' },
  { href: '/teen/perfil', label: 'Perfil', icon: <UserIcon className="h-5 w-5" />, id: 'nav-perfil' },
];

const TeenShell = forwardRef<HTMLDivElement, TeenShellProps>(
  function TeenShell({ children }, ref) {
    return (
      <div ref={ref} className="min-h-screen pb-16" style={{ background: 'var(--bb-depth-1)' }}>
        {/* XP Bar */}
        <div id="teen-xp-bar" className="sticky top-0 z-30 px-4 pt-2" style={{ background: 'var(--bb-depth-1)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--bb-ink-60)' }}>
            <span className="font-bold" style={{ color: 'var(--bb-ink-100)' }}>Nível 7</span>
            <span>2.450 / 3.000 XP</span>
          </div>
          <div
            className="mt-1 h-2 overflow-hidden rounded-full"
            style={{ background: 'var(--bb-depth-4)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: '81.7%',
                background: 'linear-gradient(to right, var(--bb-brand), var(--bb-warning))',
              }}
            />
          </div>
        </div>
        <ShellHeader title="BlackBelt" subtitle="Teen" rightContent={<><HeaderHelpButton /><ThemeToggle /></>} />
        <main>{children}</main>
        <BottomNav items={navItems} />
      </div>
    );
  },
);

TeenShell.displayName = 'TeenShell';

export { TeenShell };
