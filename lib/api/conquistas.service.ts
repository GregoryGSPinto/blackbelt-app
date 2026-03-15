import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { Achievement, AchievementType } from '@/lib/types';

export interface ConquistaDTO {
  id: string;
  name: string;
  description: string;
  type: AchievementType;
  icon: string;
  granted_at: string | null;
  is_earned: boolean;
}

export async function listByAluno(studentId: string): Promise<ConquistaDTO[]> {
  try {
    if (isMock()) {
      const { mockListByAluno } = await import('@/lib/mocks/conquistas.mock');
      return mockListByAluno(studentId);
    }
    const res = await fetch(`/api/conquistas?studentId=${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'conquistas.list');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'conquistas.list');
  }
}

export async function listAvailable(studentId: string): Promise<ConquistaDTO[]> {
  try {
    if (isMock()) {
      const { mockListAvailable } = await import('@/lib/mocks/conquistas.mock');
      return mockListAvailable(studentId);
    }
    const res = await fetch(`/api/conquistas/available?studentId=${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'conquistas.available');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'conquistas.available');
  }
}

export async function grant(studentId: string, type: AchievementType, granterId: string): Promise<Achievement> {
  try {
    if (isMock()) {
      const { mockGrant } = await import('@/lib/mocks/conquistas.mock');
      return mockGrant(studentId, type, granterId);
    }
    const res = await fetch('/api/conquistas/grant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, type, granterId }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'conquistas.grant');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'conquistas.grant');
  }
}
