import type { Metadata } from 'next';
import { AuthLayoutFrame } from '@/components/auth/AuthLayoutFrame';

export const metadata: Metadata = { title: 'Entrar' };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayoutFrame>{children}</AuthLayoutFrame>;
}
