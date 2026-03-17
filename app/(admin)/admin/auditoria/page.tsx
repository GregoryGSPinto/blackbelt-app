'use client';

import { useState, useEffect } from 'react';
import { searchAuditLogs } from '@/lib/api/audit.service';
import type { AuditLog, AuditAction } from '@/lib/api/audit.service';
import {
  UserIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  DollarIcon,
  LogOutIcon,
  EyeIcon,
  FilterIcon,
} from '@/components/shell/icons';

const ACTION_CONFIG: Record<string, { label: string; icon: typeof UserIcon; color: string }> = {
  login: { label: 'Login', icon: UserIcon, color: 'var(--bb-brand)' },
  logout: { label: 'Logout', icon: LogOutIcon, color: 'var(--bb-ink-60)' },
  create: { label: 'Criação', icon: PlusIcon, color: '#22C55E' },
  update: { label: 'Atualização', icon: EditIcon, color: '#3B82F6' },
  delete: { label: 'Exclusão', icon: TrashIcon, color: '#EF4444' },
  payment: { label: 'Pagamento', icon: DollarIcon, color: '#22C55E' },
  refund: { label: 'Reembolso', icon: DollarIcon, color: '#F59E0B' },
  config_change: { label: 'Configuração', icon: EditIcon, color: '#8B5CF6' },
  content_view: { label: 'Visualização', icon: EyeIcon, color: 'var(--bb-ink-60)' },
  password_change: { label: 'Senha', icon: UserIcon, color: '#F59E0B' },
  mfa_enable: { label: 'MFA', icon: UserIcon, color: '#22C55E' },
  plan_change: { label: 'Plano', icon: DollarIcon, color: '#8B5CF6' },
  role_change: { label: 'Papel', icon: UserIcon, color: '#F59E0B' },
  invite: { label: 'Convite', icon: PlusIcon, color: '#3B82F6' },
  deactivate: { label: 'Desativação', icon: TrashIcon, color: '#EF4444' },
  report_export: { label: 'Export', icon: EyeIcon, color: '#3B82F6' },
  data_export: { label: 'Export Dados', icon: EyeIcon, color: '#8B5CF6' },
};

const ACTION_FILTERS: AuditAction[] = [
  'login', 'create', 'update', 'delete', 'payment', 'config_change',
];

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<AuditAction | ''>('');
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => {
    searchAuditLogs('academy-1', {})
      .then((result) => setLogs(result.logs))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((log) => {
    if (filterAction && log.action !== filterAction) return false;
    if (searchUser && !log.actorName.toLowerCase().includes(searchUser.toLowerCase())) return false;
    return true;
  });

  function formatTimestamp(ts: string): string {
    const d = new Date(ts);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getActionDescription(log: AuditLog): string {
    const entity = log.entityType || '';
    switch (log.action) {
      case 'login': return 'fez login no sistema';
      case 'logout': return 'fez logout';
      case 'create': return `criou ${entity} "${log.entityId}"`;
      case 'update': return `atualizou ${entity} "${log.entityId}"`;
      case 'delete': return `excluiu ${entity} "${log.entityId}"`;
      case 'payment': return `registrou pagamento em ${entity}`;
      case 'config_change': return `alterou configuração "${log.entityId}"`;
      default: return `${log.action} em ${entity}`;
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Auditoria
        </h1>
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Histórico de todas as ações realizadas na academia.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value as AuditAction | '')}
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none"
            style={{
              background: 'var(--bb-depth-2)',
              borderColor: 'var(--bb-glass-border)',
              color: 'var(--bb-ink-100)',
            }}
          >
            <option value="">Todas as ações</option>
            {ACTION_FILTERS.map((a) => (
              <option key={a} value={a}>{ACTION_CONFIG[a]?.label ?? a}</option>
            ))}
          </select>
        </div>
        <input
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          placeholder="Filtrar por usuário..."
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none"
          style={{
            background: 'var(--bb-depth-2)',
            borderColor: 'var(--bb-glass-border)',
            color: 'var(--bb-ink-100)',
          }}
        />
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg" style={{ background: 'var(--bb-depth-3)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
          Nenhum registro encontrado.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => {
            const config = ACTION_CONFIG[log.action] ?? {
              label: log.action,
              icon: EyeIcon,
              color: 'var(--bb-ink-60)',
            };
            const Icon = config.icon;

            return (
              <div
                key={log.id}
                className="flex items-start gap-3 rounded-lg border p-3 transition-colors"
                style={{
                  background: 'var(--bb-depth-2)',
                  borderColor: 'var(--bb-glass-border)',
                }}
              >
                <div
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: `${config.color}20` }}
                >
                  <Icon className="h-4 w-4" style={{ color: config.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>
                    <span className="font-semibold">{log.actorName}</span>{' '}
                    <span style={{ color: 'var(--bb-ink-60)' }}>{getActionDescription(log)}</span>
                  </p>
                  <div className="mt-1 flex items-center gap-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        background: `${config.color}15`,
                        color: config.color,
                      }}
                    >
                      {config.label}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {formatTimestamp(log.createdAt)}
                    </span>
                    {log.ipAddress && (
                      <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        IP: {log.ipAddress}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
