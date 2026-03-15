import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface SubstitutionDTO {
  id: string;
  classId: string;
  className: string;
  date: string;
  timeSlot: string;
  originalTeacherId: string;
  originalTeacherName: string;
  substituteTeacherId: string;
  substituteTeacherName: string;
  reason: string;
  notifiedStudents: number;
  createdAt: string;
}

export interface AvailableTeacherDTO {
  id: string;
  name: string;
  specialties: string[];
  available: boolean;
}

export interface CreateSubstitutionData {
  classId: string;
  date: string;
  timeSlot: string;
  originalTeacherId: string;
  substituteTeacherId: string;
  reason: string;
}

export async function getSubstitutions(academyId: string): Promise<SubstitutionDTO[]> {
  try {
    if (isMock()) {
      const { mockGetSubstitutions } = await import('@/lib/mocks/substituicao.mock');
      return mockGetSubstitutions(academyId);
    }
    const res = await fetch(`/api/substitutions?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'substituicao.list');
    return res.json();
  } catch (error) { handleServiceError(error, 'substituicao.list'); }
}

export async function createSubstitution(data: CreateSubstitutionData): Promise<SubstitutionDTO> {
  try {
    if (isMock()) {
      const { mockCreateSubstitution } = await import('@/lib/mocks/substituicao.mock');
      return mockCreateSubstitution(data);
    }
    const res = await fetch('/api/substitutions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'substituicao.create');
    return res.json();
  } catch (error) { handleServiceError(error, 'substituicao.create'); }
}

export async function getAvailableTeachers(date: string, timeSlot: string): Promise<AvailableTeacherDTO[]> {
  try {
    if (isMock()) {
      const { mockGetAvailableTeachers } = await import('@/lib/mocks/substituicao.mock');
      return mockGetAvailableTeachers(date, timeSlot);
    }
    const res = await fetch(`/api/substitutions/available-teachers?date=${date}&timeSlot=${timeSlot}`);
    if (!res.ok) throw new ServiceError(res.status, 'substituicao.availableTeachers');
    return res.json();
  } catch (error) { handleServiceError(error, 'substituicao.availableTeachers'); }
}
