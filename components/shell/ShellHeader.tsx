'use client';

import { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/hooks/useAuth';
import { Role } from '@/lib/types';
import {
  BellIcon,
  UsersIcon,
  CalendarIcon,
  DollarIcon,
  CheckSquareIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
} from './icons';
import { ProfileSwitcher } from '@/components/shared/ProfileSwitcher';

interface ShellHeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  rightContent?: React.ReactNode;
}

// ── Mock notifications ──────────────────────────────────────────────────

interface Notification {
  id: string;
  icon: typeof UsersIcon;
  text: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', icon: CalendarIcon, text: 'Nova aula adicionada à sua turma', time: 'Há 10 min', read: false },
  { id: '2', icon: CheckSquareIcon, text: 'Presença confirmada: treino de hoje', time: 'Há 30 min', read: false },
  { id: '3', icon: UsersIcon, text: 'Mensagem do professor: "Boa aula!"', time: 'Há 1h', read: false },
  { id: '4', icon: DollarIcon, text: 'Fatura do mês disponível', time: 'Há 2h', read: true },
];

const ShellHeader = forwardRef<HTMLElement, ShellHeaderProps>(
  function ShellHeader({ title, subtitle, userName: userNameProp, rightContent }, ref) {
    const { profile, logout } = useAuth();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

    const notifRef = useRef<HTMLDivElement>(null);
    const notifButtonRef = useRef<HTMLButtonElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

    const userName = userNameProp ?? profile?.display_name ?? 'Usuário';
    const unreadCount = notifications.filter((n) => !n.read).length;

    // ── Derive profile route prefix ────────────────────────────────────

    function getProfilePrefix(): string {
      switch (profile?.role) {
        case Role.Professor: return '/professor';
        case Role.Responsavel: return '/parent';
        case Role.AlunoTeen: return '/teen';
        case Role.AlunoKids: return '/kids';
        case Role.Admin: return '/admin';
        default: return '/dashboard';
      }
    }

    function getRoleLabel(): string {
      switch (profile?.role) {
        case Role.Professor: return 'Professor';
        case Role.Responsavel: return 'Responsável';
        case Role.AlunoTeen: return 'Aluno Teen';
        case Role.AlunoKids: return 'Aluno Kids';
        case Role.Admin: return 'Administrador';
        default: return 'Aluno';
      }
    }

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

    // ── Actions ────────────────────────────────────────────────────────

    function markAllRead() {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }

    async function handleLogout() {
      setUserMenuOpen(false);
      await logout();
    }

    return (
      <header
        ref={ref}
        className="sticky top-0 z-20 px-4 py-3"
        style={{
          background: 'var(--bb-depth-2)',
          borderBottom: '1px solid var(--bb-glass-border)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{title}</h1>
            {subtitle && <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            {rightContent}

            {/* Notifications */}
            <div className="relative">
              <button
                ref={notifButtonRef}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
                aria-label="Notificações"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setUserMenuOpen(false);
                }}
                style={{ color: 'var(--bb-ink-60)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bb-ink-100)'; e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bb-ink-60)'; e.currentTarget.style.background = 'transparent'; }}
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
                  {/* User info */}
                  <div
                    className="px-4 py-3"
                    style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                  >
                    <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                      {userName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      {getRoleLabel()}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href={`${getProfilePrefix()}/perfil`}
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
                      href={`${getProfilePrefix()}/configuracoes`}
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

                  {/* Separator + Switch Account + Logout */}
                  <div style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
                    <button
                      onClick={() => { setUserMenuOpen(false); window.location.href = '/login'; }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: 'var(--bb-ink-80)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <UsersIcon className="h-4 w-4" />
                      Trocar Conta
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
    );
  },
);

ShellHeader.displayName = 'ShellHeader';

export { ShellHeader };
