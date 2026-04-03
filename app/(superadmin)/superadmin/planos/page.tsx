'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/lib/hooks/useToast';
import { getPlans, updatePlan, createPlan, togglePlanActive, deletePlan, getAcademyCountByPlan } from '@/lib/api/plans.service';
import { ALL_FEATURES, CATEGORY_LABELS } from '@/lib/constants/plan-features';
import type { Plan, PlanFormData, PlanTier } from '@/lib/types/plan';
import { translateError } from '@/lib/utils/error-translator';

// ─── Helpers ──────────────────────────────────────────────────

function fmtBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function limitDisplay(val: number | null): string {
  return val === null ? 'Ilimitados' : String(val);
}

// ─── Skeleton ─────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6 p-6 pb-20">
      <Skeleton variant="text" className="h-8 w-64" />
      <Skeleton variant="text" className="h-5 w-96" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-24" />
        ))}
      </div>
      <Skeleton variant="card" className="h-64" />
    </div>
  );
}

// ─── Plan Modal ───────────────────────────────────────────────

interface PlanModalProps {
  plan: Plan | null;
  onClose: () => void;
  onSave: (data: PlanFormData) => void;
  saving: boolean;
}

function PlanModal({ plan, onClose, onSave, saving }: PlanModalProps) {
  const isNew = !plan;
  const [name, setName] = useState(plan?.name ?? '');
  const [tier, setTier] = useState<PlanTier>(plan?.tier ?? 'starter');
  const [priceMonthly, setPriceMonthly] = useState(plan ? plan.price_monthly / 100 : 0);
  const [isCustomPrice, setIsCustomPrice] = useState(plan?.is_custom_price ?? false);
  const [maxAlunos, setMaxAlunos] = useState(plan?.limits.max_alunos ?? 0);
  const [alunosIlimitado, setAlunosIlimitado] = useState(plan?.limits.max_alunos === null);
  const [maxProfs, setMaxProfs] = useState(plan?.limits.max_professores ?? 0);
  const [profsIlimitado, setProfsIlimitado] = useState(plan?.limits.max_professores === null);
  const [maxUnidades, setMaxUnidades] = useState(plan?.limits.max_unidades ?? 0);
  const [unidadesIlimitado, setUnidadesIlimitado] = useState(plan?.limits.max_unidades === null);
  const [maxStorage, setMaxStorage] = useState(plan?.limits.max_storage_gb ?? 5);
  const [maxTurmas, setMaxTurmas] = useState(plan?.limits.max_turmas ?? 0);
  const [turmasIlimitado, setTurmasIlimitado] = useState(plan?.limits.max_turmas === null);
  const [alunoExtra, setAlunoExtra] = useState((plan?.overage_rates.aluno_extra ?? 300) / 100);
  const [profExtra, setProfExtra] = useState((plan?.overage_rates.professor_extra ?? 1500) / 100);
  const [unidadeExtra, setUnidadeExtra] = useState((plan?.overage_rates.unidade_extra ?? 4900) / 100);
  const [storageExtra, setStorageExtra] = useState((plan?.overage_rates.storage_extra_gb ?? 50) / 100);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    plan?.features.filter((f) => f.included).map((f) => f.id) ?? [],
  );
  const [isPopular, setIsPopular] = useState(plan?.is_popular ?? false);
  const [isActive, setIsActive] = useState(plan?.is_active ?? true);
  const [trialDays, setTrialDays] = useState(plan?.trial_days ?? 7);

  function toggleFeature(id: string) {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  }

  function handleSubmit() {
    onSave({
      name,
      tier,
      price_monthly: Math.round(priceMonthly * 100),
      is_custom_price: isCustomPrice,
      limits: {
        max_alunos: alunosIlimitado ? null : maxAlunos,
        max_professores: profsIlimitado ? null : maxProfs,
        max_unidades: unidadesIlimitado ? null : maxUnidades,
        max_storage_gb: maxStorage,
        max_turmas: turmasIlimitado ? null : maxTurmas,
      },
      overage_rates: {
        aluno_extra: Math.round(alunoExtra * 100),
        professor_extra: Math.round(profExtra * 100),
        unidade_extra: Math.round(unidadeExtra * 100),
        storage_extra_gb: Math.round(storageExtra * 100),
      },
      features: selectedFeatures,
      is_popular: isPopular,
      is_active: isActive,
      trial_days: trialDays,
    });
  }

  const groupedFeatures = useMemo(() => {
    const groups: Record<string, typeof ALL_FEATURES> = {};
    for (const f of ALL_FEATURES) {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    }
    return groups;
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-10 pb-10" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div
        className="w-full max-w-2xl rounded-xl p-6"
        style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            {isNew ? 'Novo Plano' : `Editar Plano: ${plan.name}`}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg"
            style={{ color: 'var(--bb-ink-40)' }}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          {/* Nome e Tier */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Nome do Plano</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as PlanTier)}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
              >
                <option value="starter">Starter</option>
                <option value="essencial">Essencial</option>
                <option value="pro">Pro</option>
                <option value="blackbelt">Black Belt</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          {/* Preco */}
          <div>
            <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Preço Mensal (R$)</label>
            <input
              type="number"
              value={priceMonthly}
              onChange={(e) => setPriceMonthly(Number(e.target.value))}
              disabled={isCustomPrice}
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)', opacity: isCustomPrice ? 0.5 : 1 }}
            />
            <label className="mt-2 flex items-center gap-2 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              <input type="checkbox" checked={isCustomPrice} onChange={(e) => setIsCustomPrice(e.target.checked)} />
              Sob consulta (sem preço fixo)
            </label>
          </div>

          {/* Limites */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Limites</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LimitField label="Máx. Alunos" value={maxAlunos} onChange={setMaxAlunos} unlimited={alunosIlimitado} onToggle={setAlunosIlimitado} />
              <LimitField label="Máx. Professores" value={maxProfs} onChange={setMaxProfs} unlimited={profsIlimitado} onToggle={setProfsIlimitado} />
              <LimitField label="Máx. Unidades" value={maxUnidades} onChange={setMaxUnidades} unlimited={unidadesIlimitado} onToggle={setUnidadesIlimitado} />
              <LimitField label="Máx. Turmas" value={maxTurmas} onChange={setMaxTurmas} unlimited={turmasIlimitado} onToggle={setTurmasIlimitado} />
              <div>
                <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Storage (GB)</label>
                <input
                  type="number"
                  value={maxStorage}
                  onChange={(e) => setMaxStorage(Number(e.target.value))}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                />
              </div>
            </div>
          </div>

          {/* Excedentes */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Excedentes</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>Aluno extra (R$)</label>
                <input type="number" step="0.01" value={alunoExtra} onChange={(e) => setAlunoExtra(Number(e.target.value))} className="w-full rounded-lg px-2 py-1.5 text-sm" style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
              </div>
              <div>
                <label className="mb-1 block text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>Prof. extra (R$)</label>
                <input type="number" step="0.01" value={profExtra} onChange={(e) => setProfExtra(Number(e.target.value))} className="w-full rounded-lg px-2 py-1.5 text-sm" style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
              </div>
              <div>
                <label className="mb-1 block text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>Unidade extra (R$)</label>
                <input type="number" step="0.01" value={unidadeExtra} onChange={(e) => setUnidadeExtra(Number(e.target.value))} className="w-full rounded-lg px-2 py-1.5 text-sm" style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
              </div>
              <div>
                <label className="mb-1 block text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>Storage extra/GB (R$)</label>
                <input type="number" step="0.01" value={storageExtra} onChange={(e) => setStorageExtra(Number(e.target.value))} className="w-full rounded-lg px-2 py-1.5 text-sm" style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Features Incluídas</p>
            {Object.entries(groupedFeatures).map(([cat, features]) => (
              <div key={cat} className="mb-3">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--bb-brand)' }}>
                  {CATEGORY_LABELS[cat] ?? cat}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {features.map((f) => (
                    <label key={f.id} className="flex items-center gap-2 rounded-md px-2 py-1 text-xs cursor-pointer" style={{ color: 'var(--bb-ink-80)' }}>
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(f.id)}
                        onChange={() => toggleFeature(f.id)}
                      />
                      {f.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Popular + Trial */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--bb-ink-80)' }}>
              <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} />
              Marcar como &quot;Mais Popular&quot;
            </label>
            <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--bb-ink-80)' }}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Plano ativo
            </label>
            <div>
              <label className="mb-1 block text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>Dias de trial</label>
              <input type="number" value={trialDays} onChange={(e) => setTrialDays(Number(e.target.value))} className="w-full rounded-lg px-2 py-1.5 text-sm" style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={saving || !name.trim()}>
              {saving ? 'Salvando...' : isNew ? 'Criar Plano' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LimitField({ label, value, onChange, unlimited, onToggle }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unlimited: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={unlimited}
          className="flex-1 rounded-lg px-3 py-2 text-sm"
          style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)', opacity: unlimited ? 0.5 : 1 }}
        />
        <label className="flex shrink-0 items-center gap-1 text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>
          <input type="checkbox" checked={unlimited} onChange={(e) => onToggle(e.target.checked)} />
          Ilimitado
        </label>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ──────────────────────────────────────────

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-sm rounded-xl p-6" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
        <h3 className="mb-2 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>{title}</h3>
        <p className="mb-4 text-xs leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────

export default function PlanosPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [academyCounts, setAcademyCounts] = useState<Record<string, number>>({});
  const [modalPlan, setModalPlan] = useState<Plan | null | 'new'>(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmDialogProps | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [p, counts] = await Promise.all([getPlans(), getAcademyCountByPlan()]);
      setPlans(p);
      setAcademyCounts(counts);
    } catch (err) {
      toast(translateError(err), 'error');
      setLoadError('Nao foi possivel carregar os planos.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Stats ────────────────────────────────────────────────

  const totalPlans = plans.length;
  const activePlans = plans.filter((p) => p.is_active).length;
  const popularPlan = plans.find((p) => p.is_popular);
  const totalAcademies = Object.values(academyCounts).reduce((s, v) => s + v, 0);
  const totalMRR = plans.reduce((sum, p) => {
    const count = academyCounts[p.id] ?? 0;
    return sum + (p.price_monthly * count);
  }, 0);

  // ── Handlers ─────────────────────────────────────────────

  async function handleSave(data: PlanFormData) {
    setSaving(true);
    try {
      if (modalPlan === 'new') {
        await createPlan(data);
        toast('Plano criado com sucesso', 'success');
      } else if (modalPlan) {
        const priceChanged = data.price_monthly !== modalPlan.price_monthly;
        if (priceChanged) {
          setConfirm({
            title: 'Alterar preço',
            message: 'O novo preço será aplicado apenas a novos cadastros. Academias existentes mantêm o valor atual até renovação. Confirmar?',
            confirmLabel: 'Confirmar',
            onConfirm: async () => {
              setConfirm(null);
              await updatePlan(modalPlan.id, data);
              toast('Plano atualizado com sucesso', 'success');
              setModalPlan(null);
              await loadData();
            },
            onCancel: () => setConfirm(null),
          });
          setSaving(false);
          return;
        }
        await updatePlan(modalPlan.id, data);
        toast('Plano atualizado com sucesso', 'success');
      }
      setModalPlan(null);
      await loadData();
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleToggle(plan: Plan) {
    const count = academyCounts[plan.id] ?? 0;
    if (plan.is_active && count > 0) {
      setConfirm({
        title: 'Desativar plano',
        message: `Este plano tem ${count} academia${count !== 1 ? 's' : ''}. Elas manterão o plano atual mas novos cadastros não poderão selecionar este plano. Continuar?`,
        confirmLabel: 'Desativar',
        onConfirm: async () => {
          setConfirm(null);
          try {
            await togglePlanActive(plan.id);
            toast(plan.is_active ? 'Plano desativado' : 'Plano ativado', 'success');
            await loadData();
          } catch (err) {
            toast(translateError(err), 'error');
          }
        },
        onCancel: () => setConfirm(null),
      });
    } else {
      togglePlanActive(plan.id).then(() => {
        toast(plan.is_active ? 'Plano desativado' : 'Plano ativado', 'success');
        loadData();
      }).catch((err) => toast(translateError(err), 'error'));
    }
  }

  function handleDelete(plan: Plan) {
    const count = academyCounts[plan.id] ?? 0;
    if (count > 0) {
      setConfirm({
        title: 'Não é possível excluir',
        message: `${count} academia${count !== 1 ? 's' : ''} usa${count !== 1 ? 'm' : ''} este plano. Desative-o em vez disso.`,
        confirmLabel: 'Entendi',
        onConfirm: () => setConfirm(null),
        onCancel: () => setConfirm(null),
      });
    } else {
      setConfirm({
        title: 'Excluir plano',
        message: `Tem certeza que deseja excluir o plano "${plan.name}"? Esta ação não pode ser desfeita.`,
        confirmLabel: 'Excluir',
        onConfirm: async () => {
          setConfirm(null);
          try {
            await deletePlan(plan.id);
            toast('Plano excluído', 'success');
            await loadData();
          } catch (err) {
            toast(translateError(err), 'error');
          }
        },
        onCancel: () => setConfirm(null),
      });
    }
  }

  // ── Loading ───────────────────────────────────────────────

  if (loading) return <PageSkeleton />;

  if (loadError && plans.length === 0) {
    return (
      <div className="p-6">
        <ErrorState
          title="Planos indisponiveis"
          description={loadError}
          onRetry={loadData}
        />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Gestão de Planos
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Criar, editar e gerenciar planos da plataforma
          </p>
        </div>
        <Button variant="primary" onClick={() => setModalPlan('new')}>
          + Novo Plano
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Planos" value={String(totalPlans)} icon="📋" />
        <StatCard label="Ativos" value={String(activePlans)} icon="✅" />
        <StatCard label="Mais Popular" value={popularPlan?.name ?? '-'} icon="⭐" />
        <StatCard label="MRR Total" value={fmtBRL(totalMRR)} icon="💰" />
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
        <div className="min-w-full rounded-xl" style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
          <div
            className="grid grid-cols-8 gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--bb-ink-40)', borderBottom: '1px solid var(--bb-glass-border)' }}
          >
            <span>Plano</span>
            <span>Preço/mês</span>
            <span>Alunos</span>
            <span>Professores</span>
            <span>Unidades</span>
            <span>Academias</span>
            <span>Status</span>
            <span>Ações</span>
          </div>
          {plans.map((plan) => {
            const count = academyCounts[plan.id] ?? 0;
            return (
              <div
                key={plan.id}
                className="grid grid-cols-8 items-center gap-4 px-5 py-3"
                style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
              >
                <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                  {plan.name}
                  {plan.is_popular && (
                    <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ background: 'var(--bb-warning-surface)', color: 'var(--bb-warning)' }}>
                      ⭐
                    </span>
                  )}
                </span>
                <span className="text-sm font-bold" style={{ color: 'var(--bb-warning)' }}>
                  {plan.is_custom_price ? 'Sob consulta' : fmtBRL(plan.price_monthly)}
                </span>
                <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>{limitDisplay(plan.limits.max_alunos)}</span>
                <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>{limitDisplay(plan.limits.max_professores)}</span>
                <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>{limitDisplay(plan.limits.max_unidades)}</span>
                <span className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>{count}</span>
                <span>
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                    style={{
                      background: plan.is_active ? 'var(--bb-success-surface)' : 'var(--bb-error-surface)',
                      color: plan.is_active ? 'var(--bb-success)' : 'var(--bb-error)',
                    }}
                  >
                    {plan.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setModalPlan(plan)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors"
                    style={{ color: 'var(--bb-ink-60)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    title="Editar"
                    aria-label={`Editar plano ${plan.name}`}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleToggle(plan)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors"
                    style={{ color: 'var(--bb-ink-60)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    title={plan.is_active ? 'Desativar' : 'Ativar'}
                    aria-label={`${plan.is_active ? 'Desativar' : 'Ativar'} plano ${plan.name}`}
                  >
                    🔄
                  </button>
                  <button
                    onClick={() => handleDelete(plan)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors"
                    style={{ color: 'var(--bb-ink-60)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    title="Excluir"
                    aria-label={`Excluir plano ${plan.name}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 lg:hidden">
        {plans.map((plan) => {
          const count = academyCounts[plan.id] ?? 0;
          return (
            <Card key={plan.id} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                    {plan.name}
                  </span>
                  {plan.is_popular && <span className="text-xs">⭐</span>}
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                    style={{
                      background: plan.is_active ? 'var(--bb-success-surface)' : 'var(--bb-error-surface)',
                      color: plan.is_active ? 'var(--bb-success)' : 'var(--bb-error)',
                    }}
                  >
                    {plan.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--bb-warning)' }}>
                  {plan.is_custom_price ? 'Sob consulta' : fmtBRL(plan.price_monthly)}
                </span>
              </div>
              <div className="mb-3 grid grid-cols-2 gap-2">
                <MiniStat label="Alunos" value={limitDisplay(plan.limits.max_alunos)} />
                <MiniStat label="Professores" value={limitDisplay(plan.limits.max_professores)} />
                <MiniStat label="Unidades" value={limitDisplay(plan.limits.max_unidades)} />
                <MiniStat label="Academias" value={String(count)} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setModalPlan(plan)}>Editar</Button>
                <Button size="sm" variant="ghost" onClick={() => handleToggle(plan)}>{plan.is_active ? 'Desativar' : 'Ativar'}</Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(plan)}>Excluir</Button>
              </div>
            </Card>
          );
        })}
      </div>

      {plans.length === 0 && (
        <div className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
          Nenhum plano cadastrado. Clique em &quot;+ Novo Plano&quot; para começar.
        </div>
      )}

      {/* Distribution Chart */}
      {plans.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Distribuição de Academias por Plano
          </h3>
          <div className="space-y-3">
            {plans.filter((p) => p.is_active).map((plan) => {
              const count = academyCounts[plan.id] ?? 0;
              const pct = totalAcademies > 0 ? (count / totalAcademies) * 100 : 0;
              return (
                <div key={plan.id}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{plan.name}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--bb-warning)' }}>{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full" style={{ background: 'var(--bb-depth-1)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--bb-warning)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Revenue by Plan */}
      {plans.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Receita por Plano
          </h3>
          <div className="space-y-3">
            {plans.filter((p) => p.is_active && !p.is_custom_price).map((plan) => {
              const count = academyCounts[plan.id] ?? 0;
              const revenue = plan.price_monthly * count;
              const pct = totalMRR > 0 ? (revenue / totalMRR) * 100 : 0;
              return (
                <div key={plan.id}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{plan.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: 'var(--bb-warning)' }}>{fmtBRL(revenue)}</span>
                      <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>({count} academia{count !== 1 ? 's' : ''})</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full" style={{ background: 'var(--bb-depth-1)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--bb-brand)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {modalPlan !== null && (
        <PlanModal
          plan={modalPlan === 'new' ? null : modalPlan}
          onClose={() => setModalPlan(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {/* Confirm Dialog */}
      {confirm && <ConfirmDialog {...confirm} />}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <div>
          <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{value}</p>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>{label}</p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-2" style={{ background: 'var(--bb-depth-4)' }}>
      <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>{value}</p>
    </div>
  );
}
