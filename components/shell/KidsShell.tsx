'use client';

import { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from './BottomNav';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  HomeIcon,
  AwardIcon,
  HeartIcon,
  StarIcon,
  BellIcon,
  CalendarIcon,
  CheckSquareIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
} from './icons';
import type { NavItem } from './BottomNav';

interface KidsShellProps {
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/kids', label: 'Início', icon: <HomeIcon className="h-6 w-6" /> },
  { href: '/kids/conteudo', label: 'Aventuras', icon: <StarIcon className="h-6 w-6" /> },
  { href: '/kids/conquistas', label: 'Conquistas', icon: <AwardIcon className="h-6 w-6" /> },
  { href: '/kids/perfil', label: 'Eu', icon: <HeartIcon className="h-6 w-6" /> },
];

// ── Mock notifications ──────────────────────────────────────────────────

interface Notification {
  id: string;
  icon: typeof AwardIcon;
  text: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', icon: AwardIcon, text: 'Você ganhou uma nova conquista!', time: 'Há 10 min', read: false },
  { id: '2', icon: CalendarIcon, text: 'Aula de Judô amanhã às 14h', time: 'Há 1h', read: false },
  { id: '3', icon: CheckSquareIcon, text: 'Presença registrada! Muito bem!', time: 'Há 2h', read: true },
];

const KidsShell = forwardRef<HTMLDivElement, KidsShellProps>(
  function KidsShell({ children }, ref) {
    const router = useRouter();
    const { profile, logout } = useAuth();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

    const notifRef = useRef<HTMLDivElement>(null);
    const notifButtonRef = useRef<HTMLButtonElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

    const userName = profile?.display_name ?? 'Aluno';
    const unreadCount = notifications.filter((n) => !n.read).length;

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

    function markAllRead() {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }

    async function handleLogout() {
      setUserMenuOpen(false);
      await logout();
    }

    return (
      <div
        ref={ref}
        className="min-h-screen pb-20"
        style={{
          background: 'var(--bb-depth-2)',
          borderRadius: 'var(--bb-radius-2xl)',
        }}
      >
        <header
          className="sticky top-0 z-20 px-4 py-3 backdrop-blur-sm"
          style={{ background: 'var(--bb-depth-2)' }}
        >
          <div className="flex items-center justify-between">
            <div />
            <h1
              className="text-xl font-bold"
              style={{ color: 'var(--bb-brand)' }}
            >
              BlackBelt Kids
            </h1>
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
                        Aluno Kids
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          router.push('/kids/perfil');
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: 'var(--bb-ink-80)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--bb-depth-4)';
                          e.currentTarget.style.color = 'var(--bb-ink-100)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--bb-ink-80)';
                        }}
                      >
                        <UserIcon className="h-4 w-4" />
                        Meu perfil
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          router.push('/kids/configuracoes');
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: 'var(--bb-ink-80)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--bb-depth-4)';
                          e.currentTarget.style.color = 'var(--bb-ink-100)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--bb-ink-80)';
                        }}
                      >
                        <SettingsIcon className="h-4 w-4" />
                        Configurações
                      </button>
                    </div>

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
          </div>
        </header>
        <main>{children}</main>
        <BottomNav items={navItems} />
      </div>
    );
  },
);

KidsShell.displayName = 'KidsShell';

export { KidsShell };
