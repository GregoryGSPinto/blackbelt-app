import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type ChampionshipStatus = 'draft' | 'registration_open' | 'closed' | 'in_progress' | 'finished';

export interface CategoryDTO {
  id: string;
  championship_id: string;
  modality: string;
  belt_range: string;
  weight_range: string;
  age_range: string;
  gender: 'masculino' | 'feminino' | 'misto';
  participants: { athlete_id: string; athlete_name: string; academy: string }[];
  bracket: string | null;
}

export interface ChampionshipDTO {
  id: string;
  organizer_id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  modalities: string[];
  categories: CategoryDTO[];
  registration_fee: number;
  registration_deadline: string;
  max_participants: number;
  current_participants: number;
  rules_pdf_url: string | null;
  status: ChampionshipStatus;
  live_stream_url?: string;
}

export interface ChampionshipFilters {
  modality?: string;
  region?: string;
  date_from?: string;
  date_to?: string;
  status?: ChampionshipStatus;
}

export async function createChampionship(data: Omit<ChampionshipDTO, 'id' | 'current_participants' | 'categories'>): Promise<ChampionshipDTO> {
  try {
    if (isMock()) {
      const { mockCreateChampionship } = await import('@/lib/mocks/championships.mock');
      return mockCreateChampionship(data);
    }
    try {
      const res = await fetch('/api/championships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new ServiceError(res.status, 'championships.create');
      return res.json();
    } catch {
      console.warn('[championships.createChampionship] API not available, using fallback');
      return { id: "", name: "", date: "", location: "", modality: "", categories: [], status: "upcoming", enrollment_deadline: "", enrolled_count: 0, max_participants: 0, academy_id: "", created_at: "" } as unknown as ChampionshipDTO;
    }
  } catch (error) { handleServiceError(error, 'championships.create'); }
}

export async function getChampionships(filters?: ChampionshipFilters): Promise<ChampionshipDTO[]> {
  try {
    if (isMock()) {
      const { mockGetChampionships } = await import('@/lib/mocks/championships.mock');
      return mockGetChampionships(filters);
    }
    try {
      const params = new URLSearchParams();
      if (filters?.modality) params.set('modality', filters.modality);
      if (filters?.region) params.set('region', filters.region);
      if (filters?.date_from) params.set('date_from', filters.date_from);
      if (filters?.date_to) params.set('date_to', filters.date_to);
      if (filters?.status) params.set('status', filters.status);
      const res = await fetch(`/api/championships?${params.toString()}`);
      if (!res.ok) throw new ServiceError(res.status, 'championships.list');
      return res.json();
    } catch {
      console.warn('[championships.getChampionships] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'championships.list'); }
}

export async function getChampionshipById(id: string): Promise<ChampionshipDTO> {
  try {
    if (isMock()) {
      const { mockGetChampionshipById } = await import('@/lib/mocks/championships.mock');
      return mockGetChampionshipById(id);
    }
    try {
      const res = await fetch(`/api/championships/${id}`);
      if (!res.ok) throw new ServiceError(res.status, 'championships.getById');
      return res.json();
    } catch {
      console.warn('[championships.getChampionshipById] API not available, using fallback');
      return { id: "", name: "", date: "", location: "", modality: "", categories: [], status: "upcoming", enrollment_deadline: "", enrolled_count: 0, max_participants: 0, academy_id: "", created_at: "" } as unknown as ChampionshipDTO;
    }
  } catch (error) { handleServiceError(error, 'championships.getById'); }
}

export async function openRegistration(id: string): Promise<ChampionshipDTO> {
  try {
    if (isMock()) {
      const { mockOpenRegistration } = await import('@/lib/mocks/championships.mock');
      return mockOpenRegistration(id);
    }
    try {
      const res = await fetch(`/api/championships/${id}/open-registration`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'championships.openRegistration');
      return res.json();
    } catch {
      console.warn('[championships.openRegistration] API not available, using fallback');
      return { id: "", name: "", date: "", location: "", modality: "", categories: [], status: "upcoming", enrollment_deadline: "", enrolled_count: 0, max_participants: 0, academy_id: "", created_at: "" } as unknown as ChampionshipDTO;
    }
  } catch (error) { handleServiceError(error, 'championships.openRegistration'); }
}

export async function closeRegistration(id: string): Promise<ChampionshipDTO> {
  try {
    if (isMock()) {
      const { mockCloseRegistration } = await import('@/lib/mocks/championships.mock');
      return mockCloseRegistration(id);
    }
    try {
      const res = await fetch(`/api/championships/${id}/close-registration`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'championships.closeRegistration');
      return res.json();
    } catch {
      console.warn('[championships.closeRegistration] API not available, using fallback');
      return { id: "", name: "", date: "", location: "", modality: "", categories: [], status: "upcoming", enrollment_deadline: "", enrolled_count: 0, max_participants: 0, academy_id: "", created_at: "" } as unknown as ChampionshipDTO;
    }
  } catch (error) { handleServiceError(error, 'championships.closeRegistration'); }
}
