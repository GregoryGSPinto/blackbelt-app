'use client';

import { forwardRef, useState, useEffect, useCallback } from 'react';
import { submitNps, shouldShowNpsSurvey } from '@/lib/api/beta-nps.service';

const isBetaMode = process.env.NEXT_PUBLIC_BETA_MODE === 'true';

const FEATURES = [
  'Check-in',
  'Agenda',
  'Financeiro',
  'Mensagens',
  'Gamificacao',
  'Dashboard',
  'Outro',
];

function getScoreColor(score: number): string {
  if (score <= 6) return 'var(--bb-error)';
  if (score <= 8) return 'var(--bb-warning)';
  return 'var(--bb-success)';
}

const NpsSurveyModal = forwardRef<HTMLDivElement>(function NpsSurveyModal(_, ref) {
  const [show, setShow] = useState(false);
  const [trigger, setTrigger] = useState('');
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [improve, setImprove] = useState('');
  const [favorite, setFavorite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const checkNps = useCallback(async () => {
    if (!isBetaMode) return;

    const dismissedAt = localStorage.getItem('nps_dismissed_at');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 3) return;
    }

    const result = await shouldShowNpsSurvey();
    if (result.show) {
      setTrigger(result.trigger);
      setShow(true);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkNps, 5000);
    return () => clearTimeout(timer);
  }, [checkNps]);

  if (!show) return null;

  function handleDismiss() {
    localStorage.setItem('nps_dismissed_at', Date.now().toString());
    setShow(false);
  }

  async function handleSubmit() {
    if (selectedScore === null) return;
    setSubmitting(true);
    await submitNps({
      score: selectedScore,
      reason: reason || undefined,
      what_would_improve: improve || undefined,
      favorite_feature: favorite || undefined,
      survey_trigger: trigger as 'scheduled' | 'manual' | '7_day' | '30_day' | 'post_onboarding',
    });
    setSubmitting(false);
    setSuccess(true);
    localStorage.removeItem('nps_dismissed_at');
    setTimeout(() => setShow(false), 2000);
  }

  function handleSkip() {
    handleSubmit();
  }

  return (
    <div ref={ref} className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleDismiss} />
      <div
        className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid var(--bb-glass-border)',
          boxShadow: 'var(--bb-shadow-lg)',
        }}
      >
        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ color: 'var(--bb-ink-40)' }}
          aria-label="Fechar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {success ? (
          <div className="py-8 text-center">
            <p className="text-4xl mb-3">{'\uD83C\uDFAF'}</p>
            <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
              Obrigado pelo feedback!
            </p>
          </div>
        ) : (
          <>
            <h2 className="mb-1 text-lg font-bold pr-8" style={{ color: 'var(--bb-ink-100)' }}>
              De 0 a 10, o quanto voce recomendaria o BlackBelt para um colega?
            </h2>
            <p className="mb-4 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              Sua resposta nos ajuda a melhorar a plataforma.
            </p>

            {/* Score buttons */}
            <div className="mb-4 grid grid-cols-11 gap-1">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedScore(i)}
                  className="flex h-10 items-center justify-center rounded-lg text-sm font-bold transition-all"
                  style={{
                    background: selectedScore === i ? getScoreColor(i) : 'var(--bb-depth-3)',
                    color: selectedScore === i ? 'var(--bb-depth-1)' : 'var(--bb-ink-60)',
                    border: selectedScore === i ? 'none' : '1px solid var(--bb-glass-border)',
                    transform: selectedScore === i ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="mb-4 flex justify-between text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
              <span>Nada provavel</span>
              <span>Muito provavel</span>
            </div>

            {/* Expanded questions */}
            {selectedScore !== null && (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    Por que essa nota? (opcional)
                  </label>
                  <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                    style={{
                      background: 'var(--bb-depth-3)',
                      border: '1px solid var(--bb-glass-border)',
                      color: 'var(--bb-ink-100)',
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    O que melhoraria sua experiencia? (opcional)
                  </label>
                  <textarea
                    value={improve}
                    onChange={e => setImprove(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                    style={{
                      background: 'var(--bb-depth-3)',
                      border: '1px solid var(--bb-glass-border)',
                      color: 'var(--bb-ink-100)',
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    Qual funcionalidade voce mais usa?
                  </label>
                  <select
                    value={favorite}
                    onChange={e => setFavorite(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      background: 'var(--bb-depth-3)',
                      border: '1px solid var(--bb-glass-border)',
                      color: 'var(--bb-ink-100)',
                    }}
                  >
                    <option value="">Selecione...</option>
                    {FEATURES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSkip}
                    className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}
                  >
                    Pular
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
                    style={{ background: 'var(--bb-brand-deep)', color: 'var(--bb-depth-1)' }}
                  >
                    {submitting ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

NpsSurveyModal.displayName = 'NpsSurveyModal';

export { NpsSurveyModal };
