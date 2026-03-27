import type {
  ParqResponse,
  ParqAnswers,
  MedicalHistory,
  HealthInjury,
  TrainingRestriction,
  MedicalClearance,
  PretrainingCheck,
  HealthConfig,
  HealthSummary,
  Severity,
  RecoveryStatus,
  RestrictionType,
  RestrictionSeverity,
  ClearanceType,
  ClearanceStatus,
  TreatmentType,
  OccurredDuring,
  BloodType,
} from '@/lib/api/health-declaration.service';

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function dateAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function dateFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// ════════════════════════════════════════════════════════
// MOCK DATA
// ════════════════════════════════════════════════════════

const PARQ_RESPONSES: ParqResponse[] = [
  {
    id: 'parq-1',
    academy_id: 'academy-1',
    profile_id: 'profile-1',
    version: 1,
    q1_heart_condition: false,
    q2_chest_pain_activity: false,
    q3_chest_pain_rest: false,
    q4_dizziness_balance: false,
    q5_bone_joint_problem: false,
    q6_medication_bp_heart: false,
    q7_other_reason: false,
    has_risk_factor: false,
    lgpd_health_consent: true,
    lgpd_consent_date: daysAgo(90),
    completed_at: daysAgo(90),
    created_at: daysAgo(90),
    updated_at: daysAgo(90),
  },
  {
    id: 'parq-2',
    academy_id: 'academy-1',
    profile_id: 'profile-2',
    version: 1,
    q1_heart_condition: false,
    q2_chest_pain_activity: false,
    q3_chest_pain_rest: false,
    q4_dizziness_balance: false,
    q5_bone_joint_problem: true,
    q6_medication_bp_heart: false,
    q7_other_reason: false,
    has_risk_factor: true,
    additional_notes: 'Problema antigo no joelho direito',
    lgpd_health_consent: true,
    lgpd_consent_date: daysAgo(60),
    completed_at: daysAgo(60),
    created_at: daysAgo(60),
    updated_at: daysAgo(60),
  },
  {
    id: 'parq-3',
    academy_id: 'academy-1',
    profile_id: 'profile-3',
    version: 1,
    q1_heart_condition: true,
    q2_chest_pain_activity: false,
    q3_chest_pain_rest: false,
    q4_dizziness_balance: false,
    q5_bone_joint_problem: false,
    q6_medication_bp_heart: true,
    q7_other_reason: false,
    has_risk_factor: true,
    additional_notes: 'Hipertensao controlada com medicacao',
    lgpd_health_consent: true,
    lgpd_consent_date: daysAgo(30),
    completed_at: daysAgo(30),
    created_at: daysAgo(30),
    updated_at: daysAgo(30),
  },
];

const MEDICAL_HISTORIES: MedicalHistory[] = [
  {
    id: 'medhist-1',
    academy_id: 'academy-1',
    profile_id: 'profile-1',
    has_cardiovascular: false,
    has_respiratory: false,
    has_musculoskeletal: false,
    has_neurological: false,
    has_metabolic: false,
    has_allergies: false,
    takes_medication: false,
    has_surgeries: false,
    has_skin_conditions: false,
    has_infectious_disease: false,
    has_bleeding_disorder: false,
    uses_hearing_aid: false,
    uses_glasses_contacts: false,
    has_dental_prosthesis: false,
    emergency_contact_name: 'Maria Silva',
    emergency_contact_phone: '5511999990001',
    emergency_contact_relation: 'Esposa',
    blood_type: 'O+' as BloodType,
    lgpd_health_consent: true,
    created_at: daysAgo(90),
    updated_at: daysAgo(90),
  },
  {
    id: 'medhist-2',
    academy_id: 'academy-1',
    profile_id: 'profile-2',
    has_cardiovascular: false,
    has_respiratory: false,
    has_musculoskeletal: true,
    musculoskeletal_details: 'Lesao antiga no joelho direito, artroscopia em 2022',
    has_neurological: false,
    has_metabolic: false,
    has_allergies: true,
    allergies_details: 'Anti-inflamatorio',
    takes_medication: true,
    medication_details: 'Condroitina 500mg',
    has_surgeries: true,
    surgeries_details: 'Artroscopia joelho direito - 2022',
    has_skin_conditions: false,
    has_infectious_disease: false,
    has_bleeding_disorder: false,
    uses_hearing_aid: false,
    uses_glasses_contacts: false,
    has_dental_prosthesis: false,
    emergency_contact_name: 'Joao Souza',
    emergency_contact_phone: '5511999990002',
    emergency_contact_relation: 'Irmao',
    blood_type: 'A+' as BloodType,
    lgpd_health_consent: true,
    created_at: daysAgo(60),
    updated_at: daysAgo(60),
  },
];

const INJURIES: HealthInjury[] = [
  {
    id: 'injury-1',
    academy_id: 'academy-1',
    profile_id: 'profile-2',
    injury_date: dateAgo(20),
    body_part: 'Joelho direito',
    description: 'Entorse no joelho direito durante treino de guarda. Ligamento colateral medial.',
    severity: 'moderate' as Severity,
    occurred_during: 'training' as OccurredDuring,
    treatment_type: 'physiotherapy' as TreatmentType,
    treatment_details: 'Fisioterapia 3x por semana',
    recovery_status: 'recovering' as RecoveryStatus,
    estimated_recovery_days: 30,
    created_at: daysAgo(20),
    updated_at: daysAgo(5),
  },
  {
    id: 'injury-2',
    academy_id: 'academy-1',
    profile_id: 'profile-1',
    injury_date: dateAgo(45),
    body_part: 'Costelas esquerdas',
    description: 'Contusao leve nas costelas apos pressao de joelho no peito.',
    severity: 'mild' as Severity,
    occurred_during: 'training' as OccurredDuring,
    treatment_type: 'none' as TreatmentType,
    recovery_status: 'recovered' as RecoveryStatus,
    estimated_recovery_days: 14,
    actual_recovery_date: dateAgo(31),
    created_at: daysAgo(45),
    updated_at: daysAgo(31),
  },
  {
    id: 'injury-3',
    academy_id: 'academy-1',
    profile_id: 'profile-2',
    injury_date: dateAgo(10),
    body_part: 'Ombro esquerdo',
    description: 'Luxacao no ombro esquerdo durante competicao. Reducao no local.',
    severity: 'severe' as Severity,
    occurred_during: 'competition' as OccurredDuring,
    treatment_type: 'surgery' as TreatmentType,
    treatment_details: 'Cirurgia artroscopica agendada',
    recovery_status: 'active' as RecoveryStatus,
    estimated_recovery_days: 60,
    created_at: daysAgo(10),
    updated_at: daysAgo(2),
  },
  {
    id: 'injury-4',
    academy_id: 'academy-1',
    profile_id: 'profile-3',
    injury_date: dateAgo(60),
    body_part: 'Tornozelo esquerdo',
    description: 'Entorse no tornozelo esquerdo jogando futebol com amigos.',
    severity: 'moderate' as Severity,
    occurred_during: 'outside' as OccurredDuring,
    treatment_type: 'physiotherapy' as TreatmentType,
    recovery_status: 'recovered' as RecoveryStatus,
    estimated_recovery_days: 21,
    actual_recovery_date: dateAgo(39),
    created_at: daysAgo(60),
    updated_at: daysAgo(39),
  },
];

const RESTRICTIONS: TrainingRestriction[] = [
  {
    id: 'restriction-1',
    academy_id: 'academy-1',
    profile_id: 'profile-2',
    injury_id: 'injury-1',
    restriction_type: 'no_ground' as RestrictionType,
    body_part: 'Joelho direito',
    description: 'Sem treino de solo — recuperacao do joelho direito.',
    severity: 'moderate' as RestrictionSeverity,
    start_date: dateAgo(20),
    end_date: dateFromNow(14),
    is_permanent: false,
    is_active: true,
    created_by_id: 'profile-2',
    created_at: daysAgo(20),
    updated_at: daysAgo(20),
  },
  {
    id: 'restriction-2',
    academy_id: 'academy-1',
    profile_id: 'profile-2',
    injury_id: 'injury-3',
    restriction_type: 'no_takedowns' as RestrictionType,
    body_part: 'Ombro esquerdo',
    description: 'Sem quedas — luxacao de ombro esquerdo ainda em tratamento.',
    severity: 'high' as RestrictionSeverity,
    start_date: dateAgo(10),
    is_permanent: false,
    is_active: true,
    created_by_id: 'profile-2',
    created_at: daysAgo(10),
    updated_at: daysAgo(10),
  },
];

const CLEARANCES: MedicalClearance[] = [
  {
    id: 'clearance-1',
    academy_id: 'academy-1',
    profile_id: 'profile-1',
    clearance_type: 'annual' as ClearanceType,
    status: 'approved' as ClearanceStatus,
    doctor_name: 'Dr. Roberto Cardoso',
    doctor_crm: 'CRM-SP 123456',
    doctor_specialty: 'Medicina Esportiva',
    document_url: '/uploads/clearance-1.pdf',
    valid_from: dateAgo(60),
    valid_until: dateFromNow(305),
    notes: 'Atestado medico anual aprovado. Apto para atividade fisica.',
    reviewed_by_id: 'admin-1',
    reviewed_at: daysAgo(58),
    created_at: daysAgo(60),
    updated_at: daysAgo(58),
  },
  {
    id: 'clearance-2',
    academy_id: 'academy-1',
    profile_id: 'profile-2',
    clearance_type: 'post_injury' as ClearanceType,
    status: 'pending' as ClearanceStatus,
    notes: 'Aguardando avaliacao medica pos-lesao no joelho.',
    document_url: '/uploads/clearance-2.pdf',
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
  },
  {
    id: 'clearance-3',
    academy_id: 'academy-1',
    profile_id: 'profile-3',
    clearance_type: 'parq_follow_up' as ClearanceType,
    status: 'approved' as ClearanceStatus,
    doctor_name: 'Dra. Ana Paula Mendes',
    doctor_crm: 'CRM-SP 654321',
    doctor_specialty: 'Cardiologia',
    document_url: '/uploads/clearance-3.pdf',
    valid_from: dateAgo(25),
    valid_until: dateFromNow(155),
    notes: 'Liberacao cardiologica apos PAR-Q positivo. Valida por 6 meses.',
    reviewed_by_id: 'admin-1',
    reviewed_at: daysAgo(24),
    created_at: daysAgo(25),
    updated_at: daysAgo(24),
  },
];

const PRETRAINING_CHECKS: PretrainingCheck[] = [
  {
    id: 'check-1',
    academy_id: 'academy-1',
    profile_id: 'profile-1',
    professor_id: 'professor-1',
    check_date: new Date().toISOString().slice(0, 10),
    feeling_score: 5,
    pain_reported: false,
    cleared_to_train: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'check-2',
    academy_id: 'academy-1',
    profile_id: 'profile-2',
    professor_id: 'professor-1',
    check_date: new Date().toISOString().slice(0, 10),
    feeling_score: 3,
    pain_reported: true,
    pain_location: 'Joelho direito',
    pain_level: 4,
    cleared_to_train: true,
    restrictions_applied: ['no_ground', 'no_takedowns'],
    notes: 'Dor no joelho direito — evitar solo e quedas.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'check-3',
    academy_id: 'academy-1',
    profile_id: 'profile-3',
    professor_id: 'professor-1',
    check_date: new Date().toISOString().slice(0, 10),
    feeling_score: 4,
    pain_reported: false,
    cleared_to_train: true,
    created_at: new Date().toISOString(),
  },
];

const HEALTH_CONFIGS: HealthConfig[] = [
  {
    id: 'hconfig-1',
    academy_id: 'academy-1',
    require_parq: true,
    require_medical_clearance: false,
    clearance_validity_months: 12,
    require_emergency_contact: true,
    require_pretraining_check: false,
    auto_restrict_on_injury: true,
    notify_professor_restrictions: true,
    created_at: daysAgo(120),
    updated_at: daysAgo(120),
  },
];

// ════════════════════════════════════════════════════════
// PAR-Q
// ════════════════════════════════════════════════════════

export async function mockSubmitParqResponse(
  academyId: string,
  profileId: string,
  answers: ParqAnswers,
  lgpdConsent: { consent: boolean; ip?: string },
): Promise<ParqResponse | null> {
  await delay();
  const hasRisk =
    answers.q1_heart_condition || answers.q2_chest_pain_activity ||
    answers.q3_chest_pain_rest || answers.q4_dizziness_balance ||
    answers.q5_bone_joint_problem || answers.q6_medication_bp_heart ||
    answers.q7_other_reason;
  const now = new Date().toISOString();
  const created: ParqResponse = {
    id: `parq-${Date.now()}`,
    academy_id: academyId,
    profile_id: profileId,
    version: 1,
    ...answers,
    has_risk_factor: hasRisk,
    lgpd_health_consent: lgpdConsent.consent,
    lgpd_consent_date: now,
    lgpd_consent_ip: lgpdConsent.ip,
    completed_at: now,
    created_at: now,
    updated_at: now,
  };
  PARQ_RESPONSES.push(created);
  return created;
}

export async function mockGetLatestParqResponse(
  academyId: string,
  profileId: string,
): Promise<ParqResponse | null> {
  await delay();
  const filtered = PARQ_RESPONSES
    .filter((p) => p.academy_id === academyId && p.profile_id === profileId)
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  return filtered.length > 0 ? { ...filtered[0] } : null;
}

export async function mockGetParqResponses(
  academyId: string,
  filters?: { hasRisk?: boolean },
): Promise<ParqResponse[]> {
  await delay();
  let result = PARQ_RESPONSES.filter((p) => p.academy_id === academyId);
  if (filters?.hasRisk !== undefined) {
    result = result.filter((p) => p.has_risk_factor === filters.hasRisk);
  }
  return result.map((p) => ({ ...p }));
}

// ════════════════════════════════════════════════════════
// MEDICAL HISTORY
// ════════════════════════════════════════════════════════

export async function mockSaveMedicalHistory(
  academyId: string,
  profileId: string,
  data: Partial<MedicalHistory>,
): Promise<MedicalHistory | null> {
  await delay();
  const idx = MEDICAL_HISTORIES.findIndex(
    (h) => h.academy_id === academyId && h.profile_id === profileId,
  );
  const now = new Date().toISOString();
  if (idx >= 0) {
    MEDICAL_HISTORIES[idx] = { ...MEDICAL_HISTORIES[idx], ...data, updated_at: now };
    return { ...MEDICAL_HISTORIES[idx] };
  }
  const created: MedicalHistory = {
    id: `medhist-${Date.now()}`,
    academy_id: academyId,
    profile_id: profileId,
    has_cardiovascular: false,
    has_respiratory: false,
    has_musculoskeletal: false,
    has_neurological: false,
    has_metabolic: false,
    has_allergies: false,
    takes_medication: false,
    has_surgeries: false,
    has_skin_conditions: false,
    has_infectious_disease: false,
    has_bleeding_disorder: false,
    uses_hearing_aid: false,
    uses_glasses_contacts: false,
    has_dental_prosthesis: false,
    lgpd_health_consent: false,
    created_at: now,
    updated_at: now,
    ...data,
  };
  MEDICAL_HISTORIES.push(created);
  return created;
}

export async function mockGetMedicalHistory(
  academyId: string,
  profileId: string,
): Promise<MedicalHistory | null> {
  await delay();
  const found = MEDICAL_HISTORIES.find(
    (h) => h.academy_id === academyId && h.profile_id === profileId,
  );
  return found ? { ...found } : null;
}

// ════════════════════════════════════════════════════════
// INJURIES
// ════════════════════════════════════════════════════════

export async function mockReportInjury(
  academyId: string,
  profileId: string,
  data: Omit<HealthInjury, 'id' | 'academy_id' | 'profile_id' | 'created_at' | 'updated_at'>,
): Promise<HealthInjury | null> {
  await delay();
  const now = new Date().toISOString();
  const created: HealthInjury = {
    ...data,
    id: `injury-${Date.now()}`,
    academy_id: academyId,
    profile_id: profileId,
    created_at: now,
    updated_at: now,
  };
  INJURIES.push(created);
  return created;
}

export async function mockListInjuries(
  academyId: string,
  filters?: { profileId?: string; status?: RecoveryStatus; severity?: Severity },
): Promise<HealthInjury[]> {
  await delay();
  let result = INJURIES.filter((i) => i.academy_id === academyId);
  if (filters?.profileId) result = result.filter((i) => i.profile_id === filters.profileId);
  if (filters?.status) result = result.filter((i) => i.recovery_status === filters.status);
  if (filters?.severity) result = result.filter((i) => i.severity === filters.severity);
  return result.map((i) => ({ ...i }));
}

export async function mockGetInjury(id: string): Promise<HealthInjury | null> {
  await delay();
  const found = INJURIES.find((i) => i.id === id);
  return found ? { ...found } : null;
}

export async function mockUpdateInjury(
  id: string,
  data: Partial<HealthInjury>,
): Promise<HealthInjury | null> {
  await delay();
  const idx = INJURIES.findIndex((i) => i.id === id);
  if (idx < 0) return null;
  INJURIES[idx] = { ...INJURIES[idx], ...data, updated_at: new Date().toISOString() };
  return { ...INJURIES[idx] };
}

export async function mockClearInjuryReturn(
  injuryId: string,
  clearedById: string,
): Promise<HealthInjury | null> {
  await delay();
  const idx = INJURIES.findIndex((i) => i.id === injuryId);
  if (idx < 0) return null;
  const now = new Date().toISOString().slice(0, 10);
  INJURIES[idx] = {
    ...INJURIES[idx],
    recovery_status: 'recovered',
    actual_recovery_date: now,
    return_cleared_by_id: clearedById,
    return_clearance_date: now,
    updated_at: new Date().toISOString(),
  };
  return { ...INJURIES[idx] };
}

// ════════════════════════════════════════════════════════
// RESTRICTIONS
// ════════════════════════════════════════════════════════

export async function mockAddRestriction(
  academyId: string,
  profileId: string,
  data: Omit<TrainingRestriction, 'id' | 'academy_id' | 'profile_id' | 'is_active' | 'created_at' | 'updated_at'>,
): Promise<TrainingRestriction | null> {
  await delay();
  const now = new Date().toISOString();
  const created: TrainingRestriction = {
    ...data,
    id: `restriction-${Date.now()}`,
    academy_id: academyId,
    profile_id: profileId,
    is_active: true,
    created_at: now,
    updated_at: now,
  };
  RESTRICTIONS.push(created);
  return created;
}

export async function mockListRestrictions(
  academyId: string,
  filters?: { profileId?: string; activeOnly?: boolean },
): Promise<TrainingRestriction[]> {
  await delay();
  let result = RESTRICTIONS.filter((r) => r.academy_id === academyId);
  if (filters?.profileId) result = result.filter((r) => r.profile_id === filters.profileId);
  if (filters?.activeOnly) result = result.filter((r) => r.is_active);
  return result.map((r) => ({ ...r }));
}

export async function mockGetActiveRestrictions(
  academyId: string,
  profileId: string,
): Promise<TrainingRestriction[]> {
  await delay();
  return RESTRICTIONS
    .filter((r) => r.academy_id === academyId && r.profile_id === profileId && r.is_active)
    .map((r) => ({ ...r }));
}

export async function mockRemoveRestriction(id: string): Promise<boolean> {
  await delay();
  const idx = RESTRICTIONS.findIndex((r) => r.id === id);
  if (idx < 0) return false;
  RESTRICTIONS[idx] = { ...RESTRICTIONS[idx], is_active: false, updated_at: new Date().toISOString() };
  return true;
}

// ════════════════════════════════════════════════════════
// CLEARANCES
// ════════════════════════════════════════════════════════

export async function mockRequestClearance(
  academyId: string,
  profileId: string,
  data: Omit<MedicalClearance, 'id' | 'academy_id' | 'profile_id' | 'status' | 'reviewed_by_id' | 'reviewed_at' | 'created_at' | 'updated_at'>,
): Promise<MedicalClearance | null> {
  await delay();
  const now = new Date().toISOString();
  const created: MedicalClearance = {
    ...data,
    id: `clearance-${Date.now()}`,
    academy_id: academyId,
    profile_id: profileId,
    status: 'pending',
    created_at: now,
    updated_at: now,
  };
  CLEARANCES.push(created);
  return created;
}

export async function mockListClearances(
  academyId: string,
  filters?: { profileId?: string; status?: ClearanceStatus },
): Promise<MedicalClearance[]> {
  await delay();
  let result = CLEARANCES.filter((c) => c.academy_id === academyId);
  if (filters?.profileId) result = result.filter((c) => c.profile_id === filters.profileId);
  if (filters?.status) result = result.filter((c) => c.status === filters.status);
  return result.map((c) => ({ ...c }));
}

export async function mockReviewClearance(
  id: string,
  status: 'approved' | 'denied',
  reviewedById: string,
  notes?: string,
): Promise<MedicalClearance | null> {
  await delay();
  const idx = CLEARANCES.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  const now = new Date().toISOString();
  CLEARANCES[idx] = {
    ...CLEARANCES[idx],
    status,
    reviewed_by_id: reviewedById,
    reviewed_at: now,
    notes: notes ?? CLEARANCES[idx].notes,
    updated_at: now,
  };
  return { ...CLEARANCES[idx] };
}

export async function mockGetActiveClearance(
  academyId: string,
  profileId: string,
): Promise<MedicalClearance | null> {
  await delay();
  const now = Date.now();
  const active = CLEARANCES.find(
    (c) =>
      c.academy_id === academyId &&
      c.profile_id === profileId &&
      c.status === 'approved' &&
      c.valid_until &&
      new Date(c.valid_until).getTime() > now,
  );
  return active ? { ...active } : null;
}

// ════════════════════════════════════════════════════════
// PRE-TRAINING CHECKS
// ════════════════════════════════════════════════════════

export async function mockSubmitPretrainingCheck(
  academyId: string,
  profileId: string,
  professorId: string,
  data: {
    class_id?: string;
    feeling_score?: number;
    pain_reported: boolean;
    pain_location?: string;
    pain_level?: number;
    cleared_to_train: boolean;
    restrictions_applied?: string[];
    notes?: string;
  },
): Promise<PretrainingCheck | null> {
  await delay();
  const now = new Date().toISOString();
  const created: PretrainingCheck = {
    id: `check-${Date.now()}`,
    academy_id: academyId,
    profile_id: profileId,
    professor_id: professorId,
    check_date: now.slice(0, 10),
    ...data,
    created_at: now,
  };
  PRETRAINING_CHECKS.push(created);
  return created;
}

export async function mockGetTodaysPretrainingCheck(
  academyId: string,
  profileId: string,
): Promise<PretrainingCheck | null> {
  await delay();
  const today = new Date().toISOString().slice(0, 10);
  const found = PRETRAINING_CHECKS.find(
    (c) => c.academy_id === academyId && c.profile_id === profileId && c.check_date === today,
  );
  return found ? { ...found } : null;
}

export async function mockListPretrainingChecks(
  academyId: string,
  filters?: { profileId?: string; date?: string },
): Promise<PretrainingCheck[]> {
  await delay();
  let result = PRETRAINING_CHECKS.filter((c) => c.academy_id === academyId);
  if (filters?.profileId) result = result.filter((c) => c.profile_id === filters.profileId);
  if (filters?.date) result = result.filter((c) => c.check_date === filters.date);
  return result.map((c) => ({ ...c }));
}

// ════════════════════════════════════════════════════════
// HEALTH CONFIG
// ════════════════════════════════════════════════════════

export async function mockGetHealthConfig(
  academyId: string,
): Promise<HealthConfig | null> {
  await delay();
  const found = HEALTH_CONFIGS.find((c) => c.academy_id === academyId);
  return found ? { ...found } : null;
}

export async function mockUpdateHealthConfig(
  academyId: string,
  data: Partial<HealthConfig>,
): Promise<HealthConfig | null> {
  await delay();
  const idx = HEALTH_CONFIGS.findIndex((c) => c.academy_id === academyId);
  if (idx < 0) return null;
  HEALTH_CONFIGS[idx] = { ...HEALTH_CONFIGS[idx], ...data, updated_at: new Date().toISOString() };
  return { ...HEALTH_CONFIGS[idx] };
}

export async function mockSeedDefaultHealthConfig(
  academyId: string,
): Promise<HealthConfig | null> {
  await delay();
  const existing = HEALTH_CONFIGS.find((c) => c.academy_id === academyId);
  if (existing) return { ...existing };
  const now = new Date().toISOString();
  const config: HealthConfig = {
    id: `hconfig-${Date.now()}`,
    academy_id: academyId,
    require_parq: true,
    require_medical_clearance: false,
    clearance_validity_months: 12,
    require_emergency_contact: true,
    require_pretraining_check: false,
    auto_restrict_on_injury: true,
    notify_professor_restrictions: true,
    created_at: now,
    updated_at: now,
  };
  HEALTH_CONFIGS.push(config);
  return config;
}

// ════════════════════════════════════════════════════════
// HEALTH SUMMARY
// ════════════════════════════════════════════════════════

export async function mockGetMyHealthSummary(
  academyId: string,
): Promise<HealthSummary> {
  await delay();
  // Return profile-1's data for mock
  const profileId = 'profile-1';
  const parq = await mockGetLatestParqResponse(academyId, profileId);
  const history = await mockGetMedicalHistory(academyId, profileId);
  const activeInjuries = INJURIES.filter(
    (i) => i.academy_id === academyId && i.profile_id === profileId &&
      i.recovery_status !== 'recovered',
  ).map((i) => ({ ...i }));
  const restrictions = RESTRICTIONS.filter(
    (r) => r.academy_id === academyId && r.profile_id === profileId && r.is_active,
  ).map((r) => ({ ...r }));
  const now = Date.now();
  const clearance = CLEARANCES.find(
    (c) =>
      c.academy_id === academyId && c.profile_id === profileId &&
      c.status === 'approved' && c.valid_until && new Date(c.valid_until).getTime() > now,
  ) ?? null;

  return {
    parq,
    history,
    activeInjuries,
    restrictions,
    clearance: clearance ? { ...clearance } : null,
  };
}
