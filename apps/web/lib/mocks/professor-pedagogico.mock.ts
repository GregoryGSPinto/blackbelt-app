import { BeltLevel, EvaluationCriteria } from '@/lib/types';
import type { Evaluation, Progression } from '@/lib/types';
import type { ProgressoDTO, StudentWithProgress } from '@/lib/api/professor-pedagogico.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGetProgressoAluno(_studentId: string): Promise<ProgressoDTO> {
  await delay();
  return {
    student_id: 'stu-1',
    display_name: 'João Mendes',
    belt: BeltLevel.Blue,
    total_aulas: 52,
    avaliacoes: [
      { id: 'ev-1', class_id: 'class-bjj-noite', criteria: EvaluationCriteria.Technique, score: 78, date: '2026-03-10', professor_name: 'Carlos Silva' },
      { id: 'ev-2', class_id: 'class-bjj-noite', criteria: EvaluationCriteria.Discipline, score: 85, date: '2026-03-10', professor_name: 'Carlos Silva' },
      { id: 'ev-3', class_id: 'class-bjj-manha', criteria: EvaluationCriteria.Technique, score: 82, date: '2026-02-20', professor_name: 'Carlos Silva' },
      { id: 'ev-4', class_id: 'class-bjj-noite', criteria: EvaluationCriteria.Evolution, score: 88, date: '2026-01-15', professor_name: 'Carlos Silva' },
    ],
    historico_faixas: [
      { id: 'prog-1', from_belt: BeltLevel.White, to_belt: BeltLevel.Gray, date: '2025-03-15', evaluated_by_name: 'Carlos Silva' },
      { id: 'prog-2', from_belt: BeltLevel.Gray, to_belt: BeltLevel.Yellow, date: '2025-06-20', evaluated_by_name: 'Carlos Silva' },
      { id: 'prog-3', from_belt: BeltLevel.Yellow, to_belt: BeltLevel.Orange, date: '2025-09-10', evaluated_by_name: 'Carlos Silva' },
      { id: 'prog-4', from_belt: BeltLevel.Orange, to_belt: BeltLevel.Green, date: '2025-11-30', evaluated_by_name: 'Carlos Silva' },
      { id: 'prog-5', from_belt: BeltLevel.Green, to_belt: BeltLevel.Blue, date: '2026-02-01', evaluated_by_name: 'Carlos Silva' },
    ],
  };
}

export async function mockAvaliar(studentId: string, classId: string, criteria: EvaluationCriteria, score: number): Promise<Evaluation> {
  await delay();
  const now = new Date().toISOString();
  return {
    id: `ev-${Date.now()}`,
    student_id: studentId,
    class_id: classId,
    criteria,
    score,
    created_at: now,
    updated_at: now,
  };
}

export async function mockPromoverFaixa(studentId: string, toBelt: BeltLevel): Promise<Progression> {
  await delay();
  const now = new Date().toISOString();
  return {
    id: `prog-${Date.now()}`,
    student_id: studentId,
    evaluated_by: 'prof-1',
    from_belt: BeltLevel.Blue,
    to_belt: toBelt,
    created_at: now,
    updated_at: now,
  };
}

export async function mockGetAlunosDaTurma(_classId: string): Promise<StudentWithProgress[]> {
  await delay();
  return [
    { student_id: 'stu-1', display_name: 'João Mendes', avatar: null, belt: BeltLevel.Blue, total_aulas: 52, media_avaliacoes: 83 },
    { student_id: 'stu-2', display_name: 'Maria Oliveira', avatar: null, belt: BeltLevel.Purple, total_aulas: 120, media_avaliacoes: 91 },
    { student_id: 'stu-3', display_name: 'Pedro Santos', avatar: null, belt: BeltLevel.White, total_aulas: 15, media_avaliacoes: 72 },
    { student_id: 'stu-5', display_name: 'Lucas Ferreira', avatar: null, belt: BeltLevel.Green, total_aulas: 78, media_avaliacoes: 86 },
    { student_id: 'stu-7', display_name: 'Rafael Souza', avatar: null, belt: BeltLevel.Brown, total_aulas: 200, media_avaliacoes: 94 },
  ];
}
