'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useTutorial } from '@/components/tutorial/TutorialProvider';
import { ROLE_TUTORIAL_MAP } from '@/lib/tutorials/definitions';

export function TutorialSettings() {
  const { profile } = useAuth();
  const { resetTutorial, isTutorialCompleted, progressLoaded } = useTutorial();

  if (!profile?.role || !progressLoaded) return null;

  const tutorialId = ROLE_TUTORIAL_MAP[profile.role];
  if (!tutorialId) return null;

  const completed = isTutorialCompleted(tutorialId);

  return (
    <section
      className="p-5"
      style={{
        background: 'var(--bb-depth-3)',
        border: '1px solid var(--bb-glass-border)',
        borderRadius: 'var(--bb-radius-lg)',
      }}
    >
      <h2
        className="font-mono uppercase"
        style={{ fontSize: '11px', letterSpacing: '0.08em', color: 'var(--bb-ink-40)' }}
      >
        Tutorial
      </h2>
      <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
        Refazer o tutorial de introdução do seu perfil.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => resetTutorial(tutorialId)}
          className="px-4 py-2 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
          style={{
            background: 'var(--bb-brand)',
            borderRadius: 'var(--bb-radius-md)',
          }}
        >
          Refazer tutorial
        </button>
        {completed && (
          <span className="text-xs" style={{ color: 'var(--bb-success)' }}>
            Completado
          </span>
        )}
      </div>
    </section>
  );
}
