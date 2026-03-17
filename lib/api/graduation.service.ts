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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'graduation.listGraduationHistory');
  }
}
