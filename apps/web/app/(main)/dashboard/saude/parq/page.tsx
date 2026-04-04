'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { useAuth } from '@/lib/hooks/useAuth';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { translateError } from '@/lib/utils/error-translator';
import { cn } from '@/lib/utils/cn';
import {
  submitParqResponse,
  getLatestParqResponse,
} from '@/lib/api/health-declaration.service';
import type { ParqResponse, ParqAnswers } from '@/lib/api/health-declaration.service';

// ── Question definitions ────────────────────────────────────────

interface ParqQuestion {
  key: keyof ParqAnswers;
  text: string;
}

const QUESTIONS: ParqQuestion[] = [
  {
    key: 'q1_heart_condition',
    text: 'Seu medico ja disse que voce possui algum problema cardiaco e que so deveria fazer atividade fisica sob supervisao medica?',
  },
  {
    key: 'q2_chest_pain_activity',
    text: 'Voce sente dor no peito quando pratica atividade fisica?',
  },
  {
    key: 'q3_chest_pain_rest',
    text: 'No ultimo mes, voce sentiu dor no peito quando nao estava praticando atividade fisica?',
  },
  {
    key: 'q4_dizziness_balance',
    text: 'Voce perde o equilibrio por causa de tontura ou ja perdeu a consciencia?',
  },
  {
    key: 'q5_bone_joint_problem',
    text: 'Voce possui algum problema osseo ou articular que poderia piorar com atividades fisicas?',
  },
  {
    key: 'q6_medication_bp_heart',
    text: 'Seu medico esta prescrevendo medicamentos para sua pressao arterial ou problema cardiaco?',
  },
  {
    key: 'q7_other_reason',
    text: 'Voce conhece alguma outra razao pela qual nao deveria praticar atividade fisica?',
  },
];

// ── Loading skeleton ────────────────────────────────────────────

function ParqSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton variant="text" className="h-8 w-64" />
      <Skeleton variant="text" className="h-5 w-80" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} variant="card" className="h-24" />
        ))}
      </div>
    </div>
  );
}

// ── Yes/No toggle ───────────────────────────────────────────────

function YesNoToggle({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          'flex h-9 items-center justify-center rounded-[var(--bb-radius-md)] px-5 text-sm font-medium transition-all duration-200',
          value === true
            ? 'bg-red-500 text-white shadow-sm'
            : 'border border-[var(--bb-glass-border)] bg-[var(--bb-depth-2)] text-[var(--bb-ink-60)] hover:bg-[var(--bb-depth-3)]',
        )}
      >
        Sim
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          'flex h-9 items-center justify-center rounded-[var(--bb-radius-md)] px-5 text-sm font-medium transition-all duration-200',
          value === false
            ? 'bg-green-500 text-white shadow-sm'
            : 'border border-[var(--bb-glass-border)] bg-[var(--bb-depth-2)] text-[var(--bb-ink-60)] hover:bg-[var(--bb-depth-3)]',
        )}
      >
        Nao
      </button>
    </div>
  );
}

// ── Previous answers view ───────────────────────────────────────

function PreviousAnswersView({
  response,
  onRedo,
}: {
  response: ParqResponse;
  onRedo: () => void;
}) {
  const completedDate = new Date(response.completed_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const answerKeys: (keyof ParqResponse)[] = [
    'q1_heart_condition',
    'q2_chest_pain_activity',
    'q3_chest_pain_rest',
    'q4_dizziness_balance',
    'q5_bone_joint_problem',
    'q6_medication_bp_heart',
    'q7_other_reason',
  ];

  return (
    <div className="space-y-4">
      {/* Result banner */}
      <Card
        variant={response.has_risk_factor ? 'default' : 'glow'}
        className={cn(
          'flex items-center gap-4 p-4',
          response.has_risk_factor
            ? 'border-l-4 border-l-yellow-500'
            : '',
        )}
      >
        {response.has_risk_factor ? (
          <AlertTriangle className="h-8 w-8 flex-shrink-0 text-yellow-500" />
        ) : (
          <ShieldCheck className="h-8 w-8 flex-shrink-0 text-green-500" />
        )}
        <div>
          <p className="text-sm font-bold text-[var(--bb-ink-100)]">
            {response.has_risk_factor
              ? 'Fator de risco identificado'
              : 'Nenhum fator de risco identificado'}
          </p>
          <p className="mt-0.5 text-xs text-[var(--bb-ink-40)]">
            {response.has_risk_factor
              ? 'Recomendamos consultar um medico antes de iniciar atividades fisicas intensas.'
              : 'Voce esta apto para pratica de atividades fisicas. Continue se cuidando!'}
          </p>
          <p className="mt-1 text-[10px] text-[var(--bb-ink-40)]">
            Preenchido em {completedDate}
          </p>
        </div>
      </Card>

      {/* Previous answers */}
      <div className="space-y-2">
        {QUESTIONS.map((q, i) => {
          const answered = Boolean(response[answerKeys[i]]);
          return (
            <Card key={q.key} variant="outlined" className="p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="flex-1 text-sm text-[var(--bb-ink-80)]">
                  <span className="font-semibold text-[var(--bb-ink-100)]">{i + 1}.</span>{' '}
                  {q.text}
                </p>
                <span
                  className={cn(
                    'flex-shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold',
                    answered
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-green-500/10 text-green-500',
                  )}
                >
                  {answered ? 'Sim' : 'Nao'}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {response.additional_notes && (
        <Card variant="outlined" className="p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--bb-ink-40)]">
            Observacoes
          </p>
          <p className="mt-1 text-sm text-[var(--bb-ink-80)]">{response.additional_notes}</p>
        </Card>
      )}

      {/* Redo button */}
      <Button variant="secondary" size="md" onClick={onRedo} className="w-full sm:w-auto">
        <RotateCcw className="mr-2 h-4 w-4" />
        Preencher novamente
      </Button>
    </div>
  );
}

// ── Success result view ─────────────────────────────────────────

function SuccessView({
  response,
  onViewAnswers,
}: {
  response: ParqResponse;
  onViewAnswers: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      {response.has_risk_factor ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
          <AlertTriangle className="h-8 w-8 text-yellow-500" />
        </div>
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-[var(--bb-ink-100)]">
          Questionario enviado com sucesso!
        </h2>
        <p className="mt-1 text-sm text-[var(--bb-ink-60)]">
          {response.has_risk_factor
            ? 'Foram identificados possiveis fatores de risco. Recomendamos que voce consulte um medico antes de iniciar atividades fisicas intensas.'
            : 'Nenhum fator de risco foi identificado. Voce esta apto para a pratica de atividades fisicas.'}
        </p>
      </div>

      <Button variant="primary" size="md" onClick={onViewAnswers}>
        Ver minhas respostas
      </Button>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────

export default function ParqPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previousResponse, setPreviousResponse] = useState<ParqResponse | null>(null);
  const [justSubmitted, setJustSubmitted] = useState<ParqResponse | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state — null means unanswered
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({
    q1_heart_condition: null,
    q2_chest_pain_activity: null,
    q3_chest_pain_rest: null,
    q4_dizziness_balance: null,
    q5_bone_joint_problem: null,
    q6_medication_bp_heart: null,
    q7_other_reason: null,
  });
  const [notes, setNotes] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);

  // ── Load existing response ────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const academyId = getActiveAcademyId();
        if (!academyId || !profile?.id) return;
        const latest = await getLatestParqResponse(academyId, profile.id);
        if (latest) {
          setPreviousResponse(latest);
        } else {
          setShowForm(true);
        }
      } catch (err) {
        toast(translateError(err), 'error');
        setShowForm(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile?.id]);

  // ── Handle answer change ──────────────────────────────────

  function setAnswer(key: string, value: boolean) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  // ── Reset form for redo ───────────────────────────────────

  function handleRedo() {
    setAnswers({
      q1_heart_condition: null,
      q2_chest_pain_activity: null,
      q3_chest_pain_rest: null,
      q4_dizziness_balance: null,
      q5_bone_joint_problem: null,
      q6_medication_bp_heart: null,
      q7_other_reason: null,
    });
    setNotes('');
    setLgpdConsent(false);
    setJustSubmitted(null);
    setPreviousResponse(null);
    setShowForm(true);
  }

  // ── Submit ────────────────────────────────────────────────

  async function handleSubmit() {
    // Validate all answered
    const unanswered = QUESTIONS.filter((q) => answers[q.key] === null);
    if (unanswered.length > 0) {
      toast('Por favor, responda todas as perguntas antes de enviar.', 'error');
      return;
    }

    if (!lgpdConsent) {
      toast('Voce precisa consentir com o tratamento dos dados para continuar.', 'error');
      return;
    }

    const academyId = getActiveAcademyId();
    if (!academyId || !profile?.id) {
      toast('Nao foi possivel identificar sua academia ou perfil.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const parqAnswers: ParqAnswers = {
        q1_heart_condition: answers.q1_heart_condition as boolean,
        q2_chest_pain_activity: answers.q2_chest_pain_activity as boolean,
        q3_chest_pain_rest: answers.q3_chest_pain_rest as boolean,
        q4_dizziness_balance: answers.q4_dizziness_balance as boolean,
        q5_bone_joint_problem: answers.q5_bone_joint_problem as boolean,
        q6_medication_bp_heart: answers.q6_medication_bp_heart as boolean,
        q7_other_reason: answers.q7_other_reason as boolean,
        additional_notes: notes.trim() || undefined,
      };

      const result = await submitParqResponse(academyId, profile.id, parqAnswers, {
        consent: true,
      });

      if (!result) {
        toast('Erro ao enviar questionario. Tente novamente.', 'error');
        return;
      }

      setJustSubmitted(result);
      setShowForm(false);
      toast('Questionario enviado com sucesso!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────

  if (loading) return <ParqSkeleton />;

  return (
    <div className="space-y-6 p-4 pb-24">
      {/* ── Back button + Title ─────────────────────────────── */}
      <div>
        <button
          onClick={() => router.push('/dashboard/saude')}
          className="mb-3 flex items-center gap-1 text-sm text-[var(--bb-ink-60)] transition-colors hover:text-[var(--bb-ink-100)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <h1 className="text-xl font-bold text-[var(--bb-ink-100)]">
          Questionario de Prontidao para Atividade Fisica (PAR-Q+)
        </h1>
        <p className="mt-1 text-sm text-[var(--bb-ink-60)]">
          Responda as 7 perguntas abaixo com honestidade
        </p>
      </div>

      {/* ── Just submitted: success view ────────────────────── */}
      {justSubmitted && !showForm && (
        <SuccessView
          response={justSubmitted}
          onViewAnswers={() => {
            setPreviousResponse(justSubmitted);
            setJustSubmitted(null);
          }}
        />
      )}

      {/* ── Previous response view ──────────────────────────── */}
      {previousResponse && !showForm && !justSubmitted && (
        <PreviousAnswersView response={previousResponse} onRedo={handleRedo} />
      )}

      {/* ── Questionnaire form ──────────────────────────────── */}
      {showForm && (
        <div className="space-y-4">
          {QUESTIONS.map((q, i) => (
            <Card key={q.key} variant="default" className="space-y-3 p-4">
              <p className="text-sm text-[var(--bb-ink-80)]">
                <span className="font-bold text-[var(--bb-ink-100)]">{i + 1}.</span>{' '}
                {q.text}
              </p>
              <YesNoToggle
                value={answers[q.key]}
                onChange={(v) => setAnswer(q.key, v)}
              />
            </Card>
          ))}

          {/* Additional notes */}
          <Card variant="default" className="space-y-2 p-4">
            <label className="text-sm font-medium text-[var(--bb-ink-80)]">
              Observacoes adicionais{' '}
              <span className="font-normal text-[var(--bb-ink-40)]">(opcional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Alguma informacao adicional que gostaria de compartilhar..."
              className="w-full resize-none rounded-[var(--bb-radius-md)] border border-[var(--bb-glass-border)] bg-[var(--bb-depth-2)] px-3 py-2 text-sm text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] focus:border-[var(--bb-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--bb-brand)]"
            />
          </Card>

          {/* LGPD consent */}
          <Card variant="outlined" className="p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={lgpdConsent}
                onChange={(e) => setLgpdConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-[var(--bb-glass-border)] accent-[var(--bb-brand)]"
              />
              <span className="text-xs leading-relaxed text-[var(--bb-ink-60)]">
                Consinto com o tratamento dos meus dados sensiveis de saude conforme LGPD Art. 11
              </span>
            </label>
          </Card>

          {/* Submit */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            loading={submitting}
            disabled={submitting}
            onClick={handleSubmit}
          >
            Enviar Questionario
          </Button>
        </div>
      )}
    </div>
  );
}
