import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Entrar' };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bb-black">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
