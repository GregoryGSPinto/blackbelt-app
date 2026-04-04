import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';
import {
  CHARGE_MODE_LABELS as CHARGE_MODE_LABELS_MAP,
  CHECKIN_GOAL_STATUS_COLORS as CHECKIN_GOAL_STATUS_COLORS_MAP,
  CHECKIN_GOAL_STATUS_LABELS as CHECKIN_GOAL_STATUS_LABELS_MAP,
  computeCheckinGoalStatus,
  computeFinancialStatus,
  computeNextDueDate,
  FINANCIAL_MODEL_LABELS as FINANCIAL_MODEL_LABELS_MAP,
  FINANCIAL_STATUS_COLORS as FINANCIAL_STATUS_COLORS_MAP,
  FINANCIAL_STATUS_LABELS as FINANCIAL_STATUS_LABELS_MAP,
  formatCentsToBRL,
  getMissingCheckins,
  hasDirectCharge,
  needsExternalPlatform,
  PAYMENT_METHOD_LABELS as PAYMENT_METHOD_LABELS_MAP,
  RECURRENCE_LABELS as RECURRENCE_LABELS_MAP,
  shouldSendCheckinAlert,
  validateFinancialProfileInput,
  type ChargeMode,
  type CheckinGoalStatus,
  type FinancialModel,
  type FinancialRecurrence,
  type FinancialStatus,
  type PaymentMethodDefault,
  type PaymentRecordStatus,
  type StudentFinancialDashboard,
  type StudentFinancialFilters,
  type StudentFinancialListItem,
  type StudentFinancialProfile,
  type StudentFinancialProfileInput,
} from '@/lib/domain/student-financial';

export type BillingType = FinancialModel;
export type PaymentMethod = PaymentMethodDefault;
export type Recurrence = FinancialRecurrence;
export type BillingStatus = FinancialStatus;
export type { ChargeMode, StudentFinancialListItem, StudentFinancialDashboard };
export { formatCentsToBRL };
export const BILLING_TYPE_LABELS = FINANCIAL_MODEL_LABELS_MAP;
export const PAYMENT_METHOD_DEFAULT_LABELS = PAYMENT_METHOD_LABELS_MAP;
export const PAYMENT_METHOD_LABELS_LEGACY = PAYMENT_METHOD_LABELS_MAP;
export const PAYMENT_METHOD_LABELS = PAYMENT_METHOD_LABELS_MAP;
export const RECURRENCE_LABELS_EXPORT = RECURRENCE_LABELS_MAP;
export const RECURRENCE_LABELS = RECURRENCE_LABELS_MAP;
export const BILLING_STATUS_LABELS = FINANCIAL_STATUS_LABELS_MAP;
export const BILLING_STATUS_COLORS = FINANCIAL_STATUS_COLORS_MAP;
export const CHARGE_MODE_OPTIONS = CHARGE_MODE_LABELS_MAP;
export const CHECKIN_GOAL_LABELS = CHECKIN_GOAL_STATUS_LABELS_MAP;
export const CHECKIN_GOAL_COLORS = CHECKIN_GOAL_STATUS_COLORS_MAP;

export type MemberBilling = StudentFinancialProfile;

export type MemberBillingUpdate = Partial<StudentFinancialProfileInput>;

export interface StudentInvoice {
  id: string;
  membership_id: string | null;
  profile_id: string;
  display_name: string;
  amount: number;
  discount: number;
  net_amount: number;
  status: PaymentRecordStatus;
  billing_type: FinancialModel;
  payment_method: string | null;
  reference_month: string | null;
  due_date: string;
  paid_at: string | null;
  paid_amount: number | null;
  manual_payment: boolean;
  payment_notes: string | null;
  invoice_url: string | null;
}

export interface FinancialSummary {
  total_expected: number;
  total_received: number;
  total_pending: number;
  total_overdue: number;
  overdue_count: number;
  by_type: Array<{ type: FinancialModel; count: number; revenue: number }>;
}

export interface InvoiceFilters {
  status?: PaymentRecordStatus;
  billing_type?: FinancialModel;
  reference_month?: string;
  search?: string;
}

type RawFinancialProfile = {
  id: string;
  academy_id: string;
  membership_id: string;
  profile_id: string;
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
};

type RawMembership = {
  id: string;
  profile_id: string;
  academy_id: string;
  role: string;
  status: string;
};

type RawProfile = {
  id: string;
  display_name: string | null;
  email?: string | null;
  phone?: string | null;
};

type RawStudent = {
  id: string;
  profile_id: string;
};

type RawStudentPayment = {
  id: string;
  academy_id: string;
  student_profile_id: string;
  membership_id: string | null;
  amount_cents: number;
  due_date: string;
  status: PaymentRecordStatus;
  invoice_url: string | null;
  payment_method: string | null;
  payment_notes: string | null;
  paid_amount_cents: number | null;
  paid_at: string | null;
  reference_month: string | null;
  created_at: string;
};

type RawAlert = {
  id: string;
  membership_id: string;
  recipient_type: 'student' | 'guardian' | 'owner';
  alert_kind: 'checkin_goal' | 'financial_status';
  alert_reference_date: string;
  sent_at: string;
};

function mapPaymentStatusLabel(status: PaymentRecordStatus | null): string {
  if (!status) return 'Sem histórico';
  const map: Record<PaymentRecordStatus, string> = {
    PENDING: 'Pendente',
    CONFIRMED: 'Pago',
    RECEIVED: 'Recebido',
    OVERDUE: 'Atrasado',
    REFUNDED: 'Devolvido',
    CANCELLED: 'Cancelado',
  };
  return map[status];
}

function monthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function paymentToInvoice(payment: RawStudentPayment, name: string, billingType: FinancialModel): StudentInvoice {
  const amount = Number(payment.amount_cents ?? 0);
  return {
    id: payment.id,
    membership_id: payment.membership_id,
    profile_id: payment.student_profile_id,
    display_name: name,
    amount,
    discount: 0,
    net_amount: amount,
    status: payment.status,
    billing_type: billingType,
    payment_method: payment.payment_method,
    reference_month: payment.reference_month,
    due_date: payment.due_date,
    paid_at: payment.paid_at,
    paid_amount: payment.paid_amount_cents,
    manual_payment: payment.status === 'RECEIVED',
    payment_notes: payment.payment_notes,
    invoice_url: payment.invoice_url,
  };
}

function computeCurrentCheckins(
  profileId: string,
  attendanceCounts: Map<string, number>,
  checkinCounts: Map<string, number>,
  fallback: number,
): number {
  return Math.max(attendanceCounts.get(profileId) ?? 0, checkinCounts.get(profileId) ?? 0, fallback);
}

async function getSupabase() {
  const { createBrowserClient } = await import('@/lib/supabase/client');
  return createBrowserClient();
}

async function fetchStudentsMap(academyId: string, profileIds: string[]): Promise<Map<string, string>> {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from('students')
    .select('id, profile_id')
    .eq('academy_id', academyId)
    .in('profile_id', profileIds);

  return new Map((data ?? []).map((row: RawStudent) => {
    const typedRow = row as RawStudent;
    return [typedRow.profile_id, typedRow.id] as const;
  }));
}

async function fetchMonthCheckinMaps(academyId: string, profileIds: string[]) {
  if (profileIds.length === 0) {
    return { attendanceCounts: new Map<string, number>(), checkinCounts: new Map<string, number>() };
  }

  const supabase = await getSupabase();
  const startOfMonth = `${monthKey()}-01`;
  const studentMap = await fetchStudentsMap(academyId, profileIds);
  const studentIds = Array.from(studentMap.values());

  const [attendanceRes, checkinsRes] = await Promise.all([
    studentIds.length > 0
      ? supabase
        .from('attendance')
        .select('student_id, checked_at')
        .in('student_id', studentIds)
        .gte('checked_at', startOfMonth)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from('checkins')
      .select('profile_id, check_in_at')
      .eq('academy_id', academyId)
      .in('profile_id', profileIds)
      .gte('check_in_at', startOfMonth),
  ]);

  const attendanceCounts = new Map<string, number>();
  const reverseStudentMap = new Map<string, string>();
  studentMap.forEach((studentId, profileId) => reverseStudentMap.set(studentId, profileId));

  for (const row of attendanceRes.data ?? []) {
    const profileId = reverseStudentMap.get((row as { student_id: string }).student_id);
    if (!profileId) continue;
    attendanceCounts.set(profileId, (attendanceCounts.get(profileId) ?? 0) + 1);
  }

  const checkinCounts = new Map<string, number>();
  for (const row of checkinsRes.data ?? []) {
    const profileId = (row as { profile_id: string }).profile_id;
    checkinCounts.set(profileId, (checkinCounts.get(profileId) ?? 0) + 1);
  }

  return { attendanceCounts, checkinCounts };
}

async function hydrateFinancialProfiles(
  academyId: string,
  rawProfiles: RawFinancialProfile[],
): Promise<StudentFinancialListItem[]> {
  if (rawProfiles.length === 0) return [];

  const supabase = await getSupabase();
  const profileIds = rawProfiles.map((row) => row.profile_id);
  const membershipIds = rawProfiles.map((row) => row.membership_id);

  const [profilesRes, membershipsRes, paymentsRes, alertsRes, monthCheckins, studentMap] = await Promise.all([
    supabase.from('profiles').select('id, display_name, email, phone').in('id', profileIds),
    supabase.from('memberships').select('id, profile_id, academy_id, role, status').in('id', membershipIds),
    supabase
      .from('student_payments')
      .select('id, academy_id, student_profile_id, membership_id, amount_cents, due_date, status, invoice_url, payment_method, payment_notes, paid_amount_cents, paid_at, reference_month, created_at')
      .eq('academy_id', academyId)
      .in('student_profile_id', profileIds)
      .order('due_date', { ascending: false }),
    supabase
      .from('student_financial_alerts')
      .select('id, membership_id, recipient_type, alert_kind, alert_reference_date, sent_at')
      .eq('academy_id', academyId)
      .in('membership_id', membershipIds)
      .gte('alert_reference_date', `${monthKey()}-01`),
    fetchMonthCheckinMaps(academyId, profileIds),
    fetchStudentsMap(academyId, profileIds),
  ]);

  const profileMap = new Map<string, RawProfile>(
    ((profilesRes.data ?? []) as RawProfile[]).map((row) => [row.id, row]),
  );
  const membershipMap = new Map<string, RawMembership>(
    ((membershipsRes.data ?? []) as RawMembership[]).map((row) => [row.id, row]),
  );
  const alertsByMembership = new Map<string, RawAlert[]>();
  for (const alert of alertsRes.data ?? []) {
    const row = alert as RawAlert;
    alertsByMembership.set(row.membership_id, [...(alertsByMembership.get(row.membership_id) ?? []), row]);
  }

  const paymentByProfile = new Map<string, RawStudentPayment[]>();
  for (const payment of paymentsRes.data ?? []) {
    const row = payment as RawStudentPayment;
    paymentByProfile.set(row.student_profile_id, [...(paymentByProfile.get(row.student_profile_id) ?? []), row]);
  }

  return rawProfiles.map((row) => {
    const profile = profileMap.get(row.profile_id);
    const membership = membershipMap.get(row.membership_id);
    const payments = paymentByProfile.get(row.profile_id) ?? [];
    const latestPayment = payments[0] ?? null;
    const currentMonthCheckins = computeCurrentCheckins(
      row.profile_id,
      monthCheckins.attendanceCounts,
      monthCheckins.checkinCounts,
      row.current_month_checkins,
    );
    const nextDueDate = row.next_due_date ?? computeNextDueDate(row.recurrence, row.due_day);
    const financialStatus = computeFinancialStatus({
      financialModel: row.financial_model,
      amountCents: row.amount_cents - row.discount_amount_cents,
      nextDueDate,
      periodEndDate: row.period_end_date,
    });
    const checkinGoalStatus = computeCheckinGoalStatus({
      financialModel: row.financial_model,
      currentMonthCheckins,
      monthlyCheckinMinimum: row.monthly_checkin_minimum,
    });
    const alertSentToday = (alertsByMembership.get(row.membership_id) ?? []).some(
      (alert) => alert.alert_reference_date === new Date().toISOString().slice(0, 10),
    );

    return {
      ...row,
      student_id: (studentMap.get(row.profile_id) ?? null) as string | null,
      student_name: profile?.display_name ?? 'Aluno',
      student_email: profile?.email ?? null,
      student_phone: profile?.phone ?? null,
      role: membership?.role ?? 'aluno_adulto',
      current_month_checkins: currentMonthCheckins,
      next_due_date: nextDueDate,
      financial_status: financialStatus,
      checkin_goal_status: checkinGoalStatus,
      payment_status_label: mapPaymentStatusLabel(latestPayment?.status ?? null),
      latest_payment_id: latestPayment?.id ?? null,
      latest_payment_status: latestPayment?.status ?? null,
      latest_payment_due_date: latestPayment?.due_date ?? null,
      latest_payment_paid_at: latestPayment?.paid_at ?? null,
      latest_payment_amount_cents: latestPayment?.amount_cents ?? null,
      latest_payment_method: latestPayment?.payment_method ?? null,
      latest_payment_notes: latestPayment?.payment_notes ?? null,
      missing_checkins: getMissingCheckins(currentMonthCheckins, row.monthly_checkin_minimum),
      alert_sent_today: alertSentToday,
    };
  });
}

async function getFinancialRows(
  academyId: string,
  filters?: StudentFinancialFilters,
): Promise<StudentFinancialListItem[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('student_financial_profiles')
    .select('*')
    .eq('academy_id', academyId)
    .order('updated_at', { ascending: false });

  if (error) {
    logServiceError(error, 'student-billing');
    return [];
  }

  let hydrated = await hydrateFinancialProfiles(academyId, (data ?? []) as RawFinancialProfile[]);

  if (filters?.search) {
    const term = filters.search.toLowerCase();
    hydrated = hydrated.filter((row) => row.student_name.toLowerCase().includes(term));
  }
  if (filters?.financialModel) hydrated = hydrated.filter((row) => row.financial_model === filters.financialModel);
  if (filters?.financialStatus) hydrated = hydrated.filter((row) => row.financial_status === filters.financialStatus);
  if (filters?.belowGoal) hydrated = hydrated.filter((row) => row.checkin_goal_status !== 'ok');
  if (filters?.onlyExempt) hydrated = hydrated.filter((row) => row.financial_status === 'isento');

  return hydrated.sort((a, b) => {
    const priority: Record<FinancialStatus, number> = {
      atrasado: 0,
      vence_hoje: 1,
      vence_em_breve: 2,
      em_dia: 3,
      isento: 4,
      cancelado: 5,
    };
    return priority[a.financial_status] - priority[b.financial_status];
  });
}

async function ensureFinancialProfile(
  membershipId: string,
): Promise<RawFinancialProfile | null> {
  const supabase = await getSupabase();
  const { data: existing } = await supabase
    .from('student_financial_profiles')
    .select('*')
    .eq('membership_id', membershipId)
    .maybeSingle();

  if (existing) return existing as RawFinancialProfile;

  const { data: membership, error } = await supabase
    .from('memberships')
    .select('id, academy_id, profile_id, role')
    .eq('id', membershipId)
    .single();

  if (error || !membership) {
    logServiceError(error, 'student-billing');
    return null;
  }

  const baseInsert = {
    academy_id: membership.academy_id,
    membership_id: membership.id,
    profile_id: membership.profile_id,
  };
  const { data: created, error: insertError } = await supabase
    .from('student_financial_profiles')
    .insert(baseInsert)
    .select('*')
    .single();

  if (insertError) {
    logServiceError(insertError, 'student-billing');
    return null;
  }

  return created as RawFinancialProfile;
}

export async function getMemberBilling(membershipId: string): Promise<MemberBilling | null> {
  try {
    if (isMock()) return null;
    const profile = await ensureFinancialProfile(membershipId);
    if (!profile) return null;
    const rows = await hydrateFinancialProfiles(profile.academy_id, [profile]);
    return rows[0] ?? null;
  } catch (error) {
    logServiceError(error, 'student-billing');
    return null;
  }
}

export async function updateMemberBilling(
  membershipId: string,
  data: MemberBillingUpdate,
): Promise<void> {
  try {
    if (isMock()) return;

    const existing = await ensureFinancialProfile(membershipId);
    if (!existing) throw new Error('Perfil financeiro não encontrado.');

    const input = validateFinancialProfileInput({
      financial_model: data.financial_model ?? existing.financial_model,
      charge_mode: data.charge_mode ?? existing.charge_mode,
      payment_method_default: data.payment_method_default ?? existing.payment_method_default,
      recurrence: data.recurrence ?? existing.recurrence,
      amount_cents: data.amount_cents ?? existing.amount_cents,
      discount_amount_cents: data.discount_amount_cents ?? existing.discount_amount_cents,
      scholarship_percent: data.scholarship_percent ?? existing.scholarship_percent,
      due_day: data.due_day ?? existing.due_day,
      next_due_date: data.next_due_date ?? existing.next_due_date,
      notes: data.notes ?? existing.notes,
      monthly_checkin_minimum: data.monthly_checkin_minimum ?? existing.monthly_checkin_minimum,
      alert_days_before_month_end: data.alert_days_before_month_end ?? existing.alert_days_before_month_end,
      partnership_name: data.partnership_name ?? existing.partnership_name,
      partnership_transfer_mode: data.partnership_transfer_mode ?? existing.partnership_transfer_mode,
      exemption_reason: data.exemption_reason ?? existing.exemption_reason,
      period_start_date: data.period_start_date ?? existing.period_start_date,
      period_end_date: data.period_end_date ?? existing.period_end_date,
    });

    const currentMonthCheckins = existing.current_month_checkins;
    const nextDueDate = input.next_due_date ?? computeNextDueDate(input.recurrence, input.due_day);
    const financialStatus = computeFinancialStatus({
      financialModel: input.financial_model,
      amountCents: input.amount_cents - input.discount_amount_cents,
      nextDueDate,
      periodEndDate: input.period_end_date,
    });
    const checkinGoalStatus = computeCheckinGoalStatus({
      financialModel: input.financial_model,
      currentMonthCheckins,
      monthlyCheckinMinimum: input.monthly_checkin_minimum,
    });

    const supabase = await getSupabase();
    const payload = {
      ...input,
      next_due_date: nextDueDate,
      financial_status: financialStatus,
      current_month_checkins: currentMonthCheckins,
      checkin_goal_status: checkinGoalStatus,
    };
    const { error } = await supabase
      .from('student_financial_profiles')
      .update(payload)
      .eq('membership_id', membershipId);

    if (error) throw error;
  } catch (error) {
    logServiceError(error, 'student-billing');
    throw new Error('Erro ao atualizar dados financeiros.');
  }
}

export async function getMembersByBillingStatus(
  academyId: string,
  status?: BillingStatus,
): Promise<MemberBilling[]> {
  const rows = await getFinancialRows(academyId, status ? { financialStatus: status } : undefined);
  return rows;
}

export async function listStudentFinancialRows(
  academyId: string,
  filters?: StudentFinancialFilters,
): Promise<StudentFinancialListItem[]> {
  try {
    if (isMock()) return [];
    return await getFinancialRows(academyId, filters);
  } catch (error) {
    logServiceError(error, 'student-billing');
    return [];
  }
}

export async function getStudentInvoices(
  academyId: string,
  filters?: InvoiceFilters,
): Promise<StudentInvoice[]> {
  try {
    if (isMock()) return [];
    const supabase = await getSupabase();
    let query = supabase
      .from('student_payments')
      .select('id, academy_id, student_profile_id, membership_id, amount_cents, due_date, status, invoice_url, payment_method, payment_notes, paid_amount_cents, paid_at, reference_month, created_at')
      .eq('academy_id', academyId)
      .order('due_date', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.reference_month) query = query.eq('reference_month', filters.reference_month);

    const { data, error } = await query;
    if (error) {
      logServiceError(error, 'student-billing');
      return [];
    }

    const rows = await getFinancialRows(academyId);
    const nameMap = new Map(rows.map((row) => [row.profile_id, row.student_name]));
    const billingTypeMap = new Map(rows.map((row) => [row.profile_id, row.financial_model]));

    let invoices = ((data ?? []) as RawStudentPayment[]).map((payment) =>
      paymentToInvoice(
        payment,
        nameMap.get(payment.student_profile_id) ?? 'Aluno',
        billingTypeMap.get(payment.student_profile_id) ?? 'particular',
      ),
    );

    if (filters?.billing_type) {
      invoices = invoices.filter((invoice) => invoice.billing_type === filters.billing_type);
    }
    if (filters?.search) {
      const term = filters.search.toLowerCase();
      invoices = invoices.filter((invoice) => invoice.display_name.toLowerCase().includes(term));
    }

    return invoices;
  } catch (error) {
    logServiceError(error, 'student-billing');
    return [];
  }
}

export async function createInvoice(data: {
  academy_id: string;
  membership_id: string;
  profile_id: string;
  amount: number;
  discount: number;
  net_amount: number;
  billing_type: FinancialModel;
  payment_method: string | null;
  reference_month: string;
  due_date: string;
}): Promise<StudentInvoice | null> {
  try {
    if (isMock()) return null;
    const supabase = await getSupabase();
    const { data: created, error } = await supabase
      .from('student_payments')
      .insert({
        academy_id: data.academy_id,
        membership_id: data.membership_id,
        student_profile_id: data.profile_id,
        description: `Cobrança ${data.reference_month}`,
        amount_cents: data.net_amount,
        due_date: data.due_date,
        status: 'PENDING',
        reference_month: data.reference_month,
        payment_method: data.payment_method,
        source: 'manual_charge',
      })
      .select('id, academy_id, student_profile_id, membership_id, amount_cents, due_date, status, invoice_url, payment_method, payment_notes, paid_amount_cents, paid_at, reference_month, created_at')
      .single();

    if (error) throw error;

    const row = created as RawStudentPayment;
    return paymentToInvoice(row, 'Aluno', data.billing_type);
  } catch (error) {
    logServiceError(error, 'student-billing');
    throw new Error('Erro ao criar cobrança.');
  }
}

export async function generateMonthlyInvoices(academyId: string): Promise<number> {
  try {
    if (isMock()) return 0;

    const rows = await getFinancialRows(academyId);
    const eligible = rows.filter((row) => hasDirectCharge(row.financial_model) && row.recurrence !== 'none' && row.amount_cents > 0);
    if (eligible.length === 0) return 0;

    const supabase = await getSupabase();
    const refMonth = monthKey();
    const { data: existing } = await supabase
      .from('student_payments')
      .select('membership_id')
      .eq('academy_id', academyId)
      .eq('reference_month', refMonth)
      .in('membership_id', eligible.map((row) => row.membership_id));

    const existingSet = new Set((existing ?? []).map((row: { membership_id: string | null }) => row.membership_id).filter(Boolean));

    const payload = eligible
      .filter((row) => !existingSet.has(row.membership_id))
      .map((row) => ({
        academy_id: academyId,
        membership_id: row.membership_id,
        student_profile_id: row.profile_id,
        description: `Cobrança recorrente ${refMonth}`,
        amount_cents: Math.max(row.amount_cents - row.discount_amount_cents, 0),
        due_date: row.next_due_date ?? computeNextDueDate(row.recurrence, row.due_day) ?? `${refMonth}-10`,
        status: computeFinancialStatus({
          financialModel: row.financial_model,
          amountCents: row.amount_cents - row.discount_amount_cents,
          nextDueDate: row.next_due_date ?? computeNextDueDate(row.recurrence, row.due_day),
          periodEndDate: row.period_end_date,
        }) === 'atrasado' ? 'OVERDUE' : 'PENDING',
        reference_month: refMonth,
        payment_method: row.payment_method_default,
        source: 'recurring_charge',
      }));

    if (payload.length === 0) return 0;

    const { error } = await supabase.from('student_payments').insert(payload);
    if (error) throw error;
    return payload.length;
  } catch (error) {
    logServiceError(error, 'student-billing');
    throw new Error('Erro ao gerar cobranças recorrentes.');
  }
}

export async function markInvoiceAsPaid(
  invoiceId: string,
  method?: string,
  notes?: string,
): Promise<void> {
  try {
    if (isMock()) return;
    const supabase = await getSupabase();
    const { error } = await supabase
      .from('student_payments')
      .update({
        status: 'RECEIVED',
        paid_at: new Date().toISOString(),
        payment_method: method ?? null,
        payment_notes: notes ?? null,
      })
      .eq('id', invoiceId);

    if (error) throw error;
  } catch (error) {
    logServiceError(error, 'student-billing');
    throw new Error('Erro ao registrar pagamento.');
  }
}

export async function cancelInvoice(invoiceId: string): Promise<void> {
  try {
    if (isMock()) return;
    const supabase = await getSupabase();
    const { error } = await supabase
      .from('student_payments')
      .update({ status: 'CANCELLED' })
      .eq('id', invoiceId);
    if (error) throw error;
  } catch (error) {
    logServiceError(error, 'student-billing');
    throw new Error('Erro ao cancelar cobrança.');
  }
}

export async function getFinancialSummary(academyId: string): Promise<FinancialSummary> {
  try {
    if (isMock()) {
      return { total_expected: 0, total_received: 0, total_pending: 0, total_overdue: 0, overdue_count: 0, by_type: [] };
    }

    const rows = await getFinancialRows(academyId);
    const invoices = await getStudentInvoices(academyId, { reference_month: monthKey() });

    const totalExpected = rows
      .filter((row) => hasDirectCharge(row.financial_model))
      .reduce((sum, row) => sum + Math.max(row.amount_cents - row.discount_amount_cents, 0), 0);
    const totalReceived = invoices
      .filter((invoice) => invoice.status === 'RECEIVED' || invoice.status === 'CONFIRMED')
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    const totalPending = invoices
      .filter((invoice) => invoice.status === 'PENDING')
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    const totalOverdue = invoices
      .filter((invoice) => invoice.status === 'OVERDUE')
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    const byType = Object.values(FINANCIAL_MODEL_LABELS_MAP).length >= 0
      ? (Object.keys(FINANCIAL_MODEL_LABELS_MAP) as FinancialModel[]).map((type) => {
        const modelRows = rows.filter((row) => row.financial_model === type);
        return {
          type,
          count: modelRows.length,
          revenue: modelRows.reduce((sum, row) => sum + Math.max(row.amount_cents - row.discount_amount_cents, 0), 0),
        };
      }).filter((item) => item.count > 0)
      : [];

    return {
      total_expected: totalExpected,
      total_received: totalReceived,
      total_pending: totalPending,
      total_overdue: totalOverdue,
      overdue_count: rows.filter((row) => row.financial_status === 'atrasado').length,
      by_type: byType,
    };
  } catch (error) {
    logServiceError(error, 'student-billing');
    return { total_expected: 0, total_received: 0, total_pending: 0, total_overdue: 0, overdue_count: 0, by_type: [] };
  }
}

export async function getExecutiveFinancialDashboard(
  academyId: string,
): Promise<StudentFinancialDashboard> {
  const rows = await getFinancialRows(academyId);
  const alertsToday = rows.filter((row) => row.alert_sent_today).length;
  const receivedRevenueCents = (await getStudentInvoices(academyId, { reference_month: monthKey() }))
    .filter((invoice) => invoice.status === 'RECEIVED' || invoice.status === 'CONFIRMED')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return {
    expectedRevenueCents: rows
      .filter((row) => hasDirectCharge(row.financial_model))
      .reduce((sum, row) => sum + Math.max(row.amount_cents - row.discount_amount_cents, 0), 0),
    receivedRevenueCents,
    overdueCount: rows.filter((row) => row.financial_status === 'atrasado').length,
    dueTodayCount: rows.filter((row) => row.financial_status === 'vence_hoje').length,
    dueSoonCount: rows.filter((row) => row.financial_status === 'vence_em_breve').length,
    belowGoalCount: rows.filter((row) => row.checkin_goal_status !== 'ok').length,
    alertsSentToday: alertsToday,
    byModel: (Object.keys(FINANCIAL_MODEL_LABELS_MAP) as FinancialModel[]).map((model) => ({
      model,
      count: rows.filter((row) => row.financial_model === model).length,
    })).filter((item) => item.count > 0),
    immediateAttention: rows
      .filter((row) => row.financial_status !== 'em_dia' || row.checkin_goal_status !== 'ok')
      .slice(0, 10),
  };
}

export async function getPaymentHistory(
  academyId: string,
  profileId: string,
): Promise<StudentInvoice[]> {
  const invoices = await getStudentInvoices(academyId);
  return invoices.filter((invoice) => invoice.profile_id === profileId);
}

export async function recordCheckinGoalAlerts(
  academyId: string,
  membershipId: string,
  force = false,
): Promise<number> {
  try {
    if (isMock()) return 0;
    const rows = await getFinancialRows(academyId);
    const row = rows.find((item) => item.membership_id === membershipId);
    if (!row) return 0;

    const shouldSend = force || shouldSendCheckinAlert({
      financialModel: row.financial_model,
      checkinGoalStatus: row.checkin_goal_status,
      alertDaysBeforeMonthEnd: row.alert_days_before_month_end,
      lastAlertSentAt: row.last_alert_sent_at,
    });
    if (!shouldSend) return 0;

    const supabase = await getSupabase();
    const today = new Date().toISOString().slice(0, 10);
    const alertsToCreate: Array<Record<string, unknown>> = [
      {
        academy_id: academyId,
        membership_id: row.membership_id,
        profile_id: row.profile_id,
        recipient_profile_id: row.profile_id,
        recipient_type: 'student',
        alert_kind: 'checkin_goal',
        channel: 'internal',
        status: 'sent',
        alert_reference_date: today,
        remaining_checkins: row.missing_checkins,
        message: `Faltam ${row.missing_checkins} check-ins para a meta do mês.`,
      },
      {
        academy_id: academyId,
        membership_id: row.membership_id,
        profile_id: row.profile_id,
        recipient_profile_id: null,
        recipient_type: 'owner',
        alert_kind: 'checkin_goal',
        channel: 'dashboard',
        status: 'sent',
        alert_reference_date: today,
        remaining_checkins: row.missing_checkins,
        message: `${row.student_name} está abaixo da meta de check-ins.`,
      },
    ];

    const { data: guardians } = await supabase
      .from('guardian_links')
      .select('guardian_id')
      .eq('child_id', row.profile_id)
      .eq('can_manage_payments', true);

    for (const guardian of guardians ?? []) {
      alertsToCreate.push({
        academy_id: academyId,
        membership_id: row.membership_id,
        profile_id: row.profile_id,
        recipient_profile_id: (guardian as { guardian_id: string }).guardian_id,
        recipient_type: 'guardian',
        alert_kind: 'checkin_goal',
        channel: 'internal',
        status: 'sent',
        alert_reference_date: today,
        remaining_checkins: row.missing_checkins,
        message: `${row.student_name} precisa de mais ${row.missing_checkins} check-ins neste mês.`,
      });
    }

    for (const alert of alertsToCreate) {
      await supabase.from('student_financial_alerts').upsert(alert, {
        onConflict: 'membership_id,alert_kind,recipient_type,alert_reference_date',
        ignoreDuplicates: false,
      });
    }

    const { error: updateError } = await supabase
      .from('student_financial_profiles')
      .update({
        last_alert_sent_at: new Date().toISOString(),
        last_alert_sent_to_student: true,
        last_alert_sent_to_guardian: alertsToCreate.some((alert) => alert.recipient_type === 'guardian'),
        last_alert_sent_to_owner: true,
      })
      .eq('membership_id', membershipId);

    if (updateError) throw updateError;
    return alertsToCreate.length;
  } catch (error) {
    logServiceError(error, 'student-billing');
    return 0;
  }
}

export async function refreshFinancialProfileCaches(academyId: string): Promise<void> {
  try {
    if (isMock()) return;
    const supabase = await getSupabase();
    const rows = await getFinancialRows(academyId);

    for (const row of rows) {
      await supabase
        .from('student_financial_profiles')
        .update({
          current_month_checkins: row.current_month_checkins,
          next_due_date: row.next_due_date,
          financial_status: row.financial_status,
          checkin_goal_status: row.checkin_goal_status,
        })
        .eq('membership_id', row.membership_id);
    }
  } catch (error) {
    logServiceError(error, 'student-billing');
  }
}

export async function getOverdueMembers(
  academyId: string,
): Promise<Array<{ name: string; amount: number; days_overdue: number; membership_id: string }>> {
  const rows = await getFinancialRows(academyId, { financialStatus: 'atrasado' });
  const today = new Date();
  return rows.map((row) => {
    const dueDate = row.latest_payment_due_date ?? row.next_due_date ?? today.toISOString().slice(0, 10);
    const daysOverdue = Math.max(
      Math.floor((today.getTime() - new Date(dueDate).getTime()) / 86400000),
      0,
    );
    return {
      name: row.student_name,
      amount: row.latest_payment_amount_cents ?? Math.max(row.amount_cents - row.discount_amount_cents, 0),
      days_overdue: daysOverdue,
      membership_id: row.membership_id,
    };
  });
}

export function billingTypeNeedsBilling(type: BillingType): boolean {
  return hasDirectCharge(type);
}

export function billingTypeNeedsCheckinGoal(type: BillingType): boolean {
  return needsExternalPlatform(type);
}
