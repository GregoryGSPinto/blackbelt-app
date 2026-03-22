'use client';

import { useState, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────────
interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'aula' | 'graduacao' | 'evento' | 'competicao';
  turma?: string;
  horario?: string;
}

const EVENT_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  aula: { bg: 'var(--bb-brand-surface)', text: 'var(--bb-brand)', label: 'Aula' },
  graduacao: { bg: 'rgba(234,179,8,0.15)', text: '#eab308', label: 'Graduação' },
  evento: { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6', label: 'Evento' },
  competicao: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'Competição' },
};

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// ── Mock data ──────────────────────────────────────────────────────────
function generateMockEvents(year: number, month: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dow = new Date(year, month, d).getDay();

    // Aulas regulares: seg, qua, sex
    if (dow === 1 || dow === 3 || dow === 5) {
      events.push({ id: `aula-n-${d}`, date, title: 'BJJ Noite', type: 'aula', turma: 'BJJ Noite', horario: '18:00–19:30' });
      events.push({ id: `aula-m-${d}`, date, title: 'BJJ Manhã', type: 'aula', turma: 'BJJ Manhã', horario: '06:30–07:30' });
    }
    // Aula ter, qui
    if (dow === 2 || dow === 4) {
      events.push({ id: `aula-k-${d}`, date, title: 'Kids BJJ', type: 'aula', turma: 'Kids BJJ', horario: '14:00–15:00' });
    }
  }

  // Graduação no dia 15 (ou próximo dia útil)
  const gradDay = Math.min(15, daysInMonth);
  events.push({
    id: `grad-${month}`,
    date: `${year}-${String(month + 1).padStart(2, '0')}-${String(gradDay).padStart(2, '0')}`,
    title: 'Cerimônia de Graduação',
    type: 'graduacao',
    horario: '10:00–12:00',
  });

  // Evento no dia 22
  if (22 <= daysInMonth) {
    events.push({
      id: `evt-${month}`,
      date: `${year}-${String(month + 1).padStart(2, '0')}-22`,
      title: 'Seminário Técnico',
      type: 'evento',
      horario: '09:00–17:00',
    });
  }

  // Competição no dia 28
  if (28 <= daysInMonth) {
    events.push({
      id: `comp-${month}`,
      date: `${year}-${String(month + 1).padStart(2, '0')}-28`,
      title: 'Campeonato Regional',
      type: 'competicao',
      horario: '08:00–18:00',
    });
  }

  return events;
}

export default function ProfessorCalendarioPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('');

  const events = useMemo(() => generateMockEvents(year, month), [year, month]);

  const filteredEvents = useMemo(
    () => (filterType ? events.filter((e) => e.type === filterType) : events),
    [events, filterType],
  );

  // Calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    return days;
  }, [year, month]);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  function dateStr(day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function eventsForDay(day: number): CalendarEvent[] {
    const ds = dateStr(day);
    return filteredEvents.filter((e) => e.date === ds);
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  }

  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  const selectedEvents = selectedDate ? filteredEvents.filter((e) => e.date === selectedDate) : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
            Meu Calendário
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Aulas, graduações, eventos e competições
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg px-3 py-1.5 text-sm"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              color: 'var(--bb-ink-100)',
            }}
          >
            <option value="">Todos os tipos</option>
            <option value="aula">Aulas</option>
            <option value="graduacao">Graduações</option>
            <option value="evento">Eventos</option>
            <option value="competicao">Competições</option>
          </select>
          <button
            onClick={goToday}
            className="rounded-lg px-3 py-1.5 text-sm font-medium"
            style={{ background: 'var(--bb-brand)', color: '#fff' }}
          >
            Hoje
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(EVENT_STYLES).map(([type, style]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full" style={{ background: style.text }} />
            <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{style.label}</span>
          </div>
        ))}
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
          style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)' }}
        >
          ‹
        </button>
        <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          {MESES[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
          style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)' }}
        >
          ›
        </button>
      </div>

      {/* Calendar Grid */}
      <div
        className="overflow-hidden rounded-xl"
        style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
      >
        {/* Day headers */}
        <div className="grid grid-cols-7">
          {DIAS_SEMANA.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-medium"
              style={{ color: 'var(--bb-ink-40)', borderBottom: '1px solid var(--bb-glass-border)' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[100px]" style={{ background: 'var(--bb-depth-3)', borderBottom: '1px solid var(--bb-glass-border)', borderRight: '1px solid var(--bb-glass-border)' }} />;
            }
            const ds = dateStr(day);
            const dayEvents = eventsForDay(day);
            const isToday = ds === todayStr;
            const isSelected = ds === selectedDate;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(ds === selectedDate ? null : ds)}
                className="min-h-[80px] sm:min-h-[100px] p-1 text-left transition-colors"
                style={{
                  borderBottom: '1px solid var(--bb-glass-border)',
                  borderRight: '1px solid var(--bb-glass-border)',
                  background: isSelected ? 'var(--bb-brand-surface)' : 'transparent',
                }}
              >
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday ? 'text-white' : ''}`}
                  style={{
                    background: isToday ? 'var(--bb-brand)' : 'transparent',
                    color: isToday ? '#fff' : 'var(--bb-ink-100)',
                  }}
                >
                  {day}
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {dayEvents.slice(0, 3).map((ev) => {
                    const style = EVENT_STYLES[ev.type];
                    return (
                      <div
                        key={ev.id}
                        className="truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight"
                        style={{ background: style.bg, color: style.text }}
                      >
                        {ev.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedDate && (
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
        >
          <h3 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="mt-3 text-sm" style={{ color: 'var(--bb-ink-40)' }}>Nenhum evento neste dia.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {selectedEvents.map((ev) => {
                const style = EVENT_STYLES[ev.type];
                return (
                  <div
                    key={ev.id}
                    className="flex items-center gap-3 rounded-lg p-3"
                    style={{ background: style.bg }}
                  >
                    <div className="h-3 w-3 shrink-0 rounded-full" style={{ background: style.text }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold" style={{ color: style.text }}>{ev.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {ev.horario && (
                          <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{ev.horario}</span>
                        )}
                        {ev.turma && (
                          <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{ev.turma}</span>
                        )}
                      </div>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: style.text, color: '#fff' }}
                    >
                      {style.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
