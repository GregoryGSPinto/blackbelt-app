'use client';

import { useState, useEffect } from 'react';
import { getTeenDashboard } from '@/lib/api/teen.service';
import type { TeenDashboardDTO } from '@/lib/api/teen.service';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';

// ────────────────────────────────────────────────────────────
// Belt styling
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

const BELT_LABELS: Record<string, string> = {
  white: 'Faixa Branca',
  gray: 'Faixa Cinza',
  yellow: 'Faixa Amarela',
  orange: 'Faixa Laranja',
  green: 'Faixa Verde',
  blue: 'Faixa Azul',
  purple: 'Faixa Roxa',
  brown: 'Faixa Marrom',
  black: 'Faixa Preta',
};

const BELT_BG_COLORS: Record<string, string> = {
  white: '#e5e7eb',
  gray: '#9ca3af',
  yellow: '#facc15',
  orange: '#f97316',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
  brown: '#92400e',
  black: '#1f2937',
};

// ────────────────────────────────────────────────────────────
// Extended mock stats
// ────────────────────────────────────────────────────────────
interface ProfileStats {
  total_classes: number;
  classes_this_month: number;
  total_checkins: number;
  member_since: string;
  competitions: number;
  achievements_unlocked: number;
}

const MOCK_STATS: ProfileStats = {
  total_classes: 72,
  classes_this_month: 8,
  total_checkins: 68,
  member_since: '2025-06-15',
  competitions: 0,
  achievements_unlocked: 5,
};

export default function TeenPerfilPage() {
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

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bb-depth-1)] p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <div className="flex flex-col items-center gap-3">
            <Skeleton variant="circle" className="h-24 w-24 bg-[var(--bb-depth-3)]" />
            <Skeleton variant="text" className="h-6 w-40 bg-[var(--bb-depth-3)]" />
            <Skeleton variant="text" className="h-4 w-32 bg-[var(--bb-depth-3)]" />
          </div>
          <Skeleton variant="card" className="h-20 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-48 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-36 bg-[var(--bb-depth-3)]" />
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────
  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bb-depth-1)] px-4">
        <span className="text-6xl">👤</span>
        <h2 className="mt-4 text-xl font-bold text-[var(--bb-ink-100)]">Perfil indisponivel</h2>
        <p className="mt-2 text-sm text-[var(--bb-ink-40)]">
          Nao foi possivel carregar seus dados. Tente novamente.
        </p>
      </div>
    );
  }

  const { profile, xp, level, next_level_xp, rank_position, streak, achievements } = data;
  const xpPercent = Math.round((xp / next_level_xp) * 100);
  const ringColor = BELT_RING_COLORS[profile.belt] ?? 'ring-gray-400';
  const beltLabel = BELT_LABELS[profile.belt] ?? profile.belt;
  const beltColor = BELT_BG_COLORS[profile.belt] ?? '#9ca3af';
  const memberSinceDate = new Date(MOCK_STATS.member_since).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      {/* Hero section */}
      <section className="relative overflow-hidden px-4 pb-6 pt-8">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bb-brand-primary)]/15 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-lg text-center">
          {/* Avatar with belt ring */}
          <div className={`mx-auto inline-block rounded-full p-1 ring-4 ${ringColor}`}>
            <Avatar name={profile.display_name} size="xl" />
          </div>

          <h1 className="mt-3 text-2xl font-extrabold text-[var(--bb-ink-100)]">
            {profile.display_name}
          </h1>
          <p className="text-sm text-[var(--bb-ink-60)]">
            Level {level} &middot; {profile.title}
          </p>
          {profile.bio && (
            <p className="mt-1 text-xs italic text-[var(--bb-ink-40)]">
              &ldquo;{profile.bio}&rdquo;
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-lg space-y-5 px-4">
        {/* XP Progress */}
        <section className="rounded-[var(--bb-radius-lg)] bg-[var(--bb-depth-3)] p-5 ring-1 ring-[var(--bb-glass-border)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--bb-ink-60)]">Progresso de XP</h2>
            <span className="text-sm font-bold text-yellow-400">Level {level}</span>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-[var(--bb-ink-40)]">
              <span className="font-bold text-[var(--bb-ink-100)]">{xp.toLocaleString('pt-BR')} XP</span>
              <span>{next_level_xp.toLocaleString('pt-BR')} XP</span>
            </div>
            <div className="mt-1.5 h-4 overflow-hidden rounded-full bg-[var(--bb-depth-1)] shadow-inner">
              <div
                className="flex h-full items-center justify-end rounded-full bg-gradient-to-r from-bb-red-500 via-orange-500 to-yellow-400 pr-2 transition-all duration-700"
                style={{ width: `${Math.max(xpPercent, 8)}%` }}
              >
                <span className="text-[10px] font-bold text-white drop-shadow">
                  {xpPercent}%
                </span>
              </div>
            </div>
            <p className="mt-1 text-center text-[10px] text-[var(--bb-ink-40)]">
              Faltam {(next_level_xp - xp).toLocaleString('pt-BR')} XP para Level {level + 1}
            </p>
          </div>
        </section>

        {/* Belt */}
        <section className="rounded-[var(--bb-radius-lg)] bg-[var(--bb-depth-3)] p-5 ring-1 ring-[var(--bb-glass-border)]">
          <h2 className="mb-3 text-sm font-bold text-[var(--bb-ink-60)]">Graduacao</h2>
          <div className="flex items-center gap-4">
            <div
              className="h-6 w-28 rounded-md shadow-md"
              style={{ backgroundColor: beltColor }}
            />
            <div>
              <p className="text-lg font-extrabold text-[var(--bb-ink-100)]">{beltLabel}</p>
              <p className="text-xs text-[var(--bb-ink-40)]">Ranking #{rank_position} da academia</p>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="rounded-[var(--bb-radius-lg)] bg-[var(--bb-depth-3)] p-5 ring-1 ring-[var(--bb-glass-border)]">
          <h2 className="mb-4 text-sm font-bold text-[var(--bb-ink-60)]">Estatisticas</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-3 text-center ring-1 ring-green-500/20">
              <p className="text-2xl font-extrabold text-green-400">{MOCK_STATS.total_classes}</p>
              <p className="text-[10px] text-[var(--bb-ink-40)]">Aulas totais</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-3 text-center ring-1 ring-blue-500/20">
              <p className="text-2xl font-extrabold text-blue-400">{MOCK_STATS.classes_this_month}</p>
              <p className="text-[10px] text-[var(--bb-ink-40)]">Este mes</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/5 p-3 text-center ring-1 ring-orange-500/20">
              <p className="text-2xl font-extrabold text-orange-400">{streak.current_days}d</p>
              <p className="text-[10px] text-[var(--bb-ink-40)]">Streak atual</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/5 p-3 text-center ring-1 ring-purple-500/20">
              <p className="text-2xl font-extrabold text-purple-400">{streak.best_ever}d</p>
              <p className="text-[10px] text-[var(--bb-ink-40)]">Melhor streak</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/5 p-3 text-center ring-1 ring-yellow-500/20">
              <p className="text-2xl font-extrabold text-yellow-400">{MOCK_STATS.achievements_unlocked}</p>
              <p className="text-[10px] text-[var(--bb-ink-40)]">Conquistas</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/5 p-3 text-center ring-1 ring-pink-500/20">
              <p className="text-2xl font-extrabold text-pink-400">{MOCK_STATS.competitions}</p>
              <p className="text-[10px] text-[var(--bb-ink-40)]">Competicoes</p>
            </div>
          </div>
        </section>

        {/* Recent achievements */}
        <section className="rounded-[var(--bb-radius-lg)] bg-[var(--bb-depth-3)] p-5 ring-1 ring-[var(--bb-glass-border)]">
          <h2 className="mb-3 text-sm font-bold text-[var(--bb-ink-60)]">Conquistas Recentes</h2>
          {achievements.filter((a) => a.unlocked).length === 0 ? (
            <div className="py-6 text-center">
              <span className="text-3xl">🎖️</span>
              <p className="mt-2 text-sm text-[var(--bb-ink-40)]">Nenhuma conquista desbloqueada ainda.</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {achievements
                .filter((a) => a.unlocked)
                .map((ach) => (
                  <div
                    key={ach.id}
                    className="flex flex-shrink-0 flex-col items-center rounded-xl bg-[var(--bb-depth-1)]/30 p-3"
                    style={{ boxShadow: `0 0 16px ${ach.glow_color}30` }}
                  >
                    <span className="text-2xl">{ach.icon}</span>
                    <p className="mt-1 max-w-[4.5rem] text-center text-[10px] font-semibold text-[var(--bb-ink-80)]">
                      {ach.name}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Member info */}
        <section className="rounded-[var(--bb-radius-lg)] bg-[var(--bb-depth-3)] p-4 text-center">
          <p className="text-xs text-[var(--bb-ink-40)]">
            Membro desde {memberSinceDate} &middot; {MOCK_STATS.total_checkins} check-ins
          </p>
        </section>
      </div>
    </div>
  );
}
