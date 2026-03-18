import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { BeltLevel } from '@/lib/types';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface PromotionCandidateDTO {
  student_id: string;
  academy_id: string;
  display_name: string;
  avatar: string | null;
  current_belt: BeltLevel;
  next_belt: BeltLevel;
  total_classes: number;
  months_at_current_belt: number;
  attendance_streak: number;
  last_evaluation_score: number;
  achievements_count: number;
  xp_total: number;
}

export interface PromotionAction {
  type: 'notification' | 'feed_post' | 'xp_bonus' | 'achievement';
  label: string;
  detail: string;
  done: boolean;
}

export interface ExecutePromotionPayload {
  student_id: string;
  academy_id: string;
  from_belt: BeltLevel;
  to_belt: BeltLevel;
  teacher_message: string;
  promoted_by: string;
}

export interface PromotionResult {
  success: boolean;
  progression_id: string;
  new_belt: BeltLevel;
  xp_awarded: number;
  actions: PromotionAction[];
}

// ────────────────────────────────────────────────────────────
// Service functions
// ────────────────────────────────────────────────────────────

export async function getPromotionCandidate(studentId: string): Promise<PromotionCandidateDTO> {
  try {
    if (isMock()) {
      const { mockGetPromotionCandidate } = await import('@/lib/mocks/promocao.mock');
      return mockGetPromotionCandidate(studentId);
    }
    try {
      const res = await fetch(`/api/promocao/candidate?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'promocao.getCandidate');
      return res.json();
    } catch {
      console.warn('[promocao.getPromotionCandidate] API not available, using fallback');
      return { student_id: '', academy_id: '', display_name: '', avatar: null, current_belt: 'white', next_belt: 'white', total_classes: 0, months_at_current_belt: 0, attendance_streak: 0, last_evaluation_score: 0, achievements_count: 0, xp_total: 0 } as unknown as PromotionCandidateDTO;
    }
  } catch (error) {
    handleServiceError(error, 'promocao.getCandidate');
  }
}

export async function executePromotion(data: ExecutePromotionPayload): Promise<PromotionResult> {
  try {
    if (isMock()) {
      const { mockExecutePromotion } = await import('@/lib/mocks/promocao.mock');
      return mockExecutePromotion(data);
    }
    try {
      const res = await fetch('/api/promocao/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new ServiceError(res.status, 'promocao.execute');
      return res.json();
    } catch {
      console.warn('[promocao.executePromotion] API not available, using fallback');
      return { success: false, progression_id: '', new_belt: 'white', xp_awarded: 0, actions: [] } as unknown as PromotionResult;
    }
  } catch (error) {
    handleServiceError(error, 'promocao.execute');
  }
}
