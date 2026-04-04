import { BeltLevel } from '@/lib/types/domain';
import type {
  BeltPromotion,
  BeltCriteria,
  GraduationHistoryItem,
} from '@/lib/types/graduation';

// ── Belt Criteria ────────────────────────────────────────────────────────

const CRITERIA: BeltCriteria[] = [
  { from_belt: BeltLevel.White, to_belt: BeltLevel.Gray, min_attendance: 60, min_months: 4, min_quiz_avg: 60 },
  { from_belt: BeltLevel.Gray, to_belt: BeltLevel.Yellow, min_attendance: 80, min_months: 4, min_quiz_avg: 65 },
  { from_belt: BeltLevel.Yellow, to_belt: BeltLevel.Orange, min_attendance: 100, min_months: 6, min_quiz_avg: 65 },
  { from_belt: BeltLevel.Orange, to_belt: BeltLevel.Green, min_attendance: 100, min_months: 6, min_quiz_avg: 70 },
  { from_belt: BeltLevel.Green, to_belt: BeltLevel.Blue, min_attendance: 120, min_months: 6, min_quiz_avg: 70 },
  { from_belt: BeltLevel.Blue, to_belt: BeltLevel.Purple, min_attendance: 200, min_months: 12, min_quiz_avg: 75 },
  { from_belt: BeltLevel.Purple, to_belt: BeltLevel.Brown, min_attendance: 300, min_months: 18, min_quiz_avg: 80 },
  { from_belt: BeltLevel.Brown, to_belt: BeltLevel.Black, min_attendance: 400, min_months: 24, min_quiz_avg: 85 },
];

// ── Pending promotions ──────────────────────────────────────────────────

const PENDING_PROMOTIONS: BeltPromotion[] = [
  {
    id: 'promo-001',
    student_id: 'student-001',
    student_name: 'Rafael Costa',
    from_belt: BeltLevel.White,
    to_belt: BeltLevel.Blue,
    proposed_by: 'prof-001',
    proposed_by_name: 'Mestre Ricardo',
    approved_by: null,
    status: 'pending',
    criteria_met: {
      attendance: { required: 120, current: 135, met: true },
      months: { required: 6, current: 8, met: true },
      quiz_avg: { required: 70, current: 82, met: true },
    },
    proposed_at: '2026-03-10T14:30:00Z',
    approved_at: null,
  },
  {
    id: 'promo-002',
    student_id: 'student-002',
    student_name: 'Luciana Ferreira',
    from_belt: BeltLevel.Blue,
    to_belt: BeltLevel.Purple,
    proposed_by: 'prof-002',
    proposed_by_name: 'Professor Andre',
    approved_by: null,
    status: 'pending',
    criteria_met: {
      attendance: { required: 200, current: 180, met: false },
      months: { required: 12, current: 14, met: true },
      quiz_avg: { required: 75, current: 78, met: true },
    },
    proposed_at: '2026-03-12T09:15:00Z',
    approved_at: null,
  },
];

// ── Graduation history ──────────────────────────────────────────────────

const GRADUATION_HISTORY: GraduationHistoryItem[] = [
  {
    id: 'hist-001',
    student_id: 'student-003',
    student_name: 'Carlos Mendes',
    from_belt: BeltLevel.White,
    to_belt: BeltLevel.Blue,
    approved_by_name: 'Mestre Ricardo',
    approved_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 'hist-002',
    student_id: 'student-004',
    student_name: 'Ana Paula Santos',
    from_belt: BeltLevel.Blue,
    to_belt: BeltLevel.Purple,
    approved_by_name: 'Professor Andre',
    approved_at: '2026-01-20T16:30:00Z',
  },
  {
    id: 'hist-003',
    student_id: 'student-005',
    student_name: 'Bruno Oliveira',
    from_belt: BeltLevel.Purple,
    to_belt: BeltLevel.Brown,
    approved_by_name: 'Mestre Ricardo',
    approved_at: '2025-12-05T11:00:00Z',
  },
  {
    id: 'hist-004',
    student_id: 'student-006',
    student_name: 'Juliana Martins',
    from_belt: BeltLevel.White,
    to_belt: BeltLevel.Blue,
    approved_by_name: 'Professor Andre',
    approved_at: '2025-11-18T14:45:00Z',
  },
  {
    id: 'hist-005',
    student_id: 'student-007',
    student_name: 'Diego Almeida',
    from_belt: BeltLevel.Brown,
    to_belt: BeltLevel.Black,
    approved_by_name: 'Mestre Ricardo',
    approved_at: '2025-10-01T09:00:00Z',
  },
];

// ── Mock functions ──────────────────────────────────────────────────────

export function mockProposePromotion(
  studentId: string,
  fromBelt: BeltLevel,
  toBelt: BeltLevel,
): BeltPromotion {
  const criteria = CRITERIA.find((c) => c.from_belt === fromBelt && c.to_belt === toBelt);
  return {
    id: `promo-${Date.now()}`,
    student_id: studentId,
    student_name: 'Novo Aluno',
    from_belt: fromBelt,
    to_belt: toBelt,
    proposed_by: 'prof-001',
    proposed_by_name: 'Mestre Ricardo',
    approved_by: null,
    status: 'pending',
    criteria_met: {
      attendance: { required: criteria?.min_attendance ?? 0, current: 0, met: false },
      months: { required: criteria?.min_months ?? 0, current: 0, met: false },
      quiz_avg: { required: criteria?.min_quiz_avg ?? 0, current: 0, met: false },
    },
    proposed_at: new Date().toISOString(),
    approved_at: null,
  };
}

export function mockApprovePromotion(promotionId: string): BeltPromotion {
  const promo = PENDING_PROMOTIONS.find((p) => p.id === promotionId);
  if (!promo) throw new Error(`Promotion ${promotionId} not found`);
  return {
    ...promo,
    status: 'approved',
    approved_by: 'admin-001',
    approved_at: new Date().toISOString(),
  };
}

export function mockRejectPromotion(promotionId: string): BeltPromotion {
  const promo = PENDING_PROMOTIONS.find((p) => p.id === promotionId);
  if (!promo) throw new Error(`Promotion ${promotionId} not found`);
  return {
    ...promo,
    status: 'rejected',
  };
}

export function mockListPending(_academyId: string): BeltPromotion[] {
  return [...PENDING_PROMOTIONS];
}

export function mockGetStudentHistory(_studentId: string): GraduationHistoryItem[] {
  return GRADUATION_HISTORY.filter((h) => h.student_id === _studentId);
}

export function mockCheckCriteria(
  _studentId: string,
  targetBelt: BeltLevel,
): BeltPromotion['criteria_met'] {
  const criteria = CRITERIA.find((c) => c.to_belt === targetBelt);
  return {
    attendance: { required: criteria?.min_attendance ?? 0, current: 135, met: true },
    months: { required: criteria?.min_months ?? 0, current: 8, met: true },
    quiz_avg: { required: criteria?.min_quiz_avg ?? 0, current: 82, met: true },
  };
}

export function mockGetCriteria(fromBelt: BeltLevel, toBelt: BeltLevel): BeltCriteria {
  const found = CRITERIA.find((c) => c.from_belt === fromBelt && c.to_belt === toBelt);
  if (!found) {
    return { from_belt: fromBelt, to_belt: toBelt, min_attendance: 0, min_months: 0, min_quiz_avg: 0 };
  }
  return found;
}

export function mockListGraduationHistory(_academyId: string): GraduationHistoryItem[] {
  return [...GRADUATION_HISTORY];
}
