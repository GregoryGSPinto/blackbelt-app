'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { getProductAnalytics } from '@/lib/api/superadmin-analytics.service';
import type { ProductAnalytics, NuncaUsaram } from '@/lib/api/superadmin-analytics.service';
import type { PieLabelRenderProps } from 'recharts'; // eslint-disable-line @typescript-eslint/no-unused-vars

/* ---------- Recharts dynamic imports (ssr: false) ---------- */
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((m) => m.Area), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false });

/* ---------- Constants ---------- */
const AMBER = '#f59e0b';

const tooltipStyle: React.CSSProperties = {
  backgroundColor: 'var(--bb-depth-4)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: '8px',
  color: 'var(--bb-ink-100)',
  fontSize: '12px',
};

const CATEGORY_COLORS: Record<string, string> = {
  core: '#3b82f6',
  premium: '#22c55e',
  beta: '#f59e0b',
};

const CORE_FEATURES = new Set(['dashboard', 'turmas', 'financeiro', 'checkin_qr']);
const BETA_FEATURES = new Set(['ia_analise', 'periodizacao', 'contratos']);

function featureCategory(slug: string): string {
  if (CORE_FEATURES.has(slug)) return 'core';
  if (BETA_FEATURES.has(slug)) return 'beta';
  return 'premium';
}

const DEVICE_COLORS: Record<string, string> = {
  mobile: '#3b82f6',
  desktop: '#22c55e',
  tablet: '#f59e0b',
};

const DEVICE_LABELS: Record<string, string> = {
  mobile: 'Mobile',
  desktop: 'Desktop',
  tablet: 'Tablet',
};

/* ---------- Skeleton loader ---------- */
function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton variant="text" className="h-8 w-56" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="card" className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton variant="card" className="h-72" />
        <Skeleton variant="card" className="h-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="card" className="h-36" />
        ))}
      </div>
      <Skeleton variant="card" className="h-64" />
    </div>
  );
}

/* ================================================================== */
export default function AnalyticsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<ProductAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const analytics = await getProductAnalytics();
        if (!cancelled) setData(analytics);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* Feature ranking sorted desc by sessions, with category color */
  const featureChartData = useMemo(() => {
    if (!data) return [];
    return [...data.featureRanking]
      .sort((a, b) => a.sessoesMes - b.sessoesMes)
      .map((f) => ({
        ...f,
        category: featureCategory(f.slug),
        fill: CATEGORY_COLORS[featureCategory(f.slug)],
      }));
  }, [data]);

  /* Peak hour data with label */
  const peakData = useMemo(() => {
    if (!data) return { data: [], peakHour: 0 };
    const peakHour = data.horariosPico.reduce((max, h) => (h.sessoes > max.sessoes ? h : max), data.horariosPico[0]);
    return {
      data: data.horariosPico.map((h) => ({ ...h, label: `${String(h.hora).padStart(2, '0')}h` })),
      peakHour: peakHour.hora,
    };
  }, [data]);

  /* Opportunity action handlers */
  const handleSendTutorial = useCallback(
    (entry: NuncaUsaram) => {
      toast(`Tutorial de ${entry.feature} enviado para ${entry.academias.length} academias`, 'success');
    },
    [toast],
  );

  const handleScheduleDemo = useCallback(
    (entry: NuncaUsaram) => {
      toast(`Demo de ${entry.feature} agendada para ${entry.academias.length} academias`, 'success');
    },
    [toast],
  );

  if (loading || !data) return <PageSkeleton />;

  const eng = data.engajamento;

  /* Find specific nuncaUsaram items for the opportunity cards */
  const gamificacaoEntry = data.nuncaUsaram.find((n) => n.slug === 'gamificacao');
  const contratosEntry = data.nuncaUsaram.find((n) => n.slug === 'contratos');
  const streamingEntry = data.featureRanking.find((f) => f.slug === 'streaming');
  const npsEntry = data.featureRanking.find((f) => f.slug === 'nps');

  return (
    <div className="space-y-6 p-6">
      {/* ---- HEADER ---- */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Product Analytics
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Engajamento, uso de features e insights acionaveis
        </p>
      </div>

      {/* ---- ROW 1: ENGAGEMENT CARDS ---- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'DAU', value: String(eng.dau), badge: null },
          { label: 'WAU', value: String(eng.wau), badge: null },
          { label: 'MAU', value: String(eng.mau), badge: null },
          { label: 'DAU/MAU', value: eng.dauMauRatio.toFixed(2), badge: 'Excelente' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl p-4"
            style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
          >
            <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
              {kpi.label}
            </p>
            <p className="mt-1 text-2xl font-bold" style={{ color: AMBER }}>
              {kpi.value}
            </p>
            {kpi.badge && (
              <span
                className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
              >
                {kpi.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ---- ROW 2: FEATURE RANKING + PEAK HOURS ---- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Horizontal bar chart — Feature ranking */}
        <Card className="p-5">
          <h2 className="mb-1 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Ranking de Features por Uso
          </h2>
          <div className="mb-3 flex gap-3">
            {[
              { label: 'Core', color: CATEGORY_COLORS.core },
              { label: 'Premium', color: CATEGORY_COLORS.premium },
              { label: 'Beta', color: CATEGORY_COLORS.beta },
            ].map((cat) => (
              <div key={cat.label} className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ background: cat.color }}
                />
                {cat.label}
              </div>
            ))}
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: 'var(--bb-ink-40)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="feature"
                  tick={{ fontSize: 10, fill: 'var(--bb-ink-60)' }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${Number(value)} sessoes`, 'Sessoes']}
                />
                <Bar dataKey="sessoesMes" radius={[0, 4, 4, 0]}>
                  {featureChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right: Area chart — Peak hours */}
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Horarios de Pico
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={peakData.data}>
                <defs>
                  <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={AMBER} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={AMBER} stopOpacity={0.02} />
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
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--bb-ink-40)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${Number(value)} sessoes`, 'Sessoes']}
                />
                <Area
                  type="monotone"
                  dataKey="sessoes"
                  stroke={AMBER}
                  strokeWidth={2}
                  fill="url(#peakGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            Pico as{' '}
            <span className="font-semibold" style={{ color: AMBER }}>
              {String(peakData.peakHour).padStart(2, '0')}h
            </span>
            {' '}com{' '}
            {data.horariosPico.find((h) => h.hora === peakData.peakHour)?.sessoes ?? 0} sessoes
          </p>
        </Card>
      </div>

      {/* ---- ROW 3: OPORTUNIDADES ---- */}
      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          Oportunidades
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Gamificacao opportunity */}
          {gamificacaoEntry && (
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                  style={{ background: 'rgba(245,158,11,0.12)', color: AMBER }}
                >
                  !
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {gamificacaoEntry.academias.length} academias Pro nunca usaram Gamificacao
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    Essas academias tem acesso mas nunca ativaram o recurso
                  </p>
                  <button
                    type="button"
                    className="mt-3 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: AMBER }}
                    onClick={() => handleSendTutorial(gamificacaoEntry)}
                  >
                    Enviar tutorial
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contratos opportunity */}
          {contratosEntry && (
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                  style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}
                >
                  !
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {contratosEntry.academias.length} academias Black Belt nao usam Contratos
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    Contratos pode reduzir inadimplencia em ate 40%
                  </p>
                  <button
                    type="button"
                    className="mt-3 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: '#3b82f6' }}
                    onClick={() => handleScheduleDemo(contratosEntry)}
                  >
                    Agendar demo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Streaming growth insight */}
          {streamingEntry && (
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                  style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}
                >
                  ^
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    Streaming cresceu {streamingEntry.tendencia}% este mes
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    {streamingEntry.sessoesMes} sessoes de {streamingEntry.usuariosUnicos} usuarios unicos.
                    Tempo medio de {streamingEntry.tempoMedioMinutos}min por sessao.
                  </p>
                  <span
                    className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
                  >
                    Insight
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* NPS alert */}
          {npsEntry && (
            <div
              className="rounded-xl p-4"
              style={{
                background: 'var(--bb-depth-3)',
                border: '1px solid rgba(239,68,68,0.3)',
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
                >
                  !
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    NPS caiu {Math.abs(npsEntry.tendencia)}%
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    Apenas {npsEntry.usuariosUnicos} academias responderam este mes.
                    Tendencia negativa requer atencao.
                  </p>
                  <span
                    className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                  >
                    Alerta
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- ROW 4: DEVICES DONUT ---- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Dispositivos
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.dispositivos.map((d) => ({
                    ...d,
                    name: DEVICE_LABELS[d.tipo] ?? d.tipo,
                  }))}
                  dataKey="percentual"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  label={(entry) =>
                    `${(entry as { name?: string }).name ?? ''} ${Math.round(Number((entry as { percent?: number }).percent ?? 0) * 100)}%`
                  }
                >
                  {data.dispositivos.map((d, idx) => (
                    <Cell key={idx} fill={DEVICE_COLORS[d.tipo] ?? '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => `${Number(value)}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col justify-center p-5">
          <div
            className="rounded-lg p-4"
            style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#3b82f6' }}>
              Insight de Dispositivos
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>
              A maioria dos admins usa{' '}
              <span className="font-bold" style={{ color: '#3b82f6' }}>mobile</span>.
              Priorize UX mobile.
            </p>
            <div className="mt-4 space-y-2">
              {data.dispositivos.map((d) => (
                <div key={d.tipo} className="flex items-center gap-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${d.percentual}%`,
                      background: DEVICE_COLORS[d.tipo] ?? '#6b7280',
                      minWidth: '8px',
                    }}
                  />
                  <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    {DEVICE_LABELS[d.tipo] ?? d.tipo} {d.percentual}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
