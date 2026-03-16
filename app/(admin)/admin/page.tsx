'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { getAdminDashboard, getAdminMetrics } from '@/lib/api/admin.service';
import type { AdminDashboardDTO, AdminMetrics } from '@/lib/api/admin.service';
import { handleServiceError } from '@/lib/api/errors';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCountUp } from '@/lib/hooks/useCountUp';
import { StatusDoDia } from '@/components/shared/StatusDoDia';
import { QuickActions } from '@/components/shared/QuickActions';
import { DayRecap } from '@/components/shared/DayRecap';
import { Skeleton } from '@/components/ui/Skeleton';

// ── Dynamic Recharts imports (no SSR) ────────────────────────────────
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false });
const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false },
);

// ── Helpers ──────────────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
}

// ── Alert type for the "Central de Atencao" ─────────────────────────
interface AttentionAlert {
  id: string;
  level: 'red' | 'yellow';
  name: string;
  issue: string;
}

function buildAttentionAlerts(dashboard: AdminDashboardDTO): AttentionAlert[] {
  const alerts: AttentionAlert[] = [];

  // Derive alerts from dashboard.alertas
  dashboard.alertas.forEach((alerta, i) => {
    if (alerta.severity === 'error') {
      alerts.push({
        id: `alert-err-${i}`,
        level: 'red',
        name: alerta.message,
        issue: 'Requer acao imediata',
      });
    } else if (alerta.severity === 'warning') {
      alerts.push({
        id: `alert-warn-${i}`,
        level: 'yellow',
        name: alerta.message,
        issue: alerta.type === 'payment' ? 'Pagamento em atraso' : 'Atencao necessaria',
      });
    }
  });

  // If inadimplencia is high, add a synthetic alert
  if (dashboard.inadimplencia > 5) {
    alerts.push({
      id: 'inadimplencia-alta',
      level: 'yellow',
      name: `${dashboard.inadimplencia}% de inadimplencia`,
      issue: 'Acima do limite aceitavel',
    });
  }

  return alerts;
}

// ── Activity feed item ──────────────────────────────────────────────
interface ActivityItem {
  id: string;
  icon: string;
  text: string;
  time: string;
}

function buildActivityFeed(dashboard: AdminDashboardDTO): ActivityItem[] {
  return dashboard.ultimosCheckins.map((checkin, i) => ({
    id: `checkin-${i}`,
    icon: '\u2705',
    text: `${checkin.student_name} fez check-in em ${checkin.class_name}`,
    time: checkin.time,
  }));
}

// ── Mock chart data fallbacks ───────────────────────────────────────
const FALLBACK_PRESENCA_MODALIDADE = [
  { name: 'Jiu-Jitsu', presenca: 82 },
  { name: 'Muay Thai', presenca: 74 },
  { name: 'Judo', presenca: 68 },
  { name: 'Wrestling', presenca: 71 },
];

const FALLBACK_RECEITA_MESES = [
  { month: 'Out', receita: 3200 },
  { month: 'Nov', receita: 3450 },
  { month: 'Dez', receita: 3100 },
  { month: 'Jan', receita: 3600 },
  { month: 'Fev', receita: 3550 },
  { month: 'Mar', receita: 3847 },
];

// ── KPI Card component ──────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: { value: number; label: string };
  decimals?: number;
  bar?: { percent: number };
}

function KpiCard({ label, value, prefix, suffix, trend, decimals = 0, bar }: KpiCardProps) {
  const animatedValue = useCountUp(value, 800, decimals);

  return (
    <div
      className="p-6"
      style={{
        background: 'var(--bb-depth-3)',
        border: '1px solid var(--bb-glass-border)',
        borderRadius: 'var(--bb-radius-lg)',
      }}
    >
      <p
        className="font-mono uppercase"
        style={{
          fontSize: '11px',
          letterSpacing: '0.08em',
          color: 'var(--bb-ink-40)',
        }}
      >
        {label}
      </p>
      <p
        className="mt-2 font-mono font-bold"
        style={{
          fontSize: '44px',
          letterSpacing: '-0.04em',
          color: 'var(--bb-ink-100)',
          lineHeight: 1.1,
        }}
      >
        {prefix}{animatedValue}{suffix}
      </p>

      {bar && (
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full"
          style={{ background: 'var(--bb-ink-20)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(bar.percent, 100)}%`,
              background: bar.percent >= 70 ? 'var(--bb-success)' : 'var(--bb-warning)',
            }}
          />
        </div>
      )}

      {trend && (
        <div className="mt-3">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-medium"
            style={{
              color: trend.value >= 0 ? 'var(--bb-success)' : 'var(--bb-warning)',
              background: trend.value >= 0 ? 'var(--bb-success-surface)' : 'var(--bb-warning-surface)',
            }}
          >
            {trend.value >= 0 ? '\u2191' : '\u2193'}
            {Math.abs(trend.value)}% {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Loading skeleton ────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Greeting skeleton */}
      <div className="space-y-2">
        <Skeleton variant="text" className="h-8 w-64" />
        <Skeleton variant="text" className="h-4 w-48" />
      </div>

      {/* StatusDoDia skeleton */}
      <Skeleton variant="card" className="h-12" />

      {/* QuickActions skeleton */}
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="card" className="h-20" />
        ))}
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="card" className="h-28" />
        ))}
      </div>

      {/* Attention center skeleton */}
      <Skeleton variant="card" className="h-48" />

      {/* Timeline skeleton */}
      <Skeleton variant="card" className="h-28" />

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton variant="card" className="h-64" />
        <Skeleton variant="card" className="h-64" />
      </div>
    </div>
  );
}

// ── Chart tooltip style ─────────────────────────────────────────────
const chartTooltipStyle: React.CSSProperties = {
  backgroundColor: 'var(--bb-depth-4)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-sm)',
  boxShadow: 'var(--bb-shadow-md)',
  color: 'var(--bb-ink-100)',
};

// ── Main page component ─────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<AdminDashboardDTO | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [d, m] = await Promise.all([
          getAdminDashboard('academy-1'),
          getAdminMetrics('academy-1'),
        ]);
        setDashboard(d);
        setMetrics(m);
      } catch (error) {
        handleServiceError(error, 'admin.dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleQuickAction = useCallback(
    (actionKey: string) => {
      const routes: Record<string, string> = {
        riscos: '/admin/alunos?filter=risco',
        cobrancas: '/admin/financeiro',
        leads: '/admin/leads',
        comunicado: '/admin/comunicados',
      };
      const target = routes[actionKey];
      if (target) router.push(target);
    },
    [router],
  );

  if (loading || !dashboard) {
    return <DashboardSkeleton />;
  }

  // ── Derived data ────────────────────────────────────────────────
  const userName = profile?.display_name?.split(' ')[0] ?? 'Admin';

  const receitaTrend = metrics?.receitaPorMes
    ? (() => {
        const arr = metrics.receitaPorMes;
        if (arr.length < 2) return 0;
        const curr = arr[arr.length - 1].receita;
        const prev = arr[arr.length - 2].receita;
        return prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;
      })()
    : 0;

  const attentionAlerts = buildAttentionAlerts(dashboard);
  const activityFeed = buildActivityFeed(dashboard);

  // Chart data
  const presencaModalidadeData =
    metrics?.turmasLotacao && metrics.turmasLotacao.length > 0
      ? metrics.turmasLotacao.map((t) => ({ name: t.name, presenca: t.percent }))
      : FALLBACK_PRESENCA_MODALIDADE;

  const receitaMesesData =
    metrics?.receitaPorMes && metrics.receitaPorMes.length > 0
      ? metrics.receitaPorMes.map((r) => ({ month: r.month, receita: r.receita }))
      : FALLBACK_RECEITA_MESES;

  // StatusDoDia data
  const statusData = {
    classesToday: dashboard.turmasHoje,
    expectedStudents: dashboard.alunosAtivos,
    risks: attentionAlerts.length,
  };

  // DayRecap data
  const recapData = {
    checkins: dashboard.ultimosCheckins.length,
    received: dashboard.receitaMensal,
    riskName: attentionAlerts.length > 0 ? attentionAlerts[0].name : 'Nenhum',
    riskDays: 0,
  };

  // Determine the "next" class in the timeline
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Health sub-text
  const healthText =
    attentionAlerts.length === 0
      ? 'Sua academia esta saudavel hoje.'
      : `${attentionAlerts.length} situac${attentionAlerts.length === 1 ? 'ao precisa' : 'oes precisam'} de atencao.`;

  // Inadimplencia trend label
  const inadimplenciaTrend = dashboard.inadimplencia > 5
    ? { value: dashboard.inadimplencia - 5, label: 'acima do limite' }
    : { value: -(5 - dashboard.inadimplencia), label: 'dentro do aceitavel' };

  return (
    <div className="min-h-screen space-y-6 p-6" data-stagger>
      {/* ── SECTION 1: Contextual greeting ──────────────────────────── */}
      <section className="animate-reveal">
        <h1
          className="font-display font-bold"
          style={{
            fontSize: '28px',
            color: 'var(--bb-ink-100)',
          }}
        >
          {getGreeting()}, {userName}.
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          {healthText}
        </p>
      </section>

      {/* ── Shared components: StatusDoDia + QuickActions ───────────── */}
      <div className="animate-reveal">
        <StatusDoDia role="admin" data={statusData} />
      </div>

      <div className="animate-reveal">
        <QuickActions
          role="admin"
          badges={{ riscos: attentionAlerts.length }}
          onAction={handleQuickAction}
        />
      </div>

      <div className="animate-reveal">
        <DayRecap role="admin" data={recapData} onDismiss={() => {}} />
      </div>

      {/* ── SECTION 2: KPI Cards ────────────────────────────────────── */}
      <section className="animate-reveal">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-stagger>
          {/* Alunos Ativos */}
          <KpiCard
            label="Alunos Ativos"
            value={dashboard.alunosAtivos}
            trend={{ value: dashboard.novosEsteMes, label: 'este mes' }}
          />

          {/* Receita */}
          <KpiCard
            label="Receita Mensal"
            value={dashboard.receitaMensal}
            prefix="R$ "
            trend={{ value: receitaTrend, label: 'vs mes anterior' }}
          />

          {/* Presenca */}
          <KpiCard
            label="Presenca Media"
            value={dashboard.presencaMedia}
            suffix="%"
            bar={{ percent: dashboard.presencaMedia }}
          />

          {/* Inadimplencia */}
          <KpiCard
            label="Inadimplencia"
            value={dashboard.inadimplencia}
            suffix="%"
            trend={inadimplenciaTrend}
          />
        </div>
      </section>

      {/* ── SECTION 3: Central de Atencao ───────────────────────────── */}
      <section className="animate-reveal">
        <div
          className="p-5"
          style={{
            background: attentionAlerts.length > 0
              ? 'var(--bb-brand-surface)'
              : 'var(--bb-success-surface)',
            borderLeft: attentionAlerts.length > 0
              ? '3px solid var(--bb-brand)'
              : '3px solid var(--bb-success)',
            borderRadius: 'var(--bb-radius-lg)',
            boxShadow: attentionAlerts.length > 0
              ? 'var(--bb-brand-glow)'
              : 'none',
          }}
        >
          <h2
            className="mb-4 font-mono uppercase"
            style={{
              fontSize: '11px',
              letterSpacing: '0.12em',
              color: attentionAlerts.length > 0
                ? 'var(--bb-brand)'
                : 'var(--bb-success)',
            }}
          >
            {attentionAlerts.length > 0 ? 'ACAO NECESSARIA' : 'TUDO EM ORDEM'}
          </h2>

          {attentionAlerts.length === 0 ? (
            <div
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
              style={{ color: 'var(--bb-success)' }}
            >
              <span>{'\u2705'}</span>
              <span>Tudo em ordem hoje!</span>
            </div>
          ) : (
            <div className="space-y-3">
              {attentionAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg px-4 py-3"
                  style={{
                    background: 'var(--bb-depth-3)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {alert.level === 'red' ? '\uD83D\uDD34' : '\uD83D\uDFE1'}
                    </span>
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: 'var(--bb-ink-100)' }}
                      >
                        {alert.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--bb-ink-60)' }}
                      >
                        {alert.issue}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                      style={{
                        background: 'var(--bb-depth-5)',
                        color: 'var(--bb-ink-100)',
                      }}
                    >
                      Mensagem
                    </button>
                    <button
                      type="button"
                      className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                      style={{
                        background: 'var(--bb-brand)',
                        color: 'var(--bb-ink-100)',
                      }}
                    >
                      Perfil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 4: Timeline do Dia ──────────────────────────────── */}
      <section className="animate-reveal">
        <div
          className="p-5"
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <h2
            className="mb-4 font-mono uppercase"
            style={{
              fontSize: '11px',
              letterSpacing: '0.08em',
              color: 'var(--bb-ink-40)',
            }}
          >
            Timeline do Dia
          </h2>

          {dashboard.proximasAulas.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Nenhuma aula programada para hoje.
            </p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {dashboard.proximasAulas.map((aula, i) => {
                const isNext = aula.time > currentTime;
                const isPast = aula.time <= currentTime;

                return (
                  <div
                    key={i}
                    className="flex flex-shrink-0 flex-col items-center px-5 py-3 text-center transition-all"
                    style={{
                      minWidth: '140px',
                      borderRadius: 'var(--bb-radius-lg)',
                      ...(isNext && !isPast
                        ? {
                            border: '2px solid var(--bb-brand)',
                            background: 'var(--bb-brand-surface)',
                            boxShadow: 'var(--bb-brand-glow)',
                          }
                        : {
                            background: 'var(--bb-depth-4)',
                            border: '1px solid var(--bb-glass-border)',
                          }),
                    }}
                  >
                    <p
                      className="text-lg font-bold font-mono"
                      style={{
                        color: isNext && !isPast ? 'var(--bb-brand)' : 'var(--bb-ink-100)',
                      }}
                    >
                      {aula.time}
                    </p>
                    <p
                      className="mt-1 text-sm font-medium"
                      style={{ color: 'var(--bb-ink-100)' }}
                    >
                      {aula.class_name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      {aula.professor_name}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      {aula.enrolled} alunos
                    </p>
                    {isNext && !isPast && (
                      <span
                        className="mt-1 font-mono font-bold uppercase"
                        style={{
                          fontSize: '10px',
                          letterSpacing: '0.08em',
                          color: 'var(--bb-brand)',
                        }}
                      >
                        Proxima
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 5: Feed de Atividade ────────────────────────────── */}
      <section className="animate-reveal">
        <div
          className="p-5"
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <h2
            className="mb-4 font-mono uppercase"
            style={{
              fontSize: '11px',
              letterSpacing: '0.08em',
              color: 'var(--bb-ink-40)',
            }}
          >
            Atividade Recente
          </h2>

          {activityFeed.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Nenhuma atividade recente.
            </p>
          ) : (
            <div className="space-y-2">
              {activityFeed.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg px-4 py-3"
                  style={{
                    background: 'var(--bb-depth-4)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>
                      {item.text}
                    </p>
                  </div>
                  <span
                    className="flex-shrink-0 font-mono text-xs"
                    style={{ color: 'var(--bb-ink-40)' }}
                  >
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 6: Charts ───────────────────────────────────────── */}
      <section className="animate-reveal grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Presenca por Modalidade */}
        <div
          className="p-5"
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <h2
            className="mb-4 font-mono uppercase"
            style={{
              fontSize: '11px',
              letterSpacing: '0.08em',
              color: 'var(--bb-ink-40)',
            }}
          >
            Presenca por Modalidade
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={presencaModalidadeData}
                layout="vertical"
                margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--bb-ink-20)"
                  strokeOpacity={0.5}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{
                    fill: 'var(--bb-ink-40)',
                    fontSize: 11,
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{
                    fill: 'var(--bb-ink-40)',
                    fontSize: 11,
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value) => [`${value}%`, 'Presenca']}
                />
                <Bar dataKey="presenca" fill="var(--bb-brand)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receita 6 meses */}
        <div
          className="p-5"
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <h2
            className="mb-4 font-mono uppercase"
            style={{
              fontSize: '11px',
              letterSpacing: '0.08em',
              color: 'var(--bb-ink-40)',
            }}
          >
            Receita 6 Meses
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={receitaMesesData}
                margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--bb-ink-20)"
                  strokeOpacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{
                    fill: 'var(--bb-ink-40)',
                    fontSize: 11,
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                />
                <YAxis
                  tick={{
                    fill: 'var(--bb-ink-40)',
                    fontSize: 11,
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value) => [
                    `R$ ${formatCurrency(Number(value))}`,
                    'Receita',
                  ]}
                />
                <Bar dataKey="receita" fill="var(--bb-brand)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
