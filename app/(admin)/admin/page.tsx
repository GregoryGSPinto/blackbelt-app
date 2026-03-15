'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { getAdminDashboard, getAdminMetrics } from '@/lib/api/admin.service';
import type { AdminDashboardDTO, AdminMetrics } from '@/lib/api/admin.service';
import { handleServiceError } from '@/lib/api/errors';
import { useAuth } from '@/lib/hooks/useAuth';
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

  return (
    <div className="min-h-screen space-y-6 p-6">
      {/* ── SECTION 1: Contextual greeting ──────────────────────────── */}
      <section>
        <h1 className="text-2xl font-bold text-bb-white">
          {getGreeting()}, {userName}.
        </h1>
        <p
          className={`mt-1 text-sm ${
            attentionAlerts.length === 0 ? 'text-green-400' : 'text-yellow-400'
          }`}
        >
          {healthText}
        </p>
      </section>

      {/* ── Shared components: StatusDoDia + QuickActions ───────────── */}
      <StatusDoDia role="admin" data={statusData} />

      <QuickActions
        role="admin"
        badges={{ riscos: attentionAlerts.length }}
        onAction={handleQuickAction}
      />

      <DayRecap role="admin" data={recapData} onDismiss={() => {}} />

      {/* ── SECTION 2: KPI Cards ────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Alunos Ativos */}
          <div className="rounded-xl bg-bb-gray-700 p-4">
            <p className="text-3xl font-bold text-bb-white">{dashboard.alunosAtivos}</p>
            <p className="mt-1 text-sm text-bb-gray-500">ativos</p>
            <p className="mt-2 text-xs text-green-400">
              +{dashboard.novosEsteMes} este mes
            </p>
          </div>

          {/* Receita */}
          <div className="rounded-xl bg-bb-gray-700 p-4">
            <p className="text-3xl font-bold text-bb-white">
              R$ {formatCurrency(dashboard.receitaMensal)}
            </p>
            <p className="mt-1 text-sm text-bb-gray-500">receita</p>
            <p
              className={`mt-2 text-xs ${
                receitaTrend >= 0 ? 'text-green-400' : 'text-bb-error'
              }`}
            >
              {receitaTrend >= 0 ? '\u2191' : '\u2193'}
              {Math.abs(receitaTrend)}%
            </p>
          </div>

          {/* Presenca */}
          <div className="rounded-xl bg-bb-gray-700 p-4">
            <p className="text-3xl font-bold text-bb-white">{dashboard.presencaMedia}%</p>
            <p className="mt-1 text-sm text-bb-gray-500">presenca</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bb-gray-900">
              <div
                className={`h-full rounded-full transition-all ${
                  dashboard.presencaMedia >= 70 ? 'bg-green-400' : 'bg-yellow-400'
                }`}
                style={{ width: `${Math.min(dashboard.presencaMedia, 100)}%` }}
              />
            </div>
          </div>

          {/* Inadimplencia */}
          <div className="rounded-xl bg-bb-gray-700 p-4">
            <p
              className={`text-3xl font-bold ${
                dashboard.inadimplencia > 5 ? 'text-bb-error' : 'text-bb-white'
              }`}
            >
              {dashboard.inadimplencia}%
            </p>
            <p className="mt-1 text-sm text-bb-gray-500">inadimplencia</p>
            {dashboard.inadimplencia > 5 && (
              <p className="mt-2 text-xs text-bb-error">Acima do limite</p>
            )}
            {dashboard.inadimplencia <= 5 && (
              <p className="mt-2 text-xs text-green-400">Dentro do aceitavel</p>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Central de Atencao ───────────────────────────── */}
      <section className="rounded-xl bg-bb-gray-700 p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-bb-red">
          Precisa de acao agora
        </h2>

        {attentionAlerts.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg bg-bb-gray-900/50 px-4 py-3 text-sm text-green-400">
            <span>\u2705</span>
            <span>Tudo em ordem hoje!</span>
          </div>
        ) : (
          <div className="space-y-3">
            {attentionAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between rounded-lg bg-bb-gray-900/50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {alert.level === 'red' ? '\uD83D\uDD34' : '\uD83D\uDFE1'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-bb-white">{alert.name}</p>
                    <p className="text-xs text-bb-gray-500">{alert.issue}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-bb-gray-500 px-3 py-1.5 text-xs font-medium text-bb-white transition-colors hover:bg-bb-gray-900"
                  >
                    Mensagem
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-bb-red px-3 py-1.5 text-xs font-medium text-bb-white transition-colors hover:bg-bb-red/80"
                  >
                    Perfil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── SECTION 4: Timeline do Dia ──────────────────────────────── */}
      <section className="rounded-xl bg-bb-gray-700 p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-bb-white">
          Timeline do Dia
        </h2>

        {dashboard.proximasAulas.length === 0 ? (
          <p className="text-sm text-bb-gray-500">Nenhuma aula programada para hoje.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {dashboard.proximasAulas.map((aula, i) => {
              const isNext = aula.time > currentTime;
              const isPast = aula.time <= currentTime;

              return (
                <div
                  key={i}
                  className={`flex flex-shrink-0 flex-col items-center rounded-xl px-5 py-3 text-center transition-all ${
                    isNext && !isPast
                      ? 'border-2 border-bb-red bg-bb-red/10 ring-1 ring-bb-red/30'
                      : 'bg-bb-gray-900/50'
                  }`}
                  style={{ minWidth: '140px' }}
                >
                  <p
                    className={`text-lg font-bold ${
                      isNext && !isPast ? 'text-bb-red' : 'text-bb-white'
                    }`}
                  >
                    {aula.time}
                  </p>
                  <p className="mt-1 text-sm font-medium text-bb-white">{aula.class_name}</p>
                  <p className="text-xs text-bb-gray-500">{aula.professor_name}</p>
                  <p className="mt-1 text-xs text-bb-gray-500">{aula.enrolled} alunos</p>
                  {isNext && !isPast && (
                    <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-bb-red">
                      Proxima
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── SECTION 5: Feed de Atividade ────────────────────────────── */}
      <section className="rounded-xl bg-bb-gray-700 p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-bb-white">
          Atividade Recente
        </h2>

        {activityFeed.length === 0 ? (
          <p className="text-sm text-bb-gray-500">Nenhuma atividade recente.</p>
        ) : (
          <div className="space-y-2">
            {activityFeed.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg bg-bb-gray-900/50 px-4 py-3"
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-bb-white">{item.text}</p>
                </div>
                <span className="flex-shrink-0 text-xs text-bb-gray-500">{item.time}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── SECTION 6: Charts ───────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Presenca por Modalidade */}
        <div className="rounded-xl bg-bb-gray-700 p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-bb-white">
            Presenca por Modalidade
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={presencaModalidadeData}
                layout="vertical"
                margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
              >
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fill: '#e5e7eb', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value) => [`${value}%`, 'Presenca']}
                />
                <Bar dataKey="presenca" fill="#ef4444" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receita 6 meses */}
        <div className="rounded-xl bg-bb-gray-700 p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-bb-white">
            Receita 6 Meses
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={receitaMesesData}
                margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
              >
                <XAxis dataKey="month" tick={{ fill: '#e5e7eb', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value) => [
                    `R$ ${formatCurrency(Number(value))}`,
                    'Receita',
                  ]}
                />
                <Bar dataKey="receita" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
