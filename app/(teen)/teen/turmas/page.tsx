'use client';

import { useState, useEffect } from 'react';
import { getTeenDashboard } from '@/lib/api/teen.service';
import type { TeenDashboardDTO } from '@/lib/api/teen.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { PlanGate } from '@/components/plans/PlanGate';
import { useStudentId } from '@/lib/hooks/useStudentId';
import { translateError } from '@/lib/utils/error-translator';
import { useToast } from '@/lib/hooks/useToast';

// ────────────────────────────────────────────────────────────
// Mock class data (derived from dashboard context)
// ────────────────────────────────────────────────────────────
interface TeenClassDTO {
  id: string;
  name: string;
  modality: string;
  professor: string;
  schedule: { day: string; time: string }[];
  students_count: number;
  emoji: string;
}

const MOCK_CLASSES: TeenClassDTO[] = [
  {
    id: 'cls-1',
    name: 'Jiu-Jitsu Teen Avançado',
    modality: 'Jiu-Jitsu',
    professor: 'Prof. Ricardo Silva',
    schedule: [
      { day: 'Segunda', time: '18:00' },
      { day: 'Quarta', time: '18:00' },
      { day: 'Sexta', time: '18:00' },
    ],
    students_count: 18,
    emoji: '🥋',
  },
  {
    id: 'cls-2',
    name: 'Muay Thai Teen',
    modality: 'Muay Thai',
    professor: 'Prof. Amanda Costa',
    schedule: [
      { day: 'Terça', time: '17:30' },
      { day: 'Quinta', time: '17:30' },
    ],
    students_count: 14,
    emoji: '🥊',
  },
  {
    id: 'cls-3',
    name: 'Competição - Preparação',
    modality: 'Jiu-Jitsu',
    professor: 'Prof. Ricardo Silva',
    schedule: [{ day: 'Sábado', time: '10:00' }],
    students_count: 8,
    emoji: '🏆',
  },
];

const DAY_ORDER: Record<string, number> = {
  Segunda: 1,
  Terça: 2,
  Quarta: 3,
  Quinta: 4,
  Sexta: 5,
  Sábado: 6,
  Domingo: 7,
};

export default function TeenTurmasPage() {
  const { studentId, loading: studentLoading } = useStudentId();
  const { toast } = useToast();
  const [data, setData] = useState<TeenDashboardDTO | null>(null);
  const [classes] = useState<TeenClassDTO[]>(MOCK_CLASSES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentLoading || !studentId) return;
    async function load() {
      try {
        const d = await getTeenDashboard(studentId!);
        setData(d);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId, studentLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading ───────────────────────────────────────────────
  if (loading || studentLoading) {
    return (
      <div className="min-h-screen bg-[var(--bb-depth-1)] p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Skeleton variant="text" className="h-8 w-40 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-40 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-40 bg-[var(--bb-depth-3)]" />
          <Skeleton variant="card" className="h-40 bg-[var(--bb-depth-3)]" />
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────
  if (!data || classes.length === 0) {
    return (
      <PlanGate module="teen_module">
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bb-depth-1)] px-4">
          <span className="text-6xl">📋</span>
          <h2 className="mt-4 text-xl font-bold text-[var(--bb-ink-100)]">Sem turmas</h2>
          <p className="mt-2 text-sm text-[var(--bb-ink-60)]">
            Você ainda não está matriculado em nenhuma turma.
          </p>
        </div>
      </PlanGate>
    );
  }

  // Build weekly schedule from all classes
  const weekSchedule = classes
    .flatMap((cls) =>
      cls.schedule.map((s) => ({ ...s, className: cls.name, emoji: cls.emoji, classId: cls.id })),
    )
    .sort((a, b) => (DAY_ORDER[a.day] ?? 8) - (DAY_ORDER[b.day] ?? 8));

  return (
    <PlanGate module="teen_module">
      <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--bb-ink-100)]">Minhas Turmas</h1>
          <p className="mt-1 text-sm text-[var(--bb-ink-60)]">
            {classes.length} {classes.length === 1 ? 'turma' : 'turmas'} ativas
          </p>
        </div>

        {/* Weekly overview */}
        <section className="rounded-2xl bg-gradient-to-br from-indigo-900/40 to-purple-900/30 p-4 ring-1 ring-indigo-500/20">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-indigo-400">
            Agenda da Semana
          </h2>
          <div className="space-y-2">
            {weekSchedule.map((slot, i) => (
              <div
                key={`${slot.classId}-${slot.day}-${i}`}
                className="flex items-center gap-3 rounded-xl bg-[var(--bb-depth-3)] px-4 py-3"
              >
                <span className="text-xl">{slot.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--bb-ink-100)]">{slot.className}</p>
                  <p className="text-xs text-[var(--bb-ink-60)]">
                    {slot.day} &middot; {slot.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Class cards */}
        {classes.map((cls) => (
          <section
            key={cls.id}
            className="overflow-hidden rounded-2xl bg-[var(--bb-depth-3)] ring-1 ring-[var(--bb-glass-border)]"
          >
            {/* Card header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-bb-red-500/20 to-orange-500/10 px-5 py-4">
              <span className="text-3xl">{cls.emoji}</span>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold text-[var(--bb-ink-100)]">{cls.name}</h3>
                <p className="text-xs text-[var(--bb-ink-60)]">{cls.modality}</p>
              </div>
            </div>

            <div className="space-y-3 p-5">
              {/* Professor */}
              <div className="flex items-center gap-3">
                <Avatar name={cls.professor} size="sm" />
                <div>
                  <p className="text-xs text-[var(--bb-ink-40)]">Professor</p>
                  <p className="text-sm font-semibold text-[var(--bb-ink-60)]">{cls.professor}</p>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <p className="mb-1.5 text-xs text-[var(--bb-ink-40)]">Horários</p>
                <div className="flex flex-wrap gap-2">
                  {cls.schedule.map((s) => (
                    <span
                      key={`${cls.id}-${s.day}`}
                      className="rounded-lg bg-[var(--bb-depth-5)] px-3 py-1.5 text-xs font-semibold text-[var(--bb-ink-60)]"
                    >
                      {s.day} {s.time}
                    </span>
                  ))}
                </div>
              </div>

              {/* Students count */}
              <div className="flex items-center gap-2 text-xs text-[var(--bb-ink-40)]">
                <span>👥</span>
                <span>{cls.students_count} alunos matriculados</span>
              </div>
            </div>
          </section>
        ))}
      </div>
      </div>
    </PlanGate>
  );
}
