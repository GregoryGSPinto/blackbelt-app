'use client';

import { useEffect, useState } from 'react';
import { listAutomations, toggleAutomation } from '@/lib/api/automations.service';
import type { AutomationConfig } from '@/lib/types/notification';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { PlanGate } from '@/components/plans/PlanGate';
import { EmptyState } from '@/components/ui/EmptyState';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

const CHANNEL_ICONS: Record<string, string> = {
  push: '📱',
  email: '📧',
  whatsapp: '💬',
  sms: '📲',
  in_app: '🔔',
};

export default function AutomacoesPage() {
  const { toast } = useToast();
  const [automations, setAutomations] = useState<AutomationConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAutomations(getActiveAcademyId()).then(setAutomations).finally(() => setLoading(false));
  }, []);

  async function handleToggle(id: string, enabled: boolean) {
    try {
      const updated = await toggleAutomation(id, enabled);
      setAutomations((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast(enabled ? 'Automação ativada' : 'Automação desativada', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const activeCount = automations.filter((a) => a.enabled).length;

  return (
    <PlanGate module="whatsapp">
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-bb-black">Automações</h1>
          <p className="text-sm text-bb-gray-500">{activeCount} de {automations.length} ativas</p>
        </div>
      </div>

      {automations.length === 0 && (
        <EmptyState
          icon="⚡"
          title="Nenhuma automação configurada"
          description="Crie automações para enviar lembretes, alertas de inatividade e mensagens automáticas."
          variant="first-time"
        />
      )}

      <div className="space-y-3">
        {automations.map((auto) => (
          <Card key={auto.id} className={`p-4 transition-opacity ${auto.enabled ? '' : 'opacity-60'}`}>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-bb-black">{auto.name}</h3>
                  <div className="flex gap-1">
                    {auto.channels.map((ch) => (
                      <span key={ch} title={ch} className="text-xs">{CHANNEL_ICONS[ch] ?? ch}</span>
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-sm text-bb-gray-500">{auto.description}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-bb-gray-500">
                  <span>Disparos: {auto.triggerCount}</span>
                  {auto.lastRunAt && (
                    <span>Última execução: {new Date(auto.lastRunAt).toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleToggle(auto.id, !auto.enabled)}
                className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                  auto.enabled ? 'bg-green-500' : 'bg-bb-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    auto.enabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
    </PlanGate>
  );
}
