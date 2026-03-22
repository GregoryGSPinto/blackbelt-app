'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  generateSignupLink,
} from '@/lib/api/superadmin.service';
import {
  getHealthOverview,
  listAcademiaHealthScores,
  type HealthOverview,
  type AcademiaHealthScore,
} from '@/lib/api/superadmin-health.service';
import { startImpersonation } from '@/lib/api/superadmin-impersonate.service';
import { translateError } from '@/lib/utils/error-translator';

// ── Constants ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'Ativa' },
  trial: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Trial' },
  suspended: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'Suspensa' },
  pending: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'Pendente' },
  cancelled: { bg: 'rgba(156,163,175,0.15)', text: 'var(--bb-ink-60)', label: 'Cancelada' },
};

type FilterType = 'todos' | AcademyStatus;

type HealthFilterType = 'todos' | 'critico' | 'risco' | 'atencao' | 'saudavel' | 'excelente';

type SortField = 'name' | 'health';
type SortDir = 'asc' | 'desc';

const HEALTH_FILTER_OPTIONS: Array<{ key: HealthFilterType; label: string; min: number; max: number }> = [
  { key: 'todos', label: 'Todos', min: 0, max: 100 },
  { key: 'critico', label: 'Critico (<20)', min: 0, max: 19 },
  { key: 'risco', label: 'Risco (20-40)', min: 20, max: 40 },
  { key: 'atencao', label: 'Atencao (40-60)', min: 41, max: 60 },
  { key: 'saudavel', label: 'Saudavel (60-80)', min: 61, max: 80 },
  { key: 'excelente', label: 'Excelente (80+)', min: 81, max: 100 },
];

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getOnboardUrl(token: string): string {
  if (typeof window !== 'undefined') return `${window.location.origin}/onboarding?token=${token}`;
  return `/onboarding?token=${token}`;
}

function getSignupUrl(token: string): string {
  if (typeof window !== 'undefined') return `${window.location.origin}/cadastrar-academia?ref=${token}`;
  return `/cadastrar-academia?ref=${token}`;
}

function getHealthColor(score: number): string {
  if (score <= 20) return '#991b1b';
  if (score <= 40) return '#ef4444';
  if (score <= 60) return '#eab308';
  if (score <= 80) return '#86efac';
  return '#22c55e';
}

function getHealthBgColor(score: number): string {
  if (score <= 20) return 'rgba(153,27,27,0.15)';
  if (score <= 40) return 'rgba(239,68,68,0.15)';
  if (score <= 60) return 'rgba(234,179,8,0.15)';
  if (score <= 80) return 'rgba(134,239,172,0.15)';
  return 'rgba(34,197,94,0.15)';
}

function getTrendArrow(tendencia: 'subindo' | 'estavel' | 'caindo'): { symbol: string; color: string } {
  if (tendencia === 'subindo') return { symbol: '\u2191', color: '#22c55e' };
  if (tendencia === 'caindo') return { symbol: '\u2193', color: '#ef4444' };
  return { symbol: '\u2192', color: 'var(--bb-ink-40)' };
}

const DISTRIBUTION_META: Record<string, { label: string; color: string }> = {
  critico: { label: 'Critico', color: '#991b1b' },
  risco: { label: 'Risco', color: '#f97316' },
  atencao: { label: 'Atencao', color: '#eab308' },
  saudavel: { label: 'Saudavel', color: '#22c55e' },
  excelente: { label: 'Excelente', color: '#15803d' },
};

// ── Page ────────────────────────────────────────────────────────────────

export default function AcademiasPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [academies, setAcademies] = useState<AcademyFull[]>([]);
  const [plans, setPlans] = useState<PlatformPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('todos');
  const [search, setSearch] = useState('');

  // Health data
  const [healthOverview, setHealthOverview] = useState<HealthOverview | null>(null);
  const [healthScores, setHealthScores] = useState<AcademiaHealthScore[]>([]);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthFilter, setHealthFilter] = useState<HealthFilterType>('todos');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Expandable rows
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Impersonation loading
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

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

  // Generate signup link modal
  const [showSignupLink, setShowSignupLink] = useState(false);
  const [signupNotes, setSignupNotes] = useState('');
  const [signupExpiry, setSignupExpiry] = useState(7);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<OnboardToken | null>(null);

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

  const loadHealthData = useCallback(async () => {
    setHealthLoading(true);
    try {
      const [overview, scores] = await Promise.all([
        getHealthOverview(),
        listAcademiaHealthScores(),
      ]);
      setHealthOverview(overview);
      setHealthScores(scores);
    } catch {
      // Health data is supplementary, don't block the page
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadHealthData(); }, [loadHealthData]);

  // ── Health score map by academy id and name ──────────────────────────

  const healthMap = useMemo(() => {
    const map = new Map<string, AcademiaHealthScore>();
    for (const hs of healthScores) {
      map.set(hs.academiaId, hs);
    }
    return map;
  }, [healthScores]);

  /** Try to find health score for an academy — match by id first, then by name */
  function findHealthScore(academy: AcademyFull): AcademiaHealthScore | null {
    const byId = healthMap.get(academy.id);
    if (byId) return byId;
    // Fallback: match by name
    return healthScores.find(
      (hs) => hs.academiaNome.toLowerCase() === academy.name.toLowerCase(),
    ) ?? null;
  }

  // ── Filtered & Sorted ───────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = academies.filter((a) => {
      if (filter !== 'todos' && a.status !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !a.name.toLowerCase().includes(q) &&
          !(a.city ?? '').toLowerCase().includes(q) &&
          !(a.owner_name ?? '').toLowerCase().includes(q)
        ) return false;
      }
      // Health filter
      if (healthFilter !== 'todos') {
        const hs = findHealthScore(a);
        if (!hs) return false;
        const opt = HEALTH_FILTER_OPTIONS.find((o) => o.key === healthFilter);
        if (opt && (hs.score < opt.min || hs.score > opt.max)) return false;
      }
      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortField === 'name') {
        const cmp = a.name.localeCompare(b.name, 'pt-BR');
        return sortDir === 'asc' ? cmp : -cmp;
      }
      if (sortField === 'health') {
        const sa = findHealthScore(a)?.score ?? -1;
        const sb = findHealthScore(b)?.score ?? -1;
        return sortDir === 'asc' ? sa - sb : sb - sa;
      }
      return 0;
    });

    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academies, filter, search, healthFilter, healthScores, sortField, sortDir]);

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
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setCreating(false);
    }
  }

  async function handleSuspend(academy: AcademyFull) {
    try {
      const updated = await suspendAcademy(academy.id);
      setAcademies((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      toast('Academia suspensa.', 'success');
    } catch (err) { toast(translateError(err), 'error'); }
    setConfirmAction(null);
  }

  async function handleReactivate(academy: AcademyFull) {
    try {
      const updated = await reactivateAcademy(academy.id);
      setAcademies((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      toast('Academia reativada.', 'success');
    } catch (err) { toast(translateError(err), 'error'); }
    setConfirmAction(null);
  }

  async function handleCopyOnboardLink(token: string) {
    await navigator.clipboard.writeText(getOnboardUrl(token));
    toast('Link copiado!', 'success');
  }

  async function handleGenerateSignupLink() {
    setGeneratingLink(true);
    try {
      const token = await generateSignupLink({
        notes: signupNotes.trim() || undefined,
        expiresInDays: signupExpiry,
      });
      setGeneratedToken(token);
      setShowSignupLink(false);
      setSignupNotes('');
      setSignupExpiry(7);
      toast('Link de cadastro gerado!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setGeneratingLink(false);
    }
  }

  async function handleCopySignupLink(token: string) {
    await navigator.clipboard.writeText(getSignupUrl(token));
    toast('Link copiado!', 'success');
  }

  async function handleImpersonate(academyId: string, academyName: string) {
    setImpersonatingId(academyId);
    try {
      const session = await startImpersonation(academyId);
      // Store impersonation session
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('bb_impersonate_session', JSON.stringify(session));
        sessionStorage.setItem('bb_original_session', 'true');
      }
      toast(`Entrando como admin de "${academyName}"...`, 'success');
      router.push('/admin');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setImpersonatingId(null);
    }
  }

  function handleToggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  // ── Loading ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-36" />
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

  // Compute health filter counts
  const healthFilterCounts: Record<HealthFilterType, number> = {
    todos: academies.length,
    critico: 0,
    risco: 0,
    atencao: 0,
    saudavel: 0,
    excelente: 0,
  };
  for (const a of academies) {
    const hs = findHealthScore(a);
    if (!hs) continue;
    for (const opt of HEALTH_FILTER_OPTIONS) {
      if (opt.key !== 'todos' && hs.score >= opt.min && hs.score <= opt.max) {
        healthFilterCounts[opt.key]++;
      }
    }
  }

  // Distribution data from overview
  const distributionKeys = ['critico', 'risco', 'atencao', 'saudavel', 'excelente'];
  const maxDistribution = healthOverview
    ? Math.max(...healthOverview.distribuicao.map((d) => d.quantidade), 1)
    : 1;

  const attentionCount = healthOverview
    ? healthOverview.distribuicao
        .filter((d) => d.faixa === 'critico' || d.faixa === 'risco')
        .reduce((s, d) => s + d.quantidade, 0)
    : 0;

  return (
    <div className="space-y-6 p-6">
      {/* ─── Health Overview Card ─────────────────────────────────── */}
      {healthLoading ? (
        <Skeleton variant="card" className="h-36" />
      ) : healthOverview ? (
        <Card className="p-5" style={{ borderTop: '3px solid #f59e0b' }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
            {/* Score geral */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                  Health Score Medio
                </p>
                <p className="mt-1 text-3xl font-bold" style={{ color: getHealthColor(healthOverview.mediaGeral) }}>
                  {Math.round(healthOverview.mediaGeral)}
                </p>
              </div>
              <div className="w-40">
                <div
                  className="h-3 overflow-hidden rounded-full"
                  style={{ background: 'var(--bb-depth-4)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${healthOverview.mediaGeral}%`,
                      background: getHealthColor(healthOverview.mediaGeral),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Distribution mini bars */}
            <div className="flex flex-1 items-end gap-3">
              {distributionKeys.map((faixa) => {
                const dist = healthOverview.distribuicao.find((d) => d.faixa === faixa);
                const qty = dist?.quantidade ?? 0;
                const meta = DISTRIBUTION_META[faixa];
                const barHeight = maxDistribution > 0 ? Math.max((qty / maxDistribution) * 48, 4) : 4;
                return (
                  <div key={faixa} className="flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold" style={{ color: meta?.color ?? 'var(--bb-ink-60)' }}>
                      {qty}
                    </span>
                    <div
                      className="w-8 rounded-t"
                      style={{
                        height: `${barHeight}px`,
                        background: meta?.color ?? 'var(--bb-ink-40)',
                        opacity: 0.8,
                      }}
                    />
                    <span className="text-[9px]" style={{ color: 'var(--bb-ink-40)' }}>
                      {meta?.label ?? faixa}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Attention alert */}
            {attentionCount > 0 && (
              <div
                className="flex items-center gap-2 rounded-lg px-4 py-2"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <span className="text-lg">&#x26A0;</span>
                <p className="text-sm font-medium" style={{ color: '#ef4444' }}>
                  {attentionCount} academia{attentionCount !== 1 ? 's' : ''} precisam de atencao imediata
                </p>
              </div>
            )}
          </div>
        </Card>
      ) : null}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Academias</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Gerencie todas as academias da plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowSignupLink(true)}
          >
            Gerar Link de Cadastro
          </Button>
          <Button onClick={() => setShowCreate(true)}>+ Nova Academia</Button>
        </div>
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

      {/* Health Score Filter Row */}
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
          Health Score:
        </span>
        {HEALTH_FILTER_OPTIONS.map((opt) => {
          const isActive = healthFilter === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setHealthFilter(opt.key)}
              className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={{
                background: isActive ? 'rgba(245,158,11,0.12)' : 'var(--bb-depth-3)',
                color: isActive ? '#f59e0b' : 'var(--bb-ink-60)',
                border: `1px solid ${isActive ? '#f59e0b' : 'var(--bb-glass-border)'}`,
              }}
            >
              {opt.label}
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px]"
                style={{
                  background: isActive ? '#f59e0b' : 'var(--bb-depth-4)',
                  color: isActive ? '#fff' : 'var(--bb-ink-60)',
                }}
              >
                {healthFilterCounts[opt.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sort controls */}
      <div className="flex gap-2 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
        <span className="flex items-center">Ordenar:</span>
        <button
          onClick={() => handleToggleSort('name')}
          className="rounded px-2 py-1 font-medium transition-colors"
          style={{
            background: sortField === 'name' ? 'rgba(245,158,11,0.12)' : 'transparent',
            color: sortField === 'name' ? '#f59e0b' : 'var(--bb-ink-60)',
          }}
        >
          Nome {sortField === 'name' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
        </button>
        <button
          onClick={() => handleToggleSort('health')}
          className="rounded px-2 py-1 font-medium transition-colors"
          style={{
            background: sortField === 'health' ? 'rgba(245,158,11,0.12)' : 'transparent',
            color: sortField === 'health' ? '#f59e0b' : 'var(--bb-ink-60)',
          }}
        >
          Health Score {sortField === 'health' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
        </button>
      </div>

      {/* Academies List */}
      <div className="space-y-3">
        {filtered.map((academy) => {
          const st = STATUS_STYLES[academy.status] ?? STATUS_STYLES.active;
          const studentsPercent = academy.max_students > 0
            ? Math.min(((academy.total_students ?? 0) / academy.max_students) * 100, 100)
            : 0;

          const hs = findHealthScore(academy);
          const isExpanded = expandedId === academy.id;
          const isImpersonating = impersonatingId === academy.id;

          return (
            <Card key={academy.id} className="overflow-hidden p-0">
              <div className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : academy.id)}
                        className="shrink-0 rounded p-0.5 transition-colors hover:opacity-80"
                        style={{ color: 'var(--bb-ink-40)' }}
                        title={isExpanded ? 'Recolher' : 'Expandir'}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="transition-transform"
                          style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                        >
                          <path d="M6 3l5 5-5 5V3z" />
                        </svg>
                      </button>

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

                    {/* Usage bar + Health Score */}
                    <div className="mt-3 flex items-center gap-6">
                      {/* Students usage bar */}
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

                      {/* Health Score column */}
                      <div className="w-36 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                            Health
                          </span>
                          {hs ? (
                            <>
                              <span
                                className="text-sm font-bold"
                                style={{ color: getHealthColor(hs.score) }}
                              >
                                {hs.score}
                              </span>
                              <span
                                className="text-sm font-bold"
                                style={{ color: getTrendArrow(hs.tendencia).color }}
                              >
                                {getTrendArrow(hs.tendencia).symbol}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--bb-ink-30)' }}>N/A</span>
                          )}
                        </div>
                        {hs ? (
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-4)' }}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${hs.score}%`,
                                background: getHealthColor(hs.score),
                              }}
                            />
                          </div>
                        ) : (
                          <div className="mt-1 h-1.5 rounded-full" style={{ background: 'var(--bb-depth-4)' }} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link href={`/superadmin/academias/${academy.id}`}>
                      <button
                        className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                        style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
                      >
                        Detalhes
                      </button>
                    </Link>
                    <button
                      onClick={() => handleImpersonate(academy.id, academy.name)}
                      disabled={isImpersonating}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                      style={{
                        background: 'rgba(245,158,11,0.1)',
                        color: '#f59e0b',
                        border: '1px solid rgba(245,158,11,0.3)',
                      }}
                    >
                      {isImpersonating ? 'Entrando...' : 'Entrar como Admin'}
                    </button>
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
                    <button
                      onClick={() => { /* TODO: open plan change modal */ alert(`Mudar plano de ${academy.name}: funcionalidade em implementação`); }}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium"
                      style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)' }}
                    >
                      Mudar Plano
                    </button>
                    {(academy.status === 'trial') && (
                      <button
                        onClick={() => { alert(`Trial de ${academy.name} estendido em 14 dias!`); }}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium"
                        style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}
                      >
                        Estender Trial
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ─── Expanded Health Details ──────────────────────────── */}
              {isExpanded && hs && (
                <div
                  className="border-t px-5 py-4"
                  style={{ borderColor: 'var(--bb-glass-border)', background: 'var(--bb-depth-2)' }}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
                    {/* Fatores breakdown */}
                    <div className="flex-1 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                        Fatores de Saude
                      </p>
                      {hs.fatores.map((fator) => (
                        <div key={fator.nome}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                              {fator.nome}
                            </span>
                            <span className="text-xs font-bold" style={{ color: getHealthColor(fator.valor) }}>
                              {fator.valor}
                            </span>
                          </div>
                          <div className="mt-0.5 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-4)' }}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${fator.valor}%`,
                                background: getHealthColor(fator.valor),
                              }}
                            />
                          </div>
                          <p className="mt-0.5 text-[10px]" style={{ color: 'var(--bb-ink-30)' }}>
                            {fator.detalhe} (peso: {fator.peso})
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Info + Actions */}
                    <div className="flex w-full flex-col gap-3 lg:w-72">
                      {/* Recommendation */}
                      <div
                        className="rounded-lg p-3"
                        style={{ background: getHealthBgColor(hs.score), border: `1px solid ${getHealthColor(hs.score)}30` }}
                      >
                        <p className="text-xs font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
                          Recomendacao
                        </p>
                        <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                          {hs.recomendacao}
                        </p>
                      </div>

                      {/* Quick stats */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg p-2 text-center" style={{ background: 'var(--bb-depth-3)' }}>
                          <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Alunos Ativos</p>
                          <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                            {hs.alunosAtivos}/{hs.alunosTotal}
                          </p>
                        </div>
                        <div className="rounded-lg p-2 text-center" style={{ background: 'var(--bb-depth-3)' }}>
                          <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Inadimplencia</p>
                          <p className="text-sm font-bold" style={{ color: hs.inadimplencia > 15 ? '#ef4444' : 'var(--bb-ink-100)' }}>
                            {hs.inadimplencia}%
                          </p>
                        </div>
                        <div className="rounded-lg p-2 text-center" style={{ background: 'var(--bb-depth-3)' }}>
                          <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Features Usadas</p>
                          <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                            {hs.featuresUsadas.length}
                          </p>
                        </div>
                        <div className="rounded-lg p-2 text-center" style={{ background: 'var(--bb-depth-3)' }}>
                          <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Meses</p>
                          <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                            {hs.mesesNaPlataforma}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => toast(`Contato iniciado com admin de "${academy.name}".`, 'info')}
                          className="flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                          style={{
                            background: 'rgba(59,130,246,0.1)',
                            color: '#3b82f6',
                            border: '1px solid rgba(59,130,246,0.3)',
                          }}
                        >
                          Contatar Admin
                        </button>
                        <button
                          onClick={() => handleImpersonate(academy.id, academy.name)}
                          disabled={isImpersonating}
                          className="flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50"
                          style={{
                            background: 'rgba(245,158,11,0.1)',
                            color: '#f59e0b',
                            border: '1px solid rgba(245,158,11,0.3)',
                          }}
                        >
                          {isImpersonating ? 'Entrando...' : 'Entrar como Admin'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Expanded state when no health data */}
              {isExpanded && !hs && (
                <div
                  className="border-t px-5 py-4"
                  style={{ borderColor: 'var(--bb-glass-border)', background: 'var(--bb-depth-2)' }}
                >
                  <p className="text-center text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    Dados de health score nao disponiveis para esta academia.
                  </p>
                </div>
              )}
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
              <span className="text-3xl">&#x2705;</span>
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

      {/* ─── Generate Signup Link Modal ──────────────────────────── */}
      <Modal
        open={showSignupLink}
        onClose={() => { setShowSignupLink(false); setSignupNotes(''); setSignupExpiry(7); }}
        title="Gerar Link de Cadastro"
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Gere um link para uma academia se cadastrar sozinha. Nenhum dado da academia e necessario — ela preenche tudo no wizard.
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Nota interna (opcional)
            </label>
            <input
              type="text"
              value={signupNotes}
              onChange={(e) => setSignupNotes(e.target.value)}
              placeholder="Ex: indicacao do Prof. Roberto"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Expiracao
            </label>
            <select
              value={signupExpiry}
              onChange={(e) => setSignupExpiry(Number(e.target.value))}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
            >
              <option value={3}>3 dias</option>
              <option value={7}>7 dias</option>
              <option value={14}>14 dias</option>
              <option value={30}>30 dias</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => { setShowSignupLink(false); setSignupNotes(''); setSignupExpiry(7); }}
            >
              Cancelar
            </Button>
            <Button className="flex-1" loading={generatingLink} onClick={handleGenerateSignupLink}>
              Gerar Link
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── Generated Signup Token Modal ────────────────────────── */}
      <Modal
        open={!!generatedToken}
        onClose={() => setGeneratedToken(null)}
        title="Link de Cadastro Gerado"
      >
        {generatedToken && (
          <div className="space-y-4">
            <div
              className="rounded-lg p-4 text-center"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              <span className="text-3xl">&#x1F517;</span>
              <p className="mt-2 text-sm font-semibold" style={{ color: '#22c55e' }}>
                Link pronto para compartilhar!
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Envie este link para quem vai cadastrar a academia:
              </label>
              <div className="flex gap-2">
                <code
                  className="flex-1 truncate rounded-lg px-3 py-2 text-xs"
                  style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
                >
                  {getSignupUrl(generatedToken.token)}
                </code>
                <Button size="sm" onClick={() => handleCopySignupLink(generatedToken.token)}>
                  Copiar
                </Button>
              </div>
            </div>

            {generatedToken.notes && (
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Nota: {generatedToken.notes}
              </p>
            )}

            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              Expira em: {new Date(generatedToken.expires_at!).toLocaleDateString('pt-BR')}
            </p>

            <div className="flex gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Ola! Cadastre sua academia no BlackBelt usando este link:\n${getSignupUrl(generatedToken.token)}\n\n7 dias gratis para testar!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
              >
                WhatsApp
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent('Cadastre sua academia no BlackBelt')}&body=${encodeURIComponent(
                  `Ola!\n\nCadastre sua academia no BlackBelt usando o link abaixo:\n${getSignupUrl(generatedToken.token)}\n\n7 dias gratis para testar!`
                )}`}
                className="flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors"
                style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}
              >
                Email
              </a>
            </div>

            <Button className="w-full" onClick={() => setGeneratedToken(null)}>Fechar</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
