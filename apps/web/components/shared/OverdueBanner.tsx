'use client';

import { forwardRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, ShieldAlert, Lock, X } from 'lucide-react';
import { isNative } from '@/lib/platform';
import { getSiteUrl } from '@/lib/config/domains';
import type { SubscriptionBillingStatus } from '@/lib/types/billing';

interface OverdueBannerProps {
  /** Billing status from the régua de cobrança. Defaults to 'grace' for backward compatibility. */
  billingStatus?: SubscriptionBillingStatus;
}

const BANNER_CONFIG: Record<string, {
  icon: typeof AlertTriangle;
  color: string;
  bg: string;
  border: string;
  message: string;
  nativeMessage: string;
  cta: string;
  dismissible: boolean;
}> = {
  grace: {
    icon: AlertTriangle,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.3)',
    message: 'Sua mensalidade venceu. Regularize nos proximos dias para evitar restricoes.',
    nativeMessage: 'Sua mensalidade venceu. Regularize para manter o acesso.',
    cta: 'Regularizar',
    dismissible: true,
  },
  warning: {
    icon: ShieldAlert,
    color: '#F97316',
    bg: 'rgba(249,115,22,0.08)',
    border: 'rgba(249,115,22,0.3)',
    message: 'Acesso sera limitado em breve. Regularize sua assinatura agora.',
    nativeMessage: 'Acesso sera limitado em breve. Regularize sua assinatura.',
    cta: 'Regularizar agora',
    dismissible: true,
  },
  suspended: {
    icon: ShieldAlert,
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.3)',
    message: 'Acesso limitado por inadimplencia. Cadastro e financeiro bloqueados. Regularize para restaurar.',
    nativeMessage: 'Acesso limitado por inadimplencia. Regularize sua assinatura.',
    cta: 'Regularizar',
    dismissible: false,
  },
  blocked: {
    icon: Lock,
    color: '#DC2626',
    bg: 'rgba(220,38,38,0.10)',
    border: 'rgba(220,38,38,0.4)',
    message: 'Conta bloqueada por inadimplencia. Regularize seu acesso para continuar usando o sistema.',
    nativeMessage: 'Conta bloqueada. Entre em contato para regularizar.',
    cta: 'Regularizar',
    dismissible: false,
  },
  past_due: {
    icon: AlertTriangle,
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.3)',
    message: 'Pagamento pendente. Regularize sua assinatura para evitar a suspensao do acesso.',
    nativeMessage: 'Pagamento pendente. Regularize sua assinatura.',
    cta: 'Regularizar',
    dismissible: true,
  },
};

const OverdueBanner = forwardRef<HTMLDivElement, OverdueBannerProps>(
  function OverdueBanner({ billingStatus }, ref) {
    const [dismissed, setDismissed] = useState(false);
    const [native, setNative] = useState(false);

    useEffect(() => {
      setNative(isNative());
    }, []);

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const key = 'bb_overdue_banner_dismissed';
        if (sessionStorage.getItem(key) === '1') {
          setDismissed(true);
        }
      }
    }, []);

    // Determine which config to use
    const status = billingStatus ?? 'past_due';
    const config = BANNER_CONFIG[status];
    if (!config) return null;
    if (dismissed && config.dismissible) return null;

    function handleDismiss() {
      setDismissed(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('bb_overdue_banner_dismissed', '1');
      }
    }

    const siteUrl = getSiteUrl();
    const Icon = config.icon;

    // Full-screen blocked state
    if (status === 'blocked') {
      return (
        <div
          ref={ref}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'var(--bb-depth-0)' }}
        >
          <div className="max-w-md text-center">
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: config.bg }}
            >
              <Lock className="h-10 w-10" style={{ color: config.color }} />
            </div>
            <h1 className="mt-6 text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              Conta bloqueada
            </h1>
            <p className="mt-3 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              {native
                ? `Regularize sua assinatura em ${siteUrl.replace('https://', '')} para continuar.`
                : config.message}
            </p>
            {!native && (
              <Link
                href="/admin/plano"
                className="mt-6 inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: config.color }}
              >
                {config.cta}
              </Link>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className="flex items-center gap-3 px-4 py-2.5"
        style={{
          background: config.bg,
          borderBottom: `1px solid ${config.border}`,
        }}
      >
        <Icon className="h-4 w-4 shrink-0" style={{ color: config.color }} />
        <p className="flex-1 text-xs font-medium" style={{ color: config.color }}>
          {native ? config.nativeMessage : config.message}
        </p>
        {!native && (
          <Link
            href="/admin/plano"
            className="shrink-0 rounded-lg px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: config.color }}
          >
            {config.cta}
          </Link>
        )}
        {config.dismissible && (
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-md p-1 transition-opacity hover:opacity-70"
            style={{ color: config.color }}
            aria-label="Fechar banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  },
);

OverdueBanner.displayName = 'OverdueBanner';

export { OverdueBanner };
