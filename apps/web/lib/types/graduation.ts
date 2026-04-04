import type { BeltLevel } from './domain';

export type PromotionStatus = 'pending' | 'approved' | 'rejected';

export interface BeltPromotion {
  id: string;
  student_id: string;
  student_name: string;
  from_belt: BeltLevel;
  to_belt: BeltLevel;
  proposed_by: string;
  proposed_by_name: string;
  approved_by: string | null;
  status: PromotionStatus;
  criteria_met: {
    attendance: { required: number; current: number; met: boolean };
    months: { required: number; current: number; met: boolean };
    quiz_avg: { required: number; current: number; met: boolean };
  };
  proposed_at: string;
  approved_at: string | null;
}

export interface BeltCriteria {
  from_belt: BeltLevel;
  to_belt: BeltLevel;
  min_attendance: number;
  min_months: number;
  min_quiz_avg: number;
}

export interface GraduationHistoryItem {
  id: string;
  student_id: string;
  student_name: string;
  from_belt: BeltLevel;
  to_belt: BeltLevel;
  approved_by_name: string;
  approved_at: string;
}
