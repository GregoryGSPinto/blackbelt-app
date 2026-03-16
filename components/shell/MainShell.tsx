'use client';

import { forwardRef } from 'react';
import { BottomNav } from './BottomNav';
import { ShellHeader } from './ShellHeader';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { HomeIcon, CalendarIcon, TrendingUpIcon, VideoIcon, UserIcon } from './icons';
import type { NavItem } from './BottomNav';

interface MainShellProps {
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: <HomeIcon className="h-5 w-5" /> },
  { href: '/dashboard/turmas', label: 'Turmas', icon: <CalendarIcon className="h-5 w-5" /> },
  { href: '/dashboard/progresso', label: 'Progresso', icon: <TrendingUpIcon className="h-5 w-5" /> },
  { href: '/dashboard/conteudo', label: 'Conteúdo', icon: <VideoIcon className="h-5 w-5" /> },
  { href: '/dashboard/perfil', label: 'Perfil', icon: <UserIcon className="h-5 w-5" /> },
];

const MainShell = forwardRef<HTMLDivElement, MainShellProps>(
  function MainShell({ children }, ref) {
    return (
      <div ref={ref} className="min-h-screen pb-16" style={{ background: 'var(--bb-depth-1)' }}>
        <ShellHeader title="BlackBelt" rightContent={<ThemeToggle />} />
        <main>{children}</main>
        <BottomNav items={navItems} />
      </div>
    );
  },
);

MainShell.displayName = 'MainShell';

export { MainShell };
