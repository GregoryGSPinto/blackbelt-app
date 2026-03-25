import { isMock } from '@/lib/env';

export interface RecordDTO {
  id: string;
  category: string;
  title: string;
  holderName: string;
  holderAvatar: string | null;
  value: string;
  description: string;
  achievedAt: string;
  modality: string;
}

export interface HallOfFameDTO {
  records: RecordDTO[];
  updatedAt: string;
}

export async function getHallOfFame(academyId: string): Promise<HallOfFameDTO> {
  try {
    if (isMock()) {
      const { mockGetHallOfFame } = await import('@/lib/mocks/hall-fama.mock');
      return mockGetHallOfFame(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('hall_of_fame')
      .select('*')
      .eq('academy_id', academyId)
      .order('achieved_at', { ascending: false });
    if (error) {
      console.error('[getHallOfFame] Supabase error:', error.message);
      return { records: [], updatedAt: new Date().toISOString() };
    }
    return { records: (data ?? []) as unknown as RecordDTO[], updatedAt: new Date().toISOString() };
  } catch (error) {
    console.error('[getHallOfFame] Fallback:', error);
    return { records: [], updatedAt: new Date().toISOString() };
  }
}
