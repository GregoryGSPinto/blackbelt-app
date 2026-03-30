'use client';

import { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { BlackBeltLogo } from '@/components/brand/BlackBeltLogo';
import { usePathname } from 'next/navigation';
import { BottomNav } from './BottomNav';
import { Avatar } from '@/components/ui/Avatar';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { HeaderHelpButton, SidebarHelpSection } from './HelpSection';
import { SidebarFeedback } from '@/components/shared/SidebarFeedback';
import { LegalFooter } from './LegalFooter';
import { ProfileSwitcher } from '@/components/shared/ProfileSwitcher';
import { useAuth } from '@/lib/hooks/useAuth';
import { TourIntegration } from '@/components/tour/TourIntegration';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  CheckSquareIcon,
  MessageIcon,
  DollarIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  ShieldIcon,
  BellIcon,
  BarChartIcon,
  SearchIcon,
} from './icons';
import type { NavItem } from './BottomNav';

interface ParentShellProps {
  children: React.ReactNode;
}

interface SidebarGroup {
  label: string;
  items: { href: string; label: string; icon: typeof HomeIcon; id?: string }[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    label: 'PRINCIPAL',
    items: [
      { href: '/parent', label: 'Dashboard', icon: HomeIcon, id: 'sidebar-link-dashboard' },
      { href: '/parent/presencas', label: 'Presenças', icon: CheckSquareIcon, id: 'sidebar-link-presencas' },
      { href: '/parent/checkin', label: 'Check-in', icon: CalendarIcon, id: 'sidebar-link-checkin' },
      { href: '/parent/agenda', label: 'Agenda', icon: CalendarIcon, id: 'sidebar-link-agenda' },
    ],
  },
  {
    label: 'FINANCEIRO',
    items: [
      { href: '/parent/pagamentos', label: 'Pagamentos', icon: DollarIcon, id: 'sidebar-link-pagamentos' },
    ],
  },
  {
    label: 'COMUNICACAO',
    items: [
      { href: '/parent/mensagens', label: 'Mensagens', icon: MessageIcon, id: 'sidebar-link-mensagens' },
      { href: '/parent/notificacoes', label: 'Notificações', icon: BellIcon, id: 'sidebar-link-notificacoes' },
    ],
  },
  {
    label: 'ACOMPANHAMENTO',
    items: [
      { href: '/parent/relatorios', label: 'Relatórios', icon: BarChartIcon, id: 'sidebar-link-relatorios' },
      { href: '/parent/autorizacoes', label: 'Autorizações', icon: ShieldIcon, id: 'sidebar-link-autorizacoes' },
    ],
  },
  {
    label: 'CONTA',
    items: [
      { href: '/parent/perfil', label: 'Perfil', icon: UserIcon, id: 'sidebar-link-perfil' },
      { href: '/parent/configuracoes', label: 'Configurações', icon: SettingsIcon, id: 'sidebar-link-configuracoes' },
    ],
  },
];

const mobileNavItems: NavItem[] = [
  { href: '/parent', label: 'Início', icon: <HomeIcon className="h-5 w-5" />, id: 'nav-home' },
  { href: '/parent/presencas', label: 'Presenças', icon: <CheckSquareIcon className="h-5 w-5" />, id: 'nav-presencas' },
  { href: '/parent/mensagens', label: 'Mensagens', icon: <MessageIcon className="h-5 w-5" />, id: 'nav-mensagens' },
  { href: '/parent/pagamentos', label: 'Pagamentos', icon: <DollarIcon className="h-5 w-5" />, id: 'nav-pagamentos' },
  { href: '/parent/perfil', label: 'Perfil', icon: <UserIcon className="h-5 w-5" />, id: 'nav-perfil' },
];

const ParentShell = forwardRef<HTMLDivElement, ParentShellProps>(
  function ParentShell({ children }, ref) {
    const pathname = usePathname();
    const { profile, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const userMenuRef = useRef<HTMLDivElement>(null);
    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

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

    const userName = profile?.display_name ?? 'Responsável';

    function renderSidebarNav(onItemClick?: () => void) {
      return (
        <>
          {sidebarGroups.map((group, gi) => (
            <div key={group.label}>
              <p
                className="uppercase tracking-widest font-semibold"
                style={{
                  fontSize: '10px',
                  color: 'var(--bb-ink-30)',
                  marginBottom: '4px',
                  marginTop: gi === 0 ? '0' : '16px',
                  paddingLeft: '16px',
                }}
              >
                {group.label}
              </p>
              <div className="flex flex-col gap-[2px]">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/parent' && pathname.startsWith(item.href + '/'));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      id={item.id}
                      onClick={onItemClick}
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
              </div>
            </div>
          ))}
        </>
      );
    }

    return (
      <div ref={ref} className="flex min-h-screen flex-col" style={{ background: 'var(--bb-depth-1)' }}>
        <div className="flex flex-1">
          {/* Sidebar - desktop */}
          <aside
            data-tour="sidebar"
            className="hidden lg:flex lg:w-64 lg:flex-col lg:sticky lg:top-0 lg:h-screen lg:shrink-0"
            style={{
              background: 'var(--bb-depth-2)',
              borderRight: '1px solid var(--bb-glass-border)',
            }}
          >
            <div
              className="flex h-14 flex-col justify-center px-6"
              style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
            >
              <BlackBeltLogo variant="navbar" mode="dark" height={28} />
              <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                Responsável
              </span>
            </div>
            <nav aria-label="Menu principal" className="flex-1 overflow-y-auto p-3">
              {renderSidebarNav()}
              <SidebarHelpSection variant="student" />
              <SidebarFeedback />
            </nav>
          </aside>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="fixed inset-0 bg-black/50" role="button" aria-label="Fechar menu" tabIndex={0} onClick={() => setSidebarOpen(false)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSidebarOpen(false); }} />
              <aside
                className="fixed left-0 top-0 bottom-0 w-64 shadow-xl"
                style={{ background: 'var(--bb-depth-2)' }}
              >
                <div
                  className="flex h-14 flex-col justify-center px-6"
                  style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                >
                  <BlackBeltLogo variant="navbar" mode="dark" height={28} />
                  <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    Responsável
                  </span>
                </div>
                <nav aria-label="Menu principal" className="overflow-y-auto p-3">
                  {renderSidebarNav(() => setSidebarOpen(false))}
                  <SidebarHelpSection variant="student" onItemClick={() => setSidebarOpen(false)} />
                  <SidebarFeedback />
                </nav>
              </aside>
            </div>
          )}

          {/* Main content */}
          <div className="flex flex-1 flex-col min-w-0">
            <header
              className="sticky top-0 z-20 flex h-14 items-center justify-between px-4"
              style={{
                background: 'var(--bb-depth-2)',
                borderBottom: '1px solid var(--bb-glass-border)',
                paddingTop: 'var(--safe-area-top)',
              }}
            >
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Abrir menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--bb-ink-60)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <span className="text-lg font-bold lg:hidden" style={{ color: 'var(--bb-ink-100)' }}>
                  BlackBelt
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex h-9 w-9 items-center justify-center transition-colors"
                  style={{ color: 'var(--bb-ink-60)' }}
                  aria-label="Buscar"
                >
                  <SearchIcon className="h-5 w-5" />
                </button>
                <HeaderHelpButton variant="student" />
                <ThemeToggle />
                <NotificationBell />

                {/* User Menu */}
                <div className="relative">
                  <button
                    ref={userMenuButtonRef}
                    data-tour="profile-menu"
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    aria-label="Menu do usuário"
                    className="flex h-9 w-9 items-center justify-center cursor-pointer"
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
                      <div
                        className="px-4 py-3"
                        style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                      >
                        <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                          {userName}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                          Responsável
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/parent/perfil"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bb-depth-4)]"
                          style={{ color: 'var(--bb-ink-80)' }}
                        >
                          <UserIcon className="h-4 w-4" />
                          Meu perfil
                        </Link>
                        <Link
                          href="/parent/configuracoes"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bb-depth-4)]"
                          style={{ color: 'var(--bb-ink-80)' }}
                        >
                          <SettingsIcon className="h-4 w-4" />
                          Configurações
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
                          style={{ color: 'var(--bb-danger, var(--bb-brand))' }}
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
            <div className="flex-1" style={{ background: 'var(--bb-depth-1)' }}>
              <main className="pb-20 lg:pb-0">{children}</main>
              <LegalFooter />
            </div>
          </div>
        </div>

        {/* Bottom Nav - mobile only */}
        <div className="lg:hidden">
          <BottomNav items={mobileNavItems} />
        </div>

        {/* Tour overlay — auto-triggers on first access */}
        <TourIntegration />

        {/* Command Palette */}
        <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} hideToggle />
      </div>
    );
  },
);

ParentShell.displayName = 'ParentShell';

export { ParentShell };
