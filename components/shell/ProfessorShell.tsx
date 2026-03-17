'use client';

import { forwardRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShellHeader } from './ShellHeader';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/hooks/useAuth';
import { getAlertasCount } from '@/lib/api/professor-alertas.service';
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
  XIcon,
  BellIcon,
} from '@/components/shell/icons';

// ── Types ──────────────────────────────────────────────────────────────

interface ProfessorShellProps {
  children: React.ReactNode;
}

interface SidebarGroup {
  label: string;
  items: {
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
  { href: '/professor/relatorios', label: 'Relatorios', icon: BarChartIcon },
  { href: '/professor/calendario', label: 'Calendario', icon: CalendarIcon },
  { href: '/professor/mensagens', label: 'Mensagens', icon: MessageIcon },
  { href: '/professor/conteudo', label: 'Conteudo', icon: VideoIcon },
  { href: '/professor/perfil', label: 'Perfil', icon: UserIcon },
  { href: '/professor/configuracoes', label: 'Configuracoes', icon: SettingsIcon },
];

// ── Sidebar Groups (Desktop) ───────────────────────────────────────────

const sidebarGroups: SidebarGroup[] = [
  {
    label: 'ENSINO',
    items: [
      { href: '/professor', label: 'Dashboard', icon: HomeIcon },
      { href: '/professor/turma-ativa', label: 'Modo Aula', icon: PlayIcon, accent: true },
      { href: '/professor/turmas', label: 'Turmas', icon: UsersIcon },
      { href: '/professor/calendario', label: 'Calendario', icon: CalendarIcon },
    ],
  },
  {
    label: 'PEDAGOGICO',
    items: [
      { href: '/professor/alunos', label: 'Alunos', icon: GraduationCapIcon },
      { href: '/professor/avaliacoes', label: 'Avaliacoes', icon: ClipboardCheckIcon },
      { href: '/professor/diario', label: 'Diario de Aulas', icon: BookOpenIcon },
      { href: '/professor/tecnicas', label: 'Tecnicas', icon: BookMarkedIcon },
    ],
  },
  {
    label: 'PLANEJAMENTO',
    items: [
      { href: '/professor/plano-aula', label: 'Plano de Aula', icon: FileTextIcon },
      { href: '/professor/relatorios', label: 'Relatorios', icon: BarChartIcon },
    ],
  },
  {
    label: 'COMUNICACAO',
    items: [
      { href: '/professor/mensagens', label: 'Mensagens', icon: MessageIcon },
      { href: '/professor/conteudo', label: 'Conteudo', icon: VideoIcon },
    ],
  },
  {
    label: 'CONTA',
    items: [
      { href: '/professor/perfil', label: 'Perfil', icon: UserIcon },
      { href: '/professor/configuracoes', label: 'Configuracoes', icon: SettingsIcon },
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
  { href: '/professor', label: 'Home', icon: HomeIcon },
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
    const { profile } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [alertCount, setAlertCount] = useState(0);

    const userName = profile?.display_name ?? 'Professor';

    useEffect(() => {
      getAlertasCount('prof-1').then(setAlertCount).catch(() => {});
    }, []);

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

    const handleDrawerLinkClick = useCallback(() => {
      setDrawerOpen(false);
    }, []);

    return (
      <div ref={ref} className="min-h-screen" style={{ background: 'var(--bb-depth-1)' }}>
        {/* ── DESKTOP LAYOUT (lg+) ─────────────────────────────────────── */}
        <div className="hidden lg:flex lg:min-h-screen">
          {/* Sidebar */}
          <aside
            className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col"
            style={{
              background: 'var(--bb-depth-2)',
              borderRight: '1px solid var(--bb-glass-border)',
            }}
          >
            {/* Logo */}
            <div
              className="flex h-16 items-center justify-between px-6"
              style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: 'var(--bb-brand)' }}
                >
                  <span className="text-sm font-bold text-white">B</span>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                    BlackBelt
                  </p>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--bb-brand)' }}
                  >
                    Professor
                  </p>
                </div>
              </div>

              {/* Alert bell */}
              <Link
                href="/professor/alertas"
                className="relative"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                <BellIcon className="h-5 w-5" />
                {alertCount > 0 && (
                  <span
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: 'var(--bb-brand)' }}
                  >
                    {alertCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Nav Groups */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {sidebarGroups.map((group, gi) => (
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
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors"
                            style={{
                              background: active
                                ? 'var(--bb-brand)'
                                : 'color-mix(in srgb, var(--bb-brand) 15%, transparent)',
                              color: active ? '#fff' : 'var(--bb-brand)',
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

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                          style={{
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
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Theme toggle */}
            <div
              className="mx-3 mb-2 flex items-center justify-between px-3 py-1"
            >
              <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Tema
              </span>
              <ThemeToggle />
            </div>

            {/* User card */}
            <div
              className="mx-3 mb-4 flex items-center gap-3 rounded-lg p-3"
              style={{ background: 'var(--bb-depth-3)' }}
            >
              <Avatar name={userName} size="sm" />
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium"
                  style={{ color: 'var(--bb-ink-100)' }}
                >
                  {userName}
                </p>
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--bb-brand)' }}
                >
                  Professor
                </p>
              </div>
            </div>
          </aside>

          {/* Main content (desktop) */}
          <div className="flex flex-1 flex-col lg:ml-64">
            <main className="flex-1" style={{ background: 'var(--bb-depth-1)' }}>
              {children}
            </main>
          </div>
        </div>

        {/* ── MOBILE LAYOUT (< lg) ─────────────────────────────────────── */}
        <div className="lg:hidden pb-16">
          <ShellHeader title="BlackBelt" subtitle="Professor" rightContent={<ThemeToggle />} />
          <main>{children}</main>

          {/* Custom Bottom Nav */}
          <nav
            className="fixed bottom-0 left-0 right-0 z-30 safe-area-bottom"
            style={{
              background: 'var(--bb-depth-2)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderTop: '1px solid var(--bb-glass-border)',
            }}
          >
            <div className="flex items-center justify-around py-2">
              {/* First 4 nav items as Links */}
              {bottomNavItems.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;

                if (item.accent) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-all"
                      style={{ color: active ? '#fff' : 'var(--bb-brand)' }}
                    >
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full -mt-3"
                        style={{
                          background: 'var(--bb-brand)',
                          boxShadow: 'var(--bb-shadow-lg)',
                        }}
                      >
                        <Icon className="h-5 w-5" style={{ color: '#fff' }} />
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
                className="relative flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-all"
                style={{ color: drawerOpen ? 'var(--bb-brand)' : 'var(--bb-ink-60)' }}
              >
                <MoreHorizontalIcon className="h-5 w-5" />
                <span>Mais</span>
              </button>
            </div>
          </nav>

          {/* ── DRAWER "MAIS" ─────────────────────────────────────────── */}
          {/* Backdrop */}
          {drawerOpen && (
            <div
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0, 0, 0, 0.5)' }}
              onClick={() => setDrawerOpen(false)}
            />
          )}

          {/* Drawer sheet */}
          <div
            className="fixed left-0 right-0 bottom-0 z-50 overflow-hidden transition-transform duration-300 ease-out"
            style={{
              background: 'var(--bb-depth-2)',
              borderTopLeftRadius: 'var(--bb-radius-lg)',
              borderTopRightRadius: 'var(--bb-radius-lg)',
              boxShadow: drawerOpen ? 'var(--bb-shadow-lg)' : 'none',
              transform: drawerOpen ? 'translateY(0)' : 'translateY(100%)',
              maxHeight: '80vh',
            }}
          >
            {/* Drawer header */}
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

            {/* Drawer items */}
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
        </div>
      </div>
    );
  },
);

ProfessorShell.displayName = 'ProfessorShell';

export { ProfessorShell };
