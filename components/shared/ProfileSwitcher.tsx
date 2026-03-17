'use client';

import { forwardRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import type { Role } from '@/lib/types';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  professor: 'Professor',
  aluno_adulto: 'Aluno',
  aluno_teen: 'Teen',
  aluno_kids: 'Kids',
  responsavel: 'Responsável',
};

interface ProfileSwitcherProps {
  onSwitch?: () => void;
}

/**
 * Inline profile switcher for dropdown menus (Netflix-style).
 * Shows other available profiles for the current user.
 * Only renders if the user has more than one profile.
 */
const ProfileSwitcher = forwardRef<HTMLDivElement, ProfileSwitcherProps>(
  function ProfileSwitcher({ onSwitch }, ref) {
    const { profile, profiles, selectProfile } = useAuth();

    const otherProfiles = profiles.filter((p) => p.id !== profile?.id);

    if (otherProfiles.length === 0) return null;

    async function handleSwitch(profileId: string) {
      onSwitch?.();
      await selectProfile(profileId);
    }

    return (
      <div ref={ref} style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
        <p
          className="px-4 pb-1 pt-3 font-mono text-[11px] uppercase tracking-wider"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          Trocar perfil
        </p>
        {otherProfiles.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSwitch(p.id)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bb-depth-4)]"
            style={{ color: 'var(--bb-ink-80)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--bb-ink-100)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--bb-ink-80)';
            }}
          >
            <Avatar name={p.display_name} size="sm" />
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-medium" style={{ color: 'inherit' }}>
                {p.display_name}
              </p>
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                {ROLE_LABELS[p.role as Role] ?? p.role}
              </p>
            </div>
          </button>
        ))}
      </div>
    );
  },
);

ProfileSwitcher.displayName = 'ProfileSwitcher';

export { ProfileSwitcher };
