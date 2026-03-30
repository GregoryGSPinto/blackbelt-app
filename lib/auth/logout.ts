'use client';

import * as authService from '@/lib/api/auth.service';
import { isMock } from '@/lib/env';
import { clearTokens } from '@/lib/security';
import { resetAnalytics } from '@/lib/analytics/posthog';

/**
 * Logout nuclear — limpa sessão Supabase, cookies, localStorage, sessionStorage.
 * Usa window.location.href (hard redirect) para limpar React state completamente.
 */
export async function performLogout(): Promise<void> {
  // 1. Supabase signOut + clear cookies (best effort)
  try {
    await authService.logout();
  } catch (err) {
    console.error('[logout] Erro no signOut:', err);
  }

  // 2. Reset analytics
  try {
    resetAnalytics();
  } catch {
    // silencioso
  }

  // 3. Clear mock tokens
  if (isMock()) {
    clearTokens();
  }

  // 4. Limpar localStorage (sb-*, bb_*, auth, profile, tour)
  if (typeof localStorage !== 'undefined') {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('sb-') ||
          key.startsWith('bb_') ||
          key.startsWith('bb-') ||
          key.includes('supabase') ||
          key.includes('auth') ||
          key.includes('profile') ||
          key.includes('tour'))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  // 5. Limpar sessionStorage
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }

  // 6. Hard redirect — limpa React state completamente
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
