import { isMock } from '@/lib/env';
import { BeltLevel } from '@/lib/types/domain';
import { logServiceError } from '@/lib/api/errors';
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('belt_promotions').insert({ student_id: studentId, from_belt: fromBelt, to_belt: toBelt, status: 'pending' }).select().single();
    if (error) {
      logServiceError(error, 'graduation');
      return { id: '', student_id: studentId, student_name: '', from_belt: fromBelt, to_belt: toBelt, proposed_by: '', proposed_by_name: '', approved_by: null, status: 'pending', criteria_met: { attendance: { required: 0, current: 0, met: false }, months: { required: 0, current: 0, met: false }, quiz_avg: { required: 0, current: 0, met: false } }, proposed_at: new Date().toISOString(), approved_at: null } as BeltPromotion;
    }
    return data as unknown as BeltPromotion;
  } catch (error) {
    logServiceError(error, 'graduation');
    return { id: '', student_id: studentId, student_name: '', from_belt: fromBelt, to_belt: toBelt, proposed_by: '', proposed_by_name: '', approved_by: null, status: 'pending', criteria_met: { attendance: { required: 0, current: 0, met: false }, months: { required: 0, current: 0, met: false }, quiz_avg: { required: 0, current: 0, met: false } }, proposed_at: new Date().toISOString(), approved_at: null } as BeltPromotion;
  }
}

export async function approvePromotion(promotionId: string): Promise<BeltPromotion> {
  try {
    if (isMock()) {
      const { mockApprovePromotion } = await import('@/lib/mocks/graduation.mock');
      return mockApprovePromotion(promotionId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('belt_promotions').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', promotionId).select().single();
    if (error) {
      logServiceError(error, 'graduation');
      return { id: promotionId, student_id: '', student_name: '', from_belt: BeltLevel.White, to_belt: BeltLevel.White, proposed_by: '', proposed_by_name: '', approved_by: null, status: 'approved', criteria_met: { attendance: { required: 0, current: 0, met: false }, months: { required: 0, current: 0, met: false }, quiz_avg: { required: 0, current: 0, met: false } }, proposed_at: '', approved_at: new Date().toISOString() } as BeltPromotion;
    }
    return data as unknown as BeltPromotion;
  } catch (error) {
    logServiceError(error, 'graduation');
    return { id: promotionId, student_id: '', student_name: '', from_belt: BeltLevel.White, to_belt: BeltLevel.White, proposed_by: '', proposed_by_name: '', approved_by: null, status: 'approved', criteria_met: { attendance: { required: 0, current: 0, met: false }, months: { required: 0, current: 0, met: false }, quiz_avg: { required: 0, current: 0, met: false } }, proposed_at: '', approved_at: new Date().toISOString() } as BeltPromotion;
  }
}

export async function rejectPromotion(promotionId: string): Promise<BeltPromotion> {
  try {
    if (isMock()) {
      const { mockRejectPromotion } = await import('@/lib/mocks/graduation.mock');
      return mockRejectPromotion(promotionId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('belt_promotions').update({ status: 'rejected' }).eq('id', promotionId).select().single();
    if (error) {
      logServiceError(error, 'graduation');
      return { id: promotionId, student_id: '', student_name: '', from_belt: BeltLevel.White, to_belt: BeltLevel.White, proposed_by: '', proposed_by_name: '', approved_by: null, status: 'rejected', criteria_met: { attendance: { required: 0, current: 0, met: false }, months: { required: 0, current: 0, met: false }, quiz_avg: { required: 0, current: 0, met: false } }, proposed_at: '', approved_at: null } as BeltPromotion;
    }
    return data as unknown as BeltPromotion;
  } catch (error) {
    logServiceError(error, 'graduation');
    return { id: promotionId, student_id: '', student_name: '', from_belt: BeltLevel.White, to_belt: BeltLevel.White, proposed_by: '', proposed_by_name: '', approved_by: null, status: 'rejected', criteria_met: { attendance: { required: 0, current: 0, met: false }, months: { required: 0, current: 0, met: false }, quiz_avg: { required: 0, current: 0, met: false } }, proposed_at: '', approved_at: null } as BeltPromotion;
  }
}

export async function listPending(academyId: string): Promise<BeltPromotion[]> {
  try {
    if (isMock()) {
      const { mockListPending } = await import('@/lib/mocks/graduation.mock');
      return mockListPending(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('belt_promotions').select('id, student_id, student_name, from_belt, to_belt, proposed_by, proposed_by_name, approved_by, status, criteria_met, proposed_at, approved_at, academy_id').eq('academy_id', academyId).eq('status', 'pending');
    if (error) {
      logServiceError(error, 'graduation');
      return [];
    }
    return (data ?? []) as unknown as BeltPromotion[];
  } catch (error) {
    logServiceError(error, 'graduation');
    return [];
  }
}

export async function getStudentHistory(studentId: string): Promise<GraduationHistoryItem[]> {
  try {
    if (isMock()) {
      const { mockGetStudentHistory } = await import('@/lib/mocks/graduation.mock');
      return mockGetStudentHistory(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('belt_promotions').select('id, student_id, student_name, from_belt, to_belt, approved_by_name, approved_at, proposed_at, status').eq('student_id', studentId).order('proposed_at', { ascending: false });
    if (error) {
      logServiceError(error, 'graduation');
      return [];
    }
    return (data ?? []) as unknown as GraduationHistoryItem[];
  } catch (error) {
    logServiceError(error, 'graduation');
    return [];
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Fetch criteria for this belt level
    const { data: criteria } = await supabase
      .from('belt_criteria')
      .select('min_attendance, min_months, min_quiz_avg, to_belt')
      .eq('to_belt', targetBelt)
      .maybeSingle();

    const minAttendance = (criteria?.min_attendance as number) ?? 30;
    const minMonths = (criteria?.min_months as number) ?? 6;
    const minQuiz = (criteria?.min_quiz_avg as number) ?? 70;

    // Fetch student's attendance count
    const { count: attendanceCount } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId);

    // Fetch student's enrollment date to calculate months
    const { data: student } = await supabase
      .from('students')
      .select('started_at')
      .eq('id', studentId)
      .maybeSingle();

    const startedAt = student?.started_at ? new Date(student.started_at as string) : new Date();
    const monthsTraining = Math.round((Date.now() - startedAt.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const currentAttendance = attendanceCount ?? 0;

    return {
      attendance: { required: minAttendance, current: currentAttendance, met: currentAttendance >= minAttendance },
      months: { required: minMonths, current: monthsTraining, met: monthsTraining >= minMonths },
      quiz_avg: { required: minQuiz, current: 0, met: false },
    };
  } catch (error) {
    logServiceError(error, 'graduation');
    return { attendance: { required: 0, current: 0, met: false }, months: { required: 0, current: 0, met: false }, quiz_avg: { required: 0, current: 0, met: false } };
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('belt_criteria').select('from_belt, to_belt, min_attendance, min_months, min_quiz_avg').eq('from_belt', fromBelt).eq('to_belt', toBelt).single();
    if (error) {
      logServiceError(error, 'graduation');
      return { from_belt: fromBelt, to_belt: toBelt, min_attendance: 0, min_months: 0, min_quiz_avg: 0 } as BeltCriteria;
    }
    return data as unknown as BeltCriteria;
  } catch (error) {
    logServiceError(error, 'graduation');
    return { from_belt: fromBelt, to_belt: toBelt, min_attendance: 0, min_months: 0, min_quiz_avg: 0 } as BeltCriteria;
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('belt_promotions').select('id, student_id, student_name, from_belt, to_belt, approved_by_name, approved_at, proposed_at, status').eq('academy_id', academyId).order('proposed_at', { ascending: false });
    if (error) {
      logServiceError(error, 'graduation');
      return [];
    }
    return (data ?? []) as unknown as GraduationHistoryItem[];
  } catch (error) {
    logServiceError(error, 'graduation');
    return [];
  }
}
