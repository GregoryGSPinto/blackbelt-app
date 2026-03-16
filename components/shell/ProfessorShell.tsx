'use client';

import { forwardRef } from 'react';
import { BottomNav } from './BottomNav';
import { ShellHeader } from './ShellHeader';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { HomeIcon, CalendarIcon, UsersIcon, MessageIcon, UserIcon } from './icons';
import type { NavItem } from './BottomNav';

interface ProfessorShellProps {
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/professor', label: 'Home', icon: <HomeIcon className="h-5 w-5" /> },
  { href: '/professor/turma-ativa', label: 'Turmas', icon: <CalendarIcon className="h-5 w-5" /> },
  { href: '/professor/alunos', label: 'Alunos', icon: <UsersIcon className="h-5 w-5" /> },
  { href: '/professor/mensagens', label: 'Mensagens', icon: <MessageIcon className="h-5 w-5" /> },
  { href: '/professor/perfil', label: 'Perfil', icon: <UserIcon className="h-5 w-5" /> },
];

const ProfessorShell = forwardRef<HTMLDivElement, ProfessorShellProps>(
  function ProfessorShell({ children }, ref) {
    return (
      <div ref={ref} className="min-h-screen pb-16" style={{ background: 'var(--bb-depth-1)' }}>
        <ShellHeader title="BlackBelt" subtitle="Professor" rightContent={<ThemeToggle />} />
        <main>{children}</main>
        <BottomNav items={navItems} />
      </div>
    );
  },
);

ProfessorShell.displayName = 'ProfessorShell';

export { ProfessorShell };
