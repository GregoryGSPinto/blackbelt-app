import type { Metadata } from 'next';
import { SuperAdminShell } from '@/components/shell/SuperAdminShell';

export const metadata: Metadata = { title: 'Super Admin — BlackBelt Platform' };

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <SuperAdminShell>{children}</SuperAdminShell>;
}
