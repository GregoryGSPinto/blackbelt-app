'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import type { OnboardToken } from '@/lib/types';
import { listOnboardTokens, deactivateOnboardToken } from '@/lib/api/superadmin.service';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getOnboardUrl(token: string): string {
  if (typeof window !== 'undefined') return `${window.location.origin}/onboarding?token=${token}`;
  return `/onboarding?token=${token}`;
}

function getTokenStatus(token: OnboardToken): { label: string; bg: string; text: string } {
  if (!token.is_active) return { label: 'Inativo', bg: 'rgba(156,163,175,0.15)', text: 'var(--bb-ink-60)' };
  if (token.current_uses >= token.max_uses) return { label: 'Usado', bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' };
  if (token.expires_at && new Date(token.expires_at) < new Date()) return { label: 'Expirado', bg: 'rgba(239,68,68,0.15)', text: '#ef4444' };
  return { label: 'Ativo', bg: 'rgba(34,197,94,0.15)', text: '#22c55e' };
}

type FilterType = 'todos' | 'active' | 'used' | 'expired' | 'inactive';

export default function OnboardingTokensPage() {
  const { toast } = useToast();
  const [tokens, setTokens] = useState<OnboardToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('todos');
  const [search, setSearch] = useState('');
  const [detailToken, setDetailToken] = useState<OnboardToken | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<OnboardToken | null>(null);

  const loadTokens = useCallback(async () => {
    try {
      const data = await listOnboardTokens();
      setTokens(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTokens(); }, [loadTokens]);

  const filtered = tokens.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      if (!t.academy_name.toLowerCase().includes(q)) return false;
    }
    if (filter === 'active') return t.is_active && t.current_uses < t.max_uses && (!t.expires_at || new Date(t.expires_at) >= new Date());
    if (filter === 'used') return t.current_uses >= t.max_uses;
    if (filter === 'expired') return t.expires_at !== null && new Date(t.expires_at) < new Date();
    if (filter === 'inactive') return !t.is_active;
    return true;
  });

  async function handleDeactivate(token: OnboardToken) {
    try {
      const updated = await deactivateOnboardToken(token.id);
      setTokens((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      toast('Token desativado.', 'success');
    } catch {
      toast('Erro ao desativar token.', 'error');
    }
    setConfirmDeactivate(null);
  }

  async function handleCopy(token: string) {
    await navigator.clipboard.writeText(getOnboardUrl(token));
    toast('Link copiado!', 'success');
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-24" />)}
        </div>
      </div>
    );
  }

  const filterOptions: Array<{ key: FilterType; label: string }> = [
    { key: 'todos', label: 'Todos' },
    { key: 'active', label: 'Ativos' },
    { key: 'used', label: 'Usados' },
    { key: 'expired', label: 'Expirados' },
    { key: 'inactive', label: 'Inativos' },
  ];

  const activeCount = tokens.filter((t) => t.is_active && t.current_uses < t.max_uses && (!t.expires_at || new Date(t.expires_at) >= new Date())).length;
  const usedCount = tokens.filter((t) => t.current_uses >= t.max_uses).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Links de Onboarding</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Gerencie os links de cadastro enviados para donos de academias
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: tokens.length, color: '#f59e0b' },
          { label: 'Ativos', value: activeCount, color: '#22c55e' },
          { label: 'Usados', value: usedCount, color: '#3b82f6' },
          { label: 'Inativos', value: tokens.filter((t) => !t.is_active).length, color: 'var(--bb-ink-60)' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg p-3 text-center"
            style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
          >
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{s.label}</p>
          </div>
        ))}
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
                className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                style={{
                  background: isActive ? 'rgba(245,158,11,0.12)' : 'var(--bb-depth-3)',
                  color: isActive ? '#f59e0b' : 'var(--bb-ink-60)',
                  border: `1px solid ${isActive ? '#f59e0b' : 'var(--bb-glass-border)'}`,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por academia..."
          className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none sm:w-64"
          style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
        />
      </div>

      {/* Token List */}
      <div className="space-y-3">
        {filtered.map((token) => {
          const status = getTokenStatus(token);
          return (
            <Card key={token.id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔗</span>
                    <h3 className="truncate font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                      {token.academy_name}
                    </h3>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: status.bg, color: status.text }}
                    >
                      {status.label}
                    </span>
                    {token.plan_name && (
                      <span
                        className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
                        style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                      >
                        {token.plan_name}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    <span>Trial: {token.trial_days} dias</span>
                    <span>Usos: {token.current_uses}/{token.max_uses}</span>
                    <span>Criado: {formatDate(token.created_at)}</span>
                    {token.expires_at && <span>Expira: {formatDate(token.expires_at)}</span>}
                  </div>
                  {token.notes && (
                    <p className="mt-1 text-xs italic" style={{ color: 'var(--bb-ink-40)' }}>
                      {token.notes}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => setDetailToken(token)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
                  >
                    Ver Link
                  </button>
                  {token.is_active && (
                    <button
                      onClick={() => handleCopy(token.token)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium"
                      style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
                    >
                      Copiar
                    </button>
                  )}
                  {token.is_active && (
                    <button
                      onClick={() => setConfirmDeactivate(token)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                    >
                      Desativar
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Nenhum token encontrado.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal open={!!detailToken} onClose={() => setDetailToken(null)} title="Detalhes do Token">
        {detailToken && (
          <div className="space-y-4">
            <div className="space-y-2">
              {[
                { label: 'Academia', value: detailToken.academy_name },
                { label: 'Plano', value: detailToken.plan_name ?? '-' },
                { label: 'Trial', value: `${detailToken.trial_days} dias` },
                { label: 'Usos', value: `${detailToken.current_uses}/${detailToken.max_uses}` },
                { label: 'Status', value: getTokenStatus(detailToken).label },
                { label: 'Criado em', value: formatDate(detailToken.created_at) },
                ...(detailToken.expires_at ? [{ label: 'Expira em', value: formatDate(detailToken.expires_at) }] : []),
                ...(detailToken.notes ? [{ label: 'Notas', value: detailToken.notes }] : []),
              ].map((item) => (
                <div key={item.label} className="flex justify-between rounded-lg px-3 py-2" style={{ background: 'var(--bb-depth-2)' }}>
                  <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{item.label}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div>
              <label className="mb-1 block text-xs" style={{ color: 'var(--bb-ink-40)' }}>Link de onboarding:</label>
              <code
                className="block truncate rounded-lg px-3 py-2 text-xs"
                style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
              >
                {getOnboardUrl(detailToken.token)}
              </code>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => handleCopy(detailToken.token)}>Copiar Link</Button>
              <Button variant="ghost" className="flex-1" onClick={() => setDetailToken(null)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Deactivate Modal */}
      <Modal open={!!confirmDeactivate} onClose={() => setConfirmDeactivate(null)} title="Desativar Token">
        {confirmDeactivate && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Deseja desativar o token de onboarding para &quot;{confirmDeactivate.academy_name}&quot;? O link deixara de funcionar.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setConfirmDeactivate(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={() => handleDeactivate(confirmDeactivate)}>Desativar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
