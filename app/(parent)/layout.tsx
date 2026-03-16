import type { Metadata } from 'next';
import { ParentShell } from '@/components/shell/ParentShell';

export const metadata: Metadata = { title: 'Responsavel' };

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <ParentShell>{children}</ParentShell>;
}
