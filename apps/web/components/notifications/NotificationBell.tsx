'use client';

import {
  forwardRef,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import Link from 'next/link';
import type { InAppNotification, InAppNotificationType } from '@/lib/types/notification';
import {
  listNotifications,
  markAsRead as markAsReadService,
  markAllRead as markAllReadService,
  dismiss as dismissService,
} from '@/lib/api/in-app-notification.service';
import { BellIcon, XIcon } from '@/components/shell/icons';

// ── Helpers ─────────────────────────────────────────────────

function getTypeColor(type: InAppNotificationType): string {
  switch (type) {
    case 'alert':
      return 'var(--bb-error)';
    case 'success':
      return 'var(--bb-success)';
    case 'warning':
      return 'var(--bb-warning)';
    case 'billing':
      return 'var(--bb-info)';
    case 'info':
    default:
      return 'var(--bb-ink-60)';
  }
}

function getTypeSurface(type: InAppNotificationType): string {
  switch (type) {
    case 'alert':
      return 'rgba(239, 68, 68, 0.12)';
    case 'success':
      return 'var(--bb-success-surface)';
    case 'warning':
      return 'var(--bb-warning-surface)';
    case 'billing':
      return 'var(--bb-info-surface)';
    case 'info':
    default:
      return 'var(--bb-depth-4)';
  }
}

function getTypeIcon(type: InAppNotificationType): React.ReactNode {
  switch (type) {
    case 'alert':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'success':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'warning':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'billing':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `Há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `Há ${diffD}d`;
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

// ── Skeleton ────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="space-y-0">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-start gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
        >
          <div className="skeleton mt-0.5 h-8 w-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-3/4 rounded" />
            <div className="skeleton h-2.5 w-full rounded" />
            <div className="skeleton h-2 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────

interface NotificationBellProps {
  userId: string;
  notificationsHref?: string;
}

const NotificationBell = forwardRef<HTMLDivElement, NotificationBellProps>(
  function NotificationBell({ userId, notificationsHref = '/admin/notificacoes' }, ref) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<InAppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    // ── Fetch notifications ───────────────────────────────

    const fetchNotifications = useCallback(async () => {
      try {
        const data = await listNotifications(userId);
        setNotifications(data);
      } catch {
        // Silently fail — bell still renders
      } finally {
        setLoading(false);
      }
    }, [userId]);

    useEffect(() => {
      fetchNotifications();
    }, [fetchNotifications]);

    // ── Click outside ─────────────────────────────────────

    useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Actions ───────────────────────────────────────────

    async function handleMarkAllRead() {
      try {
        await markAllReadService(userId);
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true })),
        );
      } catch {
        // fail silently
      }
    }

    async function handleMarkAsRead(id: string) {
      try {
        await markAsReadService(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        );
      } catch {
        // fail silently
      }
    }

    async function handleDismiss(id: string, e: React.MouseEvent) {
      e.stopPropagation();
      try {
        await dismissService(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      } catch {
        // fail silently
      }
    }

    return (
      <div ref={ref} className="relative">
        {/* Bell button */}
        <button
          ref={buttonRef}
          className="relative transition-colors"
          aria-label="Notificações"
          onClick={() => setOpen((prev) => !prev)}
          style={{ color: 'var(--bb-ink-60)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--bb-ink-100)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--bb-ink-60)';
          }}
        >
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ background: 'var(--bb-brand)' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 z-50 overflow-hidden"
            style={{
              width: 'min(360px, calc(100vw - 32px))',
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              boxShadow: 'var(--bb-shadow-lg)',
              borderRadius: 'var(--bb-radius-lg)',
              animation: 'scaleIn 0.15s ease-out',
              transformOrigin: 'top right',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--bb-ink-100)' }}
                >
                  Notificações
                </span>
                {unreadCount > 0 && (
                  <span
                    className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
                    style={{ background: 'var(--bb-brand)' }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ color: 'var(--bb-brand)' }}
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <NotificationSkeleton />
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <BellIcon
                    className="mx-auto mb-2 h-8 w-8"
                    style={{ color: 'var(--bb-ink-40)' }}
                  />
                  <p
                    className="text-sm"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    Nenhuma notificação
                  </p>
                </div>
              ) : (
                notifications.slice(0, 8).map((notif, idx) => {
                  const content = (
                    <div
                      key={notif.id}
                      className="group flex items-start gap-3 px-4 py-3 transition-colors"
                      style={{
                        borderBottom: '1px solid var(--bb-glass-border)',
                        background: notif.is_read
                          ? 'transparent'
                          : 'var(--bb-brand-surface)',
                        animationDelay: `${idx * 0.03}s`,
                      }}
                      onClick={() => {
                        if (!notif.is_read) handleMarkAsRead(notif.id);
                        if (notif.action_url) setOpen(false);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bb-depth-4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = notif.is_read
                          ? 'transparent'
                          : 'var(--bb-brand-surface)';
                      }}
                    >
                      {/* Type icon */}
                      <div
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: getTypeSurface(notif.type),
                          color: getTypeColor(notif.type),
                        }}
                      >
                        {getTypeIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-sm font-medium leading-snug"
                          style={{ color: 'var(--bb-ink-100)' }}
                        >
                          {notif.title}
                        </p>
                        <p
                          className="mt-0.5 line-clamp-2 text-xs leading-relaxed"
                          style={{ color: 'var(--bb-ink-60)' }}
                        >
                          {notif.message}
                        </p>
                        <p
                          className="mt-1 text-[11px]"
                          style={{ color: 'var(--bb-ink-40)' }}
                        >
                          {formatRelativeTime(notif.created_at)}
                        </p>
                      </div>

                      {/* Right side: unread dot + dismiss */}
                      <div className="flex shrink-0 flex-col items-center gap-1">
                        {!notif.is_read && (
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ background: 'var(--bb-brand)' }}
                          />
                        )}
                        <button
                          onClick={(e) => handleDismiss(notif.id, e)}
                          className="rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                          style={{ color: 'var(--bb-ink-40)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--bb-ink-80)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--bb-ink-40)';
                          }}
                          aria-label="Dispensar notificação"
                        >
                          <XIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );

                  if (notif.action_url) {
                    return (
                      <Link
                        key={notif.id}
                        href={notif.action_url}
                        className="block"
                      >
                        {content}
                      </Link>
                    );
                  }
                  return content;
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div
                className="px-4 py-2.5 text-center"
                style={{ borderTop: '1px solid var(--bb-glass-border)' }}
              >
                <Link
                  href={notificationsHref}
                  onClick={() => setOpen(false)}
                  className="text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ color: 'var(--bb-brand)' }}
                >
                  Ver todas &rarr;
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

NotificationBell.displayName = 'NotificationBell';

export { NotificationBell };
