'use client';

import { Suspense } from 'react';
import { MainShell } from '@/components/shell/MainShell';
import { CartProvider } from '@/lib/contexts/CartContext';
import { RoleRouteLoadingState } from '@/components/ui/RoleRouteLoadingState';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <MainShell>
        <Suspense fallback={<RoleRouteLoadingState roleLabel="Aluno" title="Carregando sua rotina" description="Agenda, check-in e progresso estao sendo organizados." />}>
          {children}
        </Suspense>
      </MainShell>
    </CartProvider>
  );
}
