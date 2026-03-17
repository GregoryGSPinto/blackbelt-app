'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { PlatformPlan } from '@/lib/types';
import { listPlans } from '@/lib/api/superadmin.service';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const FEATURE_MAP: Array<{ key: keyof PlatformPlan; label: string; icon: string }> = [
  { key: 'has_streaming', label: 'Streaming', icon: '🎥' },
  { key: 'has_store', label: 'Loja/Marketplace', icon: '🛒' },
  { key: 'has_events', label: 'Eventos/Campeonatos', icon: '🏆' },
  { key: 'has_financeiro', label: 'Financeiro', icon: '💳' },
];

export default function PlanosPage() {
  const [plans, setPlans] = useState<PlatformPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlans = useCallback(async () => {
    try {
      const data = await listPlans();
      setPlans(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-80" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Planos</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Planos disponiveis para academias na plataforma
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, idx) => {
          const isPopular = idx === 1;
          return (
            <Card
              key={plan.id}
              className="relative flex flex-col p-6"
              style={isPopular ? { border: '2px solid #f59e0b' } : undefined}
            >
              {isPopular && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-bold"
                  style={{ background: '#f59e0b', color: '#fff' }}
                >
                  Mais Popular
                </span>
              )}

              {/* Plan name & badge */}
              <div className="mb-4 text-center">
                <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{plan.name}</h2>
                <span
                  className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    background: plan.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    color: plan.is_active ? '#22c55e' : '#ef4444',
                  }}
                >
                  {plan.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {/* Pricing */}
              <div className="mb-6 text-center">
                <p className="text-3xl font-bold" style={{ color: '#f59e0b' }}>
                  {formatCurrency(plan.price_monthly)}
                </p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>/mes</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                  ou {formatCurrency(plan.price_yearly)}/ano
                </p>
              </div>

              {/* Limits */}
              <div className="mb-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                  Limites
                </h3>
                {[
                  { label: 'Alunos', value: plan.max_students, icon: '👥' },
                  { label: 'Professores', value: plan.max_professors, icon: '🎓' },
                  { label: 'Turmas', value: plan.max_classes, icon: '📅' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{ background: 'var(--bb-depth-2)' }}
                  >
                    <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                      <span>{item.icon}</span> {item.label}
                    </span>
                    <span className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="flex-1">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                  Recursos
                </h3>
                <div className="space-y-1.5">
                  {FEATURE_MAP.map((feat) => {
                    const enabled = Boolean(plan[feat.key]);
                    return (
                      <div
                        key={feat.key}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm"
                        style={{
                          color: enabled ? 'var(--bb-ink-80)' : 'var(--bb-ink-40)',
                          opacity: enabled ? 1 : 0.5,
                        }}
                      >
                        <span>{enabled ? '✅' : '❌'}</span>
                        <span>{feat.icon} {feat.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {plans.length === 0 && (
        <div className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
          Nenhum plano cadastrado.
        </div>
      )}
    </div>
  );
}
