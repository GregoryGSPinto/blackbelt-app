'use client';

import { useState, useEffect } from 'react';

interface TutorialStep {
  target: string;
  title: string;
  description: string;
}

interface SpotlightOverlayProps {
  steps: TutorialStep[];
  tutorialKey: string;
  onComplete?: () => void;
}

export function SpotlightOverlay({ steps, tutorialKey, onComplete }: SpotlightOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem(`bb-tutorial-${tutorialKey}`);
    if (!seen) setVisible(true);
  }, [tutorialKey]);

  useEffect(() => {
    if (!visible) return;
    const step = steps[currentStep];
    const el = document.querySelector(step.target);
    if (el) {
      const r = el.getBoundingClientRect();
      setRect(r);
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, visible, steps]);

  const finish = () => {
    setVisible(false);
    localStorage.setItem(`bb-tutorial-${tutorialKey}`, 'true');
    onComplete?.();
  };

  const next = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else finish();
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (!visible || !rect) return null;

  const step = steps[currentStep];
  const padding = 8;

  return (
    <div className="fixed inset-0 z-[9999]">
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={rect.left - padding}
              y={rect.top - padding}
              width={rect.width + padding * 2}
              height={rect.height + padding * 2}
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#spotlight-mask)" />
      </svg>

      <div
        className="absolute z-10 w-72 rounded-xl p-4 shadow-2xl"
        style={{
          top: rect.bottom + 16,
          left: Math.max(16, Math.min(rect.left, typeof window !== 'undefined' ? window.innerWidth - 304 : 304)),
          background: 'var(--bb-depth-1)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        <button onClick={finish} className="absolute right-1 top-1 min-w-[44px] min-h-[44px] flex items-center justify-center opacity-50 hover:opacity-100" aria-label="Fechar tutorial">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{step.title}</p>
        <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>{step.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            {currentStep + 1}/{steps.length}
          </span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button onClick={prev} aria-label="Passo anterior" className="rounded px-2 py-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <button
              onClick={next}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
              style={{ background: '#C62828' }}
            >
              {currentStep < steps.length - 1 ? 'Proximo' : 'Concluir'}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
