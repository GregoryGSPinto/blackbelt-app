'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { Skeleton } from '@/components/ui/Skeleton';

// ────────────────────────────────────────────────────────────
// Inline mock data — all data self-contained
// ────────────────────────────────────────────────────────────

interface WeeklyChallenge {
  id: string;
  title: string;
  emoji: string;
  current: number;
  target: number;
  reward_xp: number;
}

interface RankingEntry {
  id: string;
  initials: string;
  name: string;
  xp: number;
  is_me: boolean;
}

interface Achievement {
  id: string;
  icon: string;
  name: string;
  unlocked: boolean;
  glow_color: string;
}

const MOCK_CHALLENGES: WeeklyChallenge[] = [
  { id: 'ch1', title: 'Treine 3x esta semana', emoji: '🥋', current: 2, target: 3, reward_xp: 50 },
  { id: 'ch2', title: 'Assista 2 vídeos', emoji: '🎬', current: 1, target: 2, reward_xp: 30 },
  { id: 'ch3', title: 'Quiz perfeito', emoji: '🧠', current: 0, target: 1, reward_xp: 40 },
];

const MOCK_RANKING: RankingEntry[] = [
  { id: 'r1', initials: 'ML', name: 'Marina Lima', xp: 2780, is_me: false },
  { id: 'r2', initials: 'PH', name: 'Pedro Henrique', xp: 2610, is_me: false },
  { id: 'r3', initials: 'LC', name: 'Lucas', xp: 2450, is_me: true },
  { id: 'r4', initials: 'AS', name: 'Ana Sofia', xp: 2320, is_me: false },
  { id: 'r5', initials: 'GR', name: 'Gabriel Reis', xp: 2180, is_me: false },
];

const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', icon: '🔥', name: 'Streak 7 dias', unlocked: true, glow_color: '#f97316' },
  { id: 'a2', icon: '🥇', name: 'Top 3 Ranking', unlocked: true, glow_color: '#eab308' },
  { id: 'a3', icon: '🎯', name: '10 Desafios', unlocked: true, glow_color: '#8b5cf6' },
  { id: 'a4', icon: '📚', name: '20 Vídeos', unlocked: false, glow_color: '#3b82f6' },
  { id: 'a5', icon: '🏆', name: 'Campeão Mensal', unlocked: false, glow_color: '#22c55e' },
  { id: 'a6', icon: '⚡', name: 'Level 20', unlocked: false, glow_color: '#06b6d4' },
];

const MOCK = {
  level: 15,
  xp_total: 2450,
  xp_next_level: 3000,
  xp_this_week: 180,
  streak_days: 5,
  ranking_position: 3,
  videos_watched: 8,
  video_continue: {
    title: 'Postura base e equilíbrio',
    progress_pct: 65,
    reward_xp: 5,
  },
  next_class: {
    name: 'Jiu-Jitsu Teen',
    time: 'Hoje 17:30',
    countdown_label: 'Em 2h 15min',
  },
};

// ────────────────────────────────────────────────────────────
// Medal colors for ranking
// ────────────────────────────────────────────────────────────
const MEDALS: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

export default function TeenDashboardPage() {
  const { profile } = useAuthContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const displayName = profile?.display_name ?? 'Guerreiro';
  const xpPercent = Math.round((MOCK.xp_total / MOCK.xp_next_level) * 100);

  // ─── Skeleton loading ───
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bb-depth-1)] p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton variant="card" className="h-48 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-24 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-40 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-56 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-32 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-20 bg-[var(--bb-depth-3)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      {/* ─── HERO: Greeting + Level + XP Bar ─── */}
      <section className="animate-reveal relative overflow-hidden px-4 pb-6 pt-8">
        {/* Vibrant background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(236,72,153,0.15) 50%, rgba(251,146,60,0.1) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bb-depth-1)]" />

        <div className="relative mx-auto max-w-lg text-center">
          <p className="text-sm font-semibold text-[var(--bb-ink-60)]">
            Fala,
          </p>
          <h1
            className="text-3xl font-extrabold"
            style={{
              background: 'linear-gradient(90deg, #a78bfa, #f472b6, #fb923c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {displayName}!
          </h1>

          {/* Level badge */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--bb-depth-3)] px-5 py-2 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
            <span className="text-lg">⚡</span>
            <span className="text-lg font-extrabold text-[var(--bb-ink-100)]">Level {MOCK.level}</span>
            <span className="text-sm text-[var(--bb-ink-60)]">&middot;</span>
            <span className="text-sm font-bold text-purple-400">{MOCK.xp_total.toLocaleString('pt-BR')} XP</span>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-[var(--bb-ink-60)]">
              <span className="font-bold text-[var(--bb-ink-80)]">
                {MOCK.xp_total.toLocaleString('pt-BR')} XP
              </span>
              <span>Level {MOCK.level + 1} &middot; {MOCK.xp_next_level.toLocaleString('pt-BR')} XP</span>
            </div>
            <div className="mt-1.5 h-4 overflow-hidden rounded-full bg-[var(--bb-depth-3)] shadow-inner ring-1 ring-[var(--bb-glass-border)]">
              <div
                className="flex h-full items-center justify-end rounded-full pr-2 transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.max(xpPercent, 8)}%`,
                  background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #f97316)',
                }}
              >
                <span className="text-[10px] font-bold text-white drop-shadow">
                  {xpPercent}%
                </span>
              </div>
            </div>
            <p className="mt-1 text-center text-xs text-[var(--bb-ink-40)]">
              Faltam {(MOCK.xp_next_level - MOCK.xp_total).toLocaleString('pt-BR')} XP para o Level {MOCK.level + 1}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-lg space-y-5 px-4" data-stagger>
        {/* ─── STATS GRID ─── */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'XP esta semana', value: MOCK.xp_this_week, icon: '🔥', color: 'from-orange-500/20 to-red-500/10', text_color: 'text-orange-400' },
            { label: 'Streak', value: `${MOCK.streak_days} dias`, icon: '⚡', color: 'from-yellow-500/20 to-amber-500/10', text_color: 'text-yellow-400' },
            { label: 'Ranking', value: `#${MOCK.ranking_position}`, icon: '🏆', color: 'from-purple-500/20 to-indigo-500/10', text_color: 'text-purple-400' },
            { label: 'Vídeos', value: MOCK.videos_watched, icon: '🎬', color: 'from-blue-500/20 to-cyan-500/10', text_color: 'text-blue-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl bg-gradient-to-br ${stat.color} p-4 ring-1 ring-[var(--bb-glass-border)] shadow-[var(--bb-shadow-sm)]`}
            >
              <span className="text-2xl">{stat.icon}</span>
              <p className={`mt-1 text-xl font-extrabold ${stat.text_color}`}>{stat.value}</p>
              <p className="text-[11px] font-medium text-[var(--bb-ink-60)]">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* ─── DESAFIOS SEMANAIS ─── */}
        <section className="rounded-2xl bg-[var(--bb-depth-3)] p-5 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-60)]">
            <span>🎯</span> Desafios Semanais
          </h2>
          <div className="space-y-4">
            {MOCK_CHALLENGES.map((ch) => {
              const pct = Math.round((ch.current / ch.target) * 100);
              const isComplete = ch.current >= ch.target;
              return (
                <div key={ch.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{ch.emoji}</span>
                      <span className={`text-sm font-semibold ${isComplete ? 'text-[var(--bb-success)] line-through' : 'text-[var(--bb-ink-100)]'}`}>
                        {ch.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--bb-ink-60)]">
                        {ch.current}/{ch.target}
                      </span>
                      <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-400">
                        +{ch.reward_xp} XP
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--bb-depth-4)]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(pct, 3)}%`,
                        background: isComplete
                          ? 'var(--bb-success)'
                          : 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── RANKING DA TURMA ─── */}
        <section className="rounded-2xl bg-[var(--bb-depth-3)] p-5 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-60)]">
            <span>🏆</span> Ranking da Turma
          </h2>
          <div className="space-y-2">
            {MOCK_RANKING.map((entry, idx) => (
              <div
                key={entry.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  entry.is_me
                    ? 'ring-2 ring-purple-500/50 shadow-[var(--bb-shadow-sm)]'
                    : ''
                }`}
                style={{
                  background: entry.is_me
                    ? 'linear-gradient(90deg, rgba(139,92,246,0.15), rgba(236,72,153,0.08))'
                    : 'var(--bb-depth-4)',
                }}
              >
                {/* Position or medal */}
                <span className="w-8 text-center text-lg font-extrabold">
                  {MEDALS[idx] ?? `#${idx + 1}`}
                </span>
                {/* Initials avatar */}
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    background: entry.is_me
                      ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                      : 'linear-gradient(135deg, var(--bb-ink-40), var(--bb-ink-60))',
                  }}
                >
                  {entry.initials}
                </div>
                {/* Name */}
                <span className={`flex-1 text-sm font-semibold ${entry.is_me ? 'text-[var(--bb-ink-100)]' : 'text-[var(--bb-ink-80)]'}`}>
                  {entry.is_me ? 'VOCE' : entry.name}
                </span>
                {/* XP */}
                <span
                  className="text-sm font-bold"
                  style={{
                    background: 'linear-gradient(90deg, #a78bfa, #f472b6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {entry.xp.toLocaleString('pt-BR')} XP
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CONTINUAR ASSISTINDO ─── */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-60)]">
            <span>▶️</span> Continuar Assistindo
          </h2>
          <Link href="/teen/conteudo">
            <div className="group rounded-2xl bg-[var(--bb-depth-3)] p-4 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)] transition-all hover:ring-purple-500/40">
              <div className="flex items-center gap-4">
                {/* Video thumbnail */}
                <div
                  className="flex h-20 w-28 flex-shrink-0 items-center justify-center rounded-xl text-3xl transition-transform group-hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #302b63 50%, #0f3460 100%)',
                  }}
                >
                  🥋
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[var(--bb-ink-100)]">
                    {MOCK.video_continue.title}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--bb-depth-4)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${MOCK.video_continue.progress_pct}%`,
                        background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[var(--bb-ink-40)]">
                    {MOCK.video_continue.progress_pct}% concluido
                  </p>
                </div>
                {/* XP reward badge */}
                <div
                  className="flex flex-col items-center rounded-xl px-3 py-2"
                  style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.15))' }}
                >
                  <span className="text-xs font-extrabold text-purple-400">+{MOCK.video_continue.reward_xp}</span>
                  <span className="text-[10px] font-bold text-purple-300">XP</span>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* ─── CONQUISTAS ─── */}
        <section className="rounded-2xl bg-[var(--bb-depth-3)] p-5 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-60)]">
            <span>🎖️</span> Conquistas
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {MOCK_ACHIEVEMENTS.map((ach) => (
              <div
                key={ach.id}
                className={`flex flex-col items-center rounded-2xl p-4 transition-all ${
                  ach.unlocked
                    ? 'bg-[var(--bb-depth-4)]'
                    : 'bg-[var(--bb-depth-4)]/40 opacity-40 grayscale'
                }`}
                style={
                  ach.unlocked
                    ? {
                        boxShadow: `0 0 20px ${ach.glow_color}40, 0 0 40px ${ach.glow_color}15`,
                        border: `1px solid ${ach.glow_color}30`,
                      }
                    : { border: '1px solid var(--bb-glass-border)' }
                }
              >
                <span className={`text-3xl ${ach.unlocked ? 'animate-fire-flicker' : ''}`}>
                  {ach.icon}
                </span>
                <p className="mt-2 text-center text-[11px] font-semibold text-[var(--bb-ink-80)]">
                  {ach.name}
                </p>
                {!ach.unlocked && (
                  <span className="mt-1 text-[10px] text-[var(--bb-ink-40)]">🔒</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── PROXIMA AULA ─── */}
        <section
          className="overflow-hidden rounded-2xl shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(16,185,129,0.08))',
          }}
        >
          <div
            className="px-5 py-2"
            style={{ background: 'linear-gradient(90deg, #22c55e, #10b981)' }}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-white/90">
              Proxima Aula
            </p>
          </div>
          <div className="flex items-center gap-4 p-5">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
              style={{ background: 'rgba(34,197,94,0.15)' }}
            >
              🥋
            </div>
            <div className="flex-1">
              <p className="text-lg font-extrabold text-[var(--bb-ink-100)]">
                {MOCK.next_class.name}
              </p>
              <p className="text-sm text-[var(--bb-ink-60)]">
                {MOCK.next_class.time}
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-lg font-extrabold"
                style={{
                  background: 'linear-gradient(90deg, #22c55e, #10b981)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {MOCK.next_class.countdown_label}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
