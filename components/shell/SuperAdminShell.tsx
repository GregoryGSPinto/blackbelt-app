'use client';

import { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/hooks/useAuth';
import { ProfileSwitcher } from '@/components/shared/ProfileSwitcher';
import { isImpersonating, getImpersonationInfo, stopImpersonation } from '@/lib/api/superadmin-impersonate.service';
import {
  LayoutDashboardIcon,
  BuildingIcon,
  FilterIcon,
  DollarIcon,
  CreditCardIcon,
  ToggleLeftIcon,
  BarChartIcon,
  MegaphoneIcon,
  ShieldIcon,
  RocketIcon,
  LogOutIcon,
  BellIcon,
  XIcon,
} from './icons';

interface SuperAdminShellProps {
  children: React.ReactNode;
}

interface SidebarGroup {
  label: string;
  items: { href: string; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; badge?: number }[];
}

const AMBER = '#f59e0b';

const sidebarGroups: SidebarGroup[] = [
  {
    label: 'OVERVIEW',
    items: [
      { href: '/superadmin', label: 'Mission Control', icon: LayoutDashboardIcon },
    ],
  },
  {
    label: 'COMERCIAL',
    items: [
      { href: '/superadmin/pipeline', label: 'Pipeline', icon: FilterIcon, badge: 12 },
      { href: '/superadmin/academias', label: 'Academias', icon: BuildingIcon, badge: 3 },
    ],
  },
  {
    label: 'FINANCEIRO',
    items: [
      { href: '/superadmin/receita', label: 'Receita', icon: DollarIcon },
      { href: '/superadmin/planos', label: 'Planos', icon: CreditCardIcon },
    ],
  },
  {
    label: 'PRODUTO',
    items: [
      { href: '/superadmin/features', label: 'Features', icon: ToggleLeftIcon },
      { href: '/superadmin/analytics', label: 'Analytics', icon: BarChartIcon },
    ],
  },
  {
    label: 'COMUNICAÇÃO',
    items: [
      { href: '/superadmin/comunicacao', label: 'Comunicação', icon: MegaphoneIcon, badge: 2 },
    ],
  },
  {
    label: 'OPERAÇÕES',
    items: [
      { href: '/superadmin/onboarding', label: 'Onboarding', icon: RocketIcon },
      { href: '/superadmin/auditoria', label: 'Auditoria', icon: ShieldIcon },
    ],
  },
];

const SuperAdminShell = forwardRef<HTMLDivElement, SuperAdminShellProps>(
  function SuperAdminShell({ children }, ref) {
    const { profile, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [impersonating, setImpersonating] = useState(false);
    const [impersonateInfo, setImpersonateInfo] = useState<{ academiaNome: string } | null>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

    const userName = profile?.display_name ?? 'Super Admin';

    useEffect(() => {
      setImpersonating(isImpersonating());
      const info = getImpersonationInfo();
      if (info) setImpersonateInfo({ academiaNome: info.academiaNome });
    }, []);

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

    async function handleStopImpersonation() {
      await stopImpersonation();
      setImpersonating(false);
      setImpersonateInfo(null);
      router.push('/superadmin');
    }

    function isActive(href: string): boolean {
      if (href === '/superadmin') return pathname === '/superadmin';
      return pathname.startsWith(href);
    }

    return (
      <div ref={ref} className="flex min-h-screen flex-col" style={{ background: 'var(--bb-depth-1)' }}>
        {/* Impersonation Banner */}
        {impersonating && impersonateInfo && (
          <div
            className="fixed left-0 right-0 top-0 z-[9999] flex items-center justify-center gap-3 px-4 py-2 text-sm font-semibold"
            style={{ background: AMBER, color: '#000' }}
          >
            <span>Você está visualizando como: {impersonateInfo.academiaNome} (Admin)</span>
            <button
              onClick={handleStopImpersonation}
              className="ml-2 flex items-center gap-1 rounded-md px-3 py-1 text-xs font-bold transition-colors"
              style={{ background: 'rgba(0,0,0,0.2)', color: '#000' }}
            >
              <XIcon className="h-3 w-3" />
              Sair da visualização
            </button>
          </div>
        )}

        <div className="flex flex-1" style={{ marginTop: impersonating ? '40px' : '0' }}>
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
              top: impersonating ? '40px' : '0',
            }}
          >
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 px-6" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: `linear-gradient(135deg, ${AMBER}, #d97706)` }}
              >
                <span className="text-sm font-bold text-white">B</span>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>BlackBelt</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: AMBER }}>
                  Platform Admin
                </p>
              </div>
            </div>

            {/* Nav Groups */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {sidebarGroups.map((group, gi) => (
                <div key={group.label} className={gi > 0 ? 'mt-5' : ''}>
                  {/* Group Label */}
                  <p
                    className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--bb-ink-40)' }}
                  >
                    {group.label}
                  </p>
                  {gi > 0 && (
                    <div className="-mt-2 mb-2 mx-3" style={{ borderTop: '1px solid var(--bb-glass-border)' }} />
                  )}
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = isActive(item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                          style={{
                            background: active ? `rgba(245,158,11,0.12)` : 'transparent',
                            color: active ? AMBER : 'var(--bb-ink-60)',
                            borderLeft: active ? `3px solid ${AMBER}` : '3px solid transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (!active) e.currentTarget.style.background = 'var(--bb-depth-3)';
                          }}
                          onMouseLeave={(e) => {
                            if (!active) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="flex-1">{item.label}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span
                              className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                              style={{ background: AMBER, color: '#000' }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
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
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: AMBER }}>
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
                top: impersonating ? '40px' : '0',
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
                        <p className="text-xs" style={{ color: AMBER }}>Super Admin</p>
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
      </div>
    );
  },
);

SuperAdminShell.displayName = 'SuperAdminShell';

export { SuperAdminShell };
