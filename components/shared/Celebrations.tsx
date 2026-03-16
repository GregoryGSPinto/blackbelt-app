'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';

// ─── Confetti Particle ──────────────────────────────────────

interface ConfettiParticle {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
}

const CONFETTI_COLORS = ['#DC2626', '#EAB308', '#16A34A', '#2563EB', '#9333EA', '#EA580C'];

function generateParticles(count: number): ConfettiParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 0.8,
    size: 4 + Math.random() * 6,
  }));
}

// ─── CheckinConfetti ────────────────────────────────────────

interface CheckinConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

export function CheckinConfetti({ active, onComplete }: CheckinConfettiProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!active) return;
    setParticles(generateParticles(30));
    setShowToast(true);

    const timer = setTimeout(() => {
      setParticles([]);
      setShowToast(false);
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active && particles.length === 0) return null;

  return (
    <>
      {/* Confetti overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-confetti-fall"
            style={{
              left: `${p.x}%`,
              top: '-10px',
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up">
          <div className="rounded-lg bg-bb-success px-6 py-3 text-sm font-semibold text-bb-white shadow-lg">
            Check-in realizado com sucesso!
          </div>
        </div>
      )}
    </>
  );
}

// ─── AchievementModal ───────────────────────────────────────

interface AchievementModalProps {
  open: boolean;
  onClose: () => void;
  badge: string;
  title: string;
  description: string;
}

export function AchievementModal({ open, onClose, badge, title, description }: AchievementModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center py-6 text-center">
        {/* Badge with glow + bounce */}
        <div className="animate-achievement-bounce mb-6">
          <div className="relative inline-flex items-center justify-center">
            <span className="absolute inset-0 animate-achievement-glow rounded-full bg-bb-warning/30" />
            <span className="relative text-6xl">{badge}</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-bb-black">{title}</h2>
        <p className="mt-2 text-sm text-bb-gray-500">{description}</p>

        <button
          onClick={onClose}
          className="mt-6 rounded-lg bg-bb-red px-8 py-2 text-sm font-semibold text-bb-white transition-colors hover:bg-bb-red-dark"
        >
          Incrivel!
        </button>
      </div>
    </Modal>
  );
}

// ─── PromotionAnimation ─────────────────────────────────────

interface PromotionAnimationProps {
  active: boolean;
  fromBelt: string;
  toBelt: string;
  onComplete?: () => void;
}

const BELT_CSS_COLORS: Record<string, string> = {
  white: '#FAFAFA',
  gray: '#9CA3AF',
  yellow: '#EAB308',
  orange: '#EA580C',
  green: '#16A34A',
  blue: '#2563EB',
  purple: '#9333EA',
  brown: '#92400E',
  black: '#0A0A0A',
};

export function PromotionAnimation({ active, fromBelt, toBelt, onComplete }: PromotionAnimationProps) {
  const [phase, setPhase] = useState<'idle' | 'dissolve' | 'emerge' | 'glow'>('idle');

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      return;
    }

    setPhase('dissolve');
    const t1 = setTimeout(() => setPhase('emerge'), 1200);
    const t2 = setTimeout(() => setPhase('glow'), 2000);
    const t3 = setTimeout(() => {
      setPhase('idle');
      onComplete?.();
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active, onComplete]);

  if (phase === 'idle') return null;

  const fromColor = BELT_CSS_COLORS[fromBelt] ?? '#D4D4D4';
  const toColor = BELT_CSS_COLORS[toBelt] ?? '#D4D4D4';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bb-black/70" aria-hidden="true">
      <div className="relative flex flex-col items-center">
        {/* Belt representation */}
        <div
          className={`h-8 w-48 rounded-md transition-all duration-1000 ${
            phase === 'dissolve'
              ? 'scale-0 opacity-0'
              : phase === 'emerge'
                ? 'scale-110 opacity-100'
                : 'scale-100 opacity-100'
          }`}
          style={{
            backgroundColor: phase === 'dissolve' ? fromColor : toColor,
            boxShadow:
              phase === 'glow'
                ? `0 0 40px ${toColor}, 0 0 80px rgba(234, 179, 8, 0.5)`
                : 'none',
          }}
        />

        {/* Golden particles during glow */}
        {phase === 'glow' && (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 12 }, (_, i) => (
              <span
                key={i}
                className="absolute h-2 w-2 animate-promotion-sparkle rounded-full bg-yellow-400"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        <p className="mt-6 text-lg font-bold text-bb-white">
          {phase === 'dissolve' && 'Despedindo da faixa atual...'}
          {phase === 'emerge' && 'Nova faixa chegando!'}
          {phase === 'glow' && `Parabens! Faixa ${toBelt}!`}
        </p>
      </div>
    </div>
  );
}

// ─── StreakFire ──────────────────────────────────────────────

interface StreakFireProps {
  streak: number;
}

export function StreakFire({ streak }: StreakFireProps) {
  if (streak < 7) return null;

  const intensity = Math.min(streak / 30, 1);
  const particleCount = 6 + Math.floor(intensity * 10);

  return (
    <span className="relative inline-flex items-center" aria-label={`Streak de ${streak} dias`}>
      <span className="text-lg">{'\uD83D\uDD25'}</span>
      <span className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: particleCount }, (_, i) => (
          <span
            key={i}
            className="absolute animate-fire-particle rounded-full"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              backgroundColor: i % 3 === 0 ? '#EF4444' : i % 3 === 1 ? '#F59E0B' : '#F97316',
              left: `${30 + Math.random() * 40}%`,
              bottom: '20%',
              animationDelay: `${Math.random() * 1.5}s`,
              animationDuration: `${0.8 + Math.random() * 0.6}s`,
            }}
          />
        ))}
      </span>
    </span>
  );
}

// ─── StreakRecord ────────────────────────────────────────────

interface StreakRecordProps {
  active: boolean;
  onComplete?: () => void;
}

export function StreakRecord({ active, onComplete }: StreakRecordProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) return;
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" aria-hidden="true">
      <div className="animate-streak-record-enter text-center">
        <div className="relative inline-block">
          <span className="text-5xl">{'\uD83C\uDFC6'}</span>
          <span className="absolute -inset-4 animate-streak-record-ring rounded-full border-4 border-yellow-400 opacity-0" />
        </div>
        <p className="mt-4 animate-streak-record-text text-2xl font-extrabold text-bb-white drop-shadow-lg">
          NOVO RECORDE!
        </p>
      </div>
    </div>
  );
}
