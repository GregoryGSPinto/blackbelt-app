'use client';

import { forwardRef } from 'react';
import { BottomNav } from './BottomNav';
import { ShellHeader } from './ShellHeader';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { HomeIcon, CalendarIcon, TrendingUpIcon, UserIcon, BookOpenIcon } from './icons';
import type { NavItem } from './BottomNav';

interface MainShellProps {
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: <HomeIcon className="h-5 w-5" />, id: 'nav-home' },
  { href: '/dashboard/turmas', label: 'Turmas', icon: <CalendarIcon className="h-5 w-5" />, id: 'nav-turmas' },
  { href: '/dashboard/progresso', label: 'Progresso', icon: <TrendingUpIcon className="h-5 w-5" />, id: 'nav-progresso' },
  { href: '/academia', label: 'Academia', icon: <BookOpenIcon className="h-5 w-5" />, id: 'nav-academia' },
  { href: '/dashboard/perfil', label: 'Perfil', icon: <UserIcon className="h-5 w-5" />, id: 'nav-perfil' },
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
