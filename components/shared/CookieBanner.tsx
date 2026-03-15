'use client';

import { forwardRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

const CookieBanner = forwardRef<HTMLDivElement, { className?: string }>(
  function CookieBanner({ className }, ref) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      const consent = document.cookie.match(/bb-cookie-consent=([^;]+)/);
      if (!consent) setVisible(true);
    }, []);

    function accept() {
      document.cookie = 'bb-cookie-consent=all;path=/;max-age=31536000;samesite=lax';
      setVisible(false);
    }

    function acceptEssential() {
      document.cookie = 'bb-cookie-consent=essential;path=/;max-age=31536000;samesite=lax';
      setVisible(false);
    }

    if (!visible) return null;

    return (
      <div
        ref={ref}
        className={`fixed bottom-0 left-0 right-0 z-50 border-t border-bb-gray-200 bg-white p-4 shadow-lg sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-6 ${className ?? ''}`}
      >
        <p className="mb-3 text-sm text-bb-gray-600 sm:mb-0">
          Utilizamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa{' '}
          <a href="/privacidade" className="text-bb-red underline">Política de Privacidade</a>.
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={acceptEssential}>Apenas essenciais</Button>
          <Button variant="primary" onClick={accept}>Aceitar todos</Button>
        </div>
      </div>
    );
  },
);

CookieBanner.displayName = 'CookieBanner';
export { CookieBanner };
