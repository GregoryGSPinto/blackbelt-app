import type {
  ClassItem,
  ClassStudent,
  CreateClassDTO,
  UpdateClassDTO,
  ClassFilters,
  ScheduleEntry,
} from '@/lib/types/class';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uuid(): string {
  return `class-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ────────────────────────────────────────────────────────────
// Mock Data — 5 turmas da Guerreiros BJJ
// ────────────────────────────────────────────────────────────

const MOCK_CLASSES: ClassItem[] = [
  {
    id: 'class-001',
    academy_id: 'academy-1',
    name: 'BJJ Fundamentos',
    modality: 'BJJ',
    professor_id: 'prof-andre',
    professor_name: 'André Santos',
    schedule: [
      { day_of_week: 1, start_time: '07:00', end_time: '08:00' },
      { day_of_week: 3, start_time: '07:00', end_time: '08:00' },
      { day_of_week: 5, start_time: '07:00', end_time: '08:00' },
    ],
    capacity: 30,
    enrolled_count: 22,
    status: 'active',
    room: 'Tatame A',
    min_belt: 'white',
    max_belt: 'blue',
    description: 'Turma de fundamentos do Jiu-Jitsu Brasileiro. Ideal para iniciantes e faixas brancas a azuis.',
  },
  {
    id: 'class-002',
    academy_id: 'academy-1',
    name: 'BJJ All Levels',
    modality: 'BJJ',
    professor_id: 'prof-andre',
    professor_name: 'André Santos',
    schedule: [
      { day_of_week: 1, start_time: '10:00', end_time: '11:30' },
      { day_of_week: 3, start_time: '10:00', end_time: '11:30' },
      { day_of_week: 5, start_time: '10:00', end_time: '11:30' },
    ],
    capacity: 25,
    enrolled_count: 18,
    status: 'active',
    room: 'Tatame A',
    min_belt: 'white',
    max_belt: 'black',
    description: 'Turma aberta para todos os niveis. Treino misto com tecnicas variadas.',
  },
  {
    id: 'class-003',
    academy_id: 'academy-1',
    name: 'Judo Adulto',
    modality: 'Judo',
    professor_id: 'prof-fernanda',
    professor_name: 'Fernanda Oliveira',
    schedule: [
      { day_of_week: 2, start_time: '18:00', end_time: '19:30' },
      { day_of_week: 4, start_time: '18:00', end_time: '19:30' },
    ],
    capacity: 20,
    enrolled_count: 14,
    status: 'active',
    room: 'Tatame B',
    min_belt: 'white',
    max_belt: 'black',
    description: 'Turma de Judo para adultos. Nages, katas e randori.',
  },
  {
    id: 'class-004',
    academy_id: 'academy-1',
    name: 'BJJ Avancado',
    modality: 'BJJ',
    professor_id: 'prof-thiago',
    professor_name: 'Thiago Nakamura',
    schedule: [
      { day_of_week: 2, start_time: '19:00', end_time: '20:30' },
      { day_of_week: 4, start_time: '19:00', end_time: '20:30' },
    ],
    capacity: 20,
    enrolled_count: 16,
    status: 'active',
    room: 'Tatame A',
    min_belt: 'purple',
    max_belt: 'black',
    description: 'Turma avancada de BJJ. Exclusiva para faixas roxa, marrom e preta.',
  },
  {
    id: 'class-005',
    academy_id: 'academy-1',
    name: 'BJJ Noturno',
    modality: 'BJJ',
    professor_id: 'prof-andre',
    professor_name: 'André Santos',
    schedule: [
      { day_of_week: 1, start_time: '21:00', end_time: '22:30' },
      { day_of_week: 3, start_time: '21:00', end_time: '22:30' },
      { day_of_week: 5, start_time: '21:00', end_time: '22:30' },
    ],
    capacity: 25,
    enrolled_count: 24,
    status: 'active',
    room: 'Tatame A',
    min_belt: 'white',
    max_belt: 'black',
    description: 'Turma noturna de BJJ. Treino completo com aquecimento, tecnica e sparring.',
  },
];

// ────────────────────────────────────────────────────────────
// Mock Students
// ────────────────────────────────────────────────────────────

const MOCK_STUDENTS: Record<string, ClassStudent[]> = {
  'class-001': [
    { id: 'enr-001', student_id: 'prof-joao', student_name: 'Joao Mendes', belt: 'blue', enrolled_at: '2025-03-01', attendance_rate: 85 },
    { id: 'enr-002', student_id: 'prof-adulto', student_name: 'Joao Silva', belt: 'white', enrolled_at: '2025-06-15', attendance_rate: 72 },
    { id: 'enr-003', student_id: 'prof-multi-adulto', student_name: 'Pedro Costa', belt: 'white', enrolled_at: '2025-08-01', attendance_rate: 90 },
  ],
  'class-002': [
    { id: 'enr-004', student_id: 'prof-joao', student_name: 'Joao Mendes', belt: 'blue', enrolled_at: '2025-03-01', attendance_rate: 78 },
    { id: 'enr-005', student_id: 'prof-adulto', student_name: 'Joao Silva', belt: 'white', enrolled_at: '2025-06-15', attendance_rate: 65 },
  ],
  'class-003': [
    { id: 'enr-006', student_id: 'prof-multi-adulto', student_name: 'Pedro Costa', belt: 'white', enrolled_at: '2025-04-10', attendance_rate: 88 },
  ],
  'class-004': [
    { id: 'enr-007', student_id: 'prof-joao', student_name: 'Joao Mendes', belt: 'blue', enrolled_at: '2025-02-01', attendance_rate: 92 },
  ],
  'class-005': [
    { id: 'enr-008', student_id: 'prof-adulto', student_name: 'Joao Silva', belt: 'white', enrolled_at: '2025-07-01', attendance_rate: 70 },
    { id: 'enr-009', student_id: 'prof-multi-adulto', student_name: 'Pedro Costa', belt: 'white', enrolled_at: '2025-07-15', attendance_rate: 82 },
  ],
};

// ────────────────────────────────────────────────────────────
// Mock Implementations
// ────────────────────────────────────────────────────────────

export async function mockListClasses(
  academyId: string,
  filters?: ClassFilters,
): Promise<ClassItem[]> {
  await delay();
  let result = MOCK_CLASSES.filter((c) => c.academy_id === academyId);

  if (filters?.modality) {
    result = result.filter((c) => c.modality === filters.modality);
  }
  if (filters?.status) {
    result = result.filter((c) => c.status === filters.status);
  }
  if (filters?.professor_id) {
    result = result.filter((c) => c.professor_id === filters.professor_id);
  }

  return result;
}

export async function mockGetClass(id: string): Promise<ClassItem> {
  await delay();
  const cls = MOCK_CLASSES.find((c) => c.id === id);
  if (!cls) {
    const { ServiceError } = await import('@/lib/api/errors');
    throw new ServiceError(404, 'class.get', 'Turma nao encontrada.');
  }
  return cls;
}

export async function mockCreateClass(data: CreateClassDTO): Promise<ClassItem> {
  await delay();
  const newClass: ClassItem = {
    id: uuid(),
    academy_id: data.academy_id,
    name: data.name,
    modality: data.modality,
    professor_id: data.professor_id,
    professor_name: data.professor_id === 'prof-andre'
      ? 'Andre Santos'
      : data.professor_id === 'prof-fernanda'
        ? 'Fernanda Oliveira'
        : data.professor_id === 'prof-thiago'
          ? 'Thiago Nakamura'
          : 'Professor',
    schedule: data.schedule,
    capacity: data.capacity,
    enrolled_count: 0,
    status: 'active',
    room: data.room,
    min_belt: data.min_belt,
    max_belt: data.max_belt,
    description: data.description,
  };
  MOCK_CLASSES.push(newClass);
  return newClass;
}

export async function mockUpdateClass(id: string, data: UpdateClassDTO): Promise<ClassItem> {
  await delay();
  const idx = MOCK_CLASSES.findIndex((c) => c.id === id);
  if (idx === -1) {
    const { ServiceError } = await import('@/lib/api/errors');
    throw new ServiceError(404, 'class.update', 'Turma nao encontrada.');
  }
  const updated: ClassItem = { ...MOCK_CLASSES[idx], ...data } as ClassItem;
  MOCK_CLASSES[idx] = updated;
  return updated;
}

export async function mockDeleteClass(id: string): Promise<void> {
  await delay();
  const idx = MOCK_CLASSES.findIndex((c) => c.id === id);
  if (idx === -1) {
    const { ServiceError } = await import('@/lib/api/errors');
    throw new ServiceError(404, 'class.delete', 'Turma nao encontrada.');
  }
  MOCK_CLASSES.splice(idx, 1);
}

export async function mockGetClassStudents(classId: string): Promise<ClassStudent[]> {
  await delay();
  return MOCK_STUDENTS[classId] ?? [];
}

export async function mockAddStudent(classId: string, studentId: string): Promise<ClassStudent> {
  await delay();
  const student: ClassStudent = {
    id: `enr-${Date.now()}`,
    student_id: studentId,
    student_name: 'Novo Aluno',
    belt: 'white',
    enrolled_at: new Date().toISOString().slice(0, 10),
    attendance_rate: 0,
  };
  if (!MOCK_STUDENTS[classId]) {
    MOCK_STUDENTS[classId] = [];
  }
  MOCK_STUDENTS[classId].push(student);

  // Increment enrolled_count
  const cls = MOCK_CLASSES.find((c) => c.id === classId);
  if (cls) cls.enrolled_count += 1;

  return student;
}

export async function mockRemoveStudent(classId: string, studentId: string): Promise<void> {
  await delay();
  const students = MOCK_STUDENTS[classId];
  if (students) {
    const idx = students.findIndex((s) => s.student_id === studentId);
    if (idx !== -1) students.splice(idx, 1);
  }
  // Decrement enrolled_count
  const cls = MOCK_CLASSES.find((c) => c.id === classId);
  if (cls && cls.enrolled_count > 0) cls.enrolled_count -= 1;
}

export async function mockGetSchedule(academyId: string): Promise<ScheduleEntry[]> {
  await delay();
  const classes = MOCK_CLASSES.filter((c) => c.academy_id === academyId && c.status === 'active');
  const entries: ScheduleEntry[] = [];

  for (const cls of classes) {
    for (const slot of cls.schedule) {
      entries.push({
        class_id: cls.id,
        class_name: cls.name,
        modality: cls.modality,
        professor_name: cls.professor_name,
        room: cls.room,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
      });
    }
  }

  return entries.sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time));
}
