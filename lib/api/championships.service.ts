import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('championships')
      .insert(data)
      .select()
      .single();

    if (error || !row) {
      console.error('[createChampionship] Supabase error:', error?.message);
      return { id: '', ...data, current_participants: 0, categories: [] };
    }

    return { ...(row as unknown as ChampionshipDTO), categories: [] };
  } catch (error) {
    console.error('[createChampionship] Fallback:', error);
    return { id: '', ...data, current_participants: 0, categories: [] };
  }
}

export async function getChampionships(filters?: ChampionshipFilters): Promise<ChampionshipDTO[]> {
  try {
    if (isMock()) {
      const { mockGetChampionships } = await import('@/lib/mocks/championships.mock');
      return mockGetChampionships(filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase.from('championships').select('*');
    if (filters?.modality) query = query.contains('modalities', [filters.modality]);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.date_from) query = query.gte('date', filters.date_from);
    if (filters?.date_to) query = query.lte('date', filters.date_to);

    const { data, error } = await query;

    if (error || !data) {
      console.error('[getChampionships] Supabase error:', error?.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      ...(row as unknown as ChampionshipDTO),
      categories: [],
    }));
  } catch (error) {
    console.error('[getChampionships] Fallback:', error);
    return [];
  }
}

export async function getChampionshipById(id: string): Promise<ChampionshipDTO> {
  try {
    if (isMock()) {
      const { mockGetChampionshipById } = await import('@/lib/mocks/championships.mock');
      return mockGetChampionshipById(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('championships')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('[getChampionshipById] Supabase error:', error?.message);
      return { id, organizer_id: '', name: '', description: '', date: '', location: '', modalities: [], categories: [], registration_fee: 0, registration_deadline: '', max_participants: 0, current_participants: 0, rules_pdf_url: null, status: 'draft' };
    }

    return { ...(data as unknown as ChampionshipDTO), categories: [] };
  } catch (error) {
    console.error('[getChampionshipById] Fallback:', error);
    return { id, organizer_id: '', name: '', description: '', date: '', location: '', modalities: [], categories: [], registration_fee: 0, registration_deadline: '', max_participants: 0, current_participants: 0, rules_pdf_url: null, status: 'draft' };
  }
}

export async function openRegistration(id: string): Promise<ChampionshipDTO> {
  try {
    if (isMock()) {
      const { mockOpenRegistration } = await import('@/lib/mocks/championships.mock');
      return mockOpenRegistration(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('championships')
      .update({ status: 'registration_open' })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('[openRegistration] Supabase error:', error?.message);
      return { id, organizer_id: '', name: '', description: '', date: '', location: '', modalities: [], categories: [], registration_fee: 0, registration_deadline: '', max_participants: 0, current_participants: 0, rules_pdf_url: null, status: 'registration_open' };
    }

    return { ...(data as unknown as ChampionshipDTO), categories: [] };
  } catch (error) {
    console.error('[openRegistration] Fallback:', error);
    return { id, organizer_id: '', name: '', description: '', date: '', location: '', modalities: [], categories: [], registration_fee: 0, registration_deadline: '', max_participants: 0, current_participants: 0, rules_pdf_url: null, status: 'registration_open' };
  }
}

export async function closeRegistration(id: string): Promise<ChampionshipDTO> {
  try {
    if (isMock()) {
      const { mockCloseRegistration } = await import('@/lib/mocks/championships.mock');
      return mockCloseRegistration(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('championships')
      .update({ status: 'closed' })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('[closeRegistration] Supabase error:', error?.message);
      return { id, organizer_id: '', name: '', description: '', date: '', location: '', modalities: [], categories: [], registration_fee: 0, registration_deadline: '', max_participants: 0, current_participants: 0, rules_pdf_url: null, status: 'closed' };
    }

    return { ...(data as unknown as ChampionshipDTO), categories: [] };
  } catch (error) {
    console.error('[closeRegistration] Fallback:', error);
    return { id, organizer_id: '', name: '', description: '', date: '', location: '', modalities: [], categories: [], registration_fee: 0, registration_deadline: '', max_participants: 0, current_participants: 0, rules_pdf_url: null, status: 'closed' };
  }
}
