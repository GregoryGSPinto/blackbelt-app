import type { AuditLog, AuditFilters } from '@/lib/api/audit.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

const MOCK_LOGS: AuditLog[] = [
  { id: 'al-1', academyId: 'academy-1', actorId: 'user-1', actorName: 'Admin Silva', action: 'create', entityType: 'student', entityId: 'st-10', oldData: null, newData: { name: 'Carlos Mendes', email: 'carlos@email.com' }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', createdAt: '2025-07-10T14:30:00Z' },
  { id: 'al-2', academyId: 'academy-1', actorId: 'user-1', actorName: 'Admin Silva', action: 'update', entityType: 'class', entityId: 'cl-3', oldData: { capacity: 20 }, newData: { capacity: 25 }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', createdAt: '2025-07-10T13:00:00Z' },
  { id: 'al-3', academyId: 'academy-1', actorId: 'user-2', actorName: 'Prof. Santos', action: 'create', entityType: 'attendance', entityId: 'att-55', oldData: null, newData: { studentId: 'st-5', classId: 'cl-1' }, ipAddress: '10.0.0.5', userAgent: 'Mozilla/5.0', createdAt: '2025-07-10T10:05:00Z' },
  { id: 'al-4', academyId: 'academy-1', actorId: 'user-1', actorName: 'Admin Silva', action: 'payment', entityType: 'invoice', entityId: 'inv-20', oldData: { status: 'pending' }, newData: { status: 'paid', paidAt: '2025-07-10T09:00:00Z' }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', createdAt: '2025-07-10T09:00:00Z' },
  { id: 'al-5', academyId: 'academy-1', actorId: 'user-1', actorName: 'Admin Silva', action: 'config_change', entityType: 'billing_config', entityId: 'bc-1', oldData: { autoCharge: false }, newData: { autoCharge: true }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', createdAt: '2025-07-09T16:00:00Z' },
  { id: 'al-6', academyId: 'academy-1', actorId: 'user-1', actorName: 'Admin Silva', action: 'invite', entityType: 'user', entityId: 'inv-email', oldData: null, newData: { email: 'novo.prof@email.com', role: 'professor' }, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', createdAt: '2025-07-09T14:00:00Z' },
  { id: 'al-7', academyId: 'academy-1', actorId: 'user-3', actorName: 'João Aluno', action: 'login', entityType: 'session', entityId: 'sess-99', oldData: null, newData: null, ipAddress: '200.100.50.25', userAgent: 'Mozilla/5.0 (iPhone)', createdAt: '2025-07-09T08:00:00Z' },
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
