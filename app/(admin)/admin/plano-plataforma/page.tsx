'use client';

import { useEffect, useState, useCallback } from 'react';
import { getUsage, PLATFORM_PLANS, type UsageDTO } from '@/lib/api/platform-plans.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { ComingSoon } from '@/components/shared/ComingSoon';
import { PricingGuard } from '@/components/shared/PricingGuard';
import { ManageOnWebMessage } from '@/components/shared/ManageOnWebMessage';
import { logServiceError } from '@/lib/api/errors';

export default function PlanoPlataformaPage() {
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [usage, setUsage] = useState<UsageDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await getUsage(getActiveAcademyId());
      setUsage(data);
    } catch (err) {
      logServiceError(err, 'plano-plataforma');
      setLoadError('Nao foi possivel carregar os dados do plano.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/admin" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (loadError || !usage) {
    return (
      <div className="p-6">
        <ErrorState
          title="Plano indisponivel"
          description={loadError || 'Nao foi possivel carregar os dados do plano.'}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <PricingGuard nativeFallback={<div className="p-6"><ManageOnWebMessage feature="seu plano" /></div>}>
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Plano da Plataforma</h1>

      {/* Current Usage */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Unidades', ...usage.units },
          { label: 'Alunos', ...usage.students },
          { label: 'Turmas', ...usage.classes },
        ].map((item) => {
          const pct = item.limit >= 9999 ? 0 : (item.current / item.limit) * 100;
          return (
            <Card key={item.label} className="p-4">
              <p className="text-xs text-bb-gray-500">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-bb-black">
                {item.current}<span className="text-sm font-normal text-bb-gray-500">/{item.limit >= 9999 ? '∞' : item.limit}</span>
              </p>
              {item.limit < 9999 && (
                <div className="mt-2 h-1.5 rounded-full bg-bb-gray-200">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: pct > 80 ? 'var(--bb-danger)' : pct > 50 ? 'var(--bb-warning)' : 'var(--bb-success)' }} />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Plan Comparison */}
      <div className="grid gap-4 md:grid-cols-3">
        {PLATFORM_PLANS.map((plan) => {
          const isCurrent = plan.id === usage.plan.id;
          return (
            <Card key={plan.id} className={`p-6 ${isCurrent ? 'border-2 border-bb-primary' : ''}`}>
              {isCurrent && <span className="mb-2 inline-block rounded-full bg-bb-primary px-2 py-0.5 text-xs font-bold text-white">Atual</span>}
              <h3 className="text-lg font-bold text-bb-black">{plan.name}</h3>
              <p className="mt-1 text-2xl font-extrabold text-bb-black">
                {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}`}
                {plan.price > 0 && <span className="text-sm font-normal text-bb-gray-500">/mês</span>}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="text-bb-gray-700">{plan.limits.units >= 9999 ? 'Unidades ilimitadas' : `${plan.limits.units} unidade${plan.limits.units > 1 ? 's' : ''}`}</li>
                <li className="text-bb-gray-700">{plan.limits.students >= 9999 ? 'Alunos ilimitados' : `${plan.limits.students} alunos`}</li>
                <li className="text-bb-gray-700">{plan.limits.classes >= 9999 ? 'Turmas ilimitadas' : `${plan.limits.classes} turmas`}</li>
                <li className={plan.limits.reports ? 'text-bb-gray-700' : 'text-bb-gray-400 line-through'}>Relatórios</li>
                <li className={plan.limits.automations ? 'text-bb-gray-700' : 'text-bb-gray-400 line-through'}>Automações</li>
                <li className={plan.limits.whiteLabel ? 'text-bb-gray-700' : 'text-bb-gray-400 line-through'}>White-label</li>
                <li className={plan.limits.api ? 'text-bb-gray-700' : 'text-bb-gray-400 line-through'}>API</li>
              </ul>
              <div className="mt-4">
                {isCurrent ? (
                  <Button variant="secondary" className="w-full" disabled>Plano Atual</Button>
                ) : (
                  <Button variant={plan.price > usage.plan.price ? 'primary' : 'ghost'} className="w-full">
                    {plan.price > usage.plan.price ? 'Upgrade' : 'Downgrade'}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
    </PricingGuard>
  );
}
