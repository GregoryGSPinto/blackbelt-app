'use client';

import { MainShell } from '@/components/shell/MainShell';
import { CartProvider } from '@/lib/contexts/CartContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <MainShell>{children}</MainShell>
    </CartProvider>
  );
}
