'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Instagram,
  Youtube,
  Globe,
  Mail,
  MessageCircle,
  Megaphone,
  CalendarDays,
  CheckSquare,
  BarChart3,
  X,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import {
  getKpiSnapshot,
  getContentCalendar,
  createContent,
  updateContent,
  deleteContent,
  getCampaigns,
  createCampaign,
  updateCampaign,
} from '@/lib/api/cockpit.service';
import type {
  KpiSnapshot,
  ContentCalendarItem,
  CampaignItem,
} from '@/lib/api/cockpit.service';
import { SectionHeader } from '@/components/cockpit/SectionHeader';
import { StatusBadge } from '@/components/cockpit/StatusBadge';
import { EmptyState } from '@/components/cockpit/EmptyState';
import { ConfirmDialog } from '@/components/cockpit/ConfirmDialog';
import { CockpitSkeleton } from '@/components/cockpit/CockpitSkeleton';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRODUCT = 'blackbelt';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
] as const;

const PLATFORM_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'blog', label: 'Blog' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
] as const;

const CONTENT_TYPE_OPTIONS = [
  { value: 'carrossel', label: 'Carrossel' },
  { value: 'video', label: 'Vídeo' },
  { value: 'story', label: 'Story' },
  { value: 'reel', label: 'Reel' },
  { value: 'artigo', label: 'Artigo' },
  { value: 'thread', label: 'Thread' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'live', label: 'Live' },
] as const;

const CONTENT_STATUS_MAP: Record<string, { label: string; variant: 'neutral' | 'info' | 'warning' | 'success' | 'danger' }> = {
  ideia: { label: 'Ideia', variant: 'neutral' },
  planejado: { label: 'Planejado', variant: 'info' },
  rascunho: { label: 'Rascunho', variant: 'info' },
  em_producao: { label: 'Em Produção', variant: 'warning' },
  pronto: { label: 'Pronto', variant: 'success' },
  publicado: { label: 'Publicado', variant: 'success' },
  cancelado: { label: 'Cancelado', variant: 'danger' },
};

const CAMPAIGN_CHANNEL_OPTIONS = [
  { value: 'organic', label: 'Orgânico' },
  { value: 'paid_social', label: 'Paid Social' },
  { value: 'instagram_ads', label: 'Instagram Ads' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'seo', label: 'SEO' },
  { value: 'partnerships', label: 'Parcerias' },
  { value: 'referral', label: 'Referral' },
  { value: 'events', label: 'Eventos' },
  { value: 'outbound', label: 'Outbound' },
] as const;

const CAMPAIGN_STATUS_MAP: Record<string, { label: string; variant: 'neutral' | 'info' | 'warning' | 'success' | 'danger' }> = {
  planejado: { label: 'Planejado', variant: 'neutral' },
  ativo: { label: 'Ativo', variant: 'success' },
  pausado: { label: 'Pausado', variant: 'warning' },
  concluido: { label: 'Concluído', variant: 'info' },
  cancelado: { label: 'Cancelado', variant: 'danger' },
};

const ASO_CHECKLIST = [
  'Screenshots reais Android',
  'Screenshots reais iOS',
  'Descrição PT-BR Google Play',
  'Descrição PT-BR App Store',
  'Keywords definidas',
  'Privacy policy publicada',
  'Termos de uso publicados',
  'Data safety form (Google)',
  'App Review guidelines (Apple)',
  'Ícone 512x512 e 1024x1024',
  'Feature graphic (Google Play)',
] as const;

const MOCK_FUNNEL = [
  { stage: 'Lead / Visitante', count: 500 },
  { stage: 'Cadastro', count: 120 },
  { stage: 'Trial 7d', count: 45 },
  { stage: 'Conversão', count: 18 },
  { stage: 'Ativo', count: 12 },
] as const;

interface AcquisitionChannel {
  name: string;
  leads: number;
  conversions: number;
  cost: number;
}

const MOCK_CHANNELS: AcquisitionChannel[] = [
  { name: 'Indicação', leads: 15, conversions: 8, cost: 0 },
  { name: 'Instagram', leads: 42, conversions: 5, cost: 350 },
  { name: 'Eventos / Competições', leads: 10, conversions: 3, cost: 200 },
  { name: 'Parcerias com Federações', leads: 8, conversions: 2, cost: 0 },
  { name: 'Google / SEO', leads: 20, conversions: 1, cost: 0 },
  { name: 'Outbound direto', leads: 6, conversions: 1, cost: 50 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPlatformIcon(platform: string) {
  switch (platform) {
    case 'instagram': return <Instagram className="h-4 w-4" />;
    case 'youtube': return <Youtube className="h-4 w-4" />;
    case 'tiktok': return <Megaphone className="h-4 w-4" />;
    case 'blog': return <Globe className="h-4 w-4" />;
    case 'linkedin': return <Users className="h-4 w-4" />;
    case 'whatsapp': return <MessageCircle className="h-4 w-4" />;
    case 'email': return <Mail className="h-4 w-4" />;
    default: return <Globe className="h-4 w-4" />;
  }
}

function getContentStatusInfo(status: string) {
  return CONTENT_STATUS_MAP[status] ?? { label: status, variant: 'neutral' as const };
}

function getCampaignStatusInfo(status: string) {
  return CAMPAIGN_STATUS_MAP[status] ?? { label: status, variant: 'neutral' as const };
}

function getCampaignChannelLabel(channel: string | null) {
  if (!channel) return 'N/A';
  const found = CAMPAIGN_CHANNEL_OPTIONS.find((o) => o.value === channel);
  return found?.label ?? channel;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressBar({ current, target, label }: { current: number; target: number; label?: string }) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div className="mt-2">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: 'var(--bb-ink-3)' }}>{label}</span>
          <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-2)' }}>{pct}%</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--bb-depth-1)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'var(--bb-brand)' }}
        />
      </div>
    </div>
  );
}

function GrowthKpiCard({
  title,
  current,
  target,
  formatValue,
  icon,
}: {
  title: string;
  current: number;
  target: number;
  formatValue?: (v: number) => string;
  icon: React.ReactNode;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const display = formatValue ? formatValue(current) : String(current);
  const targetDisplay = formatValue ? formatValue(target) : String(target);

  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)' }}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-3)' }}>
          {title}
        </p>
        <div style={{ color: 'var(--bb-ink-3)' }}>{icon}</div>
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-1)' }}>{display}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--bb-ink-3)' }}>
        Meta: {targetDisplay}
      </p>
      <div className="mt-2">
        <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--bb-depth-1)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--bb-success)' : 'var(--bb-brand)' }}
          />
        </div>
        <p className="text-xs font-medium mt-1 text-right" style={{ color: pct >= 100 ? 'var(--bb-success)' : 'var(--bb-brand)' }}>
          {pct}%
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal form component
// ---------------------------------------------------------------------------

interface ModalFormProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function ModalForm({ open, onClose, title, children }: ModalFormProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-xl p-6 overflow-y-auto max-h-[90vh]"
        style={{ background: 'var(--bb-depth-2)' }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--bb-ink-1)' }}>{title}</h3>
          <button onClick={onClose} aria-label="Fechar formulário" className="p-1 rounded-lg" style={{ color: 'var(--bb-ink-3)' }}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form field helpers
// ---------------------------------------------------------------------------

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--bb-ink-2)' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bb-depth-1)',
  color: 'var(--bb-ink-1)',
  border: '1px solid var(--bb-depth-1)',
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function GrowthPage() {
  const { toast } = useToast();

  // Data state
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState<KpiSnapshot | null>(null);
  const [content, setContent] = useState<ContentCalendarItem[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);

  // Calendar month navigation
  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);

  // Content form
  const [showContentForm, setShowContentForm] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentCalendarItem | null>(null);
  const [contentForm, setContentForm] = useState({
    title: '',
    platform: 'instagram',
    content_type: 'carrossel',
    planned_date: '',
    target_persona: '',
    notes: '',
    status: 'planejado',
  });

  // Content delete confirm
  const [deleteContentId, setDeleteContentId] = useState<string | null>(null);

  // Campaign form
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignItem | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    channel: 'organic',
    budget_brl: 0,
    goal: '',
    target_metric: '',
    target_value: 0,
    start_date: '',
    end_date: '',
    status: 'planejado',
  });

  // Campaign expand
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

  // ASO Checklist
  const [asoChecked, setAsoChecked] = useState<boolean[]>(new Array(ASO_CHECKLIST.length).fill(false));

  // Saving state
  const [saving, setSaving] = useState(false);

  // ---------------------------------------------------------------------------
  // Fetch data
  // ---------------------------------------------------------------------------

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [kpiData, contentData, campaignData] = await Promise.all([
        getKpiSnapshot(PRODUCT),
        getContentCalendar(PRODUCT),
        getCampaigns(PRODUCT),
      ]);
      setKpi(kpiData);
      setContent(contentData);
      setCampaigns(campaignData);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch content when month changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getContentCalendar(PRODUCT, calMonth, calYear);
        if (!cancelled) setContent(data);
      } catch (err) {
        if (!cancelled) toast(translateError(err), 'error');
      }
    })();
    return () => { cancelled = true; };
  }, [calMonth, calYear, toast]);

  // ---------------------------------------------------------------------------
  // Calendar helpers
  // ---------------------------------------------------------------------------

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfWeek(calYear, calMonth);
    const days: Array<{ day: number | null; key: string }> = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, key: `empty-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, key: `day-${d}` });
    }
    return days;
  }, [calMonth, calYear]);

  const filteredContent = useMemo(() => {
    if (!platformFilter) return content;
    return content.filter((c) => c.platform === platformFilter);
  }, [content, platformFilter]);

  function getContentForDay(day: number): ContentCalendarItem[] {
    const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredContent.filter((c) => c.planned_date === dateStr);
  }

  function prevMonth() {
    setSelectedDay(null);
    if (calMonth === 1) {
      setCalMonth(12);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    setSelectedDay(null);
    if (calMonth === 12) {
      setCalMonth(1);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  }

  // ---------------------------------------------------------------------------
  // Content CRUD
  // ---------------------------------------------------------------------------

  function openNewContentForm(day?: number) {
    const dateStr = day
      ? `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      : '';
    setEditingContent(null);
    setContentForm({
      title: '',
      platform: 'instagram',
      content_type: 'carrossel',
      planned_date: dateStr,
      target_persona: '',
      notes: '',
      status: 'planejado',
    });
    setShowContentForm(true);
  }

  function openEditContentForm(item: ContentCalendarItem) {
    setEditingContent(item);
    setContentForm({
      title: item.title,
      platform: item.platform,
      content_type: item.content_type ?? 'carrossel',
      planned_date: item.planned_date ?? '',
      target_persona: item.target_persona ?? '',
      notes: item.notes ?? '',
      status: item.status,
    });
    setShowContentForm(true);
  }

  async function handleSaveContent() {
    if (!contentForm.title.trim()) {
      toast('Título é obrigatório', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingContent) {
        const updated = await updateContent(editingContent.id, {
          title: contentForm.title,
          platform: contentForm.platform,
          content_type: contentForm.content_type || null,
          planned_date: contentForm.planned_date || null,
          target_persona: contentForm.target_persona || null,
          notes: contentForm.notes || null,
          status: contentForm.status,
        });
        if (updated) {
          setContent((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          toast('Conteúdo atualizado', 'success');
        }
      } else {
        const created = await createContent({
          product: PRODUCT,
          title: contentForm.title,
          platform: contentForm.platform,
          content_type: contentForm.content_type || null,
          planned_date: contentForm.planned_date || null,
          target_persona: contentForm.target_persona || null,
          notes: contentForm.notes || null,
          status: contentForm.status,
        });
        if (created) {
          setContent((prev) => [...prev, created]);
          toast('Conteúdo criado', 'success');
        }
      }
      setShowContentForm(false);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteContent() {
    if (!deleteContentId) return;
    setSaving(true);
    try {
      const ok = await deleteContent(deleteContentId);
      if (ok) {
        setContent((prev) => prev.filter((c) => c.id !== deleteContentId));
        toast('Conteúdo excluído', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
      setDeleteContentId(null);
    }
  }

  // ---------------------------------------------------------------------------
  // Campaign CRUD
  // ---------------------------------------------------------------------------

  function openNewCampaignForm() {
    setEditingCampaign(null);
    setCampaignForm({
      name: '',
      channel: 'organic',
      budget_brl: 0,
      goal: '',
      target_metric: '',
      target_value: 0,
      start_date: '',
      end_date: '',
      status: 'planejado',
    });
    setShowCampaignForm(true);
  }

  function openEditCampaignForm(item: CampaignItem) {
    setEditingCampaign(item);
    setCampaignForm({
      name: item.name,
      channel: item.channel ?? 'organic',
      budget_brl: item.budget_brl,
      goal: item.goal ?? '',
      target_metric: item.target_metric ?? '',
      target_value: item.target_value ?? 0,
      start_date: item.start_date ?? '',
      end_date: item.end_date ?? '',
      status: item.status,
    });
    setShowCampaignForm(true);
  }

  async function handleSaveCampaign() {
    if (!campaignForm.name.trim()) {
      toast('Nome é obrigatório', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingCampaign) {
        const updated = await updateCampaign(editingCampaign.id, {
          name: campaignForm.name,
          channel: campaignForm.channel || null,
          budget_brl: campaignForm.budget_brl,
          goal: campaignForm.goal || null,
          target_metric: campaignForm.target_metric || null,
          target_value: campaignForm.target_value || null,
          start_date: campaignForm.start_date || null,
          end_date: campaignForm.end_date || null,
          status: campaignForm.status,
        });
        if (updated) {
          setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          toast('Campanha atualizada', 'success');
        }
      } else {
        const created = await createCampaign({
          product: PRODUCT,
          name: campaignForm.name,
          channel: campaignForm.channel || null,
          budget_brl: campaignForm.budget_brl,
          goal: campaignForm.goal || null,
          target_metric: campaignForm.target_metric || null,
          target_value: campaignForm.target_value || null,
          start_date: campaignForm.start_date || null,
          end_date: campaignForm.end_date || null,
          status: campaignForm.status,
        });
        if (created) {
          setCampaigns((prev) => [...prev, created]);
          toast('Campanha criada', 'success');
        }
      }
      setShowCampaignForm(false);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------------------
  // ASO helpers
  // ---------------------------------------------------------------------------

  function toggleAso(index: number) {
    setAsoChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  const asoCompleted = asoChecked.filter(Boolean).length;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading) return <CockpitSkeleton />;

  return (
    <div className="p-4 sm:p-6 space-y-8 pb-20">
      {/* ================================================================= */}
      {/* 1. METAS DE CRESCIMENTO */}
      {/* ================================================================= */}
      <section aria-label="Metas de Crescimento">
        <SectionHeader title="Metas de Crescimento" />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <GrowthKpiCard
            title="Academias"
            current={kpi?.activeAcademies ?? 0}
            target={20}
            icon={<Target className="h-4 w-4" />}
          />
          <GrowthKpiCard
            title="MRR"
            current={kpi?.mrr ?? 0}
            target={2000}
            formatValue={formatCurrency}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <GrowthKpiCard
            title="Coaches Ativos"
            current={kpi?.activeUsers7d ?? 0}
            target={40}
            icon={<Users className="h-4 w-4" />}
          />
          <GrowthKpiCard
            title="NPS"
            current={kpi?.npsScore ?? 0}
            target={30}
            formatValue={(v) => `>${v}`}
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. FUNIL DE CONVERSÃO */}
      {/* ================================================================= */}
      <section aria-label="Funil de Conversão">
        <SectionHeader title="Funil de Conversão" />
        <div className="mt-4 space-y-3">
          {MOCK_FUNNEL.map((step, i) => {
            const maxCount = MOCK_FUNNEL[0].count;
            const widthPct = maxCount > 0 ? Math.max(8, Math.round((step.count / maxCount) * 100)) : 8;
            const conversionPct =
              i > 0 && MOCK_FUNNEL[i - 1].count > 0
                ? Math.round((step.count / MOCK_FUNNEL[i - 1].count) * 100)
                : null;

            return (
              <div key={step.stage}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-1)' }}>
                    {step.stage}
                  </span>
                  <div className="flex items-center gap-2">
                    {conversionPct !== null && (
                      <span className="text-xs" style={{ color: 'var(--bb-ink-3)' }}>
                        {conversionPct}% conv.
                      </span>
                    )}
                    <span className="text-sm font-bold" style={{ color: 'var(--bb-brand)' }}>
                      {step.count}
                    </span>
                  </div>
                </div>
                <div className="h-6 rounded-lg overflow-hidden" style={{ background: 'var(--bb-depth-1)' }}>
                  <div
                    className="h-full rounded-lg transition-all duration-500"
                    style={{
                      width: `${widthPct}%`,
                      background: 'var(--bb-brand)',
                      opacity: 1 - i * 0.12,
                    }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-xs italic mt-2" style={{ color: 'var(--bb-ink-3)' }}>
            Dados reais disponíveis após integrar analytics
          </p>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 3. CALENDÁRIO DE CONTEÚDO */}
      {/* ================================================================= */}
      <section aria-label="Calendário de Conteúdo">
        <SectionHeader
          title="Calendário de Conteúdo"
          action={{
            label: 'Novo Conteúdo',
            onClick: () => openNewContentForm(),
            icon: <Plus className="h-4 w-4" />,
          }}
        />

        {/* Month navigation */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={prevMonth}
            aria-label="Mês anterior"
            className="p-1 rounded-lg"
            style={{ color: 'var(--bb-ink-2)' }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-1)' }}>
            {MONTH_NAMES[calMonth - 1]} {calYear}
          </span>
          <button
            onClick={nextMonth}
            aria-label="Próximo mês"
            className="p-1 rounded-lg"
            style={{ color: 'var(--bb-ink-2)' }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Platform filter pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => setPlatformFilter(null)}
            aria-label="Todas as plataformas"
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
            style={{
              background: platformFilter === null ? 'var(--bb-brand)' : 'var(--bb-depth-1)',
              color: platformFilter === null ? '#fff' : 'var(--bb-ink-2)',
            }}
          >
            Todas
          </button>
          {PLATFORM_OPTIONS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPlatformFilter(platformFilter === p.value ? null : p.value)}
              aria-label={`Filtrar por ${p.label}`}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                background: platformFilter === p.value ? 'var(--bb-brand)' : 'var(--bb-depth-1)',
                color: platformFilter === p.value ? '#fff' : 'var(--bb-ink-2)',
              }}
            >
              {getPlatformIcon(p.value)}
              {p.label}
            </button>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="mt-3 grid grid-cols-7 gap-px rounded-xl overflow-hidden" style={{ background: 'var(--bb-depth-1)' }}>
          {/* Header row */}
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-semibold"
              style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-3)' }}
            >
              {d}
            </div>
          ))}
          {/* Day cells */}
          {calendarDays.map(({ day, key }) => {
            const dayContent = day ? getContentForDay(day) : [];
            const isSelected = selectedDay === day && day !== null;
            return (
              <button
                key={key}
                disabled={day === null}
                onClick={() => day !== null && setSelectedDay(selectedDay === day ? null : day)}
                aria-label={day !== null ? `Dia ${day} de ${MONTH_NAMES[calMonth - 1]}` : undefined}
                className="relative min-h-[3rem] sm:min-h-[4rem] p-1 text-left align-top transition-colors"
                style={{
                  background: isSelected ? 'var(--bb-brand)' : 'var(--bb-depth-2)',
                  cursor: day !== null ? 'pointer' : 'default',
                }}
              >
                {day !== null && (
                  <>
                    <span
                      className="text-xs font-medium"
                      style={{ color: isSelected ? '#fff' : 'var(--bb-ink-2)' }}
                    >
                      {day}
                    </span>
                    {dayContent.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-0.5">
                        {dayContent.slice(0, 3).map((c) => {
                          const statusInfo = getContentStatusInfo(c.status);
                          return (
                            <span
                              key={c.id}
                              className="block h-1.5 w-1.5 rounded-full"
                              style={{ background: `var(--bb-${statusInfo.variant === 'neutral' ? 'ink-3' : statusInfo.variant === 'info' ? 'brand' : statusInfo.variant})` }}
                              title={c.title}
                            />
                          );
                        })}
                        {dayContent.length > 3 && (
                          <span className="text-[8px]" style={{ color: isSelected ? '#fff' : 'var(--bb-ink-3)' }}>
                            +{dayContent.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day content list */}
        {selectedDay !== null && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-1)' }}>
                {selectedDay} de {MONTH_NAMES[calMonth - 1]}
              </p>
              <button
                onClick={() => openNewContentForm(selectedDay)}
                aria-label="Adicionar conteúdo neste dia"
                className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg"
                style={{ color: 'var(--bb-brand)', background: 'var(--bb-depth-1)' }}
              >
                <Plus className="h-3 w-3" />
                Adicionar
              </button>
            </div>
            {getContentForDay(selectedDay).length === 0 ? (
              <p className="text-xs py-4 text-center" style={{ color: 'var(--bb-ink-3)' }}>
                Nenhum conteúdo planejado para este dia.
              </p>
            ) : (
              getContentForDay(selectedDay).map((item) => {
                const statusInfo = getContentStatusInfo(item.status);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-lg p-3"
                    style={{ background: 'var(--bb-depth-1)' }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span style={{ color: 'var(--bb-ink-3)' }}>{getPlatformIcon(item.platform)}</span>
                      <span className="text-sm truncate" style={{ color: 'var(--bb-ink-1)' }}>{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge label={statusInfo.label} variant={statusInfo.variant} />
                      <button
                        onClick={() => openEditContentForm(item)}
                        aria-label={`Editar ${item.title}`}
                        className="text-xs font-medium px-2 py-1 rounded"
                        style={{ color: 'var(--bb-brand)' }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeleteContentId(item.id)}
                        aria-label={`Excluir ${item.title}`}
                        className="text-xs font-medium px-2 py-1 rounded"
                        style={{ color: 'var(--bb-danger)' }}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* 4. CAMPANHAS & EXPERIMENTOS */}
      {/* ================================================================= */}
      <section aria-label="Campanhas e Experimentos">
        <SectionHeader
          title="Campanhas"
          action={{
            label: 'Nova Campanha',
            onClick: openNewCampaignForm,
            icon: <Plus className="h-4 w-4" />,
          }}
        />

        <div className="mt-4 space-y-3">
          {campaigns.length === 0 ? (
            <EmptyState
              icon={<Megaphone className="h-10 w-10" />}
              title="Nenhuma campanha"
              description="Crie sua primeira campanha de aquisição."
              action={{ label: 'Nova Campanha', onClick: openNewCampaignForm }}
            />
          ) : (
            campaigns.map((camp) => {
              const statusInfo = getCampaignStatusInfo(camp.status);
              const isExpanded = expandedCampaign === camp.id;
              const hasProg = camp.target_value !== null && camp.target_value > 0;

              return (
                <div
                  key={camp.id}
                  className="rounded-xl overflow-hidden"
                  style={{ background: 'var(--bb-depth-2)' }}
                >
                  <button
                    onClick={() => setExpandedCampaign(isExpanded ? null : camp.id)}
                    aria-label={`${isExpanded ? 'Recolher' : 'Expandir'} campanha ${camp.name}`}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold truncate" style={{ color: 'var(--bb-ink-1)' }}>
                          {camp.name}
                        </span>
                        <StatusBadge label={getCampaignChannelLabel(camp.channel)} variant="info" />
                        <StatusBadge label={statusInfo.label} variant={statusInfo.variant} />
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs" style={{ color: 'var(--bb-ink-3)' }}>
                          Budget: {formatCurrency(camp.budget_brl)}
                        </span>
                        {hasProg && (
                          <span className="text-xs" style={{ color: 'var(--bb-ink-3)' }}>
                            {camp.actual_value ?? 0} / {camp.target_value} {camp.target_metric}
                          </span>
                        )}
                      </div>
                      {hasProg && (
                        <ProgressBar current={camp.actual_value ?? 0} target={camp.target_value!} />
                      )}
                    </div>
                    <div className="shrink-0 ml-2" style={{ color: 'var(--bb-ink-3)' }}>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2" style={{ borderTop: '1px solid var(--bb-depth-1)' }}>
                      {camp.goal && (
                        <div>
                          <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-3)' }}>Objetivo: </span>
                          <span className="text-sm" style={{ color: 'var(--bb-ink-2)' }}>{camp.goal}</span>
                        </div>
                      )}
                      {camp.result && (
                        <div>
                          <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-3)' }}>Resultado: </span>
                          <span className="text-sm" style={{ color: 'var(--bb-ink-2)' }}>{camp.result}</span>
                        </div>
                      )}
                      {camp.learnings && (
                        <div>
                          <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-3)' }}>Aprendizados: </span>
                          <span className="text-sm" style={{ color: 'var(--bb-ink-2)' }}>{camp.learnings}</span>
                        </div>
                      )}
                      {camp.start_date && (
                        <div>
                          <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-3)' }}>Período: </span>
                          <span className="text-sm" style={{ color: 'var(--bb-ink-2)' }}>
                            {camp.start_date}{camp.end_date ? ` → ${camp.end_date}` : ' → em aberto'}
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => openEditCampaignForm(camp)}
                          aria-label={`Editar campanha ${camp.name}`}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg"
                          style={{ color: 'var(--bb-brand)', border: '1px solid var(--bb-brand)' }}
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 5. ASO CHECKLIST */}
      {/* ================================================================= */}
      <section aria-label="ASO Checklist">
        <SectionHeader title="ASO Checklist — Prontidão das Lojas" />
        <div className="mt-4 rounded-xl p-4" style={{ background: 'var(--bb-depth-2)' }}>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--bb-ink-1)' }}>
            {asoCompleted} de {ASO_CHECKLIST.length} concluídos
          </p>
          <ProgressBar current={asoCompleted} target={ASO_CHECKLIST.length} />
          <div className="mt-4 space-y-2">
            {ASO_CHECKLIST.map((item, idx) => (
              <label
                key={item}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <button
                  role="checkbox"
                  aria-checked={asoChecked[idx]}
                  aria-label={item}
                  onClick={() => toggleAso(idx)}
                  className="flex items-center justify-center h-5 w-5 rounded shrink-0 transition-colors"
                  style={{
                    background: asoChecked[idx] ? 'var(--bb-success)' : 'var(--bb-depth-1)',
                    border: asoChecked[idx] ? 'none' : '1px solid var(--bb-ink-3)',
                  }}
                >
                  {asoChecked[idx] && (
                    <CheckSquare className="h-4 w-4" style={{ color: '#fff' }} />
                  )}
                </button>
                <span
                  className="text-sm"
                  style={{
                    color: asoChecked[idx] ? 'var(--bb-ink-3)' : 'var(--bb-ink-1)',
                    textDecoration: asoChecked[idx] ? 'line-through' : 'none',
                  }}
                >
                  {item}
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 6. CANAIS DE AQUISIÇÃO */}
      {/* ================================================================= */}
      <section aria-label="Canais de Aquisição">
        <SectionHeader title="Canais de Aquisição" />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm" style={{ color: 'var(--bb-ink-1)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bb-depth-1)' }}>
                <th className="py-2 pr-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-3)' }}>Canal</th>
                <th className="py-2 px-3 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--bb-ink-3)' }}>Leads</th>
                <th className="py-2 px-3 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--bb-ink-3)' }}>Conv.</th>
                <th className="py-2 px-3 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--bb-ink-3)' }}>Custo</th>
                <th className="py-2 pl-3 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--bb-ink-3)' }}>CAC</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CHANNELS.map((ch) => {
                const cac = ch.conversions > 0 ? ch.cost / ch.conversions : null;
                return (
                  <tr key={ch.name} style={{ borderBottom: '1px solid var(--bb-depth-1)' }}>
                    <td className="py-3 pr-3 font-medium" style={{ color: 'var(--bb-ink-1)' }}>{ch.name}</td>
                    <td className="py-3 px-3 text-right" style={{ color: 'var(--bb-ink-2)' }}>{ch.leads}</td>
                    <td className="py-3 px-3 text-right" style={{ color: 'var(--bb-ink-2)' }}>{ch.conversions}</td>
                    <td className="py-3 px-3 text-right" style={{ color: 'var(--bb-ink-2)' }}>{formatCurrency(ch.cost)}</td>
                    <td className="py-3 pl-3 text-right font-medium" style={{ color: cac !== null ? 'var(--bb-brand)' : 'var(--bb-ink-3)' }}>
                      {cac !== null ? formatCurrency(Math.round(cac)) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs italic mt-3" style={{ color: 'var(--bb-ink-3)' }}>
            Dados mock — display only por enquanto
          </p>
        </div>
      </section>

      {/* ================================================================= */}
      {/* MODALS */}
      {/* ================================================================= */}

      {/* Content form modal */}
      <ModalForm
        open={showContentForm}
        onClose={() => setShowContentForm(false)}
        title={editingContent ? 'Editar Conteúdo' : 'Novo Conteúdo'}
      >
        <div>
          <FormField label="Título">
            <input
              type="text"
              value={contentForm.title}
              onChange={(e) => setContentForm((f) => ({ ...f, title: e.target.value }))}
              aria-label="Título do conteúdo"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle}
              placeholder="Título do conteúdo"
            />
          </FormField>

          <FormField label="Plataforma">
            <select
              value={contentForm.platform}
              onChange={(e) => setContentForm((f) => ({ ...f, platform: e.target.value }))}
              aria-label="Plataforma"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle}
            >
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Tipo">
            <select
              value={contentForm.content_type}
              onChange={(e) => setContentForm((f) => ({ ...f, content_type: e.target.value }))}
              aria-label="Tipo de conteúdo"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle}
            >
              {CONTENT_TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Data planejada">
            <input
              type="date"
              value={contentForm.planned_date}
              onChange={(e) => setContentForm((f) => ({ ...f, planned_date: e.target.value }))}
              aria-label="Data planejada"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle}
            />
          </FormField>

          <FormField label="Status">
            <select
              value={contentForm.status}
              onChange={(e) => setContentForm((f) => ({ ...f, status: e.target.value }))}
              aria-label="Status do conteúdo"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle}
            >
              {Object.entries(CONTENT_STATUS_MAP).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Persona alvo">
            <input
              type="text"
              value={contentForm.target_persona}
              onChange={(e) => setContentForm((f) => ({ ...f, target_persona: e.target.value }))}
              aria-label="Persona alvo"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle}
              placeholder="Ex: admin, aluno, professor"
            />
          </FormField>

          <FormField label="Notas">
            <textarea
              value={contentForm.notes}
              onChange={(e) => setContentForm((f) => ({ ...f, notes: e.target.value }))}
              aria-label="Notas do conteúdo"
              className="w-full rounded-lg px-3 py-2 text-sm resize-y"
              style={inputStyle}
              rows={3}
              placeholder="Observações, SEO keywords, etc."
            />
          </FormField>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowContentForm(false)}
              aria-label="Cancelar"
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-2)' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveContent}
              disabled={saving}
              aria-label={editingContent ? 'Salvar alterações' : 'Criar conteúdo'}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
              style={{ background: 'var(--bb-brand)', color: '#fff' }}
            >
              {saving ? 'Salvando...' : editingContent ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </div>
      </ModalForm>

      {/* Campaign form modal */}
      <ModalForm
        open={showCampaignForm}
        onClose={() => setShowCampaignForm(false)}
        title={editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}
      >
        <div>
          <FormField label="Nome">
            <input
              type="text"
              value={campaignForm.name}
              onChange={(e) => setCampaignForm((f) => ({ ...f, name: e.target.value }))}
              aria-label="Nome da campanha"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle}
              placeholder="Nome da campanha"
            />
          </FormField>

          <FormField label="Canal">
            <select
              value={campaignForm.channel}
              onChange={(e) => setCampaignForm((f) => ({ ...f, channel: e.target.value }))}
              aria-label="Canal da campanha"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle}
            >
              {CAMPAIGN_CHANNEL_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Budget (R$)">
            <input
              type="number"
              value={campaignForm.budget_brl}
              onChange={(e) => setCampaignForm((f) => ({ ...f, budget_brl: Number(e.target.value) }))}
              aria-label="Budget da campanha"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle}
              min={0}
            />
          </FormField>

          <FormField label="Objetivo">
            <input
              type="text"
              value={campaignForm.goal}
              onChange={(e) => setCampaignForm((f) => ({ ...f, goal: e.target.value }))}
              aria-label="Objetivo da campanha"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle}
              placeholder="Ex: Conquistar 5 academias beta"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Métrica alvo">
              <input
                type="text"
                value={campaignForm.target_metric}
                onChange={(e) => setCampaignForm((f) => ({ ...f, target_metric: e.target.value }))}
                aria-label="Métrica alvo"
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={inputStyle}
                placeholder="leads, sign_ups..."
              />
            </FormField>
            <FormField label="Valor alvo">
              <input
                type="number"
                value={campaignForm.target_value}
                onChange={(e) => setCampaignForm((f) => ({ ...f, target_value: Number(e.target.value) }))}
                aria-label="Valor alvo"
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={inputStyle}
                min={0}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Data início">
              <input
                type="date"
                value={campaignForm.start_date}
                onChange={(e) => setCampaignForm((f) => ({ ...f, start_date: e.target.value }))}
                aria-label="Data de início"
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={inputStyle}
              />
            </FormField>
            <FormField label="Data fim">
              <input
                type="date"
                value={campaignForm.end_date}
                onChange={(e) => setCampaignForm((f) => ({ ...f, end_date: e.target.value }))}
                aria-label="Data de fim"
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={inputStyle}
              />
            </FormField>
          </div>

          <FormField label="Status">
            <select
              value={campaignForm.status}
              onChange={(e) => setCampaignForm((f) => ({ ...f, status: e.target.value }))}
              aria-label="Status da campanha"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle}
            >
              {Object.entries(CAMPAIGN_STATUS_MAP).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </FormField>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowCampaignForm(false)}
              aria-label="Cancelar"
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-2)' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveCampaign}
              disabled={saving}
              aria-label={editingCampaign ? 'Salvar alterações' : 'Criar campanha'}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
              style={{ background: 'var(--bb-brand)', color: '#fff' }}
            >
              {saving ? 'Salvando...' : editingCampaign ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </div>
      </ModalForm>

      {/* Content delete confirm dialog */}
      <ConfirmDialog
        open={deleteContentId !== null}
        onClose={() => setDeleteContentId(null)}
        onConfirm={handleDeleteContent}
        title="Excluir conteúdo"
        message="Tem certeza que deseja excluir este conteúdo? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  );
}
