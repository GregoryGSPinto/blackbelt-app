import { isMock } from '@/lib/env';
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('promotion_candidates')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error || !data) {
      console.error('[getPromotionCandidate] Supabase error:', error?.message);
      return {} as PromotionCandidateDTO;
    }
    return data as unknown as PromotionCandidateDTO;
  } catch (error) {
    console.error('[getPromotionCandidate] Fallback:', error);
    return {} as PromotionCandidateDTO;
  }
}

export async function executePromotion(data: ExecutePromotionPayload): Promise<PromotionResult> {
  const fallback: PromotionResult = { success: false, progression_id: '', new_belt: 'branca' as BeltLevel, xp_awarded: 0, actions: [] };
  try {
    if (isMock()) {
      const { mockExecutePromotion } = await import('@/lib/mocks/promocao.mock');
      return mockExecutePromotion(data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: result, error } = await supabase.rpc('execute_promotion', {
      p_student_id: data.student_id,
      p_academy_id: data.academy_id,
      p_from_belt: data.from_belt,
      p_to_belt: data.to_belt,
      p_teacher_message: data.teacher_message,
      p_promoted_by: data.promoted_by,
    });
    if (error || !result) {
      console.error('[executePromotion] Supabase error:', error?.message);
      return fallback;
    }
    return result as unknown as PromotionResult;
  } catch (error) {
    console.error('[executePromotion] Fallback:', error);
    return fallback;
  }
}
