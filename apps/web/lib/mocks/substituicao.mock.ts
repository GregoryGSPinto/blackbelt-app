import type { SubstitutionDTO, AvailableTeacherDTO, CreateSubstitutionData } from '@/lib/api/substituicao.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const SUBSTITUTIONS: SubstitutionDTO[] = [
  {
    id: 'sub-1',
    classId: 'class-1',
    className: 'BJJ Iniciante',
    date: '2026-03-10',
    timeSlot: '19:00-20:30',
    originalTeacherId: 'teacher-1',
    originalTeacherName: 'Prof. Ricardo',
    substituteTeacherId: 'teacher-3',
    substituteTeacherName: 'Prof. Marcos',
    reason: 'Compromisso pessoal',
    notifiedStudents: 18,
    createdAt: '2026-03-08T14:30:00Z',
  },
  {
    id: 'sub-2',
    classId: 'class-3',
    className: 'Muay Thai Avançado',
    date: '2026-03-12',
    timeSlot: '20:00-21:30',
    originalTeacherId: 'teacher-2',
    originalTeacherName: 'Prof. Fernanda',
    substituteTeacherId: 'teacher-4',
    substituteTeacherName: 'Prof. André',
    reason: 'Atestado médico',
    notifiedStudents: 12,
    createdAt: '2026-03-11T10:15:00Z',
  },
  {
    id: 'sub-3',
    classId: 'class-2',
    className: 'BJJ Avançado',
    date: '2026-03-14',
    timeSlot: '18:00-19:30',
    originalTeacherId: 'teacher-1',
    originalTeacherName: 'Prof. Ricardo',
    substituteTeacherId: 'teacher-5',
    substituteTeacherName: 'Prof. Juliana',
    reason: 'Viagem para campeonato',
    notifiedStudents: 15,
    createdAt: '2026-03-12T09:00:00Z',
  },
];

const TEACHERS: AvailableTeacherDTO[] = [
  { id: 'teacher-3', name: 'Prof. Marcos', specialties: ['BJJ', 'Wrestling'], available: true },
  { id: 'teacher-4', name: 'Prof. André', specialties: ['Muay Thai', 'Boxe'], available: true },
  { id: 'teacher-5', name: 'Prof. Juliana', specialties: ['BJJ', 'Judô'], available: true },
  { id: 'teacher-6', name: 'Prof. Lucas', specialties: ['BJJ', 'MMA'], available: false },
];

export async function mockGetSubstitutions(_academyId: string): Promise<SubstitutionDTO[]> {
  await delay();
  return SUBSTITUTIONS.map((s) => ({ ...s }));
}

export async function mockCreateSubstitution(data: CreateSubstitutionData): Promise<SubstitutionDTO> {
  await delay();
  const sub: SubstitutionDTO = {
    id: `sub-${Date.now()}`,
    classId: data.classId,
    className: 'BJJ Iniciante',
    date: data.date,
    timeSlot: data.timeSlot,
    originalTeacherId: data.originalTeacherId,
    originalTeacherName: 'Prof. Ricardo',
    substituteTeacherId: data.substituteTeacherId,
    substituteTeacherName: TEACHERS.find((t) => t.id === data.substituteTeacherId)?.name ?? 'Professor',
    reason: data.reason,
    notifiedStudents: 18,
    createdAt: new Date().toISOString(),
  };
  SUBSTITUTIONS.push(sub);
  return { ...sub };
}

export async function mockGetAvailableTeachers(_date: string, _timeSlot: string): Promise<AvailableTeacherDTO[]> {
  await delay();
  return TEACHERS.map((t) => ({ ...t }));
}
