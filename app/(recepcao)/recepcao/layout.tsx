import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RecepcaoShell } from '@/components/shell/RecepcaoShell';

export const metadata: Metadata = { title: 'Recepção' };

export default function RecepcaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <RecepcaoShell>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      }>
        {children}
      </Suspense>
    </RecepcaoShell>
  );
}
