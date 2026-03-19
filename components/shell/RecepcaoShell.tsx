'use client';

import { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { BottomNav } from './BottomNav';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { HeaderHelpButton } from './HelpSection';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  HomeIcon,
  SearchIcon,
  UserPlusIcon,
  CreditCardIcon,
  MenuIcon,
  BellIcon,
  LogOutIcon,
  CalendarCheckIcon,
  AlertTriangleIcon,
  CheckSquareIcon,
  UserIcon,
  UsersIcon,
} from './icons';
import { ProfileSwitcher } from '@/components/shared/ProfileSwitcher';
import type { NavItem } from './BottomNav';

interface RecepcaoShellProps {
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/recepcao', label: 'Painel', icon: <HomeIcon className="h-5 w-5" />, id: 'sidebar-link-painel' },
  { href: '/recepcao/atendimento', label: 'Buscar', icon: <SearchIcon className="h-5 w-5" />, id: 'sidebar-link-atendimento' },
  { href: '/recepcao/cadastro', label: 'Cadastro', icon: <UserPlusIcon className="h-5 w-5" />, id: 'sidebar-link-cadastro' },
  { href: '/recepcao/caixa', label: 'Caixa', icon: <CreditCardIcon className="h-5 w-5" />, id: 'sidebar-link-caixa' },
  { href: '/recepcao/mensagens', label: 'Mais', icon: <MenuIcon className="h-5 w-5" />, id: 'sidebar-link-mensagens' },
];

// ── Mock notifications ──────────────────────────────────────────────────

interface Notification {
  id: string;
  icon: typeof BellIcon;
  text: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', icon: AlertTriangleIcon, text: 'Pagamento vencido: João Mendes — R$179', time: 'Há 5 min', read: false },
  { id: '2', icon: CalendarCheckIcon, text: 'Aula experimental confirmada: Maria Clara, 18h', time: 'Há 30 min', read: false },
  { id: '3', icon: CheckSquareIcon, text: 'Check-in registrado: Lucas Ferreira', time: 'Há 1h', read: true },
];

const RecepcaoShell = forwardRef<HTMLDivElement, RecepcaoShellProps>(
  function RecepcaoShell({ children }, ref) {
    const { profile, logout } = useAuth();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [currentTime, setCurrentTime] = useState('');

    const notifRef = useRef<HTMLDivElement>(null);
    const notifButtonRef = useRef<HTMLButtonElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

    const userName = profile?.display_name ?? 'Recepcionista';
    const unreadCount = notifications.filter((n) => !n.read).length;

    // ── Clock ───────────────────────────────────────────────────────────

    useEffect(() => {
      function updateClock() {
        const now = new Date();
        setCurrentTime(
          now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        );
      }
      updateClock();
      const interval = setInterval(updateClock, 30_000);
      return () => clearInterval(interval);
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
            {/* Academy name + clock */}
            <div className="flex items-center gap-3">
              <h1
                className="text-base font-bold"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                Guerreiros do Tatame
              </h1>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  background: '#10b981',
                  color: '#fff',
                }}
              >
                {currentTime}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <HeaderHelpButton />
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
                      style={{ background: '#10b981' }}
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
                          style={{ color: '#10b981' }}
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
                              <Icon className="h-4 w-4" style={{ color: '#10b981' }} />
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
                                style={{ background: '#10b981' }}
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
                        Recepcionista
                      </p>
                    </div>

                    {/* Profile link */}
                    <div style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                      <Link
                        href="/recepcao"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: 'var(--bb-ink-80)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <UserIcon className="h-4 w-4" />
                        Meu Painel
                      </Link>
                    </div>

                    {/* Profile Switcher */}
                    <ProfileSwitcher onSwitch={() => setUserMenuOpen(false)} />

                    {/* Switch Account + Logout */}
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
          </div>
        </header>
        <main>{children}</main>
        <BottomNav items={navItems} />
      </div>
    );
  },
);

RecepcaoShell.displayName = 'RecepcaoShell';

export { RecepcaoShell };
