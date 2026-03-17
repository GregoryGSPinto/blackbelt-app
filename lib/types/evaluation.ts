// ============================================================
// BlackBelt v2 — Evaluation Types (P-038)
// Professor evaluations with 4-axis scoring (1-10)
// ============================================================

import type { BeltLevel } from './domain';

/** Scores de avaliacao em 4 eixos, escala 1-10. */
export interface EvaluationScores {
  technique: number;    // 1-10
  posture: number;      // 1-10
  evolution: number;    // 1-10
  behavior: number;     // 1-10
}

/** Avaliacao individual de um aluno pelo professor. */
export interface StudentEvaluation {
  readonly id: string;
  student_id: string;
  student_name: string;
  professor_id: string;
  class_id: string;
  technique: number;     // 1-10
  posture: number;       // 1-10
  evolution: number;     // 1-10
  behavior: number;      // 1-10
  comment: string;
  readonly created_at: string;
}

/** Aluno disponivel para avaliacao, com contexto de turma. */
export interface EvaluableStudent {
  student_id: string;
  display_name: string;
  avatar: string | null;
  belt: BeltLevel;
  class_id: string;
  class_name: string;
  last_evaluation_date: string | null;
  evaluation_count: number;
}

/** Payload para salvar uma nova avaliacao. */
export interface CreateEvaluationPayload {
  student_id: string;
  class_id: string;
  technique: number;
  posture: number;
  evolution: number;
  behavior: number;
  comment: string;
}

/** Timeline de avaliacoes de um aluno. */
export interface EvaluationTimeline {
  student_id: string;
  student_name: string;
  evaluations: StudentEvaluation[];
}
