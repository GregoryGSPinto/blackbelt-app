import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProfessorShell } from '@/components/shell/ProfessorShell';

export const metadata: Metadata = { title: 'Professor' };

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfessorShell>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      }>
        {children}
      </Suspense>
    </ProfessorShell>
  );
}
