import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TeenShell } from '@/components/shell/TeenShell';

export const metadata: Metadata = { title: 'Teen' };

export default function TeenLayout({ children }: { children: React.ReactNode }) {
  return (
    <TeenShell>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      }>
        {children}
      </Suspense>
    </TeenShell>
  );
}
