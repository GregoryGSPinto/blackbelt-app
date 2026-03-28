'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import {
  getUnreadNotifications,
  markNotificationRead,
  markAllRead,
  type AppNotification,
} from '@/lib/api/notifications-realtime.service';

const TYPE_EMOJI: Record<string, string> = {
  checkin: '\u{1F94B}',
  payment: '\u{1F4B0}',
  alert: '\u26A0\uFE0F',
  message: '\u{1F4AC}',
  graduation: '\u{1F393}',
  event: '\u{1F4C5}',
  system: '\u{1F514}',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function NotificationBell({ profileId }: { profileId?: string }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const data = await getUnreadNotifications(profileId ?? 'mock');
    setNotifications(data);
  }, [profileId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  async function handleRead(n: AppNotification) {
    await markNotificationRead(n.id);
    setNotifications((prev) => prev.filter((x) => x.id !== n.id));
  }

  async function handleMarkAllRead() {
    await markAllRead(profileId ?? 'mock');
    setNotifications([]);
  }

  const count = notifications.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
        style={{ color: 'var(--bb-ink-60)' }}
        aria-label={`Notifica\u00E7\u00F5es${count > 0 ? ` (${count} n\u00E3o lidas)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
            style={{ backgroundColor: '#ef4444' }}
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl shadow-xl"
          style={{
            backgroundColor: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
          }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
            <h3 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>Notifica\u00E7\u00F5es</h3>
            {count > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium"
                style={{ color: 'var(--bb-brand)' }}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                Nenhuma notifica\u00E7\u00E3o
              </p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href="#"
                  onClick={() => handleRead(n)}
                  className="flex gap-3 px-4 py-3 transition-colors"
                  style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className="text-lg">{TYPE_EMOJI[n.type] ?? '\u{1F514}'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>{n.title}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--bb-ink-60)' }}>{n.body}</p>
                  </div>
                  <span className="shrink-0 text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>{timeAgo(n.created_at)}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
