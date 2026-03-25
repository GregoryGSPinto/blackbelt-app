import { isMock } from '@/lib/env';

export type ChallengeType = 'presenca' | 'streak' | 'social' | 'conteudo' | 'avaliacao';

export interface ChallengeDTO {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  startDate: string;
  endDate: string;
  target: number;
  progress: number;
  reward: string;
  badge?: string;
  active: boolean;
  participantCount: number;
}

export async function listChallenges(academyId: string): Promise<ChallengeDTO[]> {
  try {
    if (isMock()) {
      const { mockListChallenges } = await import('@/lib/mocks/challenges.mock');
      return mockListChallenges(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('academy_id', academyId)
      .order('start_date', { ascending: false });

    if (error || !data) {
      console.error('[listChallenges] Supabase error:', error?.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      type: (row.type ?? 'presenca') as ChallengeType,
      startDate: String(row.start_date ?? ''),
      endDate: String(row.end_date ?? ''),
      target: Number(row.target ?? 0),
      progress: Number(row.progress ?? 0),
      reward: String(row.reward ?? ''),
      badge: row.badge ? String(row.badge) : undefined,
      active: Boolean(row.active),
      participantCount: Number(row.participant_count ?? 0),
    }));
  } catch (error) {
    console.error('[listChallenges] Fallback:', error);
    return [];
  }
}

export async function createChallenge(academyId: string, data: Omit<ChallengeDTO, 'id' | 'progress' | 'participantCount'>): Promise<ChallengeDTO> {
  try {
    if (isMock()) {
      const { mockCreateChallenge } = await import('@/lib/mocks/challenges.mock');
      return mockCreateChallenge(academyId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('challenges')
      .insert({
        academy_id: academyId,
        title: data.title,
        description: data.description,
        type: data.type,
        start_date: data.startDate,
        end_date: data.endDate,
        target: data.target,
        reward: data.reward,
        badge: data.badge,
        active: data.active,
      })
      .select()
      .single();

    if (error || !row) {
      console.error('[createChallenge] Supabase error:', error?.message);
      return { id: '', ...data, progress: 0, participantCount: 0 };
    }

    return {
      id: String(row.id),
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      type: (row.type ?? 'presenca') as ChallengeType,
      startDate: String(row.start_date ?? ''),
      endDate: String(row.end_date ?? ''),
      target: Number(row.target ?? 0),
      progress: 0,
      reward: String(row.reward ?? ''),
      badge: row.badge ? String(row.badge) : undefined,
      active: Boolean(row.active),
      participantCount: 0,
    };
  } catch (error) {
    console.error('[createChallenge] Fallback:', error);
    return { id: '', ...data, progress: 0, participantCount: 0 };
  }
}
