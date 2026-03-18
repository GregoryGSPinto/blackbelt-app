'use client';

import { usePathname } from 'next/navigation';

export function AuthLayoutFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/login') {
    return (
      <div className="min-h-screen bg-[var(--bb-depth-1)]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bb-depth-1)]">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
