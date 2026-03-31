export type FinancialModel =
  | 'particular'
  | 'gympass'
  | 'totalpass'
  | 'bolsista'
  | 'cortesia'
  | 'funcionario'
  | 'convenio'
  | 'avulso';

export type ChargeMode = 'manual' | 'automatic' | 'hybrid';

export type PaymentMethodDefault =
  | 'pix'
  | 'credit_card'
  | 'debit_card'
  | 'boleto'
  | 'cash'
  | 'bank_transfer'
  | 'external_platform'
  | 'none';

export type FinancialRecurrence =
  | 'monthly'
  | 'quarterly'
  | 'semiannual'
  | 'annual'
  | 'per_class'
  | 'none';

export type FinancialStatus =
  | 'em_dia'
  | 'vence_hoje'
  | 'vence_em_breve'
  | 'atrasado'
  | 'isento'
  | 'cancelado';

export type CheckinGoalStatus = 'ok' | 'attention' | 'risk';

export type PaymentRecordStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'RECEIVED'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'CANCELLED';

export const FINANCIAL_MODEL_LABELS: Record<FinancialModel, string> = {
  particular: 'Particular',
  gympass: 'GymPass',
  totalpass: 'TotalPass',
  bolsista: 'Bolsista',
  cortesia: 'Cortesia',
  funcionario: 'Funcionário',
  convenio: 'Convênio',
  avulso: 'Avulso',
};

export const CHARGE_MODE_LABELS: Record<ChargeMode, string> = {
  manual: 'Manual',
  automatic: 'Automática',
  hybrid: 'Híbrida',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodDefault, string> = {
  pix: 'PIX',
  credit_card: 'Cartão de crédito',
  debit_card: 'Cartão de débito',
  boleto: 'Boleto',
  cash: 'Dinheiro',
  bank_transfer: 'Transferência',
  external_platform: 'Plataforma externa',
  none: 'Sem cobrança direta',
};

export const RECURRENCE_LABELS: Record<FinancialRecurrence, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
  per_class: 'Por aula/evento',
  none: 'Sem recorrência',
};

export const FINANCIAL_STATUS_LABELS: Record<FinancialStatus, string> = {
  em_dia: 'Em dia',
  vence_hoje: 'Vence hoje',
  vence_em_breve: 'Vence em breve',
  atrasado: 'Atrasado',
  isento: 'Isento',
  cancelado: 'Cancelado',
};

export const CHECKIN_GOAL_STATUS_LABELS: Record<CheckinGoalStatus, string> = {
  ok: 'Meta OK',
  attention: 'Atenção',
  risk: 'Risco',
};

export const FINANCIAL_STATUS_COLORS: Record<FinancialStatus, { bg: string; text: string }> = {
  em_dia: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
  vence_hoje: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  vence_em_breve: { bg: 'rgba(234,179,8,0.15)', text: '#EAB308' },
  atrasado: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  isento: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
  cancelado: { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' },
};

export const CHECKIN_GOAL_STATUS_COLORS: Record<CheckinGoalStatus, { bg: string; text: string }> = {
  ok: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
  attention: { bg: 'rgba(234,179,8,0.15)', text: '#EAB308' },
  risk: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
};

export interface StudentFinancialProfile {
  id: string;
  academy_id: string;
  membership_id: string;
  profile_id: string;
  student_name: string;
  student_email: string | null;
  student_phone: string | null;
  role: string;
  financial_model: FinancialModel;
  charge_mode: ChargeMode;
  payment_method_default: PaymentMethodDefault;
  recurrence: FinancialRecurrence;
  amount_cents: number;
  discount_amount_cents: number;
  scholarship_percent: number;
  due_day: number | null;
  next_due_date: string | null;
  financial_status: FinancialStatus;
  notes: string | null;
  monthly_checkin_minimum: number;
  current_month_checkins: number;
  alert_days_before_month_end: number;
  last_alert_sent_at: string | null;
  last_alert_sent_to_student: boolean;
  last_alert_sent_to_guardian: boolean;
  last_alert_sent_to_owner: boolean;
  checkin_goal_status: CheckinGoalStatus;
  partnership_name: string | null;
  partnership_transfer_mode: string | null;
  exemption_reason: string | null;
  period_start_date: string | null;
  period_end_date: string | null;
}

export interface StudentFinancialListItem extends StudentFinancialProfile {
  student_id: string | null;
  payment_status_label: string;
  latest_payment_id: string | null;
  latest_payment_status: PaymentRecordStatus | null;
  latest_payment_due_date: string | null;
  latest_payment_paid_at: string | null;
  latest_payment_amount_cents: number | null;
  latest_payment_method: string | null;
  latest_payment_notes: string | null;
  missing_checkins: number;
  alert_sent_today: boolean;
}

export interface StudentFinancialFilters {
  search?: string;
  financialModel?: FinancialModel;
  financialStatus?: FinancialStatus;
  onlyExempt?: boolean;
  belowGoal?: boolean;
}

export interface StudentFinancialDashboard {
  expectedRevenueCents: number;
  receivedRevenueCents: number;
  overdueCount: number;
  dueTodayCount: number;
  dueSoonCount: number;
  belowGoalCount: number;
  alertsSentToday: number;
  byModel: Array<{ model: FinancialModel; count: number }>;
  immediateAttention: StudentFinancialListItem[];
}

export interface StudentFinancialAlertRecord {
  membership_id: string;
  recipient_type: 'student' | 'guardian' | 'owner';
  alert_kind: 'checkin_goal' | 'financial_status';
  alert_reference_date: string;
}

export interface StudentFinancialProfileInput {
  financial_model: FinancialModel;
  charge_mode: ChargeMode;
  payment_method_default: PaymentMethodDefault;
  recurrence: FinancialRecurrence;
  amount_cents: number;
  discount_amount_cents: number;
  scholarship_percent: number;
  due_day: number | null;
  next_due_date: string | null;
  notes: string | null;
  monthly_checkin_minimum: number;
  alert_days_before_month_end: number;
  partnership_name: string | null;
  partnership_transfer_mode: string | null;
  exemption_reason: string | null;
  period_start_date: string | null;
  period_end_date: string | null;
}

export function formatCentsToBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function normalizeMoneyToCents(raw: string): number {
  const normalized = raw.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const value = Number(normalized);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
}

export function addMonthsKeepingDay(date: Date, months: number, dueDay: number | null): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(dueDay ?? 1, lastDay));
  return target;
}

export function computeNextDueDate(
  recurrence: FinancialRecurrence,
  dueDay: number | null,
  referenceDate: Date = new Date(),
): string | null {
  if (recurrence === 'none') return null;

  const effectiveDueDay = dueDay ?? referenceDate.getDate();
  const current = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
  current.setDate(Math.min(effectiveDueDay, lastDay));

  if (current >= stripTime(referenceDate)) {
    return toDateOnly(current);
  }

  switch (recurrence) {
    case 'monthly':
      return toDateOnly(addMonthsKeepingDay(referenceDate, 1, effectiveDueDay));
    case 'quarterly':
      return toDateOnly(addMonthsKeepingDay(referenceDate, 3, effectiveDueDay));
    case 'semiannual':
      return toDateOnly(addMonthsKeepingDay(referenceDate, 6, effectiveDueDay));
    case 'annual':
      return toDateOnly(addMonthsKeepingDay(referenceDate, 12, effectiveDueDay));
    case 'per_class':
      return toDateOnly(stripTime(referenceDate));
    default:
      return null;
  }
}

export function computeFinancialStatus(params: {
  financialModel: FinancialModel;
  amountCents: number;
  nextDueDate: string | null;
  periodEndDate?: string | null;
  referenceDate?: Date;
}): FinancialStatus {
  const today = stripTime(params.referenceDate ?? new Date());
  const periodEnd = params.periodEndDate ? stripTime(new Date(params.periodEndDate)) : null;
  const netAmount = Math.max(params.amountCents, 0);

  if (periodEnd && periodEnd < today) return 'cancelado';

  if (['cortesia', 'funcionario'].includes(params.financialModel)) return 'isento';
  if (params.financialModel === 'bolsista' && netAmount === 0) return 'isento';
  if (params.financialModel === 'gympass' || params.financialModel === 'totalpass') return 'em_dia';

  if (!params.nextDueDate) return 'em_dia';

  const due = stripTime(new Date(params.nextDueDate));
  const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) return 'atrasado';
  if (diffDays === 0) return 'vence_hoje';
  if (diffDays <= 3) return 'vence_em_breve';
  return 'em_dia';
}

export function getMissingCheckins(currentMonthCheckins: number, minimum: number): number {
  return Math.max(minimum - currentMonthCheckins, 0);
}

export function computeCheckinGoalStatus(params: {
  financialModel: FinancialModel;
  currentMonthCheckins: number;
  monthlyCheckinMinimum: number;
  referenceDate?: Date;
}): CheckinGoalStatus {
  if (!['gympass', 'totalpass'].includes(params.financialModel)) return 'ok';
  if (params.monthlyCheckinMinimum <= 0) return 'ok';

  const missing = getMissingCheckins(params.currentMonthCheckins, params.monthlyCheckinMinimum);
  if (missing === 0) return 'ok';

  const today = stripTime(params.referenceDate ?? new Date());
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = Math.max(
    Math.ceil((stripTime(monthEnd).getTime() - today.getTime()) / 86400000),
    0,
  );

  if (daysLeft <= 3 || missing > Math.max(daysLeft, 1)) return 'risk';
  return 'attention';
}

export function shouldSendCheckinAlert(params: {
  financialModel: FinancialModel;
  checkinGoalStatus: CheckinGoalStatus;
  alertDaysBeforeMonthEnd: number;
  lastAlertSentAt?: string | null;
  referenceDate?: Date;
}): boolean {
  if (!['gympass', 'totalpass'].includes(params.financialModel)) return false;
  if (params.checkinGoalStatus === 'ok') return false;

  const today = stripTime(params.referenceDate ?? new Date());
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = Math.max(
    Math.ceil((stripTime(monthEnd).getTime() - today.getTime()) / 86400000),
    0,
  );

  if (daysLeft > params.alertDaysBeforeMonthEnd) return false;

  if (!params.lastAlertSentAt) return true;

  return toDateOnly(new Date(params.lastAlertSentAt)) !== toDateOnly(today);
}

export function validateFinancialProfileInput(
  input: StudentFinancialProfileInput,
): StudentFinancialProfileInput {
  const amount = Math.max(0, Math.round(input.amount_cents || 0));
  const discount = Math.max(0, Math.round(input.discount_amount_cents || 0));
  const scholarship = clampNumber(input.scholarship_percent, 0, 100, 2);
  const dueDay = input.due_day === null ? null : clampInt(input.due_day, 1, 31);
  const monthlyMinimum = Math.max(0, Math.round(input.monthly_checkin_minimum || 0));
  const alertDays = clampInt(input.alert_days_before_month_end, 0, 15);

  return {
    ...input,
    amount_cents: amount,
    discount_amount_cents: Math.min(discount, amount),
    scholarship_percent: scholarship,
    due_day: dueDay,
    monthly_checkin_minimum: monthlyMinimum,
    alert_days_before_month_end: alertDays,
    notes: emptyToNull(input.notes),
    next_due_date: emptyToNull(input.next_due_date),
    partnership_name: emptyToNull(input.partnership_name),
    partnership_transfer_mode: emptyToNull(input.partnership_transfer_mode),
    exemption_reason: emptyToNull(input.exemption_reason),
    period_start_date: emptyToNull(input.period_start_date),
    period_end_date: emptyToNull(input.period_end_date),
  };
}

export function isExemptModel(model: FinancialModel): boolean {
  return model === 'cortesia' || model === 'funcionario';
}

export function needsExternalPlatform(model: FinancialModel): boolean {
  return model === 'gympass' || model === 'totalpass';
}

export function hasDirectCharge(model: FinancialModel): boolean {
  return !needsExternalPlatform(model) && model !== 'cortesia' && model !== 'funcionario';
}

function clampInt(value: number | null | undefined, min: number, max: number): number {
  const numeric = Math.round(Number(value || 0));
  return Math.min(max, Math.max(min, numeric));
}

function clampNumber(value: number | null | undefined, min: number, max: number, decimals = 0): number {
  const numeric = Number(value || 0);
  const safe = Math.min(max, Math.max(min, numeric));
  return Number(safe.toFixed(decimals));
}

function emptyToNull(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateOnly(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
