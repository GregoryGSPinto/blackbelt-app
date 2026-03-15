import type { PhysicalAssessmentDTO, AssessmentComparison, Measurements, FitnessTests } from '@/lib/api/physical-assessment.service';

const delay = () => new Promise((r) => setTimeout(r, 350));

const ASSESSMENTS: PhysicalAssessmentDTO[] = [
  {
    id: 'pa-1',
    student_id: 'student-1',
    assessed_by: 'prof-1',
    date: '2025-03-15',
    measurements: { weight_kg: 82.5, height_cm: 178, body_fat_pct: 22.0, flexibility_score: 5, grip_strength_kg: 38 },
    fitness_tests: { pushups_1min: 25, situps_1min: 28, plank_seconds: 60, beep_test_level: 6.5, squat_max_kg: 80, deadlift_max_kg: 100, vo2max_estimate: 35 },
    notes: 'Primeira avaliação. Aluno sedentário iniciando na academia. Foco inicial em condicionamento básico e flexibilidade.',
  },
  {
    id: 'pa-2',
    student_id: 'student-1',
    assessed_by: 'prof-1',
    date: '2025-06-15',
    measurements: { weight_kg: 80.0, height_cm: 178, body_fat_pct: 19.5, flexibility_score: 6, grip_strength_kg: 42 },
    fitness_tests: { pushups_1min: 32, situps_1min: 35, plank_seconds: 85, beep_test_level: 7.5, squat_max_kg: 90, deadlift_max_kg: 115, vo2max_estimate: 38 },
    notes: 'Boa evolução em 3 meses. Perda de gordura e ganho de força. Flexibilidade melhorou mas ainda precisa de atenção.',
  },
  {
    id: 'pa-3',
    student_id: 'student-1',
    assessed_by: 'prof-1',
    date: '2025-09-15',
    measurements: { weight_kg: 78.5, height_cm: 178, body_fat_pct: 17.0, flexibility_score: 7, grip_strength_kg: 46 },
    fitness_tests: { pushups_1min: 40, situps_1min: 42, plank_seconds: 110, beep_test_level: 8.5, squat_max_kg: 100, deadlift_max_kg: 130, vo2max_estimate: 42 },
    notes: 'Evolução excelente. Condicionamento para sparring muito melhor. Grip forte — reflexo do treino de kimono.',
  },
  {
    id: 'pa-4',
    student_id: 'student-1',
    assessed_by: 'prof-1',
    date: '2025-12-15',
    measurements: { weight_kg: 77.0, height_cm: 178, body_fat_pct: 15.5, flexibility_score: 8, grip_strength_kg: 48 },
    fitness_tests: { pushups_1min: 45, situps_1min: 48, plank_seconds: 130, beep_test_level: 9.0, squat_max_kg: 110, deadlift_max_kg: 140, vo2max_estimate: 45 },
    notes: 'Um ano de treino. Aluno está no nível de preparação para competição. Todos os indicadores melhoraram significativamente.',
  },
];

export async function mockCreateAssessment(assessment: Omit<PhysicalAssessmentDTO, 'id'>): Promise<PhysicalAssessmentDTO> {
  await delay();
  const created: PhysicalAssessmentDTO = { ...assessment, id: `pa-${Date.now()}` };
  ASSESSMENTS.push(created);
  return created;
}

export async function mockGetHistory(_studentId: string): Promise<PhysicalAssessmentDTO[]> {
  await delay();
  return ASSESSMENTS.map((a) => ({ ...a }));
}

export async function mockGetLatest(_studentId: string): Promise<PhysicalAssessmentDTO | null> {
  await delay();
  return ASSESSMENTS.length > 0 ? { ...ASSESSMENTS[ASSESSMENTS.length - 1] } : null;
}

export async function mockCompareAssessments(_studentId: string, id1: string, id2: string): Promise<AssessmentComparison> {
  await delay();
  const a = ASSESSMENTS.find((x) => x.id === id1) ?? ASSESSMENTS[0];
  const b = ASSESSMENTS.find((x) => x.id === id2) ?? ASSESSMENTS[ASSESSMENTS.length - 1];

  const mKeys = Object.keys(a.measurements) as (keyof Measurements)[];
  const fKeys = Object.keys(a.fitness_tests) as (keyof FitnessTests)[];

  const mDeltas = {} as Record<keyof Measurements, number>;
  for (const k of mKeys) mDeltas[k] = Number((b.measurements[k] - a.measurements[k]).toFixed(1));

  const fDeltas = {} as Record<keyof FitnessTests, number>;
  for (const k of fKeys) fDeltas[k] = Number((b.fitness_tests[k] - a.fitness_tests[k]).toFixed(1));

  return { current: b, previous: a, deltas: { measurements: mDeltas, fitness_tests: fDeltas } };
}
