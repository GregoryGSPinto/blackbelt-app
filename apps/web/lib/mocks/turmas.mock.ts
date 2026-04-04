import { BeltLevel, EnrollmentStatus } from '@/lib/types';
import type { Class, ScheduleSlot } from '@/lib/types';
import type {
  ClassFilters,
  ClassWithDetails,
  ClassDetail,
  EnrolledStudentDTO,
  CreateClassRequest,
  UpdateClassRequest,
} from '@/lib/api/turmas.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const MODALITIES = [
  { id: 'mod-bjj', name: 'Brazilian Jiu-Jitsu', belt_required: BeltLevel.White },
  { id: 'mod-judo', name: 'Judô', belt_required: BeltLevel.White },
  { id: 'mod-karate', name: 'Karatê', belt_required: BeltLevel.White },
  { id: 'mod-mma', name: 'MMA', belt_required: BeltLevel.Blue },
];

const PROFESSORS = [
  { id: 'prof-1', name: 'Carlos Silva' },
  { id: 'prof-2', name: 'Ana Santos' },
  { id: 'prof-3', name: 'Roberto Lima' },
  { id: 'prof-4', name: 'Fernanda Costa' },
];

const UNITS = [
  { id: 'unit-1', name: 'Unidade Centro' },
  { id: 'unit-2', name: 'Unidade Norte' },
];

const MOCK_STUDENTS: EnrolledStudentDTO[] = [
  { student_id: 'stu-1', profile_id: 'p-adulto', display_name: 'João Mendes', avatar: null, belt: BeltLevel.Blue, enrollment_status: EnrollmentStatus.Active, enrolled_at: '2025-06-01T00:00:00Z' },
  { student_id: 'stu-2', profile_id: 'p-2', display_name: 'Maria Oliveira', avatar: null, belt: BeltLevel.Purple, enrollment_status: EnrollmentStatus.Active, enrolled_at: '2025-05-15T00:00:00Z' },
  { student_id: 'stu-3', profile_id: 'p-3', display_name: 'Pedro Santos', avatar: null, belt: BeltLevel.White, enrollment_status: EnrollmentStatus.Active, enrolled_at: '2025-09-01T00:00:00Z' },
  { student_id: 'stu-4', profile_id: 'p-4', display_name: 'Ana Costa', avatar: null, belt: BeltLevel.Yellow, enrollment_status: EnrollmentStatus.Active, enrolled_at: '2025-07-10T00:00:00Z' },
  { student_id: 'stu-5', profile_id: 'p-5', display_name: 'Lucas Ferreira', avatar: null, belt: BeltLevel.Green, enrollment_status: EnrollmentStatus.Active, enrolled_at: '2025-04-20T00:00:00Z' },
  { student_id: 'stu-6', profile_id: 'p-teen', display_name: 'Bruna Alves', avatar: null, belt: BeltLevel.Orange, enrollment_status: EnrollmentStatus.Active, enrolled_at: '2025-08-01T00:00:00Z' },
  { student_id: 'stu-7', profile_id: 'p-7', display_name: 'Rafael Souza', avatar: null, belt: BeltLevel.Brown, enrollment_status: EnrollmentStatus.Active, enrolled_at: '2024-11-01T00:00:00Z' },
  { student_id: 'stu-8', profile_id: 'p-8', display_name: 'Camila Lima', avatar: null, belt: BeltLevel.Blue, enrollment_status: EnrollmentStatus.Active, enrolled_at: '2025-03-01T00:00:00Z' },
  { student_id: 'stu-9', profile_id: 'p-9', display_name: 'Diego Rocha', avatar: null, belt: BeltLevel.White, enrollment_status: EnrollmentStatus.Active, enrolled_at: '2026-01-10T00:00:00Z' },
  { student_id: 'stu-10', profile_id: 'p-10', display_name: 'Juliana Martins', avatar: null, belt: BeltLevel.Gray, enrollment_status: EnrollmentStatus.Active, enrolled_at: '2025-12-01T00:00:00Z' },
  { student_id: 'stu-11', profile_id: 'p-11', display_name: 'Marcos Pereira', avatar: null, belt: BeltLevel.Yellow, enrollment_status: EnrollmentStatus.Inactive, enrolled_at: '2025-02-01T00:00:00Z' },
  { student_id: 'stu-12', profile_id: 'p-12', display_name: 'Patrícia Gomes', avatar: null, belt: BeltLevel.Green, enrollment_status: EnrollmentStatus.Active, enrolled_at: '2025-06-15T00:00:00Z' },
];

function makeSchedule(day: number, start: string, end: string): ScheduleSlot {
  return { day_of_week: day, start_time: start, end_time: end };
}

const MOCK_CLASSES: (ClassWithDetails & { enrolled_students: EnrolledStudentDTO[] })[] = [
  {
    id: 'class-bjj-manha', modality_id: 'mod-bjj', unit_id: 'unit-1', professor_id: 'prof-1',
    schedule: [makeSchedule(1, '07:00', '08:30'), makeSchedule(3, '07:00', '08:30'), makeSchedule(5, '07:00', '08:30')],
    modality_name: 'Brazilian Jiu-Jitsu', professor_name: 'Carlos Silva', unit_name: 'Unidade Centro',
    enrolled_count: 12, max_students: 20,
    enrolled_students: MOCK_STUDENTS.slice(0, 12),
    created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'class-bjj-noite', modality_id: 'mod-bjj', unit_id: 'unit-1', professor_id: 'prof-1',
    schedule: [makeSchedule(1, '19:00', '20:30'), makeSchedule(3, '19:00', '20:30'), makeSchedule(5, '19:00', '20:30')],
    modality_name: 'Brazilian Jiu-Jitsu', professor_name: 'Carlos Silva', unit_name: 'Unidade Centro',
    enrolled_count: 15, max_students: 20,
    enrolled_students: MOCK_STUDENTS.slice(0, 12),
    created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'class-judo-manha', modality_id: 'mod-judo', unit_id: 'unit-1', professor_id: 'prof-2',
    schedule: [makeSchedule(2, '08:00', '09:30'), makeSchedule(4, '08:00', '09:30'), makeSchedule(6, '08:00', '09:30')],
    modality_name: 'Judô', professor_name: 'Ana Santos', unit_name: 'Unidade Centro',
    enrolled_count: 10, max_students: 18,
    enrolled_students: MOCK_STUDENTS.slice(2, 10),
    created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'class-judo-tarde', modality_id: 'mod-judo', unit_id: 'unit-2', professor_id: 'prof-2',
    schedule: [makeSchedule(2, '15:00', '16:30'), makeSchedule(4, '15:00', '16:30')],
    modality_name: 'Judô', professor_name: 'Ana Santos', unit_name: 'Unidade Norte',
    enrolled_count: 8, max_students: 15,
    enrolled_students: MOCK_STUDENTS.slice(4, 10),
    created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'class-karate-manha', modality_id: 'mod-karate', unit_id: 'unit-2', professor_id: 'prof-3',
    schedule: [makeSchedule(1, '09:00', '10:30'), makeSchedule(3, '09:00', '10:30'), makeSchedule(5, '09:00', '10:30')],
    modality_name: 'Karatê', professor_name: 'Roberto Lima', unit_name: 'Unidade Norte',
    enrolled_count: 9, max_students: 16,
    enrolled_students: MOCK_STUDENTS.slice(3, 10),
    created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'class-karate-noite', modality_id: 'mod-karate', unit_id: 'unit-1', professor_id: 'prof-3',
    schedule: [makeSchedule(2, '19:00', '20:30'), makeSchedule(4, '19:00', '20:30')],
    modality_name: 'Karatê', professor_name: 'Roberto Lima', unit_name: 'Unidade Centro',
    enrolled_count: 11, max_students: 20,
    enrolled_students: MOCK_STUDENTS.slice(0, 11),
    created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'class-mma-noite', modality_id: 'mod-mma', unit_id: 'unit-1', professor_id: 'prof-4',
    schedule: [makeSchedule(1, '20:30', '22:00'), makeSchedule(3, '20:30', '22:00')],
    modality_name: 'MMA', professor_name: 'Fernanda Costa', unit_name: 'Unidade Centro',
    enrolled_count: 7, max_students: 12,
    enrolled_students: MOCK_STUDENTS.filter((s) => ['Blue', 'Purple', 'Brown'].includes(s.belt.charAt(0).toUpperCase() + s.belt.slice(1))),
    created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'class-mma-sabado', modality_id: 'mod-mma', unit_id: 'unit-2', professor_id: 'prof-4',
    schedule: [makeSchedule(6, '10:00', '12:00')],
    modality_name: 'MMA', professor_name: 'Fernanda Costa', unit_name: 'Unidade Norte',
    enrolled_count: 5, max_students: 12,
    enrolled_students: MOCK_STUDENTS.slice(0, 5),
    created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
  },
];

export async function mockListClasses(_academyId: string, filters?: ClassFilters): Promise<ClassWithDetails[]> {
  await delay();
  let result = MOCK_CLASSES;
  if (filters?.modalityId) result = result.filter((c) => c.modality_id === filters.modalityId);
  if (filters?.unitId) result = result.filter((c) => c.unit_id === filters.unitId);
  if (filters?.professorId) result = result.filter((c) => c.professor_id === filters.professorId);
  return result.map(({ enrolled_students: _, ...rest }) => rest);
}

export async function mockGetClassById(id: string): Promise<ClassDetail> {
  await delay();
  const cls = MOCK_CLASSES.find((c) => c.id === id);
  if (!cls) throw new Error('Turma não encontrada');
  return cls;
}

export async function mockCreateClass(data: CreateClassRequest): Promise<Class> {
  await delay();
  return {
    id: `class-${Date.now()}`,
    modality_id: data.modality_id,
    unit_id: data.unit_id,
    professor_id: data.professor_id,
    schedule: data.schedule,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function mockUpdateClass(id: string, data: UpdateClassRequest): Promise<Class> {
  await delay();
  const cls = MOCK_CLASSES.find((c) => c.id === id);
  if (!cls) throw new Error('Turma não encontrada');
  return {
    id: cls.id,
    modality_id: data.modality_id ?? cls.modality_id,
    unit_id: data.unit_id ?? cls.unit_id,
    professor_id: data.professor_id ?? cls.professor_id,
    schedule: data.schedule ?? cls.schedule,
    created_at: cls.created_at,
    updated_at: new Date().toISOString(),
  };
}

export async function mockDeleteClass(id: string): Promise<void> {
  await delay();
  const cls = MOCK_CLASSES.find((c) => c.id === id);
  if (!cls) throw new Error('Turma não encontrada');
}

export async function mockGetClassesByProfessor(professorId: string): Promise<ClassWithDetails[]> {
  await delay();
  return MOCK_CLASSES
    .filter((c) => c.professor_id === professorId)
    .map(({ enrolled_students: _, ...rest }) => rest);
}

export { MOCK_CLASSES, MODALITIES, PROFESSORS, UNITS, MOCK_STUDENTS };
