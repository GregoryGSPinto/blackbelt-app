'use client';

import { useEffect, useState } from 'react';
import {
  getRewardsStore,
  createStoreReward,
  updateStoreReward,
  deleteStoreReward,
  getAllRedemptions,
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

const CATEGORY_OPTIONS: RewardCategory[] = ['desconto', 'experiencia', 'produto', 'digital', 'prioridade'];

const STATUS_BADGE: Record<string, { label: string; style: React.CSSProperties }> = {
  pending: { label: 'Pendente', style: { background: 'rgba(234,179,8,0.12)', color: '#ca8a04' } },
  delivered: { label: 'Entregue', style: { background: 'rgba(34,197,94,0.12)', color: '#16a34a' } },
  cancelled: { label: 'Cancelado', style: { background: 'rgba(239,68,68,0.12)', color: '#ef4444' } },
};

interface RewardForm {
  name: string;
  description: string;
  image_url: string;
  cost_points: number;
  category: RewardCategory;
  stock: number;
}

const EMPTY_FORM: RewardForm = {
  name: '',
  description: '',
  image_url: '',
  cost_points: 100,
  category: 'desconto',
  stock: 10,
};

export default function AdminRecompensasPage() {
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [rewards, setRewards] = useState<StoreReward[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'rewards' | 'redemptions'>('rewards');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<RewardForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    Promise.all([
      getRewardsStore(getActiveAcademyId()),
      getAllRedemptions(getActiveAcademyId()),
    ])
      .then(([store, reds]) => {
        setRewards(store.rewards);
        setRedemptions(reds);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleEdit(reward: StoreReward) {
    setEditId(reward.id);
    setForm({
      name: reward.name,
      description: reward.description,
      image_url: reward.image_url,
      cost_points: reward.cost_points,
      category: reward.category,
      stock: reward.stock,
    });
    setShowForm(true);
  }

  function handleNew() {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editId) {
        const updated = await updateStoreReward(editId, form);
        setRewards((prev) => prev.map((r) => (r.id === editId ? updated : r)));
      } else {
        const created = await createStoreReward(getActiveAcademyId(), form);
        setRewards((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditId(null);
      setForm({ ...EMPTY_FORM });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(rewardId: string) {
    setDeleting(rewardId);
    try {
      await deleteStoreReward(rewardId);
      setRewards((prev) => prev.filter((r) => r.id !== rewardId));
    } finally {
      setDeleting(null);
    }
  }

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/admin" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Gamificação - Recompensas</h1>
        <Button variant="primary" onClick={handleNew}>Nova Recompensa</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('rewards')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === 'rewards' ? 'bg-bb-primary text-white' : 'bg-bb-gray-100'}`}
          style={tab !== 'rewards' ? { color: 'var(--bb-ink-60)' } : undefined}
        >
          Recompensas ({rewards.length})
        </button>
        <button
          onClick={() => setTab('redemptions')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === 'redemptions' ? 'bg-bb-primary text-white' : 'bg-bb-gray-100'}`}
          style={tab !== 'redemptions' ? { color: 'var(--bb-ink-60)' } : undefined}
        >
          Resgates ({redemptions.length})
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="border-2 border-bb-primary/20 p-5">
          <h2 className="mb-4 text-lg font-bold text-bb-black">
            {editId ? 'Editar Recompensa' : 'Nova Recompensa'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm focus:border-bb-primary focus:outline-none"
                placeholder="Ex: Camiseta da Academia"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>Descrição</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm focus:border-bb-primary focus:outline-none"
                rows={2}
                placeholder="Descrição da recompensa"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>Categoria</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as RewardCategory }))}
                  className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm focus:border-bb-primary focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>URL da Imagem</label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm focus:border-bb-primary focus:outline-none"
                  placeholder="/rewards/imagem.jpg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>Custo (pontos)</label>
                <input
                  type="number"
                  value={form.cost_points}
                  onChange={(e) => setForm((f) => ({ ...f, cost_points: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm focus:border-bb-primary focus:outline-none"
                  min={1}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>Estoque</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm focus:border-bb-primary focus:outline-none"
                  min={0}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleSave} disabled={saving || !form.name}>
                {saving ? 'Salvando...' : editId ? 'Atualizar' : 'Criar'}
              </Button>
              <Button variant="ghost" onClick={() => { setShowForm(false); setEditId(null); }}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {tab === 'rewards' && (
        <div className="space-y-3">
          {rewards.length === 0 ? (
            <Card className="p-8 text-center">
              <p style={{ color: 'var(--bb-ink-60)' }}>Nenhuma recompensa cadastrada</p>
              <Button variant="primary" className="mt-3" onClick={handleNew}>Criar Primeira Recompensa</Button>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bb-gray-200 text-left text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    <th className="pb-2 pr-3">Recompensa</th>
                    <th className="pb-2 pr-3">Categoria</th>
                    <th className="pb-2 pr-3 text-right">Custo</th>
                    <th className="pb-2 pr-3 text-right">Estoque</th>
                    <th className="pb-2 pr-3">Status</th>
                    <th className="pb-2 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map((reward) => (
                    <tr key={reward.id} className="border-b border-bb-gray-100">
                      <td className="py-3 pr-3">
                        <p className="font-medium text-bb-black">{reward.name}</p>
                        <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{reward.description}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <span className="rounded-full bg-bb-gray-100 px-2 py-0.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                          {CATEGORY_LABELS[reward.category]}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right font-bold" style={{ color: '#d97706' }}>
                        {reward.cost_points.toLocaleString('pt-BR')}
                      </td>
                      <td className={`py-3 pr-3 text-right ${reward.stock <= 5 ? 'font-bold' : 'text-bb-black'}`} style={reward.stock <= 5 ? { color: '#ef4444' } : undefined}>
                        {reward.stock}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            reward.status !== 'available' && reward.status !== 'out_of_stock' ? 'bg-bb-gray-100' : ''
                          }`}
                          style={
                            reward.status === 'available'
                              ? { background: 'rgba(34,197,94,0.12)', color: '#16a34a' }
                              : reward.status === 'out_of_stock'
                                ? { background: 'rgba(239,68,68,0.12)', color: '#ef4444' }
                                : { color: 'var(--bb-ink-60)' }
                          }
                        >
                          {reward.status === 'available' ? 'Ativo' : reward.status === 'out_of_stock' ? 'Esgotado' : 'Expirado'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" className="!px-2 !py-1 !text-xs" onClick={() => handleEdit(reward)}>
                            Editar
                          </Button>
                          <Button
                            variant="danger"
                            className="!px-2 !py-1 !text-xs"
                            onClick={() => handleDelete(reward.id)}
                            disabled={deleting === reward.id}
                          >
                            {deleting === reward.id ? '...' : 'Excluir'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'redemptions' && (
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold text-bb-black">Histórico de Resgates</h2>
          {redemptions.length === 0 ? (
            <p className="text-center" style={{ color: 'var(--bb-ink-60)' }}>Nenhum resgate realizado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bb-gray-200 text-left text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    <th className="pb-2 pr-3">Aluno</th>
                    <th className="pb-2 pr-3">Recompensa</th>
                    <th className="pb-2 pr-3 text-right">Pontos</th>
                    <th className="pb-2 pr-3">Data</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map((red) => {
                    const sCfg = STATUS_BADGE[red.status] ?? STATUS_BADGE.pending;
                    return (
                      <tr key={red.id} className="border-b border-bb-gray-100">
                        <td className="py-3 pr-3 font-medium text-bb-black">{red.user_name ?? red.user_id}</td>
                        <td className="py-3 pr-3" style={{ color: 'var(--bb-ink-60)' }}>{red.reward_name}</td>
                        <td className="py-3 pr-3 text-right font-bold" style={{ color: '#d97706' }}>
                          {red.cost_points.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 pr-3 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                          {new Date(red.redeemed_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3">
                          <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={sCfg.style}>
                            {sCfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
