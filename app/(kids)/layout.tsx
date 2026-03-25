import type { Metadata } from 'next';
import { Suspense } from 'react';
import { KidsShell } from '@/components/shell/KidsShell';

export const metadata: Metadata = { title: 'Kids' };

export default function KidsLayout({ children }: { children: React.ReactNode }) {
  return (
    <KidsShell>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      }>
        {children}
      </Suspense>
    </KidsShell>
  );
}
