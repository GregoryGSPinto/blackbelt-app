'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Radio, AlertTriangle, Zap, Smartphone, Ticket, BarChart3,
  Copy, Check, Send, Monitor, Tablet, Wifi, WifiOff,
  RefreshCw, ChevronRight,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  getActiveSessions,
  getSessionDetail,
  getRecentErrors,
  getErrorsByPage,
  getErrorTrend,
  getPerformanceOverview,
  getPerformanceByPage,
  getPerformanceByDevice,
  getPerformanceTrend,
  getDeviceBreakdown,
  getOSBreakdown,
  getBrowserBreakdown,
  getDeviceModels,
  getConnectionBreakdown,
  getTickets,
  getTicketMetrics,
  updateTicketStatus,
  addTicketMessage,
  getEngagementOverview,
  getPagePopularity,
  getFeatureUsage,
  getPeakHours,
  getRetention,
  getTopUsers,
  type ActiveSession,
  type SessionDetail,
  type ErrorSummary,
  type PageErrorInfo,
  type ErrorTrendPoint,
  type PerformanceOverview,
  type PagePerformance,
  type DevicePerformance,
  type PerformanceTrendPoint,
  type DeviceBreakdownItem,
  type BreakdownItem,
  type DeviceModelInfo,
  type ConnectionInfo,
  type SupportTicket,
  type TicketMetrics,
  type EngagementOverview,
  type PagePopularityItem,
  type FeatureUsageItem,
  type PeakHourItem,
  type RetentionItem,
  type TopUser,
} from '@/lib/api/suporte.service';

/* ---------- Recharts dynamic imports (ssr: false) ---------- */
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((m) => m.Area), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const LineChart = dynamic(() => import('recharts').then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((m) => m.Line), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then((m) => m.Legend), { ssr: false });

/* ---------- Constants ---------- */
type TabKey = 'ao_vivo' | 'erros' | 'performance' | 'dispositivos' | 'tickets' | 'engajamento';

const TABS: { key: TabKey; label: string; icon: typeof Radio }[] = [
  { key: 'ao_vivo', label: 'Ao Vivo', icon: Radio },
  { key: 'erros', label: 'Erros', icon: AlertTriangle },
  { key: 'performance', label: 'Performance', icon: Zap },
  { key: 'dispositivos', label: 'Dispositivos', icon: Smartphone },
  { key: 'tickets', label: 'Tickets', icon: Ticket },
  { key: 'engajamento', label: 'Engajamento', icon: BarChart3 },
];

const tooltipStyle: React.CSSProperties = {
  backgroundColor: 'var(--bb-depth-4)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: '8px',
  color: 'var(--bb-ink-100)',
  fontSize: '12px',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--bb-depth-3)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-lg)',
};

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono, monospace)',
  textTransform: 'uppercase' as const,
  fontSize: '11px',
  letterSpacing: '0.08em',
  color: 'var(--bb-ink-40)',
};

const DEVICE_COLORS: Record<string, string> = { mobile: '#3b82f6', desktop: '#10b981', tablet: '#f59e0b' };
const DEVICE_LABELS: Record<string, string> = { mobile: 'Mobile', desktop: 'Desktop', tablet: 'Tablet' };
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const PRIORITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'Critico' },
  high: { bg: 'rgba(249,115,22,0.15)', text: '#f97316', label: 'Alto' },
  medium: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'Medio' },
  low: { bg: 'rgba(16,185,129,0.15)', text: '#10b981', label: 'Baixo' },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  open: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Aberto' },
  in_progress: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'Em Progresso' },
  resolved: { bg: 'rgba(16,185,129,0.15)', text: '#10b981', label: 'Resolvido' },
  closed: { bg: 'rgba(107,114,128,0.15)', text: '#6b7280', label: 'Fechado' },
};

const CATEGORY_LABELS: Record<string, string> = {
  bug: 'Bug',
  question: 'Duvida',
  feature_request: 'Feature',
  account: 'Conta',
  billing: 'Cobranca',
};

/* ---------- Helpers ---------- */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function durationFromStart(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h${remMins > 0 ? ` ${remMins}min` : ''}`;
}

function sessionStatus(session: ActiveSession): 'active' | 'idle' | 'error' {
  const diff = Date.now() - new Date(session.lastActivityAt).getTime();
  if (diff > 5 * 60000) return 'idle';
  return 'active';
}

function statusDotColor(status: 'active' | 'idle' | 'error'): string {
  if (status === 'active') return '#10b981';
  if (status === 'idle') return '#f59e0b';
  return '#ef4444';
}

function lcpStatus(val: number): string {
  if (val < 2.5) return 'good';
  if (val < 4) return 'needs-improvement';
  return 'poor';
}

function fcpStatus(val: number): string {
  if (val < 1.8) return 'good';
  if (val < 3) return 'needs-improvement';
  return 'poor';
}

function clsStatus(val: number): string {
  if (val < 0.1) return 'good';
  if (val < 0.25) return 'needs-improvement';
  return 'poor';
}

function fidStatus(val: number): string {
  if (val < 100) return 'good';
  if (val < 300) return 'needs-improvement';
  return 'poor';
}

function vitalColor(status: string): string {
  if (status === 'good') return '#10b981';
  if (status === 'needs-improvement') return '#f59e0b';
  return '#ef4444';
}

function vitalLabel(status: string): string {
  if (status === 'good') return 'Bom';
  if (status === 'needs-improvement') return 'Melhorar';
  return 'Ruim';
}

/* ---------- Skeleton ---------- */
function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton variant="text" className="h-8 w-56" />
      <div className="flex gap-2 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} variant="text" className="h-10 w-28 shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="card" className="h-24" />
        ))}
      </div>
      <Skeleton variant="card" className="h-72" />
      <Skeleton variant="card" className="h-64" />
    </div>
  );
}

/* ================================================================== */
/* MAIN PAGE                                                          */
/* ================================================================== */
export default function SuportePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('ao_vivo');

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Suporte & Monitoramento
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Painel god-mode de suporte, erros, performance e engajamento
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                background: isActive ? 'var(--bb-brand-surface)' : 'transparent',
                color: isActive ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                borderBottom: isActive ? '2px solid var(--bb-brand)' : '2px solid transparent',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'ao_vivo' && <TabAoVivo />}
      {activeTab === 'erros' && <TabErros />}
      {activeTab === 'performance' && <TabPerformance />}
      {activeTab === 'dispositivos' && <TabDispositivos />}
      {activeTab === 'tickets' && <TabTickets />}
      {activeTab === 'engajamento' && <TabEngajamento />}
    </div>
  );
}

/* ================================================================== */
/* TAB 1: AO VIVO                                                     */
/* ================================================================== */
function TabAoVivo() {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      const data = await getActiveSessions();
      setSessions(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    intervalRef.current = setInterval(loadSessions, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadSessions]);

  const handleRowClick = useCallback(async (session: ActiveSession) => {
    setModalOpen(true);
    setDetailLoading(true);
    try {
      const detail = await getSessionDetail(session.id);
      setSelectedSession(detail);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  if (loading) return <PageSkeleton />;

  const uniqueAcademies = new Set(sessions.map((s) => s.academyId)).size;
  const totalPages = sessions.reduce((acc, s) => acc + s.pagesViewed, 0);
  const avgPagesPerMin = sessions.length > 0 ? Math.round(totalPages / Math.max(sessions.length, 1)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
        </span>
        <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          {sessions.length} usuarios online agora
        </span>
        <button
          type="button"
          onClick={loadSessions}
          className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors hover:opacity-80"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          <RefreshCw size={12} />
          Atualizar
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Online Agora', value: sessions.length, color: '#10b981' },
          { label: 'Academias Ativas', value: uniqueAcademies, color: '#3b82f6' },
          { label: 'Paginas/min', value: avgPagesPerMin, color: '#f59e0b' },
          { label: 'Erros/hora', value: sessions.filter((s) => sessionStatus(s) === 'error').length, color: '#ef4444' },
        ].map((card) => (
          <div key={card.label} className="rounded-xl p-4" style={cardStyle}>
            <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>{card.label}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Sessions Table */}
      <div>
        <p style={sectionLabel} className="mb-3">Sessoes Ativas</p>
        <div className="overflow-x-auto rounded-xl" style={cardStyle}>
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                {['', 'Usuario', 'Academia', 'Role', 'Dispositivo', 'Pagina Atual', 'Tempo', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium"
                    style={{ color: 'var(--bb-ink-40)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const status = sessionStatus(s);
                return (
                  <tr
                    key={s.id}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                    onClick={() => handleRowClick(s)}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bb-depth-2)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: statusDotColor(status) }}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--bb-ink-100)' }}>{s.userName}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>{s.academyName}</td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}
                      >
                        {s.userRole}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>
                      <span className="flex items-center gap-1">
                        {s.deviceType === 'mobile' ? <Smartphone size={12} /> : s.deviceType === 'tablet' ? <Tablet size={12} /> : <Monitor size={12} />}
                        {s.deviceModel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--bb-ink-60)' }}>{s.currentPage}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--bb-ink-40)' }}>{durationFromStart(s.startedAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          background: status === 'active' ? 'rgba(16,185,129,0.15)' : status === 'idle' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                          color: statusDotColor(status),
                        }}
                      >
                        {status === 'active' ? 'Ativo' : status === 'idle' ? 'Inativo' : 'Erro'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                    Nenhuma sessao ativa no momento
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Detail Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Detalhes da Sessao">
        {detailLoading ? (
          <div className="space-y-4">
            <Skeleton variant="text" className="h-4 w-48" />
            <Skeleton variant="card" className="h-32" />
            <Skeleton variant="card" className="h-48" />
          </div>
        ) : selectedSession ? (
          <div className="space-y-5">
            {/* User Info */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Usuario', value: selectedSession.userName },
                { label: 'Role', value: selectedSession.userRole },
                { label: 'Academia', value: selectedSession.academyName },
                { label: 'Dispositivo', value: `${selectedSession.deviceModel} (${selectedSession.deviceType})` },
                { label: 'OS / Browser', value: `${selectedSession.os} / ${selectedSession.browser}` },
                { label: 'Resolucao', value: selectedSession.screenResolution },
                { label: 'Conexao', value: selectedSession.connectionType },
                { label: 'IP / Cidade', value: `${selectedSession.ip} - ${selectedSession.city}` },
                { label: 'Inicio', value: formatDate(selectedSession.startedAt) },
                { label: 'Paginas', value: String(selectedSession.pagesViewed) },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>{item.label}</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-100)' }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Performance Metrics */}
            <div>
              <p style={sectionLabel} className="mb-2">Performance</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'LCP', value: `${selectedSession.performanceMetrics.avgLCP.toFixed(1)}s` },
                  { label: 'FCP', value: `${selectedSession.performanceMetrics.avgFCP.toFixed(1)}s` },
                  { label: 'CLS', value: selectedSession.performanceMetrics.avgCLS.toFixed(3) },
                  { label: 'TTFB', value: `${selectedSession.performanceMetrics.avgTTFB.toFixed(0)}ms` },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg p-2 text-center" style={{ background: 'var(--bb-depth-2)' }}>
                    <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>{m.label}</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Page History Timeline */}
            <div>
              <p style={sectionLabel} className="mb-2">Timeline de Paginas</p>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {selectedSession.pageHistory.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-md px-3 py-1.5 text-xs"
                    style={{ background: 'var(--bb-depth-2)' }}
                  >
                    <span className="shrink-0 font-mono text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                      {new Date(p.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <ChevronRight size={10} style={{ color: 'var(--bb-ink-40)' }} />
                    <span className="font-mono" style={{ color: 'var(--bb-ink-100)' }}>{p.path}</span>
                    <span className="ml-auto text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>{p.loadTimeMs}ms</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Errors */}
            {selectedSession.errors.length > 0 && (
              <div>
                <p style={sectionLabel} className="mb-2">Erros na Sessao</p>
                <div className="space-y-1">
                  {selectedSession.errors.map((err) => (
                    <div
                      key={err.id}
                      className="flex items-start gap-2 rounded-md px-3 py-2 text-xs"
                      style={{
                        background: err.severity === 'critical' ? 'rgba(239,68,68,0.08)' : 'var(--bb-depth-2)',
                        border: err.severity === 'critical' ? '1px solid rgba(239,68,68,0.2)' : 'none',
                      }}
                    >
                      <span
                        className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ background: err.severity === 'critical' ? '#ef4444' : err.severity === 'error' ? '#f59e0b' : '#6b7280' }}
                      />
                      <div className="min-w-0 flex-1">
                        <p style={{ color: 'var(--bb-ink-100)' }}>{err.message}</p>
                        <p className="mt-0.5" style={{ color: 'var(--bb-ink-40)' }}>
                          {err.page} - {timeAgo(err.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

/* ================================================================== */
/* TAB 2: ERROS                                                       */
/* ================================================================== */
function TabErros() {
  const [errorSummary, setErrorSummary] = useState<ErrorSummary | null>(null);
  const [errorsByPage, setErrorsByPage] = useState<PageErrorInfo[]>([]);
  const [errorTrend, setErrorTrend] = useState<ErrorTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<{ message: string; stack: string; page: string; severity: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [summary, byPage, trend] = await Promise.all([
          getRecentErrors(),
          getErrorsByPage(),
          getErrorTrend(),
        ]);
        if (!cancelled) {
          setErrorSummary(summary);
          setErrorsByPage(byPage);
          setErrorTrend(trend);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleCopyStack = useCallback((stack: string) => {
    navigator.clipboard.writeText(stack);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (loading || !errorSummary) return <PageSkeleton />;

  const allErrors = [
    ...errorSummary.jsErrors.map((e) => ({ ...e, tipo: 'JS' as const, stack: e.stack })),
    ...errorSummary.apiErrors.map((e) => ({
      id: e.id,
      severity: 'error' as const,
      message: `${e.method} ${e.endpoint} - ${e.message}`,
      stack: `Status: ${e.statusCode}\nEndpoint: ${e.method} ${e.endpoint}\nAvg Response: ${e.avgResponseTimeMs}ms\nType: ${e.type}`,
      page: e.endpoint,
      count: e.count,
      firstSeen: e.firstSeen,
      lastSeen: e.lastSeen,
      affectedUsers: e.affectedUsers,
      affectedSessions: 0,
      browser: '',
      os: '',
      resolved: false,
      tipo: 'API' as const,
    })),
  ].sort((a, b) => {
    const severityOrder = { critical: 0, error: 1, warning: 2 };
    return (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2);
  });

  const criticalErrors = allErrors.filter((e) => e.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          {errorSummary.errorsLast24h} erros nas ultimas 24h
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'JS Errors', value: errorSummary.jsErrors.length, color: '#ef4444' },
          { label: 'API Errors', value: errorSummary.totalApiErrors, color: '#f59e0b' },
          { label: 'Network Errors', value: errorSummary.apiErrors.filter((e) => e.type === 'timeout').length, color: '#3b82f6' },
          { label: 'Criticos', value: errorSummary.totalCritical, color: '#ef4444' },
        ].map((card) => (
          <div key={card.label} className="rounded-xl p-4" style={cardStyle}>
            <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>{card.label}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Critical Errors Section */}
      {criticalErrors.length > 0 && (
        <div>
          <p style={sectionLabel} className="mb-3">Erros Criticos</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {criticalErrors.map((err) => (
              <div
                key={err.id}
                className="cursor-pointer rounded-xl p-4 transition-opacity hover:opacity-90"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 'var(--bb-radius-lg)',
                }}
                onClick={() => setSelectedError({ message: err.message, stack: err.stack, page: err.page, severity: err.severity })}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: '#ef4444' }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: '#ef4444' }}>{err.message}</p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {err.page} - {err.count}x - {err.affectedUsers} usuarios - {timeAgo(err.lastSeen)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Table */}
      <div>
        <p style={sectionLabel} className="mb-3">Todos os Erros</p>
        <div className="overflow-x-auto rounded-xl" style={cardStyle}>
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                {['Severidade', 'Tipo', 'Mensagem', 'Pagina', 'Ocorrencias', 'Usuarios', 'Ultimo'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allErrors.map((err) => (
                <tr
                  key={err.id}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                  onClick={() => setSelectedError({ message: err.message, stack: err.stack, page: err.page, severity: err.severity })}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bb-depth-2)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: err.severity === 'critical' ? 'rgba(239,68,68,0.15)' : err.severity === 'error' ? 'rgba(245,158,11,0.15)' : 'rgba(107,114,128,0.15)',
                        color: err.severity === 'critical' ? '#ef4444' : err.severity === 'error' ? '#f59e0b' : '#6b7280',
                      }}
                    >
                      {err.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>{err.tipo}</td>
                  <td className="max-w-[250px] truncate px-4 py-3 font-medium" style={{ color: 'var(--bb-ink-100)' }}>{err.message}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--bb-ink-60)' }}>{err.page}</td>
                  <td className="px-4 py-3 font-mono" style={{ color: 'var(--bb-ink-100)' }}>{err.count}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>{err.affectedUsers}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--bb-ink-40)' }}>{timeAgo(err.lastSeen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Trend Chart */}
      <div>
        <p style={sectionLabel} className="mb-3">Tendencia de Erros (24h)</p>
        <div className="rounded-xl p-5" style={cardStyle}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={errorTrend}>
                <defs>
                  <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="errorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: 'var(--bb-ink-40)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--bb-ink-40)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} fill="url(#criticalGrad)" name="Critico" />
                <Area type="monotone" dataKey="error" stroke="#f59e0b" strokeWidth={2} fill="url(#errorGrad)" name="Erro" />
                <Area type="monotone" dataKey="warning" stroke="#6b7280" strokeWidth={1} fill="transparent" name="Warning" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Errors By Page Chart */}
      <div>
        <p style={sectionLabel} className="mb-3">Erros por Pagina</p>
        <div className="rounded-xl p-5" style={cardStyle}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...errorsByPage].sort((a, b) => a.totalErrors - b.totalErrors)}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--bb-ink-40)' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="page"
                  tick={{ fontSize: 10, fill: 'var(--bb-ink-60)' }}
                  axisLine={false}
                  tickLine={false}
                  width={120}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="jsErrors" stackId="a" fill="#ef4444" name="JS Errors" radius={[0, 0, 0, 0]} />
                <Bar dataKey="apiErrors" stackId="a" fill="#f59e0b" name="API Errors" radius={[0, 4, 4, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Error Detail Modal */}
      <Modal open={!!selectedError} onClose={() => setSelectedError(null)} title="Detalhes do Erro">
        {selectedError && (
          <div className="space-y-4">
            <div>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background: selectedError.severity === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                  color: selectedError.severity === 'critical' ? '#ef4444' : '#f59e0b',
                }}
              >
                {selectedError.severity}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Mensagem</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-100)' }}>{selectedError.message}</p>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Pagina</p>
              <p className="mt-1 font-mono text-xs" style={{ color: 'var(--bb-ink-60)' }}>{selectedError.page}</p>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Stack Trace</p>
                <button
                  type="button"
                  onClick={() => handleCopyStack(selectedError.stack)}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors hover:opacity-80"
                  style={{ color: 'var(--bb-ink-60)' }}
                >
                  {copied ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <pre
                className="max-h-48 overflow-auto rounded-lg p-3 font-mono text-xs leading-relaxed"
                style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-60)', border: '1px solid var(--bb-glass-border)' }}
              >
                {selectedError.stack}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ================================================================== */
/* TAB 3: PERFORMANCE                                                 */
/* ================================================================== */
function TabPerformance() {
  const [overview, setOverview] = useState<PerformanceOverview | null>(null);
  const [byPage, setByPage] = useState<PagePerformance[]>([]);
  const [byDevice, setByDevice] = useState<DevicePerformance[]>([]);
  const [trend, setTrend] = useState<PerformanceTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ov, pg, dv, tr] = await Promise.all([
          getPerformanceOverview(),
          getPerformanceByPage(),
          getPerformanceByDevice(),
          getPerformanceTrend(),
        ]);
        if (!cancelled) {
          setOverview(ov);
          setByPage(pg);
          setByDevice(dv);
          setTrend(tr);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading || !overview) return <PageSkeleton />;

  const vitals = [
    {
      label: 'LCP',
      avg: overview.avgLCP,
      p95: overview.p95LCP,
      unit: 's',
      status: lcpStatus(overview.avgLCP),
      desc: 'Largest Contentful Paint',
    },
    {
      label: 'FCP',
      avg: overview.avgFCP,
      p95: overview.p95FCP,
      unit: 's',
      status: fcpStatus(overview.avgFCP),
      desc: 'First Contentful Paint',
    },
    {
      label: 'CLS',
      avg: overview.avgCLS,
      p95: overview.p95CLS,
      unit: '',
      status: clsStatus(overview.avgCLS),
      desc: 'Cumulative Layout Shift',
    },
    {
      label: 'FID',
      avg: overview.avgFID,
      p95: 0,
      unit: 'ms',
      status: fidStatus(overview.avgFID),
      desc: 'First Input Delay',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Zap size={18} style={{ color: '#f59e0b' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          Performance da Plataforma
        </span>
        <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
          {overview.totalPageLoads.toLocaleString()} carregamentos
        </span>
      </div>

      {/* Core Web Vitals Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {vitals.map((v) => {
          const color = vitalColor(v.status);
          return (
            <div key={v.label} className="rounded-xl p-4" style={cardStyle}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>{v.label}</p>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: `${color}20`, color }}
                >
                  {vitalLabel(v.status)}
                </span>
              </div>
              <p className="mt-1 text-2xl font-bold" style={{ color }}>
                {v.label === 'CLS' ? v.avg.toFixed(3) : v.avg.toFixed(1)}{v.unit}
              </p>
              {v.p95 > 0 && (
                <p className="mt-0.5 text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                  p95: {v.label === 'CLS' ? v.p95.toFixed(3) : v.p95.toFixed(1)}{v.unit}
                </p>
              )}
              <p className="mt-1 text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>{v.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Slowest Pages Chart */}
      <div>
        <p style={sectionLabel} className="mb-3">Paginas Mais Lentas</p>
        <div className="rounded-xl p-5" style={cardStyle}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...byPage].sort((a, b) => a.avgLCP - b.avgLCP)}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--bb-ink-40)' }} axisLine={false} tickLine={false} unit="s" />
                <YAxis
                  type="category"
                  dataKey="page"
                  tick={{ fontSize: 10, fill: 'var(--bb-ink-60)' }}
                  axisLine={false}
                  tickLine={false}
                  width={120}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(2)}s`, 'LCP']} />
                <Bar dataKey="avgLCP" fill="#ef4444" name="Avg LCP" radius={[0, 4, 4, 0]}>
                  {[...byPage].sort((a, b) => a.avgLCP - b.avgLCP).map((entry, idx) => (
                    <Cell key={idx} fill={vitalColor(lcpStatus(entry.avgLCP))} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance by Device Table */}
      <div>
        <p style={sectionLabel} className="mb-3">Performance por Dispositivo</p>
        <div className="overflow-x-auto rounded-xl" style={cardStyle}>
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                {['Dispositivo', 'Usuarios', 'Avg LCP', 'Avg FCP', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byDevice.map((d) => {
                const status = lcpStatus(d.avgLCP);
                const color = vitalColor(status);
                return (
                  <tr
                    key={d.deviceType}
                    style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bb-depth-2)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                      <span className="flex items-center gap-2">
                        {d.deviceType === 'mobile' ? <Smartphone size={14} /> : d.deviceType === 'tablet' ? <Tablet size={14} /> : <Monitor size={14} />}
                        {DEVICE_LABELS[d.deviceType] ?? d.deviceType}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>{d.sampleSize}</td>
                    <td className="px-4 py-3 font-mono" style={{ color }}>{d.avgLCP.toFixed(2)}s</td>
                    <td className="px-4 py-3 font-mono" style={{ color: vitalColor(fcpStatus(d.avgFCP)) }}>{d.avgFCP.toFixed(2)}s</td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: `${color}20`, color }}
                      >
                        {vitalLabel(status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7-Day LCP/FCP Trend */}
      <div>
        <p style={sectionLabel} className="mb-3">Tendencia 7 Dias (LCP / FCP)</p>
        <div className="rounded-xl p-5" style={cardStyle}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'var(--bb-ink-40)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 10, fill: 'var(--bb-ink-40)' }} axisLine={false} tickLine={false} unit="s" />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${Number(value).toFixed(2)}s`} />
                <Line type="monotone" dataKey="avgLCP" stroke="#ef4444" strokeWidth={2} dot={false} name="LCP" />
                <Line type="monotone" dataKey="avgFCP" stroke="#3b82f6" strokeWidth={2} dot={false} name="FCP" />
                <Line type="monotone" dataKey="p75LCP" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 4" dot={false} name="p75 LCP" />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* TAB 4: DISPOSITIVOS                                                */
/* ================================================================== */
function TabDispositivos() {
  const [deviceBreakdown, setDeviceBreakdown] = useState<DeviceBreakdownItem[]>([]);
  const [osBreakdown, setOsBreakdown] = useState<BreakdownItem[]>([]);
  const [browserBreakdown, setBrowserBreakdown] = useState<BreakdownItem[]>([]);
  const [deviceModels, setDeviceModels] = useState<DeviceModelInfo[]>([]);
  const [connectionBreakdown, setConnectionBreakdown] = useState<ConnectionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [devices, os, browser, models, conn] = await Promise.all([
          getDeviceBreakdown(),
          getOSBreakdown(),
          getBrowserBreakdown(),
          getDeviceModels(),
          getConnectionBreakdown(),
        ]);
        if (!cancelled) {
          setDeviceBreakdown(devices);
          setOsBreakdown(os);
          setBrowserBreakdown(browser);
          setDeviceModels(models);
          setConnectionBreakdown(conn);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <PageSkeleton />;

  const totalDevices = deviceBreakdown.reduce((acc, d) => acc + d.count, 0);
  const pwaDevices = deviceModels.filter((m) => m.type === 'mobile').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Smartphone size={18} style={{ color: '#3b82f6' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          Dispositivos da Plataforma
        </span>
        <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
          {totalDevices.toLocaleString()} dispositivos
        </span>
      </div>

      {/* Device Type + OS + Browser PieCharts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Device Type Pie */}
        <div className="rounded-xl p-5" style={cardStyle}>
          <p style={sectionLabel} className="mb-3">Tipo de Dispositivo</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceBreakdown.map((d) => ({ name: DEVICE_LABELS[d.type] ?? d.type, value: d.percentage, count: d.count }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  label={(entry) => `${(entry as { name?: string }).name ?? ''} ${Number((entry as { value?: number }).value ?? 0).toFixed(0)}%`}
                >
                  {deviceBreakdown.map((d, idx) => (
                    <Cell key={idx} fill={DEVICE_COLORS[d.type] ?? PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${Number(value).toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* OS Pie */}
        <div className="rounded-xl p-5" style={cardStyle}>
          <p style={sectionLabel} className="mb-3">Sistema Operacional</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={osBreakdown.map((d) => ({ name: d.label, value: d.percentage, count: d.count }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  label={(entry) => `${(entry as { name?: string }).name ?? ''} ${Number((entry as { value?: number }).value ?? 0).toFixed(0)}%`}
                >
                  {osBreakdown.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${Number(value).toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Browser Pie */}
        <div className="rounded-xl p-5" style={cardStyle}>
          <p style={sectionLabel} className="mb-3">Navegador</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={browserBreakdown.map((d) => ({ name: d.label, value: d.percentage, count: d.count }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  label={(entry) => `${(entry as { name?: string }).name ?? ''} ${Number((entry as { value?: number }).value ?? 0).toFixed(0)}%`}
                >
                  {browserBreakdown.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${Number(value).toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Device Models Table */}
      <div>
        <p style={sectionLabel} className="mb-3">Top Modelos de Dispositivo</p>
        <div className="overflow-x-auto rounded-xl" style={cardStyle}>
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                {['Modelo', 'OS', 'Usuarios', '% Total', 'Avg LCP', 'Avg FCP', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deviceModels.map((m) => {
                const status = lcpStatus(m.avgLCP);
                const color = vitalColor(status);
                return (
                  <tr
                    key={m.model}
                    style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bb-depth-2)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                      <span className="flex items-center gap-2">
                        {m.type === 'mobile' ? <Smartphone size={14} /> : m.type === 'tablet' ? <Tablet size={14} /> : <Monitor size={14} />}
                        {m.model}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>{m.os}</td>
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--bb-ink-100)' }}>{m.count}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>{m.percentage.toFixed(1)}%</td>
                    <td className="px-4 py-3 font-mono" style={{ color }}>{m.avgLCP.toFixed(2)}s</td>
                    <td className="px-4 py-3 font-mono" style={{ color: vitalColor(fcpStatus(m.avgFCP)) }}>{m.avgFCP.toFixed(2)}s</td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: `${color}20`, color }}
                      >
                        {vitalLabel(status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Connection Type Cards */}
      <div>
        <p style={sectionLabel} className="mb-3">Tipo de Conexao</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {connectionBreakdown.map((c) => (
            <div key={c.type} className="rounded-xl p-4" style={cardStyle}>
              <div className="flex items-center gap-2">
                {c.type === 'offline' ? <WifiOff size={14} style={{ color: '#ef4444' }} /> : <Wifi size={14} style={{ color: '#3b82f6' }} />}
                <p className="text-xs font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{c.type}</p>
              </div>
              <p className="mt-1 text-lg font-bold" style={{ color: '#3b82f6' }}>{c.percentage.toFixed(1)}%</p>
              <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>{c.count} usuarios</p>
              <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                Latencia: {c.avgLatencyMs.toFixed(0)}ms | LCP: {c.avgLCP.toFixed(2)}s
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* PWA Insight Card */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--bb-radius-lg)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#3b82f6' }}>
          PWA Insight
        </p>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-100)' }}>
          {deviceBreakdown.find((d) => d.type === 'mobile')?.percentage.toFixed(0) ?? 0}% dos usuarios acessam via mobile.{' '}
          {pwaDevices} modelos de dispositivos moveis identificados.{' '}
          A experiencia PWA deve ser prioridade para otimizacao de performance e engajamento.
        </p>
        <div className="mt-3 flex gap-4">
          {deviceBreakdown.map((d) => (
            <div key={d.type} className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: DEVICE_COLORS[d.type] ?? '#6b7280' }} />
              <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                {DEVICE_LABELS[d.type] ?? d.type}: {d.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* TAB 5: TICKETS                                                     */
/* ================================================================== */
function TabTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [metrics, setMetrics] = useState<TicketMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [t, m] = await Promise.all([getTickets(), getTicketMetrics()]);
      setTickets(t);
      setMetrics(m);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    const updated = await updateTicketStatus(id, newStatus);
    setSelectedTicket(updated);
    setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const handleSendReply = useCallback(async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setSending(true);
    try {
      const updated = await addTicketMessage(selectedTicket.id, 'support', replyText.trim());
      setSelectedTicket(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setReplyText('');
    } finally {
      setSending(false);
    }
  }, [selectedTicket, replyText]);

  if (loading || !metrics) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Ticket size={18} style={{ color: '#8b5cf6' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          Central de Tickets
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: 'Abertos', value: metrics.totalOpen, color: '#3b82f6' },
          { label: 'Em Progresso', value: metrics.totalInProgress, color: '#f59e0b' },
          { label: 'Aguardando', value: metrics.ticketsLast24h, color: '#8b5cf6' },
          { label: 'Resolvidos (mes)', value: metrics.totalResolved, color: '#10b981' },
          { label: 'Tempo Medio', value: `${metrics.avgResolutionTimeHours.toFixed(0)}h`, color: 'var(--bb-ink-100)' },
        ].map((card) => (
          <div key={card.label} className="rounded-xl p-4" style={cardStyle}>
            <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>{card.label}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tickets Table */}
      <div>
        <p style={sectionLabel} className="mb-3">Todos os Tickets</p>
        <div className="overflow-x-auto rounded-xl" style={cardStyle}>
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                {['ID', 'Assunto', 'Usuario', 'Academia', 'Categoria', 'Prioridade', 'Status', 'Aberto ha'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => {
                const pStyle = PRIORITY_STYLES[t.priority] ?? PRIORITY_STYLES.low;
                const sStyle = STATUS_STYLES[t.status] ?? STATUS_STYLES.open;
                return (
                  <tr
                    key={t.id}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                    onClick={() => setSelectedTicket(t)}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bb-depth-2)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--bb-ink-40)' }}>#{t.id.slice(0, 6)}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-medium" style={{ color: 'var(--bb-ink-100)' }}>{t.subject}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>{t.createdBy.userName}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>{t.academyName}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        {CATEGORY_LABELS[t.category] ?? t.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: pStyle.bg, color: pStyle.text }}
                      >
                        {pStyle.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: sStyle.bg, color: sStyle.text }}
                      >
                        {sStyle.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--bb-ink-40)' }}>{timeAgo(t.createdAt)}</td>
                  </tr>
                );
              })}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                    Nenhum ticket encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      <Modal open={!!selectedTicket} onClose={() => { setSelectedTicket(null); setReplyText(''); }} title={selectedTicket?.subject ?? 'Ticket'}>
        {selectedTicket && (
          <div className="space-y-5">
            {/* Ticket Info */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'ID', value: `#${selectedTicket.id.slice(0, 8)}` },
                { label: 'Usuario', value: selectedTicket.createdBy.userName },
                { label: 'Role', value: selectedTicket.createdBy.userRole },
                { label: 'Academia', value: selectedTicket.academyName },
                { label: 'Categoria', value: CATEGORY_LABELS[selectedTicket.category] ?? selectedTicket.category },
                { label: 'Criado em', value: formatDate(selectedTicket.createdAt) },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>{item.label}</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-100)' }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <p className="text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>Descricao</p>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-100)' }}>{selectedTicket.description}</p>
            </div>

            {/* Status + Priority Controls */}
            <div className="flex flex-wrap gap-3">
              <div>
                <p className="mb-1 text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>Status</p>
                <div className="flex gap-1">
                  {(['open', 'in_progress', 'resolved', 'closed'] as const).map((s) => {
                    const st = STATUS_STYLES[s];
                    const isActive = selectedTicket.status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleStatusChange(selectedTicket.id, s)}
                        className="rounded-md px-2.5 py-1 text-[10px] font-semibold transition-all"
                        style={{
                          background: isActive ? st.bg : 'transparent',
                          color: isActive ? st.text : 'var(--bb-ink-40)',
                          border: isActive ? `1px solid ${st.text}40` : '1px solid var(--bb-glass-border)',
                        }}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>Prioridade</p>
                <div className="flex gap-1">
                  {(['critical', 'high', 'medium', 'low'] as const).map((p) => {
                    const ps = PRIORITY_STYLES[p];
                    const isActive = selectedTicket.priority === p;
                    return (
                      <span
                        key={p}
                        className="rounded-md px-2.5 py-1 text-[10px] font-semibold"
                        style={{
                          background: isActive ? ps.bg : 'transparent',
                          color: isActive ? ps.text : 'var(--bb-ink-40)',
                          border: isActive ? `1px solid ${ps.text}40` : '1px solid var(--bb-glass-border)',
                        }}
                      >
                        {ps.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div>
              <p style={sectionLabel} className="mb-2">Conversa</p>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {selectedTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg px-3 py-2"
                    style={{
                      background: msg.from === 'support' ? 'rgba(59,130,246,0.08)' : msg.from === 'system' ? 'rgba(107,114,128,0.08)' : 'var(--bb-depth-2)',
                      borderLeft: msg.from === 'support' ? '3px solid #3b82f6' : msg.from === 'system' ? '3px solid #6b7280' : '3px solid var(--bb-glass-border)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold" style={{ color: msg.from === 'support' ? '#3b82f6' : msg.from === 'system' ? '#6b7280' : 'var(--bb-ink-60)' }}>
                        {msg.userName}
                        <span className="ml-1 font-normal" style={{ color: 'var(--bb-ink-40)' }}>
                          ({msg.from === 'support' ? 'Suporte' : msg.from === 'system' ? 'Sistema' : 'Usuario'})
                        </span>
                      </p>
                      <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>{timeAgo(msg.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--bb-ink-100)' }}>{msg.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                placeholder="Responder ao ticket..."
                className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  color: 'var(--bb-ink-100)',
                }}
              />
              <button
                type="button"
                onClick={handleSendReply}
                disabled={!replyText.trim() || sending}
                className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: '#3b82f6' }}
              >
                <Send size={14} />
                Enviar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ================================================================== */
/* TAB 6: ENGAJAMENTO                                                 */
/* ================================================================== */
function TabEngajamento() {
  const [overview, setOverview] = useState<EngagementOverview | null>(null);
  const [pagePopularity, setPagePopularity] = useState<PagePopularityItem[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsageItem[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHourItem[]>([]);
  const [retention, setRetention] = useState<RetentionItem[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ov, pages, features, hours, ret, users] = await Promise.all([
          getEngagementOverview(),
          getPagePopularity(),
          getFeatureUsage(),
          getPeakHours(),
          getRetention(),
          getTopUsers(),
        ]);
        if (!cancelled) {
          setOverview(ov);
          setPagePopularity(pages);
          setFeatureUsage(features);
          setPeakHours(hours);
          setRetention(ret);
          setTopUsers(users);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading || !overview) return <PageSkeleton />;

  const peakData = peakHours.map((h) => ({
    ...h,
    label: `${String(h.hour).padStart(2, '0')}h`,
  }));

  const retentionDay1 = retention.find((r) => r.day === 1);
  const retentionDay7 = retention.find((r) => r.day === 7);
  const retentionDay30 = retention.find((r) => r.day === 30);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 size={18} style={{ color: '#8b5cf6' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          Engajamento da Plataforma
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: 'DAU', value: overview.dau.toLocaleString(), color: '#3b82f6' },
          { label: 'WAU', value: overview.wau.toLocaleString(), color: '#8b5cf6' },
          { label: 'MAU', value: overview.mau.toLocaleString(), color: '#10b981' },
          { label: 'Sessao Media', value: `${overview.avgSessionDurationMinutes.toFixed(0)}min`, color: '#f59e0b' },
          { label: 'Paginas/sessao', value: overview.avgPagesPerSession.toFixed(1), color: '#ef4444' },
        ].map((card) => (
          <div key={card.label} className="rounded-xl p-4" style={cardStyle}>
            <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>{card.label}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Page Popularity + Feature Usage */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Page Popularity */}
        <div className="rounded-xl p-5" style={cardStyle}>
          <p style={sectionLabel} className="mb-3">Paginas Mais Populares</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...pagePopularity].sort((a, b) => a.views - b.views).slice(-10)}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--bb-ink-40)' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="page"
                  tick={{ fontSize: 9, fill: 'var(--bb-ink-60)' }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="views" fill="#3b82f6" name="Views" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Usage */}
        <div className="rounded-xl p-5" style={cardStyle}>
          <p style={sectionLabel} className="mb-3">Uso de Features</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...featureUsage].sort((a, b) => a.usageCount - b.usageCount).slice(-10)}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--bb-ink-40)' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="feature"
                  tick={{ fontSize: 9, fill: 'var(--bb-ink-60)' }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="usageCount" fill="#8b5cf6" name="Uso" radius={[0, 4, 4, 0]}>
                  {[...featureUsage].sort((a, b) => a.usageCount - b.usageCount).slice(-10).map((entry, idx) => {
                    const trendColor = entry.trend === 'up' ? '#10b981' : entry.trend === 'down' ? '#ef4444' : '#8b5cf6';
                    return <Cell key={idx} fill={trendColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Peak Hours Chart */}
      <div>
        <p style={sectionLabel} className="mb-3">Horarios de Pico</p>
        <div className="rounded-xl p-5" style={cardStyle}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={peakData}>
                <defs>
                  <linearGradient id="peakGradEng" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: 'var(--bb-ink-40)' }}
                  axisLine={false}
                  tickLine={false}
                  interval={1}
                />
                <YAxis tick={{ fontSize: 10, fill: 'var(--bb-ink-40)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="sessions" stroke="#8b5cf6" strokeWidth={2} fill="url(#peakGradEng)" name="Sessoes" />
                <Area type="monotone" dataKey="pageViews" stroke="#3b82f6" strokeWidth={1} fill="transparent" name="Page Views" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Retention Cards */}
      <div>
        <p style={sectionLabel} className="mb-3">Retencao</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: 'Day 1', data: retentionDay1 },
            { label: 'Day 7', data: retentionDay7 },
            { label: 'Day 30', data: retentionDay30 },
          ].map((r) => {
            const pct = r.data?.percentage ?? 0;
            const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
            return (
              <div key={r.label} className="rounded-xl p-5" style={cardStyle}>
                <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>{r.label}</p>
                <p className="mt-1 text-3xl font-bold" style={{ color }}>{pct.toFixed(1)}%</p>
                <p className="mt-1 text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                  {r.data?.users ?? 0} usuarios retidos
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-1)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 10 Users Table */}
      <div>
        <p style={sectionLabel} className="mb-3">Top 10 Usuarios Mais Ativos</p>
        <div className="overflow-x-auto rounded-xl" style={cardStyle}>
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                {['#', 'Usuario', 'Role', 'Academia', 'Sessoes', 'Tempo Total', 'Paginas', 'Ultimo Acesso'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topUsers.slice(0, 10).map((u, idx) => (
                <tr
                  key={u.userId}
                  style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bb-depth-2)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <td className="px-4 py-3">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{
                        background: idx < 3 ? 'rgba(245,158,11,0.15)' : 'var(--bb-depth-2)',
                        color: idx < 3 ? '#f59e0b' : 'var(--bb-ink-40)',
                      }}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--bb-ink-100)' }}>{u.userName}</td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}
                    >
                      {u.userRole}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>{u.academyName}</td>
                  <td className="px-4 py-3 font-mono" style={{ color: 'var(--bb-ink-100)' }}>{u.sessions}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>
                    {u.totalMinutes >= 60 ? `${Math.floor(u.totalMinutes / 60)}h ${u.totalMinutes % 60}min` : `${u.totalMinutes}min`}
                  </td>
                  <td className="px-4 py-3 font-mono" style={{ color: 'var(--bb-ink-60)' }}>{u.pagesViewed}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--bb-ink-40)' }}>{timeAgo(u.lastSeen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
