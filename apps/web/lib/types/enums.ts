// ============================================================
// BlackBelt v2 — Enums (Re-exportação canônica)
//
// Fonte de verdade: domain.ts. Este arquivo é o ponto de
// importação público para enums — evita que consumers
// precisem importar domain.ts inteiro.
// ============================================================

/**
 * Perfis de acesso do sistema.
 * Cada user pode ter 1 profile por role por academy.
 *
 * Valores: admin, professor, aluno_adulto, aluno_teen, aluno_kids, responsavel
 */
export { Role } from './domain';

/**
 * Graduação de faixa — ordem crescente (white → black).
 * Belt só sobe, nunca desce.
 *
 * Ordem: white, gray, yellow, orange, green, blue, purple, brown, black
 */
export { BeltLevel } from './domain';

/**
 * Status de vínculo de um perfil a uma academia.
 *
 * Valores: active, inactive, suspended, pending
 */
export { MembershipStatus } from './domain';

/**
 * Status do ciclo de vida de uma assinatura.
 *
 * Valores: active, past_due, cancelled, trialing
 */
export { SubscriptionStatus } from './domain';

/**
 * Status do ciclo de vida de uma fatura.
 *
 * Valores: draft, open, paid, void, uncollectible
 */
export { InvoiceStatus } from './domain';

/**
 * Método utilizado para registrar presença.
 *
 * Valores: qr_code, manual, system
 */
export { AttendanceMethod } from './domain';

/**
 * Critérios de avaliação pedagógica.
 *
 * Valores: technique, discipline, attendance, evolution
 */
export { EvaluationCriteria } from './domain';

/**
 * Canal de envio de mensagem.
 *
 * Valores: direct, class_group
 */
export { MessageChannel } from './domain';

/**
 * Tipos de conquista que podem ser concedidas a um aluno.
 *
 * Valores: attendance_streak, belt_promotion, class_milestone, custom
 */
export { AchievementType } from './domain';

/**
 * Status de matrícula em turma.
 *
 * Valores: active, inactive
 */
export { EnrollmentStatus } from './domain';

/**
 * Relação do responsável com o aluno.
 *
 * Valores: pai, mae, tutor, outro
 */
export { GuardianRelation } from './domain';

/**
 * Intervalo de cobrança de um plano.
 *
 * Valores: monthly, quarterly, yearly
 */
export { PlanInterval } from './domain';
