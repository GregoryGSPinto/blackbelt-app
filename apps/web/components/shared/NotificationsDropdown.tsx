'use client';

import { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import { listNotifications, markAsRead, markAllRead } from '@/lib/api/in-app-notification.service';
import type { InAppNotification } from '@/lib/types/notification';

// ── Inline icons ────────────────────────────────────────────────────
function BellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

interface NotificationsDropdownProps {
  userId: string;
}

const NotificationsDropdown = forwardRef<HTMLDivElement, NotificationsDropdownProps>(
  function NotificationsDropdown({ userId }, ref) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<InAppNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const load = useCallback(async () => {
      setLoading(true);
      const data = await listNotifications(userId);
      setNotifications(data);
      setLoading(false);
    }, [userId]);

    useEffect(() => { load(); }, [load]);

    // Close on click outside
    useEffect(() => {
      function handler(e: MouseEvent) {
        if (
          dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      }
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    async function handleMarkAllRead() {
      await markAllRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }

    async function handleClickNotif(notif: InAppNotification) {
      if (!notif.is_read) {
        await markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n),
        );
      }
      if (notif.action_url) {
        window.location.href = notif.action_url;
      }
    }

    return (
      <div ref={ref} className="relative">
        <button
          ref={buttonRef}
          onClick={() => setOpen(!open)}
          className="relative transition-colors"
          aria-label="Notificações"
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
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-80 z-50 overflow-hidden"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              boxShadow: 'var(--bb-shadow-lg)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Notificações</span>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs" style={{ color: 'var(--bb-brand)' }}>
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto">
              {loading ? (
                <div className="space-y-2 p-4">
                  {[1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg" style={{ background: 'var(--bb-depth-4)' }} />)}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Nenhuma notificação</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleClickNotif(notif)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors"
                    style={{
                      borderBottom: '1px solid var(--bb-glass-border)',
                      background: notif.is_read ? 'transparent' : 'var(--bb-brand-surface)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = notif.is_read ? 'transparent' : 'var(--bb-brand-surface)'; }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--bb-depth-4)' }}>
                      <span className="text-sm">{'🔔'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug" style={{ color: 'var(--bb-ink-100)' }}>{notif.title}</p>
                      {notif.message && (
                        <p className="mt-0.5 text-xs truncate" style={{ color: 'var(--bb-ink-60)' }}>{notif.message}</p>
                      )}
                      <p className="mt-0.5 text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                        {new Date(notif.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: 'var(--bb-brand)' }} />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);

NotificationsDropdown.displayName = 'NotificationsDropdown';

export { NotificationsDropdown };
