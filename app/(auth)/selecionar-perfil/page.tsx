'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import type { Profile, Role } from '@/lib/types';
import { isMock } from '@/lib/env';

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  gestor: 'Gestor',
  professor: 'Professor',
  recepcao: 'Recepcionista',
  aluno_adulto: 'Aluno',
  aluno_teen: 'Teen',
  aluno_kids: 'Kids',
  responsavel: 'Responsavel',
  franqueador: 'Franqueador',
};

export default function SelecionarPerfilPage() {
  const { profiles: authProfiles, selectProfile, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [timedOut, setTimedOut] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [fallbackProfiles, setFallbackProfiles] = useState<Profile[]>([]);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // Timeout safety: if profiles never load, show fallback after 6s
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 6000);
    return () => clearTimeout(t);
  }, []);

  // Fallback: if AuthContext has no profiles but user might be authenticated,
  // try fetching directly from Supabase
  useEffect(() => {
    if (authProfiles.length > 0 || isLoading || isMock()) return;

    let cancelled = false;
    setFallbackLoading(true);

    (async () => {
      try {
        const { createBrowserClient } = await import('@/lib/supabase/client');
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !cancelled) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id);
          if (!cancelled && profiles && profiles.length > 0) {
            setFallbackProfiles(profiles as Profile[]);
          }
        }
      } catch {
        // Ignore — fallback failed, show session expired
      } finally {
        if (!cancelled) setFallbackLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authProfiles.length, isLoading]);

  const profiles = authProfiles.length > 0 ? authProfiles : fallbackProfiles;
  const isStillLoading = isLoading || fallbackLoading;

  async function handleSelect(profileId: string) {
    setSelecting(true);
    try {
      await selectProfile(profileId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao selecionar perfil.';
      toast(message, 'error');
    } finally {
      setSelecting(false);
    }
  }

  // Still loading: show spinner (respects AuthContext 5s timeout + our 6s)
  if (isStillLoading && !timedOut) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-[var(--bb-depth-3)] p-8">
        <Spinner size="lg" className="text-[var(--bb-ink-100)]" />
      </div>
    );
  }

  // No profiles found: either session expired or no profiles exist
  if (profiles.length === 0) {
    return (
      <div className="rounded-lg bg-[var(--bb-depth-3)] p-8 text-center" style={{ boxShadow: 'var(--bb-shadow-xl)', border: '1px solid var(--bb-glass-border)' }}>
        <h1 className="mb-2 text-xl font-bold text-[var(--bb-ink-100)]">Sessao expirada</h1>
        <p className="mb-6 text-sm text-[var(--bb-ink-60)]">
          {!isAuthenticated
            ? 'Sua sessao expirou. Faca login novamente.'
            : 'Nenhum perfil encontrado para esta conta.'}
        </p>
        <a
          href="/login"
          className="inline-block rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors"
          style={{ background: 'var(--bb-brand)' }}
        >
          Voltar ao login
        </a>
      </div>
    );
  }

  // Auto-select if only 1 profile
  if (profiles.length === 1 && !selecting) {
    handleSelect(profiles[0].id);
    return (
      <div className="flex items-center justify-center rounded-lg bg-[var(--bb-depth-3)] p-8">
        <Spinner size="lg" className="text-[var(--bb-ink-100)]" />
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-[var(--bb-depth-3)] p-8" style={{ boxShadow: 'var(--bb-shadow-xl)', border: '1px solid var(--bb-glass-border)' }}>
      <h1 className="mb-1 text-center text-2xl font-bold text-[var(--bb-ink-100)]">BlackBelt</h1>
      <p className="mb-6 text-center text-sm text-[var(--bb-ink-60)]">Selecione seu perfil</p>

      <div className="flex flex-col gap-3">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => handleSelect(profile.id)}
            disabled={selecting}
            className="flex items-center gap-4 rounded-lg bg-[var(--bb-depth-5)] p-4 text-left transition-colors hover:bg-[var(--bb-depth-4)] disabled:opacity-60"
          >
            <Avatar name={profile.display_name} size="lg" />
            <div className="flex-1">
              <p className="font-medium text-[var(--bb-ink-100)]">{profile.display_name}</p>
              <Badge variant="active" size="sm" className="mt-1">
                {ROLE_LABELS[profile.role as Role] ?? profile.role}
              </Badge>
            </div>
            {selecting && (
              <div className="w-5 h-5 border-2 border-[var(--bb-ink-40)]/30 border-t-[var(--bb-ink-40)] rounded-full animate-spin" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
