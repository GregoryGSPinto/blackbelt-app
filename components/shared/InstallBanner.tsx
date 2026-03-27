'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (localStorage.getItem('bb-install-dismissed')) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 30000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('bb-install-dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-sm rounded-xl p-4 shadow-2xl sm:left-auto sm:right-4 lg:bottom-4"
      style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}
    >
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 p-1 opacity-50 hover:opacity-100"
        aria-label="Fechar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ background: '#C62828' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Instalar BlackBelt
          </p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
            Acesse mais rapido direto da tela inicial
          </p>
        </div>
      </div>
      <button
        onClick={handleInstall}
        className="mt-3 w-full rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        style={{ background: '#C62828' }}
      >
        Instalar App
      </button>
    </div>
  );
}
