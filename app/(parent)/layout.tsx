import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ParentShell } from '@/components/shell/ParentShell';

export const metadata: Metadata = { title: 'Responsavel' };

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ParentShell>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      }>
        {children}
      </Suspense>
    </ParentShell>
  );
}
