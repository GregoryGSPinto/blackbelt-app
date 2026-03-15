'use client';

import { forwardRef, useState, useEffect, useRef } from 'react';
import { listNotifications, markAllRead } from '@/lib/api/notificacoes.service';
import type { NotificationDTO } from '@/lib/api/notificacoes.service';
import { BellIcon } from './icons';

const NotificationBell = forwardRef<HTMLDivElement, Record<string, never>>(
  function NotificationBell(_, ref) {
    const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      listNotifications('current-user').then(setNotifications).catch(() => {});
    }, []);

    useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    async function handleMarkAllRead() {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }

    return (
      <div ref={ref} className="relative" >
        <div ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="relative p-1"
            aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
          >
            <BellIcon className="h-5 w-5 text-bb-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-bb-red text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-lg bg-white shadow-xl border border-bb-gray-300 z-50">
              <div className="flex items-center justify-between border-b border-bb-gray-300 px-4 py-3">
                <h3 className="font-semibold text-bb-black">Notificações</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-bb-red hover:underline">
                    Marcar todas como lidas
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-sm text-bb-gray-500">Nenhuma notificação</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`border-b border-bb-gray-100 px-4 py-3 text-sm ${!n.read ? 'bg-bb-red/5' : ''}`}
                    >
                      <p className="font-medium text-bb-black">{n.title}</p>
                      <p className="text-bb-gray-500">{n.message}</p>
                      <p className="mt-1 text-xs text-bb-gray-500">{n.time}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

NotificationBell.displayName = 'NotificationBell';

export { NotificationBell };
