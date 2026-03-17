'use client';

import { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/hooks/useAuth';
import { ProfileSwitcher } from '@/components/shared/ProfileSwitcher';
import {
  HomeIcon,
  BuildingIcon,
  PackageIcon,
  SendIcon,
  LogOutIcon,
  BellIcon,
} from './icons';

interface SuperAdminShellProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { href: '/superadmin', label: 'Dashboard', icon: HomeIcon },
  { href: '/superadmin/academias', label: 'Academias', icon: BuildingIcon },
  { href: '/superadmin/onboarding', label: 'Onboarding', icon: SendIcon },
  { href: '/superadmin/planos', label: 'Planos', icon: PackageIcon },
];

const SuperAdminShell = forwardRef<HTMLDivElement, SuperAdminShellProps>(
  function SuperAdminShell({ children }, ref) {
    const { profile, logout } = useAuth();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

    const userName = profile?.display_name ?? 'Super Admin';

    const handleClickOutside = useCallback((e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node) &&
        userMenuButtonRef.current &&
        !userMenuButtonRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }, []);

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);

    async function handleLogout() {
      setUserMenuOpen(false);
      await logout();
    }

    function isActive(href: string): boolean {
      if (href === '/superadmin') return pathname === '/superadmin';
      return pathname.startsWith(href);
    }

    return (
      <div ref={ref} className="flex min-h-screen" style={{ background: 'var(--bb-depth-1)' }}>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            background: 'var(--bb-depth-2)',
            borderRight: '1px solid var(--bb-glass-border)',
          }}
        >
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 px-6" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              <span className="text-sm font-bold text-white">B</span>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>BlackBelt</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#f59e0b' }}>
                Platform Admin
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {sidebarItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    background: active ? 'rgba(245,158,11,0.12)' : 'transparent',
                    color: active ? '#f59e0b' : 'var(--bb-ink-60)',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = 'var(--bb-depth-3)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User card */}
          <div
            className="mx-3 mb-4 flex items-center gap-3 rounded-lg p-3"
            style={{ background: 'var(--bb-depth-3)' }}
          >
            <Avatar name={userName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                {userName}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#f59e0b' }}>
                Super Admin
              </p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex flex-1 flex-col">
          {/* Topbar */}
          <header
            className="sticky top-0 z-20 flex h-16 items-center justify-between px-4 lg:px-6"
            style={{
              background: 'var(--bb-depth-2)',
              borderBottom: '1px solid var(--bb-glass-border)',
            }}
          >
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              style={{ color: 'var(--bb-ink-60)' }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="hidden lg:block" />

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button style={{ color: 'var(--bb-ink-60)' }}>
                <BellIcon className="h-5 w-5" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  ref={userMenuButtonRef}
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="cursor-pointer"
                >
                  <Avatar name={userName} size="sm" />
                </button>

                {userMenuOpen && (
                  <div
                    ref={userMenuRef}
                    className="absolute right-0 top-full mt-2 w-64 z-50 overflow-hidden"
                    style={{
                      background: 'var(--bb-depth-3)',
                      border: '1px solid var(--bb-glass-border)',
                      boxShadow: 'var(--bb-shadow-lg)',
                      borderRadius: 'var(--bb-radius-lg)',
                      animation: 'scaleIn 0.15s ease-out',
                      transformOrigin: 'top right',
                    }}
                  >
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                      <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{userName}</p>
                      <p className="text-xs" style={{ color: '#f59e0b' }}>Super Admin</p>
                    </div>

                    <ProfileSwitcher onSwitch={() => setUserMenuOpen(false)} />

                    <div style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: 'var(--bb-danger, #ef4444)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <LogOutIcon className="h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1" style={{ background: 'var(--bb-depth-1)' }}>
            {children}
          </main>
        </div>
      </div>
    );
  },
);

SuperAdminShell.displayName = 'SuperAdminShell';

export { SuperAdminShell };
