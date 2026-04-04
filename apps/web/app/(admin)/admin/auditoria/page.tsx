'use client';

import { useState, useEffect, useCallback } from 'react';
import { listAuditEntries } from '@/lib/api/audit.service';
import type { AuditEntry, AuditEntryAction } from '@/lib/types/audit';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  UserIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  DollarIcon,
  UploadIcon,
  CheckSquareIcon,
  ClockIcon,
  FilterIcon,
  EyeIcon,
} from '@/components/shell/icons';

// ── Constants ──────────────────────────────────────────────────────

const ACADEMY_ID = 'academy-bb-001';

const ACTION_LABELS: Record<AuditEntryAction, string> = {
  login: 'Login',
  create: 'Criacao',
  update: 'Atualizacao',
  delete: 'Exclusao',
  publish: 'Publicacao',
  approve: 'Aprovacao',
  payment: 'Pagamento',
};

const ACTION_ICONS: Record<AuditEntryAction, typeof ClockIcon> = {
  login: UserIcon,
  create: PlusIcon,
  update: EditIcon,
  delete: TrashIcon,
  publish: UploadIcon,
  approve: CheckSquareIcon,
  payment: DollarIcon,
};

const ENTITY_LABELS: Record<string, string> = {
  session: 'Sessao',
  turma: 'Turma',
  student: 'Aluno',
  mensalidade: 'Mensalidade',
  video: 'Video',
  graduation: 'Graduacao',
  comunicado: 'Comunicado',
  invite_token: 'Convite',
};

// ── Helpers ────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMin = Math.floor((now - then) / 60_000);

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `Ha ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Ha ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ontem';
  return `Ha ${diffDays} dias`;
}

function buildDescription(entry: AuditEntry): string {
  const entity = ENTITY_LABELS[entry.entity_type] ?? entry.entity_type;
  const action = ACTION_LABELS[entry.action].toLowerCase();

  if (entry.action === 'login') {
    return `fez login no sistema`;
  }

  if (entry.changes_json) {
    const details = entry.changes_json;
    if (typeof details.name === 'string') {
      return `${action}: ${entity} "${details.name}"`;
    }
    if (typeof details.title === 'string') {
      return `${action}: ${entity} "${details.title}"`;
    }
    if (typeof details.student === 'string') {
      return `${action}: ${entity} — ${details.student}`;
    }
    if (typeof details.label === 'string') {
      return `${action}: ${entity} "${details.label}"`;
    }
  }

  return `${action}: ${entity} (${entry.entity_id})`;
}

// ── Filters ────────────────────────────────────────────────────────

type ActionFilter = AuditEntryAction | 'all';
type PeriodFilter = '7d' | '30d' | '90d' | 'all';

function getPeriodDate(period: PeriodFilter): string | undefined {
  if (period === 'all') return undefined;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// ── Page Component ─────────────────────────────────────────────────

export default function AuditoriaPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d');
  const [userFilter, setUserFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAuditEntries(ACADEMY_ID, {
        action: actionFilter === 'all' ? undefined : actionFilter,
        start_date: getPeriodDate(periodFilter),
        user_id: userFilter || undefined,
      });
      setEntries(data);
    } catch {
      // Handled by service error
    } finally {
      setLoading(false);
    }
  }, [actionFilter, periodFilter, userFilter]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Get unique users for filter dropdown
  const uniqueUsers = Array.from(
    new Map(entries.map((e) => [e.user_id, e.user_name])),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Auditoria
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Historico completo de acoes realizadas no sistema
          </p>
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          style={{
            background: showFilters ? 'var(--bb-brand-surface)' : 'var(--bb-depth-3)',
            color: showFilters ? 'var(--bb-brand)' : 'var(--bb-ink-80)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-sm)',
          }}
        >
          <FilterIcon className="h-4 w-4" />
          Filtros
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div
          className="mb-6 rounded-xl p-4"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Action filter */}
            <div>
              <label
                className="mb-1 block text-xs font-medium"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Tipo de acao
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'var(--bb-depth-3)',
                  color: 'var(--bb-ink-100)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 'var(--bb-radius-sm)',
                }}
              >
                <option value="all">Todas</option>
                {(Object.keys(ACTION_LABELS) as AuditEntryAction[]).map((key) => (
                  <option key={key} value={key}>
                    {ACTION_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            {/* User filter */}
            <div>
              <label
                className="mb-1 block text-xs font-medium"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Usuario
              </label>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'var(--bb-depth-3)',
                  color: 'var(--bb-ink-100)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 'var(--bb-radius-sm)',
                }}
              >
                <option value="">Todos</option>
                {uniqueUsers.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Period filter */}
            <div>
              <label
                className="mb-1 block text-xs font-medium"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Periodo
              </label>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'var(--bb-depth-3)',
                  color: 'var(--bb-ink-100)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 'var(--bb-radius-sm)',
                }}
              >
                <option value="7d">Ultimos 7 dias</option>
                <option value="30d">Ultimos 30 dias</option>
                <option value="90d">Ultimos 90 dias</option>
                <option value="all">Todo o periodo</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Stats summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: entries.length },
          { label: 'Logins', value: entries.filter((e) => e.action === 'login').length },
          { label: 'Criacoes', value: entries.filter((e) => e.action === 'create').length },
          { label: 'Pagamentos', value: entries.filter((e) => e.action === 'payment').length },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-3 text-center"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <p className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {stat.value}
            </p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton variant="circle" className="h-10 w-10 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="h-4 w-3/4" />
                <Skeleton variant="text" className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div
          className="rounded-xl py-12 text-center"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <EyeIcon
            className="mx-auto mb-3 h-10 w-10"
            style={{ color: 'var(--bb-ink-40)' }}
          />
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Nenhum registro encontrado para os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-5 top-0 bottom-0 w-px"
            style={{ background: 'var(--bb-glass-border)' }}
          />

          <div className="space-y-1">
            {entries.map((entry) => {
              const Icon = ACTION_ICONS[entry.action];
              return (
                <div
                  key={entry.id}
                  className="group relative flex items-start gap-4 rounded-lg px-2 py-3 transition-colors"
                  style={{ borderRadius: 'var(--bb-radius-sm)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bb-depth-2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {/* Icon circle */}
                  <div
                    className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: 'var(--bb-depth-3)',
                      border: '2px solid var(--bb-glass-border)',
                    }}
                  >
                    <Icon
                      className="h-4 w-4"
                      style={{ color: 'var(--bb-brand)' }}
                    />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                        {entry.user_name}
                      </p>
                      <span
                        className="shrink-0 text-xs"
                        style={{ color: 'var(--bb-ink-40)' }}
                        title={formatDateTime(entry.created_at)}
                      >
                        {formatRelativeTime(entry.created_at)}
                      </span>
                    </div>

                    <p className="mt-0.5 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                      {buildDescription(entry)}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                        style={{
                          background: 'var(--bb-brand-surface)',
                          color: 'var(--bb-brand)',
                        }}
                      >
                        {ACTION_LABELS[entry.action]}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        {ENTITY_LABELS[entry.entity_type] ?? entry.entity_type}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--bb-ink-20)' }}>
                        IP: {entry.ip}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
