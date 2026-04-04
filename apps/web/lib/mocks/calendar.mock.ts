import type { CalendarEvent, CalendarFilters } from '@/lib/api/calendar.service';
import { getModalityColor } from '@/lib/api/calendar.service';

const CLASSES = [
  { name: 'BJJ Fundamentos', modality: 'BJJ', professor: 'Roberto Silva', days: [1, 3, 5], start: '07:00', end: '08:30', enrolled: 28, capacity: 30 },
  { name: 'BJJ All Levels', modality: 'BJJ', professor: 'André Moreira', days: [1, 3, 5], start: '10:00', end: '11:30', enrolled: 22, capacity: 25 },
  { name: 'Judô Adulto', modality: 'Judo', professor: 'Carlos Mendes', days: [2, 4], start: '18:00', end: '19:30', enrolled: 18, capacity: 20 },
  { name: 'BJJ Avançado', modality: 'BJJ', professor: 'André Moreira', days: [2, 4], start: '19:00', end: '20:30', enrolled: 15, capacity: 20 },
  { name: 'BJJ Noturno', modality: 'BJJ', professor: 'Roberto Silva', days: [1, 3, 5], start: '21:00', end: '22:30', enrolled: 20, capacity: 25 },
];

const HOLIDAYS: CalendarEvent[] = [
  {
    id: 'hol-tiradentes',
    title: 'Tiradentes (Feriado)',
    type: 'holiday',
    modality: null,
    date: '2026-04-21',
    startTime: '00:00',
    endTime: '23:59',
    professorName: null,
    location: null,
    enrolledCount: 0,
    capacity: 0,
    color: '#6B7280',
    recurring: false,
    description: 'Feriado nacional. Academia fechada.',
  },
  {
    id: 'hol-trabalho',
    title: 'Dia do Trabalho (Feriado)',
    type: 'holiday',
    modality: null,
    date: '2026-05-01',
    startTime: '00:00',
    endTime: '23:59',
    professorName: null,
    location: null,
    enrolledCount: 0,
    capacity: 0,
    color: '#6B7280',
    recurring: false,
    description: 'Feriado nacional. Academia fechada.',
  },
  {
    id: 'hol-corpus',
    title: 'Corpus Christi (Feriado)',
    type: 'holiday',
    modality: null,
    date: '2026-06-04',
    startTime: '00:00',
    endTime: '23:59',
    professorName: null,
    location: null,
    enrolledCount: 0,
    capacity: 0,
    color: '#6B7280',
    recurring: false,
    description: 'Feriado nacional. Academia fechada.',
  },
];

const SPECIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-comp-1',
    title: 'Campeonato Interno Guerreiros Open',
    type: 'competition',
    modality: 'BJJ',
    date: '2026-04-12',
    startTime: '09:00',
    endTime: '18:00',
    professorName: null,
    location: 'Ginásio Principal',
    enrolledCount: 45,
    capacity: 60,
    color: '#DC2626',
    recurring: false,
    description: 'Campeonato interno com categorias para todas as faixas.',
  },
  {
    id: 'evt-seminar-1',
    title: 'Seminário com Prof. Marcos Almeida',
    type: 'event',
    modality: 'BJJ',
    date: '2026-03-22',
    startTime: '14:00',
    endTime: '17:00',
    professorName: 'Marcos Almeida',
    location: 'Área 1',
    enrolledCount: 32,
    capacity: 40,
    color: '#7C3AED',
    recurring: false,
    description: 'Seminário especial de Jiu-Jitsu, faixa preta 3º grau.',
  },
  {
    id: 'evt-grad-1',
    title: 'Cerimônia de Graduação',
    type: 'graduation',
    modality: null,
    date: '2026-04-05',
    startTime: '19:00',
    endTime: '21:00',
    professorName: null,
    location: 'Ginásio Principal',
    enrolledCount: 8,
    capacity: 50,
    color: '#EAB308',
    recurring: false,
    description: 'Cerimônia de troca de faixa.',
  },
];

function generateClassEvents(from: string, to: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const start = new Date(from);
  const end = new Date(to);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    const dateStr = d.toISOString().slice(0, 10);

    for (const cls of CLASSES) {
      if (cls.days.includes(dow)) {
        events.push({
          id: `cls-${cls.name.replace(/\s/g, '-')}-${dateStr}`,
          title: cls.name,
          type: 'class',
          modality: cls.modality,
          date: dateStr,
          startTime: cls.start,
          endTime: cls.end,
          professorName: cls.professor,
          location: 'Área 1',
          enrolledCount: cls.enrolled,
          capacity: cls.capacity,
          color: getModalityColor(cls.modality),
          recurring: true,
          description: null,
        });
      }
    }
  }

  return events;
}

export function mockGetCalendarEvents(
  _academyId: string,
  filters: CalendarFilters,
): CalendarEvent[] {
  const classEvents = generateClassEvents(filters.from, filters.to);
  const specials = SPECIAL_EVENTS.filter(
    (e) => e.date >= filters.from && e.date <= filters.to,
  );
  const holidays = HOLIDAYS.filter(
    (e) => e.date >= filters.from && e.date <= filters.to,
  );

  let all = [...classEvents, ...specials, ...holidays];

  if (filters.modality) {
    all = all.filter((e) => e.modality === filters.modality);
  }

  return all.sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    if (cmp !== 0) return cmp;
    return a.startTime.localeCompare(b.startTime);
  });
}

export function mockGetCalendarEventById(eventId: string): CalendarEvent {
  const special = SPECIAL_EVENTS.find((e) => e.id === eventId);
  if (special) return special;

  // Generate a fake class event
  return {
    id: eventId,
    title: 'BJJ Fundamentos',
    type: 'class',
    modality: 'BJJ',
    date: new Date().toISOString().slice(0, 10),
    startTime: '07:00',
    endTime: '08:30',
    professorName: 'Roberto Silva',
    location: 'Área 1',
    enrolledCount: 28,
    capacity: 30,
    color: '#DC2626',
    recurring: true,
    description: null,
  };
}
