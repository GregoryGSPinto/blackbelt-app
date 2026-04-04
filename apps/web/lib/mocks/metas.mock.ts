import type {
  GoalDTO,
  CreateGoalPayload,
  DiaryEntryDTO,
  SaveDiaryPayload,
  MoodRating,
} from '@/lib/api/metas.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const MOCK_GOALS: GoalDTO[] = [
  {
    id: 'goal-1',
    student_id: 'stu-1',
    academy_id: 'academy-1',
    type: 'belt',
    title: 'Faixa roxa até Dez/2026',
    description: 'Alcançar a faixa roxa até dezembro de 2026',
    target_date: '2026-12-31',
    progress_percent: 68,
    status: 'active',
    created_at: '2026-01-10T00:00:00Z',
    weekly_target: null,
    weekly_current: null,
  },
  {
    id: 'goal-2',
    student_id: 'stu-1',
    academy_id: 'academy-1',
    type: 'frequency',
    title: '4x por semana',
    description: 'Treinar pelo menos 4 vezes por semana',
    target_date: null,
    progress_percent: 75,
    status: 'active',
    created_at: '2026-02-01T00:00:00Z',
    weekly_target: 4,
    weekly_current: 3,
  },
  {
    id: 'goal-3',
    student_id: 'stu-1',
    academy_id: 'academy-1',
    type: 'competition',
    title: 'Competir no estadual',
    description: 'Participar do campeonato estadual de 2026',
    target_date: '2026-08-15',
    progress_percent: 40,
    status: 'active',
    created_at: '2026-01-15T00:00:00Z',
    weekly_target: null,
    weekly_current: null,
  },
  {
    id: 'goal-4',
    student_id: 'stu-1',
    academy_id: 'academy-1',
    type: 'technique',
    title: 'Dominar berimbolo',
    description: 'Conseguir executar berimbolo dos dois lados com consistência',
    target_date: '2026-06-30',
    progress_percent: 25,
    status: 'active',
    created_at: '2026-02-20T00:00:00Z',
    weekly_target: null,
    weekly_current: null,
  },
];

const MOOD_OPTIONS: MoodRating[] = ['great', 'ok', 'hard'];
const TAGS_POOL = ['guarda', 'passagem', 'raspagem', 'finalização', 'defesa', 'takedown', 'controle', 'transição'];

function generateDiaryEntries(studentId: string, month: string): DiaryEntryDTO[] {
  const [year, mon] = month.split('-').map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const entries: DiaryEntryDTO[] = [];

  // Generate entries for roughly half the days in the month
  for (let d = 1; d <= daysInMonth; d++) {
    if (d % 2 === 0 || d % 3 === 0) {
      const dayStr = String(d).padStart(2, '0');
      const monStr = String(mon).padStart(2, '0');
      const moodIdx = (d * 7) % 3;
      const tag1 = TAGS_POOL[(d * 3) % TAGS_POOL.length];
      const tag2 = TAGS_POOL[(d * 5 + 1) % TAGS_POOL.length];
      entries.push({
        id: `diary-${month}-${d}`,
        student_id: studentId,
        academy_id: 'academy-1',
        date: `${year}-${monStr}-${dayStr}`,
        mood: MOOD_OPTIONS[moodIdx],
        tags: [tag1, tag2],
        note: d % 4 === 0 ? 'Trabalhei bastante a guarda hoje. Senti evolução na raspagem.' : '',
        class_name: d % 2 === 0 ? 'BJJ Adulto — Manhã' : 'BJJ Adulto — Noite',
        created_at: `${year}-${monStr}-${dayStr}T20:00:00Z`,
      });
    }
  }
  return entries;
}

export async function mockGetGoals(_studentId: string): Promise<GoalDTO[]> {
  await delay();
  return MOCK_GOALS;
}

export async function mockCreateGoal(data: CreateGoalPayload): Promise<GoalDTO> {
  await delay();
  return {
    id: `goal-${Date.now()}`,
    student_id: data.student_id,
    academy_id: data.academy_id,
    type: data.type,
    title: data.title,
    description: data.description,
    target_date: data.target_date,
    progress_percent: 0,
    status: 'active',
    created_at: new Date().toISOString(),
    weekly_target: data.weekly_target,
    weekly_current: 0,
  };
}

export async function mockGetDiary(studentId: string, month: string): Promise<DiaryEntryDTO[]> {
  await delay();
  return generateDiaryEntries(studentId, month);
}

export async function mockSaveDiaryEntry(data: SaveDiaryPayload): Promise<DiaryEntryDTO> {
  await delay();
  return {
    id: `diary-${Date.now()}`,
    student_id: data.student_id,
    academy_id: data.academy_id,
    date: data.date,
    mood: data.mood,
    tags: data.tags,
    note: data.note,
    class_name: data.class_name,
    created_at: new Date().toISOString(),
  };
}
