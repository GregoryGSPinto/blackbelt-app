'use client';

import { useEffect, useState } from 'react';
import {
  getCampaigns,
  createCampaign,
  getCampaignMetrics,
  TEMPLATE_LABELS,
  TEMPLATE_ICONS,
  STATUS_LABELS,
  type CampaignDTO,
  type CampaignMetricsDTO,
  type CampaignTemplate,
  type CampaignStatus,
  type CreateCampaignInput,
} from '@/lib/api/campanhas.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { EmptyState } from '@/components/ui/EmptyState';
import { translateError } from '@/lib/utils/error-translator';

const STATUS_COLOR: Record<CampaignStatus, string> = {
  draft: 'bg-bb-gray-100 text-bb-gray-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
};

const TEMPLATES: CampaignTemplate[] = ['volte_treinar', 'traga_amigo', 'upgrade_premium', 'familia', 'competicao'];

const AUDIENCE_OPTIONS = [
  'Todos os alunos ativos',
  'Alunos inativos ha mais de 15 dias',
  'Alunos no plano basico',
  'Faixa azul e acima',
  'Faixa branca e cinza',
  'Responsaveis',
];

export default function CampanhasPage() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<CampaignDTO[]>([]);
  const [metricsMap, setMetricsMap] = useState<Record<string, CampaignMetricsDTO>>({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<CampaignDTO | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formTemplate, setFormTemplate] = useState<CampaignTemplate>('volte_treinar');
  const [formAudience, setFormAudience] = useState(AUDIENCE_OPTIONS[0]);
  const [formSchedule, setFormSchedule] = useState('');

  useEffect(() => {
    getCampaigns('academy-1')
      .then(async (data) => {
        setCampaigns(data);
        // Load metrics for all campaigns
        const metricsPromises = data.map((c) =>
          getCampaignMetrics(c.id).catch(() => null),
        );
        const results = await Promise.all(metricsPromises);
        const mMap: Record<string, CampaignMetricsDTO> = {};
        results.forEach((m) => {
          if (m) mMap[m.campaign_id] = m;
        });
        setMetricsMap(mMap);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!formName.trim()) {
      toast('Preencha o nome da campanha', 'error');
      return;
    }
    setCreating(true);
    try {
      const input: CreateCampaignInput = {
        name: formName.trim(),
        template: formTemplate,
        target_audience: formAudience,
        scheduled_at: formSchedule ? new Date(formSchedule).toISOString() : null,
      };
      const newCampaign = await createCampaign(input);
      setCampaigns((prev) => [newCampaign, ...prev]);
      setShowCreate(false);
      setFormName('');
      setFormSchedule('');
      toast('Campanha criada com sucesso!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Campanhas</h1>
        <Button onClick={() => setShowCreate(true)}>Nova Campanha</Button>
      </div>

      {/* Template Quick Access */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl}
            onClick={() => {
              setFormTemplate(tpl);
              setFormName(TEMPLATE_LABELS[tpl]);
              setShowCreate(true);
            }}
            className="flex flex-col items-center gap-2 rounded-lg border border-bb-gray-300 bg-bb-white p-4 transition-all hover:border-bb-red hover:shadow-md"
          >
            <span className="text-2xl">{TEMPLATE_ICONS[tpl]}</span>
            <span className="text-center text-xs font-medium text-bb-gray-700">
              {TEMPLATE_LABELS[tpl]}
            </span>
          </button>
        ))}
      </div>

      {/* Campaign List */}
      <Card className="overflow-hidden">
        <div className="border-b border-bb-gray-300 p-4">
          <h2 className="font-semibold text-bb-black">Todas as Campanhas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Campanha</th>
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Template</th>
                <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Status</th>
                <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Audiencia</th>
                <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Enviados</th>
                <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Abertos</th>
                <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Convertidos</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Acao</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 && (
                <tr><td colSpan={8}>
                  <EmptyState
                    icon="📣"
                    title="Nenhuma campanha criada"
                    description="Crie campanhas de marketing para engajar alunos inativos e promover upgrades."
                    actionLabel="Nova Campanha"
                    onAction={() => setShowCreate(true)}
                    variant="first-time"
                  />
                </td></tr>
              )}
              {campaigns.map((camp) => {
                const metrics = metricsMap[camp.id];
                return (
                  <tr key={camp.id} className="border-b border-bb-gray-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{TEMPLATE_ICONS[camp.template]}</span>
                        <div>
                          <p className="font-medium text-bb-black">{camp.name}</p>
                          <p className="text-xs text-bb-gray-500">
                            {camp.scheduled_at
                              ? `Agendada: ${new Date(camp.scheduled_at).toLocaleDateString('pt-BR')}`
                              : 'Nao agendada'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-bb-gray-500">
                      {TEMPLATE_LABELS[camp.template]}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[camp.status]}`}>
                        {STATUS_LABELS[camp.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-bb-gray-500">{camp.target_count}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {metrics ? (
                        <div>
                          <span className="font-medium text-bb-black">{metrics.sent}</span>
                        </div>
                      ) : (
                        <span className="text-bb-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {metrics && metrics.sent > 0 ? (
                        <div>
                          <span className="font-medium text-bb-black">{metrics.opened}</span>
                          <span className="ml-1 text-xs text-bb-gray-500">({metrics.open_rate}%)</span>
                        </div>
                      ) : (
                        <span className="text-bb-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {metrics && metrics.sent > 0 ? (
                        <div>
                          <span className="font-medium text-bb-success">{metrics.converted}</span>
                          <span className="ml-1 text-xs text-bb-gray-500">({metrics.conversion_rate}%)</span>
                        </div>
                      ) : (
                        <span className="text-bb-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedMetric(camp)}
                        className="rounded-lg bg-bb-gray-100 px-3 py-1 text-xs font-medium text-bb-gray-700 hover:bg-bb-gray-300"
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Campaign Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nova Campanha">
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-bb-gray-700">Nome da campanha</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ex: Volte a treinar - Marco"
              className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm text-bb-black placeholder:text-bb-gray-500 focus:border-bb-red focus:outline-none"
            />
          </div>

          {/* Template */}
          <div>
            <label className="mb-1 block text-sm font-medium text-bb-gray-700">Template</label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl}
                  onClick={() => setFormTemplate(tpl)}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-all ${
                    formTemplate === tpl
                      ? 'border-bb-red bg-red-50'
                      : 'border-bb-gray-300 hover:border-bb-gray-500'
                  }`}
                >
                  <span>{TEMPLATE_ICONS[tpl]}</span>
                  <span className="font-medium text-bb-black">{TEMPLATE_LABELS[tpl]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div>
            <label className="mb-1 block text-sm font-medium text-bb-gray-700">Publico-alvo</label>
            <select
              value={formAudience}
              onChange={(e) => setFormAudience(e.target.value)}
              className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm text-bb-black focus:border-bb-red focus:outline-none"
            >
              {AUDIENCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Schedule */}
          <div>
            <label className="mb-1 block text-sm font-medium text-bb-gray-700">Agendamento (opcional)</label>
            <input
              type="datetime-local"
              value={formSchedule}
              onChange={(e) => setFormSchedule(e.target.value)}
              className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm text-bb-black focus:border-bb-red focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowCreate(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleCreate} loading={creating}>
              Criar Campanha
            </Button>
          </div>
        </div>
      </Modal>

      {/* Campaign Detail Modal */}
      <Modal
        open={!!selectedMetric}
        onClose={() => setSelectedMetric(null)}
        title={selectedMetric?.name ?? ''}
      >
        {selectedMetric && (
          <div className="space-y-4">
            {/* Campaign Info */}
            <div className="flex items-center gap-3">
              <span className="text-3xl">{TEMPLATE_ICONS[selectedMetric.template]}</span>
              <div>
                <p className="font-semibold text-bb-black">{selectedMetric.name}</p>
                <p className="text-xs text-bb-gray-500">{selectedMetric.target_audience}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[selectedMetric.status]}`}>
                  {STATUS_LABELS[selectedMetric.status]}
                </span>
              </div>
            </div>

            {/* Metrics */}
            {metricsMap[selectedMetric.id] && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Enviados', value: metricsMap[selectedMetric.id].sent, color: 'text-bb-black' },
                  { label: 'Abertos', value: `${metricsMap[selectedMetric.id].opened} (${metricsMap[selectedMetric.id].open_rate}%)`, color: 'text-bb-info' },
                  { label: 'Convertidos', value: `${metricsMap[selectedMetric.id].converted} (${metricsMap[selectedMetric.id].conversion_rate}%)`, color: 'text-bb-success' },
                  { label: 'Alvos', value: selectedMetric.target_count, color: 'text-bb-gray-700' },
                ].map((stat) => (
                  <Card key={stat.label} variant="outlined" className="p-3">
                    <p className="text-xs text-bb-gray-500">{stat.label}</p>
                    <p className={`mt-1 text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  </Card>
                ))}
              </div>
            )}

            {/* Funnel visualization */}
            {metricsMap[selectedMetric.id] && metricsMap[selectedMetric.id].sent > 0 && (
              <Card variant="outlined" className="p-4">
                <p className="mb-3 text-xs font-medium text-bb-gray-500">Funil de Conversao</p>
                {[
                  { label: 'Enviados', value: metricsMap[selectedMetric.id].sent, pct: 100 },
                  { label: 'Abertos', value: metricsMap[selectedMetric.id].opened, pct: metricsMap[selectedMetric.id].open_rate },
                  { label: 'Convertidos', value: metricsMap[selectedMetric.id].converted, pct: metricsMap[selectedMetric.id].conversion_rate },
                ].map((step) => (
                  <div key={step.label} className="mb-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-bb-gray-500">{step.label}</span>
                      <span className="font-medium text-bb-black">{step.value}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-bb-gray-100">
                      <div
                        className="h-full rounded-full bg-bb-red transition-all"
                        style={{ width: `${step.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </Card>
            )}

            <Button className="w-full" onClick={() => setSelectedMetric(null)}>
              Fechar
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
