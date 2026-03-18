'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

const AUTO_REDIRECT_SECONDS = 5;
const CONFETTI_PARTICLE_COUNT = 50;

export default function SenhaAlteradaPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(AUTO_REDIRECT_SECONDS);

  // Countdown and auto-redirect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  // Generate confetti particles deterministically
  const confettiParticles = Array.from({ length: CONFETTI_PARTICLE_COUNT }, (_, i) => {
    const hue = (i * 47) % 360;
    const left = ((i * 31) % 100);
    const delay = ((i * 17) % 30) / 10;
    const duration = 2 + ((i * 13) % 20) / 10;
    const size = 4 + (i % 5) * 2;
    const rotation = (i * 73) % 360;

    return { id: i, hue, left, delay, duration, size, rotation };
  });

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes bb-confetti-fall {
              0% {
                transform: translateY(-20vh) rotate(0deg);
                opacity: 1;
              }
              70% {
                opacity: 1;
              }
              100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
              }
            }
            @keyframes bb-confetti-sway {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(15px); }
              75% { transform: translateX(-15px); }
            }
            @keyframes bb-success-pop {
              0% { transform: scale(0); opacity: 0; }
              50% { transform: scale(1.15); }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes bb-success-ring {
              0% { transform: scale(0.8); opacity: 0; }
              50% { transform: scale(1.1); opacity: 0.3; }
              100% { transform: scale(1.4); opacity: 0; }
            }
            .bb-confetti-particle {
              position: fixed;
              top: -10px;
              pointer-events: none;
              z-index: 60;
              animation: bb-confetti-fall linear forwards;
            }
            .bb-confetti-sway-wrapper {
              animation: bb-confetti-sway 1.5s ease-in-out infinite;
            }
            .bb-success-icon {
              animation: bb-success-pop 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
              opacity: 0;
            }
          `,
        }}
      />

      {/* Confetti particles */}
      {confettiParticles.map((p) => (
        <div
          key={p.id}
          className="bb-confetti-particle"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <div className="bb-confetti-sway-wrapper">
            <div
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: `hsl(${p.hue}, 80%, 60%)`,
                borderRadius: p.id % 3 === 0 ? '50%' : p.id % 3 === 1 ? '2px' : '0',
                transform: `rotate(${p.rotation}deg)`,
              }}
            />
          </div>
        </div>
      ))}

      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <div
          className="relative z-50 w-full max-w-md text-center"
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 24,
            padding: '48px 32px',
            boxShadow: 'var(--bb-shadow-xl)',
          }}
        >
          {/* Success icon with ring animation */}
          <div className="relative flex justify-center">
            <div
              className="absolute rounded-full"
              style={{
                width: 80,
                height: 80,
                backgroundColor: 'var(--bb-success)',
                animation: 'bb-success-ring 1.5s ease-out 0.5s infinite',
              }}
            />
            <div
              className="bb-success-icon relative flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--bb-success)' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          <h2
            className="mt-6 text-2xl font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Senha alterada com sucesso!
          </h2>

          <p
            className="mt-3 text-sm"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            Sua nova senha foi salva. Voce ja pode entrar no BlackBelt.
          </p>

          {/* Biometric tip */}
          <div
            className="mx-auto mt-6 max-w-xs rounded-xl p-4"
            style={{
              backgroundColor: 'var(--bb-depth-5)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <div className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 flex-shrink-0"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <p className="text-left text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                Dica: Ative o Face ID ou Touch ID no app para entrar mais rapido da proxima vez.
              </p>
            </div>
          </div>

          {/* CTA button */}
          <div className="mt-8">
            <Link href="/login">
              <Button
                size="lg"
                className="w-full text-[15px] font-bold text-white"
                style={{
                  background: 'var(--bb-brand-gradient)',
                  borderRadius: 'var(--bb-radius-md)',
                }}
              >
                ENTRAR AGORA
              </Button>
            </Link>
          </div>

          {/* Countdown */}
          <p
            className="mt-4 text-xs"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            Redirecionando em {countdown}s...
          </p>
        </div>
      </div>
    </>
  );
}
