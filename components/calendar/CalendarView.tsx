'use client';

import { forwardRef, useState, useEffect, useCallback, useMemo } from 'react';
import { getCalendarEvents, type CalendarEvent } from '@/lib/api/calendar.service';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

// ── Types ──────────────────────────────────────────────────────────────

type ViewMode = 'week' | 'month';

interface CalendarViewProps {
  academyId: string;
  professorId?: string;
  title?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const WEEKDAYS_FULL = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date): Date {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  return d;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function isSameDay(a: string, b: string): boolean {
  return a === b;
}

function isToday(dateStr: string): boolean {
  return dateStr === formatDate(new Date());
}

function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function getMonthGrid(date: Date): Date[][] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDate = startOfWeek(firstDay);
  const weeks: Date[][] = [];
  const current = new Date(startDate);

  while (current <= lastDay || current.getDay() !== 0) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
    if (weeks.length >= 6) break;
  }

  return weeks;
}

const TYPE_LABELS: Record<string, string> = {
  class: 'Aula',
  competition: 'Campeonato',
  holiday: 'Feriado',
  graduation: 'Graduacao',
  event: 'Evento',
};

// ── Component ──────────────────────────────────────────────────────────

const CalendarView = forwardRef<HTMLDivElement, CalendarViewProps>(
  function CalendarView({ academyId, professorId, title = 'Calendario' }, ref) {
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [modalityFilter, setModalityFilter] = useState<string>('');

    // ── Date range ───────────────────────────────────────────────────

    const dateRange = useMemo(() => {
      if (viewMode === 'week') {
        const start = startOfWeek(currentDate);
        const end = endOfWeek(currentDate);
        return { from: formatDate(start), to: formatDate(end) };
      }
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      // Extend to cover visible cells
      const gridStart = startOfWeek(start);
      const gridEndDate = new Date(end);
      gridEndDate.setDate(end.getDate() + (6 - end.getDay()));
      return { from: formatDate(gridStart), to: formatDate(gridEndDate) };
    }, [viewMode, currentDate]);

    // ── Fetch events ─────────────────────────────────────────────────

    const fetchEvents = useCallback(async () => {
      setLoading(true);
      try {
        const data = await getCalendarEvents(academyId, {
          from: dateRange.from,
          to: dateRange.to,
          professorId,
          modality: modalityFilter || undefined,
        });
        setEvents(data);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }, [academyId, dateRange, professorId, modalityFilter]);

    useEffect(() => {
      fetchEvents();
    }, [fetchEvents]);

    // ── Navigation ───────────────────────────────────────────────────

    function navigate(direction: -1 | 1) {
      const d = new Date(currentDate);
      if (viewMode === 'week') {
        d.setDate(d.getDate() + direction * 7);
      } else {
        d.setMonth(d.getMonth() + direction);
      }
      setCurrentDate(d);
    }

    function goToday() {
      setCurrentDate(new Date());
    }

    // ── Events for a given date ──────────────────────────────────────

    function eventsForDate(dateStr: string): CalendarEvent[] {
      return events.filter((e) => isSameDay(e.date, dateStr));
    }

    // ── Header label ─────────────────────────────────────────────────

    const headerLabel = useMemo(() => {
      if (viewMode === 'week') {
        const start = startOfWeek(currentDate);
        const end = endOfWeek(currentDate);
        const sMonth = MONTHS[start.getMonth()];
        const eMonth = MONTHS[end.getMonth()];
        if (start.getMonth() === end.getMonth()) {
          return `${start.getDate()} - ${end.getDate()} ${sMonth} ${start.getFullYear()}`;
        }
        return `${start.getDate()} ${sMonth} - ${end.getDate()} ${eMonth} ${end.getFullYear()}`;
      }
      return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }, [viewMode, currentDate]);

    // ── Modalities from events ───────────────────────────────────────

    const modalities = useMemo(() => {
      const set = new Set<string>();
      events.forEach((e) => {
        if (e.modality) set.add(e.modality);
      });
      return Array.from(set).sort();
    }, [events]);

    // ── Skeleton loading ─────────────────────────────────────────────

    if (loading && events.length === 0) {
      return (
        <div ref={ref} className="space-y-4 p-6">
          <Skeleton variant="text" className="h-8 w-48" />
          <Skeleton variant="card" className="h-16" />
          <Skeleton variant="card" className="h-96" />
        </div>
      );
    }

    return (
      <div ref={ref} className="space-y-6 p-6">
        {/* Title */}
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          {title}
        </h1>

        {/* Controls */}
        <Card className="flex flex-wrap items-center gap-3 p-4">
          {/* View mode toggle */}
          <div
            className="flex overflow-hidden"
            style={{
              borderRadius: 'var(--bb-radius-sm)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            {(['week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="px-3 py-1.5 text-sm font-medium transition-colors"
                style={{
                  background: viewMode === mode ? 'var(--bb-brand)' : 'transparent',
                  color: viewMode === mode ? '#fff' : 'var(--bb-ink-60)',
                }}
              >
                {mode === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex h-8 w-8 items-center justify-center transition-colors"
              style={{
                borderRadius: 'var(--bb-radius-sm)',
                background: 'var(--bb-depth-4)',
                color: 'var(--bb-ink-60)',
              }}
              aria-label="Anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={goToday}
              className="px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                borderRadius: 'var(--bb-radius-sm)',
                background: 'var(--bb-depth-4)',
                color: 'var(--bb-ink-80)',
              }}
            >
              Hoje
            </button>
            <button
              onClick={() => navigate(1)}
              className="flex h-8 w-8 items-center justify-center transition-colors"
              style={{
                borderRadius: 'var(--bb-radius-sm)',
                background: 'var(--bb-depth-4)',
                color: 'var(--bb-ink-60)',
              }}
              aria-label="Proximo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            {headerLabel}
          </span>

          {/* Modality filter */}
          <div className="ml-auto">
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              className="px-3 py-1.5 text-sm"
              style={{
                borderRadius: 'var(--bb-radius-sm)',
                background: 'var(--bb-depth-4)',
                color: 'var(--bb-ink-80)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              <option value="">Todas Modalidades</option>
              {modalities.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Calendar Grid - Desktop */}
        <div className="hidden md:block">
          {viewMode === 'week' ? (
            <WeekView
              currentDate={currentDate}
              events={events}
              eventsForDate={eventsForDate}
              onSelectEvent={setSelectedEvent}
            />
          ) : (
            <MonthView
              currentDate={currentDate}
              events={events}
              eventsForDate={eventsForDate}
              onSelectEvent={setSelectedEvent}
            />
          )}
        </div>

        {/* Calendar List - Mobile */}
        <div className="md:hidden">
          <MobileListView
            currentDate={currentDate}
            viewMode={viewMode}
            events={events}
            onSelectEvent={setSelectedEvent}
          />
        </div>

        {/* Event Detail Modal */}
        <Modal
          open={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent?.title}
        >
          {selectedEvent && (
            <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          )}
        </Modal>
      </div>
    );
  },
);

CalendarView.displayName = 'CalendarView';

// ── Week View (Desktop) ────────────────────────────────────────────────

function WeekView({
  currentDate,
  events: _events,
  eventsForDate,
  onSelectEvent,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  eventsForDate: (d: string) => CalendarEvent[];
  onSelectEvent: (e: CalendarEvent) => void;
}) {
  const days = getWeekDays(currentDate);

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
        {days.map((day, i) => {
          const dateStr = formatDate(day);
          const today = isToday(dateStr);
          return (
            <div
              key={i}
              className="px-2 py-3 text-center"
              style={{
                borderRight: i < 6 ? '1px solid var(--bb-glass-border)' : undefined,
                background: today ? 'var(--bb-brand-surface)' : 'transparent',
              }}
            >
              <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                {WEEKDAYS[day.getDay()]}
              </span>
              <br />
              <span
                className="inline-flex h-7 w-7 items-center justify-center text-sm font-bold"
                style={{
                  borderRadius: '50%',
                  ...(today
                    ? { background: 'var(--bb-brand)', color: '#fff' }
                    : { color: 'var(--bb-ink-100)' }),
                }}
              >
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7" style={{ minHeight: '20rem' }}>
        {days.map((day, i) => {
          const dateStr = formatDate(day);
          const dayEvents = eventsForDate(dateStr);
          return (
            <div
              key={i}
              className="p-1"
              style={{
                borderRight: i < 6 ? '1px solid var(--bb-glass-border)' : undefined,
              }}
            >
              <div className="space-y-1" data-stagger>
                {dayEvents.slice(0, 6).map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className="animate-reveal w-full truncate px-1.5 py-1 text-left text-[11px] font-medium transition-opacity hover:opacity-80"
                    style={{
                      borderRadius: 'var(--bb-radius-sm)',
                      background: evt.color + '20',
                      color: evt.color,
                      borderLeft: `3px solid ${evt.color}`,
                    }}
                    title={`${evt.startTime} ${evt.title}`}
                  >
                    <span className="font-semibold">{evt.startTime}</span>{' '}
                    {evt.title}
                  </button>
                ))}
                {dayEvents.length > 6 && (
                  <span className="block px-1 text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>
                    +{dayEvents.length - 6} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Month View (Desktop) ───────────────────────────────────────────────

function MonthView({
  currentDate,
  events: _events,
  eventsForDate,
  onSelectEvent,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  eventsForDate: (d: string) => CalendarEvent[];
  onSelectEvent: (e: CalendarEvent) => void;
}) {
  const weeks = getMonthGrid(currentDate);
  const currentMonth = currentDate.getMonth();

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-xs font-medium"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      {weeks.map((week, wIdx) => (
        <div
          key={wIdx}
          className="grid grid-cols-7"
          style={{ borderBottom: wIdx < weeks.length - 1 ? '1px solid var(--bb-glass-border)' : undefined }}
        >
          {week.map((day, dIdx) => {
            const dateStr = formatDate(day);
            const dayEvents = eventsForDate(dateStr);
            const today = isToday(dateStr);
            const isCurrentMonth = day.getMonth() === currentMonth;

            return (
              <div
                key={dIdx}
                className="min-h-[5.5rem] p-1"
                style={{
                  borderRight: dIdx < 6 ? '1px solid var(--bb-glass-border)' : undefined,
                  opacity: isCurrentMonth ? 1 : 0.4,
                  background: today ? 'var(--bb-brand-surface)' : 'transparent',
                }}
              >
                <span
                  className="mb-1 inline-flex h-6 w-6 items-center justify-center text-xs font-semibold"
                  style={{
                    borderRadius: '50%',
                    ...(today
                      ? { background: 'var(--bb-brand)', color: '#fff' }
                      : { color: 'var(--bb-ink-80)' }),
                  }}
                >
                  {day.getDate()}
                </span>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((evt) => (
                    <button
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      className="w-full truncate px-1 py-0.5 text-left text-[10px] font-medium transition-opacity hover:opacity-80"
                      style={{
                        borderRadius: '2px',
                        background: evt.color + '20',
                        color: evt.color,
                      }}
                      title={`${evt.startTime} ${evt.title}`}
                    >
                      {evt.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="block px-1 text-[9px]" style={{ color: 'var(--bb-ink-60)' }}>
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </Card>
  );
}

// ── Mobile List View ───────────────────────────────────────────────────

function MobileListView({
  currentDate,
  viewMode,
  events,
  onSelectEvent,
}: {
  currentDate: Date;
  viewMode: ViewMode;
  events: CalendarEvent[];
  onSelectEvent: (e: CalendarEvent) => void;
}) {
  // Group events by date
  const grouped = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    const sorted = [...events].sort((a, b) => {
      const dc = a.date.localeCompare(b.date);
      if (dc !== 0) return dc;
      return a.startTime.localeCompare(b.startTime);
    });

    for (const evt of sorted) {
      const list = map.get(evt.date) ?? [];
      list.push(evt);
      map.set(evt.date, list);
    }

    // Only show dates in the current view range
    let days: Date[];
    if (viewMode === 'week') {
      days = getWeekDays(currentDate);
    } else {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate();
      days = Array.from({ length: lastDay }, (_, i) => new Date(year, month, i + 1));
    }

    return days
      .map((d) => ({
        date: d,
        dateStr: formatDate(d),
        events: map.get(formatDate(d)) ?? [],
      }))
      .filter((g) => g.events.length > 0);
  }, [events, currentDate, viewMode]);

  if (grouped.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Nenhum evento neste periodo
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-stagger>
      {grouped.map((group) => (
        <Card key={group.dateStr} className="animate-reveal overflow-hidden p-0">
          <div
            className="px-4 py-2"
            style={{
              background: isToday(group.dateStr) ? 'var(--bb-brand-surface)' : 'var(--bb-depth-4)',
              borderBottom: '1px solid var(--bb-glass-border)',
            }}
          >
            <span className="text-xs font-semibold" style={{ color: isToday(group.dateStr) ? 'var(--bb-brand)' : 'var(--bb-ink-80)' }}>
              {WEEKDAYS_FULL[group.date.getDay()]} {group.date.getDate()}/{group.date.getMonth() + 1}
              {isToday(group.dateStr) && <span className="ml-2 text-[10px]">(Hoje)</span>}
            </span>
          </div>
          <div>
            {group.events.map((evt) => (
              <button
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div
                  className="h-10 w-1 shrink-0"
                  style={{
                    borderRadius: '2px',
                    background: evt.color,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {evt.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    {evt.startTime} - {evt.endTime}
                    {evt.professorName && ` | ${evt.professorName}`}
                  </p>
                </div>
                <span
                  className="shrink-0 px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    borderRadius: 'var(--bb-radius-sm)',
                    background: evt.color + '20',
                    color: evt.color,
                  }}
                >
                  {TYPE_LABELS[evt.type] ?? evt.type}
                </span>
              </button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Event Detail ───────────────────────────────────────────────────────

function EventDetail({
  event,
  onClose,
}: {
  event: CalendarEvent;
  onClose: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Type badge */}
      <div className="flex items-center gap-2">
        <span
          className="px-2 py-0.5 text-xs font-semibold"
          style={{
            borderRadius: 'var(--bb-radius-sm)',
            background: event.color + '20',
            color: event.color,
          }}
        >
          {TYPE_LABELS[event.type] ?? event.type}
        </span>
        {event.modality && (
          <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
            {event.modality}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="space-y-3">
        <DetailRow
          label="Data"
          value={new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        />
        <DetailRow label="Horario" value={`${event.startTime} - ${event.endTime}`} />
        {event.professorName && (
          <DetailRow label="Professor" value={event.professorName} />
        )}
        {event.location && (
          <DetailRow label="Local" value={event.location} />
        )}
        {event.capacity > 0 && (
          <DetailRow
            label="Inscritos"
            value={`${event.enrolledCount} / ${event.capacity}`}
          />
        )}
        {event.recurring && (
          <DetailRow label="Recorrencia" value="Aula recorrente semanal" />
        )}
      </div>

      {event.description && (
        <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
          {event.description}
        </p>
      )}

      {/* Capacity bar */}
      {event.capacity > 0 && (
        <div>
          <div
            className="h-2 w-full overflow-hidden"
            style={{ borderRadius: 'var(--bb-radius-sm)', background: 'var(--bb-depth-4)' }}
          >
            <div
              className="h-full transition-all"
              style={{
                width: `${Math.min(100, (event.enrolledCount / event.capacity) * 100)}%`,
                borderRadius: 'var(--bb-radius-sm)',
                background: event.enrolledCount / event.capacity > 0.9 ? '#EF4444' : event.color,
              }}
            />
          </div>
          <p className="mt-1 text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>
            {Math.round((event.enrolledCount / event.capacity) * 100)}% da capacidade
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="ghost" className="flex-1" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-20 shrink-0 text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
        {label}
      </span>
      <span className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>
        {value}
      </span>
    </div>
  );
}

export { CalendarView };
