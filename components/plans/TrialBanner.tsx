'use client';

import { forwardRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';
import { isNative } from '@/lib/platform';

interface TrialBannerProps {
  daysLeft: number;
}

const TrialBanner = forwardRef<HTMLDivElement, TrialBannerProps>(
  function TrialBanner({ daysLeft }, ref) {
    const [dismissed, setDismissed] = useState(false);
    const [native, setNative] = useState(false);

    useEffect(() => {
      setNative(isNative());
    }, []);

    if (dismissed) return null;

    // Color based on urgency
    let bg: string;
    let border: string;
    let text: string;

    if (daysLeft <= 0) {
      bg = 'rgba(239,68,68,0.08)';
      border = 'rgba(239,68,68,0.3)';
      text = 'var(--bb-brand)';
    } else if (daysLeft <= 2) {
      bg = 'rgba(245,158,11,0.08)';
      border = 'rgba(245,158,11,0.3)';
      text = '#f59e0b';
    } else {
      bg = 'rgba(34,197,94,0.08)';
      border = 'rgba(34,197,94,0.3)';
      text = '#22c55e';
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
        <Sparkles className="h-4 w-4 shrink-0" style={{ color: text }} />
        <p className="flex-1 text-xs font-medium" style={{ color: text }}>
          {daysLeft > 0
            ? `Trial gratuito: ${daysLeft} ${daysLeft === 1 ? 'dia restante' : 'dias restantes'}. Tudo liberado!`
            : native
              ? 'Seu trial terminou. Entre em contato para gerenciar seu plano.'
              : 'Seu trial terminou. Escolha um plano para continuar usando todos os recursos.'}
          {daysLeft > 0 && !native && (
            <span style={{ color: 'var(--bb-ink-50)' }}>
              {' '}Gostando? Escolha um plano para continuar.
            </span>
          )}
          {daysLeft > 0 && native && (
            <span style={{ color: 'var(--bb-ink-50)' }}>
              {' '}Entre em contato para gerenciar seu plano.
            </span>
          )}
        </p>
        {!native && (
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

TrialBanner.displayName = 'TrialBanner';

export { TrialBanner };
