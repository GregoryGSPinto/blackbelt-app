'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { usePlanFeatures } from '@/lib/hooks/usePlanFeatures';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  /** Optional: custom fallback instead of the default locked card */
  fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { canAccess, planName, loading } = usePlanFeatures();

  // While loading, render nothing to avoid flicker
  if (loading) {
    return (
      <div
        className="flex items-center justify-center rounded-xl p-8"
        style={{ backgroundColor: 'var(--bb-depth-2)' }}
      >
        <div
          className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--bb-ink-20)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  // Feature is accessible — render children normally
  if (canAccess(feature)) {
    return <>{children}</>;
  }

  // Custom fallback provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default locked state card
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl p-6 text-center sm:p-8"
      style={{
        backgroundColor: 'var(--bb-depth-2)',
        border: '1px solid var(--bb-glass-border)',
      }}
    >
      {/* Lock icon */}
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bb-ink-20) 30%, transparent)',
        }}
      >
        <Lock
          size={24}
          style={{ color: 'var(--bb-ink-40)' }}
        />
      </div>

      {/* Heading */}
      <h3
        className="mt-4 text-base font-semibold sm:text-lg"
        style={{ color: 'var(--bb-ink-100)' }}
      >
        Recurso do plano {planName}
      </h3>

      {/* Description */}
      <p
        className="mt-2 max-w-xs text-sm"
        style={{ color: 'var(--bb-ink-60)' }}
      >
        Este recurso não está disponível no seu plano atual.
      </p>

      {/* CTA link */}
      <Link
        href="/admin/plano"
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
        style={{
          background: 'var(--bb-brand-gradient)',
          color: '#fff',
        }}
      >
        Comparar planos
      </Link>
    </div>
  );
}
