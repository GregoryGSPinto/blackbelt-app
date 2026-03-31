'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AddChildForm } from '@/components/parent/AddChildForm';
import { ChevronLeftIcon } from '@/components/shell/icons';
import { useAuth } from '@/lib/hooks/useAuth';
import { getPersonByAccountId } from '@/lib/api/family.service';
import { Skeleton } from '@/components/ui/Skeleton';

export default function NovoFilhoPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [guardianPersonId, setGuardianPersonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadGuardianPerson() {
      if (!profile?.user_id) {
        if (mounted) {
          setGuardianPersonId(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { createBrowserClient } = await import('@/lib/supabase/client');
        const supabase = createBrowserClient();

        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('person_id')
          .eq('id', profile.id)
          .maybeSingle();

        const person = currentProfile?.person_id
          ? { id: currentProfile.person_id }
          : await getPersonByAccountId(profile.user_id);

        if (mounted) {
          setGuardianPersonId(person?.id ?? null);
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
  }, [profile?.user_id]);

  if (loading) {
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
