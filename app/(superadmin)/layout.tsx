import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SuperAdminShell } from '@/components/shell/SuperAdminShell';
import { RoleRouteLoadingState } from '@/components/ui/RoleRouteLoadingState';

export const metadata: Metadata = { title: 'Super Admin — BlackBelt Platform' };

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuperAdminShell>
      <Suspense fallback={<RoleRouteLoadingState roleLabel="Super Admin" title="Carregando Central da Plataforma" description="Saude, risco, feedbacks e operacao global estao sendo agregados." />}>
        {children}
      </Suspense>
    </SuperAdminShell>
  );
}
