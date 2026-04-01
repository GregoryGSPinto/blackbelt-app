import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ParentShell } from '@/components/shell/ParentShell';
import { RoleRouteLoadingState } from '@/components/ui/RoleRouteLoadingState';

export const metadata: Metadata = { title: 'Responsavel' };

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ParentShell>
      <Suspense fallback={<RoleRouteLoadingState roleLabel="Responsavel" title="Carregando rotina da familia" description="Dependentes, agenda e proximas acoes estao sendo organizados." />}>
        {children}
      </Suspense>
    </ParentShell>
  );
}
