// ============================================================
// BlackBelt v2 — Domain Types (Fonte de verdade tipada)
// 20 Entidades · 9 Enums · Zero 'any' · Strict mode
// ============================================================

// ────────────────────────────────────────────────────────────
// ENUMS
// ────────────────────────────────────────────────────────────

/** Perfis de acesso do sistema. Cada user pode ter 1 profile por role por academy. */
export enum Role {
  Superadmin = 'superadmin',
  Admin = 'admin',
  Gestor = 'gestor',
  Professor = 'professor',
  Recepcao = 'recepcao',
  AlunoAdulto = 'aluno_adulto',
  AlunoTeen = 'aluno_teen',
  AlunoKids = 'aluno_kids',
  Responsavel = 'responsavel',
  Franqueador = 'franqueador',
}

/** Graduação de faixa — ordem crescente. Belt só sobe, nunca desce. */
export enum BeltLevel {
  White = 'white',
  Gray = 'gray',
  Yellow = 'yellow',
  Orange = 'orange',
  Green = 'green',
  Blue = 'blue',
  Purple = 'purple',
  Brown = 'brown',
  Black = 'black',
}

/** Status de vínculo de um perfil a uma academia. */
export enum MembershipStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
  Pending = 'pending',
}

/** Status do ciclo de vida de uma assinatura. */
export enum SubscriptionStatus {
  Active = 'active',
  PastDue = 'past_due',
  Cancelled = 'cancelled',
  Trialing = 'trialing',
}

/** Status do ciclo de vida de uma fatura. */
export enum InvoiceStatus {
  Draft = 'draft',
  Open = 'open',
  Paid = 'paid',
  Void = 'void',
  Uncollectible = 'uncollectible',
}

/** Método utilizado para registrar presença. */
export enum AttendanceMethod {
  QrCode = 'qr_code',
  Manual = 'manual',
  System = 'system',
}

/** Critérios de avaliação pedagógica. */
export enum EvaluationCriteria {
  Technique = 'technique',
  Discipline = 'discipline',
  Attendance = 'attendance',
  Evolution = 'evolution',
}

/** Canal de envio de mensagem. */
export enum MessageChannel {
  Direct = 'direct',
  ClassGroup = 'class_group',
}

/** Tipos de conquista que podem ser concedidas a um aluno. */
export enum AchievementType {
  AttendanceStreak = 'attendance_streak',
  BeltPromotion = 'belt_promotion',
  ClassMilestone = 'class_milestone',
  Custom = 'custom',
}

/** Status de matrícula em turma. */
export enum EnrollmentStatus {
  Active = 'active',
  Inactive = 'inactive',
}

/** Relação do responsável com o aluno. */
export enum GuardianRelation {
  Pai = 'pai',
  Mae = 'mae',
  Tutor = 'tutor',
  Outro = 'outro',
}

/** Intervalo de cobrança de um plano. */
export enum PlanInterval {
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  Yearly = 'yearly',
}

// ────────────────────────────────────────────────────────────
// TIPOS AUXILIARES
// ────────────────────────────────────────────────────────────

/** Campos de auditoria presentes em toda entidade. */
export interface AuditFields {
  readonly created_at: string;
  readonly updated_at: string;
}

/** Slot de horário usado no schedule de Class. */
export interface ScheduleSlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

// ────────────────────────────────────────────────────────────
// MÓDULO: IDENTITY
// ────────────────────────────────────────────────────────────

/**
 * Conta de autenticação do sistema.
 *
 * @invariant email é único globalmente.
 */
export interface User extends AuditFields {
  readonly id: string;
  email: string;
  password_hash: string;
}

/**
 * Perfil vinculado a um User com um role específico.
 *
 * @invariant Um User pode ter N Profiles, mas apenas 1 por role por academy.
 */
export interface Profile extends AuditFields {
  readonly id: string;
  user_id: string;
  role: Role;
  display_name: string;
  avatar: string | null;
}

// ────────────────────────────────────────────────────────────
// MÓDULO: TENANT
// ────────────────────────────────────────────────────────────

/**
 * Academia de artes marciais — unidade de isolamento multi-tenant.
 *
 * @invariant slug é único globalmente. Todo dado do sistema pertence a uma Academy.
 */
export interface Academy extends AuditFields {
  readonly id: string;
  name: string;
  slug: string;
  plan_id: string | null;
  owner_id: string;
}

/**
 * Unidade física (filial) de uma Academy.
 *
 * @invariant Uma Academy pode ter N unidades físicas.
 */
export interface Unit extends AuditFields {
  readonly id: string;
  academy_id: string;
  name: string;
  address: string;
}

// ────────────────────────────────────────────────────────────
// MÓDULO: MEMBERSHIP
// ────────────────────────────────────────────────────────────

/**
 * Vínculo de um Profile a uma Academy com role e status.
 *
 * @invariant Vincula perfil à academia com role específico. Status controla acesso.
 */
export interface Membership extends AuditFields {
  readonly id: string;
  profile_id: string;
  academy_id: string;
  role: Role;
  status: MembershipStatus;
}

// ────────────────────────────────────────────────────────────
// MÓDULO: ENROLLMENT
// ────────────────────────────────────────────────────────────

/**
 * Registro de aluno em uma academy, com graduação de faixa.
 *
 * @invariant belt só pode subir, NUNCA descer.
 */
export interface Student extends AuditFields {
  readonly id: string;
  profile_id: string;
  academy_id: string;
  belt: BeltLevel;
  started_at: string;
}

/**
 * Vínculo de responsável (guardian) com um aluno menor de idade.
 *
 * @invariant Teen/Kids obrigatório ter pelo menos 1 Guardian.
 */
export interface Guardian extends AuditFields {
  readonly id: string;
  guardian_profile_id: string;
  student_id: string;
  relation: GuardianRelation;
}

// ────────────────────────────────────────────────────────────
// MÓDULO: CLASSES
// ────────────────────────────────────────────────────────────

/**
 * Modalidade de arte marcial oferecida por uma academy.
 *
 * @invariant name é único por academy.
 */
export interface Modality extends AuditFields {
  readonly id: string;
  academy_id: string;
  name: string;
  belt_required: BeltLevel;
}

/**
 * Turma de uma modalidade, vinculada a uma unidade e um professor.
 *
 * @invariant Professor só pode estar em 1 Class por horário (sem conflito de grade).
 */
export interface Class extends AuditFields {
  readonly id: string;
  modality_id: string;
  unit_id: string;
  professor_id: string;
  schedule: ScheduleSlot[];
}

/**
 * Matrícula de um aluno em uma turma.
 *
 * @invariant Aluno só se matricula se student.belt >= modality.belt_required.
 */
export interface ClassEnrollment extends AuditFields {
  readonly id: string;
  student_id: string;
  class_id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
}

// ────────────────────────────────────────────────────────────
// MÓDULO: ATTENDANCE
// ────────────────────────────────────────────────────────────

/**
 * Registro de presença de um aluno em uma aula.
 *
 * @invariant Máximo 1 check-in por aluno por aula por dia (unicidade composta).
 */
export interface Attendance extends AuditFields {
  readonly id: string;
  student_id: string;
  class_id: string;
  checked_at: string;
  method: AttendanceMethod;
}

// ────────────────────────────────────────────────────────────
// MÓDULO: PEDAGOGIC
// ────────────────────────────────────────────────────────────

/**
 * Progressão de faixa de um aluno, avaliada por um professor.
 *
 * @invariant Requer minimum attendance count para promoção de faixa.
 */
export interface Progression extends AuditFields {
  readonly id: string;
  student_id: string;
  evaluated_by: string;
  from_belt: BeltLevel;
  to_belt: BeltLevel;
}

/**
 * Avaliação pedagógica de um aluno em uma turma.
 *
 * @invariant score entre 0–100. Professor só avalia aluno da própria turma.
 */
export interface Evaluation extends AuditFields {
  readonly id: string;
  student_id: string;
  class_id: string;
  criteria: EvaluationCriteria;
  score: number;
}

// ────────────────────────────────────────────────────────────
// MÓDULO: CONTENT
// ────────────────────────────────────────────────────────────

/**
 * Vídeo educacional publicado por uma academy.
 *
 * @invariant url é única. belt_level filtra visibilidade — aluno só vê se belt >= belt_level.
 */
export interface Video extends AuditFields {
  readonly id: string;
  academy_id: string;
  title: string;
  url: string;
  belt_level: BeltLevel;
  duration: number;
}

/**
 * Série/playlist de vídeos com ordem explícita.
 *
 * @invariant video_ids mantém ordem explícita dos vídeos na série.
 */
export interface Series extends AuditFields {
  readonly id: string;
  academy_id: string;
  title: string;
  video_ids: string[];
}

// ────────────────────────────────────────────────────────────
// MÓDULO: SOCIAL
// ────────────────────────────────────────────────────────────

/**
 * Conquista concedida a um aluno (badge, marco, etc).
 *
 * @invariant Mesma achievement NÃO pode ser concedida 2x ao mesmo aluno (unicidade: student_id + type).
 */
export interface Achievement extends AuditFields {
  readonly id: string;
  student_id: string;
  type: AchievementType;
  granted_at: string;
  granted_by: string;
}

/**
 * Mensagem direta entre perfis.
 *
 * @invariant Apenas professor↔aluno ou admin↔qualquer. Validado por regra de negócio.
 */
export interface Message extends AuditFields {
  readonly id: string;
  from_id: string;
  to_id: string;
  channel: MessageChannel;
  content: string;
  read_at: string | null;
}

// ────────────────────────────────────────────────────────────
// MÓDULO: FINANCIAL
// ────────────────────────────────────────────────────────────

/**
 * Plano de assinatura oferecido por uma academy.
 *
 * @invariant price > 0. interval: monthly | quarterly | yearly.
 */
export interface Plan extends AuditFields {
  readonly id: string;
  academy_id: string;
  name: string;
  price: number;
  interval: PlanInterval;
  features: string[];
}

/**
 * Assinatura de um aluno a um plano.
 *
 * @invariant Só 1 Subscription ativa por aluno por academy.
 */
export interface Subscription extends AuditFields {
  readonly id: string;
  student_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_end: string;
}

/**
 * Fatura gerada a partir de uma assinatura.
 *
 * @invariant amount é imutável após emissão.
 */
export interface Invoice extends AuditFields {
  readonly id: string;
  subscription_id: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string;
}
