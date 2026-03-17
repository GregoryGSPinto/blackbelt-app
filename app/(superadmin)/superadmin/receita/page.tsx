'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { getRevenueMetrics } from '@/lib/api/superadmin-revenue.service';
import type { RevenueMetrics } from '@/lib/api/superadmin-revenue.service';
import type { PieLabelRenderProps } from 'recharts'; // eslint-disable-line @typescript-eslint/no-unused-vars

/* ---------- Recharts dynamic imports (ssr: false) ---------- */
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false });
const Legend = dynamic(() => import('recharts').then((m) => m.Legend), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false });
const LineChart = dynamic(() => import('recharts').then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((m) => m.Line), { ssr: false });

/* ---------- Helpers ---------- */
const AMBER = '#f59e0b';

function fmtBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtBRLShort(value: number): string {
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1).replace('.', ',')}k`;
  return fmtBRL(value);
}

const tooltipStyle: React.CSSProperties = {
  backgroundColor: 'var(--bb-depth-4)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: '8px',
  color: 'var(--bb-ink-100)',
  fontSize: '12px',
};

const DONUT_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#a855f7'];

/* ---------- Cohort color helper ---------- */
function cohortCellColor(value: number): string {
  if (value >= 90) return 'rgba(34,197,94,0.35)';
  if (value >= 80) return 'rgba(34,197,94,0.18)';
  if (value >= 60) return 'rgba(234,179,8,0.22)';
  return 'rgba(239,68,68,0.22)';
}

function cohortTextColor(value: number): string {
  if (value >= 90) return '#22c55e';
  if (value >= 80) return '#4ade80';
  if (value >= 60) return '#eab308';
  return '#ef4444';
}

/* ---------- Skeleton loader ---------- */
function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton variant="text" className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="card" className="h-24" />
        ))}
      </div>
      <Skeleton variant="card" className="h-72" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton variant="card" className="h-64" />
        <Skeleton variant="card" className="h-64" />
      </div>
      <Skeleton variant="card" className="h-56" />
      <Skeleton variant="card" className="h-72" />
    </div>
  );
}

/* ================================================================== */
export default function ReceitaPage() {
  const [data, setData] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const metrics = await getRevenueMetrics();
        if (!cancelled) setData(metrics);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* Projection chart data: merge 3 scenarios into single rows */
  const projectionData = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, { mes: string; otimista?: number; realista?: number; pessimista?: number }>();
    for (const p of data.projecao3Meses) {
      const entry = map.get(p.mes) ?? { mes: p.mes };
      entry[p.cenario] = p.mrrEstimado;
      map.set(p.mes, entry);
    }
    return Array.from(map.values());
  }, [data]);

  if (loading || !data) return <PageSkeleton />;

  return (
    <div className="space-y-6 p-6">
      {/* ---- HEADER ---- */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Centro de Receita
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Metricas financeiras e projecoes da plataforma
        </p>
      </div>

      {/* ---- ROW 1: KPI CARDS ---- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'MRR', value: fmtBRL(data.mrr), change: `+${data.crescimentoMrr}%`, positive: true },
          { label: 'ARR', value: fmtBRL(data.arr), change: null, positive: true },
          { label: 'Churn Rate', value: `${data.churnRate}%`, change: null, positive: false },
          { label: 'LTV/CAC', value: `${data.ltvCacRatio}x`, change: null, positive: true },
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
            {kpi.change && (
              <span
                className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background: kpi.positive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  color: kpi.positive ? '#22c55e' : '#ef4444',
                }}
              >
                {kpi.change}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ---- ROW 2: STACKED BAR CHART — MRR BREAKDOWN ---- */}
      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          Evolucao MRR Mensal
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.evolucaoMensal} stackOffset="sign">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 10, fill: 'var(--bb-ink-40)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--bb-ink-40)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => fmtBRLShort(v)}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => [fmtBRL(Number(value)), String(name)]}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: 'var(--bb-ink-60)' }} />
              <Bar dataKey="mrr" stackId="positive" name="Base MRR" fill="#166534" radius={[0, 0, 0, 0]} />
              <Bar dataKey="novoMrr" stackId="positive" name="Novo MRR" fill="#4ade80" radius={[0, 0, 0, 0]} />
              <Bar dataKey="expansaoMrr" stackId="positive" name="Expansao" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="churnMrr" stackId="negative" name="Churn" fill="#ef4444" radius={[0, 0, 0, 0]} />
              <Bar dataKey="contracaoMrr" stackId="negative" name="Contracao" fill="#f97316" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ---- ROW 3: DONUT + UNIT ECONOMICS ---- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Donut chart */}
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Receita por Plano
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.receitaPorPlano}
                  dataKey="mrr"
                  nameKey="plano"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  label={(props: PieLabelRenderProps) =>
                    `${props.name ?? ''} ${Math.round(Number(props.percent ?? 0) * 100)}%`
                  }
                >
                  {data.receitaPorPlano.map((_, idx) => (
                    <Cell key={idx} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => fmtBRL(Number(value))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right: Unit Economics */}
        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Unit Economics
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'LTV', value: fmtBRL(data.ltv) },
              { label: 'CAC', value: fmtBRL(data.cac) },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg p-4"
                style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
              >
                <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                  {item.label}
                </p>
                <p className="mt-1 text-xl font-bold" style={{ color: AMBER }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div
            className="rounded-lg p-4"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
          >
            <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
              Ratio LTV/CAC
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xl font-bold" style={{ color: AMBER }}>
                {data.ltvCacRatio}x
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
              >
                Excelente
              </span>
            </div>
          </div>

          <div
            className="rounded-lg p-4"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
          >
            <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
              Payback
            </p>
            <p className="mt-1 text-xl font-bold" style={{ color: AMBER }}>
              {data.paybackMeses} meses
            </p>
          </div>
        </Card>
      </div>

      {/* ---- ROW 4: COHORT RETENTION HEATMAP ---- */}
      <Card className="overflow-x-auto p-5">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          Retencao de Cohort
        </h2>
        <table className="w-full text-xs" style={{ color: 'var(--bb-ink-80)' }}>
          <thead>
            <tr>
              <th
                className="px-3 py-2 text-left font-semibold"
                style={{ color: 'var(--bb-ink-40)', borderBottom: '1px solid var(--bb-glass-border)' }}
              >
                Mes de Entrada
              </th>
              <th
                className="px-3 py-2 text-center font-semibold"
                style={{ color: 'var(--bb-ink-40)', borderBottom: '1px solid var(--bb-glass-border)' }}
              >
                Entrou
              </th>
              {[1, 2, 3, 4, 5, 6].map((m) => (
                <th
                  key={m}
                  className="px-3 py-2 text-center font-semibold"
                  style={{ color: 'var(--bb-ink-40)', borderBottom: '1px solid var(--bb-glass-border)' }}
                >
                  Mes {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.cohort.map((row) => (
              <tr key={row.mesEntrada}>
                <td
                  className="px-3 py-2 font-medium"
                  style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                >
                  {row.mesEntrada}
                </td>
                <td
                  className="px-3 py-2 text-center font-semibold"
                  style={{ borderBottom: '1px solid var(--bb-glass-border)', color: AMBER }}
                >
                  {row.totalEntrou}
                </td>
                {[0, 1, 2, 3, 4, 5].map((colIdx) => {
                  const val = row.retencao[colIdx];
                  const hasVal = val !== undefined;
                  return (
                    <td
                      key={colIdx}
                      className="px-3 py-2 text-center font-semibold"
                      style={{
                        borderBottom: '1px solid var(--bb-glass-border)',
                        background: hasVal ? cohortCellColor(val) : 'transparent',
                        color: hasVal ? cohortTextColor(val) : 'var(--bb-ink-20)',
                        borderRadius: '4px',
                      }}
                    >
                      {hasVal ? `${val}%` : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* ---- ROW 5: PROJECTION LINE CHART ---- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Projecao 3 Meses
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: 'var(--bb-ink-40)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--bb-ink-40)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => fmtBRLShort(v)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [fmtBRL(Number(value)), String(name)]}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: 'var(--bb-ink-60)' }} />
                <Line
                  type="monotone"
                  dataKey="otimista"
                  name="Otimista"
                  stroke="#22c55e"
                  strokeDasharray="6 3"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="realista"
                  name="Realista"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="pessimista"
                  name="Pessimista"
                  stroke="#ef4444"
                  strokeDasharray="6 3"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col justify-center p-5">
          <div
            className="rounded-lg p-4"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: AMBER }}>
              Projecao
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>
              Em 3 meses, MRR estimado entre{' '}
              <span className="font-bold" style={{ color: '#ef4444' }}>R$ 12,8k</span>
              {' '}e{' '}
              <span className="font-bold" style={{ color: '#22c55e' }}>R$ 15k</span>
            </p>
            <p className="mt-3 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              Cenario realista aponta para R$ 14k, com crescimento sustentavel
              baseado no historico dos ultimos 6 meses.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
