'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import type { AuditLog, AuditAction } from '@/lib/api/audit.service';
import { searchAuditLogs, exportAuditLogs } from '@/lib/api/audit.service';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { ComingSoon } from '@/components/shared/ComingSoon';

const ACTION_LABELS: Record<AuditAction, string> = {
  login: 'Login', logout: 'Logout', password_change: 'Alteração de Senha', mfa_enable: 'MFA Ativado',
  create: 'Criação', update: 'Atualização', delete: 'Exclusão',
  payment: 'Pagamento', refund: 'Reembolso', plan_change: 'Mudança de Plano',
  role_change: 'Mudança de Role', invite: 'Convite', deactivate: 'Desativação', config_change: 'Configuração',
  content_view: 'Visualização', report_export: 'Export Relatório', data_export: 'Export Dados',
};

const ACTION_STYLES: Record<string, React.CSSProperties> = {
  create: { background: 'color-mix(in srgb, var(--bb-success) 15%, transparent)', color: 'var(--bb-success)' },
  update: { background: 'color-mix(in srgb, var(--bb-brand) 15%, transparent)', color: 'var(--bb-brand)' },
  delete: { background: 'color-mix(in srgb, var(--bb-danger) 15%, transparent)', color: 'var(--bb-danger)' },
  payment: { background: 'color-mix(in srgb, var(--bb-success) 15%, transparent)', color: 'var(--bb-success)' },
  login: { background: 'var(--bb-depth-2)', color: 'var(--bb-ink-2)' },
  config_change: { background: 'color-mix(in srgb, var(--bb-warning) 15%, transparent)', color: 'var(--bb-warning)' },
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [filterAction, setFilterAction] = useState<AuditAction | ''>('');
  const [filterEntity, setFilterEntity] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const filters: Record<string, string> = {};
        if (filterAction) filters.action = filterAction;
        if (filterEntity) filters.entityType = filterEntity;
        const result = await searchAuditLogs(getActiveAcademyId(), filters);
        setLogs(result.logs);
      } catch (err) {
        console.error('[AuditLogPage]', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filterAction, filterEntity]);

  async function handleExport() {
    const blob = await exportAuditLogs(getActiveAcademyId());
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const entityTypes = [...new Set(logs.map((l) => l.entityType))];
  const actionTypes = Object.keys(ACTION_LABELS) as AuditAction[];

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/admin" backLabel="Voltar ao Dashboard" />;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <PageHeader title="Log de Auditoria" subtitle="Registro de todas as ações sensíveis no sistema" />

      <div className="flex flex-wrap items-center gap-3">
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value as AuditAction | '')} className="rounded-lg border border-bb-gray-200 px-3 py-2 text-sm">
          <option value="">Todas as ações</option>
          {actionTypes.map((a) => <option key={a} value={a}>{ACTION_LABELS[a]}</option>)}
        </select>
        <select value={filterEntity} onChange={(e) => setFilterEntity(e.target.value)} className="rounded-lg border border-bb-gray-200 px-3 py-2 text-sm">
          <option value="">Todas as entidades</option>
          {entityTypes.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <div className="ml-auto">
          <Button variant="secondary" onClick={handleExport}>Exportar CSV</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : logs.length === 0 ? (
        <p className="text-center text-bb-gray-400 py-10">Nenhum registro encontrado</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="rounded-xl border border-bb-gray-200">
              <button onClick={() => setExpandedId(expandedId === log.id ? null : log.id)} className="flex w-full items-center gap-3 p-4 text-left">
                <span className="rounded px-2 py-0.5 text-xs font-medium" style={ACTION_STYLES[log.action] ?? { background: 'var(--bb-depth-2)', color: 'var(--bb-ink-2)' }}>
                  {ACTION_LABELS[log.action] ?? log.action}
                </span>
                <span className="text-sm text-bb-gray-700">{log.actorName}</span>
                <span className="text-sm text-bb-gray-400">{log.entityType}/{log.entityId}</span>
                <span className="ml-auto text-xs text-bb-gray-400">{new Date(log.createdAt).toLocaleString('pt-BR')}</span>
              </button>

              {expandedId === log.id && (
                <div className="border-t border-bb-gray-200 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-bb-gray-500">IP:</span> <span className="font-mono">{log.ipAddress}</span></div>
                    <div><span className="text-bb-gray-500">User Agent:</span> <span className="text-bb-gray-600">{log.userAgent}</span></div>
                  </div>
                  {(log.oldData || log.newData) && (
                    <div className="grid grid-cols-2 gap-4">
                      {log.oldData && (
                        <div>
                          <p className="mb-1 text-xs font-medium" style={{ color: 'var(--bb-danger)' }}>Antes</p>
                          <pre className="rounded p-2 text-xs text-bb-gray-700 overflow-auto" style={{ background: 'color-mix(in srgb, var(--bb-danger) 8%, transparent)' }}>{JSON.stringify(log.oldData, null, 2)}</pre>
                        </div>
                      )}
                      {log.newData && (
                        <div>
                          <p className="mb-1 text-xs font-medium" style={{ color: 'var(--bb-success)' }}>Depois</p>
                          <pre className="rounded p-2 text-xs text-bb-gray-700 overflow-auto" style={{ background: 'color-mix(in srgb, var(--bb-success) 8%, transparent)' }}>{JSON.stringify(log.newData, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
