import type { AgendaSlot, LessonRequest } from '@/lib/api/professor-agenda.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const AGENDA: AgendaSlot[] = [
  { id: 'ag-1', type: 'class', title: 'BJJ Fundamental', day: 1, startTime: '07:00', endTime: '08:30' },
  { id: 'ag-2', type: 'class', title: 'BJJ Avançado', day: 1, startTime: '19:00', endTime: '20:30' },
  { id: 'ag-3', type: 'private', title: 'Particular - João', day: 2, startTime: '10:00', endTime: '11:00', studentName: 'João Silva', status: 'confirmed' },
  { id: 'ag-4', type: 'class', title: 'BJJ Fundamental', day: 3, startTime: '07:00', endTime: '08:30' },
  { id: 'ag-5', type: 'class', title: 'BJJ Avançado', day: 3, startTime: '19:00', endTime: '20:30' },
  { id: 'ag-6', type: 'event', title: 'Seminário de Guarda', day: 6, startTime: '09:00', endTime: '12:00' },
  { id: 'ag-7', type: 'unavailable', title: 'Folga', day: 0, startTime: '00:00', endTime: '23:59' },
  { id: 'ag-8', type: 'class', title: 'BJJ Fundamental', day: 5, startTime: '07:00', endTime: '08:30' },
];

const REQUESTS: LessonRequest[] = [
  { id: 'req-1', studentId: 'student-2', studentName: 'Ana Costa', requestedDate: '2026-03-18', requestedTime: '10:00', status: 'pending' },
  { id: 'req-2', studentId: 'student-4', studentName: 'Carlos Mendes', requestedDate: '2026-03-19', requestedTime: '14:00', status: 'pending' },
];

export async function mockGetAgenda(_professorId: string): Promise<AgendaSlot[]> {
  await delay();
  return AGENDA.map((a) => ({ ...a }));
}

export async function mockGetLessonRequests(_professorId: string): Promise<LessonRequest[]> {
  await delay();
  return REQUESTS.filter((r) => r.status === 'pending').map((r) => ({ ...r }));
}

export async function mockApproveLesson(requestId: string): Promise<void> {
  await delay();
  const req = REQUESTS.find((r) => r.id === requestId);
  if (req) req.status = 'approved';
}

export async function mockRejectLesson(requestId: string, _reason: string): Promise<void> {
  await delay();
  const req = REQUESTS.find((r) => r.id === requestId);
  if (req) req.status = 'rejected';
}
