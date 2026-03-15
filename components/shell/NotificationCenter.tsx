'use client';

import { forwardRef, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  getNotifications,
  markAsRead,
  markAllNotificationsRead,
  getNotificationCounts,
  type IntelligentNotification,
  type NotificationPriority,
} from '@/lib/api/notifications.service';
import { BellIcon } from './icons';

// ── Priority config ────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<
  NotificationPriority,
  { icon: string; label: string; dotColor: string; bgColor: string }
> = {
  urgent: {
    icon: '🔴',
    label: 'Urgente',
    dotColor: 'bg-red-500',
    bgColor: 'bg-red-50',
  },
  important: {
    icon: '🟡',
    label: 'Importante',
    dotColor: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
  },
  info: {
    icon: '🟢',
    label: 'Info',
    dotColor: 'bg-green-500',
    bgColor: 'bg-green-50',
  },
  silent: {
    icon: '⚪',
    label: 'Silencioso',
    dotColor: 'bg-gray-300',
    bgColor: 'bg-bb-gray-100',
  },
};

const PRIORITY_ORDER: NotificationPriority[] = [
  'urgent',
  'important',
  'info',
  'silent',
];

// ── Helpers ────────────────────────────────────────────────────────────

function formatNotificationTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes}min atras`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atras`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atras`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

function buildGroupedMessage(notification: IntelligentNotification): string {
  if (notification.groupedNames && notification.groupedNames.length > 0) {
    const names = notification.groupedNames;
    if (names.length === 1) return `${names[0]} ${notification.message.split(' ').slice(-2).join(' ')}`;
    if (names.length === 2) return `${names[0]} e ${names[1]} ${notification.message.split(' ').slice(-2).join(' ')}`;
    return `${names[0]}, ${names[1]} e ${names[names.length - 1]} ${notification.message.split(' ').slice(-2).join(' ')}`;
  }
  return notification.message;
}

// ── Component ──────────────────────────────────────────────────────────

const NotificationCenter = forwardRef<HTMLDivElement, Record<string, never>>(
  function NotificationCenter(_, ref) {
    const [notifications, setNotifications] = useState<IntelligentNotification[]>([]);
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<NotificationPriority | 'all'>('all');
    const panelRef = useRef<HTMLDivElement>(null);

    // ── Load notifications ─────────────────────────────────────────────

    useEffect(() => {
      getNotifications('current-user')
        .then(setNotifications)
        .catch(() => {});
    }, []);

    // ── Close on outside click ─────────────────────────────────────────

    useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      }
      if (open) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    // ── Close on Escape ────────────────────────────────────────────────

    useEffect(() => {
      function handleEscape(e: KeyboardEvent) {
        if (e.key === 'Escape') setOpen(false);
      }
      if (open) {
        document.addEventListener('keydown', handleEscape);
      }
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open]);

    // ── Counts ─────────────────────────────────────────────────────────

    const counts = getNotificationCounts(notifications);
    const badgeCount = counts.urgent + counts.important;

    // ── Handlers ───────────────────────────────────────────────────────

    async function handleMarkRead(notificationId: string) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
      try {
        await markAsRead(notificationId);
      } catch {
        // Already updated in UI
      }
    }

    async function handleMarkAllRead() {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      try {
        await markAllNotificationsRead('current-user');
      } catch {
        // Already updated in UI
      }
    }

    // ── Filtered notifications ─────────────────────────────────────────

    const filtered =
      activeTab === 'all'
        ? [...notifications].sort(
            (a, b) =>
              PRIORITY_ORDER.indexOf(a.priority) -
              PRIORITY_ORDER.indexOf(b.priority),
          )
        : notifications.filter((n) => n.priority === activeTab);

    return (
      <div ref={ref} className="relative">
        <div ref={panelRef}>
          {/* Bell Button */}
          <button
            onClick={() => setOpen(!open)}
            className="relative p-1"
            aria-label={`Notificacoes${badgeCount > 0 ? ` (${badgeCount} pendentes)` : ''}`}
          >
            <BellIcon className="h-5 w-5 text-bb-gray-500" />
            {badgeCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-bb-red px-0.5 text-[10px] font-bold text-bb-white">
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            )}
          </button>

          {/* Sliding Panel */}
          {open && (
            <div className="absolute right-0 top-full z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl bg-bb-white shadow-2xl border border-bb-gray-300">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-bb-gray-300 px-4 py-3">
                <h3 className="font-semibold text-bb-black">Notificacoes</h3>
                <div className="flex items-center gap-2">
                  {counts.unread > 0 && (
                    <span className="rounded-full bg-bb-red/10 px-2 py-0.5 text-[10px] font-medium text-bb-red">
                      {counts.unread} nao lidas
                    </span>
                  )}
                  {counts.unread > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-bb-red hover:underline"
                    >
                      Marcar todas
                    </button>
                  )}
                </div>
              </div>

              {/* Priority Tabs */}
              <div className="flex gap-1 border-b border-bb-gray-300 px-3 py-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-bb-red text-bb-white'
                      : 'text-bb-gray-500 hover:bg-bb-gray-100'
                  }`}
                >
                  Todas ({notifications.length})
                </button>
                {PRIORITY_ORDER.filter((p) => p !== 'silent').map((priority) => {
                  const config = PRIORITY_CONFIG[priority];
                  const count = notifications.filter(
                    (n) => n.priority === priority,
                  ).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={priority}
                      onClick={() => setActiveTab(priority)}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                        activeTab === priority
                          ? 'bg-bb-red text-bb-white'
                          : 'text-bb-gray-500 hover:bg-bb-gray-100'
                      }`}
                    >
                      <span>{config.icon}</span>
                      {count}
                    </button>
                  );
                })}
              </div>

              {/* Notification List */}
              <div className="max-h-96 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="p-6 text-center text-sm text-bb-gray-500">
                    Nenhuma notificacao
                  </p>
                ) : (
                  filtered.map((n) => {
                    const config = PRIORITY_CONFIG[n.priority];
                    const content = buildGroupedMessage(n);

                    return (
                      <div
                        key={n.id}
                        className={`border-b border-bb-gray-100 px-4 py-3 transition-colors ${
                          !n.read ? config.bgColor : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Priority indicator */}
                          <div className="mt-1.5 flex shrink-0 flex-col items-center">
                            <span
                              className={`h-2 w-2 rounded-full ${config.dotColor}`}
                            />
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-bb-black">
                                {n.title}
                              </p>
                              {!n.read && (
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-bb-red" />
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-bb-gray-500">
                              {content}
                            </p>
                            <div className="mt-1.5 flex items-center gap-3">
                              <span className="text-[10px] text-bb-gray-500">
                                {formatNotificationTime(n.createdAt)}
                              </span>
                              {!n.read && (
                                <button
                                  onClick={() => handleMarkRead(n.id)}
                                  className="text-[10px] text-bb-red hover:underline"
                                >
                                  Marcar como lida
                                </button>
                              )}
                              {n.actionUrl && (
                                <Link
                                  href={n.actionUrl}
                                  onClick={() => {
                                    handleMarkRead(n.id);
                                    setOpen(false);
                                  }}
                                  className="text-[10px] font-medium text-bb-red hover:underline"
                                >
                                  Ver detalhes
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

NotificationCenter.displayName = 'NotificationCenter';

export { NotificationCenter };
