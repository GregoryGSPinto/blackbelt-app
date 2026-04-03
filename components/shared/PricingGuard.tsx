'use client';

import type { ReactNode } from 'react';
import { useIsNative } from '@/lib/hooks/useIsNative';

interface PricingGuardProps {
  children: ReactNode;
  nativeFallback?: ReactNode;
}

export function PricingGuard({ children, nativeFallback }: PricingGuardProps) {
  const isNative = useIsNative();
  if (isNative) return nativeFallback ? <>{nativeFallback}</> : null;
  return <>{children}</>;
}
