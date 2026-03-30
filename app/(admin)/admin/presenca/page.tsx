'use client';

import { useState, useEffect, useCallback } from 'react';
import { isMock } from '@/lib/env';
import { listAttendanceRecord, checkIn, markAbsent, getAttendanceSummary } from '@/lib/api/attendance.service';
import type { AttendanceRecord, AttendanceSummary } from '@/lib/types/attendance';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { CheckSquareIcon } from '@/components/shell/icons';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { translateError } from '@/lib/utils/error-translator';

const MOCK_CLASSES = [
  { id: 'class-1', name: 'BJJ Fundamentos', time: '07:00' },
  { id: 'class-2', name: 'BJJ All Levels', time: '10:00' },
  { id: 'class-3', name: 'Judô Adulto', time: '18:00' },
  { id: 'class-4', name: 'BJJ Avançado', time: '19:00' },
  { id: 'class-5', name: 'BJJ Noturno', time: '21:00' },
];

interface ClassOption {
  id: string;
  name: string;
  time: string;
}

type StatusValue = 'present' | 'absent' | 'justified';

const STATUS_COLORS: Record<StatusValue, { bg: string; text: string }> = {
  present: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
  absent: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  justified: { bg: 'rgba(234,179,8,0.15)', text: '#EAB308' },
};

const STATUS_LABEL: Record<StatusValue, string> = {
  present: 'Presente',
  absent: 'Ausente',
  justified: 'Justificado',
};

export default function AdminPresencaPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendances, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const academyId = getActiveAcademyId();

  const loadClasses = useCallback(async () => {
    if (isMock()) {
      setClasses(MOCK_CLASSES);
      setSelectedClass(MOCK_CLASSES[0].id);
      return;
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data } = await supabase
        .from('classes')
        .select('id, name, schedule')
        .eq('academy_id', academyId);

      const result: ClassOption[] = [];
      for (const cls of data ?? []) {
        const schedules = (cls.schedule ?? []) as Array<{ day_of_week: number; start_time: string }>;
        const firstTime = schedules.length > 0 ? schedules[0].start_time : '00:00';
        result.push({ id: cls.id, name: cls.name, time: firstTime });
      }
      result.sort((a, b) => a.time.localeCompare(b.time));
      setClasses(result);
      if (result.length > 0) setSelectedClass(result[0].id);
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }, [academyId, toast]);

  useEffect(() => {
    loadClasses();
    getAttendanceSummary(academyId).then(setSummary).catch(() => {});
  }, [loadClasses, academyId]);

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    listAttendanceRecord(selectedClass, selectedDate)
      .then(setAttendanceRecords)
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setLoading(false));
  }, [selectedClass, selectedDate, toast]);

  function toggleStatus(studentId: string, current: StatusValue) {
    const cycle: StatusValue[] = ['present', 'absent', 'justified'];
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];

    setAttendanceRecords((prev) =>
      prev.map((a) =>
        a.student_id === studentId ? { ...a, status: next } : a,
      ),
    );
  }

  async function handleSave() {
    try {
      for (const a of attendances) {
        if (a.status === 'present') {
          await checkIn(a.student_id, selectedClass, 'manual');
        } else if (a.status === 'absent') {
          await markAbsent(a.student_id, selectedClass, selectedDate);
        }
      }
      toast('Presença salva com sucesso!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  const present = attendances.filter((a) => a.status === 'present').length;
  const absent = attendances.filter((a) => a.status === 'absent').length;

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6" data-stagger>
      <section className="animate-reveal">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--bb-brand-surface)' }}
          >
            <CheckSquareIcon className="h-5 w-5 text-[var(--bb-brand)]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>Presença</h1>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Gerenciar presença dos alunos</p>
          </div>
        </div>
      </section>

      {/* Summary cards */}
      {summary && (
        <section className="animate-reveal grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--bb-brand)' }}>{summary.total_present}</p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Presenças (30d)</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: '#22C55E' }}>{summary.attendance_rate}%</p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Taxa de Presença</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{classes.length}</p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Turmas</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: '#EAB308' }}>{summary.total_absent}</p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Ausências (30d)</p>
          </Card>
        </section>
      )}

      {/* Selectors */}
      <section className="animate-reveal flex flex-col gap-3 sm:flex-row">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            color: 'var(--bb-ink-100)',
          }}
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.time} — {c.name}</option>
          ))}
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            color: 'var(--bb-ink-100)',
          }}
        />
      </section>

      {/* Stats mini */}
      <section className="animate-reveal flex gap-4">
        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(34,197,94,0.1)' }}>
          <CheckSquareIcon className="h-4 w-4" style={{ color: '#22C55E' }} />
          <span className="text-sm font-semibold" style={{ color: '#22C55E' }}>{present} presentes</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(239,68,68,0.1)' }}>
          <span className="text-sm font-semibold" style={{ color: '#EF4444' }}>{absent} ausentes</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--bb-depth-3)' }}>
          <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>{attendances.length} alunos</span>
        </div>
      </section>

      {/* Student list */}
      <section className="animate-reveal space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="card" className="h-14" />)}
          </div>
        ) : attendances.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Nenhum aluno nesta turma"
            description="Não há registros de presença para a turma e data selecionadas."
            variant="search"
          />
        ) : (
          attendances.map((a) => {
            const sc = STATUS_COLORS[a.status];
            return (
              <div
                key={a.student_id}
                className="flex items-center gap-3 rounded-lg p-3 transition-all"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleStatus(a.student_id, a.status)}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all"
                  style={{ background: sc.bg }}
                  aria-label={`Alterar status de ${a.student_name}`}
                >
                  {a.status === 'present' ? '\u2705' : a.status === 'absent' ? '\u274C' : '\u26A0\uFE0F'}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>
                    {a.student_name}
                  </p>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: sc.bg, color: sc.text }}
                >
                  {STATUS_LABEL[a.status]}
                </span>
              </div>
            );
          })
        )}
      </section>

      {/* Save button */}
      {attendances.length > 0 && (
        <section className="animate-reveal">
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-lg py-3 text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--bb-brand)', color: '#fff' }}
          >
            Salvar Presença
          </button>
        </section>
      )}
    </div>
  );
}
