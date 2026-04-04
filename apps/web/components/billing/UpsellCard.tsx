'use client';

import { useState } from 'react';
import { ativarModulo } from '@/lib/api/pricing.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/lib/hooks/useToast';

interface UpsellCardProps {
  moduleSlug: string;
  moduleName: string;
  moduleIcon: string;
  modulePrice: number;
  features: string[];
  usageDuringDiscovery?: number;
}

export function UpsellCard({
  moduleSlug,
  moduleName,
  moduleIcon,
  modulePrice,
  features,
  usageDuringDiscovery,
}: UpsellCardProps) {
  const { toast } = useToast();
  const [activating, setActivating] = useState(false);

  async function handleAtivar() {
    setActivating(true);
    try {
      await ativarModulo('academy-1', moduleSlug);
      toast('Modulo ativado!', 'success');
    } catch {
      toast('Erro ao ativar modulo.', 'error');
    } finally {
      setActivating(false);
    }
  }

  return (
    <Card variant="elevated" className="mx-auto max-w-md">
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <span className="text-5xl leading-none">{moduleIcon || '\uD83D\uDD12'}</span>

        {/* Name */}
        <h3
          className="mt-4 text-lg font-bold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          {moduleName}
        </h3>

        {/* Features */}
        {features.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-left text-sm" style={{ color: 'var(--bb-ink-80)' }}>
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-0.5 text-xs" style={{ color: '#22C55E' }}>{'\u2022'}</span>
                {f}
              </li>
            ))}
          </ul>
        )}

        {/* Price */}
        <p className="mt-4">
          <span
            className="text-2xl font-bold font-mono"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            R$ {modulePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>/mes</span>
        </p>

        {/* Discovery usage hint */}
        {usageDuringDiscovery !== undefined && usageDuringDiscovery > 0 && (
          <p
            className="mt-3 rounded-lg px-3 py-2 text-xs"
            style={{
              background: 'rgba(245,158,11,0.1)',
              color: '#D97706',
            }}
          >
            Voce usou {usageDuringDiscovery}x na descoberta! Seus dados estao salvos.
          </p>
        )}

        {/* Actions */}
        <div className="mt-5 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            size="md"
            onClick={handleAtivar}
            loading={activating}
            className="sm:min-w-[140px]"
          >
            Ativar modulo
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              window.location.href = '/admin/plano';
            }}
            className="sm:min-w-[120px]"
          >
            Saiba mais
          </Button>
        </div>
      </div>
    </Card>
  );
}

UpsellCard.displayName = 'UpsellCard';
