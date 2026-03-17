import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import { BeltLevel } from '@/lib/types/domain';
import type {
  BeltPromotion,
  BeltCriteria,
  GraduationHistoryItem,
} from '@/lib/types/graduation';

export async function proposePromotion(
  studentId: string,
  fromBelt: BeltLevel,
  toBelt: BeltLevel,
): Promise<BeltPromotion> {
  try {
    if (isMock()) {
      const { mockProposePromotion } = await import('@/lib/mocks/graduation.mock');
      return mockProposePromotion(studentId, fromBelt, toBelt);
    }
    console.warn('[graduation.proposePromotion] fallback — not yet connected to Supabase');
    return { id: '', student_id: studentId, student_name: '', from_belt: fromBelt, to_belt: toBelt, proposed_by: '', proposed_by_name: '', approved_by: null, status: 'pending', criteria_met: { attendance: { required: 0, current: 0, met: false }, months: { required: 0, current: 0, met: false }, quiz_avg: { required: 0, current: 0, met: false } }, proposed_at: new Date().toISOString(), approved_at: null } as BeltPromotion;
  } catch (error) {
    handleServiceError(error, 'graduation.proposePromotion');
  }
}

export async function approvePromotion(promotionId: string): Promise<BeltPromotion> {
  try {
    if (isMock()) {
      const { mockApprovePromotion } = await import('@/lib/mocks/graduation.mock');
      return mockApprovePromotion(promotionId);
    }
    console.warn('[graduation.approvePromotion] fallback — not yet connected to Supabase');
    return { id: promotionId, student_id: '', student_name: '', from_belt: BeltLevel.White, to_belt: BeltLevel.White, proposed_by: '', proposed_by_name: '', approved_by: null, status: 'approved', criteria_met: { attendance: { required: 0, current: 0, met: false }, months: { required: 0, current: 0, met: false }, quiz_avg: { required: 0, current: 0, met: false } }, proposed_at: '', approved_at: new Date().toISOString() } as BeltPromotion;
  } catch (error) {
    handleServiceError(error, 'graduation.approvePromotion');
  }
}

export async function rejectPromotion(promotionId: string): Promise<BeltPromotion> {
  try {
    if (isMock()) {
      const { mockRejectPromotion } = await import('@/lib/mocks/graduation.mock');
      return mockRejectPromotion(promotionId);
    }
    console.warn('[graduation.rejectPromotion] fallback — not yet connected to Supabase');
    return { id: promotionId, student_id: '', student_name: '', from_belt: BeltLevel.White, to_belt: BeltLevel.White, proposed_by: '', proposed_by_name: '', approved_by: null, status: 'rejected', criteria_met: { attendance: { required: 0, current: 0, met: false }, months: { required: 0, current: 0, met: false }, quiz_avg: { required: 0, current: 0, met: false } }, proposed_at: '', approved_at: null } as BeltPromotion;
  } catch (error) {
    handleServiceError(error, 'graduation.rejectPromotion');
  }
}

export async function listPending(academyId: string): Promise<BeltPromotion[]> {
  try {
    if (isMock()) {
      const { mockListPending } = await import('@/lib/mocks/graduation.mock');
      return mockListPending(academyId);
    }
    console.warn('[graduation.listPending] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'graduation.listPending');
  }
}

export async function getStudentHistory(studentId: string): Promise<GraduationHistoryItem[]> {
  try {
    if (isMock()) {
      const { mockGetStudentHistory } = await import('@/lib/mocks/graduation.mock');
      return mockGetStudentHistory(studentId);
    }
    console.warn('[graduation.getStudentHistory] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'graduation.getStudentHistory');
  }
}

export async function checkCriteria(
  studentId: string,
  targetBelt: BeltLevel,
): Promise<BeltPromotion['criteria_met']> {
  try {
    if (isMock()) {
      const { mockCheckCriteria } = await import('@/lib/mocks/graduation.mock');
      return mockCheckCriteria(studentId, targetBelt);
    }
    console.warn('[graduation.checkCriteria] fallback — not yet connected to Supabase');
    return { attendance: { required: 0, current: 0, met: false }, months: { required: 0, current: 0, met: false }, quiz_avg: { required: 0, current: 0, met: false } };
  } catch (error) {
    handleServiceError(error, 'graduation.checkCriteria');
  }
}

export async function getCriteria(
  fromBelt: BeltLevel,
  toBelt: BeltLevel,
): Promise<BeltCriteria> {
  try {
    if (isMock()) {
      const { mockGetCriteria } = await import('@/lib/mocks/graduation.mock');
      return mockGetCriteria(fromBelt, toBelt);
    }
    console.warn('[graduation.getCriteria] fallback — not yet connected to Supabase');
    return { from_belt: fromBelt, to_belt: toBelt, min_attendance: 0, min_months: 0, min_quiz_avg: 0 } as BeltCriteria;
  } catch (error) {
    handleServiceError(error, 'graduation.getCriteria');
  }
}

export async function listGraduationHistory(
  academyId: string,
): Promise<GraduationHistoryItem[]> {
  try {
    if (isMock()) {
      const { mockListGraduationHistory } = await import('@/lib/mocks/graduation.mock');
      return mockListGraduationHistory(academyId);
    }
    console.warn('[graduation.listGraduationHistory] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'graduation.listGraduationHistory');
  }
}
