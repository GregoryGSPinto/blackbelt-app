import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface AgendaSlot {
  id: string;
  type: 'class' | 'private' | 'event' | 'unavailable';
  title: string;
  day: number;
  startTime: string;
  endTime: string;
  studentName?: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
}

export interface LessonRequest {
  id: string;
  studentId: string;
  studentName: string;
  requestedDate: string;
  requestedTime: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

export async function getAgenda(professorId: string, _week: string): Promise<AgendaSlot[]> {
  try {
    if (isMock()) {
      const { mockGetAgenda } = await import('@/lib/mocks/professor-agenda.mock');
      return mockGetAgenda(professorId);
    }
    try {
      const res = await fetch(`/api/professors/${professorId}/agenda`);
      if (!res.ok) throw new ServiceError(res.status, 'professorAgenda.get');
      return res.json();
    } catch {
      console.warn('[professor-agenda.getAgenda] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'professorAgenda.get'); }
}

export async function getLessonRequests(professorId: string): Promise<LessonRequest[]> {
  try {
    if (isMock()) {
      const { mockGetLessonRequests } = await import('@/lib/mocks/professor-agenda.mock');
      return mockGetLessonRequests(professorId);
    }
    try {
      const res = await fetch(`/api/professors/${professorId}/lesson-requests`);
      if (!res.ok) throw new ServiceError(res.status, 'professorAgenda.requests');
      return res.json();
    } catch {
      console.warn('[professor-agenda.getLessonRequests] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'professorAgenda.requests'); }
}

export async function approveLesson(requestId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockApproveLesson } = await import('@/lib/mocks/professor-agenda.mock');
      return mockApproveLesson(requestId);
    }
    try {
      const res = await fetch(`/api/lesson-requests/${requestId}/approve`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'professorAgenda.approve');
    } catch {
      console.warn('[professor-agenda.approveLesson] API not available, using fallback');
    }
  } catch (error) { handleServiceError(error, 'professorAgenda.approve'); }
}

export async function rejectLesson(requestId: string, reason: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockRejectLesson } = await import('@/lib/mocks/professor-agenda.mock');
      return mockRejectLesson(requestId, reason);
    }
    try {
      const res = await fetch(`/api/lesson-requests/${requestId}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
      if (!res.ok) throw new ServiceError(res.status, 'professorAgenda.reject');
    } catch {
      console.warn('[professor-agenda.rejectLesson] API not available, using fallback');
    }
  } catch (error) { handleServiceError(error, 'professorAgenda.reject'); }
}
