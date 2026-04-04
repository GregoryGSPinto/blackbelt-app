'use client';

import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  useEffect(() => {
    if (!isOffline) return;
    import('@/lib/offline/db').then(async ({ getPendingCheckins, getPendingFeedback }) => {
      const c = await getPendingCheckins();
      const f = await getPendingFeedback();
      setPendingCount(c.length + f.length);
    }).catch(() => {});
  }, [isOffline]);

  if (!isOffline) return null;

  return (
    <div
      className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-lg lg:bottom-4"
      style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      <span>Sem conexao</span>
      {pendingCount > 0 && (
        <span
          className="ml-1 rounded-full px-2 py-0.5 text-xs"
          style={{ background: '#EF4444', color: '#fff' }}
        >
          {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
