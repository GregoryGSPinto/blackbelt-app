'use client';

import { ShieldIcon } from '@/components/shell/icons';

export default function AuditoriaPage() {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: 'rgba(245,158,11,0.12)' }}
      >
        <ShieldIcon className="h-8 w-8" style={{ color: '#f59e0b' }} />
      </div>
      <h1 className="mt-4 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Auditoria</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
        Logs de auditoria da plataforma em breve.
      </p>
    </div>
  );
}
