'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/hooks/useToast';
import {
  getMissionControl,
  resolverAlerta,
} from '@/lib/api/superadmin-dashboard.service';
import type {
  MissionControlDTO,
  AlertaUrgente,
} from '@/lib/api/superadmin-dashboard.service';
import {
  DollarIcon,
  TrendingUpIcon,
  BuildingIcon,
  UsersIcon,
  BarChartIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  PhoneIcon,
} from '@/components/shell/icons';

// -- Dynamic Recharts (no SSR) ------------------------------------------------
const AreaChart = dynamic(() => import('recharts').then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((m) => m.Area), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then((m) => m.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });

// -- Helpers ------------------------------------------------------------------

const AMBER = '#f59e0b';
const GREEN = '#22c55e';
const RED = '#ef4444';
const BLUE = '#3b82f6';

function fmtMoney(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

function fmtPercent(value: number): string {
  return `${value.toFixed(1)}%`;
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

const URGENCIA_COLORS: Record<string, string> = {
  alta: RED,
  media: AMBER,
  baixa: BLUE,
};

const PLANO_COLORS = [AMBER, GREEN, BLUE, '#a855f7', '#ec4899', '#14b8a6', '#f97316'];

const PLAN_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  Starter: { bg: 'rgba(59,130,246,0.15)', text: BLUE },
  Professional: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7' },
  Enterprise: { bg: 'rgba(245,158,11,0.15)', text: AMBER },
};

// -- KPI Icon Map -------------------------------------------------------------

const KPI_ICONS = [DollarIcon, TrendingUpIcon, BuildingIcon, UsersIcon, BarChartIcon, TrendingDownIcon];

// -- Component ----------------------------------------------------------------

export default function MissionControlPage() {
  const { toast } = useToast();
  const [data, setData] = useState<MissionControlDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingIds, setResolvingIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMissionControl();
      setData(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResolverAlerta = useCallback(async (alerta: AlertaUrgente) => {
    setResolvingIds((prev) => new Set(prev).add(alerta.id));
    try {
      await resolverAlerta(alerta.id);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          alertas: prev.alertas.filter((a) => a.id !== alerta.id),
        };
      });
      toast(`Alerta "${alerta.titulo}" resolvido`, 'success');
    } catch {
      toast('Erro ao resolver alerta', 'error');
    } finally {
      setResolvingIds((prev) => {
        const next = new Set(prev);
        next.delete(alerta.id);
        return next;
      });
    }
  }, [toast]);

  // -- Skeleton ---------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton variant="text" className="h-8 w-72" />
        <Skeleton variant="text" className="h-5 w-96" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton variant="card" className="h-72" />
          <Skeleton variant="card" className="h-72" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-20" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton variant="card" className="h-64" />
          <Skeleton variant="card" className="h-64" />
        </div>
        <Skeleton variant="card" className="h-72" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 p-6">
        <p style={{ color: 'var(--bb-ink-60)' }}>
          {error ? `Erro ao carregar: ${error}` : 'Nenhum dado disponível.'}
        </p>
        <Button variant="secondary" onClick={loadData}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const { kpis, mrrHistorico, crescimentoAcademias, alertas, topAcademias, academiasRisco, distribuicaoPlanos } = data;

  // Dynamic subtitle
  const subtitle = (() => {
    if (kpis.mrrVariacao > 0 && alertas.filter((a) => a.urgencia === 'alta').length === 0) {
      return `MRR cresceu ${fmtPercent(kpis.mrrVariacao)} este mês.`;
    }
    const alertCount = alertas.filter((a) => a.urgencia === 'alta').length;
    if (alertCount > 0) {
      return `\u26A0 ${alertCount} academia${alertCount > 1 ? 's' : ''} precisam da sua atenção.`;
    }
    return 'Visão geral da plataforma BlackBelt.';
  })();

  // KPI data
  const kpiCards = [
    { label: 'MRR', value: fmtMoney(kpis.mrr), variation: kpis.mrrVariacao, suffix: '%' },
    { label: 'ARR', value: fmtMoney(kpis.arr), variation: null, suffix: '' },
    { label: 'Academias Ativas', value: String(kpis.academiasAtivas), variation: null, suffix: '' },
    { label: 'Alunos', value: kpis.totalAlunosPlataforma.toLocaleString('pt-BR'), variation: null, suffix: '' },
    { label: 'Ticket Médio', value: fmtMoney(kpis.ticketMedio), variation: null, suffix: '' },
    { label: 'Churn Rate', value: fmtPercent(kpis.churnRate), variation: kpis.churnRate, suffix: '%', invertColor: true },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div>
        <h1
          className="font-bold"
          style={{ fontSize: 28, color: 'var(--bb-ink-100)' }}
        >
          Mission Control
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          {subtitle}
        </p>
      </div>

      {/* ── ROW 1: KPI CARDS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpiCards.map((kpi, idx) => {
          const Icon = KPI_ICONS[idx];
          const showVariation = kpi.variation !== null;
          const isPositive = kpi.invertColor
            ? (kpi.variation ?? 0) <= 0
            : (kpi.variation ?? 0) >= 0;
          const variationColor = isPositive ? GREEN : RED;

          return (
            <div
              key={kpi.label}
              className="rounded-xl p-4"
              style={{
                background: 'var(--bb-depth-3)',
                border: '1px solid var(--bb-glass-border)',
                boxShadow: 'var(--bb-shadow-sm)',
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <Icon
                  className="h-4 w-4"
                  style={{ color: 'var(--bb-ink-40)' }}
                />
                {showVariation && (
                  <span
                    className="flex items-center gap-0.5 text-xs font-medium"
                    style={{ color: variationColor }}
                  >
                    <span style={{ fontSize: 10 }}>
                      {isPositive ? '\u25B2' : '\u25BC'}
                    </span>
                    {fmtPercent(Math.abs(kpi.variation ?? 0))}
                  </span>
                )}
              </div>
              <p
                className="text-xl font-bold leading-tight"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                {kpi.value}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                {kpi.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── ROW 2: CHARTS ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* MRR Últimos 12 Meses */}
        <div
          className="rounded-xl p-5"
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            boxShadow: 'var(--bb-shadow-sm)',
          }}
        >
          <h3
            className="mb-4 text-sm font-semibold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            MRR Últimos 12 Meses
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mrrHistorico}>
                <defs>
                  <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GREEN} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="mes"
                  tick={{ fill: 'var(--bb-ink-40)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--bb-ink-40)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bb-depth-4)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: 8,
                    color: 'var(--bb-ink-100)',
                    fontSize: 12,
                  }}
                  formatter={(value) => [fmtMoney(Number(value)), 'MRR']}
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke={GREEN}
                  strokeWidth={2}
                  fill="url(#mrrGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Academias: Novas vs Churn */}
        <div
          className="rounded-xl p-5"
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            boxShadow: 'var(--bb-shadow-sm)',
          }}
        >
          <h3
            className="mb-4 text-sm font-semibold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Academias: Novas vs Churn
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crescimentoAcademias}>
                <XAxis
                  dataKey="mes"
                  tick={{ fill: 'var(--bb-ink-40)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--bb-ink-40)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bb-depth-4)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: 8,
                    color: 'var(--bb-ink-100)',
                    fontSize: 12,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: 'var(--bb-ink-60)' }}
                />
                <Bar dataKey="novas" name="Novas" fill={GREEN} radius={[4, 4, 0, 0]} />
                <Bar dataKey="churn" name="Churn" fill={RED} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── ROW 3: ALERTAS URGENTES ─────────────────────────────────────── */}
      {alertas.length > 0 && (
        <div>
          <h3
            className="mb-3 text-sm font-semibold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Alertas Urgentes
          </h3>
          <div className="space-y-2">
            {alertas.map((alerta) => {
              const borderColor = URGENCIA_COLORS[alerta.urgencia] ?? BLUE;
              return (
                <div
                  key={alerta.id}
                  className="flex items-center gap-4 rounded-xl px-4 py-3"
                  style={{
                    background: 'var(--bb-depth-3)',
                    border: '1px solid var(--bb-glass-border)',
                    borderLeft: `4px solid ${borderColor}`,
                    boxShadow: 'var(--bb-shadow-sm)',
                  }}
                >
                  <AlertTriangleIcon
                    className="h-5 w-5 shrink-0"
                    style={{ color: borderColor }}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: 'var(--bb-ink-100)' }}
                    >
                      {alerta.titulo}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        {alerta.academiaNome}
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        <ClockIcon className="h-3 w-3" />
                        {timeAgo(alerta.criadoEm)}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={resolvingIds.has(alerta.id)}
                    onClick={() => handleResolverAlerta(alerta)}
                    style={{
                      background: `${borderColor}15`,
                      color: borderColor,
                      border: `1px solid ${borderColor}30`,
                    }}
                  >
                    <CheckCircleIcon className="mr-1.5 h-3.5 w-3.5" />
                    Resolver
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ROW 4: TOP ACADEMIAS + EM RISCO ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top Academias por Receita */}
        <div
          className="rounded-xl p-5"
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            boxShadow: 'var(--bb-shadow-sm)',
          }}
        >
          <h3
            className="mb-4 text-sm font-semibold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Top Academias por Receita
          </h3>
          <div className="space-y-3">
            {topAcademias.slice(0, 5).map((ac) => {
              const badge = PLAN_BADGE_COLORS[ac.plano] ?? { bg: 'rgba(156,163,175,0.15)', text: 'var(--bb-ink-60)' };
              const healthColor = ac.healthScore >= 80 ? GREEN : ac.healthScore >= 50 ? AMBER : RED;
              return (
                <div
                  key={ac.id}
                  className="flex items-center gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="truncate text-sm font-medium"
                        style={{ color: 'var(--bb-ink-100)' }}
                      >
                        {ac.nome}
                      </span>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: badge.bg, color: badge.text }}
                      >
                        {ac.plano}
                      </span>
                    </div>
                    {/* Health score bar */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div
                        className="h-1.5 flex-1 rounded-full"
                        style={{ background: 'var(--bb-depth-5)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${ac.healthScore}%`,
                            background: healthColor,
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: healthColor }}
                      >
                        {ac.healthScore}%
                      </span>
                    </div>
                  </div>
                  <span
                    className="shrink-0 text-sm font-bold"
                    style={{ color: GREEN }}
                  >
                    {fmtMoney(ac.mrr)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Academias em Risco */}
        <div
          className="rounded-xl p-5"
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            boxShadow: 'var(--bb-shadow-sm)',
          }}
        >
          <h3
            className="mb-4 text-sm font-semibold"
            style={{ color: RED }}
          >
            Academias em Risco
          </h3>
          <div className="space-y-3">
            {academiasRisco.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                Nenhuma academia em risco no momento.
              </p>
            )}
            {academiasRisco.map((ac) => {
              const healthColor = ac.healthScore >= 50 ? AMBER : RED;
              return (
                <div
                  key={ac.id}
                  className="rounded-lg p-3"
                  style={{
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.15)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-sm font-medium"
                        style={{ color: 'var(--bb-ink-100)' }}
                      >
                        {ac.nome}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        <span style={{ color: healthColor }}>
                          Health: {ac.healthScore}%
                        </span>
                        <span>{ac.motivoRisco}</span>
                        <span>{ac.diasDesdeUltimoLogin}d sem login</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        color: RED,
                        border: '1px solid rgba(239,68,68,0.25)',
                      }}
                      onClick={() => toast(`Contato iniciado com ${ac.nome}`, 'info')}
                    >
                      <PhoneIcon className="mr-1 h-3 w-3" />
                      Contatar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ROW 5: DISTRIBUIÇÃO POR PLANO ───────────────────────────────── */}
      <div
        className="rounded-xl p-5"
        style={{
          background: 'var(--bb-depth-3)',
          border: '1px solid var(--bb-glass-border)',
          boxShadow: 'var(--bb-shadow-sm)',
        }}
      >
        <h3
          className="mb-4 text-sm font-semibold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Distribuição por Plano
        </h3>
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div style={{ width: 260, height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribuicaoPlanos}
                  dataKey="quantidade"
                  nameKey="plano"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  strokeWidth={0}
                >
                  {distribuicaoPlanos.map((_, i) => (
                    <Cell key={i} fill={PLANO_COLORS[i % PLANO_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bb-depth-4)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: 8,
                    color: 'var(--bb-ink-100)',
                    fontSize: 12,
                  }}
                  formatter={(value, name) => [`${value} academias`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-1 flex-col gap-2">
            {distribuicaoPlanos.map((item, i) => (
              <div key={item.plano} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ background: PLANO_COLORS[i % PLANO_COLORS.length] }}
                  />
                  <span className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                    {item.plano}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--bb-ink-100)' }}
                  >
                    {item.quantidade}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    {fmtMoney(item.receita)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
