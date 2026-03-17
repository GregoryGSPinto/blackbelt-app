import type { AuditLog, AuditFilters } from '@/lib/api/audit.service';
import type { AuditEntry, AuditEntryFilters } from '@/lib/types/audit';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ── Existing AuditLog mocks (searchAuditLogs, etc) ─────────────────

const MOCK_LOGS: AuditLog[] = [
  { id: 'al-1', academyId: 'academy-1', actorId: 'user-1', actorName: 'Admin Silva', action: 'create', entityType: 'student', entityId: 'st-10', oldData: null, newData: { name: 'Carlos Mendes', email: 'carlos@email.com' }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', createdAt: '2025-07-10T14:30:00Z' },
  { id: 'al-2', academyId: 'academy-1', actorId: 'user-1', actorName: 'Admin Silva', action: 'update', entityType: 'class', entityId: 'cl-3', oldData: { capacity: 20 }, newData: { capacity: 25 }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', createdAt: '2025-07-10T13:00:00Z' },
  { id: 'al-3', academyId: 'academy-1', actorId: 'user-2', actorName: 'Prof. Santos', action: 'create', entityType: 'attendance', entityId: 'att-55', oldData: null, newData: { studentId: 'st-5', classId: 'cl-1' }, ipAddress: '10.0.0.5', userAgent: 'Mozilla/5.0', createdAt: '2025-07-10T10:05:00Z' },
  { id: 'al-4', academyId: 'academy-1', actorId: 'user-1', actorName: 'Admin Silva', action: 'payment', entityType: 'invoice', entityId: 'inv-20', oldData: { status: 'pending' }, newData: { status: 'paid', paidAt: '2025-07-10T09:00:00Z' }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', createdAt: '2025-07-10T09:00:00Z' },
  { id: 'al-5', academyId: 'academy-1', actorId: 'user-1', actorName: 'Admin Silva', action: 'config_change', entityType: 'billing_config', entityId: 'bc-1', oldData: { autoCharge: false }, newData: { autoCharge: true }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', createdAt: '2025-07-09T16:00:00Z' },
  { id: 'al-6', academyId: 'academy-1', actorId: 'user-1', actorName: 'Admin Silva', action: 'invite', entityType: 'user', entityId: 'inv-email', oldData: null, newData: { email: 'novo.prof@email.com', role: 'professor' }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', createdAt: '2025-07-09T14:00:00Z' },
  { id: 'al-7', academyId: 'academy-1', actorId: 'user-3', actorName: 'Joao Aluno', action: 'login', entityType: 'session', entityId: 'sess-99', oldData: null, newData: null, ipAddress: '200.100.50.25', userAgent: 'Mozilla/5.0 (iPhone)', createdAt: '2025-07-09T08:00:00Z' },
  { id: 'al-8', academyId: 'academy-1', actorId: 'user-1', actorName: 'Admin Silva', action: 'role_change', entityType: 'user', entityId: 'user-4', oldData: { role: 'aluno_adulto' }, newData: { role: 'professor' }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', createdAt: '2025-07-08T11:00:00Z' },
  { id: 'al-9', academyId: 'academy-1', actorId: 'user-1', actorName: 'Admin Silva', action: 'report_export', entityType: 'report', entityId: 'monthly-2025-06', oldData: null, newData: { format: 'pdf' }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', createdAt: '2025-07-07T17:00:00Z' },
  { id: 'al-10', academyId: 'academy-1', actorId: 'user-1', actorName: 'Admin Silva', action: 'delete', entityType: 'event', entityId: 'ev-3', oldData: { name: 'Treino Extra', date: '2025-07-05' }, newData: null, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', createdAt: '2025-07-06T10:00:00Z' },
];

export async function mockSearchAuditLogs(_academyId: string, filters: AuditFilters): Promise<{ logs: AuditLog[]; nextCursor: string | null }> {
  await delay();
  let logs = [...MOCK_LOGS];
  if (filters.action) logs = logs.filter((l) => l.action === filters.action);
  if (filters.entityType) logs = logs.filter((l) => l.entityType === filters.entityType);
  if (filters.actorId) logs = logs.filter((l) => l.actorId === filters.actorId);
  const limit = filters.limit ?? 20;
  return { logs: logs.slice(0, limit), nextCursor: null };
}

export async function mockGetEntityHistory(_entityType: string, entityId: string): Promise<AuditLog[]> {
  await delay();
  return MOCK_LOGS.filter((l) => l.entityId === entityId);
}

export async function mockExportAuditLogs(_academyId: string, _filters: AuditFilters): Promise<Blob> {
  await delay();
  const csv = 'id,action,entityType,entityId,actorName,createdAt\n' + MOCK_LOGS.map((l) => `${l.id},${l.action},${l.entityType},${l.entityId},${l.actorName},${l.createdAt}`).join('\n');
  return new Blob([csv], { type: 'text/csv' });
}

// ── P-049: AuditEntry mocks (20 entries) ───────────────────────────

const MOCK_ENTRIES: AuditEntry[] = [
  {
    id: 'ae-001',
    user_id: 'prof-roberto',
    user_name: 'Roberto Guerreiro',
    action: 'login',
    entity_type: 'session',
    entity_id: 'sess-001',
    changes_json: null,
    ip: '177.38.42.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: '2026-03-17T08:00:00Z',
  },
  {
    id: 'ae-002',
    user_id: 'prof-roberto',
    user_name: 'Roberto Guerreiro',
    action: 'create',
    entity_type: 'turma',
    entity_id: 'turma-new-01',
    changes_json: { name: 'Jiu-Jitsu Avancado Noite', capacity: 25 },
    ip: '177.38.42.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: '2026-03-17T08:15:00Z',
  },
  {
    id: 'ae-003',
    user_id: 'prof-andre',
    user_name: 'Andre Santos',
    action: 'update',
    entity_type: 'student',
    entity_id: 'student-lucas',
    changes_json: { belt: { from: 'white', to: 'blue' } },
    ip: '200.100.50.25',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
    created_at: '2026-03-17T09:30:00Z',
  },
  {
    id: 'ae-004',
    user_id: 'prof-roberto',
    user_name: 'Roberto Guerreiro',
    action: 'payment',
    entity_type: 'mensalidade',
    entity_id: 'mens-202603-001',
    changes_json: { amount: 250, method: 'pix', student: 'Maria Santos' },
    ip: '177.38.42.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: '2026-03-17T10:00:00Z',
  },
  {
    id: 'ae-005',
    user_id: 'prof-roberto',
    user_name: 'Roberto Guerreiro',
    action: 'publish',
    entity_type: 'video',
    entity_id: 'video-bjj-guard-01',
    changes_json: { title: 'Guarda Fechada — Fundamentos', is_published: true },
    ip: '177.38.42.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: '2026-03-17T10:30:00Z',
  },
  {
    id: 'ae-006',
    user_id: 'prof-andre',
    user_name: 'Andre Santos',
    action: 'login',
    entity_type: 'session',
    entity_id: 'sess-002',
    changes_json: null,
    ip: '200.100.50.25',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    created_at: '2026-03-16T14:00:00Z',
  },
  {
    id: 'ae-007',
    user_id: 'prof-roberto',
    user_name: 'Roberto Guerreiro',
    action: 'delete',
    entity_type: 'turma',
    entity_id: 'turma-old-99',
    changes_json: { name: 'Turma Experimental (encerrada)' },
    ip: '177.38.42.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: '2026-03-16T11:00:00Z',
  },
  {
    id: 'ae-008',
    user_id: 'prof-roberto',
    user_name: 'Roberto Guerreiro',
    action: 'approve',
    entity_type: 'graduation',
    entity_id: 'grad-005',
    changes_json: { student: 'Pedro Alves', from: 'yellow', to: 'orange' },
    ip: '177.38.42.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: '2026-03-16T09:00:00Z',
  },
  {
    id: 'ae-009',
    user_id: 'prof-camila',
    user_name: 'Camila Rocha',
    action: 'create',
    entity_type: 'student',
    entity_id: 'student-new-helena',
    changes_json: { name: 'Helena Costa', role: 'aluno_kids' },
    ip: '189.50.10.55',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
    created_at: '2026-03-15T16:00:00Z',
  },
  {
    id: 'ae-010',
    user_id: 'prof-roberto',
    user_name: 'Roberto Guerreiro',
    action: 'payment',
    entity_type: 'mensalidade',
    entity_id: 'mens-202603-002',
    changes_json: { amount: 180, method: 'cartao', student: 'Julia Costa' },
    ip: '177.38.42.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: '2026-03-15T14:30:00Z',
  },
  {
    id: 'ae-011',
    user_id: 'prof-andre',
    user_name: 'Andre Santos',
    action: 'update',
    entity_type: 'turma',
    entity_id: 'turma-001',
    changes_json: { schedule: { from: '18:00', to: '19:00' } },
    ip: '200.100.50.25',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    created_at: '2026-03-15T10:00:00Z',
  },
  {
    id: 'ae-012',
    user_id: 'prof-roberto',
    user_name: 'Roberto Guerreiro',
    action: 'publish',
    entity_type: 'video',
    entity_id: 'video-muay-thai-01',
    changes_json: { title: 'Clinch e Joelhada — Tecnica Avancada' },
    ip: '177.38.42.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: '2026-03-14T17:00:00Z',
  },
  {
    id: 'ae-013',
    user_id: 'prof-camila',
    user_name: 'Camila Rocha',
    action: 'login',
    entity_type: 'session',
    entity_id: 'sess-003',
    changes_json: null,
    ip: '189.50.10.55',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
    created_at: '2026-03-14T08:30:00Z',
  },
  {
    id: 'ae-014',
    user_id: 'prof-roberto',
    user_name: 'Roberto Guerreiro',
    action: 'create',
    entity_type: 'comunicado',
    entity_id: 'com-march-01',
    changes_json: { title: 'Ferias coletivas — Abril 2026' },
    ip: '177.38.42.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: '2026-03-13T15:00:00Z',
  },
  {
    id: 'ae-015',
    user_id: 'prof-roberto',
    user_name: 'Roberto Guerreiro',
    action: 'delete',
    entity_type: 'video',
    entity_id: 'video-old-02',
    changes_json: { title: 'Video duplicado — removido' },
    ip: '177.38.42.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: '2026-03-13T11:00:00Z',
  },
  {
    id: 'ae-016',
    user_id: 'prof-andre',
    user_name: 'Andre Santos',
    action: 'approve',
    entity_type: 'graduation',
    entity_id: 'grad-006',
    changes_json: { student: 'Carlos Mendes', from: 'blue', to: 'purple' },
    ip: '200.100.50.25',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    created_at: '2026-03-12T16:00:00Z',
  },
  {
    id: 'ae-017',
    user_id: 'prof-roberto',
    user_name: 'Roberto Guerreiro',
    action: 'payment',
    entity_type: 'mensalidade',
    entity_id: 'mens-202603-003',
    changes_json: { amount: 300, method: 'boleto', student: 'Fernanda Lima' },
    ip: '177.38.42.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: '2026-03-12T10:00:00Z',
  },
  {
    id: 'ae-018',
    user_id: 'prof-camila',
    user_name: 'Camila Rocha',
    action: 'update',
    entity_type: 'student',
    entity_id: 'student-pedro',
    changes_json: { phone: { from: '11999990000', to: '11888880000' } },
    ip: '189.50.10.55',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
    created_at: '2026-03-11T14:00:00Z',
  },
  {
    id: 'ae-019',
    user_id: 'prof-roberto',
    user_name: 'Roberto Guerreiro',
    action: 'create',
    entity_type: 'invite_token',
    entity_id: 'inv-new-01',
    changes_json: { label: 'Link Promocional Verao', role: 'aluno_adulto' },
    ip: '177.38.42.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: '2026-03-10T09:00:00Z',
  },
  {
    id: 'ae-020',
    user_id: 'prof-roberto',
    user_name: 'Roberto Guerreiro',
    action: 'login',
    entity_type: 'session',
    entity_id: 'sess-004',
    changes_json: null,
    ip: '177.38.42.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: '2026-03-10T07:30:00Z',
  },
];

export async function mockListAuditEntries(
  _academyId: string,
  filters: AuditEntryFilters = {},
): Promise<AuditEntry[]> {
  await delay();

  let result = [...MOCK_ENTRIES];

  if (filters.action) {
    result = result.filter((e) => e.action === filters.action);
  }
  if (filters.user_id) {
    result = result.filter((e) => e.user_id === filters.user_id);
  }
  if (filters.entity_type) {
    result = result.filter((e) => e.entity_type === filters.entity_type);
  }
  if (filters.start_date) {
    const start = new Date(filters.start_date);
    result = result.filter((e) => new Date(e.created_at) >= start);
  }
  if (filters.end_date) {
    const end = new Date(filters.end_date);
    result = result.filter((e) => new Date(e.created_at) <= end);
  }

  result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const offset = filters.offset ?? 0;
  const limit = filters.limit ?? 50;
  return result.slice(offset, offset + limit);
}

export async function mockCreateAuditEntry(
  entry: Omit<AuditEntry, 'id' | 'created_at'>,
): Promise<AuditEntry> {
  await delay(100);
  const newEntry: AuditEntry = {
    ...entry,
    id: `ae-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  MOCK_ENTRIES.unshift(newEntry);
  return newEntry;
}
