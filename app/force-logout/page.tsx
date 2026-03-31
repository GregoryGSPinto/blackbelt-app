'use client';

import { useEffect, useState } from 'react';

/**
 * Emergency logout — nuclear cleanup of ALL auth state.
 * Uses @supabase/supabase-js directly (NOT the app's createBrowserClient)
 * so it works even when the app's Supabase client is corrupted.
 */
export default function ForceLogoutPage() {
  const [status, setStatus] = useState('Limpando sessao...');

  useEffect(() => {
    async function nuke() {
      // 1. Supabase signout — direct client, bypasses any corrupted state
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
        );
        await supabase.auth.signOut();
      } catch {
        // Best-effort — continue cleanup regardless
      }

      // 2. Cookies — clear ALL, including domain-scoped
      try {
        document.cookie.split(';').forEach((c) => {
          const name = c.trim().split('=')[0];
          if (!name) return;
          // Clear for current path
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          // Clear for current domain
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        });
      } catch {
        // Ignore
      }

      // 3. localStorage + sessionStorage
      try { localStorage.clear(); } catch { /* ignore */ }
      try { sessionStorage.clear(); } catch { /* ignore */ }

      // 4. IndexedDB — Supabase stores tokens here
      try {
        const dbs = await indexedDB.databases();
        for (const db of dbs) {
          if (db.name) indexedDB.deleteDatabase(db.name);
        }
      } catch {
        // indexedDB.databases() not supported in all browsers — try known names
        try { indexedDB.deleteDatabase('supabase'); } catch { /* ignore */ }
      }

      setStatus('Redirecionando...');

      // 5. Hard redirect — window.location.replace avoids back-button returning here
      setTimeout(() => {
        window.location.replace('/login');
      }, 400);
    }

    nuke();
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
        <div
          style={{
            width: 32,
            height: 32,
            border: '3px solid rgba(255,255,255,0.2)',
            borderTop: '3px solid #fff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <p style={{ fontSize: '16px', fontWeight: 600 }}>{status}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
