import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProfessorShell } from '@/components/shell/ProfessorShell';
import { RoleRouteLoadingState } from '@/components/ui/RoleRouteLoadingState';

export const metadata: Metadata = { title: 'Professor' };

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfessorShell>
      <Suspense fallback={<RoleRouteLoadingState roleLabel="Professor" title="Carregando area de aula" description="Turmas, presencas e atalhos pedagogicos estao sendo preparados." />}>
        {children}
      </Suspense>
    </ProfessorShell>
  );
}
