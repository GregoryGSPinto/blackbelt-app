'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

// ── Types ──────────────────────────────────────────────────────────────

interface StatCard {
  label: string;
  value: string;
  sublabel: string;
  icon: string;
}

interface NextClass {
  id: string;
  time: string;
  name: string;
  professor: string;
  weekday: string;
}

interface ContinueWatching {
  id: string;
  title: string;
  thumbnail_label: string;
  progress_pct: number;
  watched_min: number;
  total_min: number;
}

interface BeltRequirement {
  label: string;
  current: number;
  target: number;
}

interface Achievement {
  id: string;
  icon: string;
  name: string;
  unlocked: boolean;
}

interface HeatmapMonth {
  label: string;
  year: number;
  days: number;
  present: number[];
}

interface MensalidadeStatus {
  month_label: string;
  status: 'em_dia' | 'pendente';
  due_date: string;
  value: string;
}

interface DashboardData {
  belt: string;
  belt_label: string;
  stats: StatCard[];
  next_classes: NextClass[];
  continue_watching: ContinueWatching;
  belt_progress: {
    current: string;
    current_label: string;
    next: string;
    next_label: string;
    pct: number;
    requirements: BeltRequirement[];
  };
  heatmap: HeatmapMonth[];
  achievements: Achievement[];
  mensalidade: MensalidadeStatus;
}

// ── Belt Colors ────────────────────────────────────────────────────────

const BELT_COLORS: Record<string, string> = {
  white: '#f5f5f5',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  brown: '#92400e',
  black: '#1f2937',
};

const BELT_TEXT_ON: Record<string, string> = {
  white: 'var(--bb-ink-100)',
  blue: '#ffffff',
  purple: '#ffffff',
  brown: '#ffffff',
  black: '#ffffff',
};

// ── Greeting helper ────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

// ── Mock Data ──────────────────────────────────────────────────────────

const MOCK_DATA: DashboardData = {
  belt: 'blue',
  belt_label: 'Azul',
  stats: [
    { label: 'Presencas', value: '18', sublabel: 'este mes', icon: 'calendar' },
    { label: 'Streak', value: '5', sublabel: 'dias seguidos', icon: 'fire' },
    { label: 'Videos', value: '12', sublabel: 'assistidos', icon: 'play' },
    { label: 'Quiz', value: '85%', sublabel: 'score medio', icon: 'brain' },
  ],
  next_classes: [
    { id: 'c1', time: '19:00', name: 'Jiu-Jitsu Avancado', professor: 'Prof. Ricardo', weekday: 'Hoje' },
    { id: 'c2', time: '07:30', name: 'Muay Thai', professor: 'Prof. Ana', weekday: 'Amanha' },
    { id: 'c3', time: '19:00', name: 'Jiu-Jitsu Fundamentos', professor: 'Prof. Ricardo', weekday: 'Quarta' },
  ],
  continue_watching: {
    id: 'v1',
    title: 'Passagem de Guarda - Conceitos Avancados',
    thumbnail_label: 'Jiu-Jitsu',
    progress_pct: 60,
    watched_min: 18,
    total_min: 30,
  },
  belt_progress: {
    current: 'blue',
    current_label: 'Azul',
    next: 'purple',
    next_label: 'Roxa',
    pct: 72,
    requirements: [
      { label: 'Presencas', current: 85, target: 120 },
      { label: 'Tempo de faixa', current: 5, target: 6 },
      { label: 'Quiz aprovacao', current: 82, target: 70 },
    ],
  },
  heatmap: [
    {
      label: 'Jan',
      year: 2026,
      days: 31,
      present: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
    },
    {
      label: 'Fev',
      year: 2026,
      days: 28,
      present: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27],
    },
    {
      label: 'Mar',
      year: 2026,
      days: 31,
      present: [2, 4, 6, 9, 11, 13, 15, 17],
    },
  ],
  achievements: [
    { id: 'a1', icon: 'first-class', name: 'Primeira Aula', unlocked: true },
    { id: 'a2', icon: 'week-streak', name: 'Semana Perfeita', unlocked: true },
    { id: 'a3', icon: 'month-streak', name: 'Mes Consistente', unlocked: true },
    { id: 'a4', icon: 'video-watcher', name: 'Estudioso', unlocked: true },
    { id: 'a5', icon: 'quiz-master', name: 'Mestre dos Quizzes', unlocked: false },
    { id: 'a6', icon: 'centurion', name: 'Centuriao (100 aulas)', unlocked: false },
  ],
  mensalidade: {
    month_label: 'Marco 2026',
    status: 'em_dia',
    due_date: '10/03/2026',
    value: 'R$ 189,90',
  },
};

// ── Achievement Icon SVGs ──────────────────────────────────────────────

function AchievementIcon({ type, unlocked }: { type: string; unlocked: boolean }) {
  const color = unlocked ? 'var(--bb-brand)' : 'var(--bb-ink-20)';
  const size = 28;

  const icons: Record<string, React.ReactNode> = {
    'first-class': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
    'week-streak': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    'month-streak': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M9 16l2 2 4-4" />
      </svg>
    ),
    'video-watcher': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
    'quiz-master': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        <path d="M9 10l2 2 4-4" />
      </svg>
    ),
    'centurion': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  };

  return <>{icons[type] ?? icons['first-class']}</>;
}

// ── Stat Icon SVGs ─────────────────────────────────────────────────────

function StatIcon({ type }: { type: string }) {
  const color = 'var(--bb-brand)';
  const icons: Record<string, React.ReactNode> = {
    calendar: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    fire: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
      </svg>
    ),
    play: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
    brain: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 014 4c0 1.1-.9 2-2 2h-4a2 2 0 01-2-2 4 4 0 014-4z" />
        <path d="M12 8v14" />
        <path d="M8 12h8" />
        <path d="M9 16h6" />
      </svg>
    ),
  };

  return <>{icons[type] ?? icons['calendar']}</>;
}

// ── HeatmapCalendar Component ──────────────────────────────────────────

function HeatmapCalendar({ months }: { months: HeatmapMonth[] }) {
  return (
    <div className="space-y-3">
      {months.map((month) => {
        const presentSet = new Set(month.present);
        return (
          <div key={`${month.label}-${month.year}`}>
            <p className="mb-1 text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
              {month.label} {month.year}
            </p>
            <div className="flex flex-wrap gap-[3px]">
              {Array.from({ length: month.days }, (_, i) => {
                const day = i + 1;
                const isPresent = presentSet.has(day);
                return (
                  <div
                    key={day}
                    className="rounded-sm"
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: isPresent ? 'var(--bb-brand)' : 'var(--bb-depth-4)',
                      opacity: isPresent ? 1 : 0.5,
                    }}
                    title={`${day} ${month.label}: ${isPresent ? 'Presente' : ''}`}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Dashboard Skeleton ─────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-4 pb-24">
      {/* Greeting skeleton */}
      <div className="space-y-2">
        <Skeleton variant="text" className="h-8 w-3/4" />
        <Skeleton variant="text" className="h-6 w-1/3" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton variant="card" className="h-24" />
        <Skeleton variant="card" className="h-24" />
        <Skeleton variant="card" className="h-24" />
        <Skeleton variant="card" className="h-24" />
      </div>

      {/* Next classes */}
      <Skeleton variant="card" className="h-40" />

      {/* Continue watching */}
      <Skeleton variant="card" className="h-24" />

      {/* Belt progress */}
      <Skeleton variant="card" className="h-36" />

      {/* Heatmap */}
      <Skeleton variant="card" className="h-32" />

      {/* Achievements */}
      <Skeleton variant="card" className="h-28" />

      {/* Mensalidade */}
      <Skeleton variant="card" className="h-20" />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function StudentDashboardPage() {
  const { profile } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const firstName = useMemo(() => {
    const name = profile?.display_name ?? 'Aluno';
    return name.split(' ')[0];
  }, [profile?.display_name]);

  useEffect(() => {
    // Simulate async load with mock data
    const timer = setTimeout(() => {
      setData(MOCK_DATA);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !data) return <DashboardSkeleton />;

  const beltBg = BELT_COLORS[data.belt] ?? BELT_COLORS.white;
  const beltText = BELT_TEXT_ON[data.belt] ?? 'var(--bb-ink-100)';

  return (
    <div className="space-y-5 p-4 pb-24" data-stagger>
      {/* ── Greeting + Belt Badge ──────────────────────────────── */}
      <section className="animate-reveal">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h1
              className="text-2xl font-bold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              {getGreeting()}, {firstName}
            </h1>
          </div>
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{
              backgroundColor: beltBg,
              color: beltText,
              border: data.belt === 'white' ? '1px solid var(--bb-glass-border)' : 'none',
            }}
          >
            <div
              className="h-3 w-8 rounded-sm"
              style={{
                backgroundColor: beltBg,
                boxShadow: data.belt === 'white'
                  ? 'inset 0 0 0 1px var(--bb-ink-20)'
                  : `inset 0 0 0 1px rgba(255,255,255,0.3)`,
              }}
            />
            <span className="text-xs font-bold uppercase tracking-wide">
              {data.belt_label}
            </span>
          </div>
        </div>
      </section>

      {/* ── Stats: 4 Cards ─────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-2 gap-3">
          {data.stats.map((stat, i) => (
            <Card
              key={stat.label}
              className="p-3"
              style={{ animationDelay: `${(i + 1) * 0.05}s` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: 'var(--bb-ink-100)' }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="mt-0.5 text-xs font-medium"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ color: 'var(--bb-ink-40)' }}
                  >
                    {stat.sublabel}
                  </p>
                </div>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'var(--bb-brand-surface)' }}
                >
                  <StatIcon type={stat.icon} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Proximas Aulas ─────────────────────────────────────── */}
      <section className="animate-reveal" style={{ animationDelay: '0.15s' }}>
        <h2
          className="mb-3 text-sm font-semibold uppercase tracking-wider"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          Proximas Aulas
        </h2>
        <div className="space-y-2">
          {data.next_classes.map((cls) => (
            <Card key={cls.id} className="flex items-center gap-3 p-3">
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                style={{
                  background: 'var(--bb-brand-gradient)',
                  color: '#ffffff',
                }}
              >
                {cls.time}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="truncate text-sm font-semibold"
                  style={{ color: 'var(--bb-ink-100)' }}
                >
                  {cls.name}
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--bb-ink-40)' }}
                >
                  {cls.professor}
                </p>
              </div>
              <span
                className="flex-shrink-0 text-xs font-medium"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                {cls.weekday}
              </span>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Continuar Assistindo ───────────────────────────────── */}
      <section className="animate-reveal" style={{ animationDelay: '0.2s' }}>
        <div className="mb-3 flex items-center justify-between">
          <h2
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            Continuar Assistindo
          </h2>
          <Link
            href="/dashboard/conteudo"
            className="text-xs font-medium hover:underline"
            style={{ color: 'var(--bb-brand)' }}
          >
            Ver tudo
          </Link>
        </div>
        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-16 w-24 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--bb-depth-4) 0%, var(--bb-depth-5) 100%)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-60)',
              }}
            >
              {data.continue_watching.thumbnail_label}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="truncate text-sm font-semibold"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                {data.continue_watching.title}
              </p>
              <div className="mt-2 overflow-hidden rounded-full" style={{ height: 6, backgroundColor: 'var(--bb-depth-4)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${data.continue_watching.progress_pct}%`,
                    background: 'var(--bb-brand-gradient)',
                  }}
                />
              </div>
              <p
                className="mt-1 text-[10px]"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                {data.continue_watching.watched_min}min de {data.continue_watching.total_min}min ({data.continue_watching.progress_pct}%)
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Minha Evolucao (Belt Progress) ─────────────────────── */}
      <section className="animate-reveal" style={{ animationDelay: '0.25s' }}>
        <h2
          className="mb-3 text-sm font-semibold uppercase tracking-wider"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          Minha Evolucao
        </h2>
        <Card className="p-4">
          {/* Current → Next */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold"
              style={{
                backgroundColor: BELT_COLORS[data.belt_progress.current],
                color: BELT_TEXT_ON[data.belt_progress.current],
                border: data.belt_progress.current === 'white' ? '1px solid var(--bb-glass-border)' : 'none',
              }}
            >
              {data.belt_progress.current_label}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bb-ink-40)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold"
              style={{
                backgroundColor: BELT_COLORS[data.belt_progress.next],
                color: BELT_TEXT_ON[data.belt_progress.next],
              }}
            >
              {data.belt_progress.next_label}
            </span>
            <span
              className="ml-auto text-xl font-bold"
              style={{ color: 'var(--bb-brand)' }}
            >
              {data.belt_progress.pct}%
            </span>
          </div>

          {/* Main progress bar */}
          <div
            className="overflow-hidden rounded-full"
            style={{ height: 10, backgroundColor: 'var(--bb-depth-4)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${data.belt_progress.pct}%`,
                backgroundColor: BELT_COLORS[data.belt_progress.next],
              }}
            />
          </div>

          {/* Requirements */}
          <div className="mt-4 space-y-2.5">
            {data.belt_progress.requirements.map((req) => {
              const pct = Math.min(100, Math.round((req.current / req.target) * 100));
              const met = req.current >= req.target;
              return (
                <div key={req.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: met ? 'var(--bb-success)' : 'var(--bb-ink-60)' }}>
                      {met ? '\u2713 ' : ''}{req.label}
                    </span>
                    <span
                      className="font-mono"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      {req.current}/{req.target}{req.label === 'Tempo de faixa' ? ' meses' : req.label === 'Quiz aprovacao' ? '%' : ''}
                    </span>
                  </div>
                  <div
                    className="overflow-hidden rounded-full"
                    style={{ height: 4, backgroundColor: 'var(--bb-depth-4)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: met ? 'var(--bb-success)' : 'var(--bb-brand)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* ── Mini Heatmap Calendar (3 months) ───────────────────── */}
      <section className="animate-reveal" style={{ animationDelay: '0.3s' }}>
        <h2
          className="mb-3 text-sm font-semibold uppercase tracking-wider"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          Presencas
        </h2>
        <Card className="p-4">
          <HeatmapCalendar months={data.heatmap} />
          <div className="mt-3 flex items-center gap-3 text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: 'var(--bb-brand)' }} />
              <span>Presente</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: 'var(--bb-depth-4)', opacity: 0.5 }} />
              <span>Ausente</span>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Conquistas ─────────────────────────────────────────── */}
      <section className="animate-reveal" style={{ animationDelay: '0.35s' }}>
        <h2
          className="mb-3 text-sm font-semibold uppercase tracking-wider"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          Conquistas
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {data.achievements.map((ach) => (
            <Card
              key={ach.id}
              className={cn(
                'flex flex-col items-center justify-center p-3 text-center',
                !ach.unlocked && 'opacity-40',
              )}
              style={{
                border: ach.unlocked
                  ? '1px solid var(--bb-brand)'
                  : '1px solid var(--bb-glass-border)',
              }}
            >
              <AchievementIcon type={ach.icon} unlocked={ach.unlocked} />
              <p
                className="mt-1.5 text-[10px] font-medium leading-tight"
                style={{ color: ach.unlocked ? 'var(--bb-ink-100)' : 'var(--bb-ink-40)' }}
              >
                {ach.name}
              </p>
              {!ach.unlocked && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--bb-ink-40)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-1"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* ── Mensalidade ────────────────────────────────────────── */}
      <section className="animate-reveal" style={{ animationDelay: '0.4s' }}>
        <h2
          className="mb-3 text-sm font-semibold uppercase tracking-wider"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          Mensalidade
        </h2>
        <Card
          className="flex items-center gap-3 p-4"
          style={{
            borderLeft: `4px solid ${data.mensalidade.status === 'em_dia' ? 'var(--bb-success)' : 'var(--bb-warning)'}`,
          }}
        >
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundColor: data.mensalidade.status === 'em_dia'
                ? 'var(--bb-success-surface)'
                : 'var(--bb-warning-surface)',
            }}
          >
            {data.mensalidade.status === 'em_dia' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--bb-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--bb-warning)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              {data.mensalidade.month_label}
            </p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              {data.mensalidade.status === 'em_dia' ? 'Em dia' : 'Pendente'} &middot; Vencimento: {data.mensalidade.due_date}
            </p>
          </div>
          <span
            className="flex-shrink-0 text-sm font-bold"
            style={{
              color: data.mensalidade.status === 'em_dia' ? 'var(--bb-success)' : 'var(--bb-warning)',
            }}
          >
            {data.mensalidade.value}
          </span>
        </Card>
      </section>
    </div>
  );
}
