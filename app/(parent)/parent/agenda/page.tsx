'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ── Mock Data ──────────────────────────────────────────────────────

interface ChildClass {
  id: string;
  childName: string;
  childColor: string;
  className: string;
  professor: string;
  dayOfWeek: number; // 0=dom...6=sab
  startTime: string;
  endTime: string;
  modality: string;
}

const MOCK_CLASSES: ChildClass[] = [
  { id: 'c1', childName: 'Sophia', childColor: '#f59e0b', className: 'BJJ Teen Avançado', professor: 'Prof. André', dayOfWeek: 1, startTime: '16:00', endTime: '17:30', modality: 'Jiu-Jitsu' },
  { id: 'c2', childName: 'Sophia', childColor: '#f59e0b', className: 'BJJ Teen Avançado', professor: 'Prof. André', dayOfWeek: 3, startTime: '16:00', endTime: '17:30', modality: 'Jiu-Jitsu' },
  { id: 'c3', childName: 'Sophia', childColor: '#f59e0b', className: 'BJJ Teen Avançado', professor: 'Prof. André', dayOfWeek: 5, startTime: '16:00', endTime: '17:30', modality: 'Jiu-Jitsu' },
  { id: 'c4', childName: 'Helena', childColor: '#3b82f6', className: 'BJJ Kids', professor: 'Prof. Fernanda', dayOfWeek: 2, startTime: '15:00', endTime: '16:00', modality: 'Jiu-Jitsu' },
  { id: 'c5', childName: 'Helena', childColor: '#3b82f6', className: 'BJJ Kids', professor: 'Prof. Fernanda', dayOfWeek: 4, startTime: '15:00', endTime: '16:00', modality: 'Jiu-Jitsu' },
  { id: 'c6', childName: 'Helena', childColor: '#3b82f6', className: 'Judô Kids', professor: 'Prof. Rafael', dayOfWeek: 6, startTime: '10:00', endTime: '11:00', modality: 'Judô' },
];

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_NAMES_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// ── Helpers ──────────────────────────────────────────────────────

function getWeekDates(offset: number): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1 + offset * 7);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}

// ── Page ──────────────────────────────────────────────────────

export default function ParentAgendaPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [filterChild, setFilterChild] = useState('all');
  const [view, setView] = useState<'week' | 'month'>('week');

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const children = useMemo(() => {
    const map = new Map<string, string>();
    MOCK_CLASSES.forEach((c) => map.set(c.childName, c.childColor));
    return Array.from(map.entries()).map(([name, color]) => ({ name, color }));
  }, []);

  const filteredClasses = useMemo(() => {
    if (filterChild === 'all') return MOCK_CLASSES;
    return MOCK_CLASSES.filter((c) => c.childName === filterChild);
  }, [filterChild]);

  const weekLabel = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} – ${end.getDate()} de ${MONTH_NAMES[start.getMonth()]}`;
    }
    return `${start.getDate()} ${MONTH_NAMES[start.getMonth()].slice(0, 3)} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()].slice(0, 3)}`;
  }, [weekDates]);

  // ── Monthly view helpers ──

  const monthDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + weekOffset);
    return d;
  }, [weekOffset]);

  const monthDays = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [monthDate]);

  function getClassesForDayOfWeek(dow: number) {
    return filteredClasses.filter((c) => c.dayOfWeek === dow);
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Agenda</h1>
          <p className="text-sm" style={{ color: 'var(--bb-ink-50)' }}>Aulas de todos os filhos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('week')}
            className="rounded-lg px-3 py-1.5 text-sm font-medium"
            style={{
              background: view === 'week' ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
              color: view === 'week' ? '#fff' : 'var(--bb-ink-60)',
            }}
          >
            Semana
          </button>
          <button
            onClick={() => setView('month')}
            className="rounded-lg px-3 py-1.5 text-sm font-medium"
            style={{
              background: view === 'month' ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
              color: view === 'month' ? '#fff' : 'var(--bb-ink-60)',
            }}
          >
            Mês
          </button>
        </div>
      </div>

      {/* Child filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterChild('all')}
          className="rounded-full px-3 py-1.5 text-xs font-medium"
          style={{
            background: filterChild === 'all' ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
            color: filterChild === 'all' ? '#fff' : 'var(--bb-ink-60)',
          }}
        >
          Todos
        </button>
        {children.map((c) => (
          <button
            key={c.name}
            onClick={() => setFilterChild(c.name)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              background: filterChild === c.name ? c.color : 'var(--bb-depth-3)',
              color: filterChild === c.name ? '#fff' : 'var(--bb-ink-60)',
            }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: filterChild === c.name ? '#fff' : c.color }} />
            {c.name}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setWeekOffset((o) => o - 1)} className="rounded-lg p-2" style={{ background: 'var(--bb-depth-2)' }}>
          <ChevronLeft className="h-5 w-5" style={{ color: 'var(--bb-ink-60)' }} />
        </button>
        <div className="text-center">
          <p className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
            {view === 'week' ? weekLabel : `${MONTH_NAMES[monthDate.getMonth()]} ${monthDate.getFullYear()}`}
          </p>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="mt-0.5 text-xs font-medium" style={{ color: 'var(--bb-brand)' }}>
              Voltar para hoje
            </button>
          )}
        </div>
        <button onClick={() => setWeekOffset((o) => o + 1)} className="rounded-lg p-2" style={{ background: 'var(--bb-depth-2)' }}>
          <ChevronRight className="h-5 w-5" style={{ color: 'var(--bb-ink-60)' }} />
        </button>
      </div>

      {/* Week View */}
      {view === 'week' && (
        <div className="space-y-2">
          {weekDates.map((date, idx) => {
            const dow = date.getDay();
            const classes = getClassesForDayOfWeek(dow);
            const today = isToday(date);

            return (
              <div
                key={idx}
                className="rounded-lg p-3"
                style={{
                  background: today ? 'var(--bb-brand-surface, rgba(239,68,68,0.06))' : 'var(--bb-depth-2)',
                  border: today ? '1px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
                }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: today ? 'var(--bb-brand)' : 'var(--bb-ink-60)' }}>
                    {DAY_NAMES_FULL[dow]}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    {date.getDate()}/{date.getMonth() + 1}
                  </span>
                  {today && (
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: 'var(--bb-brand)', color: '#fff' }}>
                      Hoje
                    </span>
                  )}
                </div>

                {classes.length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--bb-ink-30)' }}>Sem aulas</p>
                ) : (
                  <div className="space-y-2">
                    {classes.map((cls) => (
                      <div
                        key={cls.id}
                        className="flex items-center gap-3 rounded-lg px-3 py-2"
                        style={{ background: 'var(--bb-depth-1)', borderLeft: `3px solid ${cls.childColor}` }}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{cls.className}</p>
                          <p className="text-xs" style={{ color: 'var(--bb-ink-50)' }}>
                            {cls.startTime} – {cls.endTime} · {cls.professor}
                          </p>
                        </div>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ background: `${cls.childColor}20`, color: cls.childColor }}
                        >
                          {cls.childName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Month View */}
      {view === 'month' && (
        <div>
          <div className="mb-2 grid grid-cols-7 gap-1">
            {DAY_NAMES.map((d) => (
              <div key={d} className="py-1 text-center text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />;
              const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
              const dow = date.getDay();
              const classes = getClassesForDayOfWeek(dow);
              const today = isToday(date);

              return (
                <div
                  key={day}
                  className="min-h-[60px] rounded-lg p-1"
                  style={{
                    background: today ? 'var(--bb-brand-surface, rgba(239,68,68,0.06))' : 'var(--bb-depth-2)',
                    border: today ? '1px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
                  }}
                >
                  <p className="text-xs font-medium" style={{ color: today ? 'var(--bb-brand)' : 'var(--bb-ink-60)' }}>
                    {day}
                  </p>
                  <div className="mt-0.5 space-y-0.5">
                    {classes.map((cls) => (
                      <div
                        key={cls.id}
                        className="truncate rounded px-1 py-0.5 text-[10px]"
                        style={{ background: `${cls.childColor}20`, color: cls.childColor }}
                        title={`${cls.childName}: ${cls.className} ${cls.startTime}`}
                      >
                        {cls.childName.charAt(0)} {cls.startTime}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 rounded-lg p-3" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-50)' }}>Legenda:</span>
        {children.map((c) => (
          <div key={c.name} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
            <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
