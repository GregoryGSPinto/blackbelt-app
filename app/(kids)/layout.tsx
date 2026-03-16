import type { Metadata } from 'next';
import { KidsShell } from '@/components/shell/KidsShell';

export const metadata: Metadata = { title: 'Kids' };

export default function KidsLayout({ children }: { children: React.ReactNode }) {
  return <KidsShell>{children}</KidsShell>;
}
