import { isMock } from '@/lib/env';

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

const EMPTY_REG: RegistrationDTO = {
  id: '', championship_id: '', championship_name: '', athlete_id: '', athlete_name: '', academy: '', category_id: '', category_label: '', modality: '', belt: '', weight_declared: 0, weight_actual: null, age: 0, gender: 'masculino', status: 'inscrito', paid: false, paid_at: null, receipt_url: null, weigh_in_at: null, weigh_in_by: null, created_at: '',
};

export async function register(championshipId: string, categoryId: string, data: RegisterPayload): Promise<RegistrationDTO> {
  try {
    if (isMock()) {
      const { mockRegister } = await import('@/lib/mocks/championship-registration.mock');
      return mockRegister(championshipId, categoryId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('championship_registrations')
      .insert({ championship_id: championshipId, category_id: categoryId, ...data, status: 'inscrito' })
      .select()
      .single();

    if (error || !row) {
      console.error('[register] Supabase error:', error?.message);
      return { ...EMPTY_REG, championship_id: championshipId, category_id: categoryId };
    }

    return row as unknown as RegistrationDTO;
  } catch (error) {
    console.error('[register] Fallback:', error);
    return { ...EMPTY_REG, championship_id: championshipId, category_id: categoryId };
  }
}

export async function getMyRegistrations(userId: string): Promise<RegistrationDTO[]> {
  try {
    if (isMock()) {
      const { mockGetMyRegistrations } = await import('@/lib/mocks/championship-registration.mock');
      return mockGetMyRegistrations(userId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('championship_registrations')
      .select('*')
      .eq('athlete_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('[getMyRegistrations] Supabase error:', error?.message);
      return [];
    }

    return data as unknown as RegistrationDTO[];
  } catch (error) {
    console.error('[getMyRegistrations] Fallback:', error);
    return [];
  }
}

export async function confirmWeighIn(registrationId: string, actualWeight: number): Promise<RegistrationDTO> {
  try {
    if (isMock()) {
      const { mockConfirmWeighIn } = await import('@/lib/mocks/championship-registration.mock');
      return mockConfirmWeighIn(registrationId, actualWeight);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('championship_registrations')
      .update({ weight_actual: actualWeight, status: 'pesagem', weigh_in_at: new Date().toISOString() })
      .eq('id', registrationId)
      .select()
      .single();

    if (error || !data) {
      console.error('[confirmWeighIn] Supabase error:', error?.message);
      return { ...EMPTY_REG, id: registrationId };
    }

    return data as unknown as RegistrationDTO;
  } catch (error) {
    console.error('[confirmWeighIn] Fallback:', error);
    return { ...EMPTY_REG, id: registrationId };
  }
}

export async function changeCategory(registrationId: string, newCategoryId: string): Promise<RegistrationDTO> {
  try {
    if (isMock()) {
      const { mockChangeCategory } = await import('@/lib/mocks/championship-registration.mock');
      return mockChangeCategory(registrationId, newCategoryId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('championship_registrations')
      .update({ category_id: newCategoryId })
      .eq('id', registrationId)
      .select()
      .single();

    if (error || !data) {
      console.error('[changeCategory] Supabase error:', error?.message);
      return { ...EMPTY_REG, id: registrationId };
    }

    return data as unknown as RegistrationDTO;
  } catch (error) {
    console.error('[changeCategory] Fallback:', error);
    return { ...EMPTY_REG, id: registrationId };
  }
}

export async function getRegistrationsByChampionship(championshipId: string): Promise<RegistrationDTO[]> {
  try {
    if (isMock()) {
      const { mockGetRegistrationsByChampionship } = await import('@/lib/mocks/championship-registration.mock');
      return mockGetRegistrationsByChampionship(championshipId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('championship_registrations')
      .select('*')
      .eq('championship_id', championshipId);

    if (error || !data) {
      console.error('[getRegistrationsByChampionship] Supabase error:', error?.message);
      return [];
    }

    return data as unknown as RegistrationDTO[];
  } catch (error) {
    console.error('[getRegistrationsByChampionship] Fallback:', error);
    return [];
  }
}
