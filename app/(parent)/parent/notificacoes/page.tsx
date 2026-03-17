'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  getNotificacoes,
  marcarLida,
  marcarTodasLidas,
} from '@/lib/api/responsavel-notificacoes.service';
import type { NotificacaoResponsavel } from '@/lib/api/responsavel-notificacoes.service';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  BellIcon,
  CheckSquareIcon,
  CalendarIcon,
  DollarIcon,
  MessageIcon,
  StarIcon,
  AlertTriangleIcon,
} from '@/components/shell/icons';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

type NotifType = NotificacaoResponsavel['type'];

const TYPE_CONFIG: Record<
  NotifType,
  {
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
    bg: string;
  }
> = {
  presenca: {
    label: 'Presenca',
    icon: CalendarIcon,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  pagamento: {
    label: 'Pagamento',
    icon: DollarIcon,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  avaliacao: {
    label: 'Avaliacao',
    icon: StarIcon,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  evento: {
    label: 'Evento',
    icon: CalendarIcon,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  mensagem: {
    label: 'Mensagem',
    icon: MessageIcon,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
  },
  alerta: {
    label: 'Alerta',
    icon: AlertTriangleIcon,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
};

const ALL_TYPES: NotifType[] = [
  'presenca',
  'pagamento',
  'avaliacao',
  'evento',
  'mensagem',
  'alerta',
];

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return 'Agora';
  if (diffMinutes < 60) return `${diffMinutes}min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ontem';
  return `${diffDays}d`;
}

// ────────────────────────────────────────────────────────────
// Skeleton
// ────────────────────────────────────────────────────────────

function NotificacoesSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--bb-depth-1)] p-4">
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="flex gap-2 overflow-x-auto">
          <Skeleton variant="text" className="h-8 w-20" />
          <Skeleton variant="text" className="h-8 w-24" />
          <Skeleton variant="text" className="h-8 w-20" />
          <Skeleton variant="text" className="h-8 w-20" />
        </div>
        <Skeleton variant="card" className="h-20" />
        <Skeleton variant="card" className="h-20" />
        <Skeleton variant="card" className="h-20" />
        <Skeleton variant="card" className="h-20" />
        <Skeleton variant="card" className="h-20" />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Notification Card
// ────────────────────────────────────────────────────────────

function NotificationCard({
  notif,
  onMarkRead,
}: {
  notif: NotificacaoResponsavel;
  onMarkRead: (id: string) => void;
}) {
  const config = TYPE_CONFIG[notif.type];
  const Icon = config.icon;

  return (
    <Card
      interactive
      className={`relative overflow-hidden p-0 ${!notif.read ? 'border-l-[3px] border-l-[var(--bb-brand)]' : ''}`}
      onClick={() => !notif.read && onMarkRead(notif.id)}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.bg}`}
        >
          <Icon className={`h-4 w-4 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-sm ${
                notif.read
                  ? 'font-medium text-[var(--bb-ink-60)]'
                  : 'font-bold text-[var(--bb-ink-100)]'
              }`}
            >
              {notif.title}
            </h3>
            <span className="shrink-0 text-[10px] text-[var(--bb-ink-40)]">
              {timeAgo(notif.created_at)}
            </span>
          </div>
          <p
            className={`mt-0.5 text-xs leading-relaxed ${
              notif.read ? 'text-[var(--bb-ink-40)]' : 'text-[var(--bb-ink-60)]'
            }`}
          >
            {notif.body}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded-full bg-[var(--bb-depth-4)] px-2 py-0.5 text-[10px] font-semibold text-[var(--bb-ink-40)]">
              {notif.student_name}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.bg} ${config.color}`}
            >
              {config.label}
            </span>
          </div>
        </div>

        {/* Unread indicator */}
        {!notif.read && (
          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--bb-brand)]" />
        )}
      </div>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<NotificacaoResponsavel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<NotifType | 'todas'>('todas');
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getNotificacoes('prof-guardian-1');
        setNotificacoes(data);
      } catch {
        // Error handled by service
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const unreadCount = useMemo(
    () => notificacoes.filter((n) => !n.read).length,
    [notificacoes],
  );

  const filtered = useMemo(() => {
    if (activeFilter === 'todas') return notificacoes;
    return notificacoes.filter((n) => n.type === activeFilter);
  }, [notificacoes, activeFilter]);

  async function handleMarkRead(id: string) {
    try {
      await marcarLida(id);
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      // Error handled by service
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await marcarTodasLidas('prof-guardian-1');
      setNotificacoes((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Error handled by service
    } finally {
      setMarkingAll(false);
    }
  }

  if (loading) return <NotificacoesSkeleton />;

  return (
    <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      <div className="mx-auto max-w-lg px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bb-brand-surface)]">
              <BellIcon className="h-5 w-5 text-[var(--bb-brand)]" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bb-brand)] text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[var(--bb-ink-100)]">
                Notificacoes
              </h1>
              <p className="text-sm text-[var(--bb-ink-60)]">
                {unreadCount > 0
                  ? `${unreadCount} nao lida${unreadCount > 1 ? 's' : ''}`
                  : 'Todas lidas'}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 rounded-full bg-[var(--bb-depth-3)] px-3 py-1.5 text-xs font-semibold text-[var(--bb-brand)] ring-1 ring-[var(--bb-glass-border)] transition-all hover:bg-[var(--bb-brand-surface)] disabled:opacity-50"
            >
              <CheckSquareIcon className="h-3.5 w-3.5" />
              Marcar todas
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveFilter('todas')}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === 'todas'
                ? 'bg-[var(--bb-brand)] text-white shadow-md'
                : 'bg-[var(--bb-depth-3)] text-[var(--bb-ink-60)] ring-1 ring-[var(--bb-glass-border)]'
            }`}
          >
            Todas
          </button>
          {ALL_TYPES.map((type) => {
            const config = TYPE_CONFIG[type];
            const count = notificacoes.filter((n) => n.type === type).length;
            if (count === 0) return null;
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeFilter === type
                    ? 'bg-[var(--bb-brand)] text-white shadow-md'
                    : 'bg-[var(--bb-depth-3)] text-[var(--bb-ink-60)] ring-1 ring-[var(--bb-glass-border)]'
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        <div className="mt-4 space-y-3">
          {filtered.length === 0 && (
            <Card className="p-6 text-center">
              <BellIcon className="mx-auto h-10 w-10 text-[var(--bb-ink-20)]" />
              <p className="mt-2 text-sm font-bold text-[var(--bb-ink-100)]">
                Nenhuma notificacao
              </p>
              <p className="mt-1 text-xs text-[var(--bb-ink-60)]">
                {activeFilter === 'todas'
                  ? 'Voce nao tem notificacoes.'
                  : `Nenhuma notificacao do tipo "${TYPE_CONFIG[activeFilter as NotifType].label}".`}
              </p>
            </Card>
          )}

          {filtered.map((notif) => (
            <NotificationCard
              key={notif.id}
              notif={notif}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
