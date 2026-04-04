import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TeenShell } from '@/components/shell/TeenShell';
import { RoleRouteLoadingState } from '@/components/ui/RoleRouteLoadingState';

export const metadata: Metadata = { title: 'Teen' };

export default function TeenLayout({ children }: { children: React.ReactNode }) {
  return (
    <TeenShell>
      <Suspense fallback={<RoleRouteLoadingState roleLabel="Teen" title="Carregando sua area" description="Desafios, ranking e proximas acoes estao sendo preparados." />}>
        {children}
      </Suspense>
    </TeenShell>
  );
}
