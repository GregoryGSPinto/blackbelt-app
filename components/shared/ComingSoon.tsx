'use client';

import Link from 'next/link';
import { Rocket } from 'lucide-react';

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
}

export function ComingSoon({
  title = 'Carregando...',
  subtitle = 'Estamos preparando tudo para você.',
  backHref = '/admin',
  backLabel = 'Voltar ao Dashboard',
}: ComingSoonProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: 'var(--bb-brand-surface, rgba(212,175,55,0.1))' }}
      >
        <Rocket className="h-8 w-8" style={{ color: 'var(--bb-brand, #D4AF37)' }} />
      </div>
      <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100, #1a1a2e)' }}>
        {title}
      </h1>
      <p className="max-w-md text-sm" style={{ color: 'var(--bb-ink-60, #6b7280)' }}>
        {subtitle}
      </p>
      <Link
        href={backHref}
        className="mt-2 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-80"
        style={{
          background: 'var(--bb-depth-3, #f3f4f6)',
          color: 'var(--bb-ink-80, #374151)',
          border: '1px solid var(--bb-glass-border, #e5e7eb)',
        }}
      >
        ← {backLabel}
      </Link>
    </div>
  );
}
