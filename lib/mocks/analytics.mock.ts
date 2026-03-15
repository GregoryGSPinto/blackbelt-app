import type { CohortData, ChurnRiskDTO, ForecastDTO, ProfessorMetricsDTO, OccupancyDTO } from '@/lib/api/analytics.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

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
