import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// ── Type aliases ────────────────────────────────────────────────

export type Severity = 'mild' | 'moderate' | 'severe';
export type RecoveryStatus = 'active' | 'recovering' | 'recovered' | 'chronic';
export type RestrictionType = 'no_sparring' | 'no_ground' | 'no_striking' | 'no_takedowns' | 'limited_range' | 'no_contact' | 'light_only' | 'observe_only' | 'custom';
export type RestrictionSeverity = 'low' | 'moderate' | 'high';
export type ClearanceType = 'general' | 'post_injury' | 'post_surgery' | 'annual' | 'competition' | 'parq_follow_up';
export type ClearanceStatus = 'pending' | 'approved' | 'denied' | 'expired';
export type TreatmentType = 'none' | 'first_aid' | 'physiotherapy' | 'surgery' | 'other';
export type OccurredDuring = 'training' | 'competition' | 'outside' | 'unknown';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

// ── Interfaces ──────────────────────────────────────────────────

export interface ParqResponse {
  id: string;
  academy_id: string;
  profile_id: string;
  version: number;
  q1_heart_condition: boolean;
  q2_chest_pain_activity: boolean;
  q3_chest_pain_rest: boolean;
  q4_dizziness_balance: boolean;
  q5_bone_joint_problem: boolean;
  q6_medication_bp_heart: boolean;
  q7_other_reason: boolean;
  has_risk_factor: boolean;
  additional_notes?: string;
  lgpd_health_consent: boolean;
  lgpd_consent_date?: string;
  lgpd_consent_ip?: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalHistory {
  id: string;
  academy_id: string;
  profile_id: string;
  has_cardiovascular: boolean;
  cardiovascular_details?: string;
  has_respiratory: boolean;
  respiratory_details?: string;
  has_musculoskeletal: boolean;
  musculoskeletal_details?: string;
  has_neurological: boolean;
  neurological_details?: string;
  has_metabolic: boolean;
  metabolic_details?: string;
  has_allergies: boolean;
  allergies_details?: string;
  takes_medication: boolean;
  medication_details?: string;
  has_surgeries: boolean;
  surgeries_details?: string;
  has_skin_conditions: boolean;
  skin_conditions_details?: string;
  has_infectious_disease: boolean;
  infectious_disease_details?: string;
  has_bleeding_disorder: boolean;
  bleeding_disorder_details?: string;
  uses_hearing_aid: boolean;
  uses_glasses_contacts: boolean;
  has_dental_prosthesis: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  blood_type?: BloodType;
  lgpd_health_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface HealthInjury {
  id: string;
  academy_id: string;
  profile_id: string;
  injury_date: string;
  body_part: string;
  description: string;
  severity: Severity;
  occurred_during?: OccurredDuring;
  class_id?: string;
  reported_by_id?: string;
  treatment_type?: TreatmentType;
  treatment_details?: string;
  medical_report_url?: string;
  recovery_status: RecoveryStatus;
  estimated_recovery_days?: number;
  actual_recovery_date?: string;
  return_cleared_by_id?: string;
  return_clearance_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingRestriction {
  id: string;
  academy_id: string;
  profile_id: string;
  injury_id?: string;
  restriction_type: RestrictionType;
  body_part?: string;
  description?: string;
  severity: RestrictionSeverity;
  start_date: string;
  end_date?: string;
  is_permanent: boolean;
  is_active: boolean;
  created_by_id?: string;
  approved_by_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalClearance {
  id: string;
  academy_id: string;
  profile_id: string;
  clearance_type: ClearanceType;
  status: ClearanceStatus;
  doctor_name?: string;
  doctor_crm?: string;
  doctor_specialty?: string;
  document_url?: string;
  valid_from?: string;
  valid_until?: string;
  notes?: string;
  reviewed_by_id?: string;
  reviewed_at?: string;
  injury_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PretrainingCheck {
  id: string;
  academy_id: string;
  profile_id: string;
  professor_id: string;
  class_id?: string;
  check_date: string;
  feeling_score?: number;
  pain_reported: boolean;
  pain_location?: string;
  pain_level?: number;
  cleared_to_train: boolean;
  restrictions_applied?: string[];
  notes?: string;
  created_at: string;
}

export interface HealthConfig {
  id: string;
  academy_id: string;
  require_parq: boolean;
  require_medical_clearance: boolean;
  clearance_validity_months: number;
  require_emergency_contact: boolean;
  require_pretraining_check: boolean;
  auto_restrict_on_injury: boolean;
  notify_professor_restrictions: boolean;
  created_at: string;
  updated_at: string;
}

// ── Helper types ────────────────────────────────────────────────

export interface ParqAnswers {
  q1_heart_condition: boolean;
  q2_chest_pain_activity: boolean;
  q3_chest_pain_rest: boolean;
  q4_dizziness_balance: boolean;
  q5_bone_joint_problem: boolean;
  q6_medication_bp_heart: boolean;
  q7_other_reason: boolean;
  additional_notes?: string;
}

export interface HealthSummary {
  parq: ParqResponse | null;
  history: MedicalHistory | null;
  activeInjuries: HealthInjury[];
  restrictions: TrainingRestriction[];
  clearance: MedicalClearance | null;
}

// ── Row mappers ─────────────────────────────────────────────────

function mapParqRow(row: Record<string, unknown>): ParqResponse {
  return {
    id: String(row.id ?? ''),
    academy_id: String(row.academy_id ?? ''),
    profile_id: String(row.profile_id ?? ''),
    version: Number(row.version ?? 1),
    q1_heart_condition: Boolean(row.q1_heart_condition),
    q2_chest_pain_activity: Boolean(row.q2_chest_pain_activity),
    q3_chest_pain_rest: Boolean(row.q3_chest_pain_rest),
    q4_dizziness_balance: Boolean(row.q4_dizziness_balance),
    q5_bone_joint_problem: Boolean(row.q5_bone_joint_problem),
    q6_medication_bp_heart: Boolean(row.q6_medication_bp_heart),
    q7_other_reason: Boolean(row.q7_other_reason),
    has_risk_factor: Boolean(row.has_risk_factor),
    additional_notes: row.additional_notes ? String(row.additional_notes) : undefined,
    lgpd_health_consent: Boolean(row.lgpd_health_consent),
    lgpd_consent_date: row.lgpd_consent_date ? String(row.lgpd_consent_date) : undefined,
    lgpd_consent_ip: row.lgpd_consent_ip ? String(row.lgpd_consent_ip) : undefined,
    completed_at: String(row.completed_at ?? ''),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

function mapMedicalHistoryRow(row: Record<string, unknown>): MedicalHistory {
  return {
    id: String(row.id ?? ''),
    academy_id: String(row.academy_id ?? ''),
    profile_id: String(row.profile_id ?? ''),
    has_cardiovascular: Boolean(row.has_cardiovascular),
    cardiovascular_details: row.cardiovascular_details ? String(row.cardiovascular_details) : undefined,
    has_respiratory: Boolean(row.has_respiratory),
    respiratory_details: row.respiratory_details ? String(row.respiratory_details) : undefined,
    has_musculoskeletal: Boolean(row.has_musculoskeletal),
    musculoskeletal_details: row.musculoskeletal_details ? String(row.musculoskeletal_details) : undefined,
    has_neurological: Boolean(row.has_neurological),
    neurological_details: row.neurological_details ? String(row.neurological_details) : undefined,
    has_metabolic: Boolean(row.has_metabolic),
    metabolic_details: row.metabolic_details ? String(row.metabolic_details) : undefined,
    has_allergies: Boolean(row.has_allergies),
    allergies_details: row.allergies_details ? String(row.allergies_details) : undefined,
    takes_medication: Boolean(row.takes_medication),
    medication_details: row.medication_details ? String(row.medication_details) : undefined,
    has_surgeries: Boolean(row.has_surgeries),
    surgeries_details: row.surgeries_details ? String(row.surgeries_details) : undefined,
    has_skin_conditions: Boolean(row.has_skin_conditions),
    skin_conditions_details: row.skin_conditions_details ? String(row.skin_conditions_details) : undefined,
    has_infectious_disease: Boolean(row.has_infectious_disease),
    infectious_disease_details: row.infectious_disease_details ? String(row.infectious_disease_details) : undefined,
    has_bleeding_disorder: Boolean(row.has_bleeding_disorder),
    bleeding_disorder_details: row.bleeding_disorder_details ? String(row.bleeding_disorder_details) : undefined,
    uses_hearing_aid: Boolean(row.uses_hearing_aid),
    uses_glasses_contacts: Boolean(row.uses_glasses_contacts),
    has_dental_prosthesis: Boolean(row.has_dental_prosthesis),
    emergency_contact_name: row.emergency_contact_name ? String(row.emergency_contact_name) : undefined,
    emergency_contact_phone: row.emergency_contact_phone ? String(row.emergency_contact_phone) : undefined,
    emergency_contact_relation: row.emergency_contact_relation ? String(row.emergency_contact_relation) : undefined,
    blood_type: row.blood_type ? (String(row.blood_type) as BloodType) : undefined,
    lgpd_health_consent: Boolean(row.lgpd_health_consent),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

function mapInjuryRow(row: Record<string, unknown>): HealthInjury {
  return {
    id: String(row.id ?? ''),
    academy_id: String(row.academy_id ?? ''),
    profile_id: String(row.profile_id ?? ''),
    injury_date: String(row.injury_date ?? ''),
    body_part: String(row.body_part ?? ''),
    description: String(row.description ?? ''),
    severity: (row.severity ?? 'moderate') as Severity,
    occurred_during: row.occurred_during ? (String(row.occurred_during) as OccurredDuring) : undefined,
    class_id: row.class_id ? String(row.class_id) : undefined,
    reported_by_id: row.reported_by_id ? String(row.reported_by_id) : undefined,
    treatment_type: row.treatment_type ? (String(row.treatment_type) as TreatmentType) : undefined,
    treatment_details: row.treatment_details ? String(row.treatment_details) : undefined,
    medical_report_url: row.medical_report_url ? String(row.medical_report_url) : undefined,
    recovery_status: (row.recovery_status ?? 'active') as RecoveryStatus,
    estimated_recovery_days: row.estimated_recovery_days != null ? Number(row.estimated_recovery_days) : undefined,
    actual_recovery_date: row.actual_recovery_date ? String(row.actual_recovery_date) : undefined,
    return_cleared_by_id: row.return_cleared_by_id ? String(row.return_cleared_by_id) : undefined,
    return_clearance_date: row.return_clearance_date ? String(row.return_clearance_date) : undefined,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

function mapRestrictionRow(row: Record<string, unknown>): TrainingRestriction {
  return {
    id: String(row.id ?? ''),
    academy_id: String(row.academy_id ?? ''),
    profile_id: String(row.profile_id ?? ''),
    injury_id: row.injury_id ? String(row.injury_id) : undefined,
    restriction_type: (row.restriction_type ?? 'custom') as RestrictionType,
    body_part: row.body_part ? String(row.body_part) : undefined,
    description: row.description ? String(row.description) : undefined,
    severity: (row.severity ?? 'moderate') as RestrictionSeverity,
    start_date: String(row.start_date ?? ''),
    end_date: row.end_date ? String(row.end_date) : undefined,
    is_permanent: Boolean(row.is_permanent),
    is_active: Boolean(row.is_active),
    created_by_id: row.created_by_id ? String(row.created_by_id) : undefined,
    approved_by_id: row.approved_by_id ? String(row.approved_by_id) : undefined,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

function mapClearanceRow(row: Record<string, unknown>): MedicalClearance {
  return {
    id: String(row.id ?? ''),
    academy_id: String(row.academy_id ?? ''),
    profile_id: String(row.profile_id ?? ''),
    clearance_type: (row.clearance_type ?? 'general') as ClearanceType,
    status: (row.status ?? 'pending') as ClearanceStatus,
    doctor_name: row.doctor_name ? String(row.doctor_name) : undefined,
    doctor_crm: row.doctor_crm ? String(row.doctor_crm) : undefined,
    doctor_specialty: row.doctor_specialty ? String(row.doctor_specialty) : undefined,
    document_url: row.document_url ? String(row.document_url) : undefined,
    valid_from: row.valid_from ? String(row.valid_from) : undefined,
    valid_until: row.valid_until ? String(row.valid_until) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    reviewed_by_id: row.reviewed_by_id ? String(row.reviewed_by_id) : undefined,
    reviewed_at: row.reviewed_at ? String(row.reviewed_at) : undefined,
    injury_id: row.injury_id ? String(row.injury_id) : undefined,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

function mapPretrainingCheckRow(row: Record<string, unknown>): PretrainingCheck {
  return {
    id: String(row.id ?? ''),
    academy_id: String(row.academy_id ?? ''),
    profile_id: String(row.profile_id ?? ''),
    professor_id: String(row.professor_id ?? ''),
    class_id: row.class_id ? String(row.class_id) : undefined,
    check_date: String(row.check_date ?? ''),
    feeling_score: row.feeling_score != null ? Number(row.feeling_score) : undefined,
    pain_reported: Boolean(row.pain_reported),
    pain_location: row.pain_location ? String(row.pain_location) : undefined,
    pain_level: row.pain_level != null ? Number(row.pain_level) : undefined,
    cleared_to_train: Boolean(row.cleared_to_train),
    restrictions_applied: Array.isArray(row.restrictions_applied) ? (row.restrictions_applied as string[]) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    created_at: String(row.created_at ?? ''),
  };
}

function mapHealthConfigRow(row: Record<string, unknown>): HealthConfig {
  return {
    id: String(row.id ?? ''),
    academy_id: String(row.academy_id ?? ''),
    require_parq: Boolean(row.require_parq),
    require_medical_clearance: Boolean(row.require_medical_clearance),
    clearance_validity_months: Number(row.clearance_validity_months ?? 12),
    require_emergency_contact: Boolean(row.require_emergency_contact),
    require_pretraining_check: Boolean(row.require_pretraining_check),
    auto_restrict_on_injury: Boolean(row.auto_restrict_on_injury),
    notify_professor_restrictions: Boolean(row.notify_professor_restrictions),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

// ═══════════════════════════════════════════════════════════════
// PAR-Q
// ═══════════════════════════════════════════════════════════════

export async function submitParqResponse(
  academyId: string,
  profileId: string,
  answers: ParqAnswers,
  lgpdConsent: { consent: boolean; ip?: string },
): Promise<ParqResponse | null> {
  try {
    if (isMock()) {
      const { mockSubmitParqResponse } = await import('@/lib/mocks/health-declaration.mock');
      return mockSubmitParqResponse(academyId, profileId, answers, lgpdConsent);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('health_parq_responses')
      .insert({
        academy_id: academyId,
        profile_id: profileId,
        q1_heart_condition: answers.q1_heart_condition,
        q2_chest_pain_activity: answers.q2_chest_pain_activity,
        q3_chest_pain_rest: answers.q3_chest_pain_rest,
        q4_dizziness_balance: answers.q4_dizziness_balance,
        q5_bone_joint_problem: answers.q5_bone_joint_problem,
        q6_medication_bp_heart: answers.q6_medication_bp_heart,
        q7_other_reason: answers.q7_other_reason,
        additional_notes: answers.additional_notes ?? null,
        lgpd_health_consent: lgpdConsent.consent,
        lgpd_consent_date: lgpdConsent.consent ? new Date().toISOString() : null,
        lgpd_consent_ip: lgpdConsent.ip ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'health-declaration');
      return null;
    }

    return mapParqRow(data as Record<string, unknown>);
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return null;
  }
}

export async function getLatestParqResponse(
  academyId: string,
  profileId: string,
): Promise<ParqResponse | null> {
  try {
    if (isMock()) {
      const { mockGetLatestParqResponse } = await import('@/lib/mocks/health-declaration.mock');
      return mockGetLatestParqResponse(academyId, profileId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('health_parq_responses')
      .select('*')
      .eq('academy_id', academyId)
      .eq('profile_id', profileId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logServiceError(error, 'health-declaration');
      return null;
    }

    return data ? mapParqRow(data as Record<string, unknown>) : null;
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return null;
  }
}

export async function getParqResponses(
  academyId: string,
  filters?: { hasRisk?: boolean },
): Promise<ParqResponse[]> {
  try {
    if (isMock()) {
      const { mockGetParqResponses } = await import('@/lib/mocks/health-declaration.mock');
      return mockGetParqResponses(academyId, filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('health_parq_responses')
      .select('*')
      .eq('academy_id', academyId)
      .order('completed_at', { ascending: false });

    if (filters?.hasRisk !== undefined) {
      query = query.eq('has_risk_factor', filters.hasRisk);
    }

    const { data, error } = await query;

    if (error || !data) {
      logServiceError(error, 'health-declaration');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => mapParqRow(row));
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// Medical History
// ═══════════════════════════════════════════════════════════════

export async function saveMedicalHistory(
  academyId: string,
  profileId: string,
  data: Partial<MedicalHistory>,
): Promise<MedicalHistory | null> {
  try {
    if (isMock()) {
      const { mockSaveMedicalHistory } = await import('@/lib/mocks/health-declaration.mock');
      return mockSaveMedicalHistory(academyId, profileId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const payload: Record<string, unknown> = {
      academy_id: academyId,
      profile_id: profileId,
      updated_at: new Date().toISOString(),
    };

    // Map all optional fields
    const boolFields = [
      'has_cardiovascular', 'has_respiratory', 'has_musculoskeletal', 'has_neurological',
      'has_metabolic', 'has_allergies', 'takes_medication', 'has_surgeries',
      'has_skin_conditions', 'has_infectious_disease', 'has_bleeding_disorder',
      'uses_hearing_aid', 'uses_glasses_contacts', 'has_dental_prosthesis', 'lgpd_health_consent',
    ] as const;

    const textFields = [
      'cardiovascular_details', 'respiratory_details', 'musculoskeletal_details',
      'neurological_details', 'metabolic_details', 'allergies_details',
      'medication_details', 'surgeries_details', 'skin_conditions_details',
      'infectious_disease_details', 'bleeding_disorder_details',
      'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
      'blood_type',
    ] as const;

    for (const f of boolFields) {
      if (f in data) payload[f] = data[f as keyof MedicalHistory];
    }
    for (const f of textFields) {
      if (f in data) payload[f] = data[f as keyof MedicalHistory] ?? null;
    }

    const { data: row, error } = await supabase
      .from('health_medical_history')
      .upsert(payload, { onConflict: 'academy_id,profile_id' })
      .select()
      .single();

    if (error || !row) {
      logServiceError(error, 'health-declaration');
      return null;
    }

    return mapMedicalHistoryRow(row as Record<string, unknown>);
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return null;
  }
}

export async function getMedicalHistory(
  academyId: string,
  profileId: string,
): Promise<MedicalHistory | null> {
  try {
    if (isMock()) {
      const { mockGetMedicalHistory } = await import('@/lib/mocks/health-declaration.mock');
      return mockGetMedicalHistory(academyId, profileId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('health_medical_history')
      .select('*')
      .eq('academy_id', academyId)
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) {
      logServiceError(error, 'health-declaration');
      return null;
    }

    return data ? mapMedicalHistoryRow(data as Record<string, unknown>) : null;
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Injuries
// ═══════════════════════════════════════════════════════════════

export async function reportInjury(
  academyId: string,
  profileId: string,
  data: Omit<HealthInjury, 'id' | 'academy_id' | 'profile_id' | 'created_at' | 'updated_at'>,
): Promise<HealthInjury | null> {
  try {
    if (isMock()) {
      const { mockReportInjury } = await import('@/lib/mocks/health-declaration.mock');
      return mockReportInjury(academyId, profileId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('health_injuries')
      .insert({
        academy_id: academyId,
        profile_id: profileId,
        injury_date: data.injury_date,
        body_part: data.body_part,
        description: data.description,
        severity: data.severity,
        occurred_during: data.occurred_during ?? null,
        class_id: data.class_id ?? null,
        reported_by_id: data.reported_by_id ?? null,
        treatment_type: data.treatment_type ?? null,
        treatment_details: data.treatment_details ?? null,
        medical_report_url: data.medical_report_url ?? null,
        recovery_status: data.recovery_status,
        estimated_recovery_days: data.estimated_recovery_days ?? null,
        actual_recovery_date: data.actual_recovery_date ?? null,
        return_cleared_by_id: data.return_cleared_by_id ?? null,
        return_clearance_date: data.return_clearance_date ?? null,
      })
      .select()
      .single();

    if (error || !row) {
      logServiceError(error, 'health-declaration');
      return null;
    }

    return mapInjuryRow(row as Record<string, unknown>);
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return null;
  }
}

export async function listInjuries(
  academyId: string,
  filters?: { profileId?: string; status?: RecoveryStatus; severity?: Severity },
): Promise<HealthInjury[]> {
  try {
    if (isMock()) {
      const { mockListInjuries } = await import('@/lib/mocks/health-declaration.mock');
      return mockListInjuries(academyId, filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('health_injuries')
      .select('*')
      .eq('academy_id', academyId)
      .order('injury_date', { ascending: false });

    if (filters?.profileId) {
      query = query.eq('profile_id', filters.profileId);
    }
    if (filters?.status) {
      query = query.eq('recovery_status', filters.status);
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }

    const { data, error } = await query;

    if (error || !data) {
      logServiceError(error, 'health-declaration');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => mapInjuryRow(row));
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return [];
  }
}

export async function getInjury(id: string): Promise<HealthInjury | null> {
  try {
    if (isMock()) {
      const { mockGetInjury } = await import('@/lib/mocks/health-declaration.mock');
      return mockGetInjury(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('health_injuries')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logServiceError(error, 'health-declaration');
      return null;
    }

    return data ? mapInjuryRow(data as Record<string, unknown>) : null;
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return null;
  }
}

export async function updateInjury(
  id: string,
  data: Partial<HealthInjury>,
): Promise<HealthInjury | null> {
  try {
    if (isMock()) {
      const { mockUpdateInjury } = await import('@/lib/mocks/health-declaration.mock');
      return mockUpdateInjury(id, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };

    const fields = [
      'injury_date', 'body_part', 'description', 'severity', 'occurred_during',
      'class_id', 'reported_by_id', 'treatment_type', 'treatment_details',
      'medical_report_url', 'recovery_status', 'estimated_recovery_days',
      'actual_recovery_date', 'return_cleared_by_id', 'return_clearance_date',
    ] as const;

    for (const f of fields) {
      if (f in data) payload[f] = data[f as keyof HealthInjury] ?? null;
    }

    const { data: row, error } = await supabase
      .from('health_injuries')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error || !row) {
      logServiceError(error, 'health-declaration');
      return null;
    }

    return mapInjuryRow(row as Record<string, unknown>);
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return null;
  }
}

export async function clearInjuryReturn(
  injuryId: string,
  clearedById: string,
): Promise<HealthInjury | null> {
  try {
    if (isMock()) {
      const { mockClearInjuryReturn } = await import('@/lib/mocks/health-declaration.mock');
      return mockClearInjuryReturn(injuryId, clearedById);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('health_injuries')
      .update({
        recovery_status: 'recovered',
        actual_recovery_date: today,
        return_cleared_by_id: clearedById,
        return_clearance_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('id', injuryId)
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'health-declaration');
      return null;
    }

    return mapInjuryRow(data as Record<string, unknown>);
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Training Restrictions
// ═══════════════════════════════════════════════════════════════

export async function addRestriction(
  academyId: string,
  profileId: string,
  data: Omit<TrainingRestriction, 'id' | 'academy_id' | 'profile_id' | 'is_active' | 'created_at' | 'updated_at'>,
): Promise<TrainingRestriction | null> {
  try {
    if (isMock()) {
      const { mockAddRestriction } = await import('@/lib/mocks/health-declaration.mock');
      return mockAddRestriction(academyId, profileId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('health_training_restrictions')
      .insert({
        academy_id: academyId,
        profile_id: profileId,
        injury_id: data.injury_id ?? null,
        restriction_type: data.restriction_type,
        body_part: data.body_part ?? null,
        description: data.description ?? null,
        severity: data.severity,
        start_date: data.start_date,
        end_date: data.end_date ?? null,
        is_permanent: data.is_permanent,
        created_by_id: data.created_by_id ?? null,
        approved_by_id: data.approved_by_id ?? null,
      })
      .select()
      .single();

    if (error || !row) {
      logServiceError(error, 'health-declaration');
      return null;
    }

    return mapRestrictionRow(row as Record<string, unknown>);
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return null;
  }
}

export async function listRestrictions(
  academyId: string,
  filters?: { profileId?: string; activeOnly?: boolean },
): Promise<TrainingRestriction[]> {
  try {
    if (isMock()) {
      const { mockListRestrictions } = await import('@/lib/mocks/health-declaration.mock');
      return mockListRestrictions(academyId, filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('health_training_restrictions')
      .select('*')
      .eq('academy_id', academyId)
      .order('start_date', { ascending: false });

    if (filters?.profileId) {
      query = query.eq('profile_id', filters.profileId);
    }
    if (filters?.activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error || !data) {
      logServiceError(error, 'health-declaration');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => mapRestrictionRow(row));
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return [];
  }
}

export async function getActiveRestrictions(
  academyId: string,
  profileId: string,
): Promise<TrainingRestriction[]> {
  try {
    if (isMock()) {
      const { mockGetActiveRestrictions } = await import('@/lib/mocks/health-declaration.mock');
      return mockGetActiveRestrictions(academyId, profileId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('health_training_restrictions')
      .select('*')
      .eq('academy_id', academyId)
      .eq('profile_id', profileId)
      .eq('is_active', true)
      .order('start_date', { ascending: false });

    if (error || !data) {
      logServiceError(error, 'health-declaration');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => mapRestrictionRow(row));
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return [];
  }
}

export async function removeRestriction(id: string): Promise<boolean> {
  try {
    if (isMock()) {
      const { mockRemoveRestriction } = await import('@/lib/mocks/health-declaration.mock');
      return mockRemoveRestriction(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('health_training_restrictions')
      .delete()
      .eq('id', id);

    if (error) {
      logServiceError(error, 'health-declaration');
      return false;
    }

    return true;
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// Medical Clearances
// ═══════════════════════════════════════════════════════════════

export async function requestClearance(
  academyId: string,
  profileId: string,
  data: Omit<MedicalClearance, 'id' | 'academy_id' | 'profile_id' | 'status' | 'reviewed_by_id' | 'reviewed_at' | 'created_at' | 'updated_at'>,
): Promise<MedicalClearance | null> {
  try {
    if (isMock()) {
      const { mockRequestClearance } = await import('@/lib/mocks/health-declaration.mock');
      return mockRequestClearance(academyId, profileId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('health_medical_clearances')
      .insert({
        academy_id: academyId,
        profile_id: profileId,
        clearance_type: data.clearance_type,
        status: 'pending',
        doctor_name: data.doctor_name ?? null,
        doctor_crm: data.doctor_crm ?? null,
        doctor_specialty: data.doctor_specialty ?? null,
        document_url: data.document_url ?? null,
        valid_from: data.valid_from ?? null,
        valid_until: data.valid_until ?? null,
        notes: data.notes ?? null,
        injury_id: data.injury_id ?? null,
      })
      .select()
      .single();

    if (error || !row) {
      logServiceError(error, 'health-declaration');
      return null;
    }

    return mapClearanceRow(row as Record<string, unknown>);
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return null;
  }
}

export async function listClearances(
  academyId: string,
  filters?: { profileId?: string; status?: ClearanceStatus },
): Promise<MedicalClearance[]> {
  try {
    if (isMock()) {
      const { mockListClearances } = await import('@/lib/mocks/health-declaration.mock');
      return mockListClearances(academyId, filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('health_medical_clearances')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (filters?.profileId) {
      query = query.eq('profile_id', filters.profileId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error || !data) {
      logServiceError(error, 'health-declaration');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => mapClearanceRow(row));
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return [];
  }
}

export async function reviewClearance(
  id: string,
  status: 'approved' | 'denied',
  reviewedById: string,
  notes?: string,
): Promise<MedicalClearance | null> {
  try {
    if (isMock()) {
      const { mockReviewClearance } = await import('@/lib/mocks/health-declaration.mock');
      return mockReviewClearance(id, status, reviewedById, notes);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const payload: Record<string, unknown> = {
      status,
      reviewed_by_id: reviewedById,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (notes !== undefined) {
      payload.notes = notes;
    }

    const { data, error } = await supabase
      .from('health_medical_clearances')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'health-declaration');
      return null;
    }

    return mapClearanceRow(data as Record<string, unknown>);
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return null;
  }
}

export async function getActiveClearance(
  academyId: string,
  profileId: string,
): Promise<MedicalClearance | null> {
  try {
    if (isMock()) {
      const { mockGetActiveClearance } = await import('@/lib/mocks/health-declaration.mock');
      return mockGetActiveClearance(academyId, profileId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('health_medical_clearances')
      .select('*')
      .eq('academy_id', academyId)
      .eq('profile_id', profileId)
      .eq('status', 'approved')
      .or(`valid_until.is.null,valid_until.gte.${today}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logServiceError(error, 'health-declaration');
      return null;
    }

    return data ? mapClearanceRow(data as Record<string, unknown>) : null;
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Pre-Training Checks
// ═══════════════════════════════════════════════════════════════

export async function submitPretrainingCheck(
  academyId: string,
  profileId: string,
  professorId: string,
  data: Omit<PretrainingCheck, 'id' | 'academy_id' | 'profile_id' | 'professor_id' | 'created_at'>,
): Promise<PretrainingCheck | null> {
  try {
    if (isMock()) {
      const { mockSubmitPretrainingCheck } = await import('@/lib/mocks/health-declaration.mock');
      return mockSubmitPretrainingCheck(academyId, profileId, professorId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('health_pretraining_checks')
      .insert({
        academy_id: academyId,
        profile_id: profileId,
        professor_id: professorId,
        class_id: data.class_id ?? null,
        check_date: data.check_date,
        feeling_score: data.feeling_score ?? null,
        pain_reported: data.pain_reported,
        pain_location: data.pain_location ?? null,
        pain_level: data.pain_level ?? null,
        cleared_to_train: data.cleared_to_train,
        restrictions_applied: data.restrictions_applied ?? null,
        notes: data.notes ?? null,
      })
      .select()
      .single();

    if (error || !row) {
      logServiceError(error, 'health-declaration');
      return null;
    }

    return mapPretrainingCheckRow(row as Record<string, unknown>);
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return null;
  }
}

export async function getTodaysPretrainingCheck(
  academyId: string,
  profileId: string,
): Promise<PretrainingCheck | null> {
  try {
    if (isMock()) {
      const { mockGetTodaysPretrainingCheck } = await import('@/lib/mocks/health-declaration.mock');
      return mockGetTodaysPretrainingCheck(academyId, profileId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('health_pretraining_checks')
      .select('*')
      .eq('academy_id', academyId)
      .eq('profile_id', profileId)
      .eq('check_date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logServiceError(error, 'health-declaration');
      return null;
    }

    return data ? mapPretrainingCheckRow(data as Record<string, unknown>) : null;
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return null;
  }
}

export async function listPretrainingChecks(
  academyId: string,
  filters?: { profileId?: string; date?: string },
): Promise<PretrainingCheck[]> {
  try {
    if (isMock()) {
      const { mockListPretrainingChecks } = await import('@/lib/mocks/health-declaration.mock');
      return mockListPretrainingChecks(academyId, filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('health_pretraining_checks')
      .select('*')
      .eq('academy_id', academyId)
      .order('check_date', { ascending: false });

    if (filters?.profileId) {
      query = query.eq('profile_id', filters.profileId);
    }
    if (filters?.date) {
      query = query.eq('check_date', filters.date);
    }

    const { data, error } = await query;

    if (error || !data) {
      logServiceError(error, 'health-declaration');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => mapPretrainingCheckRow(row));
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// Health Config
// ═══════════════════════════════════════════════════════════════

export async function getHealthConfig(academyId: string): Promise<HealthConfig | null> {
  try {
    if (isMock()) {
      const { mockGetHealthConfig } = await import('@/lib/mocks/health-declaration.mock');
      return mockGetHealthConfig(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('health_config')
      .select('*')
      .eq('academy_id', academyId)
      .maybeSingle();

    if (error) {
      logServiceError(error, 'health-declaration');
      return null;
    }

    return data ? mapHealthConfigRow(data as Record<string, unknown>) : null;
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return null;
  }
}

export async function updateHealthConfig(
  academyId: string,
  data: Partial<HealthConfig>,
): Promise<HealthConfig | null> {
  try {
    if (isMock()) {
      const { mockUpdateHealthConfig } = await import('@/lib/mocks/health-declaration.mock');
      return mockUpdateHealthConfig(academyId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    const fields = [
      'require_parq', 'require_medical_clearance', 'clearance_validity_months',
      'require_emergency_contact', 'require_pretraining_check',
      'auto_restrict_on_injury', 'notify_professor_restrictions',
    ] as const;

    for (const f of fields) {
      if (f in data) payload[f] = data[f as keyof HealthConfig];
    }

    const { data: row, error } = await supabase
      .from('health_config')
      .update(payload)
      .eq('academy_id', academyId)
      .select()
      .single();

    if (error || !row) {
      logServiceError(error, 'health-declaration');
      return null;
    }

    return mapHealthConfigRow(row as Record<string, unknown>);
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return null;
  }
}

export async function seedDefaultHealthConfig(academyId: string): Promise<HealthConfig | null> {
  try {
    if (isMock()) {
      const { mockSeedDefaultHealthConfig } = await import('@/lib/mocks/health-declaration.mock');
      return mockSeedDefaultHealthConfig(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('health_config')
      .upsert(
        {
          academy_id: academyId,
          require_parq: true,
          require_medical_clearance: false,
          clearance_validity_months: 12,
          require_emergency_contact: true,
          require_pretraining_check: false,
          auto_restrict_on_injury: true,
          notify_professor_restrictions: true,
        },
        { onConflict: 'academy_id' },
      )
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'health-declaration');
      return null;
    }

    return mapHealthConfigRow(data as Record<string, unknown>);
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Student Dashboard
// ═══════════════════════════════════════════════════════════════

export async function getMyHealthSummary(academyId: string): Promise<HealthSummary> {
  try {
    if (isMock()) {
      const { mockGetMyHealthSummary } = await import('@/lib/mocks/health-declaration.mock');
      return mockGetMyHealthSummary(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    const profileId = user?.id ?? '';

    const [parqRes, historyRes, injuriesRes, restrictionsRes, clearanceRes] = await Promise.all([
      supabase
        .from('health_parq_responses')
        .select('*')
        .eq('academy_id', academyId)
        .eq('profile_id', profileId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('health_medical_history')
        .select('*')
        .eq('academy_id', academyId)
        .eq('profile_id', profileId)
        .maybeSingle(),
      supabase
        .from('health_injuries')
        .select('*')
        .eq('academy_id', academyId)
        .eq('profile_id', profileId)
        .in('recovery_status', ['active', 'recovering'])
        .order('injury_date', { ascending: false }),
      supabase
        .from('health_training_restrictions')
        .select('*')
        .eq('academy_id', academyId)
        .eq('profile_id', profileId)
        .eq('is_active', true)
        .order('start_date', { ascending: false }),
      supabase
        .from('health_medical_clearances')
        .select('*')
        .eq('academy_id', academyId)
        .eq('profile_id', profileId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    return {
      parq: parqRes.data ? mapParqRow(parqRes.data as Record<string, unknown>) : null,
      history: historyRes.data ? mapMedicalHistoryRow(historyRes.data as Record<string, unknown>) : null,
      activeInjuries: (injuriesRes.data ?? []).map((row: Record<string, unknown>) => mapInjuryRow(row)),
      restrictions: (restrictionsRes.data ?? []).map((row: Record<string, unknown>) => mapRestrictionRow(row)),
      clearance: clearanceRes.data ? mapClearanceRow(clearanceRes.data as Record<string, unknown>) : null,
    };
  } catch (error) {
    logServiceError(error, 'health-declaration');
    return {
      parq: null,
      history: null,
      activeInjuries: [],
      restrictions: [],
      clearance: null,
    };
  }
}
