'use client';

import { useEffect, useRef, useState } from 'react';
import {
  getBattlePass,
  getMyBattlePassProgress,
  claimReward,
  upgradeToPremium,
  type BattlePassDTO,
  type BattlePassProgress,
} from '@/lib/api/battle-pass.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { PlanGate } from '@/components/plans/PlanGate';
import { ComingSoon } from '@/components/shared/ComingSoon';

export default function BattlePassPage() {
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [battlePass, setBattlePass] = useState<BattlePassDTO | null>(null);
  const [progress, setProgress] = useState<BattlePassProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<number | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    Promise.all([
      getBattlePass('season-3'),
      getMyBattlePassProgress('student-1', 'season-3'),
    ])
      .then(([bp, prog]) => {
        setBattlePass(bp);
        setProgress(prog);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (scrollRef.current && progress) {
      const currentEl = scrollRef.current.querySelector(`[data-level="${progress.current_level}"]`);
      if (currentEl) {
        currentEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [progress, loading]);

  async function handleClaim(level: number) {
    setClaiming(level);
    try {
      await claimReward('student-1', level);
      const [bp, prog] = await Promise.all([
        getBattlePass('season-3'),
        getMyBattlePassProgress('student-1', 'season-3'),
      ]);
      setBattlePass(bp);
      setProgress(prog);
    } finally {
      setClaiming(null);
    }
  }

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      await upgradeToPremium('student-1', 'season-3');
      const [bp, prog] = await Promise.all([
        getBattlePass('season-3'),
        getMyBattlePassProgress('student-1', 'season-3'),
      ]);
      setBattlePass(bp);
      setProgress(prog);
    } finally {
      setUpgrading(false);
    }
  }

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/dashboard" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!battlePass || !progress) return null;

  const xpPct = progress.xp_to_next_level > 0
    ? ((progress.current_xp % (progress.current_level * 200)) / (progress.current_level * 200)) * 100
    : 100;

  return (
    <PlanGate module="teen_module">
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 text-white">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute bottom-2 right-8 h-16 w-16 rounded-full bg-white/5" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider opacity-80">Battle Pass</p>
            <h1 className="mt-1 text-2xl font-bold">Season 3</h1>
          </div>
          {battlePass.is_premium ? (
            <span className="rounded-full bg-yellow-400/20 px-3 py-1 text-sm font-bold text-yellow-300">
              PREMIUM
            </span>
          ) : (
            <Button
              variant="secondary"
              onClick={handleUpgrade}
              disabled={upgrading}
              className="!bg-yellow-400 !text-black hover:!bg-yellow-300"
            >
              {upgrading ? 'Processando...' : `Upgrade Premium R$ ${battlePass.premium_price.toFixed(2).replace('.', ',')}`}
            </Button>
          )}
        </div>

        {/* XP Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span>
              Level {progress.current_level} / 30
            </span>
            <span>{progress.current_xp.toLocaleString('pt-BR')} XP</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all"
              style={{ width: `${Math.min(xpPct, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs opacity-70">
            {progress.xp_to_next_level} XP para o próximo nível
          </p>
        </div>
      </div>

      {/* Battle Pass Track - Horizontal Scroll */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-0 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-bb-gray-300"
        >
          {battlePass.levels.map((level) => {
            const isCurrent = level.level === progress.current_level;
            const isPast = level.level < progress.current_level;
            const isFuture = level.level > progress.current_level;
            const canClaimFree = isPast && level.free_reward && !level.claimed_free;
            const canClaimPremium = isPast && level.premium_reward && !level.claimed_premium && battlePass.is_premium;

            return (
              <div
                key={level.level}
                data-level={level.level}
                className="flex flex-col items-center"
                style={{ minWidth: '100px' }}
              >
                {/* Free reward (top) */}
                <div
                  className={`mb-2 flex h-16 w-16 flex-col items-center justify-center rounded-xl border-2 text-center transition-all ${
                    level.free_reward
                      ? isPast && level.claimed_free
                        ? 'border-green-400 bg-green-50'
                        : isCurrent
                          ? 'border-bb-primary bg-bb-primary/5 shadow-lg shadow-bb-primary/20'
                          : 'border-bb-gray-200 bg-white'
                      : 'border-transparent bg-transparent'
                  }`}
                >
                  {level.free_reward ? (
                    <>
                      <span className="text-lg">{level.free_reward.icon}</span>
                      <span className="mt-0.5 line-clamp-1 text-[9px] leading-tight text-bb-gray-500">
                        {level.free_reward.label}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-bb-gray-300">-</span>
                  )}
                </div>

                {/* Level marker */}
                <div className="relative flex flex-col items-center">
                  {/* Connecting line */}
                  <div className={`absolute top-1/2 h-1 w-[100px] -translate-y-1/2 ${isPast ? 'bg-bb-primary' : 'bg-bb-gray-200'}`} style={{ left: '-50px' }} />
                  <div
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                      isCurrent
                        ? 'bg-bb-primary text-white shadow-lg shadow-bb-primary/40 ring-4 ring-bb-primary/20'
                        : isPast
                          ? 'bg-bb-primary text-white'
                          : 'bg-bb-gray-200 text-bb-gray-500'
                    }`}
                  >
                    {level.level}
                  </div>
                </div>

                {/* Premium reward (bottom) */}
                <div
                  className={`mt-2 flex h-16 w-16 flex-col items-center justify-center rounded-xl border-2 text-center transition-all ${
                    level.premium_reward
                      ? !battlePass.is_premium && isFuture
                        ? 'border-bb-gray-200 bg-bb-gray-50 opacity-50'
                        : isPast && level.claimed_premium
                          ? 'border-green-400 bg-green-50'
                          : isCurrent
                            ? 'border-yellow-400 bg-yellow-50 shadow-lg shadow-yellow-400/20'
                            : 'border-yellow-200 bg-yellow-50/50'
                      : 'border-transparent bg-transparent'
                  }`}
                >
                  {level.premium_reward ? (
                    <>
                      <span className="text-lg">{level.premium_reward.icon}</span>
                      <span className="mt-0.5 line-clamp-1 text-[9px] leading-tight text-bb-gray-500">
                        {level.premium_reward.label}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-bb-gray-300">-</span>
                  )}
                </div>

                {/* Claim buttons */}
                {(canClaimFree || canClaimPremium) && (
                  <button
                    onClick={() => handleClaim(level.level)}
                    disabled={claiming === level.level}
                    className="mt-1 rounded-full bg-bb-primary px-2 py-0.5 text-[10px] font-bold text-white transition-colors hover:bg-bb-primary/80 disabled:opacity-50"
                  >
                    {claiming === level.level ? '...' : 'Resgatar'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Labels */}
        <div className="mt-2 flex items-center justify-between text-xs text-bb-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-bb-gray-200" /> Grátis
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" /> Premium
          </span>
        </div>
      </div>

      {/* Reward Summary */}
      <Card className="p-5">
        <h2 className="text-lg font-bold text-bb-black">Resumo de Recompensas</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-bb-gray-50 p-3 text-center">
            <p className="text-2xl font-bold text-bb-black">{progress.total_rewards_claimed}</p>
            <p className="text-xs text-bb-gray-500">Resgatadas</p>
          </div>
          <div className="rounded-xl bg-bb-gray-50 p-3 text-center">
            <p className="text-2xl font-bold text-bb-black">
              {battlePass.levels.filter((l) => l.free_reward && !l.claimed_free && l.level < progress.current_level).length}
            </p>
            <p className="text-xs text-bb-gray-500">Pendentes</p>
          </div>
        </div>
        {!battlePass.is_premium && (
          <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center">
            <p className="text-sm font-bold text-yellow-800">Desbloqueie recompensas Premium!</p>
            <p className="mt-1 text-xs text-yellow-600">
              Aula particular, quimono exclusivo, descontos maiores e muito mais
            </p>
            <Button
              variant="primary"
              onClick={handleUpgrade}
              disabled={upgrading}
              className="mt-3 !bg-yellow-500 hover:!bg-yellow-400"
            >
              {upgrading ? 'Processando...' : `Upgrade R$ ${battlePass.premium_price.toFixed(2).replace('.', ',')}`}
            </Button>
          </div>
        )}
      </Card>
    </div>
    </PlanGate>
  );
}
