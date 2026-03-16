'use client';

import { forwardRef } from 'react';
import { BottomNav } from './BottomNav';
import { ShellHeader } from './ShellHeader';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { UsersIcon, CheckSquareIcon, MessageIcon, DollarIcon, UserIcon } from './icons';
import type { NavItem } from './BottomNav';

interface ParentShellProps {
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/parent', label: 'Filhos', icon: <UsersIcon className="h-5 w-5" /> },
  { href: '/parent/presencas', label: 'Presenças', icon: <CheckSquareIcon className="h-5 w-5" /> },
  { href: '/parent/mensagens', label: 'Mensagens', icon: <MessageIcon className="h-5 w-5" /> },
  { href: '/parent/pagamentos', label: 'Pagamentos', icon: <DollarIcon className="h-5 w-5" /> },
  { href: '/parent/perfil', label: 'Perfil', icon: <UserIcon className="h-5 w-5" /> },
];

const ParentShell = forwardRef<HTMLDivElement, ParentShellProps>(
  function ParentShell({ children }, ref) {
    return (
      <div ref={ref} className="min-h-screen pb-16" style={{ background: 'var(--bb-depth-1)' }}>
        <ShellHeader title="BlackBelt" subtitle="Responsável" rightContent={<ThemeToggle />} />
        <main>{children}</main>
        <BottomNav items={navItems} />
      </div>
    );
  },
);

ParentShell.displayName = 'ParentShell';

export { ParentShell };
