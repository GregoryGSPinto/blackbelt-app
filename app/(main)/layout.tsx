'use client';

import { Suspense } from 'react';
import { MainShell } from '@/components/shell/MainShell';
import { CartProvider } from '@/lib/contexts/CartContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <MainShell>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
          </div>
        }>
          {children}
        </Suspense>
      </MainShell>
    </CartProvider>
  );
}
