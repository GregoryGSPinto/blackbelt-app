'use client';

import { forwardRef, useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { BlackBeltLogo } from '@/components/brand/BlackBeltLogo';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/hooks/useAuth';
import { ProfileSwitcher } from '@/components/shared/ProfileSwitcher';

import { SidebarHelpSection } from './HelpSection';
import { SidebarFeedback } from '@/components/shared/SidebarFeedback';
import { LegalFooter } from './LegalFooter';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { usePlan } from '@/lib/hooks/usePlan';
import { TourIntegration } from '@/components/tour/TourIntegration';
import { PAGE_MODULE_MAP } from '@/lib/plans/module-access';
import { TrialBanner } from '@/components/plans/TrialBanner';
import { DiscoveryBanner } from '@/components/plans/DiscoveryBanner';
import { BetaBadge } from '@/components/beta/BetaBadge';
import {
  HomeIcon,
  PlayIcon,
  UsersIcon,
  CalendarIcon,
  MoreHorizontalIcon,
  BookOpenIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  BookMarkedIcon,
  BarChartIcon,
  MessageIcon,
  VideoIcon,
  UserIcon,
  SettingsIcon,
  GraduationCapIcon,
  HelpCircleIcon,
  XIcon,
  LogOutIcon,
  LockIcon,
  SearchIcon,
} from '@/components/shell/icons';

// ── Types ──────────────────────────────────────────────────────────────

interface ProfessorShellProps {
  children: React.ReactNode;
}

interface SidebarGroup {
  label: string;
  items: {
    id?: string;
    href: string;
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    accent?: boolean;
  }[];
}

// ── Drawer Items ───────────────────────────────────────────────────────

const drawerItems: {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}[] = [
  { href: '/professor/diario', label: 'Diario de Aulas', icon: BookOpenIcon },
  { href: '/professor/avaliacoes', label: 'Avaliacoes', icon: ClipboardCheckIcon },
  { href: '/professor/plano-aula', label: 'Plano de Aula', icon: FileTextIcon },
  { href: '/professor/tecnicas', label: 'Tecnicas', icon: BookMarkedIcon },
  { href: '/professor/duvidas', label: 'Duvidas', icon: HelpCircleIcon },
  { href: '/professor/relatorios', label: 'Relatorios', icon: BarChartIcon },
  { href: '/professor/calendario', label: 'Calendario', icon: CalendarIcon },
  { href: '/professor/mensagens', label: 'Mensagens', icon: MessageIcon },
  { href: '/professor/conteudo', label: 'Conteudo', icon: VideoIcon },
  { href: '/professor/video-aulas', label: 'Video-Aulas', icon: VideoIcon },
  { href: '/professor/perfil', label: 'Perfil', icon: UserIcon },
  { href: '/professor/configuracoes', label: 'Configuracoes', icon: SettingsIcon },
];

// ── Sidebar Groups (Desktop) ───────────────────────────────────────────

const sidebarGroups: SidebarGroup[] = [
  {
    label: 'ENSINO',
    items: [
      { id: 'sidebar-link-dashboard-prof', href: '/professor', label: 'Dashboard', icon: HomeIcon },
      { id: 'sidebar-link-turma-ativa', href: '/professor/turma-ativa', label: 'Modo Aula', icon: PlayIcon, accent: true },
      { id: 'sidebar-link-turmas-prof', href: '/professor/turmas', label: 'Turmas', icon: UsersIcon },
      { id: 'sidebar-link-calendario-prof', href: '/professor/calendario', label: 'Calendario', icon: CalendarIcon },
    ],
  },
  {
    label: 'PEDAGOGICO',
    items: [
      { id: 'sidebar-link-alunos', href: '/professor/alunos', label: 'Alunos', icon: GraduationCapIcon },
      { id: 'sidebar-link-avaliacoes', href: '/professor/avaliacoes', label: 'Avaliacoes', icon: ClipboardCheckIcon },
      { id: 'sidebar-link-diario', href: '/professor/diario', label: 'Diario de Aulas', icon: BookOpenIcon },
      { id: 'sidebar-link-tecnicas', href: '/professor/tecnicas', label: 'Tecnicas', icon: BookMarkedIcon },
      { id: 'sidebar-link-duvidas', href: '/professor/duvidas', label: 'Duvidas', icon: HelpCircleIcon },
    ],
  },
  {
    label: 'PLANEJAMENTO',
    items: [
      { id: 'sidebar-link-plano-aula', href: '/professor/plano-aula', label: 'Plano de Aula', icon: FileTextIcon },
      { id: 'sidebar-link-relatorios-prof', href: '/professor/relatorios', label: 'Relatorios', icon: BarChartIcon },
    ],
  },
  {
    label: 'COMUNICACAO',
    items: [
      { id: 'sidebar-link-mensagens', href: '/professor/mensagens', label: 'Mensagens', icon: MessageIcon },
      { id: 'sidebar-link-conteudo-prof', href: '/professor/conteudo', label: 'Conteudo', icon: VideoIcon },
      { id: 'sidebar-link-video-aulas', href: '/professor/video-aulas', label: 'Video-Aulas', icon: VideoIcon },
    ],
  },
  {
    label: 'CONTA',
    items: [
      { id: 'sidebar-link-perfil-prof', href: '/professor/perfil', label: 'Perfil', icon: UserIcon },
      { id: 'sidebar-link-configuracoes-prof', href: '/professor/configuracoes', label: 'Configuracoes', icon: SettingsIcon },
    ],
  },
];

// ── Bottom Nav Items (Mobile) ──────────────────────────────────────────

const bottomNavItems: {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  accent?: boolean;
}[] = [
  { href: '/professor', label: 'Inicio', icon: HomeIcon },
  { href: '/professor/turmas', label: 'Turmas', icon: CalendarIcon },
  { href: '/professor/turma-ativa', label: 'Aula', icon: PlayIcon, accent: true },
  { href: '/professor/alunos', label: 'Alunos', icon: UsersIcon },
];

// ── Helpers ────────────────────────────────────────────────────────────

function isActive(pathname: string, href: string): boolean {
  if (href === '/professor') return pathname === '/professor';
  return pathname.startsWith(href);
}

// ── Component ──────────────────────────────────────────────────────────

const ProfessorShell = forwardRef<HTMLDivElement, ProfessorShellProps>(
  function ProfessorShell({ children }, ref) {
    const pathname = usePathname();
    const { profile, logout } = useAuth();
    const { hasAccess, isTrial, isDiscovery, trialDaysLeft, discoveryDaysLeft } = usePlan();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

    const userName = profile?.display_name ?? 'Professor';

    // Close drawer on route change
    useEffect(() => {
      setDrawerOpen(false);
    }, [pathname]);

    // Lock body scroll when drawer is open
    useEffect(() => {
      if (drawerOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return () => {
        document.body.style.overflow = '';
      };
    }, [drawerOpen]);

    // Close user menu on click outside
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

    const handleDrawerLinkClick = useCallback(() => {
      setDrawerOpen(false);
    }, []);

    // ── Sidebar nav renderer ──────────────────────────────────────────

    function renderSidebarNav(onItemClick?: () => void) {
      return sidebarGroups.map((group, gi) => (
        <div key={group.label} className={gi > 0 ? 'mt-5' : ''}>
          <p
            className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            {group.label}
          </p>
          {gi > 0 && (
            <div
              className="-mt-2 mb-2 mx-3"
              style={{ borderTop: '1px solid var(--bb-glass-border)' }}
            />
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;

              if (item.accent) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    id={item.id}
                    onClick={onItemClick}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors"
                    style={{
                      background: active
                        ? 'var(--bb-brand)'
                        : 'color-mix(in srgb, var(--bb-brand) 15%, transparent)',
                      color: active ? 'var(--bb-depth-1)' : 'var(--bb-brand)',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background =
                          'color-mix(in srgb, var(--bb-brand) 25%, transparent)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background =
                          'color-mix(in srgb, var(--bb-brand) 15%, transparent)';
                      }
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              }

              const moduleForLink = PAGE_MODULE_MAP[item.href];
              const isLocked = moduleForLink ? !hasAccess(moduleForLink) : false;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  id={item.id}
                  onClick={onItemClick}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    opacity: isLocked ? 0.5 : 1,
                    background: active
                      ? 'color-mix(in srgb, var(--bb-brand) 12%, transparent)'
                      : 'transparent',
                    color: active ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                    borderLeft: active
                      ? '3px solid var(--bb-brand)'
                      : '3px solid transparent',
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
                  {isLocked && <LockIcon className="h-3.5 w-3.5" style={{ color: 'var(--bb-ink-40)' }} />}
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
            data-tour="sidebar"
            className="hidden lg:flex lg:w-64 lg:flex-col lg:sticky lg:top-0 lg:h-screen lg:shrink-0"
            style={{
              background: 'var(--bb-depth-2)',
              borderRight: '1px solid var(--bb-glass-border)',
            }}
          >
            {/* Logo */}
            <div
              className="flex h-14 flex-col justify-center px-6"
              style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
            >
              <BlackBeltLogo variant="navbar" mode="dark" height={28} />
              <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                Professor
              </span>
            </div>

            {/* Nav Groups */}
            <nav aria-label="Menu principal" className="flex-1 overflow-y-auto px-3 py-4">
              {renderSidebarNav()}
              <SidebarHelpSection />
              <SidebarFeedback />
            </nav>
          </aside>

          {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="fixed inset-0 bg-black/50" role="button" aria-label="Fechar menu" tabIndex={0} onClick={() => setSidebarOpen(false)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSidebarOpen(false); }} />
              <aside className="fixed left-0 top-0 bottom-0 w-64 shadow-xl" style={{ background: 'var(--bb-depth-2)' }}>
                <div
                  className="flex h-14 flex-col justify-center px-6"
                  style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                >
                  <BlackBeltLogo variant="navbar" mode="dark" height={28} />
                  <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Professor</span>
                </div>
                <nav aria-label="Menu principal" className="overflow-y-auto px-3 py-4">
                  {renderSidebarNav(() => setSidebarOpen(false))}
                  <SidebarHelpSection onItemClick={() => setSidebarOpen(false)} />
                  <SidebarFeedback />
                </nav>
              </aside>
            </div>
          )}

          {/* ═══ MAIN CONTENT ═══ */}
          <div className="flex flex-1 flex-col">
            {/* Header */}
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
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex h-9 w-9 items-center justify-center transition-colors"
                  style={{ color: 'var(--bb-ink-60)' }}
                  aria-label="Buscar"
                >
                  <SearchIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <BetaBadge />
                <ThemeToggle />
                <NotificationBell />

                {/* User Menu */}
                <div className="relative">
                  <button
                    ref={userMenuButtonRef}
                    data-tour="profile-menu"
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
                        <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Professor</p>
                      </div>

                      <div style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                        <Link
                          href="/professor/perfil"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                          style={{ color: 'var(--bb-ink-80)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <UserIcon className="h-4 w-4" />
                          Meu Perfil
                        </Link>
                        <Link
                          href="/professor/configuracoes"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                          style={{ color: 'var(--bb-ink-80)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
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
              {isTrial && <TrialBanner daysLeft={trialDaysLeft} />}
              {isDiscovery && <DiscoveryBanner daysLeft={discoveryDaysLeft} variant="member" />}
              <main className="pb-20 lg:pb-6">{children}</main>
              <LegalFooter />
            </div>
          </div>
        </div>

        {/* ═══ BOTTOM NAV MOBILE ═══ */}
        <nav
          aria-label="Navegacao principal"
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
              const active = isActive(pathname, item.href);
              const Icon = item.icon;

              if (item.accent) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-all"
                    style={{ color: active ? 'var(--bb-depth-1)' : 'var(--bb-brand)' }}
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full -mt-3"
                      style={{
                        background: 'var(--bb-brand)',
                        boxShadow: 'var(--bb-shadow-lg)',
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: 'var(--bb-depth-1)' }} />
                    </span>
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: active ? 'var(--bb-brand)' : 'var(--bb-ink-60)' }}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-all"
                  style={{
                    color: active ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                    transform: active ? 'translateY(-2px)' : 'translateY(0)',
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {active && (
                    <span
                      className="absolute bottom-0 rounded-full"
                      style={{
                        width: '4px',
                        height: '4px',
                        background: 'var(--bb-brand)',
                      }}
                    />
                  )}
                </Link>
              );
            })}

            {/* 5th item: "Mais" button */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu completo"
              className="relative flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-all"
              style={{ color: drawerOpen ? 'var(--bb-brand)' : 'var(--bb-ink-60)' }}
            >
              <MoreHorizontalIcon className="h-5 w-5" />
              <span>Mais</span>
            </button>
          </div>
        </nav>

        {/* ── DRAWER "MAIS" (mobile) ─────────────────────────────────── */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            role="button"
            aria-label="Fechar menu"
            tabIndex={0}
            onClick={() => setDrawerOpen(false)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDrawerOpen(false); }}
          />
        )}

        <div
          className="fixed left-0 right-0 bottom-0 z-50 overflow-hidden transition-transform duration-300 ease-out lg:hidden"
          style={{
            background: 'var(--bb-depth-2)',
            borderTopLeftRadius: 'var(--bb-radius-lg)',
            borderTopRightRadius: 'var(--bb-radius-lg)',
            boxShadow: drawerOpen ? 'var(--bb-shadow-lg)' : 'none',
            transform: drawerOpen ? 'translateY(0)' : 'translateY(100%)',
            maxHeight: '80vh',
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
          >
            <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Mais opcoes
            </span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              style={{ color: 'var(--bb-ink-60)', background: 'var(--bb-depth-3)' }}
              aria-label="Fechar menu"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-y-auto px-3 py-3" style={{ maxHeight: 'calc(80vh - 64px)' }}>
            <div className="grid grid-cols-3 gap-2">
              {drawerItems.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleDrawerLinkClick}
                    className="flex flex-col items-center gap-2 rounded-xl px-2 py-4 text-center transition-colors"
                    style={{
                      background: active
                        ? 'color-mix(in srgb, var(--bb-brand) 12%, transparent)'
                        : 'var(--bb-depth-3)',
                      color: active ? 'var(--bb-brand)' : 'var(--bb-ink-80)',
                    }}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{
                        background: active
                          ? 'color-mix(in srgb, var(--bb-brand) 20%, transparent)'
                          : 'var(--bb-depth-4)',
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Command Palette (Search) */}
        <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} hideToggle />

        {/* Tour overlay — auto-triggers on first access */}
        <TourIntegration />
      </div>
    );
  },
);

ProfessorShell.displayName = 'ProfessorShell';

export { ProfessorShell };
