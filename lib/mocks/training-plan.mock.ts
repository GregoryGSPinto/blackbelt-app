import type { TrainingPlanDTO, ExerciseLog } from '@/lib/api/training-plan.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

function buildWeeks(): TrainingPlanDTO['weeks'] {
  const themes = [
    'Fundamentos e condicionamento',
    'Guarda e raspagens',
    'Passagem de guarda',
    'Controle e finalizações',
    'Takedowns e clinch',
    'Situacional de competição',
    'Simulação de luta',
    'Polimento e revisão',
  ];

  return themes.map((theme, i) => ({
    week_number: i + 1,
    theme,
    sessions: [
      {
        id: `s-${i + 1}-1`,
        day_of_week: 1,
        label: 'Segunda — Técnica',
        exercises: [
          { id: `e-${i + 1}-1-1`, name: 'Aquecimento: polichinelo + corrida', duration_min: 10, notes: 'Intensidade moderada' },
          { id: `e-${i + 1}-1-2`, name: 'Drill de retenção de guarda', sets: 5, reps: '2min cada lado' },
          { id: `e-${i + 1}-1-3`, name: 'Técnica do dia: variação progressiva', sets: 3, reps: '5 repetições cada lado' },
          { id: `e-${i + 1}-1-4`, name: 'Sparring posicional', duration_min: 15, notes: 'Começar da posição trabalhada' },
          { id: `e-${i + 1}-1-5`, name: 'Alongamento e mobilidade', duration_min: 10 },
        ],
      },
      {
        id: `s-${i + 1}-2`,
        day_of_week: 3,
        label: 'Quarta — Físico + Técnica',
        exercises: [
          { id: `e-${i + 1}-2-1`, name: 'Circuito funcional BJJ', sets: 4, reps: '45s trabalho / 15s descanso', notes: 'Burpee, animal flow, sprawl' },
          { id: `e-${i + 1}-2-2`, name: 'Puxada na barra (grip training)', sets: 4, reps: '8-12' },
          { id: `e-${i + 1}-2-3`, name: 'Agachamento búlgaro', sets: 3, reps: '10 cada perna' },
          { id: `e-${i + 1}-2-4`, name: 'Drill de passagem de guarda', sets: 5, reps: '2min cada lado' },
          { id: `e-${i + 1}-2-5`, name: 'Sparring livre', duration_min: 20, notes: '4 rounds de 5min' },
        ],
      },
      {
        id: `s-${i + 1}-3`,
        day_of_week: 5,
        label: 'Sexta — Competição',
        exercises: [
          { id: `e-${i + 1}-3-1`, name: 'Aquecimento específico: solo drills', duration_min: 15 },
          { id: `e-${i + 1}-3-2`, name: 'Entrada de queda (repetição)', sets: 5, reps: '10 entradas' },
          { id: `e-${i + 1}-3-3`, name: 'Simulação de luta (regras IBJJF)', duration_min: 6, sets: 4, notes: 'Descanso 2min entre rounds' },
          { id: `e-${i + 1}-3-4`, name: 'Revisão de pontos fracos com professor', duration_min: 10 },
          { id: `e-${i + 1}-3-5`, name: 'Crioterapia / recuperação', duration_min: 10, notes: 'Banho de gelo ou rolo de liberação' },
        ],
      },
    ],
  }));
}

const COMPETITION_PLAN: TrainingPlanDTO = {
  id: 'plan-comp-1',
  student_id: 'student-1',
  created_by: 'prof-1',
  name: 'Preparação Copa BlackBelt 2026',
  goal: 'Preparação completa para competição de BJJ — melhorar condicionamento, afiando jogo de guarda e takedowns',
  duration_weeks: 8,
  weeks: buildWeeks(),
  status: 'active',
  created_at: '2026-01-20',
  adherence_pct: 72,
};

const ARCHIVED_PLAN: TrainingPlanDTO = {
  id: 'plan-old-1',
  student_id: 'student-1',
  created_by: 'prof-1',
  name: 'Ciclo Fundamentos Q4 2025',
  goal: 'Reforçar base técnica para promoção de faixa',
  duration_weeks: 6,
  weeks: [],
  status: 'completed',
  created_at: '2025-10-01',
  adherence_pct: 85,
};

const PLANS: TrainingPlanDTO[] = [COMPETITION_PLAN, ARCHIVED_PLAN];

export async function mockCreatePlan(plan: Omit<TrainingPlanDTO, 'id' | 'created_at' | 'adherence_pct'>): Promise<TrainingPlanDTO> {
  await delay();
  const created: TrainingPlanDTO = { ...plan, id: `plan-${Date.now()}`, created_at: new Date().toISOString().slice(0, 10), adherence_pct: 0 };
  PLANS.push(created);
  return created;
}

export async function mockGetActivePlan(_studentId: string): Promise<TrainingPlanDTO | null> {
  await delay();
  return PLANS.find((p) => p.status === 'active') ?? null;
}

export async function mockGetPlans(_studentId: string): Promise<TrainingPlanDTO[]> {
  await delay();
  return PLANS.map((p) => ({ ...p }));
}

export async function mockUpdatePlan(id: string, data: Partial<TrainingPlanDTO>): Promise<TrainingPlanDTO> {
  await delay();
  const idx = PLANS.findIndex((p) => p.id === id);
  if (idx >= 0) PLANS[idx] = { ...PLANS[idx], ...data };
  return PLANS[idx];
}

export async function mockLogExercise(_planId: string, _log: ExerciseLog): Promise<void> {
  await delay();
}
