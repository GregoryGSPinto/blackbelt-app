'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function AuthGuard({
  children,
  allowedRoles,
  redirectTo = '/login',
}: AuthGuardProps) {
  const { profile, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
      router.replace('/selecionar-perfil');
    }
  }, [isAuthenticated, profile, isLoading, allowedRoles, redirectTo, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bb-depth-1)' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"
            style={{ borderColor: 'var(--bb-brand)', borderTopColor: 'transparent' }}
          />
          <Skeleton variant="text" className="h-4 w-32" />
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) return null;

  // Wrong role — access denied
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bb-depth-1)' }}>
        <div className="max-w-md text-center p-8">
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Acesso negado
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            Voce nao tem permissao para acessar esta pagina.
          </p>
          <button
            onClick={() => router.replace('/selecionar-perfil')}
            className="mt-6 rounded-xl px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--bb-brand)' }}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
