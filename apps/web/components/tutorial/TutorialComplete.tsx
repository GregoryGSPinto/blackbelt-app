'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTutorial } from './TutorialProvider';

// CSS-only confetti pieces
function Confetti() {
  const colors = ['#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#8B5CF6', '#F97316'];
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 1.5,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 6,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-[10000] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            background: p.color,
            borderRadius: '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export function TutorialComplete() {
  const { showComplete, currentTutorial, dismissComplete } = useTutorial();
  const { profile } = useAuth();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (showComplete) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showComplete]);

  if (!showComplete || !currentTutorial) return null;

  const userName = profile?.display_name ?? '';

  return (
    <>
      {showConfetti && <Confetti />}

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
            {/* Celebration */}
            <span className="text-5xl">🎉</span>

            <h2
              className="mt-4 text-xl font-bold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              {userName ? `Parabéns, ${userName}!` : 'Parabéns!'}
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Você completou o tour!
            </p>

            {/* Completion checklist */}
            <div className="mt-4 w-full space-y-2 text-left">
              {currentTutorial.completionItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs"
                    style={{ background: 'var(--bb-success-surface)', color: 'var(--bb-success)' }}
                  >
                    ✓
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--bb-ink-80)' }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={dismissComplete}
              className="mt-6 w-full py-3 text-sm font-bold text-white transition-transform active:scale-[0.98]"
              style={{
                background: 'var(--bb-brand-gradient)',
                borderRadius: 'var(--bb-radius-md)',
                minHeight: '48px',
              }}
            >
              Explorar meu painel →
            </button>

            {/* Hint */}
            <p
              className="mt-3 text-xs"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              💡 Pode refazer o tutorial em Configurações
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
