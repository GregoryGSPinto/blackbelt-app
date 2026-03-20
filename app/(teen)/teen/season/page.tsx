'use client';

import { useState, useEffect } from 'react';
import { getTeenSeasonPass, claimSeasonReward } from '@/lib/api/teen-season.service';
import type { TeenSeasonPass, SeasonReward } from '@/lib/api/teen-season.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { PlanGate } from '@/components/plans/PlanGate';

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  diamond: '#B9F2FF',
};

const TIER_LABEL: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Prata',
  gold: 'Ouro',
  diamond: 'Diamante',
};

const TIER_EMOJI: Record<string, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  diamond: '💎',
};

const TIER_BG: Record<string, string> = {
  bronze: 'from-[#CD7F32]/20 to-[#CD7F32]/5',
  silver: 'from-[#C0C0C0]/20 to-[#C0C0C0]/5',
  gold: 'from-[#FFD700]/20 to-[#FFD700]/5',
  diamond: 'from-[#B9F2FF]/20 to-[#B9F2FF]/5',
};

const TIER_RING: Record<string, string> = {
  bronze: 'ring-[#CD7F32]/30',
  silver: 'ring-[#C0C0C0]/30',
  gold: 'ring-[#FFD700]/30',
  diamond: 'ring-[#B9F2FF]/30',
};

const TIER_ORDER = ['bronze', 'silver', 'gold', 'diamond'];

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export default function TeenSeasonPage() {
  const [data, setData] = useState<TeenSeasonPass | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const d = await getTeenSeasonPass('stu-teen-lucas');
        setData(d);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleClaimReward(reward: SeasonReward) {
    setClaimingId(reward.id);
    try {
      await claimSeasonReward(reward.id);
      setClaimedIds((prev) => new Set(prev).add(reward.id));
    } finally {
      setClaimingId(null);
    }
  }

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bb-depth-1)] p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton variant="card" className="h-32 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-24 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="text" className="h-6 w-36 bg-[var(--bb-depth-3)]" />
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="card" className="h-32 w-28 flex-shrink-0 bg-[var(--bb-depth-3)]" />
            ))}
          </div>
          <Skeleton variant="text" className="h-6 w-36 bg-[var(--bb-depth-3)]" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="card" className="h-14 bg-[var(--bb-depth-3)]" />
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
          <span className="text-6xl">🏟️</span>
          <h2 className="mt-4 text-xl font-bold text-[var(--bb-ink-100)]">Nenhuma season ativa</h2>
          <p className="mt-2 text-sm text-[var(--bb-ink-60)]">
            A proxima season sera anunciada em breve!
          </p>
        </div>
      </PlanGate>
    );
  }

  const { season, my_progress, rewards, leaderboard } = data;
  const tierColor = TIER_COLORS[my_progress.tier];
  const progressToNext = my_progress.next_tier_at > 0
    ? Math.min(100, Math.round((my_progress.points / my_progress.next_tier_at) * 100))
    : 100;

  // Group rewards by tier
  const rewardsByTier = TIER_ORDER.map((tier) => ({
    tier,
    items: rewards.filter((r) => r.tier_required === tier),
  }));

  return (
    <PlanGate module="teen_module">
      <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      <div className="mx-auto max-w-lg space-y-5 px-4 pt-6">
        {/* Season banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/30 via-indigo-600/20 to-blue-600/10 p-5 ring-1 ring-purple-500/30">
          <div className="absolute -right-6 -top-6 text-8xl opacity-10">🏟️</div>
          <p className="text-xs font-bold uppercase tracking-widest text-purple-300">
            {season.name}
          </p>
          <h1 className="mt-1 text-xl font-extrabold text-[var(--bb-ink-100)]">
            {season.theme}
          </h1>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-base">⏳</span>
              <span className="font-bold text-[var(--bb-ink-80)]">
                {season.days_remaining} dias restantes
              </span>
            </div>
          </div>
        </section>

        {/* My progress card */}
        <section
          className={`rounded-2xl bg-gradient-to-br ${TIER_BG[my_progress.tier]} p-5 ring-1 ${TIER_RING[my_progress.tier]}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--bb-ink-60)]">
                Meu Progresso
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-2xl">{TIER_EMOJI[my_progress.tier]}</span>
                <span
                  className="text-lg font-extrabold"
                  style={{ color: tierColor }}
                >
                  {TIER_LABEL[my_progress.tier]}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-[var(--bb-ink-100)]">
                #{my_progress.rank}
              </p>
              <p className="text-[10px] text-[var(--bb-ink-40)]">Posicao</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-extrabold text-[var(--bb-ink-100)]">
                {my_progress.points.toLocaleString('pt-BR')}
              </p>
              <p className="text-[10px] text-[var(--bb-ink-40)]">Pontos</p>
            </div>
            <div>
              <p className="text-lg font-extrabold text-[var(--bb-ink-100)]">
                #{my_progress.rank}
              </p>
              <p className="text-[10px] text-[var(--bb-ink-40)]">Rank</p>
            </div>
            <div>
              <p className="text-lg font-extrabold text-[var(--bb-ink-100)]">
                {my_progress.achievements_count}
              </p>
              <p className="text-[10px] text-[var(--bb-ink-40)]">Conquistas</p>
            </div>
          </div>

          {/* Progress to next tier */}
          {my_progress.tier !== 'diamond' && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[var(--bb-ink-40)]">
                  Proximo: {TIER_LABEL[TIER_ORDER[TIER_ORDER.indexOf(my_progress.tier) + 1]]}
                </span>
                <span className="text-[var(--bb-ink-40)]">
                  {my_progress.points}/{my_progress.next_tier_at}
                </span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[var(--bb-depth-5)]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressToNext}%`,
                    background: `linear-gradient(to right, ${tierColor}, ${TIER_COLORS[TIER_ORDER[TIER_ORDER.indexOf(my_progress.tier) + 1]] ?? tierColor})`,
                  }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Rewards track */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[var(--bb-ink-60)]">
            Recompensas
          </h2>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {rewardsByTier.map(({ tier, items }) =>
              items.map((reward) => {
                const isClaimed = reward.claimed || claimedIds.has(reward.id);
                const canClaim = reward.unlocked && !isClaimed;
                const isClaiming = claimingId === reward.id;
                const rTierColor = TIER_COLORS[tier];

                return (
                  <div
                    key={reward.id}
                    className={`flex w-32 flex-shrink-0 flex-col items-center rounded-2xl p-3 text-center transition-all ${
                      reward.unlocked
                        ? `bg-gradient-to-br ${TIER_BG[tier]} ring-1 ${TIER_RING[tier]}`
                        : 'bg-[var(--bb-depth-4)]/40 opacity-50 grayscale'
                    }`}
                    style={
                      reward.unlocked
                        ? { boxShadow: `0 0 16px ${rTierColor}20` }
                        : undefined
                    }
                  >
                    <span className="text-xl">{TIER_EMOJI[tier]}</span>
                    <p className="mt-1 text-[10px] font-bold" style={{ color: rTierColor }}>
                      {TIER_LABEL[tier]}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[var(--bb-ink-100)] line-clamp-2 leading-tight">
                      {reward.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[var(--bb-ink-40)] line-clamp-2 leading-tight">
                      {reward.description}
                    </p>

                    {canClaim && (
                      <button
                        onClick={() => handleClaimReward(reward)}
                        disabled={isClaiming}
                        className="mt-2 w-full rounded-lg bg-green-600 px-2 py-1 text-[10px] font-bold text-white transition-all hover:bg-green-500 active:scale-95 disabled:opacity-50"
                      >
                        {isClaiming ? '...' : 'Resgatar'}
                      </button>
                    )}
                    {isClaimed && (
                      <span className="mt-2 text-[10px] font-bold text-green-400">Resgatado</span>
                    )}
                    {!reward.unlocked && (
                      <span className="mt-2 text-[10px] text-[var(--bb-ink-40)]">Bloqueado</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Leaderboard */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[var(--bb-ink-60)]">
            Leaderboard da Season
          </h2>

          <div className="space-y-2">
            {leaderboard.map((entry) => {
              const entryColor = TIER_COLORS[entry.tier];
              const isMe = entry.is_current_user;
              const medal = entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : null;

              return (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    isMe
                      ? 'bg-gradient-to-r from-bb-red-500/20 to-orange-500/10 ring-1 ring-bb-red-500/40'
                      : 'bg-[var(--bb-depth-3)]'
                  }`}
                >
                  {/* Rank */}
                  <span className="w-8 text-center text-sm font-extrabold text-[var(--bb-ink-60)]">
                    {medal ?? `#${entry.rank}`}
                  </span>

                  {/* Avatar */}
                  <Avatar name={entry.student_name} size="sm" />

                  {/* Name + tier */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isMe ? 'text-[var(--bb-ink-100)]' : 'text-[var(--bb-ink-60)]'
                      }`}
                    >
                      {isMe ? 'VOCE' : entry.student_name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: entryColor }}
                      />
                      <span className="text-[10px]" style={{ color: entryColor }}>
                        {TIER_LABEL[entry.tier]}
                      </span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--bb-ink-100)]">
                      {entry.points.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-[10px] text-[var(--bb-ink-40)]">pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      </div>
    </PlanGate>
  );
}
