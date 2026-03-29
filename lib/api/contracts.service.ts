// BlackBelt v2 — Contracts Service Layer (complete rewrite)
// Handles software contracts, academy templates, and student contracts.

import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// ---------------------------------------------------------------------------
// Types — Software Contract
// ---------------------------------------------------------------------------

export interface SoftwareContractTemplate {
  id: string;
  version: number;
  title: string;
  body_html: string;
  plan_clauses: Record<string, string>;
  updated_by?: string;
  updated_at: string;
  created_at: string;
}

export interface SoftwareContract {
  id: string;
  academy_id: string;
  template_version: number;
  academy_name: string;
  academy_cnpj?: string;
  academy_owner_name: string;
  academy_owner_cpf?: string;
  academy_owner_email: string;
  plan_slug: string;
  plan_name: string;
  monthly_value_cents: number;
  billing_cycle: string;
  status: SoftwareContractStatus;
  signed_at?: string;
  digital_hash?: string;
  contract_body_html?: string;
  pdf_url?: string;
  trial_started_at?: string;
  trial_ended_at?: string;
  contract_start_date: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export type SoftwareContractStatus =
  | 'trial'
  | 'pending_signature'
  | 'active'
  | 'suspended'
  | 'cancelled'
  | 'expired';

// ---------------------------------------------------------------------------
// Types — Academy Contract Template
// ---------------------------------------------------------------------------

export interface AcademyContractTemplate {
  id: string;
  academy_id: string;
  name: string;
  version: number;
  is_active: boolean;
  is_default: boolean;
  source: 'system' | 'custom' | 'upload';
  body_html?: string;
  uploaded_file_url?: string;
  uploaded_file_name?: string;
  academy_legal_name?: string;
  academy_cnpj?: string;
  academy_address?: string;
  default_plan_name?: string;
  default_monthly_value_cents?: number;
  default_payment_day?: number;
  default_duration_months?: number;
  late_fee_percent?: number;
  late_interest_monthly?: number;
  grace_period_days?: number;
  cancellation_notice_days?: number;
  require_injury_waiver: boolean;
  require_medical_clearance: boolean;
  require_image_consent: boolean;
  require_lgpd_consent: boolean;
  minor_clauses_enabled: boolean;
  jurisdiction_city?: string;
  jurisdiction_state?: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Types — Student Contract
// ---------------------------------------------------------------------------

export interface StudentContract {
  id: string;
  academy_id: string;
  template_id?: string;
  source: string;
  student_profile_id: string;
  student_name: string;
  student_cpf?: string;
  student_email: string;
  plan_name: string;
  monthly_value_cents: number;
  payment_day: number;
  duration_months: number;
  start_date: string;
  end_date: string;
  status: StudentContractStatus;
  signed_at?: string;
  digital_hash?: string;
  contract_body_html?: string;
  uploaded_file_url?: string;
  guardian_name?: string;
  modalities: string;
  injury_waiver_accepted: boolean;
  medical_clearance_accepted: boolean;
  image_consent_accepted: boolean;
  lgpd_consent_accepted: boolean;
  created_at: string;
  updated_at: string;
}

export type StudentContractStatus =
  | 'draft'
  | 'pending_signature'
  | 'active'
  | 'suspended'
  | 'cancelled'
  | 'expired'
  | 'renewed';

// ---------------------------------------------------------------------------
// Types — History / Metrics / Signature
// ---------------------------------------------------------------------------

export interface ContractHistoryEntry {
  id: string;
  contract_type: string;
  contract_id: string;
  action: string;
  actor_id?: string;
  details: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface ContractMetrics {
  total: number;
  active: number;
  pending: number;
  expired: number;
  cancelled: number;
}

export interface SignatureData {
  name: string;
  cpf: string;
  ip: string;
  userAgent: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function supabase() {
  const { createBrowserClient } = await import('@/lib/supabase/client');
  return createBrowserClient();
}

// ============================================================================================
//  SOFTWARE CONTRACT TEMPLATE
// ============================================================================================

export async function getSoftwareContractTemplate(): Promise<SoftwareContractTemplate | null> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockGetSoftwareContractTemplate();
  }

  const sb = await supabase();
  const { data, error } = await sb
    .from('software_contract_template')
    .select('*')
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    logServiceError(error, 'contracts');
    return null;
  }
  return data as unknown as SoftwareContractTemplate;
}

export async function updateSoftwareContractTemplate(
  updates: Partial<SoftwareContractTemplate>,
): Promise<SoftwareContractTemplate> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockUpdateSoftwareContractTemplate(updates);
  }

  const sb = await supabase();

  // Get current template to increment version
  const current = await getSoftwareContractTemplate();
  const nextVersion = current ? current.version + 1 : 1;

  const { data, error } = await sb
    .from('software_contract_template')
    .insert({
      ...updates,
      version: nextVersion,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    logServiceError(error, 'contracts');
    throw new Error(`Failed to update software contract template: ${error?.message ?? 'no data'}`);
  }
  return data as unknown as SoftwareContractTemplate;
}

// ============================================================================================
//  SOFTWARE CONTRACT
// ============================================================================================

export async function getSoftwareContract(academyId: string): Promise<SoftwareContract | null> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockGetSoftwareContract(academyId);
  }

  const sb = await supabase();
  const { data, error } = await sb
    .from('software_contracts')
    .select('*')
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    logServiceError(error, 'contracts');
    return null;
  }
  return data as unknown as SoftwareContract;
}

export async function generateSoftwareContract(
  academyId: string,
  planData: {
    slug: string;
    name: string;
    monthly_value_cents: number;
    billing_cycle?: string;
  },
): Promise<SoftwareContract> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockGenerateSoftwareContract(academyId, planData);
  }

  const sb = await supabase();

  // 1. Get template HTML
  const { getDefaultSoftwareContractHTML } = await import('@/lib/contracts/default-software-template');
  const template = await getSoftwareContractTemplate();
  const templateHTML = template?.body_html ?? getDefaultSoftwareContractHTML();
  const templateVersion = template?.version ?? 1;

  // 2. Get academy data
  const { data: academy, error: academyError } = await sb
    .from('academies')
    .select('name, cnpj, owner_name, owner_cpf, owner_email')
    .eq('id', academyId)
    .single();

  if (academyError || !academy) {
    logServiceError(academyError, 'contracts');
    throw new Error(`Academy not found: ${academyError?.message ?? 'no data'}`);
  }

  // 3. Replace variables
  const { formatCurrencyExtensive, dateToExtensive } = await import('@/lib/contracts/utils');
  const now = new Date();
  const vars: Record<string, string> = {
    ACADEMY_NAME: academy.name ?? '',
    ACADEMY_CNPJ: academy.cnpj ?? '_______________',
    OWNER_NAME: academy.owner_name ?? '',
    OWNER_CPF: academy.owner_cpf ?? '_______________',
    PLAN_NAME: planData.name,
    MONTHLY_VALUE: formatCurrencyExtensive(planData.monthly_value_cents),
    PAYMENT_DAY: '10',
    CONTRACT_START_DATE: dateToExtensive(now),
    DIGITAL_HASH: '',
    SIGNATURE_DATE: '',
    SIGNATURE_IP: '',
  };

  const bodyHTML = replaceContractVariables(templateHTML, vars);

  // 4. Insert contract
  const { data, error } = await sb
    .from('software_contracts')
    .insert({
      academy_id: academyId,
      template_version: templateVersion,
      academy_name: academy.name,
      academy_cnpj: academy.cnpj,
      academy_owner_name: academy.owner_name,
      academy_owner_cpf: academy.owner_cpf,
      academy_owner_email: academy.owner_email,
      plan_slug: planData.slug,
      plan_name: planData.name,
      monthly_value_cents: planData.monthly_value_cents,
      billing_cycle: planData.billing_cycle ?? 'monthly',
      status: 'pending_signature',
      contract_body_html: bodyHTML,
      contract_start_date: now.toISOString().split('T')[0],
      auto_renew: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    logServiceError(error, 'contracts');
    throw new Error(`Failed to generate software contract: ${error?.message ?? 'no data'}`);
  }
  return data as unknown as SoftwareContract;
}

export async function signSoftwareContract(
  contractId: string,
  sig: SignatureData,
): Promise<SoftwareContract> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockSignSoftwareContract(contractId, sig);
  }

  const sb = await supabase();
  const { generateHash } = await import('@/lib/contracts/utils');

  // 1. Get the contract for hash material
  const { data: existing, error: fetchErr } = await sb
    .from('software_contracts')
    .select('contract_body_html')
    .eq('id', contractId)
    .single();

  if (fetchErr || !existing) {
    throw new Error(`Contract not found: ${fetchErr?.message ?? 'no data'}`);
  }

  const now = new Date().toISOString();
  const hashContent = (existing.contract_body_html ?? '') + now + sig.ip + sig.name;
  const digitalHash = generateHash(hashContent);

  // 2. Update contract
  const { data, error } = await sb
    .from('software_contracts')
    .update({
      status: 'active',
      signed_at: now,
      digital_hash: digitalHash,
      signature_ip: sig.ip,
      signature_ua: sig.userAgent,
      updated_at: now,
    })
    .eq('id', contractId)
    .select()
    .single();

  if (error || !data) {
    logServiceError(error, 'contracts');
    throw new Error(`Failed to sign software contract: ${error?.message ?? 'no data'}`);
  }

  // 3. Insert history
  await sb.from('contract_history').insert({
    contract_type: 'software',
    contract_id: contractId,
    action: 'signed',
    details: { signer_name: sig.name, signer_cpf: sig.cpf, digital_hash: digitalHash },
    ip_address: sig.ip,
    created_at: now,
  });

  return data as unknown as SoftwareContract;
}

// ============================================================================================
//  ACADEMY CONTRACT TEMPLATES
// ============================================================================================

export async function listAcademyTemplates(
  academyId: string,
): Promise<AcademyContractTemplate[]> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockListAcademyTemplates(academyId);
  }

  const sb = await supabase();
  const { data, error } = await sb
    .from('academy_contract_templates')
    .select('*')
    .eq('academy_id', academyId)
    .order('is_default', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error || !data) {
    logServiceError(error, 'contracts');
    return [];
  }
  return data as unknown as AcademyContractTemplate[];
}

export async function getAcademyTemplate(
  templateId: string,
): Promise<AcademyContractTemplate | null> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockGetAcademyTemplate(templateId);
  }

  const sb = await supabase();
  const { data, error } = await sb
    .from('academy_contract_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error || !data) {
    logServiceError(error, 'contracts');
    return null;
  }
  return data as unknown as AcademyContractTemplate;
}

export async function createAcademyTemplate(
  academyId: string,
  templateData: Partial<AcademyContractTemplate>,
): Promise<AcademyContractTemplate> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockCreateAcademyTemplate(academyId, templateData);
  }

  const sb = await supabase();
  const now = new Date().toISOString();

  const { data, error } = await sb
    .from('academy_contract_templates')
    .insert({
      academy_id: academyId,
      name: templateData.name ?? 'Novo Modelo',
      version: 1,
      is_active: templateData.is_active ?? true,
      is_default: templateData.is_default ?? false,
      source: templateData.source ?? 'custom',
      body_html: templateData.body_html,
      uploaded_file_url: templateData.uploaded_file_url,
      uploaded_file_name: templateData.uploaded_file_name,
      academy_legal_name: templateData.academy_legal_name,
      academy_cnpj: templateData.academy_cnpj,
      academy_address: templateData.academy_address,
      default_plan_name: templateData.default_plan_name,
      default_monthly_value_cents: templateData.default_monthly_value_cents,
      default_payment_day: templateData.default_payment_day,
      default_duration_months: templateData.default_duration_months,
      late_fee_percent: templateData.late_fee_percent ?? 2,
      late_interest_monthly: templateData.late_interest_monthly ?? 1,
      grace_period_days: templateData.grace_period_days ?? 5,
      cancellation_notice_days: templateData.cancellation_notice_days ?? 30,
      require_injury_waiver: templateData.require_injury_waiver ?? true,
      require_medical_clearance: templateData.require_medical_clearance ?? false,
      require_image_consent: templateData.require_image_consent ?? true,
      require_lgpd_consent: templateData.require_lgpd_consent ?? true,
      minor_clauses_enabled: templateData.minor_clauses_enabled ?? true,
      jurisdiction_city: templateData.jurisdiction_city,
      jurisdiction_state: templateData.jurisdiction_state,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error || !data) {
    logServiceError(error, 'contracts');
    throw new Error(`Failed to create academy template: ${error?.message ?? 'no data'}`);
  }
  return data as unknown as AcademyContractTemplate;
}

export async function updateAcademyTemplate(
  templateId: string,
  updates: Partial<AcademyContractTemplate>,
): Promise<AcademyContractTemplate> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockUpdateAcademyTemplate(templateId, updates);
  }

  const sb = await supabase();
  const { data, error } = await sb
    .from('academy_contract_templates')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .select()
    .single();

  if (error || !data) {
    logServiceError(error, 'contracts');
    throw new Error(`Failed to update academy template: ${error?.message ?? 'no data'}`);
  }
  return data as unknown as AcademyContractTemplate;
}

export async function setDefaultTemplate(templateId: string): Promise<void> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockSetDefaultTemplate(templateId);
  }

  const sb = await supabase();

  // Get the template to find academy_id
  const { data: tpl, error: tplErr } = await sb
    .from('academy_contract_templates')
    .select('academy_id')
    .eq('id', templateId)
    .single();

  if (tplErr || !tpl) {
    throw new Error(`Template not found: ${tplErr?.message ?? 'no data'}`);
  }

  // Unset all defaults for this academy
  await sb
    .from('academy_contract_templates')
    .update({ is_default: false, updated_at: new Date().toISOString() })
    .eq('academy_id', tpl.academy_id);

  // Set this one as default
  const { error } = await sb
    .from('academy_contract_templates')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', templateId);

  if (error) {
    logServiceError(error, 'contracts');
    throw new Error(`Failed to set default template: ${error.message}`);
  }
}

export async function seedSystemTemplate(
  academyId: string,
): Promise<AcademyContractTemplate> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockSeedSystemTemplate(academyId);
  }

  const sb = await supabase();

  // 1. Get academy data
  const { data: academy, error: academyErr } = await sb
    .from('academies')
    .select('name, cnpj, address')
    .eq('id', academyId)
    .single();

  if (academyErr || !academy) {
    throw new Error(`Academy not found: ${academyErr?.message ?? 'no data'}`);
  }

  // 2. Get the default student contract HTML
  const { getDefaultStudentContractHTML } = await import('@/lib/contracts/default-student-template');
  let bodyHTML = getDefaultStudentContractHTML();

  // 3. Replace academy variables
  const vars: Record<string, string> = {
    ACADEMY_NAME: academy.name ?? '',
    ACADEMY_CNPJ: academy.cnpj ?? '_______________',
    ACADEMY_ADDRESS: academy.address ?? '_______________',
  };
  bodyHTML = replaceContractVariables(bodyHTML, vars);

  // 4. Insert template
  return createAcademyTemplate(academyId, {
    name: 'Modelo Padrao BlackBelt',
    source: 'system',
    is_default: true,
    is_active: true,
    body_html: bodyHTML,
    academy_legal_name: academy.name,
    academy_cnpj: academy.cnpj,
    academy_address: academy.address,
    require_injury_waiver: true,
    require_medical_clearance: false,
    require_image_consent: true,
    require_lgpd_consent: true,
    minor_clauses_enabled: true,
  });
}

// ============================================================================================
//  STUDENT CONTRACTS
// ============================================================================================

export async function generateStudentContract(
  templateId: string,
  studentData: {
    academy_id: string;
    student_profile_id: string;
    student_name: string;
    student_cpf?: string;
    student_email: string;
    student_birth_date?: string;
    plan_name: string;
    monthly_value_cents: number;
    payment_day: number;
    duration_months: number;
    start_date: string;
    modalities: string;
  },
  guardianData?: {
    guardian_name: string;
    guardian_cpf: string;
  },
): Promise<StudentContract> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockGenerateStudentContract(templateId, studentData, guardianData);
  }

  const sb = await supabase();

  // 1. Get template
  const template = await getAcademyTemplate(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  // 2. Build HTML from template or default
  const { getDefaultStudentContractHTML } = await import('@/lib/contracts/default-student-template');
  const { formatCurrencyExtensive, dateToExtensive } = await import('@/lib/contracts/utils');

  let bodyHTML = template.body_html ?? getDefaultStudentContractHTML();

  // 3. Compute end date
  const startDate = new Date(studentData.start_date);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + studentData.duration_months);
  const endDateStr = endDate.toISOString().split('T')[0];

  // 4. Replace variables
  const vars: Record<string, string> = {
    ACADEMY_NAME: template.academy_legal_name ?? '',
    ACADEMY_CNPJ: template.academy_cnpj ?? '_______________',
    ACADEMY_ADDRESS: template.academy_address ?? '_______________',
    STUDENT_NAME: studentData.student_name,
    STUDENT_CPF: studentData.student_cpf ?? '_______________',
    STUDENT_EMAIL: studentData.student_email,
    STUDENT_BIRTH_DATE: studentData.student_birth_date
      ? dateToExtensive(studentData.student_birth_date)
      : '_______________',
    GUARDIAN_NAME: guardianData?.guardian_name ?? '_______________',
    GUARDIAN_CPF: guardianData?.guardian_cpf ?? '_______________',
    PLAN_NAME: studentData.plan_name,
    MONTHLY_VALUE: formatCurrencyExtensive(studentData.monthly_value_cents),
    ENROLLMENT_FEE: template.default_monthly_value_cents
      ? formatCurrencyExtensive(template.default_monthly_value_cents)
      : 'isento',
    PAYMENT_DAY: String(studentData.payment_day),
    START_DATE: dateToExtensive(startDate),
    END_DATE: dateToExtensive(endDate),
    DURATION_MONTHS: String(studentData.duration_months),
    MODALITIES: studentData.modalities,
    DIGITAL_HASH: '',
    SIGNATURE_DATE: '',
    SIGNATURE_IP: '',
  };
  bodyHTML = replaceContractVariables(bodyHTML, vars);

  const now = new Date().toISOString();

  // 5. Insert contract
  const { data, error } = await sb
    .from('student_contracts')
    .insert({
      academy_id: studentData.academy_id,
      template_id: templateId,
      source: template.source,
      student_profile_id: studentData.student_profile_id,
      student_name: studentData.student_name,
      student_cpf: studentData.student_cpf,
      student_email: studentData.student_email,
      plan_name: studentData.plan_name,
      monthly_value_cents: studentData.monthly_value_cents,
      payment_day: studentData.payment_day,
      duration_months: studentData.duration_months,
      start_date: studentData.start_date,
      end_date: endDateStr,
      status: 'draft',
      contract_body_html: bodyHTML,
      guardian_name: guardianData?.guardian_name,
      modalities: studentData.modalities,
      injury_waiver_accepted: false,
      medical_clearance_accepted: false,
      image_consent_accepted: false,
      lgpd_consent_accepted: false,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error || !data) {
    logServiceError(error, 'contracts');
    throw new Error(`Failed to generate student contract: ${error?.message ?? 'no data'}`);
  }
  return data as unknown as StudentContract;
}

export async function getStudentContract(
  contractId: string,
): Promise<StudentContract | null> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockGetStudentContract(contractId);
  }

  const sb = await supabase();
  const { data, error } = await sb
    .from('student_contracts')
    .select('*')
    .eq('id', contractId)
    .single();

  if (error || !data) {
    logServiceError(error, 'contracts');
    return null;
  }
  return data as unknown as StudentContract;
}

export async function listStudentContracts(
  academyId: string,
  filters?: { status?: StudentContractStatus; search?: string },
): Promise<StudentContract[]> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockListStudentContracts(academyId, filters);
  }

  const sb = await supabase();
  let query = sb
    .from('student_contracts')
    .select('*')
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.search) {
    query = query.or(
      `student_name.ilike.%${filters.search}%,student_email.ilike.%${filters.search}%`,
    );
  }

  const { data, error } = await query;

  if (error || !data) {
    logServiceError(error, 'contracts');
    return [];
  }
  return data as unknown as StudentContract[];
}

export async function getMyContracts(
  studentProfileId: string,
): Promise<StudentContract[]> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockGetMyContracts(studentProfileId);
  }

  const sb = await supabase();
  const { data, error } = await sb
    .from('student_contracts')
    .select('*')
    .eq('student_profile_id', studentProfileId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    logServiceError(error, 'contracts');
    return [];
  }
  return data as unknown as StudentContract[];
}

export async function sendForSignature(contractId: string): Promise<void> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockSendForSignature(contractId);
  }

  const sb = await supabase();
  const now = new Date().toISOString();

  const { error } = await sb
    .from('student_contracts')
    .update({ status: 'pending_signature', updated_at: now })
    .eq('id', contractId);

  if (error) {
    logServiceError(error, 'contracts');
    throw new Error(`Failed to send for signature: ${error.message}`);
  }

  // Record history
  await sb.from('contract_history').insert({
    contract_type: 'student',
    contract_id: contractId,
    action: 'sent_for_signature',
    details: {},
    created_at: now,
  });
}

export async function signStudentContract(
  contractId: string,
  sig: SignatureData,
  consents: {
    injury_waiver: boolean;
    medical_clearance: boolean;
    image_consent: boolean;
    lgpd_consent: boolean;
  },
): Promise<StudentContract> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockSignStudentContract(contractId, sig, consents);
  }

  const sb = await supabase();
  const { generateHash } = await import('@/lib/contracts/utils');

  // 1. Get existing contract for hash material
  const { data: existing, error: fetchErr } = await sb
    .from('student_contracts')
    .select('contract_body_html')
    .eq('id', contractId)
    .single();

  if (fetchErr || !existing) {
    throw new Error(`Contract not found: ${fetchErr?.message ?? 'no data'}`);
  }

  const now = new Date().toISOString();
  const hashContent = (existing.contract_body_html ?? '') + now + sig.ip + sig.name;
  const digitalHash = generateHash(hashContent);

  // 2. Update contract
  const { data, error } = await sb
    .from('student_contracts')
    .update({
      status: 'active',
      signed_at: now,
      digital_hash: digitalHash,
      injury_waiver_accepted: consents.injury_waiver,
      medical_clearance_accepted: consents.medical_clearance,
      image_consent_accepted: consents.image_consent,
      lgpd_consent_accepted: consents.lgpd_consent,
      updated_at: now,
    })
    .eq('id', contractId)
    .select()
    .single();

  if (error || !data) {
    logServiceError(error, 'contracts');
    throw new Error(`Failed to sign student contract: ${error?.message ?? 'no data'}`);
  }

  // 3. Insert history
  await sb.from('contract_history').insert({
    contract_type: 'student',
    contract_id: contractId,
    action: 'signed',
    details: {
      signer_name: sig.name,
      signer_cpf: sig.cpf,
      digital_hash: digitalHash,
      consents,
    },
    ip_address: sig.ip,
    created_at: now,
  });

  return data as unknown as StudentContract;
}

export async function cancelStudentContract(
  contractId: string,
  reason: string,
): Promise<StudentContract> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockCancelStudentContract(contractId, reason);
  }

  const sb = await supabase();
  const now = new Date().toISOString();

  const { data, error } = await sb
    .from('student_contracts')
    .update({ status: 'cancelled', updated_at: now })
    .eq('id', contractId)
    .select()
    .single();

  if (error || !data) {
    logServiceError(error, 'contracts');
    throw new Error(`Failed to cancel student contract: ${error?.message ?? 'no data'}`);
  }

  // Record history
  await sb.from('contract_history').insert({
    contract_type: 'student',
    contract_id: contractId,
    action: 'cancelled',
    details: { reason },
    created_at: now,
  });

  return data as unknown as StudentContract;
}

export async function renewStudentContract(
  contractId: string,
): Promise<StudentContract> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockRenewStudentContract(contractId);
  }

  const sb = await supabase();

  // 1. Get the existing contract
  const existing = await getStudentContract(contractId);
  if (!existing) {
    throw new Error(`Contract not found: ${contractId}`);
  }

  const now = new Date().toISOString();

  // 2. Mark current contract as renewed
  await sb
    .from('student_contracts')
    .update({ status: 'renewed', updated_at: now })
    .eq('id', contractId);

  // 3. Compute new dates
  const newStart = new Date(existing.end_date);
  const newEnd = new Date(newStart);
  newEnd.setMonth(newEnd.getMonth() + existing.duration_months);

  // 4. Insert renewed contract
  const { data, error } = await sb
    .from('student_contracts')
    .insert({
      academy_id: existing.academy_id,
      template_id: existing.template_id,
      source: existing.source,
      student_profile_id: existing.student_profile_id,
      student_name: existing.student_name,
      student_cpf: existing.student_cpf,
      student_email: existing.student_email,
      plan_name: existing.plan_name,
      monthly_value_cents: existing.monthly_value_cents,
      payment_day: existing.payment_day,
      duration_months: existing.duration_months,
      start_date: newStart.toISOString().split('T')[0],
      end_date: newEnd.toISOString().split('T')[0],
      status: 'active',
      contract_body_html: existing.contract_body_html,
      guardian_name: existing.guardian_name,
      modalities: existing.modalities,
      injury_waiver_accepted: existing.injury_waiver_accepted,
      medical_clearance_accepted: existing.medical_clearance_accepted,
      image_consent_accepted: existing.image_consent_accepted,
      lgpd_consent_accepted: existing.lgpd_consent_accepted,
      signed_at: now,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error || !data) {
    logServiceError(error, 'contracts');
    throw new Error(`Failed to renew student contract: ${error?.message ?? 'no data'}`);
  }

  // 5. Record history
  await sb.from('contract_history').insert({
    contract_type: 'student',
    contract_id: data.id,
    action: 'renewed',
    details: { previous_contract_id: contractId },
    created_at: now,
  });

  return data as unknown as StudentContract;
}

// ============================================================================================
//  UTILITIES
// ============================================================================================

export async function getContractMetrics(
  academyId: string,
): Promise<ContractMetrics> {
  const fallback: ContractMetrics = { total: 0, active: 0, pending: 0, expired: 0, cancelled: 0 };

  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockGetContractMetrics(academyId);
  }

  const sb = await supabase();
  const { data, error } = await sb
    .from('student_contracts')
    .select('status')
    .eq('academy_id', academyId);

  if (error || !data) {
    logServiceError(error, 'contracts');
    return fallback;
  }

  const rows = data as { status: string }[];
  return {
    total: rows.length,
    active: rows.filter((r) => r.status === 'active').length,
    pending: rows.filter((r) => r.status === 'draft' || r.status === 'pending_signature').length,
    expired: rows.filter((r) => r.status === 'expired').length,
    cancelled: rows.filter((r) => r.status === 'cancelled').length,
  };
}

export async function getContractHistory(
  contractId: string,
): Promise<ContractHistoryEntry[]> {
  if (isMock()) {
    const m = await import('@/lib/mocks/contracts.mock');
    return m.mockGetContractHistory(contractId);
  }

  const sb = await supabase();
  const { data, error } = await sb
    .from('contract_history')
    .select('*')
    .eq('contract_id', contractId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    logServiceError(error, 'contracts');
    return [];
  }
  return data as unknown as ContractHistoryEntry[];
}

/**
 * Replace {{PLACEHOLDER}} variables in an HTML string.
 */
export function replaceContractVariables(
  html: string,
  vars: Record<string, string>,
): string {
  let result = html;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}
