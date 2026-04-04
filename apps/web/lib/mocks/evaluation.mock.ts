import { BeltLevel } from '@/lib/types';
import type {
  StudentEvaluation,
  EvaluableStudent,
  CreateEvaluationPayload,
  EvaluationTimeline,
} from '@/lib/types/evaluation';

const delay = () => new Promise((r) => setTimeout(r, 300));

// ── 10 Mock Evaluations ──────────────────────────────────────────────

const MOCK_EVALUATIONS: StudentEvaluation[] = [
  {
    id: 'eval-001',
    student_id: 'stu-1',
    student_name: 'Joao Mendes',
    professor_id: 'prof-1',
    class_id: 'cls-1',
    technique: 8,
    posture: 7,
    evolution: 9,
    behavior: 8,
    conditioning: 7,
    theory: 8,
    discipline: 9,
    comment: 'Excelente progresso na guarda. Raspagens cada vez mais fluidas.',
    created_at: '2026-03-10T14:30:00Z',
  },
  {
    id: 'eval-002',
    student_id: 'stu-1',
    student_name: 'Joao Mendes',
    professor_id: 'prof-1',
    class_id: 'cls-1',
    technique: 7,
    posture: 6,
    evolution: 7,
    behavior: 8,
    conditioning: 6,
    theory: 7,
    discipline: 8,
    comment: 'Boa disciplina. Precisa melhorar postura na base.',
    created_at: '2026-02-15T14:30:00Z',
  },
  {
    id: 'eval-003',
    student_id: 'stu-2',
    student_name: 'Ana Carolina',
    professor_id: 'prof-1',
    class_id: 'cls-1',
    technique: 9,
    posture: 8,
    evolution: 8,
    behavior: 10,
    conditioning: 8,
    theory: 9,
    discipline: 10,
    comment: 'Lideranca positiva no tatame. Tecnica refinada.',
    created_at: '2026-03-08T10:00:00Z',
  },
  {
    id: 'eval-004',
    student_id: 'stu-3',
    student_name: 'Pedro Santos',
    professor_id: 'prof-1',
    class_id: 'cls-2',
    technique: 5,
    posture: 4,
    evolution: 6,
    behavior: 7,
    conditioning: 5,
    theory: 4,
    discipline: 6,
    comment: 'Precisa melhorar pontualidade e base tecnica.',
    created_at: '2026-03-05T09:00:00Z',
  },
  {
    id: 'eval-005',
    student_id: 'stu-5',
    student_name: 'Lucas Oliveira',
    professor_id: 'prof-1',
    class_id: 'cls-2',
    technique: 7,
    posture: 8,
    evolution: 7,
    behavior: 9,
    conditioning: 7,
    theory: 6,
    discipline: 9,
    comment: 'Dedicado e proativo. Boa postura geral.',
    created_at: '2026-03-12T11:00:00Z',
  },
  {
    id: 'eval-006',
    student_id: 'stu-7',
    student_name: 'Rafael Costa',
    professor_id: 'prof-1',
    class_id: 'cls-1',
    technique: 10,
    posture: 9,
    evolution: 8,
    behavior: 9,
    conditioning: 9,
    theory: 10,
    discipline: 9,
    comment: 'Referencia tecnica para a turma. Pronto para faixa roxa.',
    created_at: '2026-03-14T15:00:00Z',
  },
  {
    id: 'eval-007',
    student_id: 'stu-8',
    student_name: 'Mariana Lima',
    professor_id: 'prof-1',
    class_id: 'cls-2',
    technique: 6,
    posture: 5,
    evolution: 5,
    behavior: 8,
    conditioning: 6,
    theory: 5,
    discipline: 7,
    comment: 'Boa atitude mas frequencia irregular afeta evolucao.',
    created_at: '2026-02-28T10:00:00Z',
  },
  {
    id: 'eval-008',
    student_id: 'stu-2',
    student_name: 'Ana Carolina',
    professor_id: 'prof-1',
    class_id: 'cls-1',
    technique: 8,
    posture: 7,
    evolution: 7,
    behavior: 9,
    conditioning: 7,
    theory: 8,
    discipline: 9,
    comment: 'Mantendo constancia. Focar em passagens de guarda.',
    created_at: '2026-02-10T10:00:00Z',
  },
  {
    id: 'eval-009',
    student_id: 'stu-5',
    student_name: 'Lucas Oliveira',
    professor_id: 'prof-1',
    class_id: 'cls-2',
    technique: 6,
    posture: 7,
    evolution: 6,
    behavior: 8,
    conditioning: 5,
    theory: 5,
    discipline: 7,
    comment: 'Boa evolucao desde a ultima avaliacao. Manter ritmo.',
    created_at: '2026-02-05T11:00:00Z',
  },
  {
    id: 'eval-010',
    student_id: 'stu-3',
    student_name: 'Pedro Santos',
    professor_id: 'prof-1',
    class_id: 'cls-2',
    technique: 4,
    posture: 3,
    evolution: 5,
    behavior: 6,
    conditioning: 4,
    theory: 3,
    discipline: 5,
    comment: 'Inicio promissor. Precisa mais dedicacao nos fundamentos.',
    created_at: '2026-01-20T09:00:00Z',
  },
];

// ── Mock Evaluable Students ──────────────────────────────────────────

const MOCK_STUDENTS: EvaluableStudent[] = [
  {
    student_id: 'stu-1',
    display_name: 'Joao Mendes',
    avatar: null,
    belt: BeltLevel.Blue,
    class_id: 'cls-1',
    class_name: 'BJJ Noite',
    last_evaluation_date: '2026-03-10',
    evaluation_count: 2,
  },
  {
    student_id: 'stu-2',
    display_name: 'Ana Carolina',
    avatar: null,
    belt: BeltLevel.Purple,
    class_id: 'cls-1',
    class_name: 'BJJ Noite',
    last_evaluation_date: '2026-03-08',
    evaluation_count: 2,
  },
  {
    student_id: 'stu-3',
    display_name: 'Pedro Santos',
    avatar: null,
    belt: BeltLevel.White,
    class_id: 'cls-2',
    class_name: 'BJJ Manha',
    last_evaluation_date: '2026-03-05',
    evaluation_count: 2,
  },
  {
    student_id: 'stu-5',
    display_name: 'Lucas Oliveira',
    avatar: null,
    belt: BeltLevel.Yellow,
    class_id: 'cls-2',
    class_name: 'BJJ Manha',
    last_evaluation_date: '2026-03-12',
    evaluation_count: 2,
  },
  {
    student_id: 'stu-7',
    display_name: 'Rafael Costa',
    avatar: null,
    belt: BeltLevel.Blue,
    class_id: 'cls-1',
    class_name: 'BJJ Noite',
    last_evaluation_date: '2026-03-14',
    evaluation_count: 1,
  },
  {
    student_id: 'stu-8',
    display_name: 'Mariana Lima',
    avatar: null,
    belt: BeltLevel.Gray,
    class_id: 'cls-2',
    class_name: 'BJJ Manha',
    last_evaluation_date: '2026-02-28',
    evaluation_count: 1,
  },
];

// ── Mock Professor Classes ───────────────────────────────────────────

const MOCK_CLASSES = [
  { class_id: 'cls-1', class_name: 'BJJ Noite' },
  { class_id: 'cls-2', class_name: 'BJJ Manha' },
];

// ── Exported Mock Functions ──────────────────────────────────────────

export async function mockGetEvaluableStudents(
  _professorId: string,
  classId?: string,
): Promise<EvaluableStudent[]> {
  await delay();
  if (classId) {
    return MOCK_STUDENTS.filter((s) => s.class_id === classId);
  }
  return MOCK_STUDENTS;
}

export async function mockGetStudentEvaluationTimeline(
  studentId: string,
): Promise<EvaluationTimeline> {
  await delay();
  const evals = MOCK_EVALUATIONS.filter((e) => e.student_id === studentId);
  return {
    student_id: studentId,
    student_name: evals[0]?.student_name ?? 'Aluno',
    evaluations: evals,
  };
}

export async function mockCreateEvaluation(
  payload: CreateEvaluationPayload,
): Promise<StudentEvaluation> {
  await delay();
  const student = MOCK_STUDENTS.find((s) => s.student_id === payload.student_id);
  const now = new Date().toISOString();
  return {
    id: `eval-${Date.now()}`,
    student_id: payload.student_id,
    student_name: student?.display_name ?? 'Aluno',
    professor_id: 'prof-1',
    class_id: payload.class_id,
    technique: payload.technique,
    posture: payload.posture,
    evolution: payload.evolution,
    behavior: payload.behavior,
    conditioning: payload.conditioning,
    theory: payload.theory,
    discipline: payload.discipline,
    comment: payload.comment,
    created_at: now,
  };
}

export async function mockGetProfessorClasses(
  _professorId: string,
): Promise<Array<{ class_id: string; class_name: string }>> {
  await delay();
  return MOCK_CLASSES;
}
