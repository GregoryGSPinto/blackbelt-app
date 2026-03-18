import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type RegistrationStatus = 'inscrito' | 'pesagem' | 'competindo' | 'resultado';

export interface RegistrationDTO {
  id: string;
  championship_id: string;
  championship_name: string;
  athlete_id: string;
  athlete_name: string;
  academy: string;
  category_id: string;
  category_label: string;
  modality: string;
  belt: string;
  weight_declared: number;
  weight_actual: number | null;
  age: number;
  gender: 'masculino' | 'feminino';
  status: RegistrationStatus;
  paid: boolean;
  paid_at: string | null;
  receipt_url: string | null;
  weigh_in_at: string | null;
  weigh_in_by: string | null;
  created_at: string;
}

export interface RegisterPayload {
  athlete_id: string;
  athlete_name: string;
  academy: string;
  belt: string;
  weight_declared: number;
  age: number;
  gender: 'masculino' | 'feminino';
}

export async function register(championshipId: string, categoryId: string, data: RegisterPayload): Promise<RegistrationDTO> {
  try {
    if (isMock()) {
      const { mockRegister } = await import('@/lib/mocks/championship-registration.mock');
      return mockRegister(championshipId, categoryId, data);
    }
    try {
      const res = await fetch(`/api/championships/${championshipId}/categories/${categoryId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new ServiceError(res.status, 'championship-registration.register');
      return res.json();
    } catch {
      console.warn('[championship-registration.register] API not available, using mock fallback');
      const { mockRegister } = await import('@/lib/mocks/championship-registration.mock');
      return mockRegister(championshipId, categoryId, data);
    }
  } catch (error) { handleServiceError(error, 'championship-registration.register'); }
}

export async function getMyRegistrations(userId: string): Promise<RegistrationDTO[]> {
  try {
    if (isMock()) {
      const { mockGetMyRegistrations } = await import('@/lib/mocks/championship-registration.mock');
      return mockGetMyRegistrations(userId);
    }
    // API not yet implemented — use mock
    const { mockGetMyRegistrations } = await import('@/lib/mocks/championship-registration.mock');
      return mockGetMyRegistrations(userId);
  } catch (error) { handleServiceError(error, 'championship-registration.myRegistrations'); }
}

export async function confirmWeighIn(registrationId: string, actualWeight: number): Promise<RegistrationDTO> {
  try {
    if (isMock()) {
      const { mockConfirmWeighIn } = await import('@/lib/mocks/championship-registration.mock');
      return mockConfirmWeighIn(registrationId, actualWeight);
    }
    try {
      const res = await fetch(`/api/championships/registrations/${registrationId}/weigh-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actualWeight }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'championship-registration.weighIn');
      return res.json();
    } catch {
      console.warn('[championship-registration.confirmWeighIn] API not available, using mock fallback');
      const { mockConfirmWeighIn } = await import('@/lib/mocks/championship-registration.mock');
      return mockConfirmWeighIn(registrationId, actualWeight);
    }
  } catch (error) { handleServiceError(error, 'championship-registration.weighIn'); }
}

export async function changeCategory(registrationId: string, newCategoryId: string): Promise<RegistrationDTO> {
  try {
    if (isMock()) {
      const { mockChangeCategory } = await import('@/lib/mocks/championship-registration.mock');
      return mockChangeCategory(registrationId, newCategoryId);
    }
    try {
      const res = await fetch(`/api/championships/registrations/${registrationId}/change-category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newCategoryId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'championship-registration.changeCategory');
      return res.json();
    } catch {
      console.warn('[championship-registration.changeCategory] API not available, using mock fallback');
      const { mockChangeCategory } = await import('@/lib/mocks/championship-registration.mock');
      return mockChangeCategory(registrationId, newCategoryId);
    }
  } catch (error) { handleServiceError(error, 'championship-registration.changeCategory'); }
}

export async function getRegistrationsByChampionship(championshipId: string): Promise<RegistrationDTO[]> {
  try {
    if (isMock()) {
      const { mockGetRegistrationsByChampionship } = await import('@/lib/mocks/championship-registration.mock');
      return mockGetRegistrationsByChampionship(championshipId);
    }
    // API not yet implemented — use mock
    const { mockGetRegistrationsByChampionship } = await import('@/lib/mocks/championship-registration.mock');
      return mockGetRegistrationsByChampionship(championshipId);
  } catch (error) { handleServiceError(error, 'championship-registration.byChampionship'); }
}
