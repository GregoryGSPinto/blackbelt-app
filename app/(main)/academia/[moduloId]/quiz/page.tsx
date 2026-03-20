'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getQuiz,
  submeterQuiz,
  emitirCertificado,
  type QuizModulo,
  type QuizPergunta,
  type ResultadoQuiz,
  type CertificadoTeorico,
} from '@/lib/api/academia-teorica.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PlanGate } from '@/components/plans/PlanGate';

/* ── Skeleton ────────────────────────────────────────────────────── */

function PageSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Skeleton variant="text" className="h-4 w-20" />
      <Skeleton variant="text" className="h-6 w-48" />
      <Skeleton variant="text" className="h-3 w-full rounded-full" />
      <Skeleton variant="card" className="h-32" />
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} variant="card" className="h-14" />
      ))}
    </div>
  );
}

/* ── Option letters ──────────────────────────────────────────────── */

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/* ── Quiz page ───────────────────────────────────────────────────── */

export default function QuizPage() {
  const params = useParams();
  const moduloId = params.moduloId as string;

  const [quiz, setQuiz] = useState<QuizModulo | null>(null);
  const [loading, setLoading] = useState(true);

  // Quiz flow state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Results state
  const [resultado, setResultado] = useState<ResultadoQuiz | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Certificate state
  const [certificado, setCertificado] = useState<CertificadoTeorico | null>(null);
  const [emittingCert, setEmittingCert] = useState(false);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getQuiz(moduloId);
      setQuiz(data);
    } finally {
      setLoading(false);
    }
  }, [moduloId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  /* ── Handlers ──────────────────────────────────────────────────── */

  const currentQuestion: QuizPergunta | undefined = quiz?.perguntas[currentIndex];
  const isLastQuestion = quiz ? currentIndex === quiz.perguntas.length - 1 : false;
  const correctOption = currentQuestion?.opcoes?.find((o) => o.correta);

  const handleConfirm = () => {
    if (!selectedOption || !currentQuestion) return;
    setConfirmed(true);
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: selectedOption }));
  };

  const handleNext = async () => {
    if (isLastQuestion && quiz) {
      setSubmitting(true);
      try {
        const finalAnswers = {
          ...answers,
          ...(currentQuestion ? { [currentQuestion.id]: selectedOption ?? '' } : {}),
        };
        const result = await submeterQuiz(moduloId, finalAnswers);
        setResultado(result);
      } finally {
        setSubmitting(false);
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setConfirmed(false);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setConfirmed(false);
    setAnswers({});
    setResultado(null);
    setShowReview(false);
    setCertificado(null);
  };

  const handleEmitCertificado = async () => {
    setEmittingCert(true);
    try {
      const cert = await emitirCertificado(moduloId);
      setCertificado(cert);
    } finally {
      setEmittingCert(false);
    }
  };

  /* ── Loading ───────────────────────────────────────────────────── */

  if (loading) return <PageSkeleton />;

  if (!quiz) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Quiz nao encontrado.</p>
        <Link
          href={`/academia/${moduloId}`}
          className="mt-2 inline-block text-sm font-medium"
          style={{ color: 'var(--bb-brand)' }}
        >
          Voltar ao modulo
        </Link>
      </div>
    );
  }

  /* ── Review mode ───────────────────────────────────────────────── */

  if (showReview && resultado && quiz) {
    return (
      <PlanGate module="academia_teorica">
      <div className="max-w-2xl mx-auto space-y-4 p-4 md:p-6 pb-24">
        <button
          onClick={() => setShowReview(false)}
          className="inline-flex items-center gap-1 text-sm font-medium"
          style={{ color: 'var(--bb-brand)' }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Resultado
        </button>

        <h1 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Revisao de Respostas
        </h1>

        {quiz.perguntas.map((pergunta, idx) => {
          const explicacao = resultado.explicacoes.find((e) => e.perguntaId === pergunta.id);
          const isCorrect = explicacao?.correta ?? false;

          return (
            <Card
              key={pergunta.id}
              className="p-4"
              style={{
                borderLeft: `3px solid ${isCorrect ? 'var(--bb-success)' : 'var(--bb-error)'}`,
              }}
            >
              <p className="text-xs font-semibold" style={{ color: 'var(--bb-ink-40)' }}>
                Pergunta {idx + 1}
              </p>
              <p className="mt-1 text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                {pergunta.pergunta}
              </p>

              {pergunta.opcoes && (
                <div className="mt-2 space-y-1.5">
                  {pergunta.opcoes.map((op, oi) => {
                    const wasSelected = answers[pergunta.id] === op.texto;
                    const isCorrectOption = op.correta;
                    let optBg = 'var(--bb-depth-4)';
                    let optColor = 'var(--bb-ink-80)';
                    if (isCorrectOption) {
                      optBg = 'var(--bb-success-surface)';
                      optColor = 'var(--bb-success)';
                    } else if (wasSelected && !isCorrectOption) {
                      optBg = 'rgba(239, 68, 68, 0.08)';
                      optColor = 'var(--bb-error)';
                    }

                    return (
                      <div
                        key={oi}
                        className="flex items-center gap-2 rounded-lg p-2 text-xs"
                        style={{ backgroundColor: optBg, color: optColor }}
                      >
                        <span
                          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: isCorrectOption
                              ? 'var(--bb-success)'
                              : wasSelected
                                ? 'var(--bb-error)'
                                : 'var(--bb-ink-20)',
                            color: isCorrectOption || wasSelected ? '#fff' : 'var(--bb-ink-60)',
                          }}
                        >
                          {OPTION_LETTERS[oi]}
                        </span>
                        {op.texto}
                      </div>
                    );
                  })}
                </div>
              )}

              {explicacao && (
                <p className="mt-2 text-xs italic" style={{ color: 'var(--bb-ink-60)' }}>
                  {explicacao.explicacao}
                </p>
              )}
            </Card>
          );
        })}

        <Button onClick={() => setShowReview(false)} variant="secondary" className="w-full">
          Voltar ao resultado
        </Button>
      </div>
      </PlanGate>
    );
  }

  /* ── Results screen ────────────────────────────────────────────── */

  if (resultado) {
    const passed = resultado.aprovado;
    const scorePct = resultado.nota;

    return (
      <PlanGate module="academia_teorica">
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center p-4 md:p-6 pb-24">
        {/* Score circle */}
        <div
          className="flex h-32 w-32 flex-col items-center justify-center rounded-full border-4"
          style={{
            borderColor: passed ? 'var(--bb-success)' : 'var(--bb-error)',
            backgroundColor: passed ? 'var(--bb-success-surface)' : 'rgba(239, 68, 68, 0.06)',
          }}
        >
          <span
            className="text-3xl font-bold"
            style={{ color: passed ? 'var(--bb-success)' : 'var(--bb-error)' }}
          >
            {scorePct}%
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
            {resultado.acertos}/{resultado.total}
          </span>
        </div>

        {/* Pass / fail message */}
        <h2
          className="mt-5 text-lg font-bold"
          style={{ color: passed ? 'var(--bb-success)' : 'var(--bb-error)' }}
        >
          {passed ? 'Aprovado!' : 'Nao aprovado'}
        </h2>
        <p className="mt-1 text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          {passed
            ? 'Parabens! Voce atingiu a nota minima de 70%.'
            : 'Voce precisa de pelo menos 70% para aprovacao. Tente novamente!'}
        </p>

        {/* Certificate */}
        {passed && !certificado && (
          <Button
            onClick={handleEmitCertificado}
            loading={emittingCert}
            className="mt-6 w-full max-w-xs"
            size="lg"
          >
            Emitir Certificado
          </Button>
        )}

        {certificado && (
          <Card variant="glow" className="mt-6 w-full max-w-sm p-4 text-center">
            <svg
              className="mx-auto h-8 w-8"
              style={{ color: 'var(--bb-success)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <p className="mt-2 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              Certificado emitido!
            </p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              {certificado.moduloTitulo}
            </p>
            <p className="mt-1 text-[10px] font-mono" style={{ color: 'var(--bb-ink-40)' }}>
              {certificado.codigoVerificacao}
            </p>
          </Card>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex w-full max-w-sm flex-col gap-2">
          <Button onClick={() => setShowReview(true)} variant="secondary" className="w-full">
            Revisar respostas
          </Button>

          {!passed && (
            <Button onClick={handleRetry} className="w-full">
              Refazer quiz
            </Button>
          )}

          <Link href={`/academia/${moduloId}`} className="w-full">
            <Button variant="ghost" className="w-full">
              Voltar ao modulo
            </Button>
          </Link>

          <Link href="/academia" className="w-full">
            <Button variant="ghost" className="w-full">
              Voltar a academia
            </Button>
          </Link>
        </div>
      </div>
      </PlanGate>
    );
  }

  /* ── Quiz question flow ────────────────────────────────────────── */

  if (!currentQuestion) return null;

  const isCorrectAnswer =
    confirmed && currentQuestion.opcoes?.find((o) => o.texto === selectedOption)?.correta;
  const progressPct = ((currentIndex + 1) / quiz.perguntas.length) * 100;

  return (
    <PlanGate module="academia_teorica">
    <div className="max-w-2xl mx-auto space-y-5 p-4 md:p-6 pb-24">
      {/* Back link */}
      <Link
        href={`/academia/${moduloId}`}
        className="inline-flex items-center gap-1 text-sm font-medium"
        style={{ color: 'var(--bb-brand)' }}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Sair do quiz
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          {quiz.titulo}
        </h1>
        <p className="mt-0.5 text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
          Pergunta {currentIndex + 1} de {quiz.perguntas.length}
        </p>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 w-full overflow-hidden"
        style={{ borderRadius: 'var(--bb-radius-full)', backgroundColor: 'var(--bb-depth-4)' }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progressPct}%`,
            borderRadius: 'var(--bb-radius-full)',
            background: 'var(--bb-brand-gradient)',
          }}
        />
      </div>

      {/* Question */}
      <Card className="p-5">
        <p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--bb-ink-100)' }}>
          {currentQuestion.pergunta}
        </p>
      </Card>

      {/* Options */}
      <div className="space-y-2">
        {currentQuestion.opcoes?.map((opcao, idx) => {
          const letter = OPTION_LETTERS[idx];
          const isSelected = selectedOption === opcao.texto;
          const isCorrectOpt = opcao.correta;

          let optBg = 'var(--bb-depth-3)';
          let optBorder = 'var(--bb-glass-border)';
          let optText = 'var(--bb-ink-80)';
          let letterBg = 'var(--bb-depth-4)';
          let letterColor = 'var(--bb-ink-60)';

          if (confirmed) {
            if (isCorrectOpt) {
              optBg = 'var(--bb-success-surface)';
              optBorder = 'var(--bb-success)';
              optText = 'var(--bb-success)';
              letterBg = 'var(--bb-success)';
              letterColor = '#fff';
            } else if (isSelected && !isCorrectOpt) {
              optBg = 'rgba(239, 68, 68, 0.06)';
              optBorder = 'var(--bb-error)';
              optText = 'var(--bb-error)';
              letterBg = 'var(--bb-error)';
              letterColor = '#fff';
            }
          } else if (isSelected) {
            optBg = 'var(--bb-brand-surface)';
            optBorder = 'var(--bb-brand)';
            optText = 'var(--bb-ink-100)';
            letterBg = 'var(--bb-brand)';
            letterColor = '#fff';
          }

          return (
            <button
              key={idx}
              onClick={() => !confirmed && setSelectedOption(opcao.texto)}
              disabled={confirmed}
              className="flex w-full items-center gap-3 border p-3.5 text-left transition-all disabled:cursor-default"
              style={{
                backgroundColor: optBg,
                borderColor: optBorder,
                color: optText,
                borderRadius: 'var(--bb-radius-md)',
              }}
            >
              <span
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors"
                style={{ backgroundColor: letterBg, color: letterColor }}
              >
                {letter}
              </span>
              <span className="text-sm font-medium">{opcao.texto}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback after confirmation */}
      {confirmed && (
        <Card
          className="p-4"
          style={{
            borderLeft: `3px solid ${isCorrectAnswer ? 'var(--bb-success)' : 'var(--bb-error)'}`,
          }}
        >
          {isCorrectAnswer ? (
            <div className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0"
                style={{ color: 'var(--bb-success)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--bb-success)' }}>
                  Correto!
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  {currentQuestion.explicacao}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0"
                style={{ color: 'var(--bb-error)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--bb-error)' }}>
                  Incorreto
                </p>
                {correctOption && (
                  <p className="mt-0.5 text-xs font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                    A resposta correta era: {correctOption.texto}
                  </p>
                )}
                <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  {currentQuestion.explicacao}
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Action buttons */}
      {!confirmed ? (
        <Button onClick={handleConfirm} disabled={!selectedOption} className="w-full" size="lg">
          Confirmar
        </Button>
      ) : (
        <Button onClick={handleNext} loading={submitting} className="w-full" size="lg">
          {isLastQuestion ? 'Ver resultado' : 'Proxima'}
        </Button>
      )}
    </div>
    </PlanGate>
  );
}
