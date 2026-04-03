'use client';

import { useState, useEffect, useCallback, useMemo, type CSSProperties } from 'react';
import {
  getAssinatura,
  getModulos,
  ativarModulo,
  desativarModulo,
  getHistoricoCobrancas,
  getModulosExtrasDescoberta,
} from '@/lib/api/pricing.service';
import type {
  AssinaturaSaaS,
  Modulo,
  Cobranca,
  ModuloExtra,
  UsoDescoberta,
} from '@/lib/api/pricing.service';
import { handleServiceError } from '@/lib/api/errors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/lib/hooks/useToast';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { isNative } from '@/lib/platform';

// ── Helpers ──────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('pt-BR');
}

type ModuleState = 'paid' | 'discovery' | 'inactive_with_data' | 'never_used';

function getModuleState(
  slug: string,
  modulosPagos: string[],
  emPeriodoDescoberta: boolean,
  usoDescoberta: UsoDescoberta[],
): ModuleState {
  if (modulosPagos.includes(slug)) return 'paid';
  if (emPeriodoDescoberta && !modulosPagos.includes(slug)) return 'discovery';
  const uso = usoDescoberta.find((u) => u.moduloSlug === slug);
  if (!emPeriodoDescoberta && !modulosPagos.includes(slug) && uso && uso.vezesUsado > 0) return 'inactive_with_data';
  return 'never_used';
}

function getUsageForSlug(usoDescoberta: UsoDescoberta[], slug: string): number {
  return usoDescoberta.find((u) => u.moduloSlug === slug)?.vezesUsado ?? 0;
}

function statusBadgeStyle(status: AssinaturaSaaS['status']): CSSProperties {
  switch (status) {
    case 'trial':
      return { background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' };
    case 'discovery':
      return { background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' };
    case 'full':
      return { background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' };
    case 'suspended':
    case 'cancelled':
    case 'past_due':
      return { background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' };
    default:
      return { background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' };
  }
}

function statusLabel(status: AssinaturaSaaS['status']): string {
  switch (status) {
    case 'trial': return 'Trial';
    case 'discovery': return 'Descoberta';
    case 'full': return 'Ativo';
    case 'suspended': return 'Suspenso';
    case 'cancelled': return 'Cancelado';
    case 'past_due': return 'Inadimplente';
    default: return status;
  }
}

function cobrancaStatusStyle(status: string): CSSProperties {
  switch (status) {
    case 'paid':
      return { background: 'rgba(34, 197, 94, 0.12)', color: '#22C55E' };
    case 'pending':
      return { background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' };
    case 'failed':
    case 'refunded':
      return { background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' };
    default:
      return { background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' };
  }
}

function cobrancaStatusLabel(status: string): string {
  switch (status) {
    case 'paid': return 'Pago';
    case 'pending': return 'Pendente';
    case 'failed': return 'Falhou';
    case 'refunded': return 'Reembolsado';
    default: return status;
  }
}

// ── Skeleton ─────────────────────────────────────────────────────────

function PlanoPageSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Skeleton variant="text" className="h-8 w-64" />
      <Skeleton variant="card" className="h-48" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="card" className="h-40" />
        ))}
      </div>
      <Skeleton variant="card" className="h-64" />
    </div>
  );
}

// ── Bar Component ────────────────────────────────────────────────────

function UsageBar({ label, current, limit }: { label: string; current: number; limit: number }) {
  const pct = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
  const isWarning = pct > 80;
  const barColor = pct >= 100 ? '#EF4444' : pct >= 80 ? '#F59E0B' : '#22C55E';

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'var(--bb-depth-3)',
        border: isWarning ? `1px solid ${barColor}40` : '1px solid var(--bb-glass-border)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
          {label}
        </span>
        <span className="text-sm font-mono font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          {current}/{limit}
        </span>
      </div>
      <div
        className="mt-2.5 h-2 overflow-hidden rounded-full"
        style={{ background: 'var(--bb-depth-1)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      {isWarning && (
        <p className="mt-1.5 text-xs" style={{ color: barColor }}>
          {pct >= 100 ? 'Limite atingido' : `${Math.round(pct)}% utilizado`}
        </p>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────

export default function AdminPlanoPage() {
  const { toast } = useToast();
  const [assinatura, setAssinatura] = useState<AssinaturaSaaS | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [extras, setExtras] = useState<ModuloExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activatingSlug, setActivatingSlug] = useState<string | null>(null);
  const [showUsoDetalhado, setShowUsoDetalhado] = useState(false);
  const [native, setNative] = useState(false);

  useEffect(() => {
    setNative(isNative());
  }, []);

  const loadData = useCallback(async () => {
    let cancelled = false;
    try {
      setLoading(true);
      setLoadError(null);
      const [sub, mods, billing, extrasData] = await Promise.all([
        getAssinatura(getActiveAcademyId()),
        getModulos(),
        getHistoricoCobrancas(getActiveAcademyId()),
        getModulosExtrasDescoberta(getActiveAcademyId()),
      ]);
      if (!cancelled) {
        setAssinatura(sub);
        setModulos(mods);
        setCobrancas(billing);
        setExtras(extrasData);
      }
    } catch (error) {
      handleServiceError(error, 'plano.page');
      if (!cancelled) setLoadError('Nao foi possivel carregar os dados do plano.');
    } finally {
      if (!cancelled) setLoading(false);
    }
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sorted discovery usage (extras only, by usage desc)
  const sortedUsoDescoberta = useMemo(() => {
    if (!assinatura) return [];
    return [...(assinatura.usoDescoberta ?? [])]
      .filter((u) => !u.inclusoNoPlano)
      .sort((a, b) => b.vezesUsado - a.vezesUsado);
  }, [assinatura]);

  // Top 3 extra modules cost
  const top3ExtraCost = useMemo(() => {
    return sortedUsoDescoberta
      .slice(0, 3)
      .reduce((sum, u) => {
        const mod = modulos.find((m) => m.slug === u.moduloSlug);
        return sum + (mod?.precoMensal ?? 0);
      }, 0);
  }, [sortedUsoDescoberta, modulos]);

  async function handleAtivar(slug: string) {
    if (!assinatura) return;
    setActivatingSlug(slug);
    try {
      const updated = await ativarModulo(getActiveAcademyId(), slug);
      setAssinatura(updated);
      toast('Modulo ativado com sucesso!', 'success');
    } catch (error) {
      handleServiceError(error, 'plano.ativarModulo');
    } finally {
      setActivatingSlug(null);
    }
  }

  async function handleDesativar(slug: string) {
    if (!assinatura) return;
    setActivatingSlug(slug);
    try {
      const updated = await desativarModulo(getActiveAcademyId(), slug);
      setAssinatura(updated);
      toast('Modulo desativado.', 'info');
    } catch (error) {
      handleServiceError(error, 'plano.desativarModulo');
    } finally {
      setActivatingSlug(null);
    }
  }

  // Apple Guideline 3.1.1: hide pricing in native app
  if (native) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-4xl">🌐</span>
        <h1
          className="text-xl font-bold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Gerenciamento de Plano
        </h1>
        <p
          className="max-w-md text-sm"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          Para gerenciar sua assinatura, acesse{' '}
          <span className="font-semibold" style={{ color: 'var(--bb-brand)' }}>
            blackbeltv2.vercel.app
          </span>{' '}
          no navegador.
        </p>
      </div>
    );
  }

  if (loading) return <PlanoPageSkeleton />;

  if (loadError || !assinatura) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState
          title="Plano indisponivel"
          description={loadError || 'Nao foi possivel carregar as informacoes do plano.'}
          onRetry={loadData}
        />
      </div>
    );
  }

  const discoveryProgress = assinatura.emPeriodoDescoberta
    ? ((82 - assinatura.diasRestantesDescoberta) / 82) * 100
    : 0;

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6" data-stagger>
      {/* ── Header ──────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold sm:text-[28px]"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Meu Plano BlackBelt
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Gerencie modulos, acompanhe uso e historico de cobrancas
          </p>
        </div>
        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
          style={statusBadgeStyle(assinatura.status)}
        >
          {statusLabel(assinatura.status)}
        </span>
      </section>

      {/* ── Status Card ─────────────────────────────────────────── */}
      <section>
        {assinatura.status === 'discovery' && (
          <Card variant="elevated" className="overflow-hidden">
            <div
              className="px-5 py-3 text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(234,88,12,0.1))',
                color: '#F59E0B',
              }}
            >
              {'\uD83D\uDD13'} PERIODO DE DESCOBERTA — {assinatura.diasRestantesDescoberta} dias restantes
            </div>
            <div className="space-y-4 p-5">
              {/* Progress bar */}
              <div>
                <div
                  className="h-2.5 overflow-hidden rounded-full"
                  style={{ background: 'var(--bb-depth-1)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(discoveryProgress, 100)}%`,
                      background: 'linear-gradient(90deg, #F59E0B, #EA580C)',
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  <span>Inicio</span>
                  <span>Fim: {formatDate(assinatura.discoveryEndsAt)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>
                  Voce paga: <strong>R$ {formatCurrency(assinatura.precoTotal)}/mes</strong> (Pacote Profissional)
                </p>
                <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                  {'\uD83C\uDF81'} Bonus ativo: TODOS os {modulos.length} modulos liberados ate{' '}
                  {formatDate(assinatura.discoveryEndsAt)}
                </p>
              </div>

              {/* Top 3 extras */}
              {extras.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                    Modulos extras que voce esta usando:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {extras.slice(0, 3).map((e) => (
                      <span
                        key={e.slug}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ background: 'rgba(245,158,11,0.1)', color: '#D97706' }}
                      >
                        {e.icone} {e.nome} ({e.vezesUsado}x)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowUsoDetalhado(!showUsoDetalhado)}
                >
                  {showUsoDetalhado ? 'Ocultar uso' : 'Ver uso detalhado'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {assinatura.status === 'trial' && (
          <Card variant="elevated" className="overflow-hidden">
            <div
              className="px-5 py-3 text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1))',
                color: '#3B82F6',
              }}
            >
              {'\uD83C\uDF89'} TRIAL GRATUITO — {assinatura.diasRestantesDescoberta} dias restantes
            </div>
            <div className="space-y-4 p-5">
              <div
                className="h-2.5 overflow-hidden rounded-full"
                style={{ background: 'var(--bb-depth-1)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: '30%', background: 'linear-gradient(90deg, #3B82F6, #6366F1)' }}
                />
              </div>
              <p className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>
                Tudo liberado! Seu plano inicia em breve.
              </p>
            </div>
          </Card>
        )}

        {assinatura.status === 'full' && (
          <Card variant="elevated" className="overflow-hidden">
            <div
              className="px-5 py-3 text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(22,163,74,0.1))',
                color: '#22C55E',
              }}
            >
              {'\u2705'} PLANO PROFISSIONAL — Ativo
            </div>
            <div className="space-y-2 p-5">
              <p className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>
                R$ {formatCurrency(assinatura.precoTotal)}/mes &middot; Ciclo {assinatura.ciclo}
              </p>
              <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Proxima cobranca: {formatDate(assinatura.currentPeriodEnd)}
              </p>
            </div>
          </Card>
        )}
      </section>

      {/* ── Modulos Grid ────────────────────────────────────────── */}
      <section>
        <h2
          className="mb-4 font-mono text-xs uppercase tracking-widest"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          Modulos ({modulos.length})
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modulos.map((mod) => {
            const state = getModuleState(
              mod.slug,
              assinatura.modulosPagos,
              assinatura.emPeriodoDescoberta,
              assinatura.usoDescoberta ?? [],
            );
            const usage = getUsageForSlug(assinatura.usoDescoberta ?? [], mod.slug);
            const isLoading = activatingSlug === mod.slug;

            const borderColor: Record<ModuleState, string> = {
              paid: '#22C55E',
              discovery: '#F59E0B',
              inactive_with_data: 'var(--bb-glass-border)',
              never_used: 'var(--bb-glass-border)',
            };

            return (
              <div
                key={mod.slug}
                className="flex flex-col rounded-xl p-4 transition-all duration-200"
                style={{
                  background: 'var(--bb-depth-3)',
                  border: `1.5px solid ${borderColor[state]}`,
                  opacity: state === 'never_used' ? 0.7 : 1,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{mod.icone}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                        {mod.nome}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        R$ {formatCurrency(mod.precoMensal)}/mes
                      </p>
                    </div>
                  </div>
                </div>

                {/* State labels */}
                <div className="mt-3 flex-1">
                  {state === 'paid' && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}
                    >
                      {'\u2705'} Ativo
                    </span>
                  )}
                  {state === 'discovery' && (
                    <div>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ background: 'rgba(245,158,11,0.12)', color: '#D97706' }}
                      >
                        {'\uD83D\uDD13'} Incluido na descoberta ({assinatura.diasRestantesDescoberta} dias)
                      </span>
                      {usage > 0 && (
                        <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                          Usado {usage}x
                        </p>
                      )}
                    </div>
                  )}
                  {state === 'inactive_with_data' && (
                    <div>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                      >
                        {'\uD83D\uDD12'} Inativo
                      </span>
                      <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        Usou {usage}x na descoberta
                      </p>
                    </div>
                  )}
                  {state === 'never_used' && (
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-40)' }}
                    >
                      {'\uD83D\uDD12'}
                    </span>
                  )}
                </div>

                {/* Action button */}
                <div className="mt-3">
                  {state === 'paid' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => handleDesativar(mod.slug)}
                      loading={isLoading}
                    >
                      Desativar
                    </Button>
                  )}
                  {state === 'discovery' && (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleAtivar(mod.slug)}
                      loading={isLoading}
                    >
                      Adicionar ao plano
                    </Button>
                  )}
                  {state === 'inactive_with_data' && (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleAtivar(mod.slug)}
                      loading={isLoading}
                    >
                      Reativar
                    </Button>
                  )}
                  {state === 'never_used' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => handleAtivar(mod.slug)}
                      loading={isLoading}
                    >
                      Ativar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Uso na Descoberta (table) ───────────────────────────── */}
      {assinatura.emPeriodoDescoberta && showUsoDetalhado && (
        <section>
          <Card variant="elevated">
            <h3
              className="mb-4 font-mono text-xs uppercase tracking-widest"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              Uso na Descoberta
            </h3>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                    {['Modulo', 'Usos', 'Status'].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left font-mono text-xs uppercase"
                        style={{ color: 'var(--bb-ink-40)', letterSpacing: '0.05em' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedUsoDescoberta.map((u) => (
                    <tr
                      key={u.moduloSlug}
                      style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                    >
                      <td className="px-3 py-3 font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                        {modulos.find((m) => m.slug === u.moduloSlug)?.icone ?? ''}{' '}
                        {u.moduloNome}
                      </td>
                      <td className="px-3 py-3 font-mono" style={{ color: 'var(--bb-ink-80)' }}>
                        {u.vezesUsado}x
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                          style={
                            u.inclusoNoPlano
                              ? { background: 'rgba(34,197,94,0.12)', color: '#22C55E' }
                              : { background: 'rgba(245,158,11,0.12)', color: '#D97706' }
                          }
                        >
                          {u.inclusoNoPlano ? 'No plano' : 'Extra'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-2 sm:hidden">
              {sortedUsoDescoberta.map((u) => (
                <div
                  key={u.moduloSlug}
                  className="flex items-center justify-between rounded-lg p-3"
                  style={{ background: 'var(--bb-depth-4)' }}
                >
                  <div className="flex items-center gap-2">
                    <span>{modulos.find((m) => m.slug === u.moduloSlug)?.icone ?? ''}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                      {u.moduloNome}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color: 'var(--bb-ink-80)' }}>
                      {u.vezesUsado}x
                    </span>
                    <span
                      className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                      style={
                        u.inclusoNoPlano
                          ? { background: 'rgba(34,197,94,0.12)', color: '#22C55E' }
                          : { background: 'rgba(245,158,11,0.12)', color: '#D97706' }
                      }
                    >
                      {u.inclusoNoPlano ? 'Plano' : 'Extra'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {top3ExtraCost > 0 && (
              <p className="mt-4 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                {'\uD83D\uDCA1'} Os 3 modulos mais usados custariam +R$ {formatCurrency(top3ExtraCost)}/mes
              </p>
            )}
          </Card>
        </section>
      )}

      {/* ── Barras de Uso ───────────────────────────────────────── */}
      <section>
        <h2
          className="mb-4 font-mono text-xs uppercase tracking-widest"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          Consumo
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <UsageBar label="Alunos" current={86} limit={100} />
          <UsageBar label="Professores" current={2} limit={3} />
          <UsageBar label="Turmas" current={8} limit={15} />
        </div>
      </section>

      {/* ── Historico de Cobrancas ──────────────────────────────── */}
      <section>
        <h2
          className="mb-4 font-mono text-xs uppercase tracking-widest"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          Historico de Cobrancas
        </h2>

        {/* Desktop table */}
        <Card variant="default" className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                {['Data', 'Valor', 'Status', 'Metodo'].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left font-mono text-xs uppercase"
                    style={{ color: 'var(--bb-ink-40)', letterSpacing: '0.05em' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cobrancas.map((c) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                >
                  <td className="px-3 py-3" style={{ color: 'var(--bb-ink-100)' }}>
                    {formatDate(c.data)}
                  </td>
                  <td className="px-3 py-3 font-mono font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                    R$ {formatCurrency(c.valor)}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                      style={cobrancaStatusStyle(c.status)}
                    >
                      {cobrancaStatusLabel(c.status)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                    {c.metodo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Mobile cards */}
        <div className="space-y-2 sm:hidden">
          {cobrancas.map((c) => (
            <div
              key={c.id}
              className="rounded-xl p-4"
              style={{
                background: 'var(--bb-depth-3)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                  {formatDate(c.data)}
                </span>
                <span
                  className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                  style={cobrancaStatusStyle(c.status)}
                >
                  {cobrancaStatusLabel(c.status)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  {c.metodo}
                </span>
                <span className="text-sm font-mono font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                  R$ {formatCurrency(c.valor)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
