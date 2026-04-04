// ============================================================
// BlackBelt v2 — Regras de Negócio (Funções Puras)
//
// Zero side effects. Cada função recebe dados e retorna
// { allowed, reason? }. 100% testável sem mocks de infra.
// ============================================================

import type { Student, Profile, Modality, Video, Achievement, Attendance } from '../types';
import {
  Role,
  BeltLevel,
  AchievementType,
  BELT_ORDER,
  MIN_ATTENDANCE_FOR_PROMOTION,
} from '../types';

/** Resultado padronizado de toda regra de negócio. */
export interface RuleResult {
  allowed: boolean;
  reason?: string;
}

// ────────────────────────────────────────────────────────────
// Helpers internos
// ────────────────────────────────────────────────────────────

function beltIndex(belt: BeltLevel): number {
  return BELT_ORDER.indexOf(belt);
}

function isBeltSufficient(studentBelt: BeltLevel, requiredBelt: BeltLevel): boolean {
  return beltIndex(studentBelt) >= beltIndex(requiredBelt);
}

// ────────────────────────────────────────────────────────────
// 1. canEnrollInClass
// ────────────────────────────────────────────────────────────

/**
 * Verifica se o aluno pode se matricular na turma.
 * Regra: student.belt >= modality.belt_required.
 */
export function canEnrollInClass(student: Student, modality: Modality): RuleResult {
  if (!isBeltSufficient(student.belt, modality.belt_required)) {
    return {
      allowed: false,
      reason: `Faixa ${student.belt} insuficiente. Modalidade exige ${modality.belt_required}.`,
    };
  }
  return { allowed: true };
}

// ────────────────────────────────────────────────────────────
// 2. canPromoteBelt
// ────────────────────────────────────────────────────────────

/**
 * Verifica se o aluno pode ser promovido à faixa de destino.
 * Regras: faixa destino > faixa atual + attendance >= mínimo exigido.
 */
export function canPromoteBelt(
  student: Student,
  targetBelt: BeltLevel,
  attendanceCount: number,
): RuleResult {
  const currentIdx = beltIndex(student.belt);
  const targetIdx = beltIndex(targetBelt);

  if (targetIdx <= currentIdx) {
    return {
      allowed: false,
      reason: `Faixa de destino (${targetBelt}) deve ser superior à atual (${student.belt}).`,
    };
  }

  const minRequired = MIN_ATTENDANCE_FOR_PROMOTION[targetBelt];
  if (attendanceCount < minRequired) {
    return {
      allowed: false,
      reason: `Presenças insuficientes: ${attendanceCount}/${minRequired} para faixa ${targetBelt}.`,
    };
  }

  return { allowed: true };
}

// ────────────────────────────────────────────────────────────
// 3. canMarkAttendance
// ────────────────────────────────────────────────────────────

/**
 * Verifica se o professor pode marcar presença nesta turma.
 * Regras: precisa ter role=professor + ser o professor da turma.
 */
export function canMarkAttendance(
  professor: Profile,
  classEntity: { professor_id: string },
): RuleResult {
  if (professor.role !== Role.Professor && professor.role !== Role.Admin) {
    return {
      allowed: false,
      reason: 'Apenas professores ou admins podem marcar presença.',
    };
  }

  if (professor.role === Role.Professor && professor.id !== classEntity.professor_id) {
    return {
      allowed: false,
      reason: 'Professor não é responsável por esta turma.',
    };
  }

  return { allowed: true };
}

// ────────────────────────────────────────────────────────────
// 4. isAttendanceValid
// ────────────────────────────────────────────────────────────

/**
 * Verifica se o check-in é válido (sem duplicata no mesmo dia).
 * Regra: máximo 1 check-in por aluno por turma por dia.
 *
 * @param date - Data no formato YYYY-MM-DD para comparação.
 * @param existingAttendances - Registros de presença já existentes.
 */
export function isAttendanceValid(
  studentId: string,
  classId: string,
  date: string,
  existingAttendances: Attendance[],
): RuleResult {
  const duplicate = existingAttendances.some(
    (a) =>
      a.student_id === studentId &&
      a.class_id === classId &&
      a.checked_at.startsWith(date),
  );

  if (duplicate) {
    return {
      allowed: false,
      reason: 'Aluno já registrou presença nesta aula hoje.',
    };
  }

  return { allowed: true };
}

// ────────────────────────────────────────────────────────────
// 5. canSendMessage
// ────────────────────────────────────────────────────────────

const STUDENT_MESSAGING_ROLES: readonly Role[] = [Role.AlunoAdulto, Role.AlunoTeen];

/**
 * Verifica se o remetente pode enviar mensagem ao destinatário.
 * Regras: admin↔qualquer, professor↔aluno(adulto/teen),
 * professor↔responsável. Kids não participa de mensagens.
 */
export function canSendMessage(sender: Profile, recipient: Profile): RuleResult {
  if (sender.role === Role.AlunoKids || recipient.role === Role.AlunoKids) {
    return {
      allowed: false,
      reason: 'Perfil Kids não pode enviar ou receber mensagens.',
    };
  }

  if (sender.role === Role.Admin) {
    return { allowed: true };
  }

  if (
    sender.role === Role.Professor &&
    (STUDENT_MESSAGING_ROLES.includes(recipient.role) || recipient.role === Role.Responsavel)
  ) {
    return { allowed: true };
  }

  if (STUDENT_MESSAGING_ROLES.includes(sender.role) && recipient.role === Role.Professor) {
    return { allowed: true };
  }

  if (sender.role === Role.Responsavel && recipient.role === Role.Professor) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'Envio de mensagem não permitido entre estes perfis.',
  };
}

// ────────────────────────────────────────────────────────────
// 6. canGrantAchievement
// ────────────────────────────────────────────────────────────

/**
 * Verifica se a conquista pode ser concedida ao aluno.
 * Regras: apenas professor/admin + não pode ser duplicata.
 *
 * @param existingAchievements - Conquistas já concedidas ao aluno.
 */
export function canGrantAchievement(
  granter: Profile,
  studentId: string,
  type: AchievementType,
  existingAchievements: Achievement[],
): RuleResult {
  if (granter.role !== Role.Professor && granter.role !== Role.Admin) {
    return {
      allowed: false,
      reason: 'Apenas professores ou admins podem conceder conquistas.',
    };
  }

  const duplicate = existingAchievements.some(
    (a) => a.student_id === studentId && a.type === type,
  );

  if (duplicate) {
    return {
      allowed: false,
      reason: 'Aluno já possui esta conquista.',
    };
  }

  return { allowed: true };
}

// ────────────────────────────────────────────────────────────
// 7. canAccessContent
// ────────────────────────────────────────────────────────────

/**
 * Verifica se o aluno pode acessar o vídeo.
 * Regra: student.belt >= video.belt_level.
 */
export function canAccessContent(student: Student, video: Video): RuleResult {
  if (!isBeltSufficient(student.belt, video.belt_level)) {
    return {
      allowed: false,
      reason: `Faixa ${student.belt} insuficiente para conteúdo de nível ${video.belt_level}.`,
    };
  }
  return { allowed: true };
}

// ────────────────────────────────────────────────────────────
// 8. isGuardianRequired
// ────────────────────────────────────────────────────────────

/**
 * Verifica se o aluno precisa de responsável.
 * Regra: menor de 18 anos requer pelo menos 1 guardian.
 *
 * allowed=true → sem necessidade de guardian (adulto).
 * allowed=false → guardian obrigatório (menor de idade).
 */
export function isGuardianRequired(studentAge: number): RuleResult {
  if (studentAge < 18) {
    return {
      allowed: false,
      reason: 'Menor de 18 anos requer pelo menos 1 responsável.',
    };
  }
  return { allowed: true };
}

// ────────────────────────────────────────────────────────────
// 9. canManageSubscription
// ────────────────────────────────────────────────────────────

/**
 * Verifica se o perfil pode gerenciar a assinatura do aluno.
 * Regra: apenas admin ou responsável (guardian) do aluno.
 *
 * @param guardianProfileIds - IDs dos profiles que são guardians do aluno.
 */
export function canManageSubscription(
  profile: Profile,
  _studentId: string,
  guardianProfileIds: string[],
): RuleResult {
  if (profile.role === Role.Admin) {
    return { allowed: true };
  }

  if (profile.role === Role.Responsavel && guardianProfileIds.includes(profile.id)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'Apenas admin ou responsável do aluno pode gerenciar assinaturas.',
  };
}
