'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPromotionCandidate, executePromotion } from '@/lib/api/promocao.service';
import type { PromotionCandidateDTO, PromotionAction } from '@/lib/api/promocao.service';
import type { BeltLevel } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';

// ────────────────────────────────────────────────────────────
// Belt color map
// ────────────────────────────────────────────────────────────
const BELT_HEX: Record<string, string> = {
  white: '#F5F5F5', gray: '#9E9E9E', yellow: '#FDD835', orange: '#FB8C00',
  green: '#43A047', blue: '#1E88E5', purple: '#8E24AA', brown: '#6D4C41', black: '#212121',
};

const BELT_LABEL: Record<string, string> = {
  white: 'Branca', gray: 'Cinza', yellow: 'Amarela', orange: 'Laranja',
  green: 'Verde', blue: 'Azul', purple: 'Roxa', brown: 'Marrom', black: 'Preta',
};

type Step = 'review' | 'ceremony' | 'success';

export default function PromoverPage() {
  const params = useParams<{ studentId: string }>();
  const router = useRouter();
  const studentId = params.studentId;

  const [candidate, setCandidate] = useState<PromotionCandidateDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('review');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actions, setActions] = useState<PromotionAction[]>([]);
  const [newBelt, setNewBelt] = useState<BeltLevel | null>(null);
  const [xpAwarded, setXpAwarded] = useState(0);

  // Animation states for ceremony
  const [showOldBelt, setShowOldBelt] = useState(true);
  const [showNewBelt, setShowNewBelt] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPromotionCandidate(studentId);
        setCandidate(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  const handlePromotion = useCallback(async () => {
    if (!candidate) return;
    setSubmitting(true);
    setStep('ceremony');

    // Trigger ceremony animation sequence
    setTimeout(() => setShowOldBelt(false), 1000);
    setTimeout(() => {
      setShowNewBelt(true);
      setShowGlow(true);
    }, 2000);
    setTimeout(() => setShowConfetti(true), 2500);

    try {
      const result = await executePromotion({
        student_id: candidate.student_id,
        academy_id: candidate.academy_id,
        from_belt: candidate.current_belt,
        to_belt: candidate.next_belt,
        teacher_message: message,
        promoted_by: 'prof-1', // current professor id
      });

      setActions(result.actions);
      setNewBelt(result.new_belt);
      setXpAwarded(result.xp_awarded);

      // Transition to success after ceremony animation plays
      setTimeout(() => {
        setStep('success');
        setSubmitting(false);
      }, 4000);
    } catch {
      setStep('review');
      setSubmitting(false);
    }
  }, [candidate, message]);

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton variant="text" className="h-8 w-64" />
        <Skeleton variant="card" className="h-48" />
        <Skeleton variant="card" className="h-32" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <p className="text-bb-gray-500">Aluno nao encontrado.</p>
      </div>
    );
  }

  // ── Step 1: Review ────────────────────────────────────────
  if (step === 'review') {
    return (
      <div className="mx-auto max-w-lg space-y-6 p-4">
        <h1 className="text-xl font-bold text-bb-gray-900">Promover Aluno</h1>

        {/* Student card */}
        <Card variant="elevated" className="flex items-center gap-4">
          <Avatar name={candidate.display_name} size="lg" />
          <div className="flex-1">
            <p className="text-lg font-semibold text-bb-gray-900">{candidate.display_name}</p>
            <p className="text-sm text-bb-gray-500">{candidate.total_classes} aulas &middot; {candidate.months_at_current_belt} meses na faixa atual</p>
          </div>
        </Card>

        {/* Belt transition */}
        <Card variant="outlined" className="flex items-center justify-center gap-6 py-8">
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-12 w-32 rounded-md shadow-sm"
              style={{ backgroundColor: BELT_HEX[candidate.current_belt] }}
            />
            <span className="text-xs font-medium text-bb-gray-500">
              {BELT_LABEL[candidate.current_belt]}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <svg className="h-8 w-8 text-bb-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div
              className="h-12 w-32 rounded-md shadow-lg ring-2 ring-yellow-400"
              style={{ backgroundColor: BELT_HEX[candidate.next_belt] }}
            />
            <span className="text-xs font-bold text-bb-gray-900">
              {BELT_LABEL[candidate.next_belt]}
            </span>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card variant="outlined" className="text-center">
            <p className="text-2xl font-bold text-bb-red-500">{candidate.attendance_streak}</p>
            <p className="text-xs text-bb-gray-500">Dias seguidos</p>
          </Card>
          <Card variant="outlined" className="text-center">
            <p className="text-2xl font-bold text-bb-red-500">{candidate.last_evaluation_score}</p>
            <p className="text-xs text-bb-gray-500">Nota avaliacao</p>
          </Card>
          <Card variant="outlined" className="text-center">
            <p className="text-2xl font-bold text-bb-red-500">{candidate.achievements_count}</p>
            <p className="text-xs text-bb-gray-500">Conquistas</p>
          </Card>
          <Card variant="outlined" className="text-center">
            <p className="text-2xl font-bold text-bb-red-500">{candidate.xp_total.toLocaleString()}</p>
            <p className="text-xs text-bb-gray-500">XP total</p>
          </Card>
        </div>

        {/* Teacher message */}
        <div>
          <label htmlFor="teacher-msg" className="mb-1 block text-sm font-medium text-bb-gray-700">
            Mensagem para o aluno
          </label>
          <textarea
            id="teacher-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Parabens pela dedicacao! Voce merece essa promocao..."
            className="w-full rounded-lg border border-bb-gray-300 bg-bb-white px-4 py-3 text-sm text-bb-gray-900 outline-none focus:border-bb-red-500 focus:ring-1 focus:ring-bb-red-500"
          />
        </div>

        {/* Automatic actions preview */}
        <Card variant="outlined">
          <p className="mb-2 text-sm font-semibold text-bb-gray-700">Acoes automaticas na promocao:</p>
          <ul className="space-y-1 text-sm text-bb-gray-500">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-bb-red-500" /> Notificacao para o aluno
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-bb-red-500" /> Post no feed da academia
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-bb-red-500" /> +100 XP bonus
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-bb-red-500" /> Nova conquista desbloqueada
            </li>
          </ul>
        </Card>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          loading={submitting}
          onClick={handlePromotion}
        >
          Promover para {BELT_LABEL[candidate.next_belt]}
        </Button>
      </div>
    );
  }

  // ── Step 2: Ceremony Animation ────────────────────────────
  if (step === 'ceremony') {
    return (
      <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-bb-gray-900 p-4">
        {/* CSS-based confetti */}
        {showConfetti && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${(i * 37) % 100}%`,
                  top: `${-10 - (i * 13) % 30}%`,
                  width: `${6 + (i % 4) * 2}px`,
                  height: `${6 + (i % 4) * 2}px`,
                  backgroundColor: ['#EF4444', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'][i % 6],
                  borderRadius: i % 2 === 0 ? '50%' : '0',
                  animation: `confettiFall ${2 + (i % 3)}s linear ${(i * 0.1)}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        {/* Golden glow behind belt */}
        {showGlow && (
          <div
            className="absolute h-64 w-64 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0) 70%)',
              animation: 'pulseGlow 2s ease-in-out infinite',
            }}
          />
        )}

        {/* Old belt dissolving */}
        <div
          className="transition-all duration-1000"
          style={{
            opacity: showOldBelt ? 1 : 0,
            transform: showOldBelt ? 'scale(1)' : 'scale(0.3)',
            filter: showOldBelt ? 'blur(0)' : 'blur(10px)',
            position: showNewBelt ? 'absolute' : 'relative',
          }}
        >
          <div
            className="h-16 w-48 rounded-md shadow-lg"
            style={{ backgroundColor: BELT_HEX[candidate.current_belt] }}
          />
          <p className="mt-2 text-center text-sm text-bb-gray-400">
            {BELT_LABEL[candidate.current_belt]}
          </p>
        </div>

        {/* New belt emerging */}
        {showNewBelt && (
          <div
            className="flex flex-col items-center"
            style={{
              animation: 'beltEmerge 1.5s ease-out forwards',
            }}
          >
            <div
              className="h-16 w-48 rounded-md shadow-2xl ring-4 ring-yellow-400"
              style={{
                backgroundColor: BELT_HEX[candidate.next_belt],
                boxShadow: `0 0 40px ${BELT_HEX[candidate.next_belt]}, 0 0 80px rgba(255,215,0,0.3)`,
              }}
            />
            <p className="mt-4 text-lg font-bold text-bb-white">
              {BELT_LABEL[candidate.next_belt]}
            </p>
            <p className="mt-2 text-sm text-yellow-400">
              {candidate.display_name}
            </p>
          </div>
        )}

        <p className="mt-8 text-center text-bb-gray-400">
          {!showNewBelt ? 'Preparando a cerimonia...' : 'Parabens!'}
        </p>

        {/* Inline keyframes */}
        <style>{`
          @keyframes confettiFall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
          }
          @keyframes pulseGlow {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.3); opacity: 1; }
          }
          @keyframes beltEmerge {
            0% { transform: scale(0.2) translateY(40px); opacity: 0; }
            50% { transform: scale(1.15) translateY(-10px); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ── Step 3: Success ───────────────────────────────────────
  return (
    <div className="mx-auto max-w-lg space-y-6 p-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-bb-gray-900">Promocao Realizada!</h1>
        <p className="mt-1 text-sm text-bb-gray-500">
          {candidate.display_name} agora e faixa {BELT_LABEL[newBelt ?? candidate.next_belt]}
        </p>
      </div>

      {/* New belt display */}
      <Card variant="elevated" className="flex flex-col items-center py-6">
        <div
          className="h-12 w-40 rounded-md shadow-lg"
          style={{
            backgroundColor: BELT_HEX[newBelt ?? candidate.next_belt],
            boxShadow: `0 0 20px ${BELT_HEX[newBelt ?? candidate.next_belt]}40`,
          }}
        />
        <p className="mt-3 text-lg font-bold text-bb-gray-900">
          Faixa {BELT_LABEL[newBelt ?? candidate.next_belt]}
        </p>
        <p className="mt-1 text-sm text-yellow-600 font-semibold">+{xpAwarded} XP</p>
      </Card>

      {/* Automatic actions completed */}
      <Card variant="outlined">
        <p className="mb-3 text-sm font-semibold text-bb-gray-700">Acoes automaticas concluidas:</p>
        <ul className="space-y-3">
          {actions.map((action, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-bb-gray-900">{action.label}</p>
                <p className="text-xs text-bb-gray-500">{action.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {message && (
        <Card variant="outlined">
          <p className="text-xs font-medium text-bb-gray-500 mb-1">Sua mensagem:</p>
          <p className="text-sm text-bb-gray-700 italic">&ldquo;{message}&rdquo;</p>
        </Card>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() => router.push('/professor/agenda')}
      >
        Voltar para Agenda
      </Button>
    </div>
  );
}
