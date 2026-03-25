import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SuperAdminShell } from '@/components/shell/SuperAdminShell';

export const metadata: Metadata = { title: 'Super Admin — BlackBelt Platform' };

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuperAdminShell>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      }>
        {children}
      </Suspense>
    </SuperAdminShell>
  );
}
