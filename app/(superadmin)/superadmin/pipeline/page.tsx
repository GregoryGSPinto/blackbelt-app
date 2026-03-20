'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/lib/hooks/useToast';
import {
  getPipelineMetrics,
  listLeads,
  createLead,
  avancarLead,
  perderLead,
  addLeadNota,
} from '@/lib/api/superadmin-pipeline.service';
import type {
  PipelineMetrics,
  LeadAcademia,
  LeadStatus,
  CreateLeadPayload,
  LeadOrigem,
} from '@/lib/api/superadmin-pipeline.service';
import {
  DollarIcon,
  TrendingUpIcon,
  ClockIcon,
  StarIcon,
  PlusIcon,
  ChevronRightIcon,
  PhoneIcon,
  MapPinIcon,
  SendIcon,
} from '@/components/shell/icons';
import { translateError } from '@/lib/utils/error-translator';

// -- Constants ----------------------------------------------------------------

const AMBER = '#f59e0b';
const GREEN = '#22c55e';
const RED = '#ef4444';
const BLUE = '#3b82f6';

const STAGE_ORDER: LeadStatus[] = ['lead', 'contato', 'demo_agendada', 'demo_realizada', 'trial', 'ativo'];

const STAGE_CONFIG: Record<LeadStatus | 'perdido', { label: string; color: string }> = {
  lead: { label: 'Lead', color: '#6b7280' },
  contato: { label: 'Contato', color: BLUE },
  demo_agendada: { label: 'Demo', color: '#6366f1' },
  demo_realizada: { label: 'Demo OK', color: '#8b5cf6' },
  trial: { label: 'Trial', color: AMBER },
  ativo: { label: 'Ativo', color: GREEN },
  perdido: { label: 'Perdido', color: RED },
};

const NEXT_STAGE: Record<string, string> = {
  lead: 'Contato',
  contato: 'Demo',
  demo_agendada: 'Demo OK',
  demo_realizada: 'Trial',
  trial: 'Ativo',
};

const ORIGENS: LeadOrigem[] = ['site', 'indicacao', 'instagram', 'google_ads', 'evento', 'cold_call'];

const ORIGEM_LABELS: Record<LeadOrigem, string> = {
  site: 'Site',
  indicacao: 'Indicação',
  instagram: 'Instagram',
  google_ads: 'Google Ads',
  evento: 'Evento',
  cold_call: 'Cold Call',
};

const PLANOS = ['Starter', 'Professional', 'Enterprise'];

const MODALIDADES_OPTIONS = [
  'Jiu-Jitsu',
  'Muay Thai',
  'Boxe',
  'Judô',
  'Karatê',
  'Wrestling',
  'MMA',
  'Taekwondo',
  'Kickboxing',
  'Capoeira',
];

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
];

type TabFilter = LeadStatus | 'todos' | 'perdido';

// -- Helpers ------------------------------------------------------------------

function fmtMoney(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

// -- Shared Styles ------------------------------------------------------------

const cardStyle = {
  background: 'var(--bb-depth-3)',
  border: '1px solid var(--bb-glass-border)',
  boxShadow: 'var(--bb-shadow-sm)',
};

const inputStyle = {
  background: 'var(--bb-depth-2)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-md)',
  color: 'var(--bb-ink-100)',
  fontSize: 14,
};

// -- Component ----------------------------------------------------------------

export default function PipelinePage() {
  const { toast } = useToast();

  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null);
  const [leads, setLeads] = useState<LeadAcademia[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>('todos');
  const [actioningIds, setActioningIds] = useState<Set<string>>(new Set());

  // Detail modal
  const [detailLead, setDetailLead] = useState<LeadAcademia | null>(null);
  const [notaText, setNotaText] = useState('');
  const [addingNota, setAddingNota] = useState(false);

  // New lead modal
  const [showNewLead, setShowNewLead] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newLead, setNewLead] = useState<CreateLeadPayload>({
    nomeAcademia: '',
    contatoNome: '',
    contatoEmail: '',
    contatoTelefone: '',
    cidade: '',
    estado: '',
    modalidades: [],
    quantidadeAlunos: 0,
    origem: 'site',
    planoInteresse: 'Starter',
    valorEstimado: 0,
    observacoes: '',
  });

  // -- Data Loading -----------------------------------------------------------

  const loadData = useCallback(async () => {
    try {
      const [m, l] = await Promise.all([getPipelineMetrics(), listLeads()]);
      setMetrics(m);
      setLeads(l);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // -- Actions ----------------------------------------------------------------

  const handleAvancar = useCallback(async (lead: LeadAcademia) => {
    setActioningIds((prev) => new Set(prev).add(lead.id));
    try {
      const updated = await avancarLead(lead.id);
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? updated : l)));
      if (detailLead?.id === lead.id) setDetailLead(updated);
      toast(`${lead.nomeAcademia} avançou para ${STAGE_CONFIG[updated.status]?.label ?? updated.status}`, 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setActioningIds((prev) => {
        const next = new Set(prev);
        next.delete(lead.id);
        return next;
      });
    }
  }, [toast, detailLead]);

  const handlePerder = useCallback(async (lead: LeadAcademia) => {
    setActioningIds((prev) => new Set(prev).add(lead.id));
    try {
      const updated = await perderLead(lead.id);
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? updated : l)));
      if (detailLead?.id === lead.id) setDetailLead(updated);
      toast(`${lead.nomeAcademia} marcado como perdido`, 'warning');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setActioningIds((prev) => {
        const next = new Set(prev);
        next.delete(lead.id);
        return next;
      });
    }
  }, [toast, detailLead]);

  const handleAddNota = useCallback(async () => {
    if (!detailLead || !notaText.trim()) return;
    setAddingNota(true);
    try {
      await addLeadNota(detailLead.id, notaText.trim());
      const updatedLead: LeadAcademia = {
        ...detailLead,
        historico: [
          { data: new Date().toISOString(), acao: 'Nota adicionada', detalhe: notaText.trim() },
          ...detailLead.historico,
        ],
      };
      setDetailLead(updatedLead);
      setLeads((prev) => prev.map((l) => (l.id === detailLead.id ? updatedLead : l)));
      setNotaText('');
      toast('Nota adicionada', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setAddingNota(false);
    }
  }, [detailLead, notaText, toast]);

  const handleCreateLead = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!newLead.nomeAcademia.trim() || !newLead.contatoNome.trim()) {
      toast('Preencha pelo menos nome da academia e contato', 'warning');
      return;
    }
    setCreating(true);
    try {
      const created = await createLead(newLead);
      setLeads((prev) => [created, ...prev]);
      setShowNewLead(false);
      setNewLead({
        nomeAcademia: '',
        contatoNome: '',
        contatoEmail: '',
        contatoTelefone: '',
        cidade: '',
        estado: '',
        modalidades: [],
        quantidadeAlunos: 0,
        origem: 'site',
        planoInteresse: 'Starter',
        valorEstimado: 0,
        observacoes: '',
      });
      toast(`Lead ${created.nomeAcademia} criado`, 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setCreating(false);
    }
  }, [newLead, toast]);

  const toggleModalidade = useCallback((mod: string) => {
    setNewLead((prev) => ({
      ...prev,
      modalidades: prev.modalidades.includes(mod)
        ? prev.modalidades.filter((m) => m !== mod)
        : [...prev.modalidades, mod],
    }));
  }, []);

  // -- Filtered Leads ---------------------------------------------------------

  const filteredLeads = activeTab === 'todos'
    ? leads
    : leads.filter((l) => l.status === activeTab);

  // -- Skeleton ---------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton variant="text" className="h-8 w-56" />
        <Skeleton variant="card" className="h-20" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-24" />
          ))}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} variant="text" className="h-9 w-20" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex h-64 items-center justify-center p-6">
        <p style={{ color: 'var(--bb-ink-60)' }}>Nenhum dado de pipeline disponível.</p>
      </div>
    );
  }

  // -- Funnel Computation -----------------------------------------------------

  const funnelStages = metrics.funil.filter((s) => s.nome !== 'perdido');
  const perdidoStage = metrics.funil.find((s) => s.nome === 'perdido');
  const maxQty = Math.max(...funnelStages.map((s) => s.quantidade), 1);

  return (
    <div className="space-y-6 p-6">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-bold"
            style={{ fontSize: 28, color: 'var(--bb-ink-100)' }}
          >
            Pipeline Comercial
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            {metrics.leadsEsteMes} leads este mês &middot; {metrics.conversaoEsteMes} conversões
          </p>
        </div>
        <Button
          size="md"
          onClick={() => setShowNewLead(true)}
          style={{ background: AMBER }}
        >
          <PlusIcon className="mr-1.5 h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      {/* ── FUNIL VISUAL ────────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-5"
        style={cardStyle}
      >
        <div className="flex items-end gap-1">
          {funnelStages.map((stage, idx) => {
            const config = STAGE_CONFIG[stage.nome as LeadStatus] ?? { label: stage.nome, color: '#6b7280' };
            const widthPct = Math.max((stage.quantidade / maxQty) * 100, 15);
            const nextStage = funnelStages[idx + 1];
            const convRate = nextStage && stage.quantidade > 0
              ? ((nextStage.quantidade / stage.quantidade) * 100).toFixed(0)
              : null;

            return (
              <div key={stage.nome} className="flex items-end" style={{ flex: `0 0 ${widthPct / funnelStages.length * funnelStages.length}%` }}>
                <div className="flex-1">
                  <div className="mb-1 text-center">
                    <span className="text-xs font-medium" style={{ color: config.color }}>
                      {config.label}
                    </span>
                  </div>
                  <div
                    className="flex items-center justify-center rounded-lg py-3"
                    style={{
                      background: `${config.color}18`,
                      borderBottom: `3px solid ${config.color}`,
                      minHeight: 48,
                    }}
                  >
                    <span className="text-lg font-bold" style={{ color: config.color }}>
                      {stage.quantidade}
                    </span>
                  </div>
                  <div className="mt-0.5 text-center">
                    <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                      {fmtMoney(stage.valor)}
                    </span>
                  </div>
                </div>
                {convRate !== null && (
                  <div className="flex flex-col items-center px-1" style={{ minWidth: 32 }}>
                    <ChevronRightIcon className="h-3 w-3" style={{ color: 'var(--bb-ink-30)' }} />
                    <span className="text-[10px] font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                      {convRate}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Perdido block */}
        {perdidoStage && (
          <div className="mt-3">
            <div
              className="flex items-center justify-between rounded-lg px-4 py-2"
              style={{
                background: 'rgba(107,114,128,0.08)',
                border: '1px solid rgba(107,114,128,0.15)',
              }}
            >
              <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                Perdido
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold" style={{ color: 'var(--bb-ink-40)' }}>
                  {perdidoStage.quantidade}
                </span>
                <span className="text-xs" style={{ color: 'var(--bb-ink-30)' }}>
                  {fmtMoney(perdidoStage.valor)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── METRICS CARDS ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Pipeline Total', value: `${fmtMoney(metrics.valorPipelineTotal)}/ano`, icon: DollarIcon, color: AMBER },
          { label: 'Conversão', value: `${metrics.taxaConversaoGeral.toFixed(1)}%`, icon: TrendingUpIcon, color: GREEN },
          { label: 'Tempo Médio', value: `${metrics.tempoMedioConversao} dias`, icon: ClockIcon, color: BLUE },
          { label: 'Melhor Origem', value: ORIGEM_LABELS[metrics.melhorOrigem as LeadOrigem] ?? metrics.melhorOrigem, icon: StarIcon, color: '#a855f7' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl p-4"
              style={cardStyle}
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon className="h-4 w-4" style={{ color: card.color }} />
                <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  {card.label}
                </span>
              </div>
              <p className="text-lg font-bold" style={{ color: card.color }}>
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── TABS ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {(['todos', ...STAGE_ORDER, 'perdido'] as TabFilter[]).map((tab) => {
          const config = tab === 'todos'
            ? { label: 'Todos', color: AMBER }
            : STAGE_CONFIG[tab];
          const isActive = activeTab === tab;
          const count = tab === 'todos'
            ? leads.length
            : leads.filter((l) => l.status === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                background: isActive ? `${config.color}20` : 'transparent',
                color: isActive ? config.color : 'var(--bb-ink-60)',
                border: isActive ? `1px solid ${config.color}40` : '1px solid transparent',
              }}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ── LEAD CARDS ──────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredLeads.length === 0 && (
          <div
            className="rounded-xl py-12 text-center"
            style={cardStyle}
          >
            <p style={{ color: 'var(--bb-ink-40)' }}>Nenhum lead nesta etapa.</p>
          </div>
        )}

        {filteredLeads.map((lead) => {
          const config = STAGE_CONFIG[lead.status] ?? STAGE_CONFIG.lead;
          const isActioning = actioningIds.has(lead.id);
          const canAdvance = lead.status !== 'ativo' && lead.status !== 'perdido';

          return (
            <div
              key={lead.id}
              className="rounded-xl p-4"
              style={{
                ...cardStyle,
                borderLeft: `4px solid ${config.color}`,
              }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                {/* Lead info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: 'var(--bb-ink-100)' }}
                    >
                      {lead.nomeAcademia}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        background: `${config.color}18`,
                        color: config.color,
                      }}
                    >
                      {config.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      <MapPinIcon className="h-3 w-3" />
                      {lead.cidade}/{lead.estado}
                    </span>
                  </div>

                  {/* Contact */}
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    <span className="flex items-center gap-1">
                      <PhoneIcon className="h-3 w-3" />
                      {lead.contatoNome} &middot; {lead.contatoTelefone}
                    </span>
                  </div>

                  {/* Modalidades */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {lead.modalidades.map((mod) => (
                      <span
                        key={mod}
                        className="rounded px-1.5 py-0.5 text-[10px]"
                        style={{
                          background: 'var(--bb-depth-5)',
                          color: 'var(--bb-ink-60)',
                        }}
                      >
                        {mod}
                      </span>
                    ))}
                  </div>

                  {/* Bottom row */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span style={{ color: 'var(--bb-ink-40)' }}>
                      ~{lead.quantidadeAlunos} alunos
                    </span>
                    <span style={{ color: 'var(--bb-ink-40)' }}>
                      {lead.planoInteresse}
                    </span>
                    <span className="font-semibold" style={{ color: AMBER }}>
                      {fmtMoney(lead.valorEstimado)}/mês
                    </span>
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px]"
                      style={{
                        background: 'var(--bb-depth-5)',
                        color: 'var(--bb-ink-60)',
                      }}
                    >
                      {ORIGEM_LABELS[lead.origem] ?? lead.origem}
                    </span>
                    <span className="flex items-center gap-1" style={{ color: 'var(--bb-ink-30)' }}>
                      <ClockIcon className="h-3 w-3" />
                      {timeAgo(lead.atualizadoEm)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  {canAdvance && (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={isActioning}
                      onClick={() => handleAvancar(lead)}
                      style={{
                        background: `${GREEN}12`,
                        color: GREEN,
                        border: `1px solid ${GREEN}30`,
                      }}
                    >
                      Avançar
                    </Button>
                  )}
                  {canAdvance && (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={isActioning}
                      onClick={() => handlePerder(lead)}
                      style={{
                        background: `${RED}12`,
                        color: RED,
                        border: `1px solid ${RED}30`,
                      }}
                    >
                      Perder
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDetailLead(lead);
                      setNotaText('');
                    }}
                  >
                    Detalhes
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DETAIL MODAL ────────────────────────────────────────────────── */}
      <Modal
        open={detailLead !== null}
        onClose={() => setDetailLead(null)}
        title={detailLead?.nomeAcademia ?? 'Detalhes do Lead'}
        className="max-w-2xl"
      >
        {detailLead && (
          <div className="space-y-5">
            {/* Status badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  background: `${STAGE_CONFIG[detailLead.status]?.color ?? '#6b7280'}18`,
                  color: STAGE_CONFIG[detailLead.status]?.color ?? '#6b7280',
                }}
              >
                {STAGE_CONFIG[detailLead.status]?.label ?? detailLead.status}
              </span>
              <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Criado {timeAgo(detailLead.criadoEm)}
              </span>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Contato', value: detailLead.contatoNome },
                { label: 'Email', value: detailLead.contatoEmail },
                { label: 'Telefone', value: detailLead.contatoTelefone },
                { label: 'Cidade/UF', value: `${detailLead.cidade}/${detailLead.estado}` },
                { label: 'Alunos Est.', value: String(detailLead.quantidadeAlunos) },
                { label: 'Plano', value: detailLead.planoInteresse },
                { label: 'Valor/mês', value: fmtMoney(detailLead.valorEstimado) },
                { label: 'Origem', value: ORIGEM_LABELS[detailLead.origem] ?? detailLead.origem },
                { label: 'Responsável', value: detailLead.responsavel },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                    {item.label}
                  </p>
                  <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {item.value || '-'}
                  </p>
                </div>
              ))}
            </div>

            {/* Modalidades */}
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                Modalidades
              </p>
              <div className="flex flex-wrap gap-1">
                {detailLead.modalidades.map((mod) => (
                  <span
                    key={mod}
                    className="rounded px-2 py-0.5 text-xs"
                    style={{
                      background: `${AMBER}15`,
                      color: AMBER,
                    }}
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </div>

            {/* Observações */}
            {detailLead.observacoes && (
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                  Observações
                </p>
                <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                  {detailLead.observacoes}
                </p>
              </div>
            )}

            {/* Timeline */}
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                Histórico
              </p>
              <div className="space-y-2">
                {detailLead.historico.length === 0 && (
                  <p className="text-xs" style={{ color: 'var(--bb-ink-30)' }}>
                    Nenhum histórico disponível.
                  </p>
                )}
                {detailLead.historico.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-lg px-3 py-2"
                    style={{ background: 'var(--bb-depth-2)' }}
                  >
                    <div
                      className="mt-1 h-2 w-2 shrink-0 rounded-full"
                      style={{ background: AMBER }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                          {entry.acao}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--bb-ink-30)' }}>
                          {timeAgo(entry.data)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        {entry.detalhe}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add nota */}
            <div className="flex gap-2">
              <input
                type="text"
                value={notaText}
                onChange={(e) => setNotaText(e.target.value)}
                placeholder="Adicionar nota..."
                className="h-9 flex-1 rounded-lg px-3 text-sm outline-none"
                style={inputStyle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddNota();
                }}
              />
              <Button
                size="sm"
                loading={addingNota}
                disabled={!notaText.trim()}
                onClick={handleAddNota}
                style={{ background: AMBER }}
              >
                <SendIcon className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Actions */}
            {detailLead.status !== 'ativo' && detailLead.status !== 'perdido' && (
              <div className="flex gap-2 border-t pt-4" style={{ borderColor: 'var(--bb-glass-border)' }}>
                <Button
                  size="md"
                  onClick={() => handleAvancar(detailLead)}
                  loading={actioningIds.has(detailLead.id)}
                  style={{ background: GREEN, flex: 1 }}
                >
                  Avançar para {NEXT_STAGE[detailLead.status] ?? 'próximo'}
                </Button>
                <Button
                  size="md"
                  variant="danger"
                  onClick={() => handlePerder(detailLead)}
                  loading={actioningIds.has(detailLead.id)}
                >
                  Perder
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── NEW LEAD MODAL ──────────────────────────────────────────────── */}
      <Modal
        open={showNewLead}
        onClose={() => setShowNewLead(false)}
        title="Novo Lead"
        className="max-w-2xl"
      >
        <form onSubmit={handleCreateLead} className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                Nome da Academia *
              </label>
              <input
                type="text"
                required
                value={newLead.nomeAcademia}
                onChange={(e) => setNewLead((p) => ({ ...p, nomeAcademia: e.target.value }))}
                className="h-10 w-full px-3 text-sm outline-none"
                style={inputStyle}
                placeholder="Ex: Academia Fight Club"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                Nome do Contato *
              </label>
              <input
                type="text"
                required
                value={newLead.contatoNome}
                onChange={(e) => setNewLead((p) => ({ ...p, contatoNome: e.target.value }))}
                className="h-10 w-full px-3 text-sm outline-none"
                style={inputStyle}
                placeholder="Ex: João Silva"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                Email
              </label>
              <input
                type="email"
                value={newLead.contatoEmail}
                onChange={(e) => setNewLead((p) => ({ ...p, contatoEmail: e.target.value }))}
                className="h-10 w-full px-3 text-sm outline-none"
                style={inputStyle}
                placeholder="contato@academia.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                Telefone
              </label>
              <input
                type="tel"
                value={newLead.contatoTelefone}
                onChange={(e) => setNewLead((p) => ({ ...p, contatoTelefone: e.target.value }))}
                className="h-10 w-full px-3 text-sm outline-none"
                style={inputStyle}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Row 3 - City / State */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                Cidade
              </label>
              <input
                type="text"
                value={newLead.cidade}
                onChange={(e) => setNewLead((p) => ({ ...p, cidade: e.target.value }))}
                className="h-10 w-full px-3 text-sm outline-none"
                style={inputStyle}
                placeholder="São Paulo"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                Estado
              </label>
              <select
                value={newLead.estado}
                onChange={(e) => setNewLead((p) => ({ ...p, estado: e.target.value }))}
                className="h-10 w-full px-3 text-sm outline-none"
                style={inputStyle}
              >
                <option value="">Selecione</option>
                {ESTADOS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Modalidades multi-select */}
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Modalidades
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MODALIDADES_OPTIONS.map((mod) => {
                const selected = newLead.modalidades.includes(mod);
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => toggleModalidade(mod)}
                    className="rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
                    style={{
                      background: selected ? `${AMBER}20` : 'var(--bb-depth-2)',
                      color: selected ? AMBER : 'var(--bb-ink-60)',
                      border: selected ? `1px solid ${AMBER}40` : '1px solid var(--bb-glass-border)',
                    }}
                  >
                    {mod}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                Estimativa de Alunos
              </label>
              <input
                type="number"
                min={0}
                value={newLead.quantidadeAlunos || ''}
                onChange={(e) => setNewLead((p) => ({ ...p, quantidadeAlunos: parseInt(e.target.value) || 0 }))}
                className="h-10 w-full px-3 text-sm outline-none"
                style={inputStyle}
                placeholder="100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                Plano de Interesse
              </label>
              <select
                value={newLead.planoInteresse}
                onChange={(e) => setNewLead((p) => ({ ...p, planoInteresse: e.target.value }))}
                className="h-10 w-full px-3 text-sm outline-none"
                style={inputStyle}
              >
                {PLANOS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                Valor Estimado/mês
              </label>
              <input
                type="number"
                min={0}
                step={100}
                value={newLead.valorEstimado || ''}
                onChange={(e) => setNewLead((p) => ({ ...p, valorEstimado: parseFloat(e.target.value) || 0 }))}
                className="h-10 w-full px-3 text-sm outline-none"
                style={inputStyle}
                placeholder="1500"
              />
            </div>
          </div>

          {/* Origem */}
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Origem
            </label>
            <select
              value={newLead.origem}
              onChange={(e) => setNewLead((p) => ({ ...p, origem: e.target.value as LeadOrigem }))}
              className="h-10 w-full px-3 text-sm outline-none"
              style={inputStyle}
            >
              {ORIGENS.map((o) => (
                <option key={o} value={o}>{ORIGEM_LABELS[o]}</option>
              ))}
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Observações
            </label>
            <textarea
              value={newLead.observacoes}
              onChange={(e) => setNewLead((p) => ({ ...p, observacoes: e.target.value }))}
              rows={3}
              className="w-full resize-none px-3 py-2 text-sm outline-none"
              style={inputStyle}
              placeholder="Detalhes adicionais sobre o lead..."
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: 'var(--bb-glass-border)' }}>
            <Button
              type="button"
              size="md"
              variant="ghost"
              onClick={() => setShowNewLead(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="md"
              loading={creating}
              style={{ background: AMBER }}
            >
              <PlusIcon className="mr-1.5 h-4 w-4" />
              Adicionar Lead
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
