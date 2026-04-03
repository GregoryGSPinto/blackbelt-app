'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { MODULE_NAMES, getMinimumPlan, type ModuleId } from '@/lib/plans/module-access';
import type { PlanDefinition } from '@/lib/plans/module-access';
import { PricingGuard } from '@/components/shared/PricingGuard';
import { ManageOnWebMessage } from '@/components/shared/ManageOnWebMessage';

interface UpgradeScreenProps {
  module: ModuleId;
  currentPlan: PlanDefinition | null;
  requiredPlan: PlanDefinition | null;
}

const UpgradeScreen = forwardRef<HTMLDivElement, UpgradeScreenProps>(
  function UpgradeScreen({ module, currentPlan, requiredPlan }, ref) {
    const router = useRouter();
    const required = requiredPlan ?? getMinimumPlan(module);
    const moduleName = MODULE_NAMES[module];

    // Get features of the required plan that aren't in the current plan
    const upgradeModules = required.modules.filter(
      (m) => !currentPlan?.modules.includes(m),
    );
    const upgradeFeatureNames = upgradeModules
      .slice(0, 6)
      .map((m) => MODULE_NAMES[m]);

    return (
      <PricingGuard nativeFallback={<div ref={ref} className="p-6"><ManageOnWebMessage feature="sua assinatura" /></div>}>
      <div
        ref={ref}
        className="flex min-h-[60vh] items-center justify-center p-4"
      >
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
          }}
        >
          {/* Lock icon */}
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: 'var(--bb-brand-surface, rgba(239,68,68,0.1))' }}
          >
            <Lock className="h-8 w-8" style={{ color: 'var(--bb-brand)' }} />
          </div>

          {/* Title */}
          <h2
            className="mb-2 text-xl font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Modulo Premium
          </h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            <strong style={{ color: 'var(--bb-ink-80)' }}>{moduleName}</strong>{' '}
            esta disponivel a partir do plano{' '}
            <strong style={{ color: 'var(--bb-brand)' }}>{required.name}</strong>.
          </p>

          {/* Current vs Required */}
          <div
            className="mb-6 flex items-center justify-center gap-4 rounded-xl p-4"
            style={{ background: 'var(--bb-depth-3)' }}
          >
            <div className="text-center">
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Seu plano
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
                {currentPlan?.name ?? 'Starter'}
              </p>
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                R$ {currentPlan?.price ?? 97}/mes
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5" style={{ color: 'var(--bb-ink-30)' }} />
            <div className="text-center">
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Necessario
              </p>
              <p className="text-sm font-bold" style={{ color: 'var(--bb-brand)' }}>
                {required.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--bb-brand)' }}>
                {required.price > 0 ? `R$ ${required.price}/mes` : 'Sob consulta'}
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-6 text-left">
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              O que voce ganha com o {required.name}:
            </p>
            <div className="space-y-2">
              {upgradeFeatureNames.map((name) => (
                <div key={name} className="flex items-center gap-2">
                  <CheckCircle2
                    className="h-4 w-4 shrink-0"
                    style={{ color: 'var(--bb-success, #22c55e)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                    {name}
                  </span>
                </div>
              ))}
              {upgradeModules.length > 6 && (
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  + {upgradeModules.length - 6} modulos adicionais
                </p>
              )}
              {currentPlan && (
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  + tudo do plano {currentPlan.name}
                </p>
              )}
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/admin/plano"
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--bb-brand)' }}
          >
            Fazer Upgrade para {required.name}
          </Link>

          {/* Secondary actions */}
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/admin/plano"
              className="text-xs font-medium transition-opacity hover:opacity-80"
              style={{ color: 'var(--bb-brand)' }}
            >
              Ver todos os planos
            </Link>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-80"
              style={{ color: 'var(--bb-ink-50)' }}
            >
              <ArrowLeft className="h-3 w-3" />
              Voltar
            </button>
          </div>
        </div>
      </div>
      </PricingGuard>
    );
  },
);

UpgradeScreen.displayName = 'UpgradeScreen';

export { UpgradeScreen };
