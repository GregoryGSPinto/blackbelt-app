'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAchievements, getAchievementProgress, CATEGORY_META } from '@/lib/api/conquistas-v2.service';
import type { AchievementV2DTO, AchievementProgressDTO, AchievementCategory, AchievementRarity } from '@/lib/api/conquistas-v2.service';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStudentId } from '@/lib/hooks/useStudentId';
import { PlanGate } from '@/components/plans/PlanGate';
import { EmptyState } from '@/components/ui/EmptyState';

// ────────────────────────────────────────────────────────────
// Category colors
// ────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<AchievementCategory, string> = {
  JORNADA: '#3B82F6',
  CONSTANCIA: '#F97316',
  FAIXA: '#6B7280',
  SOCIAL: '#22C55E',
  COMPETICAO: '#EAB308',
  CONTEUDO: '#A855F7',
};

const CATEGORY_BG: Record<AchievementCategory, string> = {
  JORNADA: 'bg-blue-50',
  CONSTANCIA: 'bg-orange-50',
  FAIXA: 'bg-gray-50',
  SOCIAL: 'bg-green-50',
  COMPETICAO: 'bg-yellow-50',
  CONTEUDO: 'bg-purple-50',
};

const RARITY_LABELS: Record<AchievementRarity, string> = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Epico',
  legendary: 'Legendario',
};

const RARITY_TEXT_COLORS: Record<AchievementRarity, string> = {
  common: 'text-bb-gray-500',
  rare: 'text-blue-600',
  epic: 'text-purple-600',
  legendary: 'text-yellow-600',
};

const RARITY_BORDER: Record<AchievementRarity, string> = {
  common: 'border-bb-gray-200',
  rare: 'border-blue-300',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
};

const ALL_CATEGORIES: AchievementCategory[] = ['JORNADA', 'CONSTANCIA', 'FAIXA', 'SOCIAL', 'COMPETICAO', 'CONTEUDO'];

export default function ConquistasPage() {
  const { studentId, loading: studentLoading } = useStudentId();
  const [achievements, setAchievements] = useState<AchievementV2DTO[]>([]);
  const [progress, setProgress] = useState<AchievementProgressDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'ALL'>('ALL');
  const [selected, setSelected] = useState<AchievementV2DTO | null>(null);

  useEffect(() => {
    if (studentLoading || !studentId) return;
    async function load() {
      try {
        const [achs, prog] = await Promise.all([
          getAchievements(studentId!),
          getAchievementProgress(studentId!),
        ]);
        setAchievements(achs);
        setProgress(prog);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId, studentLoading]);

  const filtered = useMemo(() => {
    if (selectedCategory === 'ALL') return achievements;
    return achievements.filter((a) => a.category === selectedCategory);
  }, [achievements, selectedCategory]);

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-20" />
        <div className="flex gap-2 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="text" className="h-8 w-24 flex-shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <Skeleton key={i} variant="card" className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PlanGate module="conquistas">
      <div className="space-y-5 p-4">
        {/* Header stats */}
        <div>
          <h1 className="text-xl font-bold text-bb-gray-900">Conquistas</h1>
          {progress && (
            <div className="mt-3 flex items-center gap-4">
              <Card variant="elevated" className="flex-1 text-center">
                <p className="text-2xl font-bold text-bb-red-500">
                  {progress.earned}/{progress.total}
                </p>
                <p className="text-xs text-bb-gray-500">
                  {progress.percent}% conquistado
                </p>
              </Card>
              {progress.most_rare_earned && (
                <Card variant="elevated" className="flex-1 text-center">
                  <p className="text-2xl">{progress.most_rare_earned.icon}</p>
                  <p className="text-xs text-bb-gray-500">Mais rara</p>
                  <p className={`text-xs font-semibold ${RARITY_TEXT_COLORS[progress.most_rare_earned.rarity]}`}>
                    {RARITY_LABELS[progress.most_rare_earned.rarity]}
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-bb-red-500 text-bb-white'
                : 'bg-bb-gray-100 text-bb-gray-500'
            }`}
          >
            Todas
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'text-bb-white'
                  : 'bg-bb-gray-100 text-bb-gray-500'
              }`}
              style={
                selectedCategory === cat
                  ? { backgroundColor: CATEGORY_COLORS[cat] }
                  : undefined
              }
            >
              {CATEGORY_META[cat].label}
            </button>
          ))}
        </div>

        {/* Achievement grid */}
        {filtered.length === 0 && (
          <EmptyState
            icon="🏅"
            title="Nenhuma conquista encontrada"
            description={selectedCategory !== 'ALL' ? "Nenhuma conquista nesta categoria. Tente outra categoria." : "Continue treinando para desbloquear conquistas!"}
            variant={selectedCategory !== 'ALL' ? "search" : "first-time"}
          />
        )}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {filtered.map((ach) => (
            <button
              key={ach.id}
              onClick={() => setSelected(ach)}
              className={`relative flex flex-col items-center rounded-xl border-2 p-3 text-center transition-all ${
                ach.is_earned
                  ? `${CATEGORY_BG[ach.category]} ${RARITY_BORDER[ach.rarity]} shadow-sm`
                  : 'border-bb-gray-200 bg-bb-gray-50'
              }`}
              style={
                ach.is_earned && ach.rarity === 'legendary'
                  ? {
                      boxShadow: '0 0 12px rgba(234,179,8,0.4)',
                      animation: 'legendaryPulse 3s ease-in-out infinite',
                    }
                  : undefined
              }
            >
              {/* Rarity indicator */}
              {ach.is_earned && ach.rarity !== 'common' && (
                <span
                  className="absolute -top-1 -right-1 h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      ach.rarity === 'legendary'
                        ? '#EAB308'
                        : ach.rarity === 'epic'
                          ? '#A855F7'
                          : '#3B82F6',
                    boxShadow:
                      ach.rarity === 'legendary'
                        ? '0 0 6px rgba(234,179,8,0.6)'
                        : undefined,
                  }}
                />
              )}

              {/* Icon / Silhouette */}
              <span
                className={`text-3xl ${ach.is_earned ? '' : 'grayscale opacity-30'}`}
                style={
                  ach.is_earned && ach.rarity === 'legendary'
                    ? { filter: 'drop-shadow(0 0 4px rgba(234,179,8,0.5))' }
                    : ach.is_earned && ach.rarity === 'epic'
                      ? { filter: 'drop-shadow(0 0 3px rgba(168,85,247,0.4))' }
                      : undefined
                }
              >
                {ach.icon}
              </span>

              {/* Name */}
              <p
                className={`mt-1 text-[11px] font-medium leading-tight ${
                  ach.is_earned ? 'text-bb-gray-900' : 'text-bb-gray-400'
                }`}
              >
                {ach.name}
              </p>

              {/* Earned date or progress bar */}
              {ach.is_earned && ach.earned_at ? (
                <p className="mt-0.5 text-[9px] text-bb-gray-400">
                  {new Date(ach.earned_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              ) : (
                ach.progress_percent !== null && (
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-bb-gray-200">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${ach.progress_percent}%`,
                        backgroundColor: CATEGORY_COLORS[ach.category],
                      }}
                    />
                  </div>
                )
              )}
            </button>
          ))}
        </div>

        {/* Detail modal */}
        <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
          {selected && (
            <div className="space-y-4 text-center">
              <span
                className={`inline-block text-5xl ${selected.is_earned ? '' : 'grayscale opacity-40'}`}
                style={
                  selected.is_earned && selected.rarity === 'legendary'
                    ? { filter: 'drop-shadow(0 0 8px rgba(234,179,8,0.6))' }
                    : undefined
                }
              >
                {selected.icon}
              </span>

              <div>
                <span
                  className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold text-bb-white`}
                  style={{ backgroundColor: CATEGORY_COLORS[selected.category] }}
                >
                  {CATEGORY_META[selected.category].label}
                </span>
                <span className={`ml-2 text-xs font-semibold ${RARITY_TEXT_COLORS[selected.rarity]}`}>
                  {RARITY_LABELS[selected.rarity]}
                </span>
              </div>

              <p className="text-sm text-bb-gray-500">{selected.description}</p>

              {selected.is_earned && selected.earned_at ? (
                <p className="text-xs text-bb-gray-400">
                  Conquistada em{' '}
                  {new Date(selected.earned_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              ) : (
                selected.progress_percent !== null && (
                  <div>
                    <div className="mx-auto h-2 w-48 overflow-hidden rounded-full bg-bb-gray-200">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${selected.progress_percent}%`,
                          backgroundColor: CATEGORY_COLORS[selected.category],
                        }}
                      />
                    </div>
                    {selected.progress_label && (
                      <p className="mt-1 text-xs text-bb-gray-500">{selected.progress_label}</p>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </Modal>

        {/* Inline keyframes for legendary glow */}
        <style>{`
          @keyframes legendaryPulse {
            0%, 100% { box-shadow: 0 0 8px rgba(234,179,8,0.3); }
            50% { box-shadow: 0 0 18px rgba(234,179,8,0.6); }
          }
        `}</style>
      </div>
    </PlanGate>
  );
}
