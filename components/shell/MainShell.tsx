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
import { LegalFooter } from './LegalFooter';
import { SidebarFeedback } from '@/components/shared/SidebarFeedback';
import { BetaBadge } from '@/components/beta/BetaBadge';
import { useCartContext } from '@/lib/contexts/CartContext';
import {
  LayoutDashboardIcon,
  CalendarIcon,
  CheckSquareIcon,
  TrendingUpIcon,
  TrophyIcon,
  TargetIcon,
  BarChartIcon,
  VideoIcon,
  SwordsIcon,
  MedalIcon,
  UserPlusIcon,
  MessageIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  UserIcon,
  SettingsIcon,
  MenuIcon,
  UsersIcon,
  LogOutIcon,
  BookOpenIcon,
  ShieldIcon,
  FileTextIcon,
  EditIcon,
} from './icons';

interface MainShellProps {
  children: React.ReactNode;
}

interface SidebarGroup {
  label: string;
  items: { href: string; label: string; icon: typeof LayoutDashboardIcon }[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    label: 'PRINCIPAL',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
      { href: '/dashboard/turmas', label: 'Turmas', icon: CalendarIcon },
      { href: '/dashboard/checkin', label: 'Check-in', icon: CheckSquareIcon },
    ],
  },
  {
    label: 'MEU PROGRESSO',
    items: [
      { href: '/dashboard/progresso', label: 'Evolucao', icon: TrendingUpIcon },
      { href: '/dashboard/conquistas', label: 'Conquistas', icon: TrophyIcon },
      { href: '/metas', label: 'Metas', icon: TargetIcon },
      { href: '/dashboard/meu-progresso', label: 'Meu Treino', icon: BarChartIcon },
    ],
  },
  {
    label: 'CONTEUDO',
    items: [
      { href: '/dashboard/conteudo', label: 'Biblioteca', icon: VideoIcon },
      { href: '/academia', label: 'Academia', icon: BookOpenIcon },
      { href: '/torneios', label: 'Torneios', icon: SwordsIcon },
    ],
  },
  {
    label: 'SOCIAL',
    items: [
      { href: '/dashboard/ranking', label: 'Ranking', icon: MedalIcon },
      { href: '/indicar', label: 'Indicar', icon: UserPlusIcon },
      { href: '/dashboard/mensagens', label: 'Mensagens', icon: MessageIcon },
    ],
  },
  {
    label: 'CONTA',
    items: [
      { href: '/carteirinha', label: 'Carteirinha', icon: CreditCardIcon },
      { href: '/loja', label: 'Loja', icon: ShoppingBagIcon },
      { href: '/dashboard/saude', label: 'Saude', icon: ShieldIcon },
      { href: '/dashboard/conduta', label: 'Conduta', icon: FileTextIcon },
      { href: '/dashboard/contrato', label: 'Contrato', icon: EditIcon },
      { href: '/perfil', label: 'Perfil', icon: UserIcon },
      { href: '/dashboard/configuracoes', label: 'Configuracoes', icon: SettingsIcon },
    ],
  },
];

const bottomNavItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboardIcon },
  { href: '/dashboard/turmas', label: 'Turmas', icon: CalendarIcon },
  { href: '/dashboard/checkin', label: 'Check-in', icon: CheckSquareIcon },
  { href: '/dashboard/progresso', label: 'Progresso', icon: TrendingUpIcon },
];

const MainShell = forwardRef<HTMLDivElement, MainShellProps>(
  function MainShell({ children }, ref) {
    const pathname = usePathname();
    const { profile, logout } = useAuth();
    const { cartCount } = useCartContext();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const userMenuRef = useRef<HTMLDivElement>(null);
    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

    const userName = profile?.display_name ?? 'Aluno';

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
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
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
              <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Aluno</span>
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
                  <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Aluno</span>
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
              </div>
              <div className="flex items-center gap-3">
                <HeaderHelpButton />
                <BetaBadge />
                <Link href="/carrinho" className="relative flex items-center justify-center h-9 w-9" aria-label="Carrinho">
                  <ShoppingBagIcon className="h-5 w-5" style={{ color: 'var(--bb-ink-60)' }} />
                  {cartCount > 0 && (
                    <span
                      className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: '#EF4444' }}
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
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
                        <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Aluno</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/perfil"
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
                          href="/dashboard/configuracoes"
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
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
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

MainShell.displayName = 'MainShell';

export { MainShell };
