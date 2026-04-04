import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RecepcaoShell } from '@/components/shell/RecepcaoShell';
import { RoleRouteLoadingState } from '@/components/ui/RoleRouteLoadingState';

export const metadata: Metadata = { title: 'Recepção' };

export default function RecepcaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <RecepcaoShell>
      <Suspense fallback={<RoleRouteLoadingState roleLabel="Recepcao" title="Carregando operacao do dia" description="Atendimento, check-in e atalhos rapidos estao sendo preparados." />}>
        {children}
      </Suspense>
    </RecepcaoShell>
  );
}
