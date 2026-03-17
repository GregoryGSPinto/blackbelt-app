'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import type { AcademyFull, PlatformPlan, AcademyStatus, CreateAcademyPayload, OnboardToken } from '@/lib/types';
import {
  listAcademies,
  listPlans,
  createAcademy,
  suspendAcademy,
  reactivateAcademy,
} from '@/lib/api/superadmin.service';

// ── Constants ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'Ativa' },
  trial: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Trial' },
  suspended: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'Suspensa' },
  pending: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'Pendente' },
  cancelled: { bg: 'rgba(156,163,175,0.15)', text: 'var(--bb-ink-60)', label: 'Cancelada' },
};

type FilterType = 'todos' | AcademyStatus;

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getOnboardUrl(token: string): string {
  if (typeof window !== 'undefined') return `${window.location.origin}/onboarding?token=${token}`;
  return `/onboarding?token=${token}`;
}

// ── Page ────────────────────────────────────────────────────────────────

export default function AcademiasPage() {
  const { toast } = useToast();

  const [academies, setAcademies] = useState<AcademyFull[]>([]);
  const [plans, setPlans] = useState<PlatformPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('todos');
  const [search, setSearch] = useState('');

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formPlanId, setFormPlanId] = useState('');
  const [formTrialDays, setFormTrialDays] = useState(30);
  const [formNotes, setFormNotes] = useState('');
  const [creating, setCreating] = useState(false);

  // Created result
  const [createdToken, setCreatedToken] = useState<OnboardToken | null>(null);

  // Confirm action
  const [confirmAction, setConfirmAction] = useState<{
    type: 'suspend' | 'reactivate';
    academy: AcademyFull;
  } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [a, p] = await Promise.all([listAcademies(), listPlans()]);
      setAcademies(a);
      setPlans(p);
      if (p.length > 0 && !formPlanId) setFormPlanId(p[0].id);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Filtered ───────────────────────────────────────────────────────

  const filtered = academies.filter((a) => {
    if (filter !== 'todos' && a.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !a.name.toLowerCase().includes(q) &&
        !(a.city ?? '').toLowerCase().includes(q) &&
        !(a.owner_name ?? '').toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  // ── Actions ────────────────────────────────────────────────────────

  function resetForm() {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCity('');
    setFormState('');
    setFormPlanId(plans[0]?.id ?? '');
    setFormTrialDays(30);
    setFormNotes('');
    setShowCreate(false);
  }

  async function handleCreate() {
    if (!formName.trim()) { toast('Nome da academia e obrigatorio.', 'error'); return; }
    setCreating(true);
    try {
      const payload: CreateAcademyPayload = {
        name: formName.trim(),
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        city: formCity.trim() || undefined,
        state: formState.trim() || undefined,
        plan_id: formPlanId,
        trial_days: formTrialDays,
        notes: formNotes.trim() || undefined,
      };
      const result = await createAcademy(payload);
      setAcademies((prev) => [result.academy, ...prev]);
      setCreatedToken(result.onboardToken);
      toast('Academia criada! Link de onboarding gerado.', 'success');
      resetForm();
    } catch {
      toast('Erro ao criar academia.', 'error');
    } finally {
      setCreating(false);
    }
  }

  async function handleSuspend(academy: AcademyFull) {
    try {
      const updated = await suspendAcademy(academy.id);
      setAcademies((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      toast('Academia suspensa.', 'success');
    } catch { toast('Erro ao suspender.', 'error'); }
    setConfirmAction(null);
  }

  async function handleReactivate(academy: AcademyFull) {
    try {
      const updated = await reactivateAcademy(academy.id);
      setAcademies((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      toast('Academia reativada.', 'success');
    } catch { toast('Erro ao reativar.', 'error'); }
    setConfirmAction(null);
  }

  async function handleCopyOnboardLink(token: string) {
    await navigator.clipboard.writeText(getOnboardUrl(token));
    toast('Link copiado!', 'success');
  }

  // ── Loading ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-28" />)}
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────

  const filterOptions: Array<{ key: FilterType; label: string }> = [
    { key: 'todos', label: 'Todas' },
    { key: 'active', label: 'Ativas' },
    { key: 'trial', label: 'Trial' },
    { key: 'suspended', label: 'Suspensas' },
    { key: 'pending', label: 'Pendentes' },
  ];

  const filterCounts: Record<string, number> = {
    todos: academies.length,
    active: academies.filter((a) => a.status === 'active').length,
    trial: academies.filter((a) => a.status === 'trial').length,
    suspended: academies.filter((a) => a.status === 'suspended').length,
    pending: academies.filter((a) => a.status === 'pending').length,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Academias</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Gerencie todas as academias da plataforma
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Nova Academia</Button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((f) => {
            const isActive = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                style={{
                  background: isActive ? 'rgba(245,158,11,0.12)' : 'var(--bb-depth-3)',
                  color: isActive ? '#f59e0b' : 'var(--bb-ink-60)',
                  border: `1px solid ${isActive ? '#f59e0b' : 'var(--bb-glass-border)'}`,
                }}
              >
                {f.label}
                <span
                  className="rounded-full px-1.5 py-0.5 text-xs"
                  style={{
                    background: isActive ? '#f59e0b' : 'var(--bb-depth-4)',
                    color: isActive ? '#fff' : 'var(--bb-ink-60)',
                  }}
                >
                  {filterCounts[f.key]}
                </span>
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, cidade..."
          className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none sm:w-64"
          style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
        />
      </div>

      {/* Academies List */}
      <div className="space-y-3">
        {filtered.map((academy) => {
          const st = STATUS_STYLES[academy.status] ?? STATUS_STYLES.active;
          const studentsPercent = academy.max_students > 0
            ? Math.min(((academy.total_students ?? 0) / academy.max_students) * 100, 100)
            : 0;

          return (
            <Card key={academy.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/superadmin/academias/${academy.id}`}
                      className="truncate text-base font-semibold hover:underline"
                      style={{ color: 'var(--bb-ink-100)' }}
                    >
                      {academy.name}
                    </Link>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: st.bg, color: st.text }}
                    >
                      {st.label}
                    </span>
                    {academy.plan && (
                      <span
                        className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
                        style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                      >
                        {academy.plan.name}
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    {academy.city && <span>{academy.city}/{academy.state}</span>}
                    {academy.owner_name && <span>Dono: {academy.owner_name}</span>}
                    <span>MRR: {formatCurrency(academy.monthly_revenue ?? 0)}</span>
                  </div>

                  {/* Usage bar */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                        <span>Alunos: {academy.total_students ?? 0}/{academy.max_students}</span>
                        <span>{Math.round(studentsPercent)}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-4)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${studentsPercent}%`,
                            background: studentsPercent >= 90 ? '#ef4444' : studentsPercent >= 70 ? '#f59e0b' : '#22c55e',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-2">
                  <Link href={`/superadmin/academias/${academy.id}`}>
                    <button
                      className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                      style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
                    >
                      Detalhes
                    </button>
                  </Link>
                  {academy.status === 'active' || academy.status === 'trial' ? (
                    <button
                      onClick={() => setConfirmAction({ type: 'suspend', academy })}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                    >
                      Suspender
                    </button>
                  ) : academy.status === 'suspended' ? (
                    <button
                      onClick={() => setConfirmAction({ type: 'reactivate', academy })}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium"
                      style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
                    >
                      Reativar
                    </button>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Nenhuma academia encontrada.
          </div>
        )}
      </div>

      {/* ─── Create Modal ──────────────────────────────────────────── */}
      <Modal open={showCreate} onClose={resetForm} title="Nova Academia">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Nome da academia *</label>
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex: Guerreiros BJJ"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Email do dono</label>
              <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="dono@academia.com"
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Telefone</label>
              <input type="tel" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="(11) 99999-9999"
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Cidade</label>
              <input type="text" value={formCity} onChange={(e) => setFormCity(e.target.value)} placeholder="Sao Paulo"
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Estado</label>
              <input type="text" value={formState} onChange={(e) => setFormState(e.target.value)} placeholder="SP" maxLength={2}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Plano *</label>
              <select value={formPlanId} onChange={(e) => setFormPlanId(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price_monthly)}/mes</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Trial (dias)</label>
              <select value={formTrialDays} onChange={(e) => setFormTrialDays(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
              >
                <option value={0}>Sem trial</option>
                <option value={7}>7 dias</option>
                <option value={15}>15 dias</option>
                <option value={30}>30 dias</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Notas internas</label>
            <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={2} placeholder="Notas sobre esta academia..."
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={resetForm}>Cancelar</Button>
            <Button className="flex-1" disabled={!formName.trim()} loading={creating} onClick={handleCreate}>
              Criar e Gerar Link
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── Created Token Modal ───────────────────────────────────── */}
      <Modal open={!!createdToken} onClose={() => setCreatedToken(null)} title="Link de Onboarding Gerado">
        {createdToken && (
          <div className="space-y-4">
            <div
              className="rounded-lg p-4 text-center"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              <span className="text-3xl">✅</span>
              <p className="mt-2 text-sm font-semibold" style={{ color: '#22c55e' }}>
                Academia &quot;{createdToken.academy_name}&quot; criada!
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Envie este link para o dono da academia:
              </label>
              <div className="flex gap-2">
                <code
                  className="flex-1 truncate rounded-lg px-3 py-2 text-xs"
                  style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
                >
                  {getOnboardUrl(createdToken.token)}
                </code>
                <Button size="sm" onClick={() => handleCopyOnboardLink(createdToken.token)}>
                  Copiar
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Ola! Sua academia *${createdToken.academy_name}* foi cadastrada no BlackBelt.\nClique no link abaixo para configurar sua conta:\n${getOnboardUrl(createdToken.token)}\nPlano: ${createdToken.plan_name} · Trial: ${createdToken.trial_days} dias`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
              >
                WhatsApp
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(`Cadastro BlackBelt — ${createdToken.academy_name}`)}&body=${encodeURIComponent(
                  `Ola!\n\nSua academia "${createdToken.academy_name}" foi cadastrada no BlackBelt.\n\nClique no link abaixo para configurar sua conta:\n${getOnboardUrl(createdToken.token)}\n\nPlano: ${createdToken.plan_name}\nTrial: ${createdToken.trial_days} dias`
                )}`}
                className="flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors"
                style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}
              >
                Email
              </a>
            </div>

            <Button className="w-full" onClick={() => setCreatedToken(null)}>Fechar</Button>
          </div>
        )}
      </Modal>

      {/* ─── Confirm Modal ─────────────────────────────────────────── */}
      <Modal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.type === 'suspend' ? 'Suspender academia' : 'Reativar academia'}
      >
        {confirmAction && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              {confirmAction.type === 'suspend'
                ? `Tem certeza que deseja suspender "${confirmAction.academy.name}"? Os usuarios da academia nao poderao acessar o sistema.`
                : `Tem certeza que deseja reativar "${confirmAction.academy.name}"?`}
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setConfirmAction(null)}>Cancelar</Button>
              <Button
                className="flex-1"
                onClick={() => confirmAction.type === 'suspend'
                  ? handleSuspend(confirmAction.academy)
                  : handleReactivate(confirmAction.academy)
                }
              >
                {confirmAction.type === 'suspend' ? 'Suspender' : 'Reativar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
