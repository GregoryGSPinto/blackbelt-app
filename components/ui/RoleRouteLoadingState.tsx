'use client';

import { Spinner } from '@/components/ui/Spinner';

interface RoleRouteLoadingStateProps {
  roleLabel: string;
  title?: string;
  description?: string;
}

export function RoleRouteLoadingState({
  roleLabel,
  title = 'Carregando sua area',
  description = 'Estamos organizando seu contexto e os dados principais desta rotina.',
}: RoleRouteLoadingStateProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div
        className="w-full max-w-md rounded-2xl p-6 text-center"
        style={{
          background: 'var(--bb-depth-3)',
          border: '1px solid var(--bb-glass-border)',
          boxShadow: 'var(--bb-shadow-lg)',
        }}
      >
        <div className="mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]" style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}>
          {roleLabel}
        </div>
        <div className="mb-4 flex justify-center">
          <Spinner size="lg" className="text-[var(--bb-brand)]" />
        </div>
        <h2 className="text-lg font-bold text-[var(--bb-ink-100)]">{title}</h2>
        <p className="mt-2 text-sm text-[var(--bb-ink-60)]">{description}</p>
      </div>
    </div>
  );
}
