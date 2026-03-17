'use client';

import { useState } from 'react';

interface DiscoveryBannerProps {
  diasRestantes: number;
  onDismiss?: () => void;
}

export function DiscoveryBanner({ diasRestantes, onDismiss }: DiscoveryBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    onDismiss?.();
  }

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[60] flex items-center justify-center px-4"
      style={{
        height: '36px',
        background: 'linear-gradient(90deg, #F59E0B, #EA580C)',
      }}
    >
      <div className="flex items-center gap-3">
        <p className="text-xs font-medium text-white">
          {'\uD83C\uDF81'} Descoberta ativa — {diasRestantes} dias restantes. Explore todos os modulos!
        </p>
        <a
          href="/admin/plano"
          className="rounded px-2 py-0.5 text-xs font-semibold text-white transition-opacity hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          Ver plano
        </a>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white"
        aria-label="Fechar banner"
      >
        {'\u2715'}
      </button>
    </div>
  );
}

DiscoveryBanner.displayName = 'DiscoveryBanner';
