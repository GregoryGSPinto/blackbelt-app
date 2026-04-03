'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getGrade } from '@/lib/api/horarios.service';
import type { WeeklyScheduleSlot } from '@/lib/api/horarios.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { Calendar } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────
interface AulaSlot {
  id: string;
  turma: string;
  professor: string;
  sala: string;
  modalidade: string;
  horaInicio: string;
  horaFim: string;
  dia: number; // 0=dom, 1=seg...
  experimental?: boolean;
}

const MODALIDADE_COLORS: Record<string, string> = {
  'BJJ': '#2563eb',
  'Muay Thai': '#ef4444',
  'Judô': '#eab308',
  'MMA': '#f97316',
  'Kids': '#22c55e',
  'Feminino': '#a855f7',
};

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function slotToAula(slot: WeeklyScheduleSlot, index: number): AulaSlot {
  return {
    id: `${slot.class_id}-${slot.day_of_week}-${index}`,
    turma: slot.modality_name,
    professor: slot.professor_name,
    sala: slot.unit_name,
    modalidade: slot.modality_name,
    horaInicio: slot.start_time,
    horaFim: slot.end_time,
    dia: slot.day_of_week,
  };
}

export default function RecepcaoAgendaPage() {
  useTheme();
  const [aulas, setAulas] = useState<AulaSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<AulaSlot | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const grade = await getGrade(getActiveAcademyId());
        setAulas(grade.slots.map((s, i) => slotToAula(s, i)));
      } catch {
        setAulas([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Get unique time slots sorted
  const horarios = useMemo(() => {
    const times = [...new Set(aulas.map((a) => a.horaInicio))];
    return times.sort();
  }, [aulas]);

  // Get the dates for the current week
  const weekDates = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  }, []);

  function getAula(dia: number, horario: string): AulaSlot | undefined {
    return aulas.find((a) => a.dia === dia && a.horaInicio === horario);
  }

  // Map 0-indexed week array to actual day number (1=seg, 2=ter, ..., 0=dom)
  const dayMapping = [1, 2, 3, 4, 5, 6, 0]; // seg, ter, qua, qui, sex, sab, dom

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Agenda Semanal</h1>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(MODALIDADE_COLORS).map(([mod, color]) => (
          <div key={mod} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full" style={{ background: color }} />
            <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{mod}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full border-2 border-dashed" style={{ borderColor: '#2563eb' }} />
          <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Experimental</span>
        </div>
      </div>

      {/* Empty state */}
      {aulas.length === 0 && (
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title="Nenhuma aula na agenda"
          description="A grade semanal ainda não possui aulas cadastradas. Cadastre turmas e horários para visualizar a agenda."
          variant="first-time"
        />
      )}

      {/* Calendar grid */}
      {aulas.length > 0 && <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="w-20 p-2 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Horário</th>
              {weekDates.map((date, i) => (
                <th key={i} className="p-2 text-center text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  <div>{DIAS[dayMapping[i]]}</div>
                  <div className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>{date.getDate()}/{date.getMonth() + 1}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horarios.map((horario) => (
              <tr key={horario}>
                <td className="p-2 text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>{horario}</td>
                {dayMapping.map((dia, i) => {
                  const aula = getAula(dia, horario);
                  if (!aula) {
                    return <td key={i} className="p-1"><div className="h-16 rounded-lg" style={{ background: 'var(--bb-depth-3)' }} /></td>;
                  }
                  const color = MODALIDADE_COLORS[aula.modalidade] || 'var(--bb-brand)';
                  return (
                    <td key={i} className="p-1">
                      <button
                        onClick={() => setSelectedSlot(aula)}
                        className="h-16 w-full rounded-lg p-1.5 text-left transition-transform hover:scale-[1.02]"
                        style={{
                          background: `${color}20`,
                          border: aula.experimental ? `2px dashed ${color}` : `1px solid ${color}40`,
                        }}
                      >
                        <p className="truncate text-[11px] font-semibold" style={{ color }}>{aula.turma}</p>
                        <p className="truncate text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>{aula.professor}</p>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>}

      {/* Slot detail modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setSelectedSlot(null)}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--bb-depth-3)' }} onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ background: MODALIDADE_COLORS[selectedSlot.modalidade] || 'var(--bb-brand)' }} />
              <h3 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{selectedSlot.turma}</h3>
            </div>
            {selectedSlot.experimental && (
              <span className="mb-3 inline-block rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: '#2563eb20', color: '#2563eb' }}>
                Aula Experimental
              </span>
            )}
            <div className="space-y-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
              <p>Professor: {selectedSlot.professor}</p>
              <p>Sala: {selectedSlot.sala}</p>
              <p>Horário: {selectedSlot.horaInicio} — {selectedSlot.horaFim}</p>
              <p>Dia: {DIAS[selectedSlot.dia]}</p>
            </div>
            <button
              onClick={() => setSelectedSlot(null)}
              className="mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium"
              style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
