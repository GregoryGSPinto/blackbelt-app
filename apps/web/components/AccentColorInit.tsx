'use client';

import { useEffect } from 'react';
import { DEFAULT_ACCENT } from '@/lib/constants/accent-colors';

export function AccentColorInit() {
  useEffect(() => {
    const saved = localStorage.getItem('bb-accent-color') || DEFAULT_ACCENT;
    document.documentElement.style.setProperty('--bb-accent', saved);
    document.documentElement.style.setProperty('--bb-accent-light', saved + '1A');
  }, []);

  return null;
}
