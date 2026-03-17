import type { CohortData, ChurnRiskDTO, ForecastDTO, ProfessorMetricsDTO, OccupancyDTO } from '@/lib/api/analytics.service';
import type { AnalyticsOverview, StudentAnalytics, ChurnPrediction } from '@/lib/types/analytics';

const delay = () => new Promise((r) => setTimeout(r, 300));

const MONTHS_12 = [
  { month: '2025-04', label: 'Abr/25' },
  { month: '2025-05', label: 'Mai/25' },
  { month: '2025-06', label: 'Jun/25' },
  { month: '2025-07', label: 'Jul/25' },
  { month: '2025-08', label: 'Ago/25' },
  { month: '2025-09', label: 'Set/25' },
  { month: '2025-10', label: 'Out/25' },
  { month: '2025-11', label: 'Nov/25' },
  { month: '2025-12', label: 'Dez/25' },
  { month: '2026-01', label: 'Jan/26' },
  { month: '2026-02', label: 'Fev/26' },
  { month: '2026-03', label: 'Mar/26' },
];

// ── P-053: Analytics Overview ─────────────────────────────────

export function mockAnalyticsOverview(
  _academyId: string,
  _period?: { start: string; end: string },
): AnalyticsOverview {
  return {
    studentsTimeline: MONTHS_12.map((m, i) => ({ ...m, value: 120 + i * 5 + Math.floor(Math.random() * 8) })),
    revenueTimeline: MONTHS_12.map((m, i) => ({ ...m, value: 35000 + i * 1200 + Math.floor(Math.random() * 2000) })),
    retentionTimeline: MONTHS_12.map((m) => ({ ...m, value: 88 + Math.floor(Math.random() * 8) })),
    attendanceByClass: [
      { className: 'BJJ Fundamentos', avgAttendance: 22, capacity: 30 },
      { className: 'BJJ Avançado', avgAttendance: 15, capacity: 20 },
      { className: 'Muay Thai', avgAttendance: 18, capacity: 25 },
      { className: 'Judô Kids', avgAttendance: 12, capacity: 15 },
      { className: 'No-Gi', avgAttendance: 14, capacity: 20 },
      { className: 'Competition Team', avgAttendance: 8, capacity: 12 },
    ],
    popularHours: [
      { hour: '06:00', count: 8 }, { hour: '07:00', count: 12 }, { hour: '08:00', count: 6 },
      { hour: '10:00', count: 4 }, { hour: '12:00', count: 10 }, { hour: '17:00', count: 15 },
      { hour: '18:00', count: 28 }, { hour: '19:00', count: 32 }, { hour: '20:00', count: 25 },
      { hour: '21:00', count: 14 },
    ],
    topModalities: [
      { name: 'Jiu-Jitsu', students: 98 }, { name: 'Muay Thai', students: 42 },
      { name: 'Judô', students: 28 }, { name: 'No-Gi', students: 22 }, { name: 'MMA', students: 18 },
    ],
    comparison: {
      currentMonth: { students: 172, revenue: 47890, retention: 94.2, attendance: 78 },
      previousMonth: { students: 165, revenue: 45200, retention: 92.8, attendance: 75 },
      sameMonthLastYear: { students: 128, revenue: 32100, retention: 89.1, attendance: 70 },
    },
  };
}

// ── P-055: Student Analytics ──────────────────────────────────

export function mockStudentAnalytics(studentId: string): StudentAnalytics {
  const last6 = MONTHS_12.slice(-6);
  return {
    studentId,
    attendanceHistory: last6.map((m, i) => ({ ...m, value: 14 + i + Math.floor(Math.random() * 4) })),
    quizScores: [
      { quizName: 'Guarda Fechada', score: 85, date: '2026-01-15' },
      { quizName: 'Raspagens', score: 72, date: '2026-02-01' },
      { quizName: 'Passagem de Guarda', score: 90, date: '2026-02-20' },
      { quizName: 'Finalizações', score: 88, date: '2026-03-05' },
    ],
    videoHoursPerWeek: last6.map((m) => ({ ...m, value: 2 + Math.random() * 3 })),
    comparisonWithAvg: {
      attendance: { student: 18, classAvg: 15 },
      quizAvg: { student: 84, classAvg: 72 },
      videoHours: { student: 4.2, classAvg: 2.8 },
    },
  };
}

// ── P-056: Churn Predictions ──────────────────────────────────

function classifyChurnRisk(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 30) return 'low';
  if (score < 60) return 'medium';
  if (score < 80) return 'high';
  return 'critical';
}

export function mockChurnPredictions(_academyId: string): ChurnPrediction[] {
  const students = [
    { id: 's-1', name: 'Bruno Lima', freq: 20, trend: 60, delinq: 80, engage: 40, lastAtt: '2026-03-10', days: 7, payment: 'late' as const },
    { id: 's-2', name: 'Marcos Oliveira', freq: 70, trend: 50, delinq: 90, engage: 30, lastAtt: '2026-03-05', days: 12, payment: 'overdue' as const },
    { id: 's-3', name: 'Julia Almeida', freq: 55, trend: 70, delinq: 10, engage: 60, lastAtt: '2026-03-12', days: 5, payment: 'ok' as const },
    { id: 's-4', name: 'Pedro Henrique', freq: 30, trend: 40, delinq: 20, engage: 50, lastAtt: '2026-03-14', days: 3, payment: 'ok' as const },
    { id: 's-5', name: 'Carla Souza', freq: 85, trend: 80, delinq: 70, engage: 75, lastAtt: '2026-02-28', days: 17, payment: 'overdue' as const },
    { id: 's-6', name: 'Felipe Ramos', freq: 45, trend: 35, delinq: 15, engage: 25, lastAtt: '2026-03-15', days: 2, payment: 'ok' as const },
    { id: 's-7', name: 'Luciana Martins', freq: 10, trend: 20, delinq: 5, engage: 15, lastAtt: '2026-03-16', days: 1, payment: 'ok' as const },
    { id: 's-8', name: 'André Costa', freq: 90, trend: 85, delinq: 95, engage: 80, lastAtt: '2026-02-20', days: 25, payment: 'overdue' as const },
  ];
  return students
    .map((s) => {
      const score = Math.round(s.freq * 0.4 + s.trend * 0.25 + s.delinq * 0.2 + s.engage * 0.15);
      return {
        studentId: s.id, studentName: s.name, score,
        risk: classifyChurnRisk(score),
        factors: { frequencyScore: s.freq, trendScore: s.trend, delinquencyScore: s.delinq, engagementScore: s.engage },
        lastAttendance: s.lastAtt, daysSinceLastVisit: s.days, paymentStatus: s.payment,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export async function mockGetRetentionCohort(_academyId: string, months: number): Promise<CohortData[]> {
  await delay();
  const result: CohortData[] = [];
  for (let i = 0; i < Math.min(months, 12); i++) {
    const d = new Date(); d.setMonth(d.getMonth() - (months - 1 - i));
    const total = 8 + Math.floor(Math.random() * 10);
    const retention: number[] = [];
    let rate = 100;
    for (let m = 0; m <= i; m++) {
      retention.push(Math.round(rate));
      rate *= 0.88 + Math.random() * 0.1;
    }
    result.push({ cohort_month: d.toISOString().slice(0, 7), total_students: total, retention });
  }
  return result;
}

const NAMES = ['Lucas Silva', 'Pedro Santos', 'Ana Oliveira', 'Mariana Costa', 'Bruno Ferreira', 'Gabriel Souza', 'Juliana Lima', 'Rafael Pereira', 'Camila Rodrigues', 'Diego Almeida', 'Fernanda Martins', 'Thiago Ribeiro'];
const BELTS = ['white', 'gray', 'yellow', 'green', 'blue'];

export async function mockGetChurnRisk(_academyId: string): Promise<ChurnRiskDTO[]> {
  await delay();
  return NAMES.slice(0, 8).map((name, i) => ({
    student_id: `student-${i + 1}`,
    student_name: name,
    belt: BELTS[i % BELTS.length],
    days_absent: 7 + Math.floor(Math.random() * 20),
    frequency_trend: (['declining', 'declining', 'stable'] as const)[i % 3],
    risk_level: (['high', 'medium', 'low'] as const)[i % 3],
    last_class_date: new Date(Date.now() - (7 + i * 2) * 86400000).toISOString(),
  }));
}

export async function mockGetRevenueForecasting(_academyId: string, months: number): Promise<ForecastDTO> {
  await delay();
  const projected: number[] = [];
  const labels: string[] = [];
  let mrr = 18500;
  for (let i = 0; i < months; i++) {
    const d = new Date(); d.setMonth(d.getMonth() + i);
    labels.push(d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
    projected.push(Math.round(mrr));
    mrr *= 1.03 + Math.random() * 0.02;
  }
  return { current_mrr: 18500, projected_mrr: projected, churn_rate: 4.2, growth_rate: 8.5, months: labels };
}

const PROFS = ['Prof. Ricardo Almeida', 'Prof. Marcelo Santos', 'Prof. Amanda Costa', 'Prof. Carlos Ferreira'];

export async function mockGetProfessorPerformance(_academyId: string): Promise<ProfessorMetricsDTO[]> {
  await delay();
  return PROFS.map((name, i) => ({
    professor_id: `prof-${i + 1}`,
    professor_name: name,
    avg_attendance: 82 + Math.floor(Math.random() * 15),
    retention_rate: 78 + Math.floor(Math.random() * 18),
    avg_evaluation: 75 + Math.floor(Math.random() * 20),
    total_classes: 6 + i * 2,
    total_students: 20 + i * 8,
  }));
}

const CLASSES = [
  { name: 'BJJ Iniciantes', modality: 'BJJ', day: 1, time: '07:00' },
  { name: 'BJJ Avançado', modality: 'BJJ', day: 1, time: '09:00' },
  { name: 'Judô Kids', modality: 'Judô', day: 2, time: '14:00' },
  { name: 'Karatê', modality: 'Karatê', day: 2, time: '16:00' },
  { name: 'MMA', modality: 'MMA', day: 3, time: '19:00' },
  { name: 'BJJ Feminino', modality: 'BJJ', day: 3, time: '10:00' },
  { name: 'Judô Adulto', modality: 'Judô', day: 4, time: '18:00' },
  { name: 'Karatê Kids', modality: 'Karatê', day: 5, time: '15:00' },
];

export async function mockGetClassOccupancy(_academyId: string): Promise<OccupancyDTO[]> {
  await delay();
  return CLASSES.map((c, i) => {
    const capacity = 25 + Math.floor(Math.random() * 15);
    const enrolled = Math.floor(capacity * (0.5 + Math.random() * 0.5));
    const avgPresent = Math.floor(enrolled * (0.6 + Math.random() * 0.35));
    return {
      class_id: `class-${i + 1}`,
      class_name: c.name,
      modality: c.modality,
      capacity,
      enrolled,
      avg_present: avgPresent,
      occupancy_rate: Math.round((avgPresent / capacity) * 100),
      day_of_week: c.day,
      time: c.time,
    };
  });
}
