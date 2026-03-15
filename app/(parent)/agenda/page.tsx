'use client';

import { useState, useEffect } from 'react';
import { getFamilyCalendar, getMonthlyReport } from '@/lib/api/agenda-familiar.service';
import type {
  FamilyCalendarDTO,
  FamilyCalendarEventDTO,
  MonthlyReportDTO,
} from '@/lib/api/agenda-familiar.service';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;

const STATUS_COLORS: Record<string, string> = {
  em_dia: 'text-bb-success',
  pendente: 'text-bb-warning',
  atrasado: 'text-bb-error',
};

const STATUS_LABELS: Record<string, string> = {
  em_dia: 'Em dia',
  pendente: 'Pendente',
  atrasado: 'Atrasado',
};

// ────────────────────────────────────────────────────────────
// Group events by day_of_week (1=Seg ... 7=Dom)
// ────────────────────────────────────────────────────────────

function groupByDay(events: FamilyCalendarEventDTO[]): Map<number, FamilyCalendarEventDTO[]> {
  const map = new Map<number, FamilyCalendarEventDTO[]>();
  for (const ev of events) {
    const existing = map.get(ev.day_of_week) ?? [];
    existing.push(ev);
    map.set(ev.day_of_week, existing);
  }
  return map;
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

export default function AgendaFamiliarPage() {
  const [calendar, setCalendar] = useState<FamilyCalendarDTO | null>(null);
  const [report, setReport] = useState<MonthlyReportDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [cal, rep] = await Promise.all([
          getFamilyCalendar('prof-guardian-1'),
          getMonthlyReport('prof-guardian-1', '2026-03'),
        ]);
        setCalendar(cal);
        setReport(rep);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bb-gray-50 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton variant="card" className="h-16" />
          <Skeleton variant="card" className="h-72" />
          <Skeleton variant="card" className="h-48" />
        </div>
      </div>
    );
  }

  if (!calendar || !report) return null;

  const grouped = groupByDay(calendar.events);

  return (
    <div className="min-h-screen bg-bb-gray-50 pb-24">
      <div className="mx-auto max-w-lg px-4 pt-6">
        {/* Header */}
        <h1 className="text-xl font-bold text-bb-gray-900">Agenda Familiar</h1>
        <p className="text-sm text-bb-gray-500">
          Semana {new Date(calendar.week_start).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} —{' '}
          {new Date(calendar.week_end).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
        </p>

        {/* ─── WEEKLY CALENDAR ─── */}
        <section className="mt-5">
          <Card className="overflow-hidden p-0">
            {WEEKDAYS.map((day, idx) => {
              const dayNum = idx + 1;
              const events = grouped.get(dayNum) ?? [];
              const isToday = dayNum === new Date().getDay() || (dayNum === 7 && new Date().getDay() === 0);

              return (
                <div
                  key={day}
                  className={`flex items-start border-b border-bb-gray-100 last:border-b-0 ${
                    isToday ? 'bg-bb-red-500/5' : ''
                  }`}
                >
                  {/* Day label */}
                  <div
                    className={`flex w-14 flex-shrink-0 items-center justify-center self-stretch border-r border-bb-gray-100 py-3 text-sm font-bold ${
                      isToday ? 'text-bb-red-500' : 'text-bb-gray-500'
                    }`}
                  >
                    {day}
                  </div>

                  {/* Events */}
                  <div className="flex-1 px-3 py-2">
                    {events.length === 0 ? (
                      <p className="py-1 text-xs text-bb-gray-400">—</p>
                    ) : (
                      <div className="space-y-1">
                        {events.map((ev) => (
                          <div key={ev.id} className="flex items-center gap-2">
                            <div
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: ev.color }}
                            />
                            <Avatar name={ev.child_name} size="sm" />
                            <span className="text-xs font-medium text-bb-gray-900">
                              {ev.child_name}
                            </span>
                            <span className="text-xs text-bb-gray-500">
                              {ev.class_name}
                            </span>
                            <span className="ml-auto text-xs font-semibold text-bb-gray-700">
                              {ev.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        </section>

        {/* ─── MONTHLY REPORT TOGGLE ─── */}
        <section className="mt-6">
          <button
            onClick={() => setShowReport(!showReport)}
            className="w-full rounded-xl bg-bb-gray-900 px-5 py-3 text-center text-sm font-bold text-white shadow-md transition-all hover:bg-bb-gray-800"
          >
            {showReport ? 'Ocultar' : 'Ver'} Relatório Mensal — {report.month_label}
          </button>

          {showReport && (
            <div className="mt-4 space-y-4">
              {/* Report Header */}
              <Card className="bg-gradient-to-br from-bb-gray-900 to-bb-gray-700 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-bb-gray-400">
                  Relatório Mensal
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-white">
                  {report.month_label}
                </h2>
                <p className="mt-2 text-2xl font-extrabold text-bb-white">
                  R${report.total_paid}
                </p>
                <p className="text-xs text-bb-gray-400">Total investido no mês</p>
              </Card>

              {/* Per-child summaries */}
              {report.children.map((child) => (
                <Card key={child.student_id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={child.display_name} size="md" />
                    <div>
                      <h3 className="text-sm font-bold text-bb-gray-900">{child.display_name}</h3>
                      <p className="text-xs text-bb-gray-500">{child.belt_current}</p>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-bb-gray-50 p-2 text-center">
                      <p className="text-lg font-extrabold text-bb-gray-900">
                        {child.attendance_percent}%
                      </p>
                      <p className="text-[10px] text-bb-gray-500">Frequência</p>
                    </div>
                    <div className="rounded-lg bg-bb-gray-50 p-2 text-center">
                      <p className="text-lg font-extrabold text-bb-gray-900">
                        {child.attendance_count}/{child.attendance_total}
                      </p>
                      <p className="text-[10px] text-bb-gray-500">Aulas</p>
                    </div>
                    <div className="rounded-lg bg-bb-gray-50 p-2 text-center">
                      <p className="text-lg font-extrabold text-bb-gray-900">
                        {child.achievements_count}
                      </p>
                      <p className="text-[10px] text-bb-gray-500">Conquistas</p>
                    </div>
                  </div>

                  {/* XP gained (if applicable) */}
                  {child.xp_gained > 0 && (
                    <p className="mt-2 text-xs text-bb-gray-500">
                      +{child.xp_gained} XP ganhos no mês
                    </p>
                  )}

                  {/* Highlights */}
                  {child.highlights.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-bb-gray-400">
                        Destaques
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {child.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-bb-gray-700">
                            <span className="mt-0.5 text-bb-success">●</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}

              {/* Payment summary */}
              <Card className="p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-bb-gray-500">
                  Pagamentos
                </p>
                <div className="space-y-2">
                  {report.payments.map((pay) => (
                    <div
                      key={pay.child_name}
                      className="flex items-center justify-between rounded-lg bg-bb-gray-50 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-bb-gray-900">
                          {pay.child_name} — {pay.plan_name}
                        </p>
                        <p className="text-xs text-bb-gray-500">R${pay.amount}/mês</p>
                      </div>
                      <span className={`text-xs font-bold ${STATUS_COLORS[pay.status] ?? ''}`}>
                        {STATUS_LABELS[pay.status] ?? pay.status}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-bb-gray-200 pt-3">
                  <span className="text-sm font-bold text-bb-gray-900">Total</span>
                  <span className="text-lg font-extrabold text-bb-gray-900">
                    R${report.total_paid}/mês
                  </span>
                </div>
              </Card>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
