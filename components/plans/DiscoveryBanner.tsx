'use client';

import { forwardRef, useState } from 'react';
import Link from 'next/link';
import { Gift, X } from 'lucide-react';

interface DiscoveryBannerProps {
  daysLeft: number;
  variant?: 'admin' | 'member';
}

const DiscoveryBanner = forwardRef<HTMLDivElement, DiscoveryBannerProps>(
  function DiscoveryBanner({ daysLeft, variant = 'member' }, ref) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    // Color based on urgency
    let bg: string;
    let border: string;
    let text: string;

    if (daysLeft <= 0) {
      bg = 'rgba(239,68,68,0.08)';
      border = 'rgba(239,68,68,0.3)';
      text = 'var(--bb-brand)';
    } else if (daysLeft <= 7) {
      bg = 'rgba(239,68,68,0.08)';
      border = 'rgba(239,68,68,0.3)';
      text = '#ef4444';
    } else if (daysLeft <= 30) {
      bg = 'rgba(245,158,11,0.08)';
      border = 'rgba(245,158,11,0.3)';
      text = '#f59e0b';
    } else {
      bg = 'rgba(59,130,246,0.08)';
      border = 'rgba(59,130,246,0.3)';
      text = '#3b82f6';
    }

    return (
      <div
        ref={ref}
        className="flex items-center gap-3 px-4 py-2.5"
        style={{
          background: bg,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <Gift className="h-4 w-4 shrink-0" style={{ color: text }} />
        <p className="flex-1 text-xs font-medium" style={{ color: text }}>
          {daysLeft > 0 && variant === 'admin' && `Periodo de descoberta: ${daysLeft} dias restantes. Todos os modulos estao liberados!`}
          {daysLeft > 0 && variant === 'member' && `Sua academia esta em periodo de descoberta por mais ${daysLeft} dias.`}
          {daysLeft <= 0 && 'Seu periodo de descoberta expirou. Modulos nao contratados foram desativados.'}
          {daysLeft > 0 && variant === 'admin' && (
            <span style={{ color: 'var(--bb-ink-50)' }}>
              {' '}Escolha seu plano antes que expire.
            </span>
          )}
          {daysLeft > 0 && variant === 'member' && (
            <span style={{ color: 'var(--bb-ink-50)' }}>
              {' '}Se precisar de acesso continuo aos modulos, fale com o administrador da academia.
            </span>
          )}
        </p>
        {variant === 'admin' && (
          <Link
            href="/admin/plano"
            className="shrink-0 rounded-lg px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: text }}
          >
            Ver planos
          </Link>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-md p-1 transition-opacity hover:opacity-70"
          style={{ color: text }}
          aria-label="Fechar banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  },
);

DiscoveryBanner.displayName = 'DiscoveryBanner';

export { DiscoveryBanner };
