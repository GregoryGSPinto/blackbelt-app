import type { Metadata } from 'next';
import { AdminShell } from '@/components/shell/AdminShell';

export const metadata: Metadata = { title: 'Admin' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
