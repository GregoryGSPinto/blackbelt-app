'use client';

import { useState, useEffect } from 'react';
import { getTeenDashboard } from '@/lib/api/teen.service';
import type {
  TeenDashboardDTO,
  TeenAchievementDTO,
  TeenNextAchievementDTO,
} from '@/lib/api/teen.service';
import { Skeleton } from '@/components/ui/Skeleton';

// ────────────────────────────────────────────────────────────
// Extended mock achievements for the full page
// ────────────────────────────────────────────────────────────
interface TeenFullAchievementDTO extends TeenAchievementDTO {
  description: string;
  xp_reward: number;
  category: 'treino' | 'faixa' | 'social' | 'streak' | 'competicao';
}

const CATEGORY_LABELS: Record<string, string> = {
  treino: 'Treino',
  faixa: 'Faixa',
  social: 'Social',
  streak: 'Streak',
  competicao: 'Competicao',
};

const CATEGORY_COLORS: Record<string, string> = {
  treino: 'from-green-500/20 to-emerald-500/10',
  faixa: 'from-amber-500/20 to-yellow-500/10',
  social: 'from-blue-500/20 to-cyan-500/10',
  streak: 'from-orange-500/20 to-red-500/10',
  competicao: 'from-purple-500/20 to-indigo-500/10',
};

const CATEGORY_BADGE: Record<string, string> = {
  treino: 'bg-green-500/20 text-green-400',
  faixa: 'bg-amber-500/20 text-amber-400',
  social: 'bg-blue-500/20 text-blue-400',
  streak: 'bg-orange-500/20 text-orange-400',
  competicao: 'bg-purple-500/20 text-purple-400',
};

const FULL_ACHIEVEMENTS: TeenFullAchievementDTO[] = [
  { id: 'ach-1', name: 'Streak 7 dias', icon: '🔥', unlocked: true, unlocked_at: '2026-03-10', glow_color: '#f97316', description: 'Treine 7 dias seguidos sem faltar!', xp_reward: 200, category: 'streak' },
  { id: 'ach-2', name: 'Faixa Laranja', icon: '🥋', unlocked: true, unlocked_at: '2026-02-15', glow_color: '#f59e0b', description: 'Alcance a graduacao de faixa laranja.', xp_reward: 500, category: 'faixa' },
  { id: 'ach-3', name: '50 Aulas', icon: '💪', unlocked: true, unlocked_at: '2026-01-20', glow_color: '#10b981', description: 'Participe de 50 aulas na academia.', xp_reward: 300, category: 'treino' },
  { id: 'ach-4', name: 'Top 3 Ranking', icon: '🏆', unlocked: true, unlocked_at: '2026-03-05', glow_color: '#eab308', description: 'Fique entre os 3 primeiros do ranking.', xp_reward: 400, category: 'competicao' },
  { id: 'ach-5', name: 'Primeira Competicao', icon: '🥇', unlocked: false, unlocked_at: null, glow_color: '#6366f1', description: 'Participe da sua primeira competicao oficial.', xp_reward: 600, category: 'competicao' },
  { id: 'ach-6', name: 'Streak 30 dias', icon: '⚡', unlocked: false, unlocked_at: null, glow_color: '#ef4444', description: 'Mantenha um streak de 30 dias consecutivos.', xp_reward: 800, category: 'streak' },
  { id: 'ach-7', name: '100 Aulas', icon: '🎯', unlocked: false, unlocked_at: null, glow_color: '#22c55e', description: 'Participe de 100 aulas na academia.', xp_reward: 500, category: 'treino' },
  { id: 'ach-8', name: 'Mentor', icon: '🤝', unlocked: false, unlocked_at: null, glow_color: '#3b82f6', description: 'Ajude 5 colegas iniciantes durante os treinos.', xp_reward: 350, category: 'social' },
  { id: 'ach-9', name: 'Faixa Verde', icon: '🥋', unlocked: false, unlocked_at: null, glow_color: '#16a34a', description: 'Alcance a graduacao de faixa verde.', xp_reward: 700, category: 'faixa' },
  { id: 'ach-10', name: 'Social Star', icon: '⭐', unlocked: true, unlocked_at: '2026-02-28', glow_color: '#a855f7', description: 'Receba 10 curtidas no feed da academia.', xp_reward: 150, category: 'social' },
];

type FilterCategory = 'all' | 'treino' | 'faixa' | 'social' | 'streak' | 'competicao';

export default function TeenConquistasPage() {
  const [data, setData] = useState<TeenDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [selectedAch, setSelectedAch] = useState<TeenFullAchievementDTO | null>(null);

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
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton variant="text" className="h-8 w-48 bg-gray-800" />
          <Skeleton variant="card" className="h-20 bg-gray-800" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="text" className="h-8 w-20 bg-gray-800" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="card" className="h-32 bg-gray-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────
  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 px-4">
        <span className="text-6xl">🎖️</span>
        <h2 className="mt-4 text-xl font-bold text-bb-white">Nenhuma conquista ainda</h2>
        <p className="mt-2 text-sm text-gray-400">
          Continue treinando para desbloquear suas primeiras conquistas!
        </p>
      </div>
    );
  }

  const nextAch: TeenNextAchievementDTO | null = data.next_achievement;
  const unlockedCount = FULL_ACHIEVEMENTS.filter((a) => a.unlocked).length;
  const totalXpEarned = FULL_ACHIEVEMENTS.filter((a) => a.unlocked).reduce((sum, a) => sum + a.xp_reward, 0);

  const filtered =
    filter === 'all'
      ? FULL_ACHIEVEMENTS
      : FULL_ACHIEVEMENTS.filter((a) => a.category === filter);

  const categories: FilterCategory[] = ['all', 'treino', 'faixa', 'social', 'streak', 'competicao'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 pb-24">
      <div className="mx-auto max-w-lg space-y-5 px-4 pt-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-bb-white">Conquistas</h1>
          <p className="mt-1 text-sm text-gray-400">
            {unlockedCount}/{FULL_ACHIEVEMENTS.length} desbloqueadas
          </p>
        </div>

        {/* Stats bar */}
        <section className="flex gap-3">
          <div className="flex-1 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 p-4 text-center ring-1 ring-yellow-500/20">
            <p className="text-2xl font-extrabold text-yellow-400">{unlockedCount}</p>
            <p className="text-xs text-gray-400">Conquistas</p>
          </div>
          <div className="flex-1 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 p-4 text-center ring-1 ring-cyan-500/20">
            <p className="text-2xl font-extrabold text-cyan-400">
              {totalXpEarned.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-gray-400">XP ganho</p>
          </div>
          <div className="flex-1 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 p-4 text-center ring-1 ring-purple-500/20">
            <p className="text-2xl font-extrabold text-purple-400">
              {Math.round((unlockedCount / FULL_ACHIEVEMENTS.length) * 100)}%
            </p>
            <p className="text-xs text-gray-400">Completo</p>
          </div>
        </section>

        {/* Next achievement progress */}
        {nextAch && (
          <section className="rounded-2xl bg-gray-800/50 p-4 ring-1 ring-gray-700/50">
            <div className="flex items-center gap-3">
              <span className="text-2xl opacity-60">{nextAch.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-300">{nextAch.name}</p>
                  <span className="text-xs text-gray-500">
                    {nextAch.progress}/{nextAch.target}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500">{nextAch.description}</p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-700"
                    style={{ width: `${(nextAch.progress / nextAch.target) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                filter === cat
                  ? 'bg-bb-red-500 text-bb-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {cat === 'all' ? 'Todas' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Achievements grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((ach) => (
            <button
              key={ach.id}
              onClick={() => setSelectedAch(ach)}
              className={`relative flex flex-col items-center rounded-2xl p-4 text-center transition-all ${
                ach.unlocked
                  ? `bg-gradient-to-br ${CATEGORY_COLORS[ach.category]} ring-1 ring-white/10`
                  : 'bg-gray-800/30 opacity-40 grayscale'
              }`}
              style={
                ach.unlocked
                  ? { boxShadow: `0 0 20px ${ach.glow_color}30, 0 0 60px ${ach.glow_color}10` }
                  : undefined
              }
            >
              <span className="text-4xl">{ach.icon}</span>
              <p className="mt-2 text-sm font-bold text-bb-white">{ach.name}</p>
              {ach.unlocked && (
                <span className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${CATEGORY_BADGE[ach.category]}`}>
                  +{ach.xp_reward} XP
                </span>
              )}
              {!ach.unlocked && (
                <span className="mt-1 text-[10px] text-gray-500">Bloqueada</span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <span className="text-4xl">🔍</span>
            <p className="mt-3 text-sm text-gray-400">Nenhuma conquista nesta categoria.</p>
          </div>
        )}
      </div>

      {/* Detail overlay */}
      {selectedAch && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedAch(null)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl bg-gray-900 p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-gray-700" />
            <div className="text-center">
              <span
                className={`inline-block text-5xl ${selectedAch.unlocked ? '' : 'grayscale opacity-40'}`}
                style={
                  selectedAch.unlocked
                    ? { filter: `drop-shadow(0 0 8px ${selectedAch.glow_color}80)` }
                    : undefined
                }
              >
                {selectedAch.icon}
              </span>
              <h3 className="mt-3 text-xl font-extrabold text-bb-white">{selectedAch.name}</h3>
              <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-bold ${CATEGORY_BADGE[selectedAch.category]}`}>
                {CATEGORY_LABELS[selectedAch.category]}
              </span>
              <p className="mt-3 text-sm text-gray-400">{selectedAch.description}</p>
              <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                <span className="font-bold text-yellow-400">+{selectedAch.xp_reward} XP</span>
                {selectedAch.unlocked && selectedAch.unlocked_at && (
                  <span className="text-gray-500">
                    {new Date(selectedAch.unlocked_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
              {!selectedAch.unlocked && (
                <div className="mt-4 rounded-xl bg-gray-800/50 px-4 py-3">
                  <p className="text-xs text-gray-500">
                    Continue treinando para desbloquear esta conquista!
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedAch(null)}
              className="mt-6 w-full rounded-xl bg-gray-800 py-3 text-sm font-bold text-gray-300 transition-colors hover:bg-gray-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
