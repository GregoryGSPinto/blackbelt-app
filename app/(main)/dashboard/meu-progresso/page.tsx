'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { BeltBadge } from '@/components/ui/BeltBadge';
import { BeltProgress } from '@/components/ui/BeltProgress';
import { Skeleton } from '@/components/ui/Skeleton';
import { BeltLevel } from '@/lib/types';
import { BELT_ORDER, MIN_ATTENDANCE_FOR_PROMOTION } from '@/lib/types/constants';
import type { BeltColor } from '@/components/ui/BeltStripe';

// ── Inline SVG icons (project does not use lucide-react) ────────────

function SvgIcon({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      {children}
    </svg>
  );
}

function TrendingUpIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></SvgIcon>;
}

function FlameIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" /></SvgIcon>;
}

function CalendarIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></SvgIcon>;
}

function PlayIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><polygon points="5 3 19 12 5 21 5 3" /></SvgIcon>;
}

function BookOpenIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></SvgIcon>;
}

function AwardIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></SvgIcon>;
}

function ClockIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></SvgIcon>;
}

function TrophyIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0012 0V2Z" /></SvgIcon>;
}

function StarIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></SvgIcon>;
}

function TargetIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></SvgIcon>;
}

function ZapIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></SvgIcon>;
}

// ── Types ───────────────────────────────────────────────────────────

interface MyProfile {
  display_name: string;
  belt: BeltLevel;
  started_at: string;
  modality: string;
}

interface BeltCriteria {
  attendance: { current: number; required: number };
  months: { current: number; required: number };
  quiz: { current: number; required: number };
}

interface AttendanceData {
  total: number;
  avg_per_week: number;
  current_streak: number;
  heatmap: HeatmapDay[];
}

interface HeatmapDay {
  date: string;
  count: number;
}

interface StreamingData {
  videos_watched: number;
  series_completed: number;
  avg_quiz_score: number;
  hours_watched: number;
}

interface AchievementItem {
  id: string;
  icon: 'trophy' | 'star' | 'flame' | 'target' | 'zap';
  title: string;
  description: string;
  earned_at: string;
}

interface MyProgressData {
  profile: MyProfile;
  beltCriteria: BeltCriteria;
  attendance: AttendanceData;
  streaming: StreamingData;
  achievements: AchievementItem[];
}

// ── Belt helpers ────────────────────────────────────────────────────

const BELT_CSS_VAR: Record<string, string> = {
  white: 'var(--bb-belt-white)', gray: 'var(--bb-belt-gray)',
  yellow: 'var(--bb-belt-yellow)', orange: 'var(--bb-belt-orange)',
  green: 'var(--bb-belt-green)', blue: 'var(--bb-belt-blue)',
  purple: 'var(--bb-belt-purple)', brown: 'var(--bb-belt-brown)',
  black: 'var(--bb-belt-black)',
};

function getNextBelt(current: BeltLevel): BeltLevel {
  const idx = BELT_ORDER.indexOf(current);
  if (idx < 0 || idx >= BELT_ORDER.length - 1) return current;
  return BELT_ORDER[idx + 1];
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

// ── Heatmap generator ───────────────────────────────────────────────

function generateHeatmap(): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    let count = 0;
    if (!isWeekend) {
      const rand = Math.random();
      if (rand < 0.55) count = 1;
      else if (rand < 0.75) count = 2;
    }
    days.push({ date: d.toISOString().split('T')[0], count });
  }
  return days;
}

// ── Mock data ───────────────────────────────────────────────────────

function buildMockData(): MyProgressData {
  const belt = BeltLevel.Blue;
  const nextBelt = getNextBelt(belt);
  const required = MIN_ATTENDANCE_FOR_PROMOTION[nextBelt];

  return {
    profile: {
      display_name: 'Lucas Mendes',
      belt,
      started_at: '2023-03-15T00:00:00Z',
      modality: 'Jiu-Jitsu',
    },
    beltCriteria: {
      attendance: { current: 48, required },
      months: { current: 4, required: 6 },
      quiz: { current: 72, required: 70 },
    },
    attendance: {
      total: 187,
      avg_per_week: 3.2,
      current_streak: 12,
      heatmap: generateHeatmap(),
    },
    streaming: {
      videos_watched: 34,
      series_completed: 3,
      avg_quiz_score: 82,
      hours_watched: 18.5,
    },
    achievements: [
      { id: 'a-1', icon: 'flame', title: 'Sequencia de 10 dias', description: 'Treinou 10 dias seguidos', earned_at: '2026-03-05T00:00:00Z' },
      { id: 'a-2', icon: 'trophy', title: 'Faixa Azul', description: 'Conquistou a faixa azul', earned_at: '2025-09-20T00:00:00Z' },
      { id: 'a-3', icon: 'star', title: '150 aulas', description: 'Completou 150 aulas', earned_at: '2025-07-12T00:00:00Z' },
      { id: 'a-4', icon: 'target', title: 'Quiz Master', description: 'Nota acima de 90% em 5 quizzes', earned_at: '2025-05-28T00:00:00Z' },
      { id: 'a-5', icon: 'zap', title: '100 aulas', description: 'Completou 100 aulas', earned_at: '2024-10-01T00:00:00Z' },
    ],
  };
}

// ── Heatmap cell color ──────────────────────────────────────────────

function heatmapCellColor(count: number): string {
  if (count === 0) return 'var(--bb-depth-4)';
  if (count === 1) return 'rgba(239, 68, 68, 0.3)';
  return 'rgba(239, 68, 68, 0.7)';
}

// ── Achievement icon map ────────────────────────────────────────────

function achievementIcon(icon: AchievementItem['icon']): React.ReactNode {
  const props = { className: 'h-5 w-5' };
  switch (icon) {
    case 'trophy': return <TrophyIcon {...props} />;
    case 'star': return <StarIcon {...props} />;
    case 'flame': return <FlameIcon {...props} />;
    case 'target': return <TargetIcon {...props} />;
    case 'zap': return <ZapIcon {...props} />;
  }
}

function achievementColor(icon: AchievementItem['icon']): string {
  switch (icon) {
    case 'trophy': return 'var(--bb-warning)';
    case 'star': return 'var(--bb-brand)';
    case 'flame': return 'var(--bb-error)';
    case 'target': return 'var(--bb-info)';
    case 'zap': return 'var(--bb-success)';
  }
}

// ── Main ────────────────────────────────────────────────────────────

export default function MeuProgressoPage() {
  const [data, setData] = useState<MyProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(buildMockData());
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-4 p-4" data-stagger>
        <Skeleton variant="text" className="h-6 w-48" />
        <Skeleton variant="card" className="h-24" />
        <Skeleton variant="card" className="h-36" />
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-32" />
      </div>
    );
  }

  const { profile, beltCriteria, attendance, streaming, achievements } = data;
  const nextBelt = getNextBelt(profile.belt);
  const beltProgress = nextBelt !== profile.belt
    ? Math.round((beltCriteria.attendance.current / beltCriteria.attendance.required) * 100)
    : 100;

  return (
    <div className="space-y-4 p-4 animate-reveal">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
          style={{ background: BELT_CSS_VAR[profile.belt] }}
        >
          {getInitials(profile.display_name)}
        </div>
        <div>
          <h1
            className="text-lg font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Meu Progresso
          </h1>
          <div className="mt-0.5 flex items-center gap-2">
            <BeltBadge color={profile.belt as BeltColor} size="sm" />
            <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              {profile.modality}
            </span>
          </div>
        </div>
      </div>

      {/* ── Belt Progress ────────────────────────────────────── */}
      <Card className="p-4">
        <h2
          className="mb-3 text-sm font-semibold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Proxima Faixa
        </h2>

        <BeltProgress
          current={profile.belt as BeltColor}
          next={nextBelt as BeltColor}
          progress={beltProgress}
        />

        <div className="mt-4 grid grid-cols-3 gap-2">
          {/* Attendance */}
          <div
            className="rounded-[var(--bb-radius-sm)] p-3 text-center"
            style={{ background: 'var(--bb-depth-4)' }}
          >
            <p className="text-[11px]" style={{ color: 'var(--bb-ink-60)' }}>Presenca</p>
            <p className="mt-1 text-base font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {beltCriteria.attendance.current}
              <span className="text-xs font-normal" style={{ color: 'var(--bb-ink-40)' }}>
                /{beltCriteria.attendance.required}
              </span>
            </p>
            <div
              className="mx-auto mt-1.5 h-1 w-full overflow-hidden rounded-full"
              style={{ background: 'var(--bb-depth-5)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((beltCriteria.attendance.current / beltCriteria.attendance.required) * 100, 100)}%`,
                  background: 'var(--bb-brand)',
                }}
              />
            </div>
          </div>

          {/* Months */}
          <div
            className="rounded-[var(--bb-radius-sm)] p-3 text-center"
            style={{ background: 'var(--bb-depth-4)' }}
          >
            <p className="text-[11px]" style={{ color: 'var(--bb-ink-60)' }}>Tempo</p>
            <p className="mt-1 text-base font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {beltCriteria.months.current}
              <span className="text-xs font-normal" style={{ color: 'var(--bb-ink-40)' }}>
                /{beltCriteria.months.required}m
              </span>
            </p>
            <div
              className="mx-auto mt-1.5 h-1 w-full overflow-hidden rounded-full"
              style={{ background: 'var(--bb-depth-5)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((beltCriteria.months.current / beltCriteria.months.required) * 100, 100)}%`,
                  background: 'var(--bb-info)',
                }}
              />
            </div>
          </div>

          {/* Quiz */}
          <div
            className="rounded-[var(--bb-radius-sm)] p-3 text-center"
            style={{ background: 'var(--bb-depth-4)' }}
          >
            <p className="text-[11px]" style={{ color: 'var(--bb-ink-60)' }}>Quiz</p>
            <p className="mt-1 text-base font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {beltCriteria.quiz.current}%
            </p>
            <div
              className="mx-auto mt-1.5 h-1 w-full overflow-hidden rounded-full"
              style={{ background: 'var(--bb-depth-5)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((beltCriteria.quiz.current / beltCriteria.quiz.required) * 100, 100)}%`,
                  background: beltCriteria.quiz.current >= beltCriteria.quiz.required
                    ? 'var(--bb-success)' : 'var(--bb-warning)',
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ── Attendance ───────────────────────────────────────── */}
      <Card className="p-4">
        <h2
          className="mb-3 text-sm font-semibold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Frequencia
        </h2>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <div
            className="rounded-[var(--bb-radius-sm)] p-3 text-center"
            style={{ background: 'var(--bb-depth-4)' }}
          >
            <TrendingUpIcon className="mx-auto h-4 w-4" style={{ color: 'var(--bb-brand)' }} />
            <p className="mt-1.5 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {attendance.total}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>Total</p>
          </div>
          <div
            className="rounded-[var(--bb-radius-sm)] p-3 text-center"
            style={{ background: 'var(--bb-depth-4)' }}
          >
            <CalendarIcon className="mx-auto h-4 w-4" style={{ color: 'var(--bb-info)' }} />
            <p className="mt-1.5 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {attendance.avg_per_week}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>Media/sem</p>
          </div>
          <div
            className="rounded-[var(--bb-radius-sm)] p-3 text-center"
            style={{ background: 'var(--bb-depth-4)' }}
          >
            <FlameIcon className="mx-auto h-4 w-4" style={{ color: 'var(--bb-warning)' }} />
            <p className="mt-1.5 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {attendance.current_streak}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>Sequencia</p>
          </div>
        </div>

        {/* Heatmap */}
        <div>
          <p className="mb-2 text-[11px] font-medium" style={{ color: 'var(--bb-ink-60)' }}>
            Ultimas 12 semanas
          </p>
          <div className="flex flex-wrap gap-[3px]">
            {attendance.heatmap.map(day => (
              <div
                key={day.date}
                className="h-2.5 w-2.5 rounded-[2px]"
                style={{ background: heatmapCellColor(day.count) }}
                title={`${day.date}: ${day.count} aula${day.count !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[9px]" style={{ color: 'var(--bb-ink-40)' }}>
            <span>Menos</span>
            <div className="h-2 w-2 rounded-[2px]" style={{ background: 'var(--bb-depth-4)' }} />
            <div className="h-2 w-2 rounded-[2px]" style={{ background: 'rgba(239, 68, 68, 0.3)' }} />
            <div className="h-2 w-2 rounded-[2px]" style={{ background: 'rgba(239, 68, 68, 0.7)' }} />
            <span>Mais</span>
          </div>
        </div>
      </Card>

      {/* ── Streaming ────────────────────────────────────────── */}
      <Card className="p-4">
        <h2
          className="mb-3 text-sm font-semibold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Streaming
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <div
            className="rounded-[var(--bb-radius-sm)] p-3 text-center"
            style={{ background: 'var(--bb-depth-4)' }}
          >
            <PlayIcon className="mx-auto h-4 w-4" style={{ color: 'var(--bb-brand)' }} />
            <p className="mt-1 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {streaming.videos_watched}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>Videos</p>
          </div>
          <div
            className="rounded-[var(--bb-radius-sm)] p-3 text-center"
            style={{ background: 'var(--bb-depth-4)' }}
          >
            <BookOpenIcon className="mx-auto h-4 w-4" style={{ color: 'var(--bb-info)' }} />
            <p className="mt-1 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {streaming.series_completed}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>Series</p>
          </div>
          <div
            className="rounded-[var(--bb-radius-sm)] p-3 text-center"
            style={{ background: 'var(--bb-depth-4)' }}
          >
            <AwardIcon className="mx-auto h-4 w-4" style={{ color: 'var(--bb-success)' }} />
            <p className="mt-1 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {streaming.avg_quiz_score}%
            </p>
            <p className="text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>Quiz</p>
          </div>
          <div
            className="rounded-[var(--bb-radius-sm)] p-3 text-center"
            style={{ background: 'var(--bb-depth-4)' }}
          >
            <ClockIcon className="mx-auto h-4 w-4" style={{ color: 'var(--bb-warning)' }} />
            <p className="mt-1 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {streaming.hours_watched}h
            </p>
            <p className="text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>Assistidas</p>
          </div>
        </div>
      </Card>

      {/* ── Achievements ─────────────────────────────────────── */}
      <Card className="p-4">
        <h2
          className="mb-3 text-sm font-semibold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Conquistas
        </h2>

        <div className="space-y-2" data-stagger>
          {achievements.map(achievement => {
            const color = achievementColor(achievement.icon);
            return (
              <div
                key={achievement.id}
                className="flex items-center gap-3 rounded-[var(--bb-radius-sm)] px-3 py-2.5"
                style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ background: `${color}15`, color }}
                >
                  {achievementIcon(achievement.icon)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {achievement.title}
                  </p>
                  <p className="truncate text-[11px]" style={{ color: 'var(--bb-ink-60)' }}>
                    {achievement.description}
                  </p>
                </div>
                <span className="flex-shrink-0 text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                  {new Date(achievement.earned_at).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'short',
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
