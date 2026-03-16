'use client';

import { useState, useEffect } from 'react';
import { getKidsDashboard } from '@/lib/api/kids.service';
import type { KidsDashboardDTO } from '@/lib/api/kids.service';
import { Skeleton } from '@/components/ui/Skeleton';

// ────────────────────────────────────────────────────────────
// Kid-friendly achievement data
// ────────────────────────────────────────────────────────────
interface KidsAchievementDTO {
  id: string;
  name: string;
  icon: string;
  stars_reward: number;
  earned: boolean;
  earned_at: string | null;
  description: string;
  color: string;
}

const KIDS_ACHIEVEMENTS: KidsAchievementDTO[] = [
  { id: 'ka-1', name: 'Primeiro Treino', icon: '🥋', stars_reward: 5, earned: true, earned_at: '2025-09-10', description: 'Fez o primeiro treino na academia!', color: '#22c55e' },
  { id: 'ka-2', name: 'Amigo do Tatame', icon: '🤝', stars_reward: 3, earned: true, earned_at: '2025-09-20', description: 'Treinou com um colega novo!', color: '#3b82f6' },
  { id: 'ka-3', name: '10 Treinos', icon: '💪', stars_reward: 10, earned: true, earned_at: '2025-11-05', description: 'Participou de 10 treinos!', color: '#f97316' },
  { id: 'ka-4', name: 'Estrela da Semana', icon: '🌟', stars_reward: 5, earned: true, earned_at: '2026-01-15', description: 'Ganhou mais estrelas na semana!', color: '#eab308' },
  { id: 'ka-5', name: 'Faixa Cinza', icon: '🎯', stars_reward: 15, earned: true, earned_at: '2026-02-01', description: 'Conquistou a faixa cinza!', color: '#6b7280' },
  { id: 'ka-6', name: 'Super Pontual', icon: '⏰', stars_reward: 5, earned: true, earned_at: '2026-02-20', description: 'Chegou no horario 10 vezes seguidas!', color: '#a855f7' },
  { id: 'ka-7', name: 'Colecionador', icon: '📒', stars_reward: 8, earned: true, earned_at: '2026-03-01', description: 'Coletou 10 figurinhas do album!', color: '#ec4899' },
  { id: 'ka-8', name: '30 Treinos', icon: '🏋️', stars_reward: 15, earned: false, earned_at: null, description: 'Participe de 30 treinos!', color: '#14b8a6' },
  { id: 'ka-9', name: 'Faixa Amarela', icon: '🥇', stars_reward: 20, earned: false, earned_at: null, description: 'Conquiste a faixa amarela!', color: '#facc15' },
  { id: 'ka-10', name: 'Album Completo', icon: '✨', stars_reward: 30, earned: false, earned_at: null, description: 'Complete todas as figurinhas!', color: '#f43f5e' },
  { id: 'ka-11', name: 'Super Amigo', icon: '💖', stars_reward: 10, earned: false, earned_at: null, description: 'Ajude 3 colegas durante o treino!', color: '#f472b6' },
  { id: 'ka-12', name: 'Guerreiro Ninja', icon: '🥷', stars_reward: 25, earned: false, earned_at: null, description: 'Faca 50 treinos consecutivos!', color: '#8b5cf6' },
];

type FilterType = 'all' | 'earned' | 'locked';

export default function KidsConquistasPage() {
  const [data, setData] = useState<KidsDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedAch, setSelectedAch] = useState<KidsAchievementDTO | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const d = await getKidsDashboard('stu-kids-helena');
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
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-amber-50 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton variant="text" className="h-8 w-48 bg-sky-100" />
          <Skeleton variant="card" className="h-24 bg-sky-100" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="card" className="h-32 bg-sky-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────
  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-pink-50 px-4">
        <span className="text-6xl">🎖️</span>
        <h2 className="mt-4 text-xl font-extrabold text-gray-800">Nenhuma conquista ainda!</h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Continue treinando para ganhar suas primeiras conquistas e estrelas!
        </p>
      </div>
    );
  }

  const earnedCount = KIDS_ACHIEVEMENTS.filter((a) => a.earned).length;
  const totalStarsFromAch = KIDS_ACHIEVEMENTS.filter((a) => a.earned).reduce((sum, a) => sum + a.stars_reward, 0);

  const filtered =
    filter === 'all'
      ? KIDS_ACHIEVEMENTS
      : filter === 'earned'
        ? KIDS_ACHIEVEMENTS.filter((a) => a.earned)
        : KIDS_ACHIEVEMENTS.filter((a) => !a.earned);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-yellow-50 to-pink-50 pb-24">
      <div className="mx-auto max-w-lg space-y-5 px-4 pt-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-800">Minhas Conquistas</h1>
          <p className="mt-1 text-sm text-gray-500">
            {earnedCount} de {KIDS_ACHIEVEMENTS.length} conquistas!
          </p>
        </div>

        {/* Stats cards */}
        <div className="flex gap-3">
          <div className="flex-1 rounded-3xl bg-white/90 p-4 text-center shadow-lg shadow-amber-100/50 ring-1 ring-amber-200/30">
            <span className="text-3xl">⭐</span>
            <p className="mt-1 text-2xl font-extrabold text-amber-600">{totalStarsFromAch}</p>
            <p className="text-xs text-gray-500">Estrelas ganhas</p>
          </div>
          <div className="flex-1 rounded-3xl bg-white/90 p-4 text-center shadow-lg shadow-purple-100/50 ring-1 ring-purple-200/30">
            <span className="text-3xl">🏅</span>
            <p className="mt-1 text-2xl font-extrabold text-purple-600">{earnedCount}</p>
            <p className="text-xs text-gray-500">Conquistas</p>
          </div>
          <div className="flex-1 rounded-3xl bg-white/90 p-4 text-center shadow-lg shadow-green-100/50 ring-1 ring-green-200/30">
            <span className="text-3xl">🎯</span>
            <p className="mt-1 text-2xl font-extrabold text-green-600">
              {Math.round((earnedCount / KIDS_ACHIEVEMENTS.length) * 100)}%
            </p>
            <p className="text-xs text-gray-500">Completo</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="rounded-3xl bg-white/90 p-4 shadow-md ring-1 ring-amber-200/30">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-gray-700">Progresso</span>
            <span className="font-bold text-amber-600">
              {earnedCount}/{KIDS_ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="mt-2 h-4 overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 transition-all duration-700"
              style={{ width: `${(earnedCount / KIDS_ACHIEVEMENTS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all' as FilterType, label: 'Todas', emoji: '🌈' },
            { key: 'earned' as FilterType, label: 'Ganhas', emoji: '⭐' },
            { key: 'locked' as FilterType, label: 'Faltam', emoji: '🔒' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 rounded-2xl py-2.5 text-sm font-bold transition-all ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-200/50'
                  : 'bg-white/80 text-gray-500 shadow-sm'
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {/* Achievement grid */}
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((ach) => (
            <button
              key={ach.id}
              onClick={() => setSelectedAch(ach)}
              className={`flex flex-col items-center rounded-3xl p-3 transition-all ${
                ach.earned
                  ? 'bg-white/90 shadow-lg ring-2'
                  : 'bg-white/40 opacity-50'
              }`}
              style={
                ach.earned
                  ? {
                      borderColor: ach.color,
                      boxShadow: `0 4px 20px ${ach.color}25`,
                      outline: `2px solid ${ach.color}40`,
                      outlineOffset: '0px',
                    }
                  : undefined
              }
            >
              <span className={`text-4xl ${ach.earned ? 'animate-bounce' : 'grayscale'}`} style={{ animationDuration: '3s' }}>
                {ach.icon}
              </span>
              <p className="mt-1.5 text-center text-xs font-bold leading-tight text-gray-700">
                {ach.name}
              </p>
              {ach.earned ? (
                <span className="mt-1 flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                  +{ach.stars_reward} ⭐
                </span>
              ) : (
                <span className="mt-1 text-[10px] text-gray-400">🔒</span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <span className="text-5xl">🔍</span>
            <p className="mt-3 text-sm text-gray-500">Nenhuma conquista nesta categoria.</p>
          </div>
        )}
      </div>

      {/* Detail overlay */}
      {selectedAch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedAch(null)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <span
                className={`inline-block text-6xl ${selectedAch.earned ? '' : 'grayscale opacity-40'}`}
              >
                {selectedAch.icon}
              </span>
              <h3 className="mt-3 text-xl font-extrabold text-gray-800">{selectedAch.name}</h3>
              <p className="mt-2 text-sm text-gray-500">{selectedAch.description}</p>

              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-lg">⭐</span>
                <span className="text-lg font-extrabold text-amber-600">
                  +{selectedAch.stars_reward} estrelas
                </span>
              </div>

              {selectedAch.earned && selectedAch.earned_at && (
                <p className="mt-3 rounded-2xl bg-green-50 px-4 py-2 text-xs font-bold text-green-600">
                  Conquistada em{' '}
                  {new Date(selectedAch.earned_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}

              {!selectedAch.earned && (
                <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-2 text-xs font-bold text-amber-600">
                  Continue treinando para desbloquear!
                </p>
              )}
            </div>

            <button
              onClick={() => setSelectedAch(null)}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
