'use client';

import { useHideValues } from '@/lib/hooks/useHideValues';

export function SensitiveValue({ children }: { children: React.ReactNode }) {
  const { hidden } = useHideValues();

  if (hidden) {
    return <span style={{ color: 'var(--bb-ink-20)' }}>••••••</span>;
  }

  return <>{children}</>;
}
