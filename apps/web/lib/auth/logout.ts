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
  // 1. Supabase signOut with timeout (best effort — 3s max)
  try {
    await Promise.race([
      authService.logout(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('signOut timeout')), 3000)),
    ]);
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

  // 4. Limpar cookies diretamente (bb-token, bb-active-role, bb-academy-id)
  if (typeof document !== 'undefined') {
    for (const name of ['bb-token', 'bb-active-role', 'bb-academy-id']) {
      document.cookie = `${name}=; Max-Age=0; path=/`;
    }
  }

  // 5. Limpar localStorage (sb-*, bb_*, auth, profile, tour)
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

  // 6. Limpar sessionStorage
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }

  // 7. Hard redirect — limpa React state completamente
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
