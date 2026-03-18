'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useTutorial } from './TutorialProvider';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TutorialOverlay() {
  const {
    isActive,
    currentTutorial,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    skipTutorial,
  } = useTutorial();

  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('bottom');
  const [skipConfirm, setSkipConfirm] = useState(false);
  const [ready, setReady] = useState(false); // tooltip hidden until positioned
  const tooltipRef = useRef<HTMLDivElement>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollingRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  // Store tooltip position in ref to avoid re-renders during calculation
  const tooltipCoordsRef = useRef({ left: 0, top: 0, bottom: 0, width: 320, pos: 'bottom' as 'top' | 'bottom', centered: true });

  const step = currentTutorial?.steps[currentStep];

  const applyPosition = useCallback(() => {
    const c = tooltipCoordsRef.current;
    if (c.centered) return; // don't apply centered — that's the fallback
    setTooltipPosition(c.pos);
    setReady(true);
  }, []);

  const positionTooltip = useCallback((el: Element, stepData: NonNullable<typeof currentTutorial>['steps'][number]) => {
    const rect = el.getBoundingClientRect();
    const padding = stepData.spotlightPadding ?? 8;

    setSpotlight({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    const tooltipWidth = stepData.tooltipWidth ?? 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const pos = spaceBelow > 200 || spaceBelow > spaceAbove ? 'bottom' : 'top';

    const tooltipTop = pos === 'bottom'
      ? rect.bottom + padding + 12
      : rect.top - padding - 12;

    let tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
    tooltipLeft = Math.max(16, Math.min(tooltipLeft, window.innerWidth - tooltipWidth - 16));

    tooltipCoordsRef.current = {
      left: tooltipLeft,
      top: tooltipTop,
      bottom: window.innerHeight - tooltipTop,
      width: tooltipWidth,
      pos,
      centered: false,
    };

    applyPosition();
  }, [applyPosition]);

  const updatePosition = useCallback(() => {
    if (!step) {
      setSpotlight(null);
      return;
    }

    const el = document.querySelector(step.targetSelector);
    if (!el) {
      // Element not found — center tooltip, no spotlight
      setSpotlight(null);
      tooltipCoordsRef.current = { left: 0, top: 0, bottom: 0, width: step.tooltipWidth ?? 320, pos: 'bottom', centered: true };
      setTooltipPosition('bottom');
      setReady(true);

      if (retryRef.current) clearTimeout(retryRef.current);
      retryRef.current = setTimeout(() => {
        const retryEl = document.querySelector(step.targetSelector);
        if (retryEl) updatePosition();
      }, 500);
      return;
    }

    const rect = el.getBoundingClientRect();

    // Scroll element into view if needed — only once per step
    if (!scrollingRef.current && (rect.top < 0 || rect.bottom > window.innerHeight)) {
      scrollingRef.current = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        scrollingRef.current = false;
        positionTooltip(el, step);
      }, 500);
      return;
    }

    if (scrollingRef.current) return;

    positionTooltip(el, step);
  }, [step, positionTooltip]);

  useEffect(() => {
    if (!isActive || !step) return;

    // Hide tooltip + reset scroll lock while we calculate new position
    scrollingRef.current = false;
    setReady(false);
    setSkipConfirm(false);

    // Let DOM settle, then position
    const posTimer = setTimeout(updatePosition, 60);

    // Debounced scroll/resize handler
    const handleScroll = () => {
      if (scrollingRef.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!scrollingRef.current) updatePosition();
      });
    };

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      clearTimeout(posTimer);
      if (retryRef.current) clearTimeout(retryRef.current);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isActive, step, currentStep, updatePosition]);

  if (!isActive || !currentTutorial || !step) return null;

  const opacity = step.overlayOpacity ?? 0.6;

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (skipConfirm) {
      skipTutorial();
      setSkipConfirm(false);
    } else {
      setSkipConfirm(true);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    nextStep();
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    prevStep();
  };

  return (
    <>
      {/* Overlay backdrop with cutout — pointer-events: none so it doesn't block tooltip */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{ pointerEvents: 'none' }}
      >
        {spotlight && ready ? (
          <svg className="absolute inset-0 h-full w-full">
            <defs>
              <mask id="tutorial-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={spotlight.left}
                  y={spotlight.top}
                  width={spotlight.width}
                  height={spotlight.height}
                  rx="8"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill={`rgba(0, 0, 0, ${opacity})`}
              mask="url(#tutorial-mask)"
            />
          </svg>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `rgba(0, 0, 0, ${opacity})` }}
          />
        )}

        {/* Spotlight ring — hidden until positioned */}
        {spotlight && ready && (
          <div
            className="absolute rounded-lg tutorial-spotlight-pulse"
            style={{
              top: spotlight.top,
              left: spotlight.left,
              width: spotlight.width,
              height: spotlight.height,
              boxShadow: '0 0 0 3px var(--bb-brand), 0 0 20px rgba(239, 68, 68, 0.3)',
            }}
          />
        )}
      </div>

      {/* Click-catcher behind tooltip — dismisses skip confirm and blocks page interaction */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{ background: 'transparent' }}
        onClick={() => setSkipConfirm(false)}
      />

      {/* Tooltip — MUST have pointer-events: auto and position: fixed */}
      <div
        ref={tooltipRef}
        className={`fixed z-[9999] ${ready ? 'tutorial-tooltip-enter' : ''}`}
        style={{
          ...(tooltipCoordsRef.current.centered
            ? { position: 'fixed' as const, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: `${tooltipCoordsRef.current.width}px` }
            : {
                position: 'fixed' as const,
                left: `${tooltipCoordsRef.current.left}px`,
                top: tooltipCoordsRef.current.pos === 'bottom' ? `${tooltipCoordsRef.current.top}px` : undefined,
                bottom: tooltipCoordsRef.current.pos === 'top' ? `${tooltipCoordsRef.current.bottom}px` : undefined,
                width: `${tooltipCoordsRef.current.width}px`,
                transform: 'none',
              }),
          maxWidth: 'calc(100vw - 32px)',
          pointerEvents: 'auto',
          opacity: ready ? 1 : 0,
          visibility: ready ? 'visible' as const : 'hidden' as const,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="overflow-hidden"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
            boxShadow: 'var(--bb-shadow-xl)',
          }}
        >
          {/* Arrow */}
          {spotlight && (
            <div
              className="absolute"
              style={{
                [tooltipPosition === 'bottom' ? 'top' : 'bottom']: '-6px',
                left: '50%',
                transform: `translateX(-50%) ${tooltipPosition === 'top' ? 'rotate(180deg)' : ''}`,
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '6px solid var(--bb-depth-2)',
              }}
            />
          )}

          {/* Content */}
          <div className="p-4">
            <h3
              className="text-base font-bold leading-tight"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              {step.titulo}
            </h3>
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              {step.descricao}
            </p>

            {step.acao && (
              <p
                className="mt-2 text-xs font-medium"
                style={{ color: 'var(--bb-brand)' }}
              >
                {step.acao.label}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid var(--bb-glass-border)' }}
          >
            {/* Progress */}
            <div className="flex items-center gap-2">
              <div
                className="h-1.5 w-16 overflow-hidden rounded-full"
                style={{ background: 'var(--bb-depth-4)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / totalSteps) * 100}%`,
                    background: 'var(--bb-brand)',
                  }}
                />
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                {currentStep + 1}/{totalSteps}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {/* Skip */}
              <button
                onClick={handleSkip}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  color: skipConfirm ? 'var(--bb-brand)' : 'var(--bb-ink-40)',
                  borderRadius: 'var(--bb-radius-sm)',
                  minHeight: '36px',
                  minWidth: '44px',
                }}
              >
                {skipConfirm ? 'Confirmar?' : 'Pular'}
              </button>

              {/* Previous */}
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    color: 'var(--bb-ink-60)',
                    borderRadius: 'var(--bb-radius-sm)',
                    border: '1px solid var(--bb-glass-border)',
                    minHeight: '36px',
                    minWidth: '44px',
                  }}
                >
                  ←
                </button>
              )}

              {/* Next */}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-white transition-colors"
                style={{
                  background: 'var(--bb-brand)',
                  borderRadius: 'var(--bb-radius-sm)',
                  minHeight: '36px',
                  minWidth: '44px',
                }}
              >
                {currentStep === totalSteps - 1 ? 'Concluir' : 'Próximo →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
