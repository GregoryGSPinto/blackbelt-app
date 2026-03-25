'use client';

import { useEffect, useState } from 'react';
import {
  getRewardsStore,
  redeemReward,
  getMyRedemptions,
  type StoreReward,
  type RedemptionDTO,
  type RewardCategory,
} from '@/lib/api/rewards-store.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { ComingSoon } from '@/components/shared/ComingSoon';

const CATEGORY_LABELS: Record<RewardCategory, string> = {
  desconto: 'Descontos',
  experiencia: 'Experiências',
  produto: 'Produtos',
  digital: 'Digital',
  prioridade: 'Prioridade',
};

const CATEGORY_ICON: Record<RewardCategory, string> = {
  desconto: '🏷️',
  experiencia: '🎯',
  produto: '📦',
  digital: '💻',
  prioridade: '⚡',
};

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
  delivered: { label: 'Entregue', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

export default function RecompensasPage() {
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [rewards, setRewards] = useState<StoreReward[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionDTO[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'store' | 'history'>('store');
  const [categoryFilter, setCategoryFilter] = useState<RewardCategory | 'all'>('all');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    Promise.all([
      getRewardsStore(getActiveAcademyId()),
      getMyRedemptions('student-1'),
    ])
      .then(([store, reds]) => {
        setRewards(store.rewards);
        setBalance(store.user_points_balance);
        setRedemptions(reds);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleRedeem(rewardId: string) {
    setRedeeming(true);
    try {
      const result = await redeemReward('student-1', rewardId);
      if (result.success) {
        const reward = rewards.find((r) => r.id === rewardId);
        if (reward) {
          setBalance((prev) => prev - reward.cost_points);
          setRewards((prev) =>
            prev.map((r) => r.id === rewardId ? { ...r, stock: r.stock - 1 } : r)
          );
          setRedemptions((prev) => [result.redemption, ...prev]);
        }
      }
    } finally {
      setRedeeming(false);
      setConfirmId(null);
    }
  }

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/dashboard" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const filteredRewards =
    categoryFilter === 'all' ? rewards : rewards.filter((r) => r.category === categoryFilter);

  return (
    <div className="space-y-6">
      {/* Header with Balance */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <p className="text-sm font-medium uppercase tracking-wider opacity-80">Loja de Recompensas</p>
        <h1 className="mt-1 text-2xl font-bold">Recompensas</h1>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-3xl font-bold">{balance.toLocaleString('pt-BR')}</span>
          <span className="text-sm opacity-80">pontos disponíveis</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('store')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === 'store' ? 'bg-bb-primary text-white' : 'bg-bb-gray-100 text-bb-gray-500'}`}
        >
          Loja
        </button>
        <button
          onClick={() => setTab('history')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === 'history' ? 'bg-bb-primary text-white' : 'bg-bb-gray-100 text-bb-gray-500'}`}
        >
          Meus Resgates
        </button>
      </div>

      {tab === 'store' && (
        <>
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                categoryFilter === 'all' ? 'bg-bb-primary text-white' : 'bg-bb-gray-100 text-bb-gray-500'
              }`}
            >
              Todos
            </button>
            {(Object.entries(CATEGORY_LABELS) as [RewardCategory, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  categoryFilter === key ? 'bg-bb-primary text-white' : 'bg-bb-gray-100 text-bb-gray-500'
                }`}
              >
                {CATEGORY_ICON[key]} {label}
              </button>
            ))}
          </div>

          {/* Rewards Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredRewards.map((reward) => {
              const canAfford = balance >= reward.cost_points;
              const available = reward.status === 'available' && reward.stock > 0;
              const isConfirming = confirmId === reward.id;

              return (
                <Card key={reward.id} className="overflow-hidden">
                  <div className="flex h-32 items-center justify-center bg-gradient-to-br from-bb-gray-100 to-bb-gray-200">
                    <span className="text-4xl">{CATEGORY_ICON[reward.category]}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-bb-black">{reward.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        CATEGORY_LABELS[reward.category] ? 'bg-bb-gray-100 text-bb-gray-500' : ''
                      }`}>
                        {CATEGORY_LABELS[reward.category]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-bb-gray-500">{reward.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-bold text-amber-600">
                        {reward.cost_points.toLocaleString('pt-BR')} pts
                      </span>
                      {reward.stock > 0 && reward.stock < 10 && (
                        <span className="text-xs text-red-500">Restam {reward.stock}</span>
                      )}
                    </div>

                    {!available ? (
                      <Button variant="secondary" className="mt-3 w-full" disabled>
                        Indisponível
                      </Button>
                    ) : isConfirming ? (
                      <div className="mt-3 space-y-2">
                        <p className="text-center text-xs font-medium text-bb-gray-500">
                          Confirma o resgate por {reward.cost_points.toLocaleString('pt-BR')} pontos?
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            className="flex-1"
                            onClick={() => handleRedeem(reward.id)}
                            disabled={redeeming}
                          >
                            {redeeming ? 'Resgatando...' : 'Confirmar'}
                          </Button>
                          <Button variant="ghost" className="flex-1" onClick={() => setConfirmId(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant={canAfford ? 'primary' : 'secondary'}
                        className="mt-3 w-full"
                        onClick={() => setConfirmId(reward.id)}
                        disabled={!canAfford}
                      >
                        {canAfford ? 'Resgatar' : 'Pontos insuficientes'}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {redemptions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-bb-gray-500">Nenhum resgate realizado ainda</p>
            </Card>
          ) : (
            redemptions.map((red) => {
              const statusCfg = STATUS_BADGE[red.status] ?? STATUS_BADGE.pending;
              return (
                <Card key={red.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-bb-black">{red.reward_name}</h3>
                      <p className="mt-0.5 text-xs text-bb-gray-500">
                        {new Date(red.redeemed_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <p className="mt-1 text-sm font-bold text-amber-600">
                        -{red.cost_points.toLocaleString('pt-BR')} pts
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
