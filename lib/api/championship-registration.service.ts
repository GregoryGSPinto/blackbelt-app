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
    const res = await fetch(`/api/championships/${championshipId}/categories/${categoryId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'championship-registration.register');
    return res.json();
  } catch (error) { handleServiceError(error, 'championship-registration.register'); }
}

export async function getMyRegistrations(userId: string): Promise<RegistrationDTO[]> {
  try {
    if (isMock()) {
      const { mockGetMyRegistrations } = await import('@/lib/mocks/championship-registration.mock');
      return mockGetMyRegistrations(userId);
    }
    const res = await fetch(`/api/championships/registrations?userId=${userId}`);
    if (!res.ok) throw new ServiceError(res.status, 'championship-registration.myRegistrations');
    return res.json();
  } catch (error) { handleServiceError(error, 'championship-registration.myRegistrations'); }
}

export async function confirmWeighIn(registrationId: string, actualWeight: number): Promise<RegistrationDTO> {
  try {
    if (isMock()) {
      const { mockConfirmWeighIn } = await import('@/lib/mocks/championship-registration.mock');
      return mockConfirmWeighIn(registrationId, actualWeight);
    }
    const res = await fetch(`/api/championships/registrations/${registrationId}/weigh-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actualWeight }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'championship-registration.weighIn');
    return res.json();
  } catch (error) { handleServiceError(error, 'championship-registration.weighIn'); }
}

export async function changeCategory(registrationId: string, newCategoryId: string): Promise<RegistrationDTO> {
  try {
    if (isMock()) {
      const { mockChangeCategory } = await import('@/lib/mocks/championship-registration.mock');
      return mockChangeCategory(registrationId, newCategoryId);
    }
    const res = await fetch(`/api/championships/registrations/${registrationId}/change-category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newCategoryId }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'championship-registration.changeCategory');
    return res.json();
  } catch (error) { handleServiceError(error, 'championship-registration.changeCategory'); }
}

export async function getRegistrationsByChampionship(championshipId: string): Promise<RegistrationDTO[]> {
  try {
    if (isMock()) {
      const { mockGetRegistrationsByChampionship } = await import('@/lib/mocks/championship-registration.mock');
      return mockGetRegistrationsByChampionship(championshipId);
    }
    const res = await fetch(`/api/championships/${championshipId}/registrations`);
    if (!res.ok) throw new ServiceError(res.status, 'championship-registration.byChampionship');
    return res.json();
  } catch (error) { handleServiceError(error, 'championship-registration.byChampionship'); }
}
