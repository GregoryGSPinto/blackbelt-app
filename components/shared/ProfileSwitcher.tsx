'use client';

import { forwardRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { GuardianAuthModal } from '@/components/auth/GuardianAuthModal';
import type { Profile, Role } from '@/lib/types';

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

/** Roles that are considered child profiles */
const CHILD_ROLES: string[] = ['aluno_teen', 'aluno_kids'];

/** Check if a switch from current role to target role requires guardian auth */
function requiresGuardianAuth(currentRole: string | undefined, targetRole: string): boolean {
  if (!currentRole) return false;
  return CHILD_ROLES.includes(currentRole) && targetRole === 'responsavel';
}

interface ProfileSwitcherProps {
  onSwitch?: () => void;
}

/**
 * Inline profile switcher for dropdown menus (Netflix-style).
 * Shows other available profiles for the current user.
 * Only renders if the user has more than one profile.
 *
 * When switching FROM a child role (teen/kids) TO a parent/guardian role,
 * a GuardianAuthModal is shown to authenticate the guardian first.
 */
const ProfileSwitcher = forwardRef<HTMLDivElement, ProfileSwitcherProps>(
  function ProfileSwitcher({ onSwitch }, ref) {
    const { profile, profiles, selectProfile } = useAuth();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [pendingProfile, setPendingProfile] = useState<Profile | null>(null);

    const otherProfiles = profiles.filter((p) => p.id !== profile?.id);

    if (otherProfiles.length === 0) return null;

    async function handleSwitch(target: Profile) {
      // Check if guardian auth is required
      if (requiresGuardianAuth(profile?.role, target.role)) {
        setPendingProfile(target);
        setAuthModalOpen(true);
        return;
      }

      // Direct switch
      onSwitch?.();
      await selectProfile(target.id);
    }

    async function handleAuthSuccess() {
      if (!pendingProfile) return;
      onSwitch?.();
      await selectProfile(pendingProfile.id);
      setPendingProfile(null);
    }

    function handleAuthClose() {
      setAuthModalOpen(false);
      setPendingProfile(null);
    }

    return (
      <>
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
              onClick={() => handleSwitch(p)}
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

        <GuardianAuthModal
          open={authModalOpen}
          onClose={handleAuthClose}
          onSuccess={handleAuthSuccess}
          guardianName={pendingProfile?.display_name}
        />
      </>
    );
  },
);

ProfileSwitcher.displayName = 'ProfileSwitcher';

export { ProfileSwitcher };
