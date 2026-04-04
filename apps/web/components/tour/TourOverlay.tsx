'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────

export interface TourStep {
  target: string; // CSS selector
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourOverlayProps {
  steps: TourStep[];
  onComplete: () => void;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────

const PADDING = 10;
const TOOLTIP_MAX_WIDTH = 340;
const TOOLTIP_MARGIN = 16;
const MOBILE_BREAKPOINT = 768;

function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

// ── Component ──────────────────────────────────────────────────────────

export function TourOverlay({ steps, onComplete }: TourOverlayProps) {
  // Filter steps to only include those whose target exists in the DOM
  const [validSteps, setValidSteps] = useState<TourStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [ready, setReady] = useState(false);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Filter valid steps on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const found = steps.filter((s) => document.querySelector(s.target));
      setValidSteps(found);
      if (found.length === 0) {
        onComplete();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [steps, onComplete]);

  const step = validSteps[currentIndex];
  const totalSteps = validSteps.length;

  // Position tooltip relative to spotlight
  const positionTooltip = useCallback(() => {
    if (!step) return;

    const el = document.querySelector(step.target);
    if (!el) {
      setSpotlight(null);
      setReady(true);
      return;
    }

    const rect = el.getBoundingClientRect();

    // Scroll element into view if needed
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(positionTooltip, 400);
      return;
    }

    const spotRect: SpotlightRect = {
      top: rect.top - PADDING,
      left: rect.left - PADDING,
      width: rect.width + PADDING * 2,
      height: rect.height + PADDING * 2,
    };
    setSpotlight(spotRect);

    // Determine tooltip position
    const mobile = isMobile();
    let pos = step.position ?? 'bottom';

    // On mobile, force top/bottom only
    if (mobile && (pos === 'left' || pos === 'right')) {
      const spaceBelow = window.innerHeight - rect.bottom;
      pos = spaceBelow > 220 ? 'bottom' : 'top';
    }

    // Check if there's enough space in the requested position
    const spaceBelow = window.innerHeight - rect.bottom - PADDING;
    const spaceAbove = rect.top - PADDING;
    const spaceRight = window.innerWidth - rect.right - PADDING;
    const spaceLeft = rect.left - PADDING;

    if (pos === 'bottom' && spaceBelow < 180) pos = 'top';
    if (pos === 'top' && spaceAbove < 180) pos = 'bottom';
    if (pos === 'right' && (spaceRight < 360 || mobile)) pos = spaceBelow > spaceAbove ? 'bottom' : 'top';
    if (pos === 'left' && (spaceLeft < 360 || mobile)) pos = spaceBelow > spaceAbove ? 'bottom' : 'top';

    const tooltipWidth = Math.min(TOOLTIP_MAX_WIDTH, window.innerWidth - TOOLTIP_MARGIN * 2);
    const style: React.CSSProperties = {
      width: `${tooltipWidth}px`,
      maxWidth: `calc(100vw - ${TOOLTIP_MARGIN * 2}px)`,
    };
    const arrow: React.CSSProperties = {};

    switch (pos) {
      case 'bottom': {
        style.top = `${rect.bottom + PADDING + 12}px`;
        style.left = `${clamp(
          rect.left + rect.width / 2 - tooltipWidth / 2,
          TOOLTIP_MARGIN,
          window.innerWidth - tooltipWidth - TOOLTIP_MARGIN,
        )}px`;
        arrow.top = '-6px';
        arrow.left = `${clamp(
          rect.left + rect.width / 2 - (parseFloat(String(style.left)) || 0),
          20,
          tooltipWidth - 20,
        )}px`;
        arrow.transform = '';
        break;
      }
      case 'top': {
        style.bottom = `${window.innerHeight - rect.top + PADDING + 12}px`;
        style.left = `${clamp(
          rect.left + rect.width / 2 - tooltipWidth / 2,
          TOOLTIP_MARGIN,
          window.innerWidth - tooltipWidth - TOOLTIP_MARGIN,
        )}px`;
        arrow.bottom = '-6px';
        arrow.left = `${clamp(
          rect.left + rect.width / 2 - (parseFloat(String(style.left)) || 0),
          20,
          tooltipWidth - 20,
        )}px`;
        arrow.transform = 'rotate(180deg)';
        break;
      }
      case 'right': {
        style.left = `${rect.right + PADDING + 12}px`;
        style.top = `${clamp(
          rect.top + rect.height / 2 - 60,
          TOOLTIP_MARGIN,
          window.innerHeight - 180,
        )}px`;
        arrow.left = '-6px';
        arrow.top = '24px';
        arrow.transform = 'rotate(-90deg)';
        break;
      }
      case 'left': {
        style.right = `${window.innerWidth - rect.left + PADDING + 12}px`;
        style.top = `${clamp(
          rect.top + rect.height / 2 - 60,
          TOOLTIP_MARGIN,
          window.innerHeight - 180,
        )}px`;
        arrow.right = '-6px';
        arrow.top = '24px';
        arrow.transform = 'rotate(90deg)';
        break;
      }
    }

    setTooltipStyle(style);
    setArrowStyle(arrow);
    setReady(true);
  }, [step]);

  // Reposition on step change
  useEffect(() => {
    if (!step || totalSteps === 0) return;

    setReady(false);
    setIsTransitioning(true);

    const timer = setTimeout(() => {
      positionTooltip();
      setIsTransitioning(false);
    }, 80);

    return () => clearTimeout(timer);
  }, [step, currentIndex, positionTooltip, totalSteps]);

  // Handle resize and scroll
  useEffect(() => {
    if (!step || totalSteps === 0) return;

    const handleResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(positionTooltip);
    };

    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(positionTooltip);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [step, positionTooltip, totalSteps]);

  // ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  if (totalSteps === 0 || !step) return null;

  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === totalSteps - 1;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFirstStep) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete();
  };

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      <div
        className="fixed inset-0 z-[9990]"
        style={{ pointerEvents: 'none' }}
        aria-hidden="true"
      >
        {spotlight && ready ? (
          <svg className="absolute inset-0 h-full w-full">
            <defs>
              <mask id="tour-spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={spotlight.left}
                  y={spotlight.top}
                  width={spotlight.width}
                  height={spotlight.height}
                  rx="8"
                  fill="black"
                  style={{
                    transition: 'all 0.3s ease-in-out',
                  }}
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.7)"
              mask="url(#tour-spotlight-mask)"
              style={{
                transition: 'opacity 0.3s ease-in-out',
              }}
            />
          </svg>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              transition: 'opacity 0.3s ease-in-out',
            }}
          />
        )}

        {/* Spotlight ring glow */}
        {spotlight && ready && (
          <div
            className="absolute"
            style={{
              top: spotlight.top,
              left: spotlight.left,
              width: spotlight.width,
              height: spotlight.height,
              borderRadius: '8px',
              boxShadow: '0 0 0 3px var(--bb-brand), 0 0 24px rgba(198, 40, 40, 0.35)',
              transition: 'all 0.3s ease-in-out',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Click blocker behind tooltip */}
      <div
        className="fixed inset-0 z-[9991]"
        style={{ background: 'transparent' }}
        onClick={handleSkip}
        aria-hidden="true"
      />

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className="fixed z-[9992]"
        style={{
          ...tooltipStyle,
          opacity: ready && !isTransitioning ? 1 : 0,
          transform: ready && !isTransitioning ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.96)',
          transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
          pointerEvents: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={step.title}
        aria-modal="true"
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
                ...arrowStyle,
                width: 0,
                height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderBottom: '7px solid var(--bb-depth-2)',
              }}
            />
          )}

          {/* Content */}
          <div className="p-5">
            <h3
              className="text-base font-bold leading-tight"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              {step.title}
            </h3>
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              {step.description}
            </p>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: '1px solid var(--bb-glass-border)' }}
          >
            {/* Step counter + progress bar */}
            <div className="flex items-center gap-2">
              <div
                className="h-1.5 w-14 overflow-hidden rounded-full"
                style={{ background: 'var(--bb-depth-4)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${((currentIndex + 1) / totalSteps) * 100}%`,
                    background: 'var(--bb-brand)',
                    transition: 'width 0.3s ease-out',
                  }}
                />
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                Passo {currentIndex + 1} de {totalSteps}
              </span>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              {/* Skip */}
              <button
                onClick={handleSkip}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  color: 'var(--bb-ink-40)',
                  borderRadius: 'var(--bb-radius-sm)',
                  minHeight: '36px',
                  minWidth: '44px',
                }}
              >
                Pular tour
              </button>

              {/* Previous */}
              {!isFirstStep && (
                <button
                  onClick={handlePrev}
                  className="flex items-center justify-center px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    color: 'var(--bb-ink-60)',
                    borderRadius: 'var(--bb-radius-sm)',
                    border: '1px solid var(--bb-glass-border)',
                    minHeight: '36px',
                    minWidth: '44px',
                  }}
                  aria-label="Anterior"
                >
                  Anterior
                </button>
              )}

              {/* Next / Complete */}
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
                {isLastStep ? 'Concluir' : 'Proximo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
