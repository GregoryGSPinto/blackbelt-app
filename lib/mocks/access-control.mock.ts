import type { AccessResult, AccessEvent, AccessRule, StudentCard } from '@/lib/api/access-control.service';

const delay = () => new Promise((r) => setTimeout(r, 350));

const now = new Date();

const studentNames = [
  'Lucas Oliveira', 'Beatriz Santos', 'Gabriel Silva', 'Mariana Costa',
  'Pedro Almeida', 'Ana Souza', 'Rafael Lima', 'Juliana Mendes',
];

const accessEvents: AccessEvent[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(now);
  d.setHours(d.getHours() - i * 3);
  const nameIdx = i % studentNames.length;
  const allowed = i !== 5;
  return {
    id: `access-${i + 1}`,
    student_id: `student-${nameIdx + 1}`,
    student_name: studentNames[nameIdx],
    photo_url: `/avatars/student-${nameIdx + 1}.jpg`,
    unit_id: 'unit-1',
    timestamp: d.toISOString(),
    direction: i % 3 === 0 ? 'exit' : 'entry',
    method: i % 4 === 0 ? 'proximity' : i % 4 === 1 ? 'manual' : 'qr_code',
    allowed,
    reason: allowed ? undefined : 'Mensalidade em atraso',
  };
});

const accessRules: AccessRule[] = [
  {
    id: 'rule-1',
    unit_id: 'unit-1',
    name: 'Horário de funcionamento',
    type: 'allowed_hours',
    enabled: true,
    config: { start: '06:00', end: '22:00', days: [1, 2, 3, 4, 5, 6] },
  },
  {
    id: 'rule-2',
    unit_id: 'unit-1',
    name: 'Limite diário de acessos',
    type: 'max_daily_access',
    enabled: true,
    config: { max: 2 },
  },
  {
    id: 'rule-3',
    unit_id: 'unit-1',
    name: 'Bloquear inadimplentes',
    type: 'block_overdue',
    enabled: true,
    config: { grace_days: 5 },
  },
];

export async function mockValidateAccess(_studentId: string, _unitId: string): Promise<AccessResult> {
  await delay();
  return {
    allowed: true,
    student_name: 'Lucas Oliveira',
    photo_url: '/avatars/student-1.jpg',
    belt: 'Azul',
    academy: 'Academia BlackBelt Centro',
    membership_active: true,
  };
}

export async function mockGetAccessLog(_unitId: string, _date?: string): Promise<AccessEvent[]> {
  await delay();
  return accessEvents;
}

export async function mockConfigureAccessRules(_unitId: string, rules: Partial<AccessRule>[]): Promise<AccessRule[]> {
  await delay();
  return rules.map((r, i) => ({
    id: r.id || `rule-new-${i}`,
    unit_id: r.unit_id || 'unit-1',
    name: r.name || 'Nova regra',
    type: r.type || 'allowed_hours',
    enabled: r.enabled ?? true,
    config: r.config || {},
  }));
}

export async function mockGetAccessRules(_unitId: string): Promise<AccessRule[]> {
  await delay();
  return accessRules;
}

export async function mockGetStudentCard(_studentId: string): Promise<StudentCard> {
  await delay();
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + 1);
  const qrExpires = new Date(now);
  qrExpires.setMinutes(qrExpires.getMinutes() + 5);
  return {
    student_id: 'student-1',
    student_name: 'Lucas Oliveira',
    photo_url: '/avatars/student-1.jpg',
    belt: 'Azul',
    academy: 'Academia BlackBelt Centro',
    unit: 'Unidade Centro',
    membership_active: true,
    membership_expires: expires.toISOString(),
    qr_code_token: `bb-qr-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    qr_code_expires: qrExpires.toISOString(),
  };
}
