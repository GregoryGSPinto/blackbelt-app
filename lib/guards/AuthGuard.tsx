'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

interface AuthGuardProps {
  requiredRole?: string;
  children: React.ReactNode;
}

export function AuthGuard({ requiredRole, children }: AuthGuardProps) {
  const { profile, isLoading } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!profile) {
      router.replace('/login');
      return;
    }

    if (requiredRole && profile.role !== requiredRole) {
      router.replace('/login');
      return;
    }

    setChecked(true);
  }, [profile, isLoading, requiredRole, router]);

  if (isLoading || !checked) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bb-depth-1, #0a0a0a)' }}
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-2"
          style={{
            borderColor: 'var(--bb-glass-border, rgba(255,255,255,0.1))',
            borderTopColor: 'var(--bb-brand, #ef4444)',
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
