'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('bb-install-dismissed') === 'true') {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem('bb-install-dismissed', 'true');
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-bb-black p-4 shadow-lg sm:left-auto sm:right-4 sm:w-80">
      <div className="flex-1">
        <p className="text-sm font-medium text-white">Instalar BlackBelt</p>
        <p className="text-xs text-bb-gray-500">Acesso rápido na sua tela inicial</p>
      </div>
      <button onClick={handleInstall} className="rounded-lg bg-bb-red px-3 py-1.5 text-xs font-medium text-white">
        Instalar
      </button>
      <button onClick={handleDismiss} className="text-bb-gray-500 hover:text-white" aria-label="Fechar">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
