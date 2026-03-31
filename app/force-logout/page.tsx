'use client';

import { useEffect } from 'react';

/**
 * Emergency logout page — works even when the app is completely frozen.
 * Clears ALL cookies, storage, and Supabase session, then redirects to /login.
 * No AuthContext, no shell, no layout dependencies.
 */
export default function ForceLogoutPage() {
  useEffect(() => {
    // 1. Clear ALL cookies
    document.cookie.split(';').forEach((c) => {
      const name = c.trim().split('=')[0];
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });

    // 2. Clear storage
    try { localStorage.clear(); } catch { /* ignore */ }
    try { sessionStorage.clear(); } catch { /* ignore */ }

    // 3. Sign out from Supabase (best-effort)
    (async () => {
      try {
        const { createBrowserClient } = await import('@/lib/supabase/client');
        const supabase = createBrowserClient();
        await supabase.auth.signOut();
      } catch {
        // Ignore — we're already clearing everything
      }
    })();

    // 4. Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#1a1a2e',
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Saindo...</p>
        <p style={{ color: '#999', marginTop: '8px' }}>
          Limpando sessao e redirecionando para o login.
        </p>
      </div>
    </div>
  );
}
