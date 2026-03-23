'use client';

import { useState, useEffect } from 'react';
import { getTeenDashboard } from '@/lib/api/teen.service';
import type { TeenDashboardDTO, TeenRankingEntryDTO } from '@/lib/api/teen.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { PlanGate } from '@/components/plans/PlanGate';

// ────────────────────────────────────────────────────────────
// Extended ranking data for full leaderboard
// ────────────────────────────────────────────────────────────
interface ExtendedRankingEntry extends TeenRankingEntryDTO {
  streak_days: number;
  level: number;
  belt: string;
}

const EXTENDED_RANKING: ExtendedRankingEntry[] = [
  { student_id: 'stu-1', display_name: 'Sophia Martins', avatar: null, xp: 3100, rank: 1, is_current_user: false, streak_days: 14, level: 10, belt: 'green' },
  { student_id: 'stu-2', display_name: 'Valentina Rocha', avatar: null, xp: 2800, rank: 2, is_current_user: false, streak_days: 9, level: 9, belt: 'orange' },
  { student_id: 'stu-teen-lucas', display_name: 'Lucas Ferreira', avatar: null, xp: 2450, rank: 3, is_current_user: true, streak_days: 5, level: 8, belt: 'orange' },
  { student_id: 'stu-4', display_name: 'Pedro Almeida', avatar: null, xp: 2200, rank: 4, is_current_user: false, streak_days: 3, level: 7, belt: 'orange' },
  { student_id: 'stu-5', display_name: 'Ana Silva', avatar: null, xp: 1900, rank: 5, is_current_user: false, streak_days: 7, level: 7, belt: 'yellow' },
  { student_id: 'stu-6', display_name: 'Gabriel Costa', avatar: null, xp: 1750, rank: 6, is_current_user: false, streak_days: 2, level: 6, belt: 'yellow' },
  { student_id: 'stu-7', display_name: 'Julia Santos', avatar: null, xp: 1600, rank: 7, is_current_user: false, streak_days: 0, level: 6, belt: 'yellow' },
  { student_id: 'stu-8', display_name: 'Matheus Lima', avatar: null, xp: 1450, rank: 8, is_current_user: false, streak_days: 4, level: 5, belt: 'gray' },
  { student_id: 'stu-9', display_name: 'Isabella Souza', avatar: null, xp: 1200, rank: 9, is_current_user: false, streak_days: 1, level: 5, belt: 'gray' },
  { student_id: 'stu-10', display_name: 'Rafael Oliveira', avatar: null, xp: 980, rank: 10, is_current_user: false, streak_days: 0, level: 4, belt: 'gray' },
];

const MEDAL_EMOJIS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

const BELT_COLORS: Record<string, string> = {
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

type TabFilter = 'xp' | 'streak';

export default function TeenRankingPage() {
  const [data, setData] = useState<TeenDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>('xp');

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Skeleton variant="text" className="h-8 w-36 bg-[var(--bb-depth-3)]" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="card" className="h-36 flex-1 bg-[var(--bb-depth-3)]" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="card" className="h-16 bg-[var(--bb-depth-3)]" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────
  if (!data) {
    return (
      <PlanGate module="teen_module">
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bb-depth-1)] px-4">
          <span className="text-6xl">🏆</span>
          <h2 className="mt-4 text-xl font-bold text-[var(--bb-ink-100)]">Ranking indisponivel</h2>
          <p className="mt-2 text-sm text-[var(--bb-ink-60)]">
            O ranking sera exibido quando houver participantes suficientes.
          </p>
        </div>
      </PlanGate>
    );
  }

  const sortedRanking =
    tab === 'xp'
      ? [...EXTENDED_RANKING].sort((a, b) => b.xp - a.xp)
      : [...EXTENDED_RANKING].sort((a, b) => b.streak_days - a.streak_days);

  const top3 = sortedRanking.slice(0, 3);
  const rest = sortedRanking.slice(3);
  const myEntry = EXTENDED_RANKING.find((e) => e.is_current_user);

  return (
    <PlanGate module="teen_module">
      <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--bb-ink-100)]">Ranking</h1>
            <p className="mt-1 text-sm text-[var(--bb-ink-60)]">Competicao entre alunos</p>
          </div>
          {myEntry && (
            <div className="rounded-xl bg-gradient-to-br from-bb-red-500/20 to-orange-500/10 px-4 py-2 ring-1 ring-bb-red-500/30">
              <p className="text-xs text-[var(--bb-ink-60)]">Sua posicao</p>
              <p className="text-xl font-extrabold text-[var(--bb-ink-100)]">#{myEntry.rank}</p>
            </div>
          )}
        </div>

        {/* Tab toggle */}
        <div className="flex rounded-xl bg-[var(--bb-depth-4)] p-1">
          <button
            onClick={() => setTab('xp')}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-colors ${
              tab === 'xp'
                ? 'bg-bb-red-500 text-white shadow-lg'
                : 'text-[var(--bb-ink-60)] hover:text-[var(--bb-ink-80)]'
            }`}
          >
            Por XP
          </button>
          <button
            onClick={() => setTab('streak')}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-colors ${
              tab === 'streak'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-[var(--bb-ink-60)] hover:text-[var(--bb-ink-80)]'
            }`}
          >
            Por Streak
          </button>
        </div>

        {/* Top 3 podium */}
        <section className="flex items-end justify-center gap-3 pt-4">
          {/* 2nd place */}
          {top3[1] && (
            <div className="flex flex-col items-center">
              <Avatar name={top3[1].display_name} size="md" />
              <p className="mt-1 max-w-[5rem] truncate text-center text-xs font-semibold text-[var(--bb-ink-60)]">
                {top3[1].is_current_user ? 'VOCE' : top3[1].display_name.split(' ')[0]}
              </p>
              <p className="text-xs font-bold text-yellow-400">
                {tab === 'xp'
                  ? `${top3[1].xp.toLocaleString('pt-BR')} XP`
                  : `${top3[1].streak_days}d`}
              </p>
              <div className="mt-2 flex h-20 w-20 items-center justify-center rounded-t-xl bg-gradient-to-b from-gray-600 to-gray-700">
                <span className="text-3xl">🥈</span>
              </div>
            </div>
          )}

          {/* 1st place */}
          {top3[0] && (
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar name={top3[0].display_name} size="lg" />
                <span className="absolute -top-2 -right-2 text-xl">👑</span>
              </div>
              <p className="mt-1 max-w-[6rem] truncate text-center text-sm font-bold text-[var(--bb-ink-100)]">
                {top3[0].is_current_user ? 'VOCE' : top3[0].display_name.split(' ')[0]}
              </p>
              <p className="text-sm font-bold text-yellow-400">
                {tab === 'xp'
                  ? `${top3[0].xp.toLocaleString('pt-BR')} XP`
                  : `${top3[0].streak_days}d`}
              </p>
              <div className="mt-2 flex h-28 w-24 items-center justify-center rounded-t-xl bg-gradient-to-b from-yellow-500/30 to-yellow-600/40 ring-1 ring-yellow-500/30">
                <span className="text-4xl">🥇</span>
              </div>
            </div>
          )}

          {/* 3rd place */}
          {top3[2] && (
            <div className="flex flex-col items-center">
              <Avatar name={top3[2].display_name} size="md" />
              <p className="mt-1 max-w-[5rem] truncate text-center text-xs font-semibold text-[var(--bb-ink-60)]">
                {top3[2].is_current_user ? 'VOCE' : top3[2].display_name.split(' ')[0]}
              </p>
              <p className="text-xs font-bold text-yellow-400">
                {tab === 'xp'
                  ? `${top3[2].xp.toLocaleString('pt-BR')} XP`
                  : `${top3[2].streak_days}d`}
              </p>
              <div className="mt-2 flex h-16 w-20 items-center justify-center rounded-t-xl bg-gradient-to-b from-amber-700/30 to-amber-800/40">
                <span className="text-3xl">🥉</span>
              </div>
            </div>
          )}
        </section>

        {/* Rest of the ranking */}
        <section className="space-y-2">
          {rest.map((entry) => {
            const isMe = entry.is_current_user;
            return (
              <div
                key={entry.student_id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  isMe
                    ? 'bg-gradient-to-r from-bb-red-500/20 to-orange-500/10 ring-1 ring-bb-red-500/40'
                    : 'bg-[var(--bb-depth-3)]'
                }`}
              >
                <span className="w-8 text-center text-sm font-extrabold text-[var(--bb-ink-60)]">
                  {MEDAL_EMOJIS[entry.rank] ?? `#${entry.rank}`}
                </span>
                <Avatar name={entry.display_name} size="sm" />
                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      isMe ? 'text-[var(--bb-ink-100)]' : 'text-[var(--bb-ink-60)]'
                    }`}
                  >
                    {isMe ? 'VOCE' : entry.display_name}
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-6 rounded-sm"
                      style={{ backgroundColor: BELT_COLORS[entry.belt] ?? '#9ca3af' }}
                    />
                    <span className="text-[10px] text-[var(--bb-ink-40)]">Lv.{entry.level}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-yellow-400">
                    {tab === 'xp'
                      ? `${entry.xp.toLocaleString('pt-BR')}`
                      : `${entry.streak_days}d`}
                  </p>
                  <p className="text-[10px] text-[var(--bb-ink-40)]">
                    {tab === 'xp' ? 'XP' : 'streak'}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* My stats card */}
        {myEntry && (
          <section className="rounded-2xl bg-gradient-to-br from-bb-red-500/10 to-orange-500/10 p-4 ring-1 ring-bb-red-500/20">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--bb-ink-60)]">
              Suas Estatisticas
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-extrabold text-[var(--bb-ink-100)]">{myEntry.xp.toLocaleString('pt-BR')}</p>
                <p className="text-[10px] text-[var(--bb-ink-40)]">XP Total</p>
              </div>
              <div>
                <p className="text-lg font-extrabold text-[var(--bb-ink-100)]">{myEntry.streak_days}d</p>
                <p className="text-[10px] text-[var(--bb-ink-40)]">Streak</p>
              </div>
              <div>
                <p className="text-lg font-extrabold text-[var(--bb-ink-100)]">Lv.{myEntry.level}</p>
                <p className="text-[10px] text-[var(--bb-ink-40)]">Level</p>
              </div>
            </div>
          </section>
        )}
      </div>
      </div>
    </PlanGate>
  );
}
