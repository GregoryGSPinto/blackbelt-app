'use client';

import { usePathname } from 'next/navigation';

const FULL_WIDTH_ROUTES = ['/login'];

export function AuthLayoutFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (FULL_WIDTH_ROUTES.includes(pathname)) {
    return (
      <div className="min-h-screen bg-[var(--bb-depth-1)]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bb-depth-1)] px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
