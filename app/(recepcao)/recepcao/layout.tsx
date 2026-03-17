import type { Metadata } from 'next';
import { RecepcaoShell } from '@/components/shell/RecepcaoShell';

export const metadata: Metadata = { title: 'Recepção' };

export default function RecepcaoLayout({ children }: { children: React.ReactNode }) {
  return <RecepcaoShell>{children}</RecepcaoShell>;
}
