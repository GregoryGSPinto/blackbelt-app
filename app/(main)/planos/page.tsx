'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listPlans } from '@/lib/api/planos.service';
import type { Plan } from '@/lib/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { ComingSoon } from '@/components/shared/ComingSoon';

export default function PlanosPage() {
  const router = useRouter();
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlanId] = useState<string | null>(null); // TODO: fetch from subscription

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    listPlans(getActiveAcademyId()).then(setPlans).finally(() => setLoading(false));
  }, []);

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/dashboard" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Planos" subtitle="Escolha o plano ideal para você" />

      {plans.length === 0 && (
        <EmptyState
          icon="💳"
          title="Nenhum plano disponível"
          description="Os planos da academia ainda não foram configurados. Entre em contato com a recepção."
          variant="first-time"
        />
      )}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isPopular = plan.interval === 'quarterly';
          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 p-6 transition-shadow hover:shadow-lg ${
                isCurrent ? 'border-bb-primary bg-red-50' : isPopular ? 'border-bb-primary' : 'border-bb-gray-200'
              }`}
            >
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-bb-primary px-3 py-0.5 text-xs font-bold text-white">
                  Popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-600 px-3 py-0.5 text-xs font-bold text-white">
                  Plano Atual
                </span>
              )}

              <h3 className="text-lg font-bold text-bb-black">{plan.name}</h3>

              <div className="mt-4">
                <span className="text-3xl font-extrabold text-bb-black">
                  R$ {plan.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-sm text-bb-gray-500">
                  /{plan.interval === 'monthly' ? 'mês' : plan.interval === 'quarterly' ? 'trim' : 'ano'}
                </span>
              </div>

              <ul className="mt-4 space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-bb-gray-700">
                    <span className="text-green-600">✓</span> {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {isCurrent ? (
                  <Button variant="secondary" className="w-full" disabled>
                    Plano Atual
                  </Button>
                ) : (
                  <Button
                    variant={isPopular ? 'primary' : 'secondary'}
                    className="w-full"
                    onClick={() => router.push(`/checkout/${plan.id}`)}
                  >
                    Assinar
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
