'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTutorial } from './TutorialProvider';
import { ROLE_TUTORIAL_MAP } from '@/lib/tutorials/definitions';

export function TutorialFAB() {
  const { profile } = useAuth();
  const { isActive, showWelcome, showComplete, resetTutorial, progressLoaded } = useTutorial();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Don't show during tutorial or if no profile loaded
  if (isActive || showWelcome || showComplete) return null;
  if (!profile?.role || !progressLoaded) return null;

  const tutorialId = ROLE_TUTORIAL_MAP[profile.role];
  if (!tutorialId) return null;

  const handleRefazer = () => {
    setDrawerOpen(false);
    resetTutorial(tutorialId);
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setDrawerOpen((prev) => !prev)}
        className="fixed z-[50] flex items-center justify-center transition-all active:scale-95"
        style={{
          bottom: '80px',
          left: '16px',
          width: '40px',
          height: '40px',
          borderRadius: 'var(--bb-radius-full)',
          background: 'var(--bb-depth-3)',
          border: '1px solid var(--bb-glass-border)',
          boxShadow: 'var(--bb-shadow-md)',
          color: 'var(--bb-ink-60)',
          fontSize: '16px',
          fontWeight: 700,
        }}
        aria-label="Ajuda"
      >
        ?
      </button>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-[51]"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="fixed z-[52] overflow-hidden tutorial-tooltip-enter"
            style={{
              bottom: '126px',
              left: '16px',
              width: '220px',
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
              boxShadow: 'var(--bb-shadow-lg)',
            }}
          >
            <button
              onClick={handleRefazer}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors text-left"
              style={{ color: 'var(--bb-ink-80)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              🔄 Refazer tutorial
            </button>
            <div style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
              <button
                className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors text-left"
                style={{ color: 'var(--bb-ink-80)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                📺 Vídeo tutorial
              </button>
            </div>
            <div style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
              <button
                className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors text-left"
                style={{ color: 'var(--bb-ink-80)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                📚 Central de ajuda
              </button>
            </div>
            <div style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors text-left"
                style={{ color: 'var(--bb-ink-80)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                💬 Falar com suporte
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
