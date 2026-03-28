'use client';

import { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { BlackBeltLogo } from '@/components/brand/BlackBeltLogo';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/hooks/useAuth';
import { ProfileSwitcher } from '@/components/shared/ProfileSwitcher';
import { isImpersonating, getImpersonationInfo, stopImpersonation } from '@/lib/api/superadmin-impersonate.service';
import { SidebarHelpSection } from './HelpSection';
import { SidebarFeedback } from '@/components/shared/SidebarFeedback';
import { LegalFooter } from './LegalFooter';
import { BetaBadge } from '@/components/beta/BetaBadge';
import { NotificationBell } from '@/components/shared/NotificationBell';
import {
  LayoutDashboardIcon,
  BuildingIcon,
  FilterIcon,
  TargetIcon,
  DollarIcon,
  CreditCardIcon,
  ToggleLeftIcon,
  BarChartIcon,
  MegaphoneIcon,
  MailIcon,
  ShieldIcon,
  RocketIcon,
  LifeBuoyIcon,
  LogOutIcon,
  UsersIcon,
  XIcon,
  TrophyIcon,
  FlaskConicalIcon,
} from './icons';

interface SuperAdminShellProps {
  children: React.ReactNode;
}

interface SidebarGroup {
  label: string;
  items: { href: string; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; badge?: number; id?: string }[];
}

const AMBER = '#f59e0b';

const sidebarGroups: SidebarGroup[] = [
  {
    label: 'OVERVIEW',
    items: [
      { href: '/superadmin', label: 'Mission Control', icon: LayoutDashboardIcon, id: 'sidebar-link-mission-control' },
    ],
  },
  {
    label: 'COMERCIAL',
    items: [
      { href: '/superadmin/prospeccao', label: 'Prospecção', icon: TargetIcon, id: 'sidebar-link-prospeccao' },
      { href: '/superadmin/pipeline', label: 'Pipeline', icon: FilterIcon, badge: 12, id: 'sidebar-link-pipeline' },
      { href: '/superadmin/academias', label: 'Academias', icon: BuildingIcon, badge: 3, id: 'sidebar-link-academias' },
    ],
  },
  {
    label: 'FINANCEIRO',
    items: [
      { href: '/superadmin/receita', label: 'Receita', icon: DollarIcon, id: 'sidebar-link-receita' },
      { href: '/superadmin/planos', label: 'Planos', icon: CreditCardIcon, id: 'sidebar-link-planos' },
    ],
  },
  {
    label: 'PRODUTO',
    items: [
      { href: '/superadmin/features', label: 'Features', icon: ToggleLeftIcon, id: 'sidebar-link-features' },
      { href: '/superadmin/analytics', label: 'Analytics', icon: BarChartIcon, id: 'sidebar-link-analytics' },
    ],
  },
  {
    label: 'COMUNICAÇÃO',
    items: [
      { href: '/superadmin/comunicacao', label: 'Comunicação', icon: MegaphoneIcon, badge: 2, id: 'sidebar-link-comunicacao' },
      { href: '/superadmin/contatos', label: 'Contatos Site', icon: MailIcon, id: 'sidebar-link-contatos' },
    ],
  },
  {
    label: 'COMPETE',
    items: [
      { href: '/superadmin/compete', label: 'Compete', icon: TrophyIcon, id: 'sidebar-link-compete' },
    ],
  },
  {
    label: 'BETA',
    items: [
      { href: '/superadmin/beta', label: 'Beta Program', icon: FlaskConicalIcon, id: 'sidebar-link-beta' },
    ],
  },
  {
    label: 'OPERAÇÕES',
    items: [
      { href: '/superadmin/onboarding', label: 'Onboarding', icon: RocketIcon, id: 'sidebar-link-onboarding' },
      { href: '/superadmin/auditoria', label: 'Auditoria', icon: ShieldIcon, id: 'sidebar-link-auditoria-sa' },
      { href: '/superadmin/suporte', label: 'Suporte', icon: LifeBuoyIcon, id: 'superadmin-nav-suporte' },
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
            id="superadmin-sidebar"
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
              <BlackBeltLogo variant="navbar" mode="dark" height={28} />
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: AMBER }}>
                Platform Admin
              </p>
            </div>

            {/* Nav Groups */}
            <nav aria-label="Menu principal" className="flex-1 overflow-y-auto px-3 py-4">
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
                          id={item.id}
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
              <SidebarHelpSection onItemClick={() => setSidebarOpen(false)} />
              <SidebarFeedback />
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
                aria-label="Abrir menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="hidden lg:flex lg:items-center lg:gap-2">
                <BetaBadge />
              </div>

              <div className="flex items-center gap-3">
                {/* Notifications */}
                <NotificationBell />

                {/* User Menu */}
                <div className="relative">
                  <button
                    ref={userMenuButtonRef}
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="flex h-9 w-9 items-center justify-center cursor-pointer"
                    aria-label="Menu do usuario"
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

                      {/* Quick links */}
                      <div style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                        <Link
                          href="/superadmin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                          style={{ color: 'var(--bb-ink-80)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <LayoutDashboardIcon className="h-4 w-4" />
                          Mission Control
                        </Link>
                      </div>

                      <ProfileSwitcher onSwitch={() => setUserMenuOpen(false)} />

                      <div style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
                        <button
                          onClick={() => { setUserMenuOpen(false); sessionStorage.setItem('bb_profile_switch', '1'); window.location.href = '/selecionar-perfil'; }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                          style={{ color: 'var(--bb-ink-80)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <UsersIcon className="h-4 w-4" />
                          Trocar Perfil
                        </button>
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
            <LegalFooter />
          </div>
        </div>
      </div>
    );
  },
);

SuperAdminShell.displayName = 'SuperAdminShell';

export { SuperAdminShell };
