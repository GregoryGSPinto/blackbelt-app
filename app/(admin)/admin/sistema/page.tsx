'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import type { SystemStatus } from '@/lib/api/observability.service';
import { getSystemStatus } from '@/lib/api/observability.service';

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}d ${hours}h`;
}

export default function SystemPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSystemStatus().then((s) => { setStatus(s); setLoading(false); });
  }, []);

  if (loading || !status) return <div className="flex justify-center py-20"><Spinner /></div>;

  const statusColor = status.healthStatus === 'healthy' ? 'text-green-600' : status.healthStatus === 'degraded' ? 'text-yellow-600' : 'text-red-600';
  const statusBg = status.healthStatus === 'healthy' ? 'bg-green-100' : status.healthStatus === 'degraded' ? 'bg-yellow-100' : 'bg-red-100';

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <PageHeader title="Status do Sistema" subtitle={`Versão ${status.version}`} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-bb-gray-200 p-4">
          <p className="text-sm text-bb-gray-500">Status</p>
          <p className={`text-lg font-bold ${statusColor}`}>
            <span className={`mr-2 inline-block h-3 w-3 rounded-full ${statusBg}`} />
            {status.healthStatus === 'healthy' ? 'Saudável' : status.healthStatus === 'degraded' ? 'Degradado' : 'Indisponível'}
          </p>
        </div>
        <div className="rounded-xl border border-bb-gray-200 p-4">
          <p className="text-sm text-bb-gray-500">Uptime</p>
          <p className="text-lg font-bold text-bb-gray-900">{formatUptime(status.uptime)}</p>
        </div>
        <div className="rounded-xl border border-bb-gray-200 p-4">
          <p className="text-sm text-bb-gray-500">Tempo Resposta</p>
          <p className="text-lg font-bold text-bb-gray-900">{status.avgResponseTime}ms</p>
        </div>
        <div className="rounded-xl border border-bb-gray-200 p-4">
          <p className="text-sm text-bb-gray-500">Taxa de Erro</p>
          <p className={`text-lg font-bold ${status.errorRate > 1 ? 'text-red-600' : 'text-green-600'}`}>{status.errorRate}%</p>
        </div>
      </div>

      <div className="rounded-xl border border-bb-gray-200 p-4">
        <h3 className="mb-3 font-medium text-bb-gray-900">Uptime (últimos 30 dias)</h3>
        <div className="flex items-end gap-0.5">
          {status.uptimeHistory.map((d) => {
            const h = Math.max(4, Math.round((d.uptime - 99) * 100));
            const color = d.uptime >= 99.9 ? 'bg-green-500' : d.uptime >= 99.5 ? 'bg-green-400' : d.uptime >= 99 ? 'bg-yellow-400' : 'bg-red-400';
            return (
              <div key={d.date} className="group relative flex-1" title={`${d.date}: ${d.uptime.toFixed(2)}%`}>
                <div className={`rounded-sm ${color}`} style={{ height: `${h}px` }} />
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex justify-between text-xs text-bb-gray-400">
          <span>30 dias atrás</span>
          <span>Hoje</span>
        </div>
      </div>

      <div className="rounded-xl border border-bb-gray-200">
        <h3 className="border-b border-bb-gray-200 p-4 font-medium text-bb-gray-900">Erros Recentes</h3>
        {status.recentErrors.length === 0 ? (
          <p className="p-4 text-sm text-bb-gray-400">Nenhum erro recente</p>
        ) : (
          <div className="divide-y divide-bb-gray-100">
            {status.recentErrors.map((err) => (
              <div key={err.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${err.level === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                    <p className="text-sm font-medium text-bb-gray-900">{err.message}</p>
                  </div>
                  <p className="mt-1 text-xs text-bb-gray-400">
                    {err.count}x · Último: {new Date(err.lastSeen).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-bb-gray-200 p-4">
        <h3 className="mb-2 font-medium text-bb-gray-900">Usuários Ativos</h3>
        <p className="text-3xl font-bold text-bb-gray-900">{status.activeUsers}</p>
        <p className="text-sm text-bb-gray-500">conectados agora</p>
      </div>
    </div>
  );
}
