import type { Metadata } from 'next';
import { TeenShell } from '@/components/shell/TeenShell';

export const metadata: Metadata = { title: 'Teen' };

export default function TeenLayout({ children }: { children: React.ReactNode }) {
  return <TeenShell>{children}</TeenShell>;
}
