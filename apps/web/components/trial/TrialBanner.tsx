'use client';

import { useState, useEffect } from 'react';
import { isMock } from '@/lib/env';
import { isNative } from '@/lib/platform';

interface TrialBannerProps {
  trialEndsAt?: string | null;
}

export function TrialBanner({ trialEndsAt }: TrialBannerProps) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [native, setNative] = useState(false);

  useEffect(() => {
    setNative(isNative());
  }, []);

  useEffect(() => {
    if (dismissed) return;

    if (isMock()) {
      setDaysLeft(5);
      return;
    }

    if (!trialEndsAt) {
      setDaysLeft(null);
      return;
    }

    const endDate = new Date(trialEndsAt);
    const now = new Date();
    const diff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    setDaysLeft(diff > 0 ? diff : 0);
  }, [trialEndsAt, dismissed]);

  if (dismissed || daysLeft === null || daysLeft < 0) return null;

  const isUrgent = daysLeft <= 3;

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
      style={{
        background: isUrgent
          ? 'color-mix(in srgb, #EF4444 12%, transparent)'
          : 'color-mix(in srgb, #F59E0B 12%, transparent)',
        border: `1px solid ${isUrgent ? '#EF4444' : '#F59E0B'}40`,
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{isUrgent ? '⚠️' : '⏳'}</span>
        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: isUrgent ? '#EF4444' : '#D97706' }}
          >
            {daysLeft === 0
              ? 'Seu periodo de teste termina hoje!'
              : `${daysLeft} dia${daysLeft > 1 ? 's' : ''} restante${daysLeft > 1 ? 's' : ''} no teste gratuito`}
          </p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
            {daysLeft === 0
              ? (native ? 'Entre em contato para gerenciar seu plano.' : 'Acesse Meu Plano para manter o acesso.')
              : 'Aproveite todas as funcionalidades durante o teste.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!native && (
          <a
            href="/admin/plano"
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--bb-brand-gradient)' }}
          >
            Meu plano
          </a>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1.5 text-xs transition-opacity hover:opacity-70"
          style={{ color: 'var(--bb-ink-40)' }}
          title="Fechar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
