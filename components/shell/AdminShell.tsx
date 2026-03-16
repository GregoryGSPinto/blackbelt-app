'use client';

import { forwardRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
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
      <div ref={ref} className="flex min-h-screen" style={{ background: 'var(--bb-depth-1)' }}>
        {/* Sidebar - desktop */}
        <aside
          className="hidden lg:flex lg:w-64 lg:flex-col"
          style={{
            background: 'var(--bb-depth-2)',
            borderRight: '1px solid var(--bb-glass-border)',
          }}
        >
          <div
            className="flex h-14 flex-col justify-center px-6"
            style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
          >
            <span
              className="font-display text-xl font-extrabold"
              style={{
                color: 'var(--bb-brand)',
                filter: 'drop-shadow(0 0 6px var(--bb-brand))',
              }}
            >
              BLACKBELT
            </span>
            <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              Academia Admin
            </span>
          </div>
          <nav className="flex-1 flex flex-col gap-[2px] p-3">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 text-sm transition-colors"
                  style={{
                    padding: '10px 16px',
                    borderRadius: 'var(--bb-radius-sm)',
                    ...(isActive
                      ? {
                          background: 'var(--bb-brand-surface)',
                          color: 'var(--bb-brand)',
                          fontWeight: 600,
                        }
                      : {
                          color: 'var(--bb-ink-60)',
                        }),
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--bb-depth-4)';
                      e.currentTarget.style.color = 'var(--bb-ink-80)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--bb-ink-60)';
                    }
                  }}
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
            <aside
              className="fixed left-0 top-0 bottom-0 w-64 shadow-xl"
              style={{ background: 'var(--bb-depth-2)' }}
            >
              <div
                className="flex h-14 flex-col justify-center px-6"
                style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
              >
                <span
                  className="font-display text-xl font-extrabold"
                  style={{
                    color: 'var(--bb-brand)',
                    filter: 'drop-shadow(0 0 6px var(--bb-brand))',
                  }}
                >
                  BLACKBELT
                </span>
                <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  Academia Admin
                </span>
              </div>
              <nav className="flex flex-col gap-[2px] p-3">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 text-sm transition-colors"
                      style={{
                        padding: '10px 16px',
                        borderRadius: 'var(--bb-radius-sm)',
                        ...(isActive
                          ? {
                              background: 'var(--bb-brand-surface)',
                              color: 'var(--bb-brand)',
                              fontWeight: 600,
                            }
                          : {
                              color: 'var(--bb-ink-60)',
                            }),
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'var(--bb-depth-4)';
                          e.currentTarget.style.color = 'var(--bb-ink-80)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--bb-ink-60)';
                        }
                      }}
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
          <header
            className="sticky top-0 z-20 flex h-14 items-center justify-between px-4"
            style={{
              background: 'var(--bb-depth-2)',
              borderBottom: '1px solid var(--bb-glass-border)',
            }}
          >
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--bb-ink-60)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <SearchIcon className="h-5 w-5" style={{ color: 'var(--bb-ink-60)' }} />
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button className="relative" aria-label="Notificações">
                <BellIcon className="h-5 w-5" style={{ color: 'var(--bb-ink-60)' }} />
                <span
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white"
                  style={{ background: 'var(--bb-brand)' }}
                >
                  3
                </span>
              </button>
              <Avatar name="Admin" size="sm" />
            </div>
          </header>
          <main className="flex-1" style={{ background: 'var(--bb-depth-1)' }}>{children}</main>
        </div>
      </div>
    );
  },
);

AdminShell.displayName = 'AdminShell';

export { AdminShell };
