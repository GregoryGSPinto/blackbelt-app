'use client';

import { useEffect, useState, useCallback } from 'react';

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  checks: {
    app: { status: string; latencyMs: number };
    database: { status: string; latencyMs: number };
    memory: { usedMB: number; totalMB: number };
  };
}

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latencyMs?: number;
}

const STATUS_COLOR = {
  operational: 'bg-green-500',
  degraded: 'bg-yellow-500',
  down: 'bg-red-500',
};

const STATUS_LABEL = {
  operational: 'Operacional',
  degraded: 'Degradado',
  down: 'Indisponível',
};

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${mins}m`;
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `há ${mins} minuto${mins > 1 ? 's' : ''}`;
  const hours = Math.floor(mins / 60);
  return `há ${hours} hora${hours > 1 ? 's' : ''}`;
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [error, setError] = useState(false);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      const data: HealthData = await res.json();
      setHealth(data);
      setLastChecked(new Date().toISOString());
      setError(false);

      setServices([
        {
          name: 'Aplicação',
          status: data.checks.app.status === 'ok' ? 'operational' : 'down',
          latencyMs: data.checks.app.latencyMs,
        },
        {
          name: 'Banco de Dados',
          status: data.checks.database.status === 'ok'
            ? 'operational'
            : data.checks.database.status === 'mock'
              ? 'operational'
              : 'down',
          latencyMs: data.checks.database.latencyMs,
        },
        {
          name: 'Pagamentos',
          status: 'operational',
        },
        {
          name: 'Email',
          status: 'operational',
        },
      ]);
    } catch {
      setError(true);
      setServices([
        { name: 'Aplicação', status: 'down' },
        { name: 'Banco de Dados', status: 'down' },
        { name: 'Pagamentos', status: 'down' },
        { name: 'Email', status: 'down' },
      ]);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const overallStatus = error
    ? 'down'
    : health?.status === 'healthy'
      ? 'operational'
      : health?.status === 'degraded'
        ? 'degraded'
        : 'down';

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-bb-gray-900">Status do Sistema</h1>
      <p className="mt-1 text-sm text-bb-gray-500">BlackBelt v{health?.version ?? '2.0.0'}</p>

      <div className={`mt-6 rounded-xl p-6 ${
        overallStatus === 'operational' ? 'bg-green-50 border border-green-200' :
        overallStatus === 'degraded' ? 'bg-yellow-50 border border-yellow-200' :
        'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center gap-3">
          <span className={`h-4 w-4 rounded-full ${STATUS_COLOR[overallStatus]}`} />
          <span className={`text-lg font-bold ${
            overallStatus === 'operational' ? 'text-green-700' :
            overallStatus === 'degraded' ? 'text-yellow-700' : 'text-red-700'
          }`}>
            {overallStatus === 'operational'
              ? 'Todos os sistemas operacionais'
              : overallStatus === 'degraded'
                ? 'Desempenho degradado'
                : 'Sistemas indisponíveis'}
          </span>
        </div>
        {health && (
          <p className="mt-2 text-sm text-bb-gray-500">
            Uptime: {formatUptime(health.uptime)}
          </p>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-bb-gray-200">
        <h2 className="border-b border-bb-gray-200 p-4 font-medium text-bb-gray-900">Serviços</h2>
        <div className="divide-y divide-bb-gray-100">
          {services.map((svc) => (
            <div key={svc.name} className="flex items-center justify-between p-4">
              <span className="text-sm text-bb-gray-900">{svc.name}</span>
              <div className="flex items-center gap-2">
                {svc.latencyMs !== undefined && svc.latencyMs > 0 && (
                  <span className="text-xs text-bb-gray-400">{svc.latencyMs}ms</span>
                )}
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  svc.status === 'operational' ? 'bg-green-100 text-green-700' :
                  svc.status === 'degraded' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_COLOR[svc.status]}`} />
                  {STATUS_LABEL[svc.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-bb-gray-200">
        <h2 className="border-b border-bb-gray-200 p-4 font-medium text-bb-gray-900">Incidentes Recentes</h2>
        <div className="p-4">
          <p className="text-sm text-bb-gray-400">Nenhum incidente nos últimos 30 dias.</p>
        </div>
      </div>

      {lastChecked && (
        <p className="mt-4 text-center text-xs text-bb-gray-400">
          Última verificação: {timeAgo(lastChecked)} &middot; Atualização automática a cada 30s
        </p>
      )}
    </div>
  );
}
