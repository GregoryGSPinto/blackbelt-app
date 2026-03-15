import type { EventDTO } from '@/lib/api/events.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const EVENTS: EventDTO[] = [
  { id: 'evt-1', name: 'Seminário de Guarda', type: 'seminario', date: '2026-03-22', startTime: '09:00', endTime: '12:00', location: 'Tatame Principal', capacity: 30, enrolledCount: 18, price: 80, description: 'Seminário com professor convidado sobre passagens de guarda', enrollmentOpen: true },
  { id: 'evt-2', name: 'Graduação 1º Semestre', type: 'graduacao', date: '2026-04-05', startTime: '14:00', endTime: '17:00', location: 'Tatame Principal', capacity: 50, enrolledCount: 35, price: 0, description: 'Cerimônia de graduação de faixa', enrollmentOpen: true },
  { id: 'evt-3', name: 'Workshop Muay Thai', type: 'workshop', date: '2026-03-29', startTime: '10:00', endTime: '13:00', location: 'Tatame 2', capacity: 15, enrolledCount: 12, price: 60, description: 'Técnicas avançadas de clinch', enrollmentOpen: true },
  { id: 'evt-4', name: 'Copa BlackBelt', type: 'competicao', date: '2026-05-10', startTime: '08:00', endTime: '18:00', location: 'Ginásio Municipal', capacity: 100, enrolledCount: 42, price: 120, description: 'Torneio interno entre academias parceiras', enrollmentOpen: true },
  { id: 'evt-5', name: 'Confraternização', type: 'social', date: '2026-04-15', startTime: '19:00', endTime: '23:00', location: 'Restaurante X', capacity: 60, enrolledCount: 28, price: 50, description: 'Jantar de confraternização com a equipe', enrollmentOpen: false },
];

export async function mockListEvents(_academyId: string): Promise<EventDTO[]> {
  await delay();
  return EVENTS.map((e) => ({ ...e }));
}

export async function mockCreateEvent(_academyId: string, event: Omit<EventDTO, 'id' | 'enrolledCount'>): Promise<EventDTO> {
  await delay();
  const newEvent: EventDTO = { ...event, id: `evt-${Date.now()}`, enrolledCount: 0 };
  EVENTS.push(newEvent);
  return newEvent;
}

export async function mockEnrollEvent(eventId: string, _studentId: string): Promise<void> {
  await delay();
  const event = EVENTS.find((e) => e.id === eventId);
  if (event) event.enrolledCount++;
}
