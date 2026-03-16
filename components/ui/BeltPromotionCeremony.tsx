'use client';

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import type { BeltColor } from './BeltStripe';

const BELT_CSS_VAR: Record<BeltColor, string> = {
  white: 'var(--bb-belt-white)',
  gray: 'var(--bb-belt-gray)',
  yellow: 'var(--bb-belt-yellow)',
  orange: 'var(--bb-belt-orange)',
  green: 'var(--bb-belt-green)',
  blue: 'var(--bb-belt-blue)',
  purple: 'var(--bb-belt-purple)',
  brown: 'var(--bb-belt-brown)',
  black: 'var(--bb-belt-black)',
};

const BELT_NAMES: Record<BeltColor, string> = {
  white: 'Branca',
  gray: 'Cinza',
  yellow: 'Amarela',
  orange: 'Laranja',
  green: 'Verde',
  blue: 'Azul',
  purple: 'Roxa',
  brown: 'Marrom',
  black: 'Preta',
};

export interface BeltPromotionCeremonyProps {
  open: boolean;
  onClose: () => void;
  studentName: string;
  oldBelt: BeltColor;
  newBelt: BeltColor;
  stats?: { classes: number; months: number; score?: number };
  evaluator?: string;
}

function generateConfettiParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 4 + Math.random() * 4,
    delay: Math.random() * 1.2,
    duration: 2 + Math.random() * 1.5,
    rotation: Math.random() * 360,
    rotationEnd: Math.random() * 720 - 360,
    drift: (Math.random() - 0.5) * 80,
    isGold: i % 3 === 0,
  }));
}

const KEYFRAMES = `
@keyframes bpc-overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes bpc-overlay-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes bpc-old-belt-in {
  from {
    transform: scale(0.8);
    filter: blur(4px);
    opacity: 0;
  }
  to {
    transform: scale(1);
    filter: blur(0);
    opacity: 1;
  }
}

@keyframes bpc-old-belt-dissolve {
  from {
    filter: blur(0);
    opacity: 1;
    transform: translateY(0);
  }
  to {
    filter: blur(8px);
    opacity: 0;
    transform: translateY(-20px);
  }
}

@keyframes bpc-particle-scatter {
  from {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(var(--bpc-dx), var(--bpc-dy)) scale(0.3);
  }
}

@keyframes bpc-new-belt-in {
  from {
    transform: translateY(40px) scale(0.9);
    filter: blur(4px);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    filter: blur(0);
    opacity: 1;
  }
}

@keyframes bpc-belt-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes bpc-name-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bpc-text-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bpc-confetti-fall {
  from {
    transform: translateY(-20px) translateX(0) rotate(var(--bpc-rot-start));
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  to {
    transform: translateY(100vh) translateX(var(--bpc-drift)) rotate(var(--bpc-rot-end));
    opacity: 0;
  }
}

@keyframes bpc-buttons-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bpc-glow-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}
`;

export const BeltPromotionCeremony = forwardRef<HTMLDivElement, BeltPromotionCeremonyProps>(
  ({ open, onClose, studentName, oldBelt, newBelt, stats, evaluator }, ref) => {
    const [mounted, setMounted] = useState(false);
    const [closing, setClosing] = useState(false);
    const confettiRef = useRef(generateConfettiParticles(35));

    const handleClose = useCallback(() => {
      setClosing(true);
      setTimeout(() => {
        setClosing(false);
        setMounted(false);
        onClose();
      }, 200);
    }, [onClose]);

    useEffect(() => {
      if (open) {
        setMounted(true);
        setClosing(false);
        confettiRef.current = generateConfettiParticles(35);
      }
    }, [open]);

    useEffect(() => {
      if (!mounted) return;

      function onKeyDown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
          handleClose();
        }
      }

      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }, [mounted, handleClose]);

    if (!mounted) return null;

    const oldColor = BELT_CSS_VAR[oldBelt];
    const newColor = BELT_CSS_VAR[newBelt];
    const confetti = confettiRef.current;

    const scatterParticles = Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2;
      const distance = 40 + Math.random() * 60;
      return {
        id: i,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        size: 3 + Math.random() * 3,
      };
    });

    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
        <div
          ref={ref}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            background: 'rgba(0, 0, 0, 0.9)',
            animation: closing
              ? 'bpc-overlay-out 0.2s ease-out forwards'
              : 'bpc-overlay-in 0.3s ease-out forwards',
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Promoção de faixa: ${studentName}`}
        >
          {/* Old belt */}
          <div
            className="absolute"
            style={{
              animation: 'bpc-old-belt-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both, bpc-old-belt-dissolve 0.5s ease-in 1.5s forwards',
            }}
          >
            <div className="relative" style={{ width: 200, height: 16 }}>
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${oldColor} 10%, ${oldColor} 90%, transparent 100%)`,
                  boxShadow: `0 2px 12px ${oldColor}33`,
                }}
              />
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: 20,
                  height: 20,
                  background: `radial-gradient(circle, ${oldColor} 40%, transparent 70%)`,
                  border: `2px solid ${oldColor}`,
                  boxShadow: `0 0 8px ${oldColor}55`,
                }}
              />
            </div>

            {/* Scatter particles from old belt */}
            {scatterParticles.map((p) => (
              <div
                key={p.id}
                className="absolute left-1/2 top-1/2"
                style={{
                  width: p.size,
                  height: p.size,
                  background: oldColor,
                  borderRadius: 1,
                  '--bpc-dx': `${p.dx}px`,
                  '--bpc-dy': `${p.dy}px`,
                  animation: 'bpc-particle-scatter 0.6s ease-out 1.5s both',
                } as React.CSSProperties}
              />
            ))}
          </div>

          {/* New belt */}
          <div
            className="absolute"
            style={{
              animation: 'bpc-new-belt-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 2.0s both',
            }}
          >
            <div
              style={{
                animation: 'bpc-belt-pulse 0.3s ease-in-out 2.5s both',
              }}
            >
              <div className="relative" style={{ width: 200, height: 16 }}>
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${newColor} 10%, ${newColor} 45%, ${newColor}dd 55%, ${newColor} 90%, transparent 100%)`,
                    boxShadow: `0 0 60px ${newColor}66, 0 2px 12px ${newColor}33`,
                  }}
                />
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: 22,
                    height: 22,
                    background: `radial-gradient(circle, ${newColor} 40%, transparent 70%)`,
                    border: `2px solid ${newColor}`,
                    boxShadow: `0 0 16px ${newColor}88`,
                  }}
                />
              </div>
            </div>

            {/* Glow aura */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 240,
                height: 60,
                background: `radial-gradient(ellipse, ${newColor}22 0%, transparent 70%)`,
                animation: 'bpc-glow-pulse 2s ease-in-out 2.0s infinite',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Student name */}
          <div
            className="absolute flex flex-col items-center gap-3"
            style={{ top: 'calc(50% + 40px)' }}
          >
            <p
              className="text-2xl font-bold"
              style={{
                color: 'var(--bb-ink-100, #F4F4F7)',
                animation: 'bpc-name-in 0.4s ease-out 2.5s both',
              }}
            >
              {studentName}
            </p>

            {/* Belt name */}
            <p
              className="text-lg font-semibold"
              style={{
                color: newColor,
                animation: 'bpc-text-in 0.4s ease-out 3.0s both',
              }}
            >
              Faixa {BELT_NAMES[newBelt]}
            </p>

            {/* Stats */}
            {stats && (
              <p
                className="text-sm"
                style={{
                  color: 'var(--bb-ink-60, #7C8194)',
                  animation: 'bpc-text-in 0.4s ease-out 3.15s both',
                }}
              >
                {stats.classes} aulas &middot; {stats.months} {stats.months === 1 ? 'mês' : 'meses'} de dedicação
                {stats.score != null && ` · Nota ${stats.score}`}
              </p>
            )}

            {/* Evaluator */}
            {evaluator && (
              <p
                className="text-sm"
                style={{
                  color: 'var(--bb-ink-60, #7C8194)',
                  animation: 'bpc-text-in 0.4s ease-out 3.3s both',
                }}
              >
                Avaliado por {evaluator}
              </p>
            )}

            {/* Buttons */}
            <div
              className="mt-6 flex items-center gap-3"
              style={{
                animation: 'bpc-buttons-in 0.4s ease-out 5.0s both',
              }}
            >
              <button
                type="button"
                className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
                style={{
                  background: newColor,
                  color: newBelt === 'white' || newBelt === 'yellow' ? 'var(--bb-depth-1, #06070A)' : '#fff',
                  boxShadow: `0 0 20px ${newColor}44`,
                }}
                onClick={handleClose}
              >
                Compartilhar
              </button>
              <button
                type="button"
                className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
                style={{
                  background: 'var(--bb-depth-4, #1A1D28)',
                  color: 'var(--bb-ink-80, #B8BCC8)',
                  border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.06))',
                }}
                onClick={handleClose}
              >
                Fechar
              </button>
            </div>
          </div>

          {/* Confetti */}
          {confetti.map((p) => (
            <div
              key={p.id}
              className="pointer-events-none absolute top-0"
              style={{
                left: `${p.left}%`,
                width: p.size,
                height: p.size,
                borderRadius: p.size > 6 ? 1 : '50%',
                background: p.isGold ? '#FFD700' : newColor,
                opacity: 0,
                '--bpc-rot-start': `${p.rotation}deg`,
                '--bpc-rot-end': `${p.rotationEnd}deg`,
                '--bpc-drift': `${p.drift}px`,
                animation: `bpc-confetti-fall ${p.duration}s cubic-bezier(0.25, 0, 0.5, 1) ${4.0 + p.delay}s both`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </>
    );
  },
);

BeltPromotionCeremony.displayName = 'BeltPromotionCeremony';
