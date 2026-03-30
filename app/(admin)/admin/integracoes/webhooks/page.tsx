'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/hooks/useToast';
import type { OutgoingWebhook, WebhookDelivery, WebhookEvent } from '@/lib/api/webhooks-outgoing.service';
import { listWebhooks, registerWebhook, deleteWebhook, testWebhook, getDeliveryLog } from '@/lib/api/webhooks-outgoing.service';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { ComingSoon } from '@/components/shared/ComingSoon';

const ALL_EVENTS: WebhookEvent[] = [
  'student.created', 'student.updated', 'attendance.created',
  'invoice.created', 'invoice.paid', 'invoice.overdue',
  'progression.created', 'subscription.created', 'subscription.cancelled',
];

export default function WebhooksPage() {
  const { toast } = useToast();
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [webhooks, setWebhooks] = useState<OutgoingWebhook[]>([]);
  const [deliveries, setDeliveries] = useState<Record<string, WebhookDelivery[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    listWebhooks(getActiveAcademyId()).then((w) => { setWebhooks(w); }).catch((err) => { console.error('[WebhooksPage]', err); }).finally(() => { setLoading(false); });
  }, []);

  async function handleCreate() {
    if (!url.trim() || selectedEvents.length === 0) return;
    const wh = await registerWebhook(getActiveAcademyId(), url, selectedEvents);
    setWebhooks((prev) => [wh, ...prev]);
    setShowCreate(false);
    setUrl('');
    setSelectedEvents([]);
  }

  async function handleDelete(whId: string) {
    await deleteWebhook(whId);
    setWebhooks((prev) => prev.filter((w) => w.id !== whId));
  }

  async function handleTest(whId: string) {
    setTesting(whId);
    const result = await testWebhook(whId);
    setTesting(null);
    toast(result.success ? `Sucesso! ${result.responseCode} em ${result.responseTime}ms` : `Falha: ${result.error}`, result.success ? 'success' : 'error');
  }

  async function handleExpand(whId: string) {
    if (expandedId === whId) { setExpandedId(null); return; }
    if (!deliveries[whId]) {
      const logs = await getDeliveryLog(whId);
      setDeliveries((prev) => ({ ...prev, [whId]: logs }));
    }
    setExpandedId(whId);
  }

  function toggleEvent(ev: WebhookEvent) {
    setSelectedEvents((prev) => prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]);
  }

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/admin" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <PageHeader title="Webhooks" subtitle="Configure URLs para receber eventos em tempo real" />

      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setShowCreate(true)}>Novo Webhook</Button>
      </div>

      {showCreate && (
        <div className="rounded-xl border border-bb-gray-200 p-4 space-y-3">
          <h3 className="font-medium">Novo Webhook</h3>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://exemplo.com/webhook" className="w-full rounded-lg border border-bb-gray-200 px-3 py-2" />
          <div>
            <p className="mb-2 text-sm font-medium text-bb-gray-700">Eventos:</p>
            <div className="flex flex-wrap gap-2">
              {ALL_EVENTS.map((ev) => (
                <button key={ev} onClick={() => toggleEvent(ev)} className={`rounded-full px-3 py-1 text-xs font-medium ${selectedEvents.includes(ev) ? 'bg-bb-red text-white' : 'bg-bb-gray-100 text-bb-gray-600'}`}>
                  {ev}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleCreate}>Criar</Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {webhooks.map((wh) => (
          <div key={wh.id} className="rounded-xl border border-bb-gray-200">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-bb-gray-900">{wh.url}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {wh.events.map((ev) => (
                    <span key={ev} className="rounded bg-bb-gray-100 px-2 py-0.5 text-xs text-bb-gray-600">{ev}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => handleExpand(wh.id)}>
                  {expandedId === wh.id ? 'Fechar' : 'Log'}
                </Button>
                <Button variant="secondary" onClick={() => handleTest(wh.id)} disabled={testing === wh.id}>
                  {testing === wh.id ? 'Testando...' : 'Testar'}
                </Button>
                <Button variant="danger" onClick={() => handleDelete(wh.id)}>Excluir</Button>
              </div>
            </div>

            {expandedId === wh.id && deliveries[wh.id] && (
              <div className="border-t border-bb-gray-200 p-4">
                <h4 className="mb-2 text-sm font-medium text-bb-gray-700">Entregas Recentes</h4>
                {deliveries[wh.id].length === 0 ? (
                  <p className="text-sm text-bb-gray-400">Nenhuma entrega registrada</p>
                ) : (
                  <div className="space-y-2">
                    {deliveries[wh.id].map((d) => (
                      <div key={d.id} className="flex items-center gap-3 text-sm">
                        <span className={`h-2 w-2 rounded-full ${d.status === 'success' ? 'bg-green-500' : d.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                        <span className="font-mono text-bb-gray-600">{d.event}</span>
                        <span className="text-bb-gray-400">{d.responseCode ?? '—'}</span>
                        <span className="text-bb-gray-400">{new Date(d.createdAt).toLocaleString('pt-BR')}</span>
                        {d.attemptCount > 1 && <span className="text-xs text-bb-gray-400">({d.attemptCount} tentativas)</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
