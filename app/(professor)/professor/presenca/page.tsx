'use client';

import { useState, useEffect } from 'react';
import { listAttendanceRecord, checkIn, markAbsent } from '@/lib/api/attendance.service';
import type { AttendanceRecord } from '@/lib/types/attendance';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { CheckSquareIcon } from '@/components/shell/icons';
import { EmptyState } from '@/components/ui/EmptyState';
import { translateError } from '@/lib/utils/error-translator';

const CLASSES = [
  { id: 'class-1', name: 'BJJ Fundamentos', time: '07:00' },
  { id: 'class-2', name: 'BJJ All Levels', time: '10:00' },
  { id: 'class-3', name: 'Judô Adulto', time: '18:00' },
  { id: 'class-4', name: 'BJJ Avançado', time: '19:00' },
  { id: 'class-5', name: 'BJJ Noturno', time: '21:00' },
];

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

export default function ProfessorPresencaPage() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState(CLASSES[0].id);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendances, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="flex gap-3">
          <Skeleton variant="card" className="h-10 w-48" />
          <Skeleton variant="card" className="h-10 w-40" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="card" className="h-14" />)}
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6" data-stagger>
      <section className="animate-reveal">
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>Presença</h1>
      </section>

      {/* ── Selectors ──────────────────────────────────────────────── */}
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
          {CLASSES.map((c) => (
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

        <button
          type="button"
          onClick={() => setShowQR(!showQR)}
          className="rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-80"
          style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
        >
          {showQR ? 'Fechar QR' : 'QR Code'}
        </button>
      </section>

      {/* ── QR Code ────────────────────────────────────────────────── */}
      {showQR && (
        <section className="animate-reveal">
          <div
            className="flex flex-col items-center gap-4 p-8"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
              QR Code — {CLASSES.find((c) => c.id === selectedClass)?.name}
            </p>
            {/* SVG QR Code placeholder */}
            <svg width="200" height="200" viewBox="0 0 200 200">
              <rect width="200" height="200" rx="12" fill="white" />
              <rect x="20" y="20" width="60" height="60" rx="4" fill="#000" />
              <rect x="120" y="20" width="60" height="60" rx="4" fill="#000" />
              <rect x="20" y="120" width="60" height="60" rx="4" fill="#000" />
              <rect x="30" y="30" width="40" height="40" rx="2" fill="white" />
              <rect x="130" y="30" width="40" height="40" rx="2" fill="white" />
              <rect x="30" y="130" width="40" height="40" rx="2" fill="white" />
              <rect x="40" y="40" width="20" height="20" fill="#000" />
              <rect x="140" y="40" width="20" height="20" fill="#000" />
              <rect x="40" y="140" width="20" height="20" fill="#000" />
              <rect x="90" y="90" width="20" height="20" fill="#000" />
              <rect x="120" y="120" width="60" height="60" rx="4" fill="var(--bb-brand)" opacity="0.2" />
              <text x="150" y="155" textAnchor="middle" fontSize="10" fill="var(--bb-brand)" fontWeight="bold">BB</text>
            </svg>
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              Alunos escaneiam para fazer check-in automático
            </p>
          </div>
        </section>
      )}

      {/* ── Stats mini ─────────────────────────────────────────────── */}
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

      {/* ── Student list ───────────────────────────────────────────── */}
      <section className="animate-reveal space-y-2">
        {attendances.length === 0 && (
          <EmptyState
            icon="📝"
            title="Nenhum aluno nesta turma"
            description="Não há registros de presença para a turma e data selecionadas."
            variant="search"
          />
        )}
        {attendances.map((a) => {
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
        })}
      </section>

      {/* ── Save button ────────────────────────────────────────────── */}
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
    </div>
  );
}
