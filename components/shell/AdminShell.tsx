'use client';

import { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { useAuth } from '@/lib/hooks/useAuth';
import { getAlerts } from '@/lib/api/billing.service';
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  DollarIcon,
  BarChartIcon,
  SettingsIcon,
  SearchIcon,
  BellIcon,
  LogOutIcon,
  UserIcon,
  CheckSquareIcon,
  LinkIcon,
  StarIcon,
} from './icons';
import { ProfileSwitcher } from '@/components/shared/ProfileSwitcher';

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
  { href: '/admin/convites', label: 'Convites', icon: LinkIcon },
  { href: '/admin/plano', label: 'Meu Plano', icon: StarIcon },
];

// ── Mock notifications ──────────────────────────────────────────────────

interface Notification {
  id: string;
  icon: typeof UsersIcon;
  text: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', icon: UsersIcon, text: 'Novo aluno cadastrado: Lucas Ferreira', time: 'Há 5 min', read: false },
  { id: '2', icon: DollarIcon, text: 'Pagamento confirmado — Maria Santos', time: 'Há 20 min', read: false },
  { id: '3', icon: CalendarIcon, text: 'Turma "Jiu-Jitsu Avançado" com lotação máxima', time: 'Há 1h', read: false },
  { id: '4', icon: CheckSquareIcon, text: 'Presença registrada em massa: 28 alunos', time: 'Há 2h', read: true },
  { id: '5', icon: BarChartIcon, text: 'Relatório mensal disponível para download', time: 'Há 3h', read: true },
];

const AdminShell = forwardRef<HTMLDivElement, AdminShellProps>(
  function AdminShell({ children }, ref) {
    const pathname = usePathname();
    const { profile, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [billingAlertCount, setBillingAlertCount] = useState(0);

    const notifRef = useRef<HTMLDivElement>(null);
    const notifButtonRef = useRef<HTMLButtonElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    // ── Load billing alert count ─────────────────────────────────────
    useEffect(() => {
      getAlerts('academy-1')
        .then((alerts) => setBillingAlertCount(alerts.length))
        .catch(() => {});
    }, []);

    // ── Click outside handlers ─────────────────────────────────────────

    const handleClickOutside = useCallback((e: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target as Node) &&
        notifButtonRef.current &&
        !notifButtonRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
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

    // ── Notification actions ───────────────────────────────────────────

    function markAllRead() {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }

    // ── User menu actions ──────────────────────────────────────────────

    async function handleLogout() {
      setUserMenuOpen(false);
      await logout();
    }

    const userName = profile?.display_name ?? 'Admin';
    const userRole = profile?.role ?? 'admin';

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
              const showBadge = item.href === '/admin/plano' && billingAlertCount > 0;
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
                  {showBadge && (
                    <span
                      className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: '#F59E0B' }}
                    >
                      {billingAlertCount}
                    </span>
                  )}
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
                  const showBadge = item.href === '/admin/plano' && billingAlertCount > 0;
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
                      {showBadge && (
                        <span
                          className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{ background: '#F59E0B' }}
                        >
                          {billingAlertCount}
                        </span>
                      )}
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
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Buscar (Cmd+K)"
                className="transition-colors"
                style={{ color: 'var(--bb-ink-60)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bb-ink-100)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bb-ink-60)'; }}
              >
                <SearchIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />

              {/* Notifications */}
              <div className="relative">
                <button
                  ref={notifButtonRef}
                  className="relative transition-colors"
                  aria-label="Notificações"
                  onClick={() => {
                    setNotificationsOpen((prev) => !prev);
                    setUserMenuOpen(false);
                  }}
                  style={{ color: 'var(--bb-ink-60)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bb-ink-100)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bb-ink-60)'; }}
                >
                  <BellIcon className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white"
                      style={{ background: 'var(--bb-brand)' }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div
                    ref={notifRef}
                    className="absolute right-0 top-full mt-2 w-80 z-50 overflow-hidden"
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
                      className="flex items-center justify-between px-4 py-3"
                      style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                    >
                      <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                        Notificações
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs transition-colors"
                          style={{ color: 'var(--bb-brand)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                        >
                          Marcar todas como lidas
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.map((notif) => {
                        const Icon = notif.icon;
                        return (
                          <div
                            key={notif.id}
                            className="flex items-start gap-3 px-4 py-3 transition-colors"
                            style={{
                              borderBottom: '1px solid var(--bb-glass-border)',
                              background: notif.read ? 'transparent' : 'var(--bb-brand-surface)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = notif.read ? 'transparent' : 'var(--bb-brand-surface)';
                            }}
                          >
                            <div
                              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                              style={{ background: 'var(--bb-depth-4)' }}
                            >
                              <Icon className="h-4 w-4" style={{ color: 'var(--bb-brand)' }} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm leading-snug" style={{ color: 'var(--bb-ink-100)' }}>
                                {notif.text}
                              </p>
                              <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                                {notif.time}
                              </p>
                            </div>
                            {!notif.read && (
                              <div
                                className="mt-2 h-2 w-2 shrink-0 rounded-full"
                                style={{ background: 'var(--bb-brand)' }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  ref={userMenuButtonRef}
                  onClick={() => {
                    setUserMenuOpen((prev) => !prev);
                    setNotificationsOpen(false);
                  }}
                  aria-label="Menu do usuário"
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
                    {/* User info */}
                    <div
                      className="px-4 py-3"
                      style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                    >
                      <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                        {userName}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        {profile?.role === 'admin' ? 'Administrador' : userRole}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href="/admin/perfil"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bb-depth-4)]"
                        style={{ color: 'var(--bb-ink-80)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--bb-ink-100)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--bb-ink-80)';
                        }}
                      >
                        <UserIcon className="h-4 w-4" />
                        Meu perfil
                      </Link>
                      <Link
                        href="/admin/plano"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bb-depth-4)]"
                        style={{ color: 'var(--bb-ink-80)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--bb-ink-100)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--bb-ink-80)';
                        }}
                      >
                        <StarIcon className="h-4 w-4" />
                        Meu Plano
                      </Link>
                      <Link
                        href="/admin/configuracoes"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bb-depth-4)]"
                        style={{ color: 'var(--bb-ink-80)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--bb-ink-100)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--bb-ink-80)';
                        }}
                      >
                        <SettingsIcon className="h-4 w-4" />
                        Configurações
                      </Link>
                    </div>

                    {/* Profile Switcher */}
                    <ProfileSwitcher onSwitch={() => setUserMenuOpen(false)} />

                    {/* Separator + Logout */}
                    <div style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
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
          <main className="flex-1" style={{ background: 'var(--bb-depth-1)' }}>{children}</main>
        </div>

        {/* Command Palette (Search) */}
        <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} hideToggle />
      </div>
    );
  },
);

AdminShell.displayName = 'AdminShell';

export { AdminShell };
