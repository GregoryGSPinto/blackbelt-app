'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { setupAutoSync } from '@/lib/offline/sync';

export function OfflineNotice() {
  const [online, setOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setupAutoSync();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (online) return;
    import('@/lib/offline/db').then(async ({ getPendingCheckins, getPendingFeedback }) => {
      const c = await getPendingCheckins();
      const f = await getPendingFeedback();
      setPendingCount(c.length + f.length);
    }).catch(() => {});
  }, [online]);

  if (online) return null;

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[9999] flex items-center justify-center gap-2 py-2 text-center text-sm font-medium"
      style={{
        background: 'rgba(234, 179, 8, 0.95)',
        color: '#000',
        paddingTop: 'calc(var(--safe-area-top, 0px) + 8px)',
      }}
    >
      <WifiOff size={16} />
      Sem conexao — alguns recursos podem nao funcionar
      {pendingCount > 0 && (
        <span className="ml-1 rounded-full bg-black/20 px-2 py-0.5 text-xs font-bold">
          {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
