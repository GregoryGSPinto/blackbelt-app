import type {
  ConductTemplate,
  ConductAcceptance,
  ConductIncident,
  ConductSanction,
  ConductConfig,
  IncidentCategory,
  IncidentSeverity,
  SanctionType,
} from '@/lib/api/conduct-code.service';

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Mock data — fields match service interfaces exactly (migration 067)
// ---------------------------------------------------------------------------

const TEMPLATES: ConductTemplate[] = [
  {
    id: 'tpl-1',
    academy_id: 'academy-1',
    version: 1,
    title: 'Codigo de Conduta v1',
    content:
      'Artigo 1 - Higiene pessoal\nArtigo 2 - Uniforme adequado\nArtigo 3 - Pontualidade\nArtigo 4 - Respeito aos colegas',
    is_active: false,
    is_system: true,
    published_at: '2025-06-01T10:00:00Z',
    created_by_id: 'system',
    created_at: '2025-06-01T10:00:00Z',
    updated_at: '2025-06-01T10:00:00Z',
  },
  {
    id: 'tpl-2',
    academy_id: 'academy-1',
    version: 2,
    title: 'Codigo de Conduta v2',
    content:
      'Artigo 1 - Higiene pessoal\nArtigo 2 - Uniforme adequado\nArtigo 3 - Pontualidade\nArtigo 4 - Respeito aos colegas\nArtigo 5 - Regras de sparring\nArtigo 6 - Uso do espaco',
    is_active: true,
    is_system: false,
    published_at: '2026-01-15T12:00:00Z',
    created_by_id: 'admin-1',
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-01-15T12:00:00Z',
  },
];

const ACCEPTANCES: ConductAcceptance[] = [
  {
    id: 'acc-1',
    academy_id: 'academy-1',
    profile_id: 'profile-1',
    template_id: 'tpl-2',
    template_version: 2,
    accepted_at: '2026-01-16T08:00:00Z',
    created_at: '2026-01-16T08:00:00Z',
  },
  {
    id: 'acc-2',
    academy_id: 'academy-1',
    profile_id: 'profile-2',
    template_id: 'tpl-2',
    template_version: 2,
    accepted_at: '2026-01-17T09:30:00Z',
    created_at: '2026-01-17T09:30:00Z',
  },
  {
    id: 'acc-3',
    academy_id: 'academy-1',
    profile_id: 'profile-3',
    template_id: 'tpl-2',
    template_version: 2,
    accepted_at: '2026-01-18T14:00:00Z',
    created_at: '2026-01-18T14:00:00Z',
  },
  {
    id: 'acc-4',
    academy_id: 'academy-1',
    profile_id: 'profile-4',
    template_id: 'tpl-2',
    template_version: 2,
    accepted_at: '2026-02-01T10:00:00Z',
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'acc-5',
    academy_id: 'academy-1',
    profile_id: 'profile-5',
    template_id: 'tpl-2',
    template_version: 2,
    accepted_at: '2026-02-05T16:45:00Z',
    created_at: '2026-02-05T16:45:00Z',
  },
];

const INCIDENTS: ConductIncident[] = [
  {
    id: 'inc-1',
    academy_id: 'academy-1',
    profile_id: 'profile-2',
    reported_by_id: 'admin-1',
    incident_date: '2026-02-10',
    category: 'hygiene' as IncidentCategory,
    severity: 'minor' as IncidentSeverity,
    description: 'Aluno compareceu sem kimono lavado. Orientacao verbal aplicada.',
    witnesses: [],
    evidence_urls: [],
    created_at: '2026-02-10T11:00:00Z',
    updated_at: '2026-02-10T15:00:00Z',
  },
  {
    id: 'inc-2',
    academy_id: 'academy-1',
    profile_id: 'profile-3',
    reported_by_id: 'prof-1',
    incident_date: '2026-02-15',
    category: 'sparring_violation' as IncidentCategory,
    severity: 'moderate' as IncidentSeverity,
    description: 'Uso de forca excessiva durante sparring com aluno iniciante. Professor interveio.',
    witnesses: ['profile-6'],
    evidence_urls: [],
    created_at: '2026-02-15T18:00:00Z',
    updated_at: '2026-02-16T09:00:00Z',
  },
  {
    id: 'inc-3',
    academy_id: 'academy-1',
    profile_id: 'profile-4',
    reported_by_id: 'prof-1',
    incident_date: '2026-03-01',
    category: 'disrespect' as IncidentCategory,
    severity: 'serious' as IncidentSeverity,
    description: 'Desrespeito ao professor durante aula. Aluno respondeu de forma grosseira quando corrigido.',
    witnesses: ['profile-1', 'profile-2'],
    evidence_urls: [],
    created_at: '2026-03-01T17:00:00Z',
    updated_at: '2026-03-01T17:00:00Z',
  },
  {
    id: 'inc-4',
    academy_id: 'academy-1',
    profile_id: 'profile-5',
    reported_by_id: 'admin-1',
    incident_date: '2026-03-10',
    category: 'aggression' as IncidentCategory,
    severity: 'critical' as IncidentSeverity,
    description: 'Agressao fisica intencional fora do contexto de treino. Incidente ocorreu no vestiario.',
    witnesses: ['profile-3', 'profile-7'],
    evidence_urls: [],
    created_at: '2026-03-10T20:00:00Z',
    updated_at: '2026-03-10T20:00:00Z',
  },
];

const SANCTIONS: ConductSanction[] = [
  {
    id: 'san-1',
    academy_id: 'academy-1',
    profile_id: 'profile-2',
    incident_id: 'inc-1',
    issued_by_id: 'admin-1',
    sanction_type: 'verbal_warning' as SanctionType,
    description: 'Falta de higiene no kimono. Aluno se comprometeu a manter o kimono limpo.',
    severity_level: 1,
    start_date: '2026-02-10',
    is_active: false,
    student_acknowledged: true,
    acknowledged_at: '2026-02-10T16:00:00Z',
    created_at: '2026-02-10T15:00:00Z',
    updated_at: '2026-02-10T16:00:00Z',
  },
  {
    id: 'san-2',
    academy_id: 'academy-1',
    profile_id: 'profile-3',
    incident_id: 'inc-2',
    issued_by_id: 'prof-1',
    sanction_type: 'verbal_warning' as SanctionType,
    description: 'Uso de forca excessiva em sparring.',
    severity_level: 1,
    start_date: '2026-02-16',
    is_active: false,
    student_acknowledged: true,
    acknowledged_at: '2026-02-16T10:00:00Z',
    created_at: '2026-02-16T09:00:00Z',
    updated_at: '2026-02-16T10:00:00Z',
  },
  {
    id: 'san-3',
    academy_id: 'academy-1',
    profile_id: 'profile-4',
    incident_id: 'inc-3',
    issued_by_id: 'admin-1',
    sanction_type: 'written_warning' as SanctionType,
    description: 'Desrespeito ao professor. Responsavel sera notificado.',
    severity_level: 2,
    start_date: '2026-03-02',
    is_active: true,
    student_acknowledged: false,
    created_at: '2026-03-02T10:00:00Z',
    updated_at: '2026-03-02T10:00:00Z',
  },
  {
    id: 'san-4',
    academy_id: 'academy-1',
    profile_id: 'profile-5',
    incident_id: 'inc-4',
    issued_by_id: 'admin-1',
    sanction_type: 'suspension' as SanctionType,
    description: 'Agressao fisica intencional. Suspensao de 30 dias. Retorno condicionado a reuniao com responsavel.',
    severity_level: 4,
    start_date: '2026-03-11',
    end_date: '2026-04-11',
    is_active: true,
    student_acknowledged: false,
    created_at: '2026-03-11T09:00:00Z',
    updated_at: '2026-03-11T09:00:00Z',
  },
];

const CONFIGS: ConductConfig[] = [
  {
    id: 'cfg-1',
    academy_id: 'academy-1',
    require_acceptance_on_signup: true,
    auto_escalate_sanctions: true,
    notify_on_incident: true,
    notify_on_sanction: true,
    suspension_after_warnings: 3,
    ban_after_suspensions: 2,
    created_at: '2025-06-01T10:00:00Z',
    updated_at: '2026-01-15T12:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export async function mockGetActiveTemplate(academyId: string): Promise<ConductTemplate | null> {
  await delay();
  return TEMPLATES.find((t) => t.academy_id === academyId && t.is_active) ?? null;
}

export async function mockGetTemplateHistory(academyId: string): Promise<ConductTemplate[]> {
  await delay();
  return TEMPLATES.filter((t) => t.academy_id === academyId).sort((a, b) => b.version - a.version);
}

export async function mockCreateTemplate(
  academyId: string,
  content: string,
  title?: string,
): Promise<ConductTemplate | null> {
  await delay();
  const maxVersion = TEMPLATES.filter((t) => t.academy_id === academyId).reduce(
    (max, t) => Math.max(max, t.version),
    0,
  );
  const now = new Date().toISOString();
  const tpl: ConductTemplate = {
    id: `tpl-${Date.now()}`,
    academy_id: academyId,
    version: maxVersion + 1,
    title: title ?? `Codigo de Conduta v${maxVersion + 1}`,
    content,
    is_active: false,
    is_system: false,
    created_by_id: 'admin-1',
    created_at: now,
    updated_at: now,
  };
  TEMPLATES.push(tpl);
  return tpl;
}

export async function mockUpdateTemplate(
  id: string,
  data: Partial<ConductTemplate>,
): Promise<ConductTemplate | null> {
  await delay();
  const idx = TEMPLATES.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  TEMPLATES[idx] = { ...TEMPLATES[idx], ...data, updated_at: new Date().toISOString() };
  return TEMPLATES[idx];
}

export async function mockPublishTemplate(id: string): Promise<ConductTemplate | null> {
  await delay();
  const tpl = TEMPLATES.find((t) => t.id === id);
  if (!tpl) return null;
  TEMPLATES.forEach((t) => {
    if (t.academy_id === tpl.academy_id) t.is_active = false;
  });
  tpl.is_active = true;
  tpl.published_at = new Date().toISOString();
  tpl.updated_at = new Date().toISOString();
  return tpl;
}

export async function mockSeedDefaultTemplate(academyId: string): Promise<ConductTemplate | null> {
  await delay();
  const exists = TEMPLATES.find((t) => t.academy_id === academyId);
  if (exists) return exists;
  const now = new Date().toISOString();
  const tpl: ConductTemplate = {
    id: `tpl-${Date.now()}`,
    academy_id: academyId,
    version: 1,
    title: 'Codigo de Conduta Padrao',
    content:
      'Artigo 1 - Higiene pessoal\nArtigo 2 - Uniforme adequado\nArtigo 3 - Pontualidade\nArtigo 4 - Respeito mutuo\nArtigo 5 - Regras de sparring',
    is_active: true,
    is_system: true,
    published_at: now,
    created_by_id: 'system',
    created_at: now,
    updated_at: now,
  };
  TEMPLATES.push(tpl);
  return tpl;
}

// ---------------------------------------------------------------------------
// Acceptance
// ---------------------------------------------------------------------------

export async function mockAcceptConductCode(
  academyId: string,
  profileId: string,
  templateId: string,
  version: number,
): Promise<ConductAcceptance | null> {
  await delay();
  const now = new Date().toISOString();
  const acc: ConductAcceptance = {
    id: `acc-${Date.now()}`,
    academy_id: academyId,
    profile_id: profileId,
    template_id: templateId,
    template_version: version,
    accepted_at: now,
    created_at: now,
  };
  ACCEPTANCES.push(acc);
  return acc;
}

export async function mockHasAcceptedLatest(
  academyId: string,
  profileId: string,
): Promise<boolean> {
  await delay();
  const active = TEMPLATES.find((t) => t.academy_id === academyId && t.is_active);
  if (!active) return false;
  return ACCEPTANCES.some(
    (a) =>
      a.academy_id === academyId &&
      a.profile_id === profileId &&
      a.template_id === active.id &&
      a.template_version === active.version,
  );
}

export async function mockGetAcceptances(
  academyId: string,
  filters?: { profileId?: string; templateId?: string },
): Promise<ConductAcceptance[]> {
  await delay();
  return ACCEPTANCES.filter((a) => {
    if (a.academy_id !== academyId) return false;
    if (filters?.profileId && a.profile_id !== filters.profileId) return false;
    if (filters?.templateId && a.template_id !== filters.templateId) return false;
    return true;
  });
}

export async function mockGetAcceptanceStats(
  academyId: string,
): Promise<{ total_students: number; accepted: number; pending: number }> {
  await delay();
  const totalStudents = 20;
  const active = TEMPLATES.find((t) => t.academy_id === academyId && t.is_active);
  const accepted = active
    ? ACCEPTANCES.filter(
        (a) => a.academy_id === academyId && a.template_id === active.id,
      ).length
    : 0;
  return { total_students: totalStudents, accepted, pending: totalStudents - accepted };
}

// ---------------------------------------------------------------------------
// Incidents
// ---------------------------------------------------------------------------

export async function mockReportIncident(
  academyId: string,
  profileId: string,
  data: {
    reported_by_id?: string;
    incident_date: string;
    category: IncidentCategory;
    severity: IncidentSeverity;
    description: string;
    witnesses?: string[];
    evidence_urls?: string[];
    class_id?: string;
  },
): Promise<ConductIncident | null> {
  await delay();
  const now = new Date().toISOString();
  const incident: ConductIncident = {
    id: `inc-${Date.now()}`,
    academy_id: academyId,
    profile_id: profileId,
    reported_by_id: data.reported_by_id,
    incident_date: data.incident_date,
    category: data.category,
    severity: data.severity,
    description: data.description,
    witnesses: data.witnesses ?? [],
    evidence_urls: data.evidence_urls ?? [],
    class_id: data.class_id,
    created_at: now,
    updated_at: now,
  };
  INCIDENTS.push(incident);
  return incident;
}

export async function mockListIncidents(
  academyId: string,
  filters?: { profileId?: string; category?: IncidentCategory; severity?: IncidentSeverity },
): Promise<ConductIncident[]> {
  await delay();
  return INCIDENTS.filter((inc) => {
    if (inc.academy_id !== academyId) return false;
    if (filters?.profileId && inc.profile_id !== filters.profileId) return false;
    if (filters?.category && inc.category !== filters.category) return false;
    if (filters?.severity && inc.severity !== filters.severity) return false;
    return true;
  });
}

export async function mockGetIncident(id: string): Promise<ConductIncident | null> {
  await delay();
  return INCIDENTS.find((inc) => inc.id === id) ?? null;
}

export async function mockUpdateIncident(
  id: string,
  data: Partial<ConductIncident>,
): Promise<ConductIncident | null> {
  await delay();
  const idx = INCIDENTS.findIndex((inc) => inc.id === id);
  if (idx < 0) return null;
  INCIDENTS[idx] = { ...INCIDENTS[idx], ...data, updated_at: new Date().toISOString() };
  return INCIDENTS[idx];
}

// ---------------------------------------------------------------------------
// Sanctions
// ---------------------------------------------------------------------------

export async function mockIssueSanction(
  academyId: string,
  profileId: string,
  data: {
    incident_id?: string;
    issued_by_id?: string;
    sanction_type: SanctionType;
    description: string;
    severity_level: number;
    start_date: string;
    end_date?: string;
  },
): Promise<ConductSanction | null> {
  await delay();
  const now = new Date().toISOString();
  const sanction: ConductSanction = {
    id: `san-${Date.now()}`,
    academy_id: academyId,
    profile_id: profileId,
    incident_id: data.incident_id,
    issued_by_id: data.issued_by_id,
    sanction_type: data.sanction_type,
    description: data.description,
    severity_level: data.severity_level,
    start_date: data.start_date,
    end_date: data.end_date,
    is_active: true,
    student_acknowledged: false,
    created_at: now,
    updated_at: now,
  };
  SANCTIONS.push(sanction);
  return sanction;
}

export async function mockListSanctions(
  academyId: string,
  filters?: { profileId?: string; activeOnly?: boolean; type?: SanctionType },
): Promise<ConductSanction[]> {
  await delay();
  return SANCTIONS.filter((s) => {
    if (s.academy_id !== academyId) return false;
    if (filters?.profileId && s.profile_id !== filters.profileId) return false;
    if (filters?.activeOnly && !s.is_active) return false;
    if (filters?.type && s.sanction_type !== filters.type) return false;
    return true;
  });
}

export async function mockGetStudentDisciplinaryRecord(
  academyId: string,
  profileId: string,
): Promise<{ incidents: ConductIncident[]; sanctions: ConductSanction[] }> {
  await delay();
  return {
    incidents: INCIDENTS.filter(
      (inc) => inc.academy_id === academyId && inc.profile_id === profileId,
    ),
    sanctions: SANCTIONS.filter(
      (s) => s.academy_id === academyId && s.profile_id === profileId,
    ),
  };
}

export async function mockAcknowledgeSanction(
  sanctionId: string,
): Promise<ConductSanction | null> {
  await delay();
  const s = SANCTIONS.find((s) => s.id === sanctionId);
  if (!s) return null;
  s.student_acknowledged = true;
  s.acknowledged_at = new Date().toISOString();
  s.updated_at = new Date().toISOString();
  return s;
}

export async function mockAppealSanction(
  sanctionId: string,
  notes: string,
): Promise<ConductSanction | null> {
  await delay();
  const s = SANCTIONS.find((s) => s.id === sanctionId);
  if (!s) return null;
  s.appeal_notes = notes;
  s.appeal_resolved = false;
  s.updated_at = new Date().toISOString();
  return s;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export async function mockGetConductConfig(academyId: string): Promise<ConductConfig | null> {
  await delay();
  return CONFIGS.find((c) => c.academy_id === academyId) ?? null;
}

export async function mockUpdateConductConfig(
  academyId: string,
  data: Partial<ConductConfig>,
): Promise<ConductConfig | null> {
  await delay();
  const idx = CONFIGS.findIndex((c) => c.academy_id === academyId);
  if (idx < 0) return null;
  CONFIGS[idx] = { ...CONFIGS[idx], ...data, updated_at: new Date().toISOString() };
  return CONFIGS[idx];
}

export async function mockSeedDefaultConductConfig(
  academyId: string,
): Promise<ConductConfig | null> {
  await delay();
  const exists = CONFIGS.find((c) => c.academy_id === academyId);
  if (exists) return exists;
  const now = new Date().toISOString();
  const cfg: ConductConfig = {
    id: `cfg-${Date.now()}`,
    academy_id: academyId,
    require_acceptance_on_signup: true,
    auto_escalate_sanctions: true,
    notify_on_incident: true,
    notify_on_sanction: true,
    suspension_after_warnings: 3,
    ban_after_suspensions: 2,
    created_at: now,
    updated_at: now,
  };
  CONFIGS.push(cfg);
  return cfg;
}
