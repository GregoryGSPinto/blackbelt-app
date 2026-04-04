import type { MacrocycleDTO, Phase } from '@/lib/api/periodization.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

const MACROCYCLE: MacrocycleDTO = {
  id: 'macro-1',
  student_id: 'student-1',
  competition_name: 'Copa BlackBelt 2026',
  competition_date: '2026-05-10',
  created_at: '2026-01-12',
  created_by: 'prof-1',
  phases: [
    {
      id: 'phase-1',
      name: 'base',
      start_date: '2026-01-12',
      end_date: '2026-02-22',
      weeks: 6,
      intensity: 4,
      volume: 8,
      focus: ['Condicionamento aeróbico', 'Mobilidade articular', 'Fundamentos técnicos', 'Construção de hábito de treino'],
      training_plan_id: undefined,
    },
    {
      id: 'phase-2',
      name: 'build',
      start_date: '2026-02-23',
      end_date: '2026-04-05',
      weeks: 6,
      intensity: 7,
      volume: 7,
      focus: ['Jogo de guarda ofensivo', 'Passagem de guarda sob pressão', 'Takedowns', 'Sparring com maior intensidade'],
      training_plan_id: 'plan-comp-1',
    },
    {
      id: 'phase-3',
      name: 'peak',
      start_date: '2026-04-06',
      end_date: '2026-04-26',
      weeks: 3,
      intensity: 9,
      volume: 5,
      focus: ['Simulação de competição', 'Estratégia de luta', 'Rounds de 6min com regra IBJJF', 'Resistência anaeróbica'],
    },
    {
      id: 'phase-4',
      name: 'taper',
      start_date: '2026-04-27',
      end_date: '2026-05-09',
      weeks: 2,
      intensity: 5,
      volume: 3,
      focus: ['Revisão técnica leve', 'Recuperação muscular', 'Mentalização e visualização', 'Controle de peso'],
    },
    {
      id: 'phase-5',
      name: 'recovery',
      start_date: '2026-05-11',
      end_date: '2026-05-24',
      weeks: 2,
      intensity: 2,
      volume: 2,
      focus: ['Descanso ativo', 'Mobilidade', 'Treino lúdico', 'Avaliação pós-competição'],
    },
  ],
};

const MACROCYCLES: MacrocycleDTO[] = [MACROCYCLE];

export async function mockCreateMacrocycle(macrocycle: Omit<MacrocycleDTO, 'id' | 'created_at'>): Promise<MacrocycleDTO> {
  await delay();
  const created: MacrocycleDTO = { ...macrocycle, id: `macro-${Date.now()}`, created_at: new Date().toISOString().slice(0, 10) };
  MACROCYCLES.push(created);
  return created;
}

export async function mockGetMacrocycle(_studentId: string): Promise<MacrocycleDTO | null> {
  await delay();
  return MACROCYCLES[0] ?? null;
}

export async function mockUpdatePhase(macrocycleId: string, phaseId: string, data: Partial<Phase>): Promise<Phase> {
  await delay();
  const macro = MACROCYCLES.find((m) => m.id === macrocycleId);
  if (!macro) throw new Error('Macrocycle not found');
  const idx = macro.phases.findIndex((p) => p.id === phaseId);
  if (idx >= 0) macro.phases[idx] = { ...macro.phases[idx], ...data };
  return macro.phases[idx];
}
