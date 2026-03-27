'use client';

import { forwardRef, useState, useEffect } from 'react';
import { isMock } from '@/lib/env';

// ── Types ──────────────────────────────────────────────────────────────

export type TimelineEventType = 'matricula' | 'presenca' | 'graduacao' | 'pagamento' | 'competicao' | 'comunicado' | 'nota_professor' | 'troca_turma';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
}

interface StudentTimelineProps {
  studentId: string;
  limit?: number;
}

// ── Constants ──────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<TimelineEventType, { icon: string; color: string }> = {
  matricula: { icon: '📝', color: 'var(--bb-brand)' },
  presenca: { icon: '✅', color: '#16a34a' },
  graduacao: { icon: '🥋', color: '#9333ea' },
  pagamento: { icon: '💰', color: '#eab308' },
  competicao: { icon: '🏆', color: '#ea580c' },
  comunicado: { icon: '📢', color: '#2563eb' },
  nota_professor: { icon: '👨‍🏫', color: '#0891b2' },
  troca_turma: { icon: '🔄', color: '#6366f1' },
};

const FILTER_OPTIONS: { value: TimelineEventType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'presenca', label: 'Presenca' },
  { value: 'graduacao', label: 'Graduacao' },
  { value: 'pagamento', label: 'Pagamento' },
  { value: 'competicao', label: 'Competicao' },
  { value: 'nota_professor', label: 'Professor' },
];

// ── Mock Data ──────────────────────────────────────────────────────────

function getMockTimeline(_studentId: string): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { id: 't-1', type: 'matricula' as const, date: '2025-01-15', title: 'Matricula realizada', description: 'BJJ Kids — Turma Seg/Qua 16h', icon: '📝', color: 'var(--bb-brand)' },
    { id: 't-2', type: 'presenca' as const, date: '2025-02-01', title: '8 presencas em Fevereiro', description: 'Frequencia: 80%', icon: '✅', color: '#16a34a' },
    { id: 't-3', type: 'graduacao' as const, date: '2025-03-10', title: 'Graduacao: Faixa Cinza', description: 'Promovido pelo Prof. Carlos', icon: '🥋', color: '#9333ea' },
    { id: 't-4', type: 'pagamento' as const, date: '2025-03-08', title: 'Pagamento recebido — R$ 149', description: 'Ref: Marco/2025', icon: '💰', color: '#eab308' },
    { id: 't-5', type: 'presenca' as const, date: '2025-03-31', title: '10 presencas em Marco', description: 'Frequencia: 100%', icon: '✅', color: '#16a34a' },
    { id: 't-6', type: 'nota_professor' as const, date: '2025-04-05', title: 'Nota do professor', description: 'Excelente evolucao nas tecnicas de guarda. Parabens!', icon: '👨‍🏫', color: '#0891b2' },
    { id: 't-7', type: 'competicao' as const, date: '2025-04-20', title: 'Campeonato Regional Kids', description: 'Medalha de ouro — categoria -30kg', icon: '🏆', color: '#ea580c' },
    { id: 't-8', type: 'pagamento' as const, date: '2025-04-10', title: 'Pagamento recebido — R$ 149', description: 'Ref: Abril/2025', icon: '💰', color: '#eab308' },
    { id: 't-9', type: 'troca_turma' as const, date: '2025-05-01', title: 'Troca de turma', description: 'De Seg/Qua 16h para Ter/Qui 17h', icon: '🔄', color: '#6366f1' },
    { id: 't-10', type: 'graduacao' as const, date: '2025-06-15', title: 'Graduacao: Faixa Amarela', description: 'Promovido pelo Prof. Carlos', icon: '🥋', color: '#9333ea' },
  ];
  return events.reverse(); // Most recent first
}

// ── Component ──────────────────────────────────────────────────────────

const StudentTimeline = forwardRef<HTMLDivElement, StudentTimelineProps>(
  function StudentTimeline({ studentId, limit }, ref) {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [filter, setFilter] = useState<TimelineEventType | 'all'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          if (isMock()) {
            const mock = getMockTimeline(studentId);
            if (!cancelled) setEvents(mock);
          } else {
            const { createBrowserClient } = await import('@/lib/supabase/client');
            const supabase = createBrowserClient();
            // Real implementation: query timeline events from multiple tables
            const { data } = await supabase
              .from('student_timeline')
              .select('*')
              .eq('student_id', studentId)
              .order('date', { ascending: false })
              .limit(limit ?? 50);
            if (!cancelled && data) {
              setEvents(data.map((row: Record<string, unknown>) => ({
                id: row.id as string,
                type: row.event_type as TimelineEventType,
                date: row.date as string,
                title: row.title as string,
                description: (row.description as string) ?? undefined,
                icon: TYPE_CONFIG[row.event_type as TimelineEventType]?.icon ?? '📋',
                color: TYPE_CONFIG[row.event_type as TimelineEventType]?.color ?? 'var(--bb-ink-60)',
              })));
            }
          }
        } catch {
          if (!cancelled) setEvents(getMockTimeline(studentId));
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, [studentId, limit]);

    const filtered = filter === 'all' ? events : events.filter((e) => e.type === filter);

    if (loading) {
      return (
        <div ref={ref} className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg" style={{ background: 'var(--bb-depth-3)' }} />
          ))}
        </div>
      );
    }

    return (
      <div ref={ref} className="flex flex-col gap-4">
        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all"
              style={{
                background: filter === opt.value ? 'var(--bb-brand)' : 'var(--bb-depth-2)',
                color: filter === opt.value ? '#fff' : 'var(--bb-ink-60)',
                border: filter === opt.value ? '1px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Nenhum evento encontrado
          </p>
        ) : (
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-3 top-0 h-full w-px" style={{ background: 'var(--bb-glass-border)' }} />

            {filtered.map((event) => (
              <div key={event.id} className="relative mb-4 flex gap-3">
                {/* Dot */}
                <div
                  className="absolute -left-5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
                  style={{ background: 'var(--bb-depth-1)', border: `2px solid ${event.color}` }}
                >
                  {event.icon}
                </div>

                {/* Content */}
                <div className="flex-1 rounded-lg p-3" style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{event.title}</p>
                    <span className="shrink-0 text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                      {new Date(event.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {event.description && (
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

StudentTimeline.displayName = 'StudentTimeline';

export { StudentTimeline };
export type { StudentTimelineProps };
