'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AddChildForm } from '@/components/parent/AddChildForm';
import { ChevronLeftIcon } from '@/components/shell/icons';
import { useAuth } from '@/lib/hooks/useAuth';
import { Skeleton } from '@/components/ui/Skeleton';

const GUARDIAN_RESOLUTION_ATTEMPTS = 4;
const GUARDIAN_RESOLUTION_DELAY_MS = 750;

export default function NovoFilhoPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const [guardianPersonId, setGuardianPersonId] = useState<string | null>(null);
  const [linkedChildren, setLinkedChildren] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resolvedGuardian, setResolvedGuardian] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadGuardianPerson() {
      if (authLoading) {
        return;
      }

      try {
        for (let attempt = 0; attempt < GUARDIAN_RESOLUTION_ATTEMPTS; attempt += 1) {
          const response = await fetch('/api/parent/current-guardian', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          });
          const payload = await response.json();

          if (response.ok && payload.personId) {
            if (mounted) {
              setGuardianPersonId((payload.personId as string | null) ?? null);
              setLinkedChildren(Number(payload.linkedChildren ?? 0));
              setResolvedGuardian(true);
            }
            return;
          }

          if (attempt < GUARDIAN_RESOLUTION_ATTEMPTS - 1) {
            await new Promise((resolve) => window.setTimeout(resolve, GUARDIAN_RESOLUTION_DELAY_MS));
          }
        }

        if (mounted && !resolvedGuardian) {
          setGuardianPersonId(null);
          setLinkedChildren(0);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadGuardianPerson();
    return () => {
      mounted = false;
    };
  }, [authLoading, resolvedGuardian]);

  if (loading || authLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6 space-y-4">
        <Skeleton variant="text" className="h-5 w-16" />
        <Skeleton variant="text" className="h-8 w-40" />
        <Skeleton variant="text" className="h-4 w-64" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-sm font-medium"
        style={{ color: 'var(--bb-ink-60)' }}
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Voltar
      </button>

      <h1 className="mb-1 text-xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
        Adicionar Filho
      </h1>
      <p className="mb-6 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
        Cadastre um dependente para acompanhar pelo app
      </p>

      {guardianPersonId && (
        <div
          className="mb-4 rounded-lg p-3 text-xs font-medium"
          style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
        >
          Responsavel autenticado com {linkedChildren} dependente(s) ja vinculado(s).
        </div>
      )}

      {!guardianPersonId ? (
        <div
          className="rounded-lg p-4 text-sm"
          style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
        >
          Nao foi possivel identificar o responsavel autenticado para criar o dependente.
        </div>
      ) : (
        <AddChildForm
          guardianPersonId={guardianPersonId}
          onSuccess={() => router.push('/parent')}
          onCancel={() => router.back()}
        />
      )}
    </div>
  );
}
