import { BeltLevel } from '@/lib/types/domain';
import type { AcademyEvent, CreateEventData } from '@/lib/types';

const MOCK_EVENTS: AcademyEvent[] = [
  {
    id: 'evt-1',
    academy_id: 'academy-1',
    title: 'Campeonato Interno Guerreiros Open',
    description: 'Campeonato interno com categorias para todas as faixas. Peso e absoluto.',
    date: '2026-04-12',
    location: 'Ginásio Principal',
    type: 'competition',
    max_participants: 60,
    enrolled: 45,
    modalities: ['BJJ'],
    min_belt: BeltLevel.White,
    fee: 50,
    status: 'published',
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'evt-2',
    academy_id: 'academy-1',
    title: 'Seminário com Prof. Marcos Almeida',
    description: 'Seminário especial de Jiu-Jitsu, faixa preta 3º grau. Técnicas de guarda moderna.',
    date: '2026-03-22',
    location: 'Área 1',
    type: 'seminar',
    max_participants: 40,
    enrolled: 32,
    modalities: ['BJJ'],
    min_belt: BeltLevel.White,
    fee: 80,
    status: 'published',
    created_at: '2026-02-20T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'evt-3',
    academy_id: 'academy-1',
    title: 'Cerimônia de Graduação',
    description: 'Cerimônia de troca de faixa com participação de todos os professores.',
    date: '2026-04-05',
    location: 'Ginásio Principal',
    type: 'graduation',
    max_participants: 50,
    enrolled: 8,
    modalities: ['BJJ', 'Judo'],
    min_belt: BeltLevel.White,
    fee: 0,
    status: 'published',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'evt-4',
    academy_id: 'academy-1',
    title: 'Open Mat Sexta',
    description: 'Treino livre para todos os alunos. Venha rolar!',
    date: '2026-03-28',
    location: 'Área 1',
    type: 'open_mat',
    max_participants: 30,
    enrolled: 18,
    modalities: ['BJJ'],
    min_belt: BeltLevel.White,
    fee: 0,
    status: 'published',
    created_at: '2026-03-10T10:00:00Z',
    updated_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'evt-5',
    academy_id: 'academy-1',
    title: 'Workshop de Defesa Pessoal',
    description: 'Workshop aberto ao público de técnicas de defesa pessoal baseadas em Jiu-Jitsu.',
    date: '2026-05-10',
    location: 'Ginásio Principal',
    type: 'workshop',
    max_participants: 25,
    enrolled: 5,
    modalities: ['BJJ'],
    min_belt: BeltLevel.White,
    fee: 30,
    status: 'draft',
    created_at: '2026-03-15T10:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
  },
];

export function mockListEvents(_academyId: string): AcademyEvent[] {
  return MOCK_EVENTS;
}

export function mockGetEvent(eventId: string): AcademyEvent {
  return MOCK_EVENTS.find((e) => e.id === eventId) ?? MOCK_EVENTS[0];
}

export function mockCreateEvent(academyId: string, data: CreateEventData): AcademyEvent {
  return {
    id: `evt-${Date.now()}`,
    academy_id: academyId,
    ...data,
    enrolled: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
