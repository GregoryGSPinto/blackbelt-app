'use client';

import { useState, useEffect } from 'react';
import { getDesafios, claimReward } from '@/lib/api/teen-desafios.service';
import type { DesafiosOverview, DesafioTeen } from '@/lib/api/teen-desafios.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { PlanGate } from '@/components/plans/PlanGate';
import { useStudentId } from '@/lib/hooks/useStudentId';
import { translateError } from '@/lib/utils/error-translator';
import { useToast } from '@/lib/hooks/useToast';

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────

type TabFilter = 'ativos' | 'concluidos';

const TYPE_BADGE: Record<DesafioTeen['type'], { label: string; classes: string }> = {
  diario: { label: 'Diario', classes: 'bg-[color-mix(in_srgb,var(--bb-brand)_20%,transparent)] text-[var(--bb-brand)]' },
  semanal: { label: 'Semanal', classes: 'bg-purple-500/20 text-purple-400' },
  mensal: { label: 'Mensal', classes: 'bg-[color-mix(in_srgb,var(--bb-warning)_20%,transparent)] text-[var(--bb-warning)]' },
  especial: { label: 'Especial', classes: 'bg-[color-mix(in_srgb,var(--bb-danger)_20%,transparent)] text-[var(--bb-danger)]' },
};

const TYPE_GRADIENT: Record<DesafioTeen['type'], string> = {
  diario: 'from-blue-500/15 to-cyan-500/5',
  semanal: 'from-purple-500/15 to-indigo-500/5',
  mensal: 'from-yellow-500/15 to-amber-500/5',
  especial: 'from-red-500/15 to-orange-500/5',
};

const TYPE_RING: Record<DesafioTeen['type'], string> = {
  diario: 'ring-blue-500/20',
  semanal: 'ring-purple-500/20',
  mensal: 'ring-yellow-500/20',
  especial: 'ring-red-500/20',
};

const TYPE_BAR_COLOR: Record<DesafioTeen['type'], string> = {
  diario: 'from-blue-500 to-cyan-400',
  semanal: 'from-purple-500 to-indigo-400',
  mensal: 'from-yellow-500 to-amber-400',
  especial: 'from-red-500 to-orange-400',
};

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export default function TeenDesafiosPage() {
  const { studentId, loading: studentLoading } = useStudentId();
  const { toast } = useToast();
  const [data, setData] = useState<DesafiosOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>('ativos');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [claimFeedback, setClaimFeedback] = useState<{ id: string; xp: number } | null>(null);

  useEffect(() => {
    if (studentLoading || !studentId) return;
    async function load() {
      try {
        const d = await getDesafios(studentId!);
        setData(d);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId, studentLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleClaim(desafioId: string) {
    setClaimingId(desafioId);
    try {
      const result = await claimReward(desafioId);
      setClaimedIds((prev) => new Set(prev).add(desafioId));
      setClaimFeedback({ id: desafioId, xp: result.xp_earned });
      setTimeout(() => setClaimFeedback(null), 2000);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setClaimingId(null);
    }
  }

  // ── Loading ───────────────────────────────────────────────
  if (loading || studentLoading) {
    return (
      <div className="min-h-screen bg-[var(--bb-depth-1)] p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Skeleton variant="text" className="h-8 w-48 bg-[var(--bb-depth-3)]" />
          <div className="flex gap-3">
            <Skeleton variant="card" className="h-20 flex-1 bg-[var(--bb-depth-3)]" />
            <Skeleton variant="card" className="h-20 flex-1 bg-[var(--bb-depth-3)]" />
          </div>
          <div className="flex gap-2">
            <Skeleton variant="text" className="h-10 w-24 bg-[var(--bb-depth-3)]" />
            <Skeleton variant="text" className="h-10 w-24 bg-[var(--bb-depth-3)]" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" className="h-32 bg-[var(--bb-depth-3)]" />
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
          <span className="text-6xl">🎯</span>
          <h2 className="mt-4 text-xl font-bold text-[var(--bb-ink-100)]">Nenhum desafio disponivel</h2>
          <p className="mt-2 text-sm text-[var(--bb-ink-60)]">
            Novos desafios serao liberados em breve. Continue treinando!
          </p>
        </div>
      </PlanGate>
    );
  }

  const challenges = tab === 'ativos' ? data.active : data.completed;

  function isClaimable(c: DesafioTeen): boolean {
    return c.completed && !c.completed_at && !claimedIds.has(c.id);
  }

  return (
    <PlanGate module="teen_module">
      <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 pt-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--bb-ink-100)]">Desafios</h1>
          <p className="mt-1 text-sm text-[var(--bb-ink-60)]">
            Complete desafios e ganhe XP extra!
          </p>
        </div>

        {/* XP Summary */}
        <section className="flex gap-3">
          <div className="flex-1 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 p-4 text-center ring-1 ring-yellow-500/20">
            <p className="text-2xl font-extrabold text-[var(--bb-warning)]">
              {data.total_xp_earned.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-[var(--bb-ink-60)]">XP Ganho</p>
          </div>
          <div className="flex-1 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/10 p-4 text-center ring-1 ring-orange-500/20">
            <p className="text-2xl font-extrabold text-orange-400">
              +{data.streak_bonus}
            </p>
            <p className="text-xs text-[var(--bb-ink-60)]">Bonus Streak</p>
          </div>
        </section>

        {/* Tab toggle */}
        <div className="flex rounded-xl bg-[var(--bb-depth-4)] p-1">
          <button
            onClick={() => setTab('ativos')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${
              tab === 'ativos'
                ? 'bg-bb-red-500 text-white shadow-lg'
                : 'text-[var(--bb-ink-60)] hover:text-[var(--bb-ink-80)]'
            }`}
          >
            Ativos ({data.active.length})
          </button>
          <button
            onClick={() => setTab('concluidos')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${
              tab === 'concluidos'
                ? 'text-white shadow-lg'
                : 'text-[var(--bb-ink-60)] hover:text-[var(--bb-ink-80)]'
            }`}
            style={tab === 'concluidos' ? { background: 'var(--bb-success)' } : undefined}
          >
            Concluidos ({data.completed.length})
          </button>
        </div>

        {/* Challenge cards */}
        <div className="space-y-3">
          {challenges.map((challenge) => {
            const pct = challenge.target > 0
              ? Math.min(100, Math.round((challenge.progress / challenge.target) * 100))
              : 0;
            const claimable = isClaimable(challenge);
            const justClaimed = claimedIds.has(challenge.id);
            const isClaiming = claimingId === challenge.id;
            const feedback = claimFeedback?.id === challenge.id ? claimFeedback : null;

            return (
              <div
                key={challenge.id}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${TYPE_GRADIENT[challenge.type]} p-4 ring-1 ${TYPE_RING[challenge.type]} transition-all`}
              >
                {/* Feedback overlay */}
                {feedback && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl backdrop-blur-sm" style={{ background: 'color-mix(in srgb, var(--bb-success) 20%, transparent)' }}>
                    <div className="text-center">
                      <span className="text-3xl">🎉</span>
                      <p className="mt-1 text-lg font-extrabold text-[var(--bb-success)]">+{feedback.xp} XP</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {/* Emoji */}
                  <span className="text-3xl">{challenge.emoji}</span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[var(--bb-ink-100)] truncate">
                        {challenge.title}
                      </h3>
                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${TYPE_BADGE[challenge.type].classes}`}
                      >
                        {TYPE_BADGE[challenge.type].label}
                      </span>
                    </div>

                    <p className="mt-0.5 text-xs text-[var(--bb-ink-60)] line-clamp-2">
                      {challenge.description}
                    </p>

                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[var(--bb-ink-40)]">
                          {challenge.progress}/{challenge.target}
                        </span>
                        <span className="text-[var(--bb-ink-40)]">{pct}%</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--bb-depth-5)]">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${TYPE_BAR_COLOR[challenge.type]} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom row: XP badge + claim button */}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-[10px] font-bold text-[var(--bb-warning)]">
                        +{challenge.xp_reward} XP
                      </span>

                      {claimable && (
                        <button
                          onClick={() => handleClaim(challenge.id)}
                          disabled={isClaiming}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                          style={{ background: 'var(--bb-success)' }}
                        >
                          {isClaiming ? 'Resgatando...' : 'Resgatar'}
                        </button>
                      )}

                      {justClaimed && !feedback && (
                        <span className="text-xs font-bold text-[var(--bb-success)]">Resgatado!</span>
                      )}

                      {challenge.completed_at && (
                        <span className="text-[10px] text-[var(--bb-success)]">
                          {new Date(challenge.completed_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {challenges.length === 0 && (
          <div className="py-12 text-center">
            <span className="text-4xl">{tab === 'ativos' ? '🏖️' : '🔍'}</span>
            <p className="mt-3 text-sm text-[var(--bb-ink-60)]">
              {tab === 'ativos'
                ? 'Todos os desafios foram concluidos! Volte amanha.'
                : 'Nenhum desafio concluido ainda. Continue tentando!'}
            </p>
          </div>
        )}
      </div>
      </div>
    </PlanGate>
  );
}
