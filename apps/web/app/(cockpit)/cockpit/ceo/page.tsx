'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Clock,
  Users,
  Activity,
  DollarSign,
  Star,
  Plus,
  ChevronDown,
  ChevronRight,
  Rocket,
  Archive,
  X,
  Loader2,
  ListFilter,
  FileText,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { KpiCard } from '@/components/cockpit/KpiCard';
import { StatusBadge } from '@/components/cockpit/StatusBadge';
import { RiceScorer } from '@/components/cockpit/RiceScorer';
import { MiniChart } from '@/components/cockpit/MiniChart';
import { SectionHeader } from '@/components/cockpit/SectionHeader';
import { EmptyState } from '@/components/cockpit/EmptyState';
import { ConfirmDialog } from '@/components/cockpit/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import type {
  KpiSnapshot,
  FeatureBacklogItem,
  OperationalCost,
  ArchitectureDecision,
} from '@/lib/api/cockpit.service';
import {
  getKpiSnapshot,
  getFeatureBacklog,
  createFeature,
  updateFeature,
  moveFeatureStatus,
  getOperationalCosts,
  createCost,
  updateCost,
  deleteCost,
  getTotalMonthlyCost,
  getArchitectureDecisions,
  createADR,
  updateADR,
} from '@/lib/api/cockpit.service';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRODUCT = 'blackbelt';

const PIPELINE_FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: 'backlog', label: 'Backlog' },
  { key: 'sprint', label: 'Sprint' },
  { key: 'icebox', label: 'Icebox' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'killed', label: 'Killed' },
] as const;

type PipelineFilter = (typeof PIPELINE_FILTERS)[number]['key'];

const MODULE_OPTIONS = [
  'cockpit', 'checkin', 'video-aulas', 'campeonatos', 'marketplace',
  'notificacoes', 'diario-aula', 'responsavel', 'kids', 'federacao', 'outros',
];

const PERSONA_OPTIONS = [
  'admin', 'professor', 'aluno', 'teen', 'kids', 'responsavel',
  'recepcao', 'superadmin',
];

const COST_CATEGORIES = [
  { value: 'infra', label: 'Infra' },
  { value: 'domain', label: 'Domínio' },
  { value: 'api', label: 'API' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'tools', label: 'Ferramentas' },
  { value: 'legal', label: 'Legal' },
  { value: 'other', label: 'Outro' },
];

const COST_FREQUENCIES = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' },
  { value: 'usage_based', label: 'Uso' },
];

const ADR_STATUSES = ['proposed', 'accepted', 'deprecated'] as const;

// ---------------------------------------------------------------------------
// Badge variant helpers
// ---------------------------------------------------------------------------

function phaseBadgeVariant(phase: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  switch (phase) {
    case 'shipped': return 'success';
    case 'building':
    case 'sprint': return 'info';
    case 'ready':
    case 'backlog': return 'warning';
    case 'icebox': return 'neutral';
    case 'killed': return 'danger';
    default: return 'neutral';
  }
}

function costCategoryVariant(cat: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  switch (cat) {
    case 'infra':
    case 'hosting':
    case 'database':
    case 'cdn': return 'info';
    case 'marketing': return 'success';
    case 'tools':
    case 'tooling': return 'warning';
    case 'legal': return 'danger';
    case 'marketplace': return 'neutral';
    default: return 'neutral';
  }
}

function adrStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  switch (status) {
    case 'accepted': return 'success';
    case 'proposed': return 'warning';
    case 'deprecated': return 'danger';
    default: return 'neutral';
  }
}

function formatBRL(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Shared inline styles
// ---------------------------------------------------------------------------

const cardBg = { background: 'var(--bb-depth-2)' };
const inputStyle = {
  background: 'var(--bb-depth-1)',
  color: 'var(--bb-ink-1)',
  border: '1px solid var(--bb-ink-3)',
};
const brandBtnStyle = { background: 'var(--bb-brand)', color: '#fff' };
const ghostBtnStyle = {
  border: '1px solid var(--bb-ink-3)',
  color: 'var(--bb-ink-2)',
  background: 'transparent',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CeoPage() {
  const { toast } = useToast();

  // ----- KPI state -----
  const [kpi, setKpi] = useState<KpiSnapshot | null>(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  // ----- Feature backlog state -----
  const [features, setFeatures] = useState<FeatureBacklogItem[]>([]);
  const [featuresLoading, setFeaturesLoading] = useState(true);
  const [featureFilter, setFeatureFilter] = useState<PipelineFilter>('todos');
  const [showFeatureForm, setShowFeatureForm] = useState(false);
  const [featureForm, setFeatureForm] = useState({
    title: '', description: '', module: '', persona: '',
    rice_impact: 5, rice_urgency: 5, rice_effort: 5,
  });
  const [featureSubmitting, setFeatureSubmitting] = useState(false);
  const [killTarget, setKillTarget] = useState<FeatureBacklogItem | null>(null);

  // ----- Costs state -----
  const [costs, setCosts] = useState<OperationalCost[]>([]);
  const [costsLoading, setCostsLoading] = useState(true);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [showCostForm, setShowCostForm] = useState(false);
  const [costForm, setCostForm] = useState({
    name: '', category: 'infra', amount_brl: '', frequency: 'monthly',
  });
  const [costSubmitting, setCostSubmitting] = useState(false);
  const [deleteCostTarget, setDeleteCostTarget] = useState<OperationalCost | null>(null);

  // ----- ADR state -----
  const [adrs, setAdrs] = useState<ArchitectureDecision[]>([]);
  const [adrsLoading, setAdrsLoading] = useState(true);
  const [expandedAdr, setExpandedAdr] = useState<string | null>(null);
  const [showAdrForm, setShowAdrForm] = useState(false);
  const [adrForm, setAdrForm] = useState({
    title: '', product: PRODUCT, context: '', decision: '', consequences: '',
  });
  const [adrSubmitting, setAdrSubmitting] = useState(false);

  // ----- MRR chart data (mock 6 points) -----
  const mrrChartData = [
    { value: 350 },
    { value: 480 },
    { value: 560 },
    { value: 690 },
    { value: 810 },
    { value: kpi?.mrr ?? 891 },
  ];

  // ----- Fetch functions -----
  const loadKpi = useCallback(async () => {
    setKpiLoading(true);
    try {
      const data = await getKpiSnapshot(PRODUCT);
      setKpi(data);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setKpiLoading(false);
    }
  }, [toast]);

  const loadFeatures = useCallback(async () => {
    setFeaturesLoading(true);
    try {
      const data = await getFeatureBacklog(PRODUCT);
      setFeatures(data);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setFeaturesLoading(false);
    }
  }, [toast]);

  const loadCosts = useCallback(async () => {
    setCostsLoading(true);
    try {
      const [costList, monthly] = await Promise.all([
        getOperationalCosts(PRODUCT),
        getTotalMonthlyCost(PRODUCT),
      ]);
      setCosts(costList);
      setTotalMonthly(monthly);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setCostsLoading(false);
    }
  }, [toast]);

  const loadAdrs = useCallback(async () => {
    setAdrsLoading(true);
    try {
      const data = await getArchitectureDecisions(PRODUCT);
      setAdrs(data);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setAdrsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadKpi();
    void loadFeatures();
    void loadCosts();
    void loadAdrs();
  }, [loadKpi, loadFeatures, loadCosts, loadAdrs]);

  // ----- Filtered features -----
  const filteredFeatures = featureFilter === 'todos'
    ? features
    : features.filter((f) => f.pipeline_phase === featureFilter);

  // ----- Feature actions -----
  async function handleCreateFeature() {
    if (!featureForm.title.trim()) {
      toast('Preencha o título da feature', 'error');
      return;
    }
    setFeatureSubmitting(true);
    try {
      const score =
        featureForm.rice_impact * 3 +
        featureForm.rice_urgency * 2 +
        featureForm.rice_effort * 1;
      const created = await createFeature({
        product: PRODUCT,
        title: featureForm.title,
        description: featureForm.description || null,
        module: featureForm.module || null,
        persona: featureForm.persona || null,
        rice_impact: featureForm.rice_impact,
        rice_urgency: featureForm.rice_urgency,
        rice_effort: featureForm.rice_effort,
        rice_score: score,
        pipeline_phase: 'backlog',
        status: 'backlog',
      });
      if (created) {
        setFeatures((prev) =>
          [...prev, created].sort((a, b) => b.rice_score - a.rice_score),
        );
        setShowFeatureForm(false);
        setFeatureForm({ title: '', description: '', module: '', persona: '', rice_impact: 5, rice_urgency: 5, rice_effort: 5 });
        toast('Feature criada com sucesso', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setFeatureSubmitting(false);
    }
  }

  async function handleMoveFeature(id: string, phase: string) {
    try {
      const ok = await moveFeatureStatus(id, phase);
      if (ok) {
        setFeatures((prev) =>
          prev.map((f) => (f.id === id ? { ...f, pipeline_phase: phase, status: phase } : f)),
        );
        toast(`Feature movida para ${phase}`, 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleKillFeature() {
    if (!killTarget) return;
    try {
      const ok = await moveFeatureStatus(killTarget.id, 'killed');
      if (ok) {
        setFeatures((prev) =>
          prev.map((f) =>
            f.id === killTarget.id ? { ...f, pipeline_phase: 'killed', status: 'killed' } : f,
          ),
        );
        toast('Feature removida', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setKillTarget(null);
    }
  }

  async function handleRiceChange(featureId: string, field: string, value: number) {
    const feature = features.find((f) => f.id === featureId);
    if (!feature) return;
    const updated = { ...feature, [field === 'impact' ? 'rice_impact' : field === 'urgency' ? 'rice_urgency' : 'rice_effort']: value };
    const newScore = updated.rice_impact * 3 + updated.rice_urgency * 2 + updated.rice_effort * 1;
    try {
      const result = await updateFeature(featureId, {
        [`rice_${field}`]: value,
        rice_score: newScore,
      } as Partial<FeatureBacklogItem>);
      if (result) {
        setFeatures((prev) =>
          prev
            .map((f) => (f.id === featureId ? { ...f, ...result, rice_score: newScore } : f))
            .sort((a, b) => b.rice_score - a.rice_score),
        );
      }
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  // ----- Cost actions -----
  async function handleCreateCost() {
    if (!costForm.name.trim()) {
      toast('Preencha o nome do custo', 'error');
      return;
    }
    const amount = parseFloat(costForm.amount_brl);
    if (isNaN(amount) || amount < 0) {
      toast('Informe um valor válido', 'error');
      return;
    }
    setCostSubmitting(true);
    try {
      const created = await createCost({
        product: PRODUCT,
        name: costForm.name,
        category: costForm.category,
        amount_brl: amount,
        frequency: costForm.frequency,
        active: true,
      });
      if (created) {
        setCosts((prev) => [...prev, created]);
        // Recalculate total
        const newTotal = await getTotalMonthlyCost(PRODUCT);
        setTotalMonthly(newTotal);
        setShowCostForm(false);
        setCostForm({ name: '', category: 'infra', amount_brl: '', frequency: 'monthly' });
        toast('Custo adicionado com sucesso', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setCostSubmitting(false);
    }
  }

  async function handleToggleCostActive(cost: OperationalCost) {
    try {
      const result = await updateCost(cost.id, { active: !cost.active });
      if (result) {
        setCosts((prev) => prev.map((c) => (c.id === cost.id ? result : c)));
        const newTotal = await getTotalMonthlyCost(PRODUCT);
        setTotalMonthly(newTotal);
        toast(result.active ? 'Custo ativado' : 'Custo desativado', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleDeleteCost() {
    if (!deleteCostTarget) return;
    try {
      const ok = await deleteCost(deleteCostTarget.id);
      if (ok) {
        setCosts((prev) => prev.filter((c) => c.id !== deleteCostTarget.id));
        const newTotal = await getTotalMonthlyCost(PRODUCT);
        setTotalMonthly(newTotal);
        toast('Custo removido', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setDeleteCostTarget(null);
    }
  }

  // ----- ADR actions -----
  async function handleCreateAdr() {
    if (!adrForm.title.trim()) {
      toast('Preencha o título da ADR', 'error');
      return;
    }
    setAdrSubmitting(true);
    try {
      const created = await createADR({
        product: adrForm.product,
        title: adrForm.title,
        status: 'proposed',
        context: adrForm.context || null,
        decision: adrForm.decision || null,
        consequences: adrForm.consequences || null,
      });
      if (created) {
        setAdrs((prev) => [...prev, created]);
        setShowAdrForm(false);
        setAdrForm({ title: '', product: PRODUCT, context: '', decision: '', consequences: '' });
        toast('ADR criada com sucesso', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setAdrSubmitting(false);
    }
  }

  async function handleAdrStatusChange(adr: ArchitectureDecision, newStatus: string) {
    try {
      const result = await updateADR(adr.id, { status: newStatus });
      if (result) {
        setAdrs((prev) => prev.map((a) => (a.id === adr.id ? result : a)));
        toast(`ADR atualizada para ${newStatus}`, 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  // ----- Frequency label -----
  function frequencyLabel(freq: string): string {
    switch (freq) {
      case 'monthly': return 'Mensal';
      case 'yearly': return 'Anual';
      case 'usage_based': return 'Uso';
      default: return freq;
    }
  }

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="space-y-8 p-4 md:p-6 pb-24">
      {/* ------ 1. KPI Cards ------ */}
      <section aria-label="KPIs do CEO">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <KpiCard
            title="Academias ativas"
            value={kpi?.activeAcademies ?? 0}
            delta={kpi?.deltaAcademies}
            icon={<Building2 className="h-5 w-5" />}
            loading={kpiLoading}
          />
          <KpiCard
            title="Academias em trial"
            value={kpi?.trialAcademies ?? 0}
            icon={<Clock className="h-5 w-5" />}
            loading={kpiLoading}
          />
          <KpiCard
            title="Total de usuários"
            value={kpi?.totalUsers ?? 0}
            icon={<Users className="h-5 w-5" />}
            loading={kpiLoading}
          />
          <KpiCard
            title="Usuários ativos 7d"
            value={kpi?.activeUsers7d ?? 0}
            icon={<Activity className="h-5 w-5" />}
            loading={kpiLoading}
          />
          <KpiCard
            title="MRR"
            value={kpi ? formatBRL(kpi.mrr) : 'R$ 0'}
            delta={kpi?.deltaMrr}
            icon={<DollarSign className="h-5 w-5" />}
            loading={kpiLoading}
          />
          <KpiCard
            title="NPS Score"
            value={kpi?.npsScore ?? 0}
            icon={<Star className="h-5 w-5" />}
            loading={kpiLoading}
          />
        </div>
      </section>

      {/* ------ 2. Gráfico de Receita ------ */}
      <section aria-label="Gráfico de receita MRR">
        <SectionHeader title="Receita (MRR)" />
        <div
          className="mt-3 rounded-xl p-4"
          style={cardBg}
        >
          {kpiLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <MiniChart data={mrrChartData} type="line" height={80} color="var(--bb-brand)" />
          )}
        </div>
      </section>

      {/* ------ 3. CEO Filter Board ------ */}
      <section aria-label="CEO Filter — backlog de features">
        <SectionHeader
          title="CEO Filter"
          action={{
            label: 'Nova Feature',
            onClick: () => setShowFeatureForm(true),
            icon: <Plus className="h-4 w-4" />,
          }}
        />

        {/* Filter pills */}
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Filtros de pipeline">
          {PIPELINE_FILTERS.map((pf) => {
            const active = featureFilter === pf.key;
            return (
              <button
                key={pf.key}
                role="tab"
                aria-selected={active}
                aria-label={`Filtrar por ${pf.label}`}
                onClick={() => setFeatureFilter(pf.key)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                style={
                  active
                    ? { background: 'var(--bb-brand)', color: '#fff' }
                    : { background: 'var(--bb-depth-2)', color: 'var(--bb-ink-2)' }
                }
              >
                {pf.label}
              </button>
            );
          })}
        </div>

        {/* Feature form */}
        {showFeatureForm && (
          <div
            className="mt-3 rounded-xl p-4 space-y-3"
            style={cardBg}
          >
            <h3 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-1)' }}>
              Nova Feature
            </h3>
            <input
              type="text"
              placeholder="Título *"
              aria-label="Título da feature"
              value={featureForm.title}
              onChange={(e) => setFeatureForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle}
            />
            <textarea
              placeholder="Descrição"
              aria-label="Descrição da feature"
              value={featureForm.description}
              onChange={(e) => setFeatureForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm"
              rows={2}
              style={inputStyle}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                aria-label="Módulo"
                value={featureForm.module}
                onChange={(e) => setFeatureForm((p) => ({ ...p, module: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm"
                style={inputStyle}
              >
                <option value="">Módulo</option>
                {MODULE_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                aria-label="Persona"
                value={featureForm.persona}
                onChange={(e) => setFeatureForm((p) => ({ ...p, persona: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm"
                style={inputStyle}
              >
                <option value="">Persona</option>
                {PERSONA_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--bb-ink-3)' }}>
                RICE Score
              </p>
              <RiceScorer
                impact={featureForm.rice_impact}
                urgency={featureForm.rice_urgency}
                effort={featureForm.rice_effort}
                onChange={(field, value) =>
                  setFeatureForm((p) => ({
                    ...p,
                    [field === 'impact' ? 'rice_impact' : field === 'urgency' ? 'rice_urgency' : 'rice_effort']: value,
                  }))
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                aria-label="Cancelar criação de feature"
                onClick={() => setShowFeatureForm(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium"
                style={ghostBtnStyle}
              >
                Cancelar
              </button>
              <button
                aria-label="Salvar feature"
                onClick={handleCreateFeature}
                disabled={featureSubmitting}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                style={brandBtnStyle}
              >
                {featureSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        )}

        {/* Features list */}
        <div className="mt-3 space-y-2">
          {featuresLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl p-4 space-y-2" style={cardBg}>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : filteredFeatures.length === 0 ? (
            <EmptyState
              icon={<ListFilter className="h-10 w-10" />}
              title="Nenhuma feature encontrada"
              description="Crie uma nova feature ou altere o filtro."
              action={{ label: 'Nova Feature', onClick: () => setShowFeatureForm(true) }}
            />
          ) : (
            filteredFeatures.map((feat) => (
              <div
                key={feat.id}
                className="rounded-xl p-4"
                style={cardBg}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className="text-sm font-semibold"
                      style={{ color: 'var(--bb-ink-1)' }}
                    >
                      {feat.title}
                    </h4>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {feat.module && (
                        <StatusBadge label={feat.module} variant="info" />
                      )}
                      <StatusBadge
                        label={feat.pipeline_phase}
                        variant={phaseBadgeVariant(feat.pipeline_phase)}
                      />
                    </div>
                  </div>

                  <RiceScorer
                    impact={feat.rice_impact}
                    urgency={feat.rice_urgency}
                    effort={feat.rice_effort}
                    onChange={(field, value) => handleRiceChange(feat.id, field, value)}
                  />

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {feat.pipeline_phase !== 'shipped' && feat.pipeline_phase !== 'killed' && (
                      <>
                        <button
                          aria-label={`Ship it: ${feat.title}`}
                          onClick={() => handleMoveFeature(feat.id, 'sprint')}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
                          style={{ background: 'var(--bb-success)', color: '#fff' }}
                        >
                          <Rocket className="h-3 w-3" />
                          Ship it
                        </button>
                        <button
                          aria-label={`Icebox: ${feat.title}`}
                          onClick={() => handleMoveFeature(feat.id, 'icebox')}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
                          style={{ background: 'var(--bb-warning)', color: '#fff' }}
                        >
                          <Archive className="h-3 w-3" />
                          Icebox
                        </button>
                        <button
                          aria-label={`Kill: ${feat.title}`}
                          onClick={() => setKillTarget(feat)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
                          style={{ background: 'var(--bb-danger)', color: '#fff' }}
                        >
                          <X className="h-3 w-3" />
                          Kill
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ------ 4. Controle de Custos ------ */}
      <section aria-label="Custos operacionais">
        <SectionHeader
          title="Custos Operacionais"
          action={{
            label: 'Novo Custo',
            onClick: () => setShowCostForm(true),
            icon: <Plus className="h-4 w-4" />,
          }}
        />

        {/* Total monthly */}
        <div
          className="mt-3 rounded-xl p-4 flex items-center justify-between"
          style={cardBg}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-3)' }}>
            Custo mensal total
          </span>
          {costsLoading ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            <span className="text-lg font-bold" style={{ color: 'var(--bb-ink-1)' }}>
              {formatBRL(totalMonthly)}
            </span>
          )}
        </div>

        {/* Cost form */}
        {showCostForm && (
          <div
            className="mt-3 rounded-xl p-4 space-y-3"
            style={cardBg}
          >
            <h3 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-1)' }}>
              Novo Custo
            </h3>
            <input
              type="text"
              placeholder="Nome *"
              aria-label="Nome do custo"
              value={costForm.name}
              onChange={(e) => setCostForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                aria-label="Categoria do custo"
                value={costForm.category}
                onChange={(e) => setCostForm((p) => ({ ...p, category: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm"
                style={inputStyle}
              >
                {COST_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <select
                aria-label="Frequência do custo"
                value={costForm.frequency}
                onChange={(e) => setCostForm((p) => ({ ...p, frequency: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm"
                style={inputStyle}
              >
                {COST_FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <input
              type="number"
              placeholder="Valor (R$)"
              aria-label="Valor do custo em reais"
              value={costForm.amount_brl}
              onChange={(e) => setCostForm((p) => ({ ...p, amount_brl: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm"
              min={0}
              step={0.01}
              style={inputStyle}
            />
            <div className="flex justify-end gap-2">
              <button
                aria-label="Cancelar criação de custo"
                onClick={() => setShowCostForm(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium"
                style={ghostBtnStyle}
              >
                Cancelar
              </button>
              <button
                aria-label="Salvar custo"
                onClick={handleCreateCost}
                disabled={costSubmitting}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                style={brandBtnStyle}
              >
                {costSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        )}

        {/* Costs list */}
        <div className="mt-3 space-y-2">
          {costsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl p-4 space-y-2" style={cardBg}>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))
          ) : costs.length === 0 ? (
            <EmptyState
              icon={<DollarSign className="h-10 w-10" />}
              title="Nenhum custo registrado"
              description="Adicione seus custos operacionais para acompanhar."
              action={{ label: 'Novo Custo', onClick: () => setShowCostForm(true) }}
            />
          ) : (
            costs.map((cost) => (
              <div
                key={cost.id}
                className="rounded-xl p-4 flex items-center justify-between gap-3"
                style={cardBg}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-sm font-semibold truncate"
                      style={{ color: 'var(--bb-ink-1)' }}
                    >
                      {cost.name}
                    </span>
                    <StatusBadge
                      label={cost.category}
                      variant={costCategoryVariant(cost.category)}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold" style={{ color: 'var(--bb-brand)' }}>
                      {formatBRL(cost.amount_brl)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--bb-ink-3)' }}>
                      {frequencyLabel(cost.frequency)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Active toggle */}
                  <button
                    aria-label={cost.active ? `Desativar ${cost.name}` : `Ativar ${cost.name}`}
                    onClick={() => handleToggleCostActive(cost)}
                    className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                    style={{
                      background: cost.active ? 'var(--bb-success)' : 'var(--bb-ink-3)',
                    }}
                  >
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-full transition-transform"
                      style={{
                        background: '#fff',
                        transform: cost.active ? 'translateX(17px)' : 'translateX(3px)',
                      }}
                    />
                  </button>
                  {/* Delete */}
                  <button
                    aria-label={`Excluir custo ${cost.name}`}
                    onClick={() => setDeleteCostTarget(cost)}
                    className="rounded p-1 transition-colors"
                    style={{ color: 'var(--bb-danger)' }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ------ 5. ADR Feed ------ */}
      <section aria-label="Decisões de arquitetura (ADR)">
        <SectionHeader
          title="Decisões (ADR)"
          action={{
            label: 'Nova ADR',
            onClick: () => setShowAdrForm(true),
            icon: <Plus className="h-4 w-4" />,
          }}
        />

        {/* ADR form */}
        {showAdrForm && (
          <div
            className="mt-3 rounded-xl p-4 space-y-3"
            style={cardBg}
          >
            <h3 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-1)' }}>
              Nova ADR
            </h3>
            <input
              type="text"
              placeholder="Título *"
              aria-label="Título da ADR"
              value={adrForm.title}
              onChange={(e) => setAdrForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle}
            />
            <select
              aria-label="Produto da ADR"
              value={adrForm.product}
              onChange={(e) => setAdrForm((p) => ({ ...p, product: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle}
            >
              <option value="blackbelt">BlackBelt</option>
            </select>
            <textarea
              placeholder="Contexto"
              aria-label="Contexto da ADR"
              value={adrForm.context}
              onChange={(e) => setAdrForm((p) => ({ ...p, context: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm"
              rows={2}
              style={inputStyle}
            />
            <textarea
              placeholder="Decisão"
              aria-label="Decisão da ADR"
              value={adrForm.decision}
              onChange={(e) => setAdrForm((p) => ({ ...p, decision: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm"
              rows={2}
              style={inputStyle}
            />
            <textarea
              placeholder="Consequências"
              aria-label="Consequências da ADR"
              value={adrForm.consequences}
              onChange={(e) => setAdrForm((p) => ({ ...p, consequences: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm"
              rows={2}
              style={inputStyle}
            />
            <div className="flex justify-end gap-2">
              <button
                aria-label="Cancelar criação de ADR"
                onClick={() => setShowAdrForm(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium"
                style={ghostBtnStyle}
              >
                Cancelar
              </button>
              <button
                aria-label="Salvar ADR"
                onClick={handleCreateAdr}
                disabled={adrSubmitting}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                style={brandBtnStyle}
              >
                {adrSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        )}

        {/* ADR list */}
        <div className="mt-3 space-y-2">
          {adrsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl p-4 space-y-2" style={cardBg}>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))
          ) : adrs.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-10 w-10" />}
              title="Nenhuma ADR registrada"
              description="Documente suas decisões de arquitetura."
              action={{ label: 'Nova ADR', onClick: () => setShowAdrForm(true) }}
            />
          ) : (
            adrs.map((adr) => {
              const isExpanded = expandedAdr === adr.id;
              return (
                <div
                  key={adr.id}
                  className="rounded-xl overflow-hidden"
                  style={cardBg}
                >
                  {/* Header (clickable) */}
                  <button
                    aria-label={`${isExpanded ? 'Recolher' : 'Expandir'} ADR-${adr.adr_number}: ${adr.title}`}
                    onClick={() => setExpandedAdr(isExpanded ? null : adr.id)}
                    className="w-full flex items-center justify-between gap-2 p-4 text-left"
                  >
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0" style={{ color: 'var(--bb-ink-3)' }} />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0" style={{ color: 'var(--bb-ink-3)' }} />
                      )}
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--bb-ink-1)' }}>
                        ADR-{adr.adr_number}: {adr.title}
                      </span>
                      <StatusBadge label={adr.status} variant={adrStatusVariant(adr.status)} />
                    </div>
                    <span className="text-xs shrink-0" style={{ color: 'var(--bb-ink-3)' }}>
                      {formatDate(adr.created_at)}
                    </span>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid var(--bb-depth-1)' }}>
                      {adr.context && (
                        <div className="pt-3">
                          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--bb-ink-3)' }}>
                            Contexto
                          </p>
                          <p className="text-sm" style={{ color: 'var(--bb-ink-2)' }}>
                            {adr.context}
                          </p>
                        </div>
                      )}
                      {adr.decision && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--bb-ink-3)' }}>
                            Decisão
                          </p>
                          <p className="text-sm" style={{ color: 'var(--bb-ink-2)' }}>
                            {adr.decision}
                          </p>
                        </div>
                      )}
                      {adr.consequences && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--bb-ink-3)' }}>
                            Consequências
                          </p>
                          <p className="text-sm" style={{ color: 'var(--bb-ink-2)' }}>
                            {adr.consequences}
                          </p>
                        </div>
                      )}
                      {/* Status change dropdown */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-3)' }}>
                          Status:
                        </span>
                        <select
                          aria-label={`Alterar status da ADR-${adr.adr_number}`}
                          value={adr.status}
                          onChange={(e) => handleAdrStatusChange(adr, e.target.value)}
                          className="rounded-lg px-2 py-1 text-xs"
                          style={inputStyle}
                        >
                          {ADR_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ------ Confirm Dialogs ------ */}
      <ConfirmDialog
        open={killTarget !== null}
        onClose={() => setKillTarget(null)}
        onConfirm={handleKillFeature}
        title="Excluir feature"
        message={`Tem certeza que deseja matar "${killTarget?.title ?? ''}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Kill"
        variant="danger"
      />

      <ConfirmDialog
        open={deleteCostTarget !== null}
        onClose={() => setDeleteCostTarget(null)}
        onConfirm={handleDeleteCost}
        title="Excluir custo"
        message={`Tem certeza que deseja excluir "${deleteCostTarget?.name ?? ''}"?`}
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  );
}
