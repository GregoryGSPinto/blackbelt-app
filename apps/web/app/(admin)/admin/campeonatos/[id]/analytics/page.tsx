'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Card } from '@/components/ui/Card';
import { logServiceError } from '@/lib/api/errors';
import {
  getChampionshipAnalytics,
  type ChampionshipAnalytics,
} from '@/lib/api/championship-analytics.service';

// ── Dynamic Recharts (SSR disabled) ─────────────────────────────────

const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false },
);
const LineChart = dynamic(
  () => import('recharts').then((m) => m.LineChart),
  { ssr: false },
);
const Line = dynamic(
  () => import('recharts').then((m) => m.Line),
  { ssr: false },
);
const BarChart = dynamic(
  () => import('recharts').then((m) => m.BarChart),
  { ssr: false },
);
const Bar = dynamic(
  () => import('recharts').then((m) => m.Bar),
  { ssr: false },
);
const XAxis = dynamic(
  () => import('recharts').then((m) => m.XAxis),
  { ssr: false },
);
const YAxis = dynamic(
  () => import('recharts').then((m) => m.YAxis),
  { ssr: false },
);
const CartesianGrid = dynamic(
  () => import('recharts').then((m) => m.CartesianGrid),
  { ssr: false },
);
const Tooltip = dynamic(
  () => import('recharts').then((m) => m.Tooltip),
  { ssr: false },
);
const PieChart = dynamic(
  () => import('recharts').then((m) => m.PieChart),
  { ssr: false },
);
const Pie = dynamic(
  () => import('recharts').then((m) => m.Pie),
  { ssr: false },
);
const Cell = dynamic(
  () => import('recharts').then((m) => m.Cell),
  { ssr: false },
);

// ── Colors ──────────────────────────────────────────────────────────

const COLORS = ['#C62828', '#2563EB', '#16A34A', '#9333EA', '#EA580C', '#CA8A04'];
const BELT_COLORS: Record<string, string> = {
  Branca: '#E5E7EB',
  Azul: '#2563EB',
  Roxa: '#9333EA',
  Marrom: '#92400E',
  Preta: '#1F2937',
};

// ── Helpers ─────────────────────────────────────────────────────────

function formatCurrency(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

// ── Skeleton ────────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      <Skeleton variant="text" className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-24" />
        ))}
      </div>
      <Skeleton variant="card" className="h-64" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton variant="card" className="h-48" />
        <Skeleton variant="card" className="h-48" />
      </div>
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold" style={{ color: color ?? 'var(--bb-ink-100)' }}>
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
          {sub}
        </p>
      )}
    </Card>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

export default function ChampionshipAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const championshipId = params.id as string;

  const [data, setData] = useState<ChampionshipAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        const result = await getChampionshipAnalytics(championshipId);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          logServiceError(err, 'ChampionshipAnalyticsPage');
          setError('Nao foi possivel carregar os analytics.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [championshipId]);

  if (loading) return <AnalyticsSkeleton />;

  if (error || !data) {
    return (
      <div className="p-4 lg:p-6">
        <ErrorState
          title="Analytics indisponiveis"
          description={error || 'Nao foi possivel carregar os dados do campeonato.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const inscricoesPorDiaFormatted = data.inscricoesPorDia.map((d) => ({
    ...d,
    label: formatDate(d.date),
  }));

  return (
    <div className="min-h-screen p-4 pb-24 lg:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-[var(--bb-depth-1)]"
          style={{ border: '1px solid var(--bb-glass-border)' }}
        >
          <svg className="h-5 w-5" style={{ color: 'var(--bb-ink-60)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="font-display text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Analytics do Campeonato
          </h1>
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Dados completos de inscricoes, receita e desempenho
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Inscritos" value={data.totalInscritos} sub={`${data.totalConfirmados} confirmados`} />
        <StatCard
          label="Comparecimento"
          value={`${data.taxaComparecimento}%`}
          sub={`${data.totalPresentes} presentes`}
          color="var(--bb-success)"
        />
        <StatCard
          label="Receita Total"
          value={formatCurrency(data.receitaTotal)}
          sub={`${formatCurrency(data.receitaColetada)} coletada`}
        />
        <StatCard
          label="Lutas"
          value={data.statusLutas.finalizadas + data.statusLutas.emAndamento + data.statusLutas.pendentes}
          sub={`${data.statusLutas.finalizadas} finalizadas, ${data.statusLutas.pendentes} pendentes`}
        />
      </div>

      {/* Inscricoes ao longo do tempo */}
      <Card className="mb-6 p-4">
        <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
          Inscricoes ao Longo do Tempo
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={inscricoesPorDiaFormatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--bb-ink-40)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--bb-ink-40)' }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#C62828"
              strokeWidth={2}
              dot={{ r: 4, fill: '#C62828' }}
              name="Inscricoes"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Por Categoria */}
        <Card className="p-4">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
            Inscricoes por Categoria
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.porCategoria} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--bb-ink-40)' }} />
              <YAxis dataKey="categoria" type="category" tick={{ fontSize: 11, fill: 'var(--bb-ink-60)' }} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#C62828" radius={[0, 4, 4, 0]} name="Atletas" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Por Faixa */}
        <Card className="p-4">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
            Distribuicao por Faixa
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.porFaixa}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="count"
                nameKey="faixa"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {data.porFaixa.map((entry) => (
                  <Cell
                    key={entry.faixa}
                    fill={BELT_COLORS[entry.faixa] ?? '#6B7280'}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Academias */}
        <Card className="p-4">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
            Top Academias por Atletas
          </h3>
          <div className="space-y-2">
            {data.topAcademias.map((acad, i) => (
              <div
                key={acad.nome}
                className="flex items-center justify-between rounded-lg p-3"
                style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background: i < 3 ? 'var(--bb-brand-surface)' : 'var(--bb-depth-3)',
                      color: i < 3 ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {acad.nome}
                  </span>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--bb-brand)' }}>
                  {acad.atletas} atletas
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Por Genero */}
        <Card className="p-4">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
            Distribuicao por Genero
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.porGenero}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" />
              <XAxis dataKey="genero" tick={{ fontSize: 11, fill: 'var(--bb-ink-60)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--bb-ink-40)' }} />
              <Tooltip />
              <Bar dataKey="count" name="Atletas" radius={[4, 4, 0, 0]}>
                {data.porGenero.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Status das Lutas */}
      <Card className="p-4">
        <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
          Status das Lutas
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{data.statusLutas.finalizadas}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Finalizadas</p>
          </div>
          <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
            <p className="text-2xl font-bold" style={{ color: '#a855f7' }}>{data.statusLutas.emAndamento}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Em Andamento</p>
          </div>
          <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}>
            <p className="text-2xl font-bold" style={{ color: '#eab308' }}>{data.statusLutas.pendentes}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Pendentes</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
