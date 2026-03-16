'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import type { Role } from '@/lib/types';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  professor: 'Professor',
  aluno_adulto: 'Aluno',
  aluno_teen: 'Teen',
  aluno_kids: 'Kids',
  responsavel: 'Responsável',
};

export default function SelecionarPerfilPage() {
  const { profiles, selectProfile } = useAuth();
  const { toast } = useToast();

  async function handleSelect(profileId: string) {
    try {
      await selectProfile(profileId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao selecionar perfil.';
      toast(message, 'error');
    }
  }

  if (profiles.length === 0) {
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
            className="flex items-center gap-4 rounded-lg bg-[var(--bb-depth-5)] p-4 text-left transition-colors hover:bg-[var(--bb-depth-4)]"
          >
            <Avatar name={profile.display_name} size="lg" />
            <div className="flex-1">
              <p className="font-medium text-[var(--bb-ink-100)]">{profile.display_name}</p>
              <Badge variant="active" size="sm" className="mt-1">
                {ROLE_LABELS[profile.role as Role] ?? profile.role}
              </Badge>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
