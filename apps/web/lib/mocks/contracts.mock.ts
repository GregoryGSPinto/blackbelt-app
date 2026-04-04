import type {
  SoftwareContractTemplate,
  SoftwareContract,
  AcademyContractTemplate,
  StudentContract,
  ContractHistoryEntry,
  ContractMetrics,
  SignatureData,
} from '@/lib/api/contracts.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

let _nextId = 100;
function nextId(prefix: string) {
  return `${prefix}-${++_nextId}`;
}

function isoNow() {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// 1. SOFTWARE_TEMPLATE
// ---------------------------------------------------------------------------

const SOFTWARE_TEMPLATE: SoftwareContractTemplate = {
  id: 'sw-tmpl-1',
  version: 1,
  title: 'Contrato de Licenca de Uso do Software BlackBelt',
  body_html: `
<h1>Contrato de Licença de Uso do Software BlackBelt</h1>
<p><strong>CONTRATANTE:</strong> {{academy_name}}, inscrita no CNPJ sob o nº {{academy_cnpj}}, neste ato representada por {{academy_owner_name}}.</p>
<p><strong>CONTRATADA:</strong> BlackBelt Tecnologia Ltda., inscrita no CNPJ sob o nº 00.000.000/0001-00.</p>
<h2>Cláusula 1 – Objeto</h2>
<p>O presente contrato tem por objeto a licença de uso do software BlackBelt, plataforma de gestão para academias de artes marciais, na modalidade SaaS (Software as a Service).</p>
<h2>Cláusula 2 – Plano e Valores</h2>
<p>Plano contratado: <strong>{{plan_name}}</strong>. Valor mensal: <strong>R$ {{monthly_value}}</strong>.</p>
<h2>Cláusula 3 – Vigência</h2>
<p>Este contrato entra em vigor na data de sua assinatura e terá vigência indeterminada, podendo ser rescindido por qualquer das partes mediante aviso prévio de 30 (trinta) dias.</p>
<h2>Cláusula 4 – Período de Teste</h2>
<p>O CONTRATANTE terá direito a um período de teste gratuito de 7 (sete) dias corridos a partir da ativação da conta.</p>
<h2>Cláusula 5 – Obrigações da CONTRATADA</h2>
<p>A CONTRATADA se compromete a manter o software disponível com uptime mínimo de 99,5% ao mês, excluindo períodos de manutenção programada.</p>
<h2>Cláusula 6 – Proteção de Dados</h2>
<p>A CONTRATADA tratará os dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).</p>
<p><em>Documento gerado eletronicamente pelo sistema BlackBelt.</em></p>
`.trim(),
  plan_clauses: {},
  created_at: '2025-11-01T00:00:00Z',
  updated_at: '2025-11-01T00:00:00Z',
};

// ---------------------------------------------------------------------------
// 2. SOFTWARE_CONTRACTS
// ---------------------------------------------------------------------------

const SOFTWARE_CONTRACTS: SoftwareContract[] = [
  {
    id: 'sw-ctr-1',
    template_version: 1,
    academy_id: 'academy-1',
    academy_name: 'Guerreiros do Tatame',
    academy_cnpj: '12.345.678/0001-90',
    academy_owner_name: 'Roberto Silva',
    academy_owner_email: 'roberto@guerreiros.com',
    plan_slug: 'pro',
    plan_name: 'Pro',
    monthly_value_cents: 34700,
    billing_cycle: 'monthly',
    status: 'active',
    signed_at: '2026-01-15T10:00:00Z',
    contract_body_html: SOFTWARE_TEMPLATE.body_html
      .replace('{{academy_name}}', 'Guerreiros do Tatame')
      .replace('{{academy_cnpj}}', '12.345.678/0001-90')
      .replace('{{academy_owner_name}}', 'Roberto Silva')
      .replace('{{plan_name}}', 'Pro')
      .replace('{{monthly_value}}', '249,00'),
    digital_hash: 'abc123def456',
    trial_started_at: '2026-01-01T00:00:00Z',
    trial_ended_at: '2026-01-08T00:00:00Z',
    contract_start_date: '2026-01-15',
    auto_renew: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// 3. ACADEMY_TEMPLATES
// ---------------------------------------------------------------------------

const ACADEMY_TEMPLATES: AcademyContractTemplate[] = [
  {
    id: 'acad-tmpl-1',
    academy_id: 'academy-1',
    name: 'Contrato Padrao',
    version: 1,
    is_active: true,
    is_default: true,
    source: 'system',
    body_html: `
<h1>Contrato de Matrícula</h1>
<p><strong>ACADEMIA:</strong> {{academy_name}}</p>
<p><strong>ALUNO(A):</strong> {{student_name}}, CPF {{student_cpf}}</p>
<h2>1. Objeto</h2>
<p>O presente contrato tem por objeto a prestação de serviços de ensino de artes marciais nas modalidades: {{modalities}}.</p>
<h2>2. Plano e Valores</h2>
<p>Plano: <strong>{{plan_name}}</strong>. Valor mensal: <strong>R$ {{monthly_value}}</strong>.</p>
<h2>3. Vigência</h2>
<p>Início: {{start_date}}. Término: {{end_date}}.</p>
<h2>4. Pagamento</h2>
<p>O pagamento deverá ser efetuado até o dia {{due_day}} de cada mês.</p>
<h2>5. Responsável (Menor de Idade)</h2>
<p>{{#if guardian_name}}Responsável Legal: {{guardian_name}}, CPF {{guardian_cpf}}.{{/if}}</p>
<h2>6. Rescisão</h2>
<p>O aluno poderá solicitar o cancelamento com aviso prévio de 30 dias.</p>
<p><em>Documento gerado pelo sistema BlackBelt.</em></p>
`.trim(),
    require_injury_waiver: true,
    require_medical_clearance: true,
    require_image_consent: false,
    require_lgpd_consent: true,
    minor_clauses_enabled: false,
    created_at: '2025-12-01T00:00:00Z',
    updated_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 'acad-tmpl-2',
    academy_id: 'academy-1',
    name: 'Contrato Personalizado',
    version: 1,
    is_active: true,
    is_default: false,
    source: 'upload',
    uploaded_file_url: '/uploads/contrato.pdf',
    uploaded_file_name: 'contrato.pdf',
    require_injury_waiver: true,
    require_medical_clearance: true,
    require_image_consent: false,
    require_lgpd_consent: true,
    minor_clauses_enabled: false,
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-01-10T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// 4. STUDENT_CONTRACTS
// ---------------------------------------------------------------------------

const STUDENT_CONTRACTS: StudentContract[] = [
  {
    id: 'stu-ctr-1',
    template_id: 'acad-tmpl-1',
    academy_id: 'academy-1',
    source: 'system',
    student_profile_id: 'student-1',
    student_name: 'Joao Silva',
    student_cpf: '111.222.333-44',
    student_email: 'joao.silva@email.com',
    plan_name: 'Mensal',
    monthly_value_cents: 14900,
    payment_day: 10,
    duration_months: 12,
    modalities: 'BJJ',
    start_date: '2026-01-10',
    end_date: '2027-01-10',
    status: 'active',
    contract_body_html: '<p>Contrato assinado de Joao Silva – Plano Mensal – BJJ</p>',
    signed_at: '2026-01-10T14:30:00Z',
    digital_hash: 'hash-stu-1-abc',
    injury_waiver_accepted: true,
    medical_clearance_accepted: true,
    image_consent_accepted: true,
    lgpd_consent_accepted: true,
    created_at: '2026-01-09T10:00:00Z',
    updated_at: '2026-01-10T14:30:00Z',
  },
  {
    id: 'stu-ctr-2',
    template_id: 'acad-tmpl-1',
    academy_id: 'academy-1',
    source: 'system',
    student_profile_id: 'student-2',
    student_name: 'Maria Santos',
    student_cpf: '222.333.444-55',
    student_email: 'maria.santos@email.com',
    plan_name: 'Trimestral',
    monthly_value_cents: 12900,
    payment_day: 5,
    duration_months: 12,
    modalities: 'BJJ, Judo',
    start_date: '2026-02-01',
    end_date: '2027-02-01',
    status: 'active',
    contract_body_html: '<p>Contrato assinado de Maria Santos – Plano Trimestral – BJJ, Judo</p>',
    signed_at: '2026-02-01T09:00:00Z',
    digital_hash: 'hash-stu-2-def',
    injury_waiver_accepted: true,
    medical_clearance_accepted: true,
    image_consent_accepted: false,
    lgpd_consent_accepted: true,
    created_at: '2026-01-28T08:00:00Z',
    updated_at: '2026-02-01T09:00:00Z',
  },
  {
    id: 'stu-ctr-3',
    template_id: 'acad-tmpl-1',
    academy_id: 'academy-1',
    source: 'system',
    student_profile_id: 'student-3',
    student_name: 'Pedro Costa',
    student_cpf: '333.444.555-66',
    student_email: 'pedro.costa@email.com',
    guardian_name: 'Lucia Costa',
    plan_name: 'Semestral',
    monthly_value_cents: 10900,
    payment_day: 15,
    duration_months: 6,
    modalities: 'BJJ',
    start_date: '2026-03-01',
    end_date: '2026-09-01',
    status: 'pending_signature',
    contract_body_html: '<p>Contrato pendente de Pedro Costa – Plano Semestral – BJJ</p>',
    injury_waiver_accepted: false,
    medical_clearance_accepted: false,
    image_consent_accepted: false,
    lgpd_consent_accepted: false,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'stu-ctr-4',
    template_id: 'acad-tmpl-1',
    academy_id: 'academy-1',
    source: 'system',
    student_profile_id: 'student-4',
    student_name: 'Ana Oliveira',
    student_cpf: '555.666.777-88',
    student_email: 'ana.oliveira@email.com',
    plan_name: 'Mensal',
    monthly_value_cents: 19900,
    payment_day: 10,
    duration_months: 12,
    modalities: 'BJJ, Muay Thai',
    start_date: '2025-06-01',
    end_date: '2026-06-01',
    status: 'expired',
    contract_body_html: '<p>Contrato expirado de Ana Oliveira – Plano Mensal – BJJ, Muay Thai</p>',
    signed_at: '2025-06-01T11:00:00Z',
    digital_hash: 'hash-stu-4-ghi',
    injury_waiver_accepted: true,
    medical_clearance_accepted: true,
    image_consent_accepted: true,
    lgpd_consent_accepted: true,
    created_at: '2025-05-28T10:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'stu-ctr-5',
    template_id: 'acad-tmpl-2',
    academy_id: 'academy-1',
    source: 'upload',
    student_profile_id: 'student-5',
    student_name: 'Carlos Mendes',
    student_cpf: '666.777.888-99',
    student_email: 'carlos.mendes@email.com',
    plan_name: 'Anual',
    monthly_value_cents: 9900,
    payment_day: 1,
    duration_months: 12,
    modalities: 'Judo',
    start_date: '2026-01-01',
    end_date: '2027-01-01',
    status: 'cancelled',
    contract_body_html: '<p>Contrato cancelado de Carlos Mendes – Plano Anual – Judo</p>',
    signed_at: '2026-01-01T08:00:00Z',
    digital_hash: 'hash-stu-5-jkl',
    injury_waiver_accepted: true,
    medical_clearance_accepted: true,
    image_consent_accepted: false,
    lgpd_consent_accepted: true,
    created_at: '2025-12-28T10:00:00Z',
    updated_at: '2026-02-15T16:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// 5. CONTRACT_HISTORY
// ---------------------------------------------------------------------------

const CONTRACT_HISTORY: ContractHistoryEntry[] = [
  {
    id: 'hist-1',
    contract_type: 'student',
    contract_id: 'stu-ctr-1',
    action: 'created',
    actor_id: 'user-owner-1',
    details: { message: 'Contrato gerado a partir do template "Contrato Padrao".' },
    created_at: '2026-01-09T10:00:00Z',
  },
  {
    id: 'hist-2',
    contract_type: 'student',
    contract_id: 'stu-ctr-1',
    action: 'sent',
    actor_id: 'user-owner-1',
    details: { message: 'Contrato enviado para assinatura via email para joao.silva@email.com.' },
    created_at: '2026-01-09T10:05:00Z',
  },
  {
    id: 'hist-3',
    contract_type: 'student',
    contract_id: 'stu-ctr-1',
    action: 'viewed',
    actor_id: 'student-1',
    details: { message: 'Contrato visualizado pelo aluno.' },
    created_at: '2026-01-10T14:00:00Z',
  },
  {
    id: 'hist-4',
    contract_type: 'student',
    contract_id: 'stu-ctr-1',
    action: 'signed',
    actor_id: 'student-1',
    details: { message: 'Contrato assinado digitalmente.', ip: '200.100.50.10' },
    ip_address: '200.100.50.10',
    created_at: '2026-01-10T14:30:00Z',
  },
  {
    id: 'hist-5',
    contract_type: 'student',
    contract_id: 'stu-ctr-2',
    action: 'created',
    actor_id: 'user-owner-1',
    details: { message: 'Contrato gerado a partir do template "Contrato Padrao".' },
    created_at: '2026-01-28T08:00:00Z',
  },
  {
    id: 'hist-6',
    contract_type: 'student',
    contract_id: 'stu-ctr-2',
    action: 'sent',
    actor_id: 'user-owner-1',
    details: { message: 'Contrato enviado para assinatura via email para maria.santos@email.com.' },
    created_at: '2026-01-28T08:10:00Z',
  },
  {
    id: 'hist-7',
    contract_type: 'student',
    contract_id: 'stu-ctr-2',
    action: 'signed',
    actor_id: 'student-2',
    details: { message: 'Contrato assinado digitalmente.', ip: '189.30.60.20' },
    ip_address: '189.30.60.20',
    created_at: '2026-02-01T09:00:00Z',
  },
  {
    id: 'hist-8',
    contract_type: 'student',
    contract_id: 'stu-ctr-5',
    action: 'created',
    actor_id: 'user-owner-1',
    details: { message: 'Contrato gerado a partir do template "Contrato Personalizado".' },
    created_at: '2025-12-28T10:00:00Z',
  },
  {
    id: 'hist-9',
    contract_type: 'student',
    contract_id: 'stu-ctr-5',
    action: 'signed',
    actor_id: 'student-5',
    details: { message: 'Contrato assinado digitalmente.', ip: '201.10.30.70' },
    ip_address: '201.10.30.70',
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'hist-10',
    contract_type: 'student',
    contract_id: 'stu-ctr-5',
    action: 'cancelled',
    actor_id: 'student-5',
    details: { message: 'Contrato cancelado.', reason: 'Mudança de cidade' },
    created_at: '2026-02-15T16:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Mock functions – Software Contract Template
// ---------------------------------------------------------------------------

export async function mockGetSoftwareContractTemplate(): Promise<SoftwareContractTemplate> {
  await delay();
  return { ...SOFTWARE_TEMPLATE };
}

export async function mockUpdateSoftwareContractTemplate(
  data: Partial<Pick<SoftwareContractTemplate, 'title' | 'body_html'>>,
): Promise<SoftwareContractTemplate> {
  await delay();
  if (data.title !== undefined) SOFTWARE_TEMPLATE.title = data.title;
  if (data.body_html !== undefined) SOFTWARE_TEMPLATE.body_html = data.body_html;
  SOFTWARE_TEMPLATE.version += 1;
  SOFTWARE_TEMPLATE.updated_at = isoNow();
  return { ...SOFTWARE_TEMPLATE };
}

// ---------------------------------------------------------------------------
// Mock functions – Software Contracts
// ---------------------------------------------------------------------------

export async function mockGetSoftwareContract(
  academyId: string,
): Promise<SoftwareContract | null> {
  await delay();
  const contract = SOFTWARE_CONTRACTS.find((c) => c.academy_id === academyId);
  return contract ? { ...contract } : null;
}

export async function mockGenerateSoftwareContract(
  academyId: string,
  planData: {
    slug: string;
    name: string;
    monthly_value_cents: number;
    billing_cycle?: string;
  },
): Promise<SoftwareContract> {
  await delay();
  const now = isoNow();
  const contract: SoftwareContract = {
    id: nextId('sw-ctr'),
    template_version: SOFTWARE_TEMPLATE.version,
    academy_id: academyId,
    academy_name: 'Mock Academy',
    academy_owner_name: 'Mock Owner',
    academy_owner_email: 'owner@mock.com',
    plan_slug: planData.slug,
    plan_name: planData.name,
    monthly_value_cents: planData.monthly_value_cents,
    billing_cycle: planData.billing_cycle ?? 'monthly',
    status: 'pending_signature',
    trial_started_at: now,
    trial_ended_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    contract_start_date: new Date().toISOString().split('T')[0],
    auto_renew: true,
    created_at: now,
    updated_at: now,
  };
  SOFTWARE_CONTRACTS.push(contract);
  return { ...contract };
}

export async function mockSignSoftwareContract(
  contractId: string,
  sig: SignatureData,
): Promise<SoftwareContract> {
  await delay();
  const contract = SOFTWARE_CONTRACTS.find((c) => c.id === contractId);
  if (!contract) throw new Error(`Software contract ${contractId} not found`);

  const now = isoNow();
  contract.status = 'active';
  contract.signed_at = now;
  contract.digital_hash = `hash-${contractId}-${Date.now().toString(36)}`;
  contract.contract_body_html = SOFTWARE_TEMPLATE.body_html
    .replace('{{academy_name}}', contract.academy_name)
    .replace('{{academy_cnpj}}', contract.academy_cnpj ?? '')
    .replace('{{academy_owner_name}}', contract.academy_owner_name)
    .replace('{{plan_name}}', contract.plan_name)
    .replace('{{monthly_value}}', (contract.monthly_value_cents / 100).toFixed(2).replace('.', ','));
  contract.updated_at = now;

  // Suppress unused parameter warning
  void sig;

  return { ...contract };
}

// ---------------------------------------------------------------------------
// Mock functions – Academy Templates
// ---------------------------------------------------------------------------

export async function mockListAcademyTemplates(
  academyId: string,
): Promise<AcademyContractTemplate[]> {
  await delay();
  return ACADEMY_TEMPLATES.filter((t) => t.academy_id === academyId).map((t) => ({ ...t }));
}

export async function mockGetAcademyTemplate(
  templateId: string,
): Promise<AcademyContractTemplate | null> {
  await delay();
  const tmpl = ACADEMY_TEMPLATES.find((t) => t.id === templateId);
  return tmpl ? { ...tmpl } : null;
}

export async function mockCreateAcademyTemplate(
  academyId: string,
  data: Partial<AcademyContractTemplate>,
): Promise<AcademyContractTemplate> {
  await delay();
  const now = isoNow();
  const tmpl: AcademyContractTemplate = {
    id: nextId('acad-tmpl'),
    academy_id: academyId,
    name: data.name ?? 'Novo Modelo',
    version: data.version ?? 1,
    is_active: data.is_active ?? true,
    is_default: data.is_default ?? false,
    source: data.source ?? 'custom',
    body_html: data.body_html,
    uploaded_file_url: data.uploaded_file_url,
    require_injury_waiver: true,
    require_medical_clearance: true,
    require_image_consent: false,
    require_lgpd_consent: true,
    minor_clauses_enabled: false,
    created_at: now,
    updated_at: now,
  };
  ACADEMY_TEMPLATES.push(tmpl);
  return { ...tmpl };
}

export async function mockUpdateAcademyTemplate(
  templateId: string,
  data: Partial<Pick<AcademyContractTemplate, 'name' | 'body_html' | 'uploaded_file_url'>>,
): Promise<AcademyContractTemplate> {
  await delay();
  const tmpl = ACADEMY_TEMPLATES.find((t) => t.id === templateId);
  if (!tmpl) throw new Error(`Academy template ${templateId} not found`);

  if (data.name !== undefined) tmpl.name = data.name;
  if (data.body_html !== undefined) tmpl.body_html = data.body_html;
  if (data.uploaded_file_url !== undefined) tmpl.uploaded_file_url = data.uploaded_file_url;
  tmpl.updated_at = isoNow();
  return { ...tmpl };
}

export async function mockSetDefaultTemplate(templateId: string): Promise<void> {
  await delay();
  const target = ACADEMY_TEMPLATES.find((t) => t.id === templateId);
  if (!target) throw new Error(`Academy template ${templateId} not found`);

  for (const tmpl of ACADEMY_TEMPLATES) {
    if (tmpl.academy_id === target.academy_id) {
      tmpl.is_default = false;
    }
  }
  target.is_default = true;
  target.updated_at = isoNow();
}

export async function mockSeedSystemTemplate(
  academyId: string,
): Promise<AcademyContractTemplate> {
  await delay();
  const existing = ACADEMY_TEMPLATES.find(
    (t) => t.academy_id === academyId && t.source === 'system',
  );
  if (existing) return { ...existing };

  const now = isoNow();
  const tmpl: AcademyContractTemplate = {
    id: nextId('acad-tmpl'),
    academy_id: academyId,
    name: 'Contrato Padrao',
    version: 1,
    is_active: true,
    is_default: true,
    source: 'system',
    body_html: ACADEMY_TEMPLATES[0]?.body_html,
    require_injury_waiver: true,
    require_medical_clearance: true,
    require_image_consent: false,
    require_lgpd_consent: true,
    minor_clauses_enabled: false,
    created_at: now,
    updated_at: now,
  };
  ACADEMY_TEMPLATES.push(tmpl);
  return { ...tmpl };
}

// ---------------------------------------------------------------------------
// Mock functions – Student Contracts
// ---------------------------------------------------------------------------

export async function mockGenerateStudentContract(
  templateId: string,
  studentData: {
    student_profile_id: string;
    student_name: string;
    student_cpf?: string;
    student_email: string;
    student_birth_date?: string;
    plan_name: string;
    monthly_value_cents: number;
    modalities: string;
    start_date: string;
    payment_day: number;
    duration_months: number;
  },
  guardianData?: {
    guardian_name: string;
    guardian_cpf: string;
  },
): Promise<StudentContract> {
  await delay();
  const tmpl = ACADEMY_TEMPLATES.find((t) => t.id === templateId);
  if (!tmpl) throw new Error(`Academy template ${templateId} not found`);

  const now = isoNow();
  // Compute end_date from start_date + duration_months
  const startDt = new Date(studentData.start_date);
  startDt.setMonth(startDt.getMonth() + studentData.duration_months);
  const endDate = startDt.toISOString().split('T')[0];

  const contract: StudentContract = {
    id: nextId('stu-ctr'),
    template_id: templateId,
    academy_id: tmpl.academy_id,
    source: tmpl.source,
    student_profile_id: studentData.student_profile_id,
    student_name: studentData.student_name,
    student_cpf: studentData.student_cpf,
    student_email: studentData.student_email,
    guardian_name: guardianData?.guardian_name,
    plan_name: studentData.plan_name,
    monthly_value_cents: studentData.monthly_value_cents,
    payment_day: studentData.payment_day,
    duration_months: studentData.duration_months,
    modalities: studentData.modalities,
    start_date: studentData.start_date,
    end_date: endDate,
    status: 'pending_signature',
    contract_body_html: tmpl.body_html ?? '<p>Contrato baseado em documento enviado.</p>',
    injury_waiver_accepted: false,
    medical_clearance_accepted: false,
    image_consent_accepted: false,
    lgpd_consent_accepted: false,
    created_at: now,
    updated_at: now,
  };
  STUDENT_CONTRACTS.push(contract);

  CONTRACT_HISTORY.push({
    id: nextId('hist'),
    contract_type: 'student',
    contract_id: contract.id,
    action: 'created',
    actor_id: 'user-owner-1',
    details: { message: `Contrato gerado a partir do template "${tmpl.name}".` },
    created_at: now,
  });

  return { ...contract };
}

export async function mockGetStudentContract(
  contractId: string,
): Promise<StudentContract | null> {
  await delay();
  const contract = STUDENT_CONTRACTS.find((c) => c.id === contractId);
  return contract ? { ...contract } : null;
}

export async function mockListStudentContracts(
  academyId: string,
  filters?: {
    status?: StudentContract['status'];
    student_name?: string;
    modality?: string;
  },
): Promise<StudentContract[]> {
  await delay();
  let results = STUDENT_CONTRACTS.filter((c) => c.academy_id === academyId);

  if (filters?.status) {
    results = results.filter((c) => c.status === filters.status);
  }
  if (filters?.student_name) {
    const search = filters.student_name.toLowerCase();
    results = results.filter((c) => c.student_name.toLowerCase().includes(search));
  }
  if (filters?.modality) {
    const mod = filters.modality.toLowerCase();
    results = results.filter((c) =>
      c.modalities.toLowerCase().includes(mod),
    );
  }

  return results.map((c) => ({ ...c }));
}

export async function mockGetMyContracts(
  studentProfileId: string,
): Promise<StudentContract[]> {
  await delay();
  return STUDENT_CONTRACTS
    .filter((c) => c.student_profile_id === studentProfileId)
    .map((c) => ({ ...c }));
}

export async function mockSendForSignature(contractId: string): Promise<void> {
  await delay();
  const contract = STUDENT_CONTRACTS.find((c) => c.id === contractId);
  if (!contract) throw new Error(`Student contract ${contractId} not found`);

  contract.status = 'pending_signature';
  contract.updated_at = isoNow();

  CONTRACT_HISTORY.push({
    id: nextId('hist'),
    contract_type: 'student',
    contract_id: contractId,
    action: 'sent',
    actor_id: 'user-owner-1',
    details: { message: `Contrato enviado para assinatura via email para ${contract.student_email}.` },
    created_at: isoNow(),
  });
}

export async function mockSignStudentContract(
  contractId: string,
  sig: SignatureData,
  consents: {
    injury_waiver: boolean;
    medical_clearance: boolean;
    image_consent: boolean;
    lgpd_consent: boolean;
  },
): Promise<StudentContract> {
  await delay();
  const contract = STUDENT_CONTRACTS.find((c) => c.id === contractId);
  if (!contract) throw new Error(`Student contract ${contractId} not found`);

  const now = isoNow();
  contract.status = 'active';
  contract.signed_at = now;
  contract.digital_hash = `hash-${contractId}-${Date.now().toString(36)}`;
  contract.lgpd_consent_accepted = consents.lgpd_consent;
  contract.image_consent_accepted = consents.image_consent;
  contract.injury_waiver_accepted = consents.injury_waiver;
  contract.medical_clearance_accepted = consents.medical_clearance;
  contract.updated_at = now;

  CONTRACT_HISTORY.push({
    id: nextId('hist'),
    contract_type: 'student',
    contract_id: contractId,
    action: 'signed',
    actor_id: contract.student_profile_id,
    details: { message: 'Contrato assinado digitalmente.', ip: sig.ip },
    ip_address: sig.ip,
    created_at: now,
  });

  // Suppress unused fields
  void sig.name;
  void sig.cpf;
  void sig.userAgent;

  return { ...contract };
}

export async function mockCancelStudentContract(
  contractId: string,
  reason: string,
): Promise<StudentContract> {
  await delay();
  const contract = STUDENT_CONTRACTS.find((c) => c.id === contractId);
  if (!contract) throw new Error(`Student contract ${contractId} not found`);

  const now = isoNow();
  contract.status = 'cancelled';
  contract.updated_at = now;

  CONTRACT_HISTORY.push({
    id: nextId('hist'),
    contract_type: 'student',
    contract_id: contractId,
    action: 'cancelled',
    actor_id: contract.student_profile_id,
    details: { message: `Contrato cancelado.`, reason },
    created_at: now,
  });

  return { ...contract };
}

export async function mockRenewStudentContract(
  contractId: string,
): Promise<StudentContract> {
  await delay();
  const original = STUDENT_CONTRACTS.find((c) => c.id === contractId);
  if (!original) throw new Error(`Student contract ${contractId} not found`);

  const now = isoNow();
  const origStart = new Date(original.start_date);
  const origEnd = new Date(original.end_date);
  const durationMs = origEnd.getTime() - origStart.getTime();

  const newStart = original.end_date;
  const newEndDate = new Date(origEnd.getTime() + durationMs);
  const newEnd = newEndDate.toISOString().split('T')[0];

  const renewed: StudentContract = {
    ...original,
    id: nextId('stu-ctr'),
    start_date: newStart,
    end_date: newEnd,
    status: 'pending_signature',
    signed_at: undefined,
    digital_hash: undefined,
    injury_waiver_accepted: false,
    medical_clearance_accepted: false,
    image_consent_accepted: false,
    lgpd_consent_accepted: false,
    created_at: now,
    updated_at: now,
  };
  STUDENT_CONTRACTS.push(renewed);

  CONTRACT_HISTORY.push({
    id: nextId('hist'),
    contract_type: 'student',
    contract_id: renewed.id,
    action: 'created',
    actor_id: 'user-owner-1',
    details: { message: `Contrato renovado a partir do contrato ${contractId}.` },
    created_at: now,
  });

  return { ...renewed };
}

// ---------------------------------------------------------------------------
// Mock functions – Metrics & History
// ---------------------------------------------------------------------------

export async function mockGetContractMetrics(
  _academyId: string,
): Promise<ContractMetrics> {
  await delay();
  const active = STUDENT_CONTRACTS.filter((c) => c.status === 'active');
  const pending = STUDENT_CONTRACTS.filter((c) => c.status === 'pending_signature');
  const expired = STUDENT_CONTRACTS.filter((c) => c.status === 'expired');
  const cancelled = STUDENT_CONTRACTS.filter((c) => c.status === 'cancelled');

  return {
    total: STUDENT_CONTRACTS.length,
    active: active.length,
    pending: pending.length,
    expired: expired.length,
    cancelled: cancelled.length,
  };
}

export async function mockGetContractHistory(
  contractId: string,
): Promise<ContractHistoryEntry[]> {
  await delay();
  return CONTRACT_HISTORY
    .filter((h) => h.contract_id === contractId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((h) => ({ ...h }));
}
