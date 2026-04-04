'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTutorial } from './TutorialProvider';

export function TutorialWelcome() {
  const { showWelcome, currentTutorial, totalSteps, beginSteps, skipTutorial } = useTutorial();
  const { profile } = useAuth();
  const [skipConfirm, setSkipConfirm] = useState(false);

  if (!showWelcome || !currentTutorial) return null;

  const userName = profile?.display_name ?? '';

  const handleSkip = () => {
    if (skipConfirm) {
      skipTutorial();
      setSkipConfirm(false);
    } else {
      setSkipConfirm(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
    >
      <div
        className="w-full max-w-sm overflow-hidden tutorial-tooltip-enter"
        style={{
          background: 'var(--bb-depth-2)',
          borderRadius: 'var(--bb-radius-xl)',
          boxShadow: 'var(--bb-shadow-xl)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        <div className="flex flex-col items-center px-6 py-8 text-center">
          {/* Emoji */}
          <span className="text-5xl">{currentTutorial.emoji}</span>

          {/* Title */}
          <h2
            className="mt-4 text-xl font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            {userName ? `Bem-vindo, ${userName}!` : 'Bem-vindo ao BlackBelt!'}
          </h2>

          {/* Description */}
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            {currentTutorial.descricao}
          </p>

          {/* Progress preview */}
          <div className="mt-4 flex items-center gap-3 w-full">
            <div
              className="flex-1 h-2 overflow-hidden rounded-full"
              style={{ background: 'var(--bb-depth-4)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: '0%',
                  background: 'var(--bb-brand)',
                }}
              />
            </div>
            <span
              className="text-xs font-medium whitespace-nowrap"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              {totalSteps} passos · ~{currentTutorial.estimativaMinutos} min
            </span>
          </div>

          {/* CTA Button */}
          <button
            onClick={beginSteps}
            className="mt-6 w-full py-3 text-sm font-bold text-white transition-transform active:scale-[0.98]"
            style={{
              background: 'var(--bb-brand-gradient)',
              borderRadius: 'var(--bb-radius-md)',
              minHeight: '48px',
            }}
          >
            Começar tour →
          </button>

          {/* Skip */}
          <button
            onClick={handleSkip}
            className="mt-3 py-2 text-xs transition-colors"
            style={{ color: skipConfirm ? 'var(--bb-brand)' : 'var(--bb-ink-40)' }}
          >
            {skipConfirm
              ? 'Tem certeza? Pode acessar depois em Configurações.'
              : 'Pular tutorial'}
          </button>
        </div>
      </div>
    </div>
  );
}
