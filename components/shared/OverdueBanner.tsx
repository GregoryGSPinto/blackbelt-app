'use client';

import { forwardRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, X } from 'lucide-react';
import { isNative } from '@/lib/platform';
import { getSiteUrl } from '@/lib/config/domains';

const OverdueBanner = forwardRef<HTMLDivElement>(
  function OverdueBanner(_props, ref) {
    const [dismissed, setDismissed] = useState(false);
    const [native, setNative] = useState(false);

    useEffect(() => {
      setNative(isNative());
    }, []);

    // Check session dismissal
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const key = 'bb_overdue_banner_dismissed';
        if (sessionStorage.getItem(key) === '1') {
          setDismissed(true);
        }
      }
    }, []);

    if (dismissed) return null;

    function handleDismiss() {
      setDismissed(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('bb_overdue_banner_dismissed', '1');
      }
    }

    const siteUrl = getSiteUrl();

    return (
      <div
        ref={ref}
        className="flex items-center gap-3 px-4 py-2.5"
        style={{
          background: 'rgba(239,68,68,0.08)',
          borderBottom: '1px solid rgba(239,68,68,0.3)',
        }}
      >
        <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: '#ef4444' }} />
        <p className="flex-1 text-xs font-medium" style={{ color: '#ef4444' }}>
          Pagamento pendente.{' '}
          {native
            ? `Regularize sua assinatura em ${siteUrl.replace('https://', '')} para evitar a suspensao do acesso.`
            : 'Regularize sua assinatura para evitar a suspensao do acesso aos modulos contratados.'}
        </p>
        {!native && (
          <Link
            href="/admin/plano"
            className="shrink-0 rounded-lg px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: '#ef4444' }}
          >
            Regularizar
          </Link>
        )}
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-md p-1 transition-opacity hover:opacity-70"
          style={{ color: '#ef4444' }}
          aria-label="Fechar banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  },
);

OverdueBanner.displayName = 'OverdueBanner';

export { OverdueBanner };
