import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminShell } from '@/components/shell/AdminShell';
import { RoleRouteLoadingState } from '@/components/ui/RoleRouteLoadingState';

export const metadata: Metadata = { title: 'Admin' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell>
      <Suspense fallback={<RoleRouteLoadingState roleLabel="Owner / Admin" title="Carregando operacao da academia" description="Painel, atalhos e indicadores principais estao sendo preparados." />}>
        {children}
      </Suspense>
    </AdminShell>
  );
}
