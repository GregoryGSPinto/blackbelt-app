'use client';

import { useEffect, useState } from 'react';
import {
  getActivePlan,
  logExercise,
  type TrainingPlanDTO,
  type Exercise,
} from '@/lib/api/training-plan.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

export default function PlanoTreinoPage() {
  const { toast } = useToast();
  const [plan, setPlan] = useState<TrainingPlanDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedExercises, setCheckedExercises] = useState<Set<string>>(new Set());

  // Simulate current week based on plan start
  const currentWeek = 3;

  useEffect(() => {
    getActivePlan('student-1')
      .then(setPlan)
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggleExercise(exercise: Exercise, sessionId: string, weekNumber: number) {
    if (!plan) return;
    const key = `${weekNumber}-${sessionId}-${exercise.id}`;
    const isCompleting = !checkedExercises.has(key);

    try {
      if (isCompleting) {
        await logExercise(plan.id, {
          exercise_id: exercise.id,
          session_id: sessionId,
          week_number: weekNumber,
          completed_at: new Date().toISOString(),
        });
      }
      setCheckedExercises((prev) => {
        const next = new Set(prev);
        if (isCompleting) next.add(key); else next.delete(key);
        return next;
      });
      if (isCompleting) toast('Exercício registrado!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  if (!plan) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-bb-gray-500">Nenhum plano de treino ativo.</p>
        <p className="mt-1 text-xs text-bb-gray-400">Solicite ao seu professor para criar um plano personalizado.</p>
      </div>
    );
  }

  const totalExInWeek = plan.weeks.find((w) => w.week_number === currentWeek)?.sessions.reduce((acc, s) => acc + s.exercises.length, 0) ?? 0;
  const doneInWeek = plan.weeks.find((w) => w.week_number === currentWeek)?.sessions.reduce((acc, s) => {
    return acc + s.exercises.filter((e) => checkedExercises.has(`${currentWeek}-${s.id}-${e.id}`)).length;
  }, 0) ?? 0;
  const weekPct = totalExInWeek > 0 ? Math.round((doneInWeek / totalExInWeek) * 100) : 0;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold text-bb-black">Meu Plano de Treino</h1>

      {/* Plan Header */}
      <Card className="p-4">
        <h2 className="font-bold text-bb-black">{plan.name}</h2>
        <p className="mt-1 text-sm text-bb-gray-500">{plan.goal}</p>
        <div className="mt-3 flex items-center gap-4 text-xs text-bb-gray-500">
          <span>{plan.duration_weeks} semanas</span>
          {plan.adherence_pct !== undefined && <span>Aderência geral: {plan.adherence_pct}%</span>}
        </div>
      </Card>

      {/* Week Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {plan.weeks.map((week) => (
          <button
            key={week.week_number}
            className={`flex-shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition ${
              week.week_number === currentWeek
                ? 'bg-bb-primary text-white shadow-sm'
                : 'bg-bb-gray-100 text-bb-gray-500'
            }`}
          >
            S{week.week_number}
          </button>
        ))}
      </div>

      {/* Current Week Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-bb-black">
              Semana {currentWeek}: {plan.weeks.find((w) => w.week_number === currentWeek)?.theme}
            </p>
            <p className="text-xs text-bb-gray-500">{doneInWeek}/{totalExInWeek} exercícios concluídos</p>
          </div>
          <span className="text-lg font-bold text-bb-primary">{weekPct}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-bb-gray-200">
          <div className="h-full rounded-full bg-bb-primary transition-all duration-300" style={{ width: `${weekPct}%` }} />
        </div>
      </Card>

      {/* Sessions */}
      {plan.weeks
        .filter((w) => w.week_number === currentWeek)
        .map((week) =>
          week.sessions.map((session) => (
            <Card key={session.id} className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-bb-black">{session.label}</h3>
              <div className="space-y-2">
                {session.exercises.map((exercise) => {
                  const key = `${week.week_number}-${session.id}-${exercise.id}`;
                  const done = checkedExercises.has(key);
                  return (
                    <div
                      key={exercise.id}
                      className={`flex items-start gap-3 rounded-lg border p-3 transition ${done ? 'border-green-200 bg-green-50' : 'border-bb-gray-200'}`}
                    >
                      <button
                        onClick={() => handleToggleExercise(exercise, session.id, week.week_number)}
                        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition ${done ? 'border-green-500 bg-green-500 text-white' : 'border-bb-gray-300'}`}
                      >
                        {done && (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${done ? 'text-green-700 line-through' : 'text-bb-black'}`}>
                          {exercise.name}
                        </p>
                        <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-bb-gray-500">
                          {exercise.sets && exercise.reps && <span>{exercise.sets}x{exercise.reps}</span>}
                          {exercise.duration_min && <span>{exercise.duration_min}min</span>}
                        </div>
                        {exercise.notes && <p className="mt-0.5 text-xs text-bb-gray-400">{exercise.notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))
        )}

      {/* Log button */}
      <Button className="w-full" disabled={doneInWeek === 0}>
        Salvar Registro do Dia
      </Button>
    </div>
  );
}
