'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTeenDashboard } from '@/lib/api/teen.service';
import type { TeenDashboardDTO } from '@/lib/api/teen.service';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';

// ────────────────────────────────────────────────────────────
// Belt border color map
// ────────────────────────────────────────────────────────────
const BELT_RING_COLORS: Record<string, string> = {
  white: 'ring-gray-200',
  gray: 'ring-gray-400',
  yellow: 'ring-yellow-400',
  orange: 'ring-orange-500',
  green: 'ring-green-500',
  blue: 'ring-blue-500',
  purple: 'ring-purple-500',
  brown: 'ring-amber-700',
  black: 'ring-gray-900',
};

export default function TeenDashboardPage() {
  const [data, setData] = useState<TeenDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = await getTeenDashboard('stu-teen-lucas');
        setData(d);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bb-depth-1)] p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton variant="card" className="h-52 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-28 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-36 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-48 bg-[var(--bb-depth-3)]" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const xpPercent = Math.round((data.xp / data.next_level_xp) * 100);
  const ringColor = BELT_RING_COLORS[data.profile.belt] ?? 'ring-gray-400';

  return (
    <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      {/* ─── HERO: Avatar + XP Bar ─── */}
      <section className="relative overflow-hidden px-4 pb-6 pt-8">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bb-brand-primary)]/20 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-lg text-center">
          {/* Avatar with belt-colored ring */}
          <div className={`mx-auto inline-block rounded-full p-1 ring-4 ${ringColor}`}>
            <Avatar name={data.profile.display_name} size="xl" />
          </div>

          <h1 className="mt-3 text-2xl font-extrabold text-[var(--bb-ink-100)]">
            {data.profile.display_name}
          </h1>
          <p className="text-sm text-[var(--bb-ink-60)]">
            Level {data.level} &middot; {data.profile.title}
          </p>
          {data.profile.bio && (
            <p className="mt-1 text-xs italic text-[var(--bb-ink-40)]">&ldquo;{data.profile.bio}&rdquo;</p>
          )}

          {/* XP Bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-[var(--bb-ink-60)]">
              <span className="font-bold text-[var(--bb-ink-100)]">
                {data.xp.toLocaleString('pt-BR')} XP
              </span>
              <span>{data.next_level_xp.toLocaleString('pt-BR')} XP</span>
            </div>
            <div className="mt-1.5 h-4 overflow-hidden rounded-full bg-[var(--bb-depth-3)] shadow-inner">
              <div
                className="flex h-full items-center justify-end rounded-full bg-gradient-to-r from-bb-red-500 via-orange-500 to-yellow-400 pr-2 transition-all duration-700"
                style={{ width: `${Math.max(xpPercent, 8)}%` }}
              >
                <span className="text-[10px] font-bold text-white drop-shadow">
                  {xpPercent}%
                </span>
              </div>
            </div>
            <p className="mt-1 text-center text-xs text-[var(--bb-ink-40)]">
              {data.profile.display_name} &middot; Level {data.level} &middot;{' '}
              {data.xp.toLocaleString('pt-BR')}/{data.next_level_xp.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-lg space-y-5 px-4">
        {/* ─── STREAK ─── */}
        {data.streak.is_active && data.streak.current_days > 3 && (
          <section className="rounded-2xl bg-gradient-to-r from-orange-600/30 to-red-600/30 p-4 ring-1 ring-orange-500/30">
            <div className="flex items-center gap-3">
              <span className="animate-pulse text-4xl">🔥</span>
              <div>
                <p className="text-lg font-extrabold text-orange-300">
                  {data.streak.current_days} dias seguidos!
                </p>
                <p className="text-xs text-orange-200/70">
                  Recorde pessoal: {data.streak.best_ever} dias &middot; Não quebre o streak!
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ─── ACTIVE CHALLENGE ─── */}
        {data.active_challenge && (
          <section className="rounded-2xl bg-gradient-to-br from-indigo-900/60 to-purple-900/40 p-5 ring-1 ring-indigo-500/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  Desafio Ativo
                </p>
                <h2 className="mt-1 text-lg font-extrabold text-[var(--bb-ink-100)]">
                  {data.active_challenge.emoji} {data.active_challenge.title}
                </h2>
              </div>
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300">
                +{data.active_challenge.reward_xp} XP
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-[var(--bb-ink-60)]">
                <span>
                  {data.active_challenge.progress}/{data.active_challenge.target}
                </span>
                <span>Faltam {data.active_challenge.target - data.active_challenge.progress} em {data.active_challenge.days_remaining} dias!</span>
              </div>
              <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-[var(--bb-depth-3)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                  style={{
                    width: `${(data.active_challenge.progress / data.active_challenge.target) * 100}%`,
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {/* ─── RANKING ─── */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-60)]">
            <span>🏆</span> Ranking
          </h2>
          <div className="space-y-2">
            {data.ranking.map((entry) => {
              const isMe = entry.is_current_user;
              const medalEmojis: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
              return (
                <div
                  key={entry.student_id}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    isMe
                      ? 'bg-gradient-to-r from-bb-red-500/20 to-orange-500/10 ring-1 ring-bb-red-500/40'
                      : 'bg-[var(--bb-depth-3)]'
                  }`}
                >
                  <span className="w-8 text-center text-base font-extrabold">
                    {medalEmojis[entry.rank] ?? `#${entry.rank}`}
                  </span>
                  <Avatar name={entry.display_name} size="sm" />
                  <span
                    className={`flex-1 text-sm font-semibold ${
                      isMe ? 'text-[var(--bb-ink-100)]' : 'text-[var(--bb-ink-80)]'
                    }`}
                  >
                    {isMe ? 'VOCÊ' : entry.display_name}
                  </span>
                  <span className="text-sm font-bold text-yellow-400">
                    {entry.xp.toLocaleString('pt-BR')}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── VIDEOS — +XP ─── */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-60)]">
            <span>🎮</span> Vídeos — +XP
          </h2>
          <Link href="/teen/conteudo">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-900/60 to-purple-900/40 p-4 ring-1 ring-indigo-500/20 transition-all hover:ring-indigo-500/40">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-16 w-24 flex-shrink-0 items-center justify-center rounded-xl text-3xl"
                  style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
                >
                  🥋
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[var(--bb-ink-100)]">Postura base e equilíbrio</p>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--bb-depth-3)]">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                  </div>
                  <p className="mt-1 text-xs text-indigo-300">+30 XP ao completar</p>
                </div>
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300">
                  +30 XP
                </span>
              </div>
              <p className="mt-3 text-xs text-[var(--bb-ink-40)]">
                Desafio: 3 vídeos esta semana (1/3)
              </p>
            </div>
          </Link>
        </section>

        {/* ─── ACHIEVEMENTS (glowing badges) ─── */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-60)]">
            <span>🎖️</span> Conquistas
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {data.achievements.map((ach) => (
              <div
                key={ach.id}
                className={`flex flex-shrink-0 flex-col items-center rounded-2xl p-4 transition-all ${
                  ach.unlocked
                    ? 'bg-[var(--bb-depth-3)] shadow-lg'
                    : 'bg-[var(--bb-depth-3)]/30 opacity-40 grayscale'
                }`}
                style={
                  ach.unlocked
                    ? { boxShadow: `0 0 20px ${ach.glow_color}40, 0 0 60px ${ach.glow_color}15` }
                    : undefined
                }
              >
                <span className="text-3xl">{ach.icon}</span>
                <p className="mt-1.5 max-w-[5rem] text-center text-[10px] font-semibold text-[var(--bb-ink-80)]">
                  {ach.name}
                </p>
              </div>
            ))}
          </div>

          {/* Next achievement progress */}
          {data.next_achievement && (
            <div className="mt-3 rounded-xl bg-[var(--bb-depth-3)] p-4 ring-1 ring-[var(--bb-glass-border)]">
              <div className="flex items-center gap-3">
                <span className="text-2xl opacity-50">{data.next_achievement.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[var(--bb-ink-80)]">{data.next_achievement.name}</p>
                  <p className="text-[10px] text-[var(--bb-ink-40)]">{data.next_achievement.description}</p>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--bb-depth-3)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400"
                      style={{
                        width: `${(data.next_achievement.progress / data.next_achievement.target) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="mt-0.5 text-right text-[10px] text-[var(--bb-ink-40)]">
                    {data.next_achievement.progress}/{data.next_achievement.target}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
