import type { EventDTO } from '@/lib/api/events.service';
import type { AcademyEvent, CreateEventData } from '@/lib/types/event';
import { BeltLevel } from '@/lib/types/domain';

const delay = () => new Promise((r) => setTimeout(r, 200));

// ── Legacy EventDTO mocks ─────────────────────────────────────────────

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

// ── AcademyEvent mocks (P-037) ────────────────────────────────────────

const ACADEMY_EVENTS: AcademyEvent[] = [
  {
    id: 'aevt-1',
    academy_id: 'academy-1',
    title: 'Copa BlackBelt de Jiu-Jitsu',
    description: 'Competicao interna entre alunos da academia. Categorias por faixa e peso. Premiacao com medalhas e trofeus para os destaques.',
    date: '2026-04-12T08:00:00Z',
    location: 'Ginasio Municipal',
    type: 'competition',
    max_participants: 80,
    enrolled: 42,
    modalities: ['Jiu-Jitsu'],
    min_belt: BeltLevel.White,
    fee: 120,
    status: 'published',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'aevt-2',
    academy_id: 'academy-1',
    title: 'Seminario de Raspagens com Mestre Rocha',
    description: 'Seminario exclusivo com Mestre Rocha (5o grau) sobre tecnicas avancadas de raspagem da guarda aberta e fechada. Inclui material didatico.',
    date: '2026-03-29T09:00:00Z',
    location: 'Tatame Principal',
    type: 'seminar',
    max_participants: 30,
    enrolled: 24,
    modalities: ['Jiu-Jitsu'],
    min_belt: BeltLevel.Blue,
    fee: 150,
    status: 'published',
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-03-05T10:00:00Z',
  },
  {
    id: 'aevt-3',
    academy_id: 'academy-1',
    title: 'Cerimonia de Graduacao — 1o Semestre 2026',
    description: 'Cerimonia oficial de troca de faixa para alunos aprovados na avaliacao do primeiro semestre. Presenca obrigatoria dos graduandos.',
    date: '2026-05-03T14:00:00Z',
    location: 'Tatame Principal',
    type: 'graduation',
    max_participants: 50,
    enrolled: 38,
    modalities: ['Jiu-Jitsu', 'Muay Thai'],
    min_belt: BeltLevel.White,
    fee: 0,
    status: 'published',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'aevt-4',
    academy_id: 'academy-1',
    title: 'Open Mat — Sabado Especial',
    description: 'Treino livre aberto para todas as faixas. Venha rolar com parceiros de treino diferentes. Permitido convidados de outras academias.',
    date: '2026-03-22T10:00:00Z',
    location: 'Tatame Principal',
    type: 'open_mat',
    max_participants: 40,
    enrolled: 18,
    modalities: ['Jiu-Jitsu', 'Wrestling'],
    min_belt: BeltLevel.White,
    fee: 0,
    status: 'published',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
  },
  {
    id: 'aevt-5',
    academy_id: 'academy-1',
    title: 'Workshop de Defesa Pessoal',
    description: 'Workshop pratico de tecnicas de defesa pessoal baseadas em Jiu-Jitsu e Muay Thai. Aberto a comunidade, nao requer experiencia previa.',
    date: '2026-04-19T09:00:00Z',
    location: 'Tatame 2',
    type: 'workshop',
    max_participants: 25,
    enrolled: 12,
    modalities: ['Jiu-Jitsu', 'Muay Thai'],
    min_belt: BeltLevel.White,
    fee: 80,
    status: 'draft',
    created_at: '2026-03-10T10:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
  },
];

export async function mockListAcademyEvents(_academyId: string): Promise<AcademyEvent[]> {
  await delay();
  return ACADEMY_EVENTS.map((e) => ({ ...e }));
}

export async function mockGetAcademyEvent(eventId: string): Promise<AcademyEvent> {
  await delay();
  const event = ACADEMY_EVENTS.find((e) => e.id === eventId);
  if (!event) throw new Error(`Event ${eventId} not found`);
  return { ...event };
}

export async function mockCreateAcademyEvent(academyId: string, data: CreateEventData): Promise<AcademyEvent> {
  await delay();
  const now = new Date().toISOString();
  const newEvent: AcademyEvent = {
    id: `aevt-${Date.now()}`,
    academy_id: academyId,
    ...data,
    enrolled: 0,
    created_at: now,
    updated_at: now,
  };
  ACADEMY_EVENTS.push(newEvent);
  return { ...newEvent };
}

export async function mockUpdateAcademyEvent(eventId: string, data: Partial<CreateEventData>): Promise<AcademyEvent> {
  await delay();
  const idx = ACADEMY_EVENTS.findIndex((e) => e.id === eventId);
  if (idx === -1) throw new Error(`Event ${eventId} not found`);
  ACADEMY_EVENTS[idx] = { ...ACADEMY_EVENTS[idx], ...data, updated_at: new Date().toISOString() };
  return { ...ACADEMY_EVENTS[idx] };
}

export async function mockDeleteAcademyEvent(eventId: string): Promise<void> {
  await delay();
  const idx = ACADEMY_EVENTS.findIndex((e) => e.id === eventId);
  if (idx === -1) throw new Error(`Event ${eventId} not found`);
  ACADEMY_EVENTS.splice(idx, 1);
}
