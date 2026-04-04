'use client';

import { useEffect, useState } from 'react';
import { useTutorial } from '@/components/tutorial/TutorialProvider';
import { useAuth } from '@/lib/hooks/useAuth';

// ── Role-specific welcome data ──────────────────────────────────────

const WELCOME_DATA: Record<string, { emoji: string; title: string; subtitle: string; confettiColors: string[] }> = {
  admin: {
    emoji: '\uD83C\uDF89',
    title: 'Sua academia esta pronta!',
    subtitle: 'Vamos configurar tudo juntos para voce aproveitar ao maximo o BlackBelt.',
    confettiColors: ['#f59e0b', '#ef4444', '#22c55e', '#3b82f6'],
  },
  professor: {
    emoji: '\uD83E\uDD4B',
    title: 'Bem-vindo a sua sala de aula digital!',
    subtitle: 'Seus alunos estao esperando. Organize aulas, avaliacoes e acompanhe a evolucao de cada um.',
    confettiColors: ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'],
  },
  aluno_adulto: {
    emoji: '\uD83E\uDD4B',
    title: 'Sua jornada no tatame comeca agora!',
    subtitle: 'Check-in, aulas, graduacao, evolucao — tudo na palma da sua mao. Oss!',
    confettiColors: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'],
  },
  aluno_teen: {
    emoji: '\uD83D\uDE80',
    title: 'Bora treinar!',
    subtitle: 'Sua jornada epica comeca agora. Ganhe XP, suba de nivel e domine o tatame!',
    confettiColors: ['#8b5cf6', '#ec4899', '#f59e0b', '#22c55e'],
  },
  aluno_kids: {
    emoji: '\u2B50',
    title: 'Aventura no tatame!',
    subtitle: 'Vamos comecar a treinar e colecionar estrelas! Vai ser muito legal!',
    confettiColors: ['#f59e0b', '#ec4899', '#22c55e', '#3b82f6'],
  },
  responsavel: {
    emoji: '\uD83D\uDC68\u200D\uD83D\uDC67',
    title: 'Acompanhe a evolucao do seu filho!',
    subtitle: 'Presenca, graduacao, pagamentos — tudo em um so lugar para voce ficar tranquilo.',
    confettiColors: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'],
  },
  recepcao: {
    emoji: '\uD83D\uDCCB',
    title: 'Tudo pronto para a recepcao!',
    subtitle: 'Check-in, matrículas, agendamentos — gerencie o dia a dia da academia com facilidade.',
    confettiColors: ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444'],
  },
  franqueador: {
    emoji: '\uD83C\uDF10',
    title: 'Sua rede esta crescendo!',
    subtitle: 'Acompanhe todas as unidades, KPIs e performance da sua rede de academias.',
    confettiColors: ['#f59e0b', '#8b5cf6', '#22c55e', '#ef4444'],
  },
  gestor: {
    emoji: '\uD83D\uDCC8',
    title: 'Painel de gestao pronto!',
    subtitle: 'Visao completa da academia ao seu alcance. Vamos comecar!',
    confettiColors: ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444'],
  },
};

const DEFAULT_WELCOME = {
  emoji: '\uD83D\uDC4B',
  title: 'Bem-vindo ao BlackBelt!',
  subtitle: 'Sua plataforma de gestao esta pronta. Vamos comecar!',
  confettiColors: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'],
};

// ── Confetti pieces ─────────────────────────────────────────────────

function ConfettiPieces({ colors }: { colors: string[] }) {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    size: 6 + Math.random() * 6,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: p.left,
            top: '-10px',
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            borderRadius: 2,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

// ── Component ───────────────────────────────────────────────────────

export function WelcomeMessage() {
  const { showWelcomeMessage, dismissWelcomeMessage } = useTutorial();
  const { profile } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showWelcomeMessage) {
      // Small delay for enter animation
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [showWelcomeMessage]);

  if (!showWelcomeMessage) return null;

  const role = profile?.role ?? '';
  const data = WELCOME_DATA[role] ?? DEFAULT_WELCOME;
  const userName = profile?.display_name?.split(' ')[0] ?? '';

  function handleContinue() {
    setVisible(false);
    setTimeout(() => dismissWelcomeMessage(), 250);
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-opacity duration-300"
      style={{
        background: 'rgba(0, 0, 0, 0.75)',
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Confetti */}
      {visible && <ConfettiPieces colors={data.confettiColors} />}

      <div
        className="relative w-full max-w-sm overflow-hidden transition-all duration-300"
        style={{
          background: 'var(--bb-depth-2)',
          borderRadius: 'var(--bb-radius-xl, 16px)',
          boxShadow: 'var(--bb-shadow-xl)',
          border: '1px solid var(--bb-glass-border)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
          opacity: visible ? 1 : 0,
        }}
      >
        <div className="flex flex-col items-center px-6 py-8 text-center">
          {/* Emoji */}
          <span className="text-6xl">{data.emoji}</span>

          {/* Title */}
          <h2
            className="mt-4 text-xl font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            {userName ? `${userName}, ${data.title.charAt(0).toLowerCase()}${data.title.slice(1)}` : data.title}
          </h2>

          {/* Subtitle */}
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            {data.subtitle}
          </p>

          {/* Brand accent */}
          <div
            className="mx-auto mt-4"
            style={{ width: 40, height: 3, borderRadius: 2, background: 'var(--bb-brand)' }}
          />

          {/* CTA */}
          <button
            onClick={handleContinue}
            className="mt-6 w-full py-3 text-sm font-bold text-white transition-transform active:scale-[0.98]"
            style={{
              background: 'var(--bb-brand-gradient)',
              borderRadius: 'var(--bb-radius-md, 12px)',
              minHeight: '48px',
            }}
          >
            Vamos la!
          </button>
        </div>
      </div>

    </div>
  );
}
