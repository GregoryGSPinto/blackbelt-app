'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, AlertTriangle, CheckCircle, XCircle, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import {
  listRestrictions,
  listInjuries,
  submitPretrainingCheck,
  listPretrainingChecks,
} from '@/lib/api/health-declaration.service';
import type { TrainingRestriction, HealthInjury, PretrainingCheck } from '@/lib/api/health-declaration.service';

// ── Restriction Labels ──────────────────────────────────────────

const RESTRICTION_LABELS: Record<string, string> = {
  no_sparring: 'Sem sparring',
  no_ground: 'Sem solo',
  no_striking: 'Sem striking',
  no_takedowns: 'Sem quedas',
  limited_range: 'Amplitude limitada',
  no_contact: 'Sem contato',
  light_only: 'Apenas leve',
  observe_only: 'Apenas observar',
  custom: 'Personalizada',
};

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  low: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
  moderate: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  high: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
};

// ── Skeleton ────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton variant="text" className="h-8 w-48" />
      <Skeleton variant="card" className="h-32" />
      <Skeleton variant="card" className="h-48" />
      <Skeleton variant="card" className="h-64" />
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────

export default function ProfessorHealthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const academyId = getActiveAcademyId();

  const [loading, setLoading] = useState(true);
  const [restrictions, setRestrictions] = useState<TrainingRestriction[]>([]);
  const [injuries, setInjuries] = useState<HealthInjury[]>([]);
  const [todaysChecks, setTodaysChecks] = useState<PretrainingCheck[]>([]);

  // Pre-training check form
  const [checkingStudent, setCheckingStudent] = useState<string | null>(null);
  const [feeling, setFeeling] = useState(0);
  const [hasPain, setHasPain] = useState(false);
  const [painLocation, setPainLocation] = useState('');
  const [painLevel, setPainLevel] = useState(0);
  const [cleared, setCleared] = useState(true);
  const [checkNotes, setCheckNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Search
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [r, i, c] = await Promise.all([
          listRestrictions(academyId, { activeOnly: true }),
          listInjuries(academyId, { status: 'active' }),
          listPretrainingChecks(academyId, { date: new Date().toISOString().slice(0, 10) }),
        ]);
        setRestrictions(r);
        setInjuries(i);
        setTodaysChecks(c);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmitCheck = async () => {
    if (!checkingStudent || feeling === 0) return;
    setSubmitting(true);
    try {
      const result = await submitPretrainingCheck(academyId, checkingStudent, 'self', {
        check_date: new Date().toISOString().slice(0, 10),
        feeling_score: feeling,
        pain_reported: hasPain,
        pain_location: hasPain ? painLocation : undefined,
        pain_level: hasPain ? painLevel : undefined,
        cleared_to_train: cleared,
        notes: checkNotes || undefined,
      });
      if (result) {
        setTodaysChecks((prev) => [...prev, result]);
        toast('Check pre-treino registrado!', 'success');
        resetCheckForm();
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  function resetCheckForm() {
    setCheckingStudent(null);
    setFeeling(0);
    setHasPain(false);
    setPainLocation('');
    setPainLevel(0);
    setCleared(true);
    setCheckNotes('');
  }

  if (loading) return <PageSkeleton />;

  const filteredRestrictions = search
    ? restrictions.filter((r) =>
        r.profile_id.toLowerCase().includes(search.toLowerCase()) ||
        r.body_part?.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : restrictions;

  return (
    <div className="space-y-6 p-4 pb-24">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/professor')}
          className="mb-3 inline-flex items-center gap-1 text-sm transition-colors"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6" style={{ color: 'var(--bb-brand)' }} />
          <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Saude dos Alunos
          </h1>
        </div>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Restricoes ativas, lesoes e check pre-treino
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="p-3 text-center"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-md)',
          }}
        >
          <p className="text-xl font-bold" style={{ color: '#ef4444' }}>
            {injuries.length}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
            Lesoes ativas
          </p>
        </div>
        <div
          className="p-3 text-center"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-md)',
          }}
        >
          <p className="text-xl font-bold" style={{ color: '#f59e0b' }}>
            {restrictions.length}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
            Restricoes
          </p>
        </div>
        <div
          className="p-3 text-center"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-md)',
          }}
        >
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>
            {todaysChecks.length}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
            Checks hoje
          </p>
        </div>
      </div>

      {/* Active Restrictions */}
      <section>
        <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          <AlertTriangle className="mb-0.5 mr-1.5 inline h-4 w-4" style={{ color: '#f59e0b' }} />
          Restricoes Ativas
        </h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bb-ink-30)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por aluno ou restricao..."
            className="w-full rounded-[var(--bb-radius-md)] border py-2 pl-9 pr-3 text-sm"
            style={{
              background: 'var(--bb-depth-3)',
              borderColor: 'var(--bb-glass-border)',
              color: 'var(--bb-ink-100)',
            }}
          />
        </div>

        {filteredRestrictions.length === 0 ? (
          <Card className="p-6 text-center">
            <CheckCircle className="mx-auto h-8 w-8" style={{ color: '#22c55e' }} />
            <p className="mt-2 text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Nenhuma restricao ativa
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredRestrictions.map((r) => {
              const sev = SEVERITY_COLORS[r.severity] ?? SEVERITY_COLORS.moderate;
              return (
                <Card key={r.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: sev.bg, color: sev.text }}
                        >
                          {RESTRICTION_LABELS[r.restriction_type] ?? r.restriction_type}
                        </span>
                        {r.body_part && (
                          <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                            {r.body_part}
                          </span>
                        )}
                      </div>
                      {r.description && (
                        <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                          {r.description}
                        </p>
                      )}
                    </div>
                    {r.end_date && (
                      <span className="shrink-0 text-[10px]" style={{ color: 'var(--bb-ink-30)' }}>
                        ate {new Date(r.end_date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Active Injuries */}
      {injuries.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            <XCircle className="mb-0.5 mr-1.5 inline h-4 w-4" style={{ color: '#ef4444' }} />
            Lesoes Ativas
          </h2>
          <div className="space-y-2">
            {injuries.map((inj) => (
              <Card key={inj.id} className="p-3">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      background: inj.severity === 'severe' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                      color: inj.severity === 'severe' ? '#ef4444' : '#f59e0b',
                    }}
                  >
                    {inj.severity === 'severe' ? 'Grave' : inj.severity === 'moderate' ? 'Moderada' : 'Leve'}
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {inj.body_part}
                  </span>
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  {inj.description}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Pre-Training Check Form */}
      <section>
        <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          <Heart className="mb-0.5 mr-1.5 inline h-4 w-4" style={{ color: 'var(--bb-brand)' }} />
          Check Pre-Treino
        </h2>

        {checkingStudent === null ? (
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => setCheckingStudent('student-placeholder')}
          >
            Iniciar Check Pre-Treino
          </Button>
        ) : (
          <Card className="space-y-4 p-4">
            {/* Feeling Score */}
            <div>
              <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
                Como o aluno esta se sentindo? (1-5)
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFeeling(n)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all',
                      feeling === n
                        ? 'text-white'
                        : '',
                    )}
                    style={{
                      background: feeling === n ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
                      border: `1px solid ${feeling === n ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
                      color: feeling === n ? '#fff' : 'var(--bb-ink-60)',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Pain */}
            <div>
              <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
                Reporta alguma dor?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setHasPain(true)}
                  className={cn(
                    'rounded-[var(--bb-radius-md)] border px-4 py-2 text-sm font-medium transition-all',
                  )}
                  style={{
                    background: hasPain ? 'rgba(239,68,68,0.1)' : 'var(--bb-depth-3)',
                    borderColor: hasPain ? '#ef4444' : 'var(--bb-glass-border)',
                    color: hasPain ? '#ef4444' : 'var(--bb-ink-60)',
                  }}
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => { setHasPain(false); setPainLocation(''); setPainLevel(0); }}
                  className={cn(
                    'rounded-[var(--bb-radius-md)] border px-4 py-2 text-sm font-medium transition-all',
                  )}
                  style={{
                    background: !hasPain ? 'rgba(34,197,94,0.1)' : 'var(--bb-depth-3)',
                    borderColor: !hasPain ? '#22c55e' : 'var(--bb-glass-border)',
                    color: !hasPain ? '#22c55e' : 'var(--bb-ink-60)',
                  }}
                >
                  Nao
                </button>
              </div>

              {hasPain && (
                <div className="mt-3 space-y-3">
                  <input
                    type="text"
                    value={painLocation}
                    onChange={(e) => setPainLocation(e.target.value)}
                    placeholder="Local da dor (ex: joelho direito)"
                    className="w-full rounded-[var(--bb-radius-md)] border p-2 text-sm"
                    style={{
                      background: 'var(--bb-depth-3)',
                      borderColor: 'var(--bb-glass-border)',
                      color: 'var(--bb-ink-100)',
                    }}
                  />
                  <div>
                    <p className="mb-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      Nivel da dor: {painLevel}/10
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={painLevel}
                      onChange={(e) => setPainLevel(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cleared */}
            <div>
              <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
                Liberado para treinar?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCleared(true)}
                  className="rounded-[var(--bb-radius-md)] border px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    background: cleared ? 'rgba(34,197,94,0.1)' : 'var(--bb-depth-3)',
                    borderColor: cleared ? '#22c55e' : 'var(--bb-glass-border)',
                    color: cleared ? '#22c55e' : 'var(--bb-ink-60)',
                  }}
                >
                  <CheckCircle className="mr-1 inline h-4 w-4" /> Sim
                </button>
                <button
                  type="button"
                  onClick={() => setCleared(false)}
                  className="rounded-[var(--bb-radius-md)] border px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    background: !cleared ? 'rgba(239,68,68,0.1)' : 'var(--bb-depth-3)',
                    borderColor: !cleared ? '#ef4444' : 'var(--bb-glass-border)',
                    color: !cleared ? '#ef4444' : 'var(--bb-ink-60)',
                  }}
                >
                  <XCircle className="mr-1 inline h-4 w-4" /> Nao
                </button>
              </div>
            </div>

            {/* Notes */}
            <textarea
              value={checkNotes}
              onChange={(e) => setCheckNotes(e.target.value)}
              placeholder="Observacoes (opcional)"
              rows={2}
              className="w-full resize-none rounded-[var(--bb-radius-md)] border p-2 text-sm"
              style={{
                background: 'var(--bb-depth-3)',
                borderColor: 'var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
              }}
            />

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={handleSubmitCheck}
                loading={submitting}
                disabled={feeling === 0}
              >
                Registrar Check
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={resetCheckForm}
              >
                Cancelar
              </Button>
            </div>
          </Card>
        )}
      </section>

      {/* Today's Checks */}
      {todaysChecks.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-60)' }}>
            Checks realizados hoje ({todaysChecks.length})
          </h2>
          <div className="space-y-2">
            {todaysChecks.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 'var(--bb-radius-md)',
                }}
              >
                <div className="flex items-center gap-2">
                  {c.cleared_to_train ? (
                    <CheckCircle className="h-4 w-4" style={{ color: '#22c55e' }} />
                  ) : (
                    <XCircle className="h-4 w-4" style={{ color: '#ef4444' }} />
                  )}
                  <span className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>
                    {c.profile_id.slice(0, 8)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    Sentimento: {c.feeling_score}/5
                  </span>
                  {c.pain_reported && (
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                    >
                      Dor
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
