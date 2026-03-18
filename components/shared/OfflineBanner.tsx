'use client';

import { useState, useEffect } from 'react';
import { isOnline, initNetworkListener } from '@/lib/native/offline-cache';

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Check initial status
    isOnline().then((online) => setOffline(!online));

    // Listen for changes
    const cleanupPromise = initNetworkListener(
      () => setOffline(false),
      () => setOffline(true),
    );

    return () => {
      cleanupPromise.then((cleanup) => cleanup());
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[10000] flex items-center justify-center py-2 px-4 text-xs font-medium"
      style={{
        background: '#f59e0b',
        color: '#000',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
      }}
    >
      Sem conexao — mostrando dados salvos
    </div>
  );
}
