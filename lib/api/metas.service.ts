import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    try {
      const res = await fetch(`/api/metas/goals?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'metas.getGoals');
      return res.json();
    } catch {
      console.warn('[metas.getGoals] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'metas.getGoals');
  }
}

export async function createGoal(data: CreateGoalPayload): Promise<GoalDTO> {
  try {
    if (isMock()) {
      const { mockCreateGoal } = await import('@/lib/mocks/metas.mock');
      return mockCreateGoal(data);
    }
    try {
      const res = await fetch('/api/metas/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new ServiceError(res.status, 'metas.createGoal');
      return res.json();
    } catch {
      console.warn('[metas.createGoal] API not available, using fallback');
      return {} as GoalDTO;
    }
  } catch (error) {
    handleServiceError(error, 'metas.createGoal');
  }
}

export async function getDiary(studentId: string, month: string): Promise<DiaryEntryDTO[]> {
  try {
    if (isMock()) {
      const { mockGetDiary } = await import('@/lib/mocks/metas.mock');
      return mockGetDiary(studentId, month);
    }
    try {
      const res = await fetch(`/api/metas/diary?studentId=${studentId}&month=${month}`);
      if (!res.ok) throw new ServiceError(res.status, 'metas.getDiary');
      return res.json();
    } catch {
      console.warn('[metas.getDiary] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'metas.getDiary');
  }
}

export async function saveDiaryEntry(data: SaveDiaryPayload): Promise<DiaryEntryDTO> {
  try {
    if (isMock()) {
      const { mockSaveDiaryEntry } = await import('@/lib/mocks/metas.mock');
      return mockSaveDiaryEntry(data);
    }
    try {
      const res = await fetch('/api/metas/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new ServiceError(res.status, 'metas.saveDiary');
      return res.json();
    } catch {
      console.warn('[metas.saveDiaryEntry] API not available, using fallback');
      return {} as DiaryEntryDTO;
    }
  } catch (error) {
    handleServiceError(error, 'metas.saveDiary');
  }
}
