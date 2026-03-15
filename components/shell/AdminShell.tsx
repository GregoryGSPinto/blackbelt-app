'use client';

import { forwardRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { HomeIcon, CalendarIcon, UsersIcon, DollarIcon, BarChartIcon, SettingsIcon, SearchIcon, BellIcon } from './icons';

interface AdminShellProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { href: '/admin', label: 'Dashboard', icon: HomeIcon },
  { href: '/admin/turmas', label: 'Turmas', icon: CalendarIcon },
  { href: '/admin/alunos', label: 'Alunos', icon: UsersIcon },
  { href: '/admin/financeiro', label: 'Financeiro', icon: DollarIcon },
  { href: '/admin/relatorios', label: 'Relatórios', icon: BarChartIcon },
  { href: '/admin/conteudo', label: 'Conteúdo', icon: SettingsIcon },
];

const AdminShell = forwardRef<HTMLDivElement, AdminShellProps>(
  function AdminShell({ children }, ref) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
      <div ref={ref} className="flex min-h-screen bg-bb-gray-100">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-bb-gray-300 lg:bg-white">
          <div className="flex h-14 items-center border-b border-bb-gray-300 px-6">
            <span className="text-lg font-bold text-bb-red">BlackBelt</span>
            <span className="ml-1 text-xs text-bb-gray-500">Admin</span>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive ? 'bg-bb-red/10 text-bb-red font-medium' : 'text-bb-gray-700 hover:bg-bb-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
              <div className="flex h-14 items-center border-b border-bb-gray-300 px-6">
                <span className="text-lg font-bold text-bb-red">BlackBelt</span>
              </div>
              <nav className="space-y-1 p-3">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive ? 'bg-bb-red/10 text-bb-red font-medium' : 'text-bb-gray-700 hover:bg-bb-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-bb-gray-300 bg-white px-4">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-bb-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <SearchIcon className="h-5 w-5 text-bb-gray-500" />
            </div>
            <div className="flex items-center gap-3">
              <button className="relative" aria-label="Notificações">
                <BellIcon className="h-5 w-5 text-bb-gray-500" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-bb-red text-[10px] text-white">3</span>
              </button>
              <Avatar name="Admin" size="sm" />
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    );
  },
);

AdminShell.displayName = 'AdminShell';

export { AdminShell };
