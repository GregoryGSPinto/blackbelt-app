'use client';

import { useState, useEffect, useMemo } from 'react';
import { searchAuditLogs } from '@/lib/api/audit.service';
import type { AuditLog, AuditAction, AuditFilters } from '@/lib/api/audit.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/lib/hooks/useToast';
import { Search, Shield, Download, ChevronLeft, ChevronRight, Eye, Clock } from 'lucide-react';
import { translateError } from '@/lib/utils/error-translator';

const ACTION_LABELS: Record<AuditAction, string> = {
  login: 'Login',
  logout: 'Logout',
  password_change: 'Senha alterada',
  mfa_enable: 'MFA ativado',
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
  payment: 'Pagamento',
  refund: 'Reembolso',
  plan_change: 'Plano alterado',
  role_change: 'Perfil alterado',
  invite: 'Convite',
  deactivate: 'Desativação',
  config_change: 'Config alterada',
  content_view: 'Visualização',
  report_export: 'Relatório exportado',
  data_export: 'Dados exportados',
};

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  login: { bg: '#3b82f620', text: '#3b82f6' },
  logout: { bg: '#6b728020', text: '#6b7280' },
  create: { bg: '#22c55e20', text: '#22c55e' },
  update: { bg: '#f59e0b20', text: '#f59e0b' },
  delete: { bg: '#ef444420', text: '#ef4444' },
  payment: { bg: '#8b5cf620', text: '#8b5cf6' },
  plan_change: { bg: '#06b6d420', text: '#06b6d4' },
  config_change: { bg: '#f9731620', text: '#f97316' },
};

function getActionColor(action: string) {
  return ACTION_COLORS[action] ?? { bg: 'var(--bb-depth-3)', text: 'var(--bb-ink-60)' };
}

const ACTIONS: AuditAction[] = [
  'login', 'logout', 'password_change', 'mfa_enable',
  'create', 'update', 'delete',
  'payment', 'refund', 'plan_change',
  'role_change', 'invite', 'deactivate', 'config_change',
  'content_view', 'report_export', 'data_export',
];

export default function AuditoriaPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<AuditAction | ''>('');
  const [filterEntity, setFilterEntity] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    const filters: AuditFilters = {};
    if (filterAction) filters.action = filterAction;
    if (filterEntity) filters.entityType = filterEntity;
    filters.limit = 100;

    searchAuditLogs('platform', filters)
      .then((result) => setLogs(result.logs))
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setLoading(false));
  }, [filterAction, filterEntity, toast]);

  const entityTypes = useMemo(() => {
    const set = new Set(logs.map((l) => l.entityType));
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    if (!search) return logs;
    const q = search.toLowerCase();
    return logs.filter(
      (l) =>
        l.actorName.toLowerCase().includes(q) ||
        l.entityType.toLowerCase().includes(q) ||
        l.entityId.toLowerCase().includes(q) ||
        (ACTION_LABELS[l.action] || l.action).toLowerCase().includes(q),
    );
  }, [logs, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayLogs = logs.filter((l) => l.createdAt.startsWith(today));
    const logins = logs.filter((l) => l.action === 'login').length;
    const changes = logs.filter((l) => ['create', 'update', 'delete'].includes(l.action)).length;
    const uniqueActors = new Set(logs.map((l) => l.actorId)).size;
    return { total: logs.length, today: todayLogs.length, logins, changes, uniqueActors };
  }, [logs]);

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  async function handleExport() {
    try {
      const { exportAuditLogs } = await import('@/lib/api/audit.service');
      const blob = await exportAuditLogs('platform', {});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast('Logs exportados com sucesso', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} variant="card" className="h-20" />)}
        </div>
        <Skeleton variant="card" className="h-12" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Auditoria</h1>
          <p className="text-sm" style={{ color: 'var(--bb-ink-50)' }}>Logs de atividade da plataforma</p>
        </div>
        <Button variant="ghost" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total de Logs', value: stats.total, icon: Shield, color: 'var(--bb-brand)' },
          { label: 'Hoje', value: stats.today, icon: Clock, color: '#3b82f6' },
          { label: 'Alterações', value: stats.changes, icon: Eye, color: '#f59e0b' },
          { label: 'Usuários Únicos', value: stats.uniqueActors, icon: Shield, color: '#8b5cf6' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
            <div className="flex items-center gap-2">
              <s.icon className="h-4 w-4" style={{ color: s.color }} />
              <span className="text-xs" style={{ color: 'var(--bb-ink-50)' }}>{s.label}</span>
            </div>
            <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
          <input
            type="text"
            placeholder="Buscar por usuário, entidade..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full rounded-lg py-2 pl-10 pr-4 text-sm outline-none"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => { setFilterAction(e.target.value as AuditAction | ''); setPage(0); }}
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
        >
          <option value="">Todas ações</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{ACTION_LABELS[a]}</option>)}
        </select>
        <select
          value={filterEntity}
          onChange={(e) => { setFilterEntity(e.target.value); setPage(0); }}
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
        >
          <option value="">Todas entidades</option>
          {entityTypes.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Results */}
      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
        {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
          <Shield className="mb-4 h-12 w-12" style={{ color: 'var(--bb-ink-30)' }} />
          <p className="text-lg font-medium" style={{ color: 'var(--bb-ink-60)' }}>Nenhum log encontrado</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>Ajuste os filtros de busca</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-lg md:block" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
            <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--bb-glass-border)', background: 'var(--bb-depth-3)' }}>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--bb-ink-50)' }}>Data</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--bb-ink-50)' }}>Usuário</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--bb-ink-50)' }}>Ação</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--bb-ink-50)' }}>Entidade</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--bb-ink-50)' }}>IP</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--bb-ink-50)' }}>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((log) => {
                  const color = getActionColor(log.action);
                  return (
                    <tr key={log.id} className="transition-colors hover:bg-[var(--bb-depth-3)]" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--bb-ink-50)' }}>{formatDate(log.createdAt)}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--bb-ink-100)' }}>{log.actorName}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: color.bg, color: color.text }}>
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>
                        {log.entityType} <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>#{log.entityId.slice(0, 8)}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--bb-ink-40)' }}>{log.ipAddress}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-xs font-medium hover:underline"
                          style={{ color: 'var(--bb-brand)' }}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {paginated.map((log) => {
              const color = getActionColor(log.action);
              return (
                <button
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="w-full rounded-lg p-4 text-left"
                  style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>{log.actorName}</span>
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: color.bg, color: color.text }}>
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                  </div>
                  <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-50)' }}>
                    {log.entityType} · {formatDate(log.createdAt)}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Página {page + 1} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-lg p-2 disabled:opacity-30"
                  style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
                >
                  <ChevronLeft className="h-4 w-4" style={{ color: 'var(--bb-ink-60)' }} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-lg p-2 disabled:opacity-30"
                  style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
                >
                  <ChevronRight className="h-4 w-4" style={{ color: 'var(--bb-ink-60)' }} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      <Modal open={!!selectedLog} onClose={() => setSelectedLog(null)} title="Detalhe do Log">
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Usuário</p>
                <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{selectedLog.actorName}</p>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Ação</p>
                <p className="text-sm font-medium" style={{ color: getActionColor(selectedLog.action).text }}>
                  {ACTION_LABELS[selectedLog.action] || selectedLog.action}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Entidade</p>
                <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>{selectedLog.entityType}</p>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>ID</p>
                <p className="text-sm font-mono" style={{ color: 'var(--bb-ink-60)' }}>{selectedLog.entityId}</p>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Data</p>
                <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>{formatDate(selectedLog.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>IP</p>
                <p className="text-sm font-mono" style={{ color: 'var(--bb-ink-60)' }}>{selectedLog.ipAddress}</p>
              </div>
            </div>
            {selectedLog.userAgent && (
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>User Agent</p>
                <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-50)' }}>{selectedLog.userAgent}</p>
              </div>
            )}
            {selectedLog.oldData && (
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Dados Anteriores</p>
                <pre className="mt-1 overflow-x-auto rounded-lg p-3 text-xs" style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}>
                  {JSON.stringify(selectedLog.oldData, null, 2)}
                </pre>
              </div>
            )}
            {selectedLog.newData && (
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Dados Novos</p>
                <pre className="mt-1 overflow-x-auto rounded-lg p-3 text-xs" style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}>
                  {JSON.stringify(selectedLog.newData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
