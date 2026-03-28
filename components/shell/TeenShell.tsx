'use client';

import { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { BlackBeltLogo } from '@/components/brand/BlackBeltLogo';
import { usePathname } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useAuth } from '@/lib/hooks/useAuth';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { ProfileSwitcher } from '@/components/shared/ProfileSwitcher';
import { SidebarHelpSection, HeaderHelpButton } from './HelpSection';
import { SidebarFeedback } from '@/components/shared/SidebarFeedback';
import { BetaBadge } from '@/components/beta/BetaBadge';
import { LegalFooter } from './LegalFooter';
import {
  LayoutDashboardIcon,
  CalendarIcon,
  CheckSquareIcon,
  TrendingUpIcon,
  TrophyIcon,
  ZapIcon,
  StarIcon,
  VideoIcon,
  MedalIcon,
  UserIcon,
  SettingsIcon,
  MenuIcon,
  MessageIcon,
  UsersIcon,
  LogOutIcon,
} from './icons';

interface TeenShellProps {
  children: React.ReactNode;
}

interface SidebarGroup {
  label: string;
  items: { href: string; label: string; icon: typeof LayoutDashboardIcon }[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    label: 'ARENA',
    items: [
      { href: '/teen', label: 'Dashboard', icon: LayoutDashboardIcon },
      { href: '/teen/turmas', label: 'Turmas', icon: CalendarIcon },
      { href: '/teen/checkin', label: 'Check-in', icon: CheckSquareIcon },
    ],
  },
  {
    label: 'EVOLUCAO',
    items: [
      { href: '/teen/ranking', label: 'Ranking', icon: MedalIcon },
      { href: '/teen/conquistas', label: 'Conquistas', icon: TrophyIcon },
      { href: '/teen/desafios', label: 'Desafios', icon: ZapIcon },
      { href: '/teen/season', label: 'Season Pass', icon: StarIcon },
    ],
  },
  {
    label: 'CONTEUDO',
    items: [
      { href: '/teen/conteudo', label: 'Videos', icon: VideoIcon },
      { href: '/teen/academia', label: 'Academia', icon: TrendingUpIcon },
    ],
  },
  {
    label: 'SOCIAL',
    items: [
      { href: '/teen/mensagens', label: 'Mensagens', icon: MessageIcon },
    ],
  },
  {
    label: 'CONTA',
    items: [
      { href: '/teen/perfil', label: 'Perfil', icon: UserIcon },
      { href: '/teen/configuracoes', label: 'Configuracoes', icon: SettingsIcon },
    ],
  },
];

const bottomNavItems = [
  { href: '/teen', label: 'Arena', icon: LayoutDashboardIcon },
  { href: '/teen/ranking', label: 'Ranking', icon: MedalIcon },
  { href: '/teen/checkin', label: 'Check-in', icon: CheckSquareIcon },
  { href: '/teen/conquistas', label: 'Conquistas', icon: TrophyIcon },
];

const TeenShell = forwardRef<HTMLDivElement, TeenShellProps>(
  function TeenShell({ children }, ref) {
    const pathname = usePathname();
    const { profile, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const userMenuRef = useRef<HTMLDivElement>(null);
    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

    const userName = profile?.display_name ?? 'Teen';

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

    function renderSidebarNav(onItemClick?: () => void) {
      return sidebarGroups.map((group, gi) => (
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
              const isActive = pathname === item.href || (item.href !== '/teen' && pathname.startsWith(item.href + '/'));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className="flex items-center gap-3 text-sm transition-colors"
                  style={{
                    padding: '10px 16px',
                    borderRadius: 'var(--bb-radius-sm)',
                    ...(isActive
                      ? { background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)', fontWeight: 600 }
                      : { color: 'var(--bb-ink-60)' }),
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
      ));
    }

    return (
      <div ref={ref} className="flex min-h-screen flex-col" style={{ background: 'var(--bb-depth-1)' }}>
        <div className="flex flex-1">
          {/* ═══ SIDEBAR DESKTOP ═══ */}
          <aside
            className="hidden lg:flex lg:w-64 lg:flex-col"
            style={{ background: 'var(--bb-depth-2)', borderRight: '1px solid var(--bb-glass-border)' }}
          >
            <div
              className="flex h-14 flex-col justify-center px-6"
              style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
            >
              <BlackBeltLogo variant="navbar" mode="dark" height={28} />
              <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Teen</span>
            </div>
            {/* XP Bar in sidebar */}
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                <span className="font-bold" style={{ color: 'var(--bb-ink-100)' }}>Level 7</span>
                <span>2.450 / 3.000 XP</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-4)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: '81.7%', background: 'linear-gradient(to right, var(--bb-brand), var(--bb-warning))' }}
                />
              </div>
            </div>
            <nav aria-label="Menu principal" className="flex-1 overflow-y-auto p-3">
              {renderSidebarNav()}
              <SidebarHelpSection />
              <SidebarFeedback />
            </nav>
          </aside>

          {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
              <aside className="fixed left-0 top-0 bottom-0 w-64 shadow-xl" style={{ background: 'var(--bb-depth-2)' }}>
                <div
                  className="flex h-14 flex-col justify-center px-6"
                  style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                >
                  <BlackBeltLogo variant="navbar" mode="dark" height={28} />
                  <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Teen</span>
                </div>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    <span className="font-bold" style={{ color: 'var(--bb-ink-100)' }}>Level 7</span>
                    <span>2.450 / 3.000 XP</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-4)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: '81.7%', background: 'linear-gradient(to right, var(--bb-brand), var(--bb-warning))' }}
                    />
                  </div>
                </div>
                <nav aria-label="Menu principal" className="overflow-y-auto p-3">
                  {renderSidebarNav(() => setSidebarOpen(false))}
                  <SidebarHelpSection onItemClick={() => setSidebarOpen(false)} />
                  <SidebarFeedback />
                </nav>
              </aside>
            </div>
          )}

          {/* ═══ MAIN CONTENT ═══ */}
          <div className="flex flex-1 flex-col">
            <header
              className="sticky top-0 z-20 flex h-14 items-center justify-between px-4"
              style={{ background: 'var(--bb-depth-2)', borderBottom: '1px solid var(--bb-glass-border)', paddingTop: 'var(--safe-area-top)' }}
            >
              <div className="flex items-center gap-3">
                <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--bb-ink-60)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                {/* Mobile XP bar */}
                <div className="lg:hidden flex items-center gap-2 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  <span className="font-bold" style={{ color: 'var(--bb-ink-100)' }}>Lv7</span>
                  <div className="h-2 w-20 overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-4)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: '81.7%', background: 'linear-gradient(to right, var(--bb-brand), var(--bb-warning))' }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HeaderHelpButton />
                <BetaBadge />
                <ThemeToggle />
                <NotificationBell />
                <div className="relative">
                  <button
                    ref={userMenuButtonRef}
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    aria-label="Menu do usuario"
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
                      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                        <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{userName}</p>
                        <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Aluno Teen</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/teen/perfil"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                          style={{ color: 'var(--bb-ink-80)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; e.currentTarget.style.color = 'var(--bb-ink-100)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--bb-ink-80)'; }}
                        >
                          <UserIcon className="h-4 w-4" />
                          Meu perfil
                        </Link>
                        <Link
                          href="/teen/configuracoes"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                          style={{ color: 'var(--bb-ink-80)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; e.currentTarget.style.color = 'var(--bb-ink-100)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--bb-ink-80)'; }}
                        >
                          <SettingsIcon className="h-4 w-4" />
                          Configuracoes
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
              <main className="pb-20 lg:pb-6">{children}</main>
              <LegalFooter />
            </div>
          </div>
        </div>

        {/* ═══ BOTTOM NAV MOBILE ═══ */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30"
          style={{
            background: 'var(--bb-depth-2)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--bb-glass-border)',
            paddingBottom: 'var(--safe-area-bottom)',
          }}
        >
          <div className="flex items-center justify-around py-2">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/teen' && pathname.startsWith(item.href + '/'));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-all min-w-[48px]"
                  style={{
                    color: isActive ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-all min-w-[48px]"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              <MenuIcon className="h-5 w-5" />
              <span>Mais</span>
            </button>
          </div>
        </nav>
      </div>
    );
  },
);

TeenShell.displayName = 'TeenShell';

export { TeenShell };
