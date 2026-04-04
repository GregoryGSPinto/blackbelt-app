'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { isModuloAcessivel, getModulosExtrasDescoberta, getAssinatura } from '@/lib/api/pricing.service';
import type { ModuloExtra, AssinaturaSaaS } from '@/lib/api/pricing.service';
import { UpsellCard } from '@/components/billing/UpsellCard';
import { Skeleton } from '@/components/ui/Skeleton';

interface ModuleGateProps {
  moduleSlug: string;
  children: ReactNode;
}

export function ModuleGate({ moduleSlug, children }: ModuleGateProps) {
  const [accessible, setAccessible] = useState<boolean | null>(null);
  const [assinatura, setAssinatura] = useState<AssinaturaSaaS | null>(null);
  const [extra, setExtra] = useState<ModuloExtra | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const [isAccessible, sub, extras] = await Promise.all([
          isModuloAcessivel('academy-1', moduleSlug),
          getAssinatura('academy-1'),
          getModulosExtrasDescoberta('academy-1'),
        ]);
        setAccessible(isAccessible);
        setAssinatura(sub);
        const found = extras.find((e) => e.slug === moduleSlug) ?? null;
        setExtra(found);
      } catch {
        // On error, default to accessible to avoid blocking
        setAccessible(true);
      }
    }
    check();
  }, [moduleSlug]);

  // Loading state
  if (accessible === null) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton variant="text" className="h-6 w-48" />
        <Skeleton variant="card" />
      </div>
    );
  }

  // Not accessible: show upsell
  if (!accessible && assinatura) {
    const moduleData = (assinatura.usoDescoberta ?? []).find((u) => u.moduloSlug === moduleSlug);
    return (
      <UpsellCard
        moduleSlug={moduleSlug}
        moduleName={extra?.nome ?? moduleData?.moduloNome ?? moduleSlug}
        moduleIcon={extra?.icone ?? ''}
        modulePrice={extra?.precoMensal ?? 0}
        features={[]}
        usageDuringDiscovery={moduleData?.vezesUsado}
      />
    );
  }

  // Accessible but in discovery (not paid) — show banner + children
  const isPaid = assinatura?.modulosPagos.includes(moduleSlug) ?? false;
  const isDiscovery = assinatura?.emPeriodoDescoberta && !isPaid;

  return (
    <div>
      {isDiscovery && !dismissed && extra && (
        <div
          className="relative flex flex-col gap-2 rounded-xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(234,88,12,0.08))',
            border: '1px solid rgba(245,158,11,0.25)',
            marginBottom: '16px',
          }}
        >
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: '#D97706' }}>
              {'\uD83D\uDD13'} Modulo {extra.nome} — incluido no periodo de descoberta.
              Apos {new Date(assinatura!.discoveryEndsAt).toLocaleDateString('pt-BR')},{' '}
              R$ {extra.precoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/admin/plano"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: '#D97706' }}
            >
              Adicionar ao plano
            </a>
            <button
              onClick={() => setDismissed(true)}
              className="flex h-6 w-6 items-center justify-center rounded-full transition-colors"
              style={{ color: 'var(--bb-ink-40)' }}
              aria-label="Fechar"
            >
              {'\u2715'}
            </button>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

ModuleGate.displayName = 'ModuleGate';
