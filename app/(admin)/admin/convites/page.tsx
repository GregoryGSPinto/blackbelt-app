'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { Role } from '@/lib/types';
import type { InviteToken, InviteStats, CreateInvitePayload } from '@/lib/types';
import {
  listInviteTokens,
  createInviteToken,
  deactivateInviteToken,
  deleteInviteToken,
  getInviteStats,
} from '@/lib/api/invite-tokens.service';

// ── Constants ───────────────────────────────────────────────────────────

const ACADEMY_ID = 'academy-bb-001';

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  gestor: 'Gestor',
  professor: 'Professor',
  recepcao: 'Recepcionista',
  aluno_adulto: 'Aluno Adulto',
  aluno_teen: 'Aluno Teen',
  aluno_kids: 'Aluno Kids',
  responsavel: 'Responsável',
  franqueador: 'Franqueador',
};

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: Role.AlunoAdulto, label: 'Aluno Adulto' },
  { value: Role.AlunoTeen, label: 'Aluno Teen' },
  { value: Role.AlunoKids, label: 'Aluno Kids' },
  { value: Role.Responsavel, label: 'Responsavel' },
  { value: Role.Professor, label: 'Professor' },
  { value: Role.Admin, label: 'Administrador' },
];

type FilterType = 'todos' | 'ativos' | 'inativos';

function getInviteUrl(token: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/cadastro/${token}`;
  }
  return `/cadastro/${token}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function isExpired(token: InviteToken): boolean {
  return !!token.expires_at && new Date(token.expires_at) < new Date();
}

function isExhausted(token: InviteToken): boolean {
  return token.max_uses !== null && token.current_uses >= token.max_uses;
}

function getStatusInfo(token: InviteToken): { label: string; bg: string; text: string } {
  if (!token.is_active) {
    return { label: 'Inativo', bg: 'rgba(156,163,175,0.15)', text: 'var(--bb-ink-60)' };
  }
  if (isExpired(token)) {
    return { label: 'Expirado', bg: 'rgba(239,68,68,0.15)', text: '#ef4444' };
  }
  if (isExhausted(token)) {
    return { label: 'Esgotado', bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' };
  }
  return { label: 'Ativo', bg: 'rgba(34,197,94,0.15)', text: '#22c55e' };
}

// ── Page ────────────────────────────────────────────────────────────────

export default function ConvitesPage() {
  const { toast } = useToast();

  const [tokens, setTokens] = useState<InviteToken[]>([]);
  const [stats, setStats] = useState<InviteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('todos');
  const [search, setSearch] = useState('');

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [formRole, setFormRole] = useState<Role>(Role.AlunoAdulto);
  const [formLabel, setFormLabel] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLimited, setFormLimited] = useState(false);
  const [formMaxUses, setFormMaxUses] = useState(10);
  const [formHasExpiry, setFormHasExpiry] = useState(false);
  const [formExpiry, setFormExpiry] = useState('');
  const [creating, setCreating] = useState(false);

  // Detail/uses modal
  const [selectedToken, setSelectedToken] = useState<InviteToken | null>(null);

  // Confirm modal
  const [confirmAction, setConfirmAction] = useState<{
    type: 'deactivate' | 'delete';
    token: InviteToken;
  } | null>(null);

  // ── Load data ──────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const [tokenList, statsData] = await Promise.all([
        listInviteTokens(ACADEMY_ID),
        getInviteStats(ACADEMY_ID),
      ]);
      setTokens(tokenList);
      setStats(statsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Filtered list ──────────────────────────────────────────────────

  const filtered = tokens.filter((t) => {
    // Status filter
    if (filter === 'ativos' && (!t.is_active || isExpired(t) || isExhausted(t))) return false;
    if (filter === 'inativos' && t.is_active && !isExpired(t) && !isExhausted(t)) return false;

    // Search
    if (search) {
      const q = search.toLowerCase();
      if (
        !t.label.toLowerCase().includes(q) &&
        !(t.description ?? '').toLowerCase().includes(q) &&
        !ROLE_LABELS[t.target_role]?.toLowerCase().includes(q)
      )
        return false;
    }

    return true;
  });

  // ── Actions ────────────────────────────────────────────────────────

  async function handleCopy(token: string) {
    const url = getInviteUrl(token);
    await navigator.clipboard.writeText(url);
    toast('Link copiado!', 'success');
  }

  function resetCreateForm() {
    setFormRole(Role.AlunoAdulto);
    setFormLabel('');
    setFormDescription('');
    setFormLimited(false);
    setFormMaxUses(10);
    setFormHasExpiry(false);
    setFormExpiry('');
    setShowCreate(false);
  }

  async function handleCreate() {
    if (!formLabel.trim()) {
      toast('Preencha o nome do link.', 'error');
      return;
    }

    setCreating(true);
    try {
      const payload: CreateInvitePayload = {
        target_role: formRole,
        label: formLabel.trim(),
        description: formDescription.trim() || undefined,
        max_uses: formLimited ? formMaxUses : null,
        expires_at: formHasExpiry && formExpiry ? new Date(formExpiry).toISOString() : null,
      };

      const created = await createInviteToken(ACADEMY_ID, payload);
      setTokens((prev) => [created, ...prev]);

      const newStats = await getInviteStats(ACADEMY_ID);
      setStats(newStats);

      toast('Link de convite criado!', 'success');
      resetCreateForm();
    } catch {
      toast('Erro ao criar convite.', 'error');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeactivate(token: InviteToken) {
    try {
      const updated = await deactivateInviteToken(token.id);
      setTokens((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      const newStats = await getInviteStats(ACADEMY_ID);
      setStats(newStats);
      toast('Convite desativado.', 'success');
    } catch {
      toast('Erro ao desativar.', 'error');
    }
    setConfirmAction(null);
  }

  async function handleDelete(token: InviteToken) {
    try {
      await deleteInviteToken(token.id);
      setTokens((prev) => prev.filter((t) => t.id !== token.id));
      const newStats = await getInviteStats(ACADEMY_ID);
      setStats(newStats);
      toast('Convite excluido.', 'success');
    } catch {
      toast('Erro ao excluir.', 'error');
    }
    setConfirmAction(null);
  }

  // ── Loading state ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" className="h-20" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────

  const filters: Array<{ key: FilterType; label: string }> = [
    { key: 'todos', label: 'Todos' },
    { key: 'ativos', label: 'Ativos' },
    { key: 'inativos', label: 'Inativos' },
  ];

  const filterCounts: Record<FilterType, number> = {
    todos: tokens.length,
    ativos: tokens.filter((t) => t.is_active && !isExpired(t) && !isExhausted(t)).length,
    inativos: tokens.filter((t) => !t.is_active || isExpired(t) || isExhausted(t)).length,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Links de Convite
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Gere links personalizados para cadastro na academia
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Novo Link</Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total', value: stats.total, icon: '🔗' },
            { label: 'Ativos', value: stats.active, icon: '✅' },
            { label: 'Usos totais', value: stats.total_uses, icon: '👥' },
            { label: 'Este mes', value: stats.uses_this_month, icon: '📈' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-4"
              style={{
                background: 'var(--bb-depth-3)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{s.icon}</span>
                <span className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                  {s.value}
                </span>
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filters + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const isActive = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                style={{
                  background: isActive ? 'var(--bb-brand-surface)' : 'var(--bb-depth-3)',
                  color: isActive ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                  border: `1px solid ${isActive ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
                }}
              >
                {f.label}
                <span
                  className="rounded-full px-1.5 py-0.5 text-xs"
                  style={{
                    background: isActive ? 'var(--bb-brand)' : 'var(--bb-depth-4)',
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
          placeholder="Buscar por nome..."
          className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none sm:w-64"
          style={{
            background: 'var(--bb-depth-3)',
            color: 'var(--bb-ink-100)',
            border: '1px solid var(--bb-glass-border)',
          }}
        />
      </div>

      {/* Token List */}
      <div className="space-y-3">
        {filtered.map((token) => {
          const status = getStatusInfo(token);
          const usageText =
            token.max_uses !== null
              ? `${token.current_uses}/${token.max_uses} usos`
              : `${token.current_uses} usos (ilimitado)`;
          const usagePercent =
            token.max_uses !== null
              ? Math.min((token.current_uses / token.max_uses) * 100, 100)
              : null;

          return (
            <Card key={token.id} className="p-5">
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                      {token.label}
                    </h3>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: status.bg, color: status.text }}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div
                    className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
                    style={{ color: 'var(--bb-ink-40)' }}
                  >
                    <span
                      className="rounded px-1.5 py-0.5"
                      style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                    >
                      {ROLE_LABELS[token.target_role] ?? token.target_role}
                    </span>
                    <span>{usageText}</span>
                    {token.expires_at && (
                      <span>
                        {isExpired(token) ? 'Expirou' : 'Expira'}: {formatDate(token.expires_at)}
                      </span>
                    )}
                    <span>Criado: {formatDate(token.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Usage bar */}
              {usagePercent !== null && (
                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full"
                  style={{ background: 'var(--bb-depth-4)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${usagePercent}%`,
                      background: usagePercent >= 90 ? '#ef4444' : usagePercent >= 70 ? '#f59e0b' : '#22c55e',
                    }}
                  />
                </div>
              )}

              {/* Description */}
              {token.description && (
                <p className="mt-2 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  {token.description}
                </p>
              )}

              {/* Link + Actions */}
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <code
                  className="truncate rounded px-2 py-1 text-xs"
                  style={{
                    background: 'var(--bb-depth-4)',
                    color: 'var(--bb-ink-60)',
                    maxWidth: '100%',
                  }}
                >
                  {getInviteUrl(token.token)}
                </code>

                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleCopy(token.token)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{
                      background: 'var(--bb-depth-4)',
                      color: 'var(--bb-ink-80)',
                      border: '1px solid var(--bb-glass-border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bb-brand-surface)';
                      e.currentTarget.style.color = 'var(--bb-brand)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bb-depth-4)';
                      e.currentTarget.style.color = 'var(--bb-ink-80)';
                    }}
                  >
                    Copiar
                  </button>

                  <button
                    onClick={() => setSelectedToken(token)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{
                      background: 'var(--bb-depth-4)',
                      color: 'var(--bb-ink-80)',
                      border: '1px solid var(--bb-glass-border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bb-brand-surface)';
                      e.currentTarget.style.color = 'var(--bb-brand)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bb-depth-4)';
                      e.currentTarget.style.color = 'var(--bb-ink-80)';
                    }}
                  >
                    Detalhes
                  </button>

                  {token.is_active && !isExpired(token) && (
                    <button
                      onClick={() => setConfirmAction({ type: 'deactivate', token })}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                      style={{
                        background: 'rgba(245,158,11,0.1)',
                        color: '#f59e0b',
                        border: '1px solid rgba(245,158,11,0.3)',
                      }}
                    >
                      Desativar
                    </button>
                  )}

                  <button
                    onClick={() => setConfirmAction({ type: 'delete', token })}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      color: '#ef4444',
                      border: '1px solid rgba(239,68,68,0.3)',
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Nenhum convite encontrado.
          </div>
        )}
      </div>

      {/* ─── Create Modal ──────────────────────────────────────────── */}
      <Modal open={showCreate} onClose={resetCreateForm} title="Novo Link de Convite">
        <div className="space-y-4">
          {/* Label */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Nome do link *
            </label>
            <input
              type="text"
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
              placeholder="Ex: Link Geral Alunos, Turma Kids Sabado"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{
                background: 'var(--bb-depth-2)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Tipo de cadastro *
            </label>
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value as Role)}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{
                background: 'var(--bb-depth-2)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Nota interna (opcional)
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Nota interna sobre este link"
              rows={2}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{
                background: 'var(--bb-depth-2)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
            />
          </div>

          {/* Max uses */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              <input
                type="checkbox"
                checked={formLimited}
                onChange={(e) => setFormLimited(e.target.checked)}
                className="rounded"
              />
              Limitar numero de usos
            </label>
            {formLimited && (
              <input
                type="number"
                min={1}
                value={formMaxUses}
                onChange={(e) => setFormMaxUses(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-100)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              />
            )}
          </div>

          {/* Expiry */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              <input
                type="checkbox"
                checked={formHasExpiry}
                onChange={(e) => setFormHasExpiry(e.target.checked)}
                className="rounded"
              />
              Definir data de expiracao
            </label>
            {formHasExpiry && (
              <input
                type="datetime-local"
                value={formExpiry}
                onChange={(e) => setFormExpiry(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-100)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              />
            )}
          </div>

          {/* Preview */}
          {formLabel && (
            <div
              className="rounded-lg p-3"
              style={{
                background: 'var(--bb-brand-surface)',
                border: '1px solid var(--bb-brand)',
              }}
            >
              <p className="text-xs font-medium" style={{ color: 'var(--bb-brand)' }}>
                Preview do convite
              </p>
              <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                Guerreiros BJJ
              </p>
              <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                Cadastro como: {ROLE_LABELS[formRole]}
                {formLimited && ` · Limite: ${formMaxUses} vagas`}
                {formHasExpiry && formExpiry && ` · Expira: ${formatDate(formExpiry)}`}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={resetCreateForm}>
              Cancelar
            </Button>
            <Button
              className="flex-1"
              disabled={!formLabel.trim()}
              loading={creating}
              onClick={handleCreate}
            >
              Gerar Link
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── Detail Modal ──────────────────────────────────────────── */}
      <Modal
        open={!!selectedToken}
        onClose={() => setSelectedToken(null)}
        title={selectedToken?.label ?? ''}
      >
        {selectedToken && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  background: getStatusInfo(selectedToken).bg,
                  color: getStatusInfo(selectedToken).text,
                }}
              >
                {getStatusInfo(selectedToken).label}
              </span>
              <span
                className="rounded px-1.5 py-0.5 text-xs"
                style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
              >
                {ROLE_LABELS[selectedToken.target_role]}
              </span>
            </div>

            {selectedToken.description && (
              <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                {selectedToken.description}
              </p>
            )}

            <div
              className="space-y-2 rounded-lg p-3"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
            >
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--bb-ink-40)' }}>Usos</span>
                <span style={{ color: 'var(--bb-ink-100)' }}>
                  {selectedToken.current_uses}
                  {selectedToken.max_uses !== null ? `/${selectedToken.max_uses}` : ' (ilimitado)'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--bb-ink-40)' }}>Criado em</span>
                <span style={{ color: 'var(--bb-ink-100)' }}>{formatDate(selectedToken.created_at)}</span>
              </div>
              {selectedToken.expires_at && (
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--bb-ink-40)' }}>
                    {isExpired(selectedToken) ? 'Expirou em' : 'Expira em'}
                  </span>
                  <span style={{ color: 'var(--bb-ink-100)' }}>{formatDate(selectedToken.expires_at)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--bb-ink-40)' }}>Criado por</span>
                <span style={{ color: 'var(--bb-ink-100)' }}>{selectedToken.created_by_name ?? '-'}</span>
              </div>
            </div>

            {/* Full link */}
            <div>
              <label className="mb-1 block text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Link de convite
              </label>
              <div className="flex gap-2">
                <code
                  className="flex-1 truncate rounded-lg px-3 py-2 text-xs"
                  style={{
                    background: 'var(--bb-depth-2)',
                    color: 'var(--bb-ink-80)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                >
                  {getInviteUrl(selectedToken.token)}
                </code>
                <Button
                  size="sm"
                  onClick={() => {
                    handleCopy(selectedToken.token);
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>

            <Button className="w-full" onClick={() => setSelectedToken(null)}>
              Fechar
            </Button>
          </div>
        )}
      </Modal>

      {/* ─── Confirm Modal ─────────────────────────────────────────── */}
      <Modal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.type === 'delete' ? 'Excluir convite' : 'Desativar convite'}
      >
        {confirmAction && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              {confirmAction.type === 'delete'
                ? `Tem certeza que deseja excluir o convite "${confirmAction.token.label}"? Esta acao nao pode ser desfeita.`
                : `Tem certeza que deseja desativar o convite "${confirmAction.token.label}"? Novos usuarios nao poderao usa-lo.`}
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setConfirmAction(null)}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={() =>
                  confirmAction.type === 'delete'
                    ? handleDelete(confirmAction.token)
                    : handleDeactivate(confirmAction.token)
                }
              >
                {confirmAction.type === 'delete' ? 'Excluir' : 'Desativar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
