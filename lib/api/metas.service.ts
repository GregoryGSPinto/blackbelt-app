import { isMock } from '@/lib/env';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export type GoalType = 'belt' | 'frequency' | 'competition' | 'technique' | 'custom';
export type GoalStatus = 'active' | 'completed' | 'abandoned';
export type MoodRating = 'great' | 'ok' | 'hard';

export interface GoalDTO {
  id: string;
  student_id: string;
  academy_id: string;
  type: GoalType;
  title: string;
  description: string;
  target_date: string | null;
  progress_percent: number;
  status: GoalStatus;
  created_at: string;
  /** Weekly frequency goal specifics */
  weekly_target: number | null;
  weekly_current: number | null;
}

export interface CreateGoalPayload {
  student_id: string;
  academy_id: string;
  type: GoalType;
  title: string;
  description: string;
  target_date: string | null;
  weekly_target: number | null;
}

export interface DiaryEntryDTO {
  id: string;
  student_id: string;
  academy_id: string;
  date: string;
  mood: MoodRating;
  tags: string[];
  note: string;
  class_name: string | null;
  created_at: string;
}

export interface SaveDiaryPayload {
  student_id: string;
  academy_id: string;
  date: string;
  mood: MoodRating;
  tags: string[];
  note: string;
  class_name: string | null;
}

// ────────────────────────────────────────────────────────────
// Service functions
// ────────────────────────────────────────────────────────────

export async function getGoals(studentId: string): Promise<GoalDTO[]> {
  try {
    if (isMock()) {
      const { mockGetGoals } = await import('@/lib/mocks/metas.mock');
      return mockGetGoals(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error || !data) {
      console.error('[getGoals] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as GoalDTO[];
  } catch (error) {
    console.error('[getGoals] Fallback:', error);
    return [];
  }
}

export async function createGoal(data: CreateGoalPayload): Promise<GoalDTO> {
  try {
    if (isMock()) {
      const { mockCreateGoal } = await import('@/lib/mocks/metas.mock');
      return mockCreateGoal(data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('goals')
      .insert({ ...data, status: 'active', progress_percent: 0 })
      .select()
      .single();
    if (error || !row) {
      console.error('[createGoal] Supabase error:', error?.message);
      return {} as GoalDTO;
    }
    return row as unknown as GoalDTO;
  } catch (error) {
    console.error('[createGoal] Fallback:', error);
    return {} as GoalDTO;
  }
}

export async function getDiary(studentId: string, month: string): Promise<DiaryEntryDTO[]> {
  try {
    if (isMock()) {
      const { mockGetDiary } = await import('@/lib/mocks/metas.mock');
      return mockGetDiary(studentId, month);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('student_id', studentId)
      .like('date', `${month}%`)
      .order('date', { ascending: false });
    if (error || !data) {
      console.error('[getDiary] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as DiaryEntryDTO[];
  } catch (error) {
    console.error('[getDiary] Fallback:', error);
    return [];
  }
}

export async function saveDiaryEntry(data: SaveDiaryPayload): Promise<DiaryEntryDTO> {
  try {
    if (isMock()) {
      const { mockSaveDiaryEntry } = await import('@/lib/mocks/metas.mock');
      return mockSaveDiaryEntry(data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('diary_entries')
      .insert(data)
      .select()
      .single();
    if (error || !row) {
      console.error('[saveDiaryEntry] Supabase error:', error?.message);
      return {} as DiaryEntryDTO;
    }
    return row as unknown as DiaryEntryDTO;
  } catch (error) {
    console.error('[saveDiaryEntry] Fallback:', error);
    return {} as DiaryEntryDTO;
  }
}
