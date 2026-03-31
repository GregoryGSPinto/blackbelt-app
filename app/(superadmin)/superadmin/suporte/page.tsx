'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  AlertTriangle,
  BarChart3,
  Bot,
  Gauge,
  HeartPulse,
  LayoutDashboard,
  LifeBuoy,
  MonitorSmartphone,
  ShieldAlert,
  TimerReset,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { useSWRFetch } from '@/lib/hooks/useSWRFetch';
import {
  addPlatformFeedbackComment,
  getPlatformCentralSnapshot,
  updatePlatformFeedbackItem,
  type PlatformCentralSnapshot,
  type PlatformSignalStatus,
  type SupportFeedbackItem,
  type SupportFeedbackCategory,
} from '@/lib/api/platform-central.service';

const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then((mod) => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((mod) => mod.Area), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });

type TabKey = 'overview' | 'support' | 'errors' | 'devices' | 'health';

const TABS: Array<{ key: TabKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
  { key: 'support', label: 'Suporte & Feedback', icon: LifeBuoy },
  { key: 'errors', label: 'Erros & Performance', icon: Gauge },
  { key: 'devices', label: 'Dispositivos & Layout', icon: MonitorSmartphone },
  { key: 'health', label: 'Saúde, Segurança & IA', icon: ShieldAlert },
];

const STATUS_ORDER: SupportFeedbackItem['status'][] = [
  'new',
  'triaged',
  'in_progress',
  'waiting_customer',
  'resolved',
  'closed',
];

const CARD_STYLE: React.CSSProperties = {
  background: 'var(--bb-depth-3)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-lg)',
};

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'var(--bb-depth-4)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: '8px',
  color: 'var(--bb-ink-100)',
  fontSize: '12px',
};

const STATUS_META: Record<PlatformSignalStatus, { label: string; color: string; bg: string }> = {
  healthy: { label: 'Verde', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  warning: { label: 'Amarelo', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  critical: { label: 'Vermelho', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  unknown: { label: 'Sem leitura', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
  not_configured: { label: 'Não configurado', color: '#64748b', bg: 'rgba(100,116,139,0.15)' },
};

const WORKFLOW_META: Record<SupportFeedbackItem['status'], { label: string; color: string; bg: string }> = {
  new: { label: 'Novo', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  triaged: { label: 'Triado', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  in_progress: { label: 'Em progresso', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  waiting_customer: { label: 'Aguardando cliente', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  resolved: { label: 'Resolvido', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  closed: { label: 'Fechado', color: '#64748b', bg: 'rgba(100,116,139,0.15)' },
  archived: { label: 'Arquivado', color: '#475569', bg: 'rgba(71,85,105,0.15)' },
};

const SEVERITY_META: Record<SupportFeedbackItem['severity'], { color: string; bg: string }> = {
  low: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  medium: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  high: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

function signalBadge(status: PlatformSignalStatus) {
  const meta = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold"
      style={{ background: meta.bg, color: meta.color }}
    >
      {meta.label}
    </span>
  );
}

function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR');
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'n/a';
  return new Date(value).toLocaleString('pt-BR');
}

function timeAgo(value: string): string {
  const diffMinutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (diffMinutes < 60) return `${Math.max(diffMinutes, 0)} min`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} h`;
  return `${Math.floor(diffMinutes / 1440)} d`;
}

function TabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} variant="card" className="h-28" />
        ))}
      </div>
      <Skeleton variant="card" className="h-80" />
      <Skeleton variant="card" className="h-72" />
    </div>
  );
}

function StatusPill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold"
      style={{ color, background: bg }}
    >
      {label}
    </span>
  );
}

export default function PlatformCentralPage() {
  const { toast } = useToast();
  const [periodDays, setPeriodDays] = useState<7 | 30>(30);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | SupportFeedbackCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | SupportFeedbackItem['status']>('all');
  const [selectedItem, setSelectedItem] = useState<SupportFeedbackItem | null>(null);
  const [note, setNote] = useState('');
  const { data, loading, refresh } = useSWRFetch<PlatformCentralSnapshot>(
    `platform-central-${periodDays}`,
    () => getPlatformCentralSnapshot(periodDays),
  );

  const supportItems = useMemo(() => {
    if (!data) return [];
    return data.support.items.filter((item) => {
      const matchesSearch =
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.academyName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [categoryFilter, data, search, statusFilter]);

  const kanban = useMemo(
    () =>
      STATUS_ORDER.map((status) => ({
        status,
        label: WORKFLOW_META[status].label,
        items: supportItems.filter((item) => item.status === status),
      })),
    [supportItems],
  );

  useEffect(() => {
    if (!selectedItem || !data) return;
    const next = data.support.items.find((item) => item.id === selectedItem.id);
    if (next) setSelectedItem(next);
  }, [data, selectedItem]);

  async function mutateFeedback(
    itemId: string,
    payload: Parameters<typeof updatePlatformFeedbackItem>[1],
    successMessage: string,
  ) {
    try {
      await updatePlatformFeedbackItem(itemId, payload);
      await refresh();
      toast(successMessage, 'success');
    } catch {
      toast('Falha ao atualizar item de suporte.', 'error');
    }
  }

  async function addComment(itemId: string) {
    if (!note.trim()) return;
    try {
      await addPlatformFeedbackComment(itemId, note.trim(), true);
      setNote('');
      await refresh();
      toast('Comentário interno registrado.', 'success');
    } catch {
      toast('Falha ao registrar comentário.', 'error');
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Central da Plataforma
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Operação enterprise do Super Admin com suporte, observabilidade e saúde da plataforma.
          </p>
        </div>
        <TabSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Central da Plataforma
          </h1>
          <p className="mt-1 max-w-3xl text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Consolidação operacional de visão geral, suporte, erros, layout, saúde, segurança detectável e IA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setPeriodDays(value as 7 | 30)}
              className="rounded-full px-3 py-2 text-sm font-semibold"
              style={{
                background: periodDays === value ? 'var(--bb-warning-surface)' : 'var(--bb-depth-3)',
                color: periodDays === value ? 'var(--bb-warning)' : 'var(--bb-ink-60)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              {value} dias
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={{
                background: active ? 'var(--bb-warning-surface)' : 'var(--bb-depth-3)',
                color: active ? 'var(--bb-warning)' : 'var(--bb-ink-60)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              { label: 'Acessos', value: formatNumber(data.overview.totalAccesses), icon: BarChart3 },
              { label: 'Usuários ativos', value: formatNumber(data.overview.activeUsers), icon: LayoutDashboard },
              { label: 'Tenants ativos', value: formatNumber(data.overview.activeTenants), icon: HeartPulse },
              { label: 'Taxa de erro', value: formatPercent(data.overview.errorRatePercent), icon: AlertTriangle },
              { label: 'Latência média', value: `${formatNumber(data.overview.avgLatencyMs)} ms`, icon: TimerReset },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="p-4" style={CARD_STYLE}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.12em]" style={{ color: 'var(--bb-ink-40)' }}>
                      {card.label}
                    </span>
                    <Icon size={16} color="#f59e0b" />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                    {card.value}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
            <div className="p-4" style={CARD_STYLE}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                    Tendência operacional
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                    Acessos, erro e latência no período.
                  </p>
                </div>
                <div className="flex gap-2">
                  {signalBadge(data.overview.healthScore.status)}
                  {signalBadge(data.overview.securityScore.status)}
                  {signalBadge(data.overview.uxScore.status)}
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.overview.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Area type="monotone" dataKey="accesses" stroke="#f59e0b" fill="rgba(245,158,11,0.16)" />
                    <Area type="monotone" dataKey="errors" stroke="#ef4444" fill="rgba(239,68,68,0.16)" />
                    <Area type="monotone" dataKey="avgLatencyMs" stroke="#3b82f6" fill="rgba(59,130,246,0.12)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4" style={CARD_STYLE}>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                  Scores executivos
                </h2>
                <div className="mt-4 space-y-3">
                  {[
                    { label: 'Saúde geral', score: data.overview.healthScore },
                    { label: 'Segurança detectável', score: data.overview.securityScore },
                    { label: 'UX operacional', score: data.overview.uxScore },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--bb-depth-2)' }}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                          {item.label}
                        </span>
                        {signalBadge(item.score.status)}
                      </div>
                      <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                        {item.score.value.toFixed(1)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4" style={CARD_STYLE}>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                  Atenção imediata
                </h2>
                <div className="mt-4 space-y-3">
                  {data.overview.attention.map((item) => (
                    <div key={`${item.title}-${item.detail}`} className="rounded-xl p-3" style={{ background: 'var(--bb-depth-2)' }}>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                          {item.title}
                        </p>
                        {signalBadge(item.status)}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4" style={CARD_STYLE}>
            <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Rotas mais afetadas
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr style={{ color: 'var(--bb-ink-40)' }}>
                    <th className="px-3 py-2 text-left font-medium">Rota</th>
                    <th className="px-3 py-2 text-left font-medium">Erros</th>
                    <th className="px-3 py-2 text-left font-medium">Tenants impactados</th>
                  </tr>
                </thead>
                <tbody>
                  {data.overview.topAffectedRoutes.map((route) => (
                    <tr key={route.routePath} style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
                      <td className="px-3 py-3 font-medium" style={{ color: 'var(--bb-ink-100)' }}>{route.routePath}</td>
                      <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>{route.errors}</td>
                      <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>{route.affectedTenants}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
            {[
              ['Total', data.support.metrics.total],
              ['Abertos', data.support.metrics.open],
              ['Em progresso', data.support.metrics.inProgress],
              ['Críticos', data.support.metrics.critical],
              ['1ª resposta', `${data.support.metrics.avgFirstResponseHours} h`],
              ['Resolução', `${data.support.metrics.avgResolutionHours} h`],
            ].map(([label, value]) => (
              <div key={label} className="p-4" style={CARD_STYLE}>
                <p className="text-xs uppercase tracking-[0.12em]" style={{ color: 'var(--bb-ink-40)' }}>{label}</p>
                <p className="mt-3 text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr_1fr]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título, descrição ou tenant"
              className="h-11 rounded-xl px-4 text-sm outline-none"
              style={{ ...CARD_STYLE, color: 'var(--bb-ink-100)', background: 'var(--bb-depth-2)' }}
            />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as 'all' | SupportFeedbackCategory)}
              className="h-11 rounded-xl px-4 text-sm outline-none"
              style={{ ...CARD_STYLE, color: 'var(--bb-ink-100)', background: 'var(--bb-depth-2)' }}
            >
              <option value="all">Todas as categorias</option>
              <option value="feedback">Feedback</option>
              <option value="complaint">Reclamações</option>
              <option value="suggestion">Sugestões</option>
              <option value="bug">Bugs</option>
              <option value="question">Dúvidas</option>
              <option value="incident">Incidentes</option>
              <option value="praise">Elogios</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | SupportFeedbackItem['status'])}
              className="h-11 rounded-xl px-4 text-sm outline-none"
              style={{ ...CARD_STYLE, color: 'var(--bb-ink-100)', background: 'var(--bb-depth-2)' }}
            >
              <option value="all">Todos os status</option>
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>{WORKFLOW_META[status].label}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="grid min-w-[1100px] grid-cols-6 gap-4">
              {kanban.map((column) => (
                <div key={column.status} className="p-3" style={CARD_STYLE}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{column.label}</span>
                    <StatusPill label={String(column.items.length)} color={WORKFLOW_META[column.status].color} bg={WORKFLOW_META[column.status].bg} />
                  </div>
                  <div className="space-y-3">
                    {column.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="w-full rounded-xl p-3 text-left"
                        style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <StatusPill label={item.severity.toUpperCase()} color={SEVERITY_META[item.severity].color} bg={SEVERITY_META[item.severity].bg} />
                          <span className="text-[11px]" style={{ color: 'var(--bb-ink-40)' }}>{timeAgo(item.createdAt)}</span>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{item.title}</p>
                        <p className="mt-2 line-clamp-3 text-xs" style={{ color: 'var(--bb-ink-60)' }}>{item.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="text-[11px]" style={{ color: 'var(--bb-ink-40)' }}>{item.academyName}</span>
                          <span className="text-[11px]" style={{ color: 'var(--bb-ink-40)' }}>{item.category}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4" style={CARD_STYLE}>
            <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Fila densa
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr style={{ color: 'var(--bb-ink-40)' }}>
                    <th className="px-3 py-2 text-left font-medium">Item</th>
                    <th className="px-3 py-2 text-left font-medium">Tenant</th>
                    <th className="px-3 py-2 text-left font-medium">Categoria</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                    <th className="px-3 py-2 text-left font-medium">Responsável</th>
                    <th className="px-3 py-2 text-left font-medium">Última atividade</th>
                  </tr>
                </thead>
                <tbody>
                  {supportItems.map((item) => (
                    <tr
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedItem(item)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') setSelectedItem(item);
                      }}
                      style={{ borderTop: '1px solid var(--bb-glass-border)', cursor: 'pointer' }}
                    >
                      <td className="px-3 py-3">
                        <p className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{item.title}</p>
                        <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{item.routePath ?? 'sem rota'} · {item.viewport}</p>
                      </td>
                      <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>{item.academyName}</td>
                      <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>{item.category}</td>
                      <td className="px-3 py-3"><StatusPill label={WORKFLOW_META[item.status].label} color={WORKFLOW_META[item.status].color} bg={WORKFLOW_META[item.status].bg} /></td>
                      <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>{item.assignedTo ?? 'Sem dono'}</td>
                      <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>{timeAgo(item.lastActivityAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'errors' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {[
              ['Erros', data.errorsPerformance.totals.errors],
              ['Falhas de auth', data.errorsPerformance.totals.authFailures],
              ['Timeouts', data.errorsPerformance.totals.timeouts],
              ['Releases com regressão', data.errorsPerformance.totals.regressions],
            ].map(([label, value]) => (
              <div key={label} className="p-4" style={CARD_STYLE}>
                <p className="text-xs uppercase tracking-[0.12em]" style={{ color: 'var(--bb-ink-40)' }}>{label}</p>
                <p className="mt-3 text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="p-4" style={CARD_STYLE}>
              <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Top erros por rota/dispositivo</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr style={{ color: 'var(--bb-ink-40)' }}>
                      <th className="px-3 py-2 text-left">Rota</th>
                      <th className="px-3 py-2 text-left">Dispositivo</th>
                      <th className="px-3 py-2 text-left">Erros</th>
                      <th className="px-3 py-2 text-left">Auth</th>
                      <th className="px-3 py-2 text-left">Timeout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.errorsPerformance.topErrors.map((item) => (
                      <tr key={`${item.routePath}-${item.deviceType}-${item.releaseVersion}`} style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
                        <td className="px-3 py-3" style={{ color: 'var(--bb-ink-100)' }}>{item.routePath}</td>
                        <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>{item.deviceType}</td>
                        <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>{item.errorCount}</td>
                        <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>{item.authFailures}</td>
                        <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>{item.timeoutCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4" style={CARD_STYLE}>
              <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Rotas lentas</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.errorsPerformance.slowRoutes.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                    <XAxis dataKey="routePath" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="avgLoadTimeMs" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="p95LoadTimeMs" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="p-4" style={CARD_STYLE}>
            <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Regressão por release</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr style={{ color: 'var(--bb-ink-40)' }}>
                    <th className="px-3 py-2 text-left">Release</th>
                    <th className="px-3 py-2 text-left">Erros</th>
                    <th className="px-3 py-2 text-left">Latência média</th>
                    <th className="px-3 py-2 text-left">Rotas impactadas</th>
                  </tr>
                </thead>
                <tbody>
                  {data.errorsPerformance.releaseRegressions.map((item) => (
                    <tr key={item.releaseVersion} style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
                      <td className="px-3 py-3 font-medium" style={{ color: 'var(--bb-ink-100)' }}>{item.releaseVersion}</td>
                      <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>{item.errorCount}</td>
                      <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>{item.avgLoadTimeMs} ms</td>
                      <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>{item.impactedRoutes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'devices' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.4fr]">
            <div className="p-4" style={CARD_STYLE}>
              <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Distribuição por dispositivo</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.devicesLayout.distribution}
                      dataKey="count"
                      nameKey="deviceType"
                      outerRadius={110}
                      label
                    >
                      {data.devicesLayout.distribution.map((item, index) => (
                        <Cell key={`${item.deviceType}-${index}`} fill={['#f59e0b', '#3b82f6', '#22c55e', '#ef4444', '#a855f7'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="p-4" style={CARD_STYLE}>
              <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Breakpoints mais usados</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.devicesLayout.heatmap}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                    <XAxis dataKey="breakpoint" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="p-4" style={CARD_STYLE}>
              <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Resoluções mais frequentes</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr style={{ color: 'var(--bb-ink-40)' }}>
                      <th className="px-3 py-2 text-left">Resolução</th>
                      <th className="px-3 py-2 text-left">Snapshots</th>
                      <th className="px-3 py-2 text-left">Risco layout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.devicesLayout.resolutions.map((item) => (
                      <tr key={item.resolution} style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
                        <td className="px-3 py-3" style={{ color: 'var(--bb-ink-100)' }}>{item.resolution}</td>
                        <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>{item.count}</td>
                        <td className="px-3 py-3">{signalBadge(item.avgLayoutRiskScore >= 70 ? 'critical' : item.avgLayoutRiskScore >= 35 ? 'warning' : 'healthy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4" style={CARD_STYLE}>
              <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Rotas problemáticas por viewport</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr style={{ color: 'var(--bb-ink-40)' }}>
                      <th className="px-3 py-2 text-left">Rota</th>
                      <th className="px-3 py-2 text-left">Dispositivo</th>
                      <th className="px-3 py-2 text-left">Erros</th>
                      <th className="px-3 py-2 text-left">Latência</th>
                      <th className="px-3 py-2 text-left">Risco layout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.devicesLayout.routeRisks.map((item) => (
                      <tr key={`${item.routePath}-${item.deviceType}`} style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
                        <td className="px-3 py-3" style={{ color: 'var(--bb-ink-100)' }}>{item.routePath}</td>
                        <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>{item.deviceType}</td>
                        <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>{item.errors}</td>
                        <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>{item.avgLoadTimeMs} ms</td>
                        <td className="px-3 py-3">{signalBadge(item.layoutRiskScore >= 70 ? 'critical' : item.layoutRiskScore >= 35 ? 'warning' : 'healthy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_1fr]">
            <div className="p-4" style={CARD_STYLE}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Saúde, risco e segurança</h2>
                  <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                    Últimos snapshots por tenant e por componente crítico.
                  </p>
                </div>
                {signalBadge(data.healthSecurityAI.overallStatus)}
              </div>
              <div className="space-y-4">
                {data.healthSecurityAI.latest.map((tenant) => (
                  <div key={tenant.academyId} className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)' }}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{tenant.academyName}</p>
                        <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Snapshot {formatDate(tenant.snapshotAt)}</p>
                      </div>
                      {signalBadge(tenant.overallStatus)}
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em]" style={{ color: 'var(--bb-ink-40)' }}>Risco</p>
                        <p className="mt-1 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{tenant.riskScore?.toFixed(1) ?? 'n/a'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em]" style={{ color: 'var(--bb-ink-40)' }}>Segurança</p>
                        <p className="mt-1 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{tenant.securityScore?.toFixed(1) ?? 'n/a'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em]" style={{ color: 'var(--bb-ink-40)' }}>UX</p>
                        <p className="mt-1 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{tenant.uxScore?.toFixed(1) ?? 'n/a'}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tenant.components.map((component) => (
                        <span key={`${tenant.academyId}-${component.component}`} className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs" style={{ background: STATUS_META[component.status].bg, color: STATUS_META[component.status].color }}>
                          {component.component}
                          <span>{component.latencyMs != null ? `${component.latencyMs} ms` : 'sem latência'}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4" style={CARD_STYLE}>
                <div className="mb-3 flex items-center gap-2">
                  <ShieldAlert size={18} color="#f59e0b" />
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Segurança detectável</h2>
                </div>
                <div className="space-y-3">
                  {data.healthSecurityAI.vulnerabilities.length === 0 && (
                    <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                      Nenhum sinal crítico detectável no período analisado.
                    </p>
                  )}
                  {data.healthSecurityAI.vulnerabilities.map((signal) => (
                    <div key={`${signal.title}-${signal.detail}`} className="rounded-xl p-3" style={{ background: 'var(--bb-depth-2)' }}>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{signal.title}</p>
                        <StatusPill label={signal.severity.toUpperCase()} color={SEVERITY_META[signal.severity].color} bg={SEVERITY_META[signal.severity].bg} />
                      </div>
                      <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>{signal.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4" style={CARD_STYLE}>
                <div className="mb-3 flex items-center gap-2">
                  <Bot size={18} color="#3b82f6" />
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>IA / observability</h2>
                </div>
                {data.healthSecurityAI.ai.configured ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--bb-ink-60)' }}>Provider / modelo</span>
                      <span style={{ color: 'var(--bb-ink-100)' }}>{data.healthSecurityAI.ai.provider} · {data.healthSecurityAI.ai.model}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--bb-ink-60)' }}>Latência média</span>
                      <span style={{ color: 'var(--bb-ink-100)' }}>{data.healthSecurityAI.ai.avgLatencyMs ?? 0} ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--bb-ink-60)' }}>Requisições</span>
                      <span style={{ color: 'var(--bb-ink-100)' }}>{data.healthSecurityAI.ai.requestCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--bb-ink-60)' }}>Erros / timeouts</span>
                      <span style={{ color: 'var(--bb-ink-100)' }}>{data.healthSecurityAI.ai.errorCount} / {data.healthSecurityAI.ai.timeoutCount}</span>
                    </div>
                    {signalBadge(data.healthSecurityAI.ai.status)}
                  </div>
                ) : (
                  <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Não configurado</p>
                    <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                      A arquitetura já suporta snapshots de provider/modelo, mas não há integração ativa suficiente para exibir dados reais.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal open={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} title={selectedItem?.title ?? 'Detalhe'}>
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill label={WORKFLOW_META[selectedItem.status].label} color={WORKFLOW_META[selectedItem.status].color} bg={WORKFLOW_META[selectedItem.status].bg} />
              <StatusPill label={selectedItem.severity.toUpperCase()} color={SEVERITY_META[selectedItem.severity].color} bg={SEVERITY_META[selectedItem.severity].bg} />
              <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{selectedItem.academyName}</span>
              <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{selectedItem.routePath ?? 'sem rota'}</span>
            </div>

            <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)' }}>
              <p className="text-sm leading-6" style={{ color: 'var(--bb-ink-80)' }}>{selectedItem.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedItem.tags.map((tag) => (
                  <span key={tag} className="rounded-full px-2 py-1 text-xs" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>{tag}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)' }}>
                <p className="text-xs uppercase tracking-[0.12em]" style={{ color: 'var(--bb-ink-40)' }}>Responsável</p>
                <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{selectedItem.assignedTo ?? 'Sem dono'}</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)' }}>
                <p className="text-xs uppercase tracking-[0.12em]" style={{ color: 'var(--bb-ink-40)' }}>Última atividade</p>
                <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{formatDate(selectedItem.lastActivityAt)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => mutateFeedback(selectedItem.id, { assignedProfileId: '__me__' as unknown as string }, 'Item atribuído a você.')}>
                Atribuir para mim
              </Button>
              <Button variant="secondary" onClick={() => mutateFeedback(selectedItem.id, { status: 'triaged' }, 'Item triado.')}>
                Triar
              </Button>
              <Button variant="secondary" onClick={() => mutateFeedback(selectedItem.id, { status: 'in_progress' }, 'Item em progresso.')}>
                Iniciar
              </Button>
              <Button variant="secondary" onClick={() => mutateFeedback(selectedItem.id, { status: 'resolved' }, 'Item resolvido.')}>
                Resolver
              </Button>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Histórico interno</h3>
              <div className="space-y-3">
                {selectedItem.comments.map((comment) => (
                  <div key={comment.id} className="rounded-xl p-3" style={{ background: 'var(--bb-depth-2)' }}>
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{comment.authorName}</p>
                      <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--bb-ink-70)' }}>{comment.body}</p>
                  </div>
                ))}
                {selectedItem.comments.length === 0 && (
                  <div className="rounded-xl p-3" style={{ background: 'var(--bb-depth-2)' }}>
                    <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Sem comentários internos ainda.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Registrar nota interna"
                className="min-h-28 w-full rounded-xl p-4 text-sm outline-none"
                style={{ ...CARD_STYLE, color: 'var(--bb-ink-100)', background: 'var(--bb-depth-2)' }}
              />
              <div className="flex justify-end">
                <Button onClick={() => addComment(selectedItem.id)}>Registrar nota</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
