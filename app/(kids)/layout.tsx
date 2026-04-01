import type { Metadata } from 'next';
import { Suspense } from 'react';
import { KidsShell } from '@/components/shell/KidsShell';
import { RoleRouteLoadingState } from '@/components/ui/RoleRouteLoadingState';

export const metadata: Metadata = { title: 'Kids' };

export default function KidsLayout({ children }: { children: React.ReactNode }) {
  return (
    <KidsShell>
      <Suspense fallback={<RoleRouteLoadingState roleLabel="Kids" title="Carregando area guiada" description="Atividades, progresso e atalhos apropriados para criancas estao sendo preparados." />}>
        {children}
      </Suspense>
    </KidsShell>
  );
}
