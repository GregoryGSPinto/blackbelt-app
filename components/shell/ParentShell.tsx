'use client';

import { forwardRef } from 'react';
import { BottomNav } from './BottomNav';
import { ShellHeader } from './ShellHeader';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { HeaderHelpButton } from './HelpSection';
import { UsersIcon, CalendarIcon, CheckSquareIcon, MessageIcon, DollarIcon, UserIcon } from './icons';
import type { NavItem } from './BottomNav';

interface ParentShellProps {
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/parent', label: 'Filhos', icon: <UsersIcon className="h-5 w-5" />, id: 'nav-filhos' },
  { href: '/parent/agenda', label: 'Agenda', icon: <CalendarIcon className="h-5 w-5" />, id: 'nav-agenda' },
  { href: '/parent/presencas', label: 'Presenças', icon: <CheckSquareIcon className="h-5 w-5" />, id: 'nav-presencas' },
  { href: '/parent/mensagens', label: 'Mensagens', icon: <MessageIcon className="h-5 w-5" />, id: 'nav-mensagens' },
  { href: '/parent/pagamentos', label: 'Pagamentos', icon: <DollarIcon className="h-5 w-5" />, id: 'nav-pagamentos' },
  { href: '/parent/perfil', label: 'Perfil', icon: <UserIcon className="h-5 w-5" />, id: 'nav-perfil' },
];

const ParentShell = forwardRef<HTMLDivElement, ParentShellProps>(
  function ParentShell({ children }, ref) {
    return (
      <div ref={ref} className="min-h-screen pb-16" style={{ background: 'var(--bb-depth-1)' }}>
        <ShellHeader title="BlackBelt" subtitle="Responsável" rightContent={<><HeaderHelpButton /><ThemeToggle /></>} />
        <main>{children}</main>
        <BottomNav items={navItems} />
      </div>
    );
  },
);

ParentShell.displayName = 'ParentShell';

export { ParentShell };
