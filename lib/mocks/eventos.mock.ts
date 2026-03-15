import type { EventoDTO, EventRegistration } from '@/lib/api/eventos.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const EVENTOS: EventoDTO[] = [
  {
    id: 'evt-l27-1',
    title: 'Graduacao 1o Semestre 2026',
    type: 'graduacao',
    date: '2026-04-05',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Tatame Principal',
    capacity: 50,
    enrolledCount: 32,
    price: 0,
    description:
      'Cerimonia de graduacao de faixa. Todos os alunos indicados pelos professores devem confirmar presenca.',
    enrollmentOpen: true,
    academy_id: 'academy-1',
  },
  {
    id: 'evt-l27-2',
    title: 'Copa BlackBelt Interno',
    type: 'campeonato',
    date: '2026-05-10',
    startTime: '08:00',
    endTime: '18:00',
    location: 'Ginasio Municipal',
    capacity: 80,
    enrolledCount: 45,
    price: 120,
    description:
      'Campeonato interno entre academias parceiras. Categorias faixa branca a marrom, masculino e feminino.',
    enrollmentOpen: true,
    academy_id: 'academy-1',
  },
  {
    id: 'evt-l27-3',
    title: 'Seminario de Raspagens com Prof. Convidado',
    type: 'seminario',
    date: '2026-03-29',
    startTime: '09:00',
    endTime: '12:00',
    location: 'Tatame Principal',
    capacity: 30,
    enrolledCount: 22,
    price: 80,
    description:
      'Seminario exclusivo com professor convidado faixa preta 3o grau. Foco em raspagens da guarda aberta.',
    enrollmentOpen: true,
    academy_id: 'academy-1',
  },
  {
    id: 'evt-l27-4',
    title: 'Workshop de Defesa Pessoal',
    type: 'workshop',
    date: '2026-04-12',
    startTime: '10:00',
    endTime: '13:00',
    location: 'Tatame 2',
    capacity: 20,
    enrolledCount: 8,
    price: 60,
    description:
      'Workshop aberto para alunos e convidados. Tecnicas praticas de defesa pessoal baseadas em Jiu-Jitsu.',
    enrollmentOpen: true,
    academy_id: 'academy-1',
  },
];

export async function mockGetEvents(_academyId: string): Promise<EventoDTO[]> {
  await delay();
  return EVENTOS.map((e) => ({ ...e }));
}

export async function mockRegisterForEvent(
  eventId: string,
  studentId: string,
): Promise<EventRegistration> {
  await delay();
  const evento = EVENTOS.find((e) => e.id === eventId);
  if (evento) evento.enrolledCount++;
  return {
    eventId,
    studentId,
    registeredAt: new Date().toISOString(),
    status: evento && evento.enrolledCount <= evento.capacity ? 'confirmed' : 'waitlist',
  };
}
