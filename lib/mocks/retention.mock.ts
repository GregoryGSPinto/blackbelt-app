import type {
  RetentionData,
  RetentionSummary,
  RetentionMonthData,
  ChurnReasonData,
  AtRiskStudent,
  RetentionFilters,
} from '@/lib/api/retention.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

// ── Mock data ──────────────────────────────────────────────────────────

const MOCK_SUMMARY: RetentionSummary = {
  currentRetention: 94.2,
  retentionGoal: 95,
  churnRate: 5.8,
  avgTimeBeforeCancel: 4.2,
  totalActive: 187,
  totalChurned: 12,
  classWithMostChurn: 'Jiu-Jitsu Iniciante',
  avgFrequency: 9.4,
};

const MOCK_MONTHLY: RetentionMonthData[] = [
  { month: '2025-04', retention: 92.1, churned: 8, newStudents: 12 },
  { month: '2025-05', retention: 91.5, churned: 9, newStudents: 10 },
  { month: '2025-06', retention: 93.0, churned: 7, newStudents: 14 },
  { month: '2025-07', retention: 92.8, churned: 7, newStudents: 11 },
  { month: '2025-08', retention: 93.5, churned: 6, newStudents: 13 },
  { month: '2025-09', retention: 94.0, churned: 6, newStudents: 15 },
  { month: '2025-10', retention: 93.2, churned: 7, newStudents: 9 },
  { month: '2025-11', retention: 94.5, churned: 5, newStudents: 11 },
  { month: '2025-12', retention: 93.8, churned: 6, newStudents: 8 },
  { month: '2026-01', retention: 94.8, churned: 5, newStudents: 16 },
  { month: '2026-02', retention: 94.0, churned: 6, newStudents: 12 },
  { month: '2026-03', retention: 94.2, churned: 5, newStudents: 10 },
];

const MOCK_REASONS: ChurnReasonData[] = [
  { reason: 'financial', label: 'Financeiro', count: 4, percentage: 33.3 },
  { reason: 'schedule', label: 'Horario incompativel', count: 3, percentage: 25.0 },
  { reason: 'motivation', label: 'Falta de motivacao', count: 2, percentage: 16.7 },
  { reason: 'moved', label: 'Mudou de cidade', count: 1, percentage: 8.3 },
  { reason: 'injury', label: 'Lesao', count: 1, percentage: 8.3 },
  { reason: 'unknown', label: 'Nao informado', count: 1, percentage: 8.3 },
];

const MOCK_AT_RISK: AtRiskStudent[] = [
  {
    id: 'risk-1',
    name: 'Guilherme Ferreira',
    avatar: null,
    belt: 'white',
    className: 'Jiu-Jitsu Iniciante',
    modality: 'Jiu-Jitsu',
    daysWithoutTraining: 14,
    trend: 'declining',
    lastCheckin: '2026-03-03T19:00:00Z',
    contacted: false,
  },
  {
    id: 'risk-2',
    name: 'Marcos Ribeiro',
    avatar: null,
    belt: 'white',
    className: 'Jiu-Jitsu Iniciante',
    modality: 'Jiu-Jitsu',
    daysWithoutTraining: 11,
    trend: 'declining',
    lastCheckin: '2026-03-06T07:30:00Z',
    contacted: false,
  },
  {
    id: 'risk-3',
    name: 'Enzo Oliveira',
    avatar: null,
    belt: 'gray',
    className: 'Kids BJJ',
    modality: 'Jiu-Jitsu',
    daysWithoutTraining: 9,
    trend: 'declining',
    lastCheckin: '2026-03-08T16:00:00Z',
    contacted: true,
  },
  {
    id: 'risk-4',
    name: 'Diego Almeida',
    avatar: null,
    belt: 'green',
    className: 'Judo Adulto',
    modality: 'Judo',
    daysWithoutTraining: 8,
    trend: 'stable',
    lastCheckin: '2026-03-09T19:00:00Z',
    contacted: false,
  },
  {
    id: 'risk-5',
    name: 'Lucas Santos',
    avatar: null,
    belt: 'yellow',
    className: 'Muay Thai',
    modality: 'Muay Thai',
    daysWithoutTraining: 7,
    trend: 'declining',
    lastCheckin: '2026-03-10T18:00:00Z',
    contacted: false,
  },
  {
    id: 'risk-6',
    name: 'Patricia Souza',
    avatar: null,
    belt: 'blue',
    className: 'Jiu-Jitsu Avancado',
    modality: 'Jiu-Jitsu',
    daysWithoutTraining: 6,
    trend: 'stable',
    lastCheckin: '2026-03-11T07:30:00Z',
    contacted: false,
  },
  {
    id: 'risk-7',
    name: 'Roberto Nunes',
    avatar: null,
    belt: 'white',
    className: 'Jiu-Jitsu Iniciante',
    modality: 'Jiu-Jitsu',
    daysWithoutTraining: 5,
    trend: 'improving',
    lastCheckin: '2026-03-12T06:00:00Z',
    contacted: true,
  },
  {
    id: 'risk-8',
    name: 'Thais Mendes',
    avatar: null,
    belt: 'orange',
    className: 'Judo Juvenil',
    modality: 'Judo',
    daysWithoutTraining: 5,
    trend: 'declining',
    lastCheckin: '2026-03-12T14:00:00Z',
    contacted: false,
  },
];

// ── Mock functions ─────────────────────────────────────────────────────

export async function mockGetRetentionData(
  _academyId: string,
  filters?: RetentionFilters,
): Promise<RetentionData> {
  await delay();

  let monthlyData = [...MOCK_MONTHLY];

  // Apply period filter
  if (filters?.period) {
    const months = filters.period === '3m' ? 3 : filters.period === '6m' ? 6 : 12;
    monthlyData = monthlyData.slice(-months);
  }

  let atRiskStudents = MOCK_AT_RISK.map((s) => ({ ...s }));

  // Apply modality filter
  if (filters?.modality) {
    atRiskStudents = atRiskStudents.filter((s) => s.modality === filters.modality);
  }

  // Apply class filter
  if (filters?.className) {
    atRiskStudents = atRiskStudents.filter((s) => s.className === filters.className);
  }

  // Sort by days without training descending (most urgent first)
  atRiskStudents.sort((a, b) => b.daysWithoutTraining - a.daysWithoutTraining);

  return {
    summary: { ...MOCK_SUMMARY },
    monthlyData,
    churnReasons: MOCK_REASONS.map((r) => ({ ...r })),
    atRiskStudents,
  };
}

export async function mockMarkContacted(_studentId: string): Promise<void> {
  await delay();
}
