'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStudentId } from '@/lib/hooks/useStudentId';
import dynamic from 'next/dynamic';
import {
  getStudentProfile,
  getJourneyTimeline,
  getEvolutionData,
  getAttendanceHeatmap,
  getFinanceiroPerfil,
} from '@/lib/api/perfil.service';
import type {
  StudentProfileDTO,
  TimelineEventDTO,
  EvolutionDataDTO,
  AttendanceHeatmapDTO,
  HeatmapDayDTO,
  ModalityDistributionDTO,
  FinanceiroPerfilDTO,
} from '@/lib/api/perfil.service';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

// ── Dynamic Recharts imports (SSR disabled) ────────────────────────────

const RadarChart = dynamic(() => import('recharts').then((m) => m.RadarChart), { ssr: false });
const Radar = dynamic(() => import('recharts').then((m) => m.Radar), { ssr: false });
const PolarGrid = dynamic(() => import('recharts').then((m) => m.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import('recharts').then((m) => m.PolarAngleAxis), { ssr: false });
const PolarRadiusAxis = dynamic(() => import('recharts').then((m) => m.PolarRadiusAxis), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });

// ── Belt constants ─────────────────────────────────────────────────────

const BELT_COLOR_MAP: Record<string, string> = {
  white: '#FAFAFA',
  gray: '#9CA3AF',
  yellow: '#EAB308',
  orange: '#EA580C',
  green: '#16A34A',
  blue: '#2563EB',
  purple: '#9333EA',
  brown: '#92400E',
  black: '#0A0A0A',
};

const BELT_GRADIENT_MAP: Record<string, string> = {
  white: 'from-gray-100 to-gray-300',
  gray: 'from-gray-400 to-gray-600',
  yellow: 'from-yellow-400 to-yellow-600',
  orange: 'from-orange-500 to-orange-700',
  green: 'from-green-500 to-green-700',
  blue: 'from-blue-500 to-blue-700',
  purple: 'from-purple-500 to-purple-700',
  brown: 'from-amber-700 to-amber-900',
  black: 'from-gray-800 to-black',
};

const BELT_TEXT_MAP: Record<string, string> = {
  white: 'text-bb-black',
  gray: 'text-bb-white',
  yellow: 'text-bb-black',
  orange: 'text-bb-white',
  green: 'text-bb-white',
  blue: 'text-bb-white',
  purple: 'text-bb-white',
  brown: 'text-bb-white',
  black: 'text-bb-white',
};

const BELT_LABEL_MAP: Record<string, string> = {
  white: 'Branca',
  gray: 'Cinza',
  yellow: 'Amarela',
  orange: 'Laranja',
  green: 'Verde',
  blue: 'Azul',
  purple: 'Roxa',
  brown: 'Marrom',
  black: 'Preta',
};

const INVOICE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  paid: { label: 'Pago', color: 'text-bb-success' },
  open: { label: 'Aberto', color: 'text-bb-warning' },
  draft: { label: 'Rascunho', color: 'text-[var(--bb-ink-40)]' },
  void: { label: 'Cancelado', color: 'text-[var(--bb-ink-40)]' },
  uncollectible: { label: 'Inadimplente', color: 'text-bb-error' },
};

// ── Tab type ───────────────────────────────────────────────────────────

type ProfileTab = 'resumo' | 'evolucao' | 'presencas' | 'financeiro';

interface TabConfig {
  key: ProfileTab;
  label: string;
}

const TABS: TabConfig[] = [
  { key: 'resumo', label: 'Resumo' },
  { key: 'evolucao', label: 'Evolucao' },
  { key: 'presencas', label: 'Presencas' },
  { key: 'financeiro', label: 'Financeiro' },
];

// ── Heatmap Component ──────────────────────────────────────────────────

function AttendanceHeatmapGrid({ days }: { days: HeatmapDayDTO[] }) {
  const levelColors = [
    'bg-[var(--bb-depth-3)]',
    'bg-[var(--bb-success-light,#bbf7d0)]',
    'bg-[var(--bb-success)]',
    'bg-[var(--bb-success-dark,#16a34a)]',
    'bg-[var(--bb-success-darker,#166534)]',
  ];

  const weeks: HeatmapDayDTO[][] = [];
  let currentWeek: HeatmapDayDTO[] = [];

  for (const day of days) {
    const dayOfWeek = new Date(day.date).getDay();
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-[2px]" style={{ minWidth: `${weeks.length * 14}px` }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[2px]">
            {week.map((day) => (
              <div
                key={day.date}
                className={cn('h-[11px] w-[11px] rounded-[2px]', levelColors[day.level])}
                title={`${day.date}: ${day.count} aula${day.count !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-[var(--bb-ink-40)]">
        <span>Menos</span>
        {levelColors.map((c, i) => (
          <div key={i} className={cn('h-[10px] w-[10px] rounded-[2px]', c)} />
        ))}
        <span>Mais</span>
      </div>
    </div>
  );
}

// ── Modality Distribution Bar ──────────────────────────────────────────

function ModalityBar({ distribution }: { distribution: ModalityDistributionDTO[] }) {
  return (
    <div className="space-y-2">
      {distribution.map((mod) => (
        <div key={mod.modality} className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: mod.color }} />
          <span className="flex-1 text-xs text-[var(--bb-ink-60)]">{mod.modality}</span>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--bb-depth-3)]">
            <div
              className="h-full rounded-full"
              style={{ width: `${mod.percentage}%`, backgroundColor: mod.color }}
            />
          </div>
          <span className="w-10 text-right text-xs font-medium text-[var(--bb-ink-60)]">{mod.percentage}%</span>
        </div>
      ))}
    </div>
  );
}

// ── Tab: Resumo ─────────────────────────────────────────────────────────

function TabResumo({ events }: { events: TimelineEventDTO[] }) {
  if (events.length === 0) {
    return <p className="py-8 text-center text-sm text-[var(--bb-ink-40)]">Nenhum evento registrado.</p>;
  }

  return (
    <div className="relative ml-4 border-l-2 border-[var(--bb-glass-border)] pl-6">
      {events.slice(0, 8).map((event) => (
        <div key={event.id} className="relative pb-8 last:pb-0">
          <div className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--bb-glass-border)] bg-[var(--bb-depth-3)] text-sm">
            {event.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--bb-ink-100)]">{event.title}</p>
            <p className="mt-0.5 text-xs text-[var(--bb-ink-40)]">{event.description}</p>
            <p className="mt-1 text-[10px] text-[var(--bb-ink-40)]">
              {new Date(event.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            {event.belt && (
              <Badge
                variant="belt"
                beltColor={BELT_COLOR_MAP[event.belt]}
                size="sm"
                className="mt-1"
              >
                {BELT_LABEL_MAP[event.belt]}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tab: Evolucao ──────────────────────────────────────────────────────

function TabEvolucao({ data }: { data: EvolutionDataDTO }) {
  const radarData = data.current_scores.map((s) => ({
    subject: s.label,
    score: s.score,
    fullMark: s.max_score,
  }));

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-[var(--bb-ink-100)]">Radar de Tecnicas</h3>
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#D4D4D4" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#737373' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#DC2626"
                fill="#DC2626"
                fillOpacity={0.25}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {data.current_scores.map((score) => (
            <div key={score.criteria} className="rounded-lg bg-[var(--bb-depth-3)] p-2 text-center">
              <p className="text-xs text-[var(--bb-ink-40)]">{score.label}</p>
              <p className="text-xl font-bold text-[var(--bb-ink-100)]">{score.score}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab: Presencas ─────────────────────────────────────────────────────

function TabPresencas({ data }: { data: AttendanceHeatmapDTO }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-[var(--bb-ink-100)]">{data.total_year}</p>
          <p className="text-[10px] text-[var(--bb-ink-40)]">Total no ano</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-[var(--bb-brand-primary)]">{data.current_streak}</p>
          <p className="text-[10px] text-[var(--bb-ink-40)]">Streak atual</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-[var(--bb-ink-100)]">{data.longest_streak}</p>
          <p className="text-[10px] text-[var(--bb-ink-40)]">Maior streak</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-[var(--bb-ink-100)]">{data.average_per_week}</p>
          <p className="text-[10px] text-[var(--bb-ink-40)]">Media/semana</p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-[var(--bb-ink-100)]">Mapa de Presencas (365 dias)</h3>
        <AttendanceHeatmapGrid days={data.days} />
      </Card>

      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-[var(--bb-ink-100)]">Distribuicao por Modalidade</h3>
        <ModalityBar distribution={data.distribution} />
      </Card>
    </div>
  );
}

// ── Tab: Financeiro ────────────────────────────────────────────────────

function TabFinanceiro({ data }: { data: FinanceiroPerfilDTO }) {
  return (
    <div className="space-y-4">
      {data.plan ? (
        <Card variant="elevated" className="border-l-4 border-bb-red p-4">
          <p className="text-xs font-semibold uppercase font-mono text-[var(--bb-ink-40)]">Plano Atual</p>
          <p className="mt-1 text-lg font-bold text-[var(--bb-ink-100)]">{data.plan.plan_name}</p>
          <div className="mt-1 flex items-center gap-3 text-sm text-[var(--bb-ink-60)]">
            <span>
              R$ {data.plan.price.toFixed(2).replace('.', ',')}/
              {data.plan.interval === 'monthly' ? 'mes' : data.plan.interval === 'quarterly' ? 'tri' : 'ano'}
            </span>
            <Badge variant="active" size="sm">
              {data.plan.status === 'active' ? 'Ativo' : data.plan.status}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-[var(--bb-ink-40)]">
            Proxima cobranca:{' '}
            {new Date(data.plan.current_period_end).toLocaleDateString('pt-BR')}
          </p>
        </Card>
      ) : (
        <Card className="p-4 text-center">
          <p className="text-[var(--bb-ink-40)]">Sem plano ativo.</p>
        </Card>
      )}

      {data.invoices.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-[var(--bb-ink-100)]">Faturas</h3>
          <div className="space-y-2">
            {data.invoices.map((inv) => {
              const statusInfo = INVOICE_STATUS_MAP[inv.status] ?? {
                label: inv.status,
                color: 'text-[var(--bb-ink-40)]',
              };
              return (
                <Card key={inv.id} variant="outlined" className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--bb-ink-100)]">{inv.description}</p>
                    <p className="text-xs text-[var(--bb-ink-40)]">
                      Vencimento: {new Date(inv.due_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--bb-ink-100)]">
                      R$ {inv.amount.toFixed(2).replace('.', ',')}
                    </p>
                    <p className={cn('text-xs font-medium', statusInfo.color)}>
                      {statusInfo.label}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Settings Section ───────────────────────────────────────────────────

function SettingsLinks() {
  const items = [
    { label: 'Notificacoes', description: 'Configurar alertas e avisos' },
    { label: 'Privacidade', description: 'Dados e permissoes' },
    { label: 'Ajuda', description: 'Central de suporte' },
  ];

  return (
    <Card className="divide-y divide-[var(--bb-glass-border)]">
      {items.map((item) => (
        <button
          key={item.label}
          className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[var(--bb-depth-1)]"
        >
          <div>
            <p className="text-sm font-medium text-[var(--bb-ink-100)]">{item.label}</p>
            <p className="text-xs text-[var(--bb-ink-40)]">{item.description}</p>
          </div>
          <svg
            className="h-4 w-4 text-[var(--bb-ink-40)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ))}
    </Card>
  );
}

// ── Profile Skeleton ───────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="card" className="h-48" />
      <div className="px-4">
        <div className="flex gap-2 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="text" className="h-8 w-24 flex-shrink-0" />
          ))}
        </div>
        <div className="mt-4 space-y-3">
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-24" />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function DashboardPerfilPage() {
  const { studentId, loading: studentIdLoading } = useStudentId();
  const [profile, setProfile] = useState<StudentProfileDTO | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('resumo');
  const [loading, setLoading] = useState(true);

  // Tab data states
  const [timeline, setTimeline] = useState<TimelineEventDTO[] | null>(null);
  const [evolution, setEvolution] = useState<EvolutionDataDTO | null>(null);
  const [heatmap, setHeatmap] = useState<AttendanceHeatmapDTO | null>(null);
  const [financeiro, setFinanceiro] = useState<FinanceiroPerfilDTO | null>(null);
  const [tabLoading, setTabLoading] = useState(false);

  // Load profile
  useEffect(() => {
    if (studentIdLoading) return;
    if (!studentId) {
      setLoading(false);
      return;
    }
    async function loadProfile() {
      try {
        const p = await getStudentProfile(studentId!);
        setProfile(p);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [studentId, studentIdLoading]);

  // Load tab data on demand
  const loadTabData = useCallback(
    async (tab: ProfileTab) => {
      setTabLoading(true);
      try {
        switch (tab) {
          case 'resumo':
            if (!timeline) {
              const data = await getJourneyTimeline(studentId!);
              setTimeline(data);
            }
            break;
          case 'evolucao':
            if (!evolution) {
              const data = await getEvolutionData(studentId!);
              setEvolution(data);
            }
            break;
          case 'presencas':
            if (!heatmap) {
              const data = await getAttendanceHeatmap(studentId!);
              setHeatmap(data);
            }
            break;
          case 'financeiro':
            if (!financeiro) {
              const data = await getFinanceiroPerfil(studentId!);
              setFinanceiro(data);
            }
            break;
        }
      } finally {
        setTabLoading(false);
      }
    },
    [timeline, evolution, heatmap, financeiro],
  );

  // Load first tab data when profile loads
  useEffect(() => {
    if (profile) {
      loadTabData('resumo');
    }
  }, [profile, loadTabData]);

  // Load data when tab changes
  const handleTabChange = useCallback(
    (tab: ProfileTab) => {
      setActiveTab(tab);
      loadTabData(tab);
    },
    [loadTabData],
  );

  if (loading) return <ProfileSkeleton />;
  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bb-depth-1)] p-4">
        <p className="text-4xl">👤</p>
        <h2 className="mt-4 text-lg font-bold text-[var(--bb-ink-100)]">Perfil indisponivel</h2>
        <p className="mt-1 text-sm text-[var(--bb-ink-40)]">Nao foi possivel carregar seus dados.</p>
      </div>
    );
  }

  const beltGradient = BELT_GRADIENT_MAP[profile.belt] ?? BELT_GRADIENT_MAP.white;
  const beltText = BELT_TEXT_MAP[profile.belt] ?? 'text-bb-black';

  return (
    <div className="pb-24">
      {/* ── Hero Header ───────────────────────────────────────── */}
      <div className={cn('relative bg-gradient-to-br px-4 pb-6 pt-8', beltGradient)}>
        <div className="flex items-center gap-4">
          <Avatar
            name={profile.display_name}
            src={profile.avatar_url}
            size="xl"
            className="ring-4 ring-white/30"
          />
          <div>
            <h1 className={cn('text-xl font-bold', beltText)}>{profile.display_name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="belt" beltColor={BELT_COLOR_MAP[profile.belt]} size="md">
                {BELT_LABEL_MAP[profile.belt]}
              </Badge>
              <span className={cn('text-sm font-medium', beltText)}>
                #{profile.ranking_position}
              </span>
            </div>
          </div>
        </div>
        {/* Stats strip */}
        <div className={cn('mt-4 flex items-center gap-2 text-sm', beltText)}>
          <span>{profile.total_classes} aulas</span>
          <span className="opacity-50">{'\u00B7'}</span>
          <span>{profile.months_training} meses</span>
          <span className="opacity-50">{'\u00B7'}</span>
          <span>Streak {profile.streak} {'\uD83D\uDD25'}</span>
          <span className="opacity-50">{'\u00B7'}</span>
          <span>Top #{profile.ranking_position}</span>
        </div>
      </div>

      {/* ── Tab Navigation ────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-[var(--bb-glass-border)] bg-[var(--bb-depth-1)]">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                'flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'border-[var(--bb-brand-primary)] text-[var(--bb-brand-primary)]'
                  : 'border-transparent text-[var(--bb-ink-40)] hover:text-[var(--bb-ink-80)]',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ───────────────────────────────────────── */}
      <div className="px-4 pt-4">
        {tabLoading ? (
          <div className="space-y-3">
            <Skeleton variant="card" className="h-32" />
            <Skeleton variant="card" className="h-24" />
          </div>
        ) : (
          <>
            {activeTab === 'resumo' && timeline && <TabResumo events={timeline} />}
            {activeTab === 'evolucao' && evolution && <TabEvolucao data={evolution} />}
            {activeTab === 'presencas' && heatmap && <TabPresencas data={heatmap} />}
            {activeTab === 'financeiro' && financeiro && <TabFinanceiro data={financeiro} />}
          </>
        )}
      </div>

      {/* ── Settings ──────────────────────────────────────────── */}
      <div className="mt-6 px-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider font-mono text-[var(--bb-ink-40)]">
          Configuracoes
        </h3>
        <SettingsLinks />
      </div>
    </div>
  );
}
