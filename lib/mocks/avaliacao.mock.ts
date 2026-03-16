import { BeltLevel } from '@/lib/types';
import type {
  StudentForEvaluationDTO,
  EvaluationHistoryDTO,
  SaveEvaluationPayload,
  SaveEvaluationResultDTO,
} from '@/lib/api/avaliacao.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGetStudentForEvaluation(_studentId: string): Promise<StudentForEvaluationDTO> {
  await delay();
  return {
    student_id: 'stu-1',
    display_name: 'Joao Mendes',
    avatar: null,
    belt: BeltLevel.Blue,
    total_classes: 52,
    last_evaluation_date: '2026-02-10',
    academy_id: 'acad-1',
    started_at: '2025-01-10',
    attendance_count: 52,
  };
}

export async function mockGetEvaluationHistory(_studentId: string): Promise<EvaluationHistoryDTO> {
  await delay();
  return {
    records: [
      {
        id: 'eval-prev-1',
        date: '2026-02-10',
        professor_name: 'Carlos Silva',
        tecnica: 72,
        disciplina: 80,
        evolucao: 68,
        consistencia: 75,
        observations: 'Bom progresso na guarda. Precisa melhorar passagem.',
      },
      {
        id: 'eval-prev-2',
        date: '2025-12-05',
        professor_name: 'Carlos Silva',
        tecnica: 65,
        disciplina: 78,
        evolucao: 60,
        consistencia: 70,
        observations: 'Evolucao consistente. Foco em raspagens.',
      },
      {
        id: 'eval-prev-3',
        date: '2025-09-20',
        professor_name: 'Carlos Silva',
        tecnica: 58,
        disciplina: 75,
        evolucao: 55,
        consistencia: 65,
        observations: 'Boa disciplina. Tecnica ainda precisa amadurecer.',
      },
    ],
    recommendations: [
      {
        id: 'vid-1',
        title: 'Passagem de Guarda - Conceitos Fundamentais',
        url: '/conteudo/vid-1',
        belt_level: BeltLevel.Blue,
        duration: 720,
        criteria: 'tecnica',
      },
      {
        id: 'vid-2',
        title: 'Drilling de Raspagens para Faixa Azul',
        url: '/conteudo/vid-2',
        belt_level: BeltLevel.Blue,
        duration: 540,
        criteria: 'evolucao',
      },
      {
        id: 'vid-3',
        title: 'Consistencia no Treino - Rotinas de Estudo',
        url: '/conteudo/vid-3',
        belt_level: BeltLevel.White,
        duration: 360,
        criteria: 'consistencia',
      },
    ],
  };
}

export async function mockSaveEvaluation(data: SaveEvaluationPayload): Promise<SaveEvaluationResultDTO> {
  await delay();
  const now = new Date().toISOString();
  return {
    id: `eval-${Date.now()}`,
    student_id: data.student_id,
    date: now,
    tecnica: data.tecnica,
    disciplina: data.disciplina,
    evolucao: data.evolucao,
    consistencia: data.consistencia,
    observations: data.observations,
    notification_sent: true,
  };
}

export async function mockPromoteBelt(
  _studentId: string,
  _toBelt: BeltLevel,
): Promise<{ success: boolean; new_belt: BeltLevel }> {
  await delay();
  return {
    success: true,
    new_belt: _toBelt,
  };
}
