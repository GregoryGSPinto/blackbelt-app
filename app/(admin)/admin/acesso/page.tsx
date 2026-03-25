'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import {
  getAccessLog,
  getAccessRules,
  configureAccessRules,
  type AccessEvent,
  type AccessRule,
} from '@/lib/api/access-control.service';
import { useToast } from '@/lib/hooks/useToast';
import { EmptyState } from '@/components/ui/EmptyState';
import { translateError } from '@/lib/utils/error-translator';
import { ComingSoon } from '@/components/shared/ComingSoon';

export default function AcessoAdminPage() {
  const { toast } = useToast();
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AccessEvent[]>([]);
  const [rules, setRules] = useState<AccessRule[]>([]);
  const [tab, setTab] = useState<'log' | 'rules'>('log');

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    Promise.all([
      getAccessLog('unit-1'),
      getAccessRules('unit-1'),
    ])
      .then(([e, r]) => { setEvents(e); setRules(r); })
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleRule = async (ruleId: string) => {
    const updated = rules.map((r) =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r,
    );
    setRules(updated);
    try {
      await configureAccessRules('unit-1', updated);
      toast('Regra atualizada', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  };

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/admin" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const blockedEvents = events.filter((e) => !e.allowed);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <PageHeader title="Controle de Acesso" subtitle="Catraca digital e registro de acessos" />

      {/* Blocked alerts */}
      {blockedEvents.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-800">Acessos Bloqueados ({blockedEvents.length})</h3>
          <div className="mt-2 space-y-2">
            {blockedEvents.slice(0, 3).map((ev) => (
              <div key={ev.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-200 text-[10px] font-bold text-red-700">
                    {ev.student_name.charAt(0)}
                  </div>
                  <span className="font-medium text-red-800">{ev.student_name}</span>
                </div>
                <div className="text-right">
                  <p className="text-red-600">{ev.reason}</p>
                  <p className="text-[10px] text-red-400">{new Date(ev.timestamp).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-bb-gray-200">
        <button
          onClick={() => setTab('log')}
          className={`px-4 py-2 text-sm font-medium ${tab === 'log' ? 'border-b-2 border-bb-primary text-bb-primary' : 'text-bb-gray-500'}`}
        >
          Registro em Tempo Real
        </button>
        <button
          onClick={() => setTab('rules')}
          className={`px-4 py-2 text-sm font-medium ${tab === 'rules' ? 'border-b-2 border-bb-primary text-bb-primary' : 'text-bb-gray-500'}`}
        >
          Regras de Acesso
        </button>
      </div>

      {tab === 'log' && (
        <div className="rounded-xl border border-bb-gray-200">
          <div className="border-b border-bb-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-bb-gray-900">Últimos Acessos</h3>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-xs text-bb-gray-500">Ao vivo</span>
              </div>
            </div>
          </div>
          <div className="divide-y divide-bb-gray-100">
            {events.length === 0 && (
              <EmptyState
                icon="🚪"
                title="Nenhum acesso registrado"
                description="Quando alunos passarem pela catraca, os registros aparecerão aqui em tempo real."
              />
            )}
            {events.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${ev.allowed ? 'bg-green-500' : 'bg-red-500'}`}>
                    {ev.student_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-bb-gray-900">{ev.student_name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-bb-gray-500">
                      <span>{ev.direction === 'entry' ? 'Entrada' : 'Saída'}</span>
                      <span>·</span>
                      <span>{ev.method === 'qr_code' ? 'QR Code' : ev.method === 'proximity' ? 'Proximidade' : 'Manual'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${ev.allowed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {ev.allowed ? 'Liberado' : 'Bloqueado'}
                  </span>
                  <p className="mt-0.5 text-[10px] text-bb-gray-400">
                    {new Date(ev.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'rules' && (
        <div className="space-y-4">
          {rules.length === 0 && (
            <EmptyState
              icon="📋"
              title="Nenhuma regra de acesso"
              description="Configure regras para controlar horários permitidos, limite de acessos e bloqueio por inadimplência."
            />
          )}
          {rules.map((rule) => (
            <div key={rule.id} className="rounded-xl border border-bb-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-bb-gray-900">{rule.name}</h4>
                  <p className="mt-0.5 text-xs text-bb-gray-500">
                    {rule.type === 'allowed_hours' && `Horário: ${(rule.config as Record<string, string>).start} - ${(rule.config as Record<string, string>).end}`}
                    {rule.type === 'max_daily_access' && `Máximo ${(rule.config as Record<string, number>).max} acessos por dia`}
                    {rule.type === 'block_overdue' && `Bloqueia após ${(rule.config as Record<string, number>).grace_days} dias de atraso`}
                  </p>
                </div>
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${rule.enabled ? 'bg-green-500' : 'bg-bb-gray-300'}`}
                >
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${rule.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          ))}

          <Button variant="secondary" className="w-full">
            Adicionar Regra
          </Button>
        </div>
      )}
    </div>
  );
}
