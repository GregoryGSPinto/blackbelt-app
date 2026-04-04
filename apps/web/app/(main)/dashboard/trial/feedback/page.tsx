'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ThumbsUp, ThumbsDown, ArrowLeft, Send } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { getMyTrialInfo, submitTrialFeedback } from '@/lib/api/trial.service';

// ── Skeleton ───────────────────────────────────────────────────────────

function FeedbackSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton variant="text" className="h-8 w-1/2" />
      <Skeleton variant="card" className="h-40" />
      <Skeleton variant="card" className="h-32" />
      <Skeleton variant="card" className="h-20" />
      <Skeleton variant="text" className="h-12 w-full" />
    </div>
  );
}

// ── Star Rating Component ──────────────────────────────────────────────

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110 active:scale-95"
            aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                'h-10 w-10 transition-colors sm:h-12 sm:w-12',
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-[var(--bb-ink-20)]',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

// ── Rating Labels ──────────────────────────────────────────────────────

const RATING_LABELS: Record<number, string> = {
  1: 'Nao gostei',
  2: 'Poderia melhorar',
  3: 'Foi ok',
  4: 'Gostei muito!',
  5: 'Experiencia incrivel!',
};

// ── Main Page ──────────────────────────────────────────────────────────

export default function TrialFeedbackPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trialId, setTrialId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');

  // Form state
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const academyId = getActiveAcademyId();
        const trialInfo = await getMyTrialInfo(academyId);
        if (!trialInfo) {
          setLoading(false);
          return;
        }

        setTrialId(trialInfo.id);
        setStudentName(trialInfo.name.split(' ')[0]);

        // Pre-fill if feedback already given
        if (trialInfo.rating) {
          setRating(trialInfo.rating);
          setFeedback(trialInfo.feedback ?? '');
          setWouldRecommend(trialInfo.would_recommend ?? null);
          setSubmitted(true);
        }
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (!trialId) return;

    if (rating === 0) {
      toast('Por favor, selecione uma avaliacao de 1 a 5 estrelas.', 'error');
      return;
    }

    if (wouldRecommend === null) {
      toast('Por favor, diga se recomendaria a academia.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await submitTrialFeedback(trialId, rating, feedback, wouldRecommend);
      setSubmitted(true);
      toast('Obrigado pelo seu feedback!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──

  if (loading) return <FeedbackSkeleton />;

  if (!trialId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <span className="text-4xl">{'\uD83E\uDD4B'}</span>
        <p className="mt-4 text-lg font-semibold text-[var(--bb-ink-100)]">
          Nenhum periodo experimental encontrado
        </p>
        <Button
          variant="secondary"
          size="md"
          className="mt-4"
          onClick={() => router.push('/dashboard/trial')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          }}
        >
          <span className="text-4xl">{'\u2B50'}</span>
        </div>

        <h1 className="mt-6 text-xl font-bold text-[var(--bb-ink-100)]">
          Obrigado, {studentName}!
        </h1>
        <p className="mt-2 text-sm text-[var(--bb-ink-60)]">
          Seu feedback e muito importante para nos. Voce desbloqueou a conquista
          &quot;5 Estrelas&quot;!
        </p>

        {rating > 0 && (
          <div className="mt-4 flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={cn(
                  'h-6 w-6',
                  s <= rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-transparent text-[var(--bb-ink-20)]',
                )}
              />
            ))}
          </div>
        )}

        <Button
          variant="primary"
          size="md"
          className="mt-6"
          onClick={() => router.push('/dashboard/trial')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pb-24">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/dashboard/trial')}
          className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--bb-ink-40)] transition-colors hover:text-[var(--bb-ink-80)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <h1 className="text-xl font-bold text-[var(--bb-ink-100)]">
          Como esta sendo sua experiencia?
        </h1>
        <p className="mt-1 text-sm text-[var(--bb-ink-60)]">
          {studentName}, sua opiniao nos ajuda a melhorar! Leva menos de 1 minuto.
        </p>
      </div>

      {/* Star Rating */}
      <Card className="p-6">
        <p className="mb-4 text-center text-sm font-semibold text-[var(--bb-ink-80)]">
          De 1 a 5, como voce avalia a academia?
        </p>
        <StarRating value={rating} onChange={setRating} />
        {rating > 0 && (
          <p className="mt-3 text-center text-sm font-medium text-amber-500">
            {RATING_LABELS[rating]}
          </p>
        )}
      </Card>

      {/* Feedback Text */}
      <Card className="p-5">
        <label
          htmlFor="feedback-text"
          className="mb-2 block text-sm font-semibold text-[var(--bb-ink-80)]"
        >
          Conte mais sobre sua experiencia (opcional)
        </label>
        <textarea
          id="feedback-text"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="O que voce mais gostou? O que podemos melhorar?"
          rows={4}
          className="w-full resize-none rounded-[var(--bb-radius-md)] border border-[var(--bb-glass-border)] bg-[var(--bb-depth-4)] p-3 text-sm text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-20)] focus:border-[var(--bb-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--bb-brand)]"
          maxLength={500}
        />
        <p className="mt-1 text-right text-[10px] text-[var(--bb-ink-20)]">
          {feedback.length}/500
        </p>
      </Card>

      {/* Would Recommend */}
      <Card className="p-5">
        <p className="mb-3 text-center text-sm font-semibold text-[var(--bb-ink-80)]">
          Voce recomendaria a academia para um amigo?
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setWouldRecommend(true)}
            className={cn(
              'flex items-center gap-2 rounded-[var(--bb-radius-md)] border px-6 py-3 text-sm font-medium transition-all',
              wouldRecommend === true
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                : 'border-[var(--bb-glass-border)] bg-[var(--bb-depth-4)] text-[var(--bb-ink-60)] hover:border-emerald-500/40',
            )}
          >
            <ThumbsUp className="h-5 w-5" />
            Sim!
          </button>
          <button
            type="button"
            onClick={() => setWouldRecommend(false)}
            className={cn(
              'flex items-center gap-2 rounded-[var(--bb-radius-md)] border px-6 py-3 text-sm font-medium transition-all',
              wouldRecommend === false
                ? 'border-red-400 bg-red-400/10 text-red-500'
                : 'border-[var(--bb-glass-border)] bg-[var(--bb-depth-4)] text-[var(--bb-ink-60)] hover:border-red-400/40',
            )}
          >
            <ThumbsDown className="h-5 w-5" />
            Nao
          </button>
        </div>
      </Card>

      {/* Submit */}
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        loading={submitting}
        disabled={rating === 0 || wouldRecommend === null}
      >
        <Send className="mr-2 h-4 w-4" />
        Enviar Avaliacao
      </Button>
    </div>
  );
}
