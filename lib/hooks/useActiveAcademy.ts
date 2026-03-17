'use client';

import { isMock } from '@/lib/env';

/**
 * Returns the active academy ID.
 * In mock mode: returns 'academy-1'.
 * In real mode: reads from bb-academy-id cookie (set during profile selection).
 */
export function getActiveAcademyId(): string {
  if (isMock()) return 'academy-1';

  if (typeof document === 'undefined') return '';

  const match = document.cookie.match(/bb-academy-id=([^;]+)/);
  return match?.[1] ?? '';
}
