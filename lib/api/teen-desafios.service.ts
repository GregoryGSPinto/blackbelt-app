import { isMock } from '@/lib/env';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface DesafioTeen {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: 'diario' | 'semanal' | 'mensal' | 'especial';
  xp_reward: number;
  progress: number;
  target: number;
  completed: boolean;
  completed_at: string | null;
  expires_at: string;
}

export interface DesafiosOverview {
  active: DesafioTeen[];
  completed: DesafioTeen[];
  total_xp_earned: number;
  streak_bonus: number;
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getDesafios(studentId: string): Promise<DesafiosOverview> {
  try {
    if (isMock()) {
      const { mockGetDesafios } = await import('@/lib/mocks/teen-desafios.mock');
      return mockGetDesafios(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('teen_desafios')
      .select('*')
      .eq('student_id', studentId);
    if (error || !data) {
      console.error('[getDesafios] Supabase error:', error?.message);
      const { mockGetDesafios } = await import('@/lib/mocks/teen-desafios.mock');
      return mockGetDesafios(studentId);
    }
    const all = data as unknown as DesafioTeen[];
    const active = all.filter(d => !d.completed);
    const completed = all.filter(d => d.completed);
    const total_xp_earned = completed.reduce((s, d) => s + d.xp_reward, 0);
    return { active, completed, total_xp_earned, streak_bonus: 0 };
  } catch (error) {
    console.error('[getDesafios] Fallback:', error);
    const { mockGetDesafios } = await import('@/lib/mocks/teen-desafios.mock');
    return mockGetDesafios(studentId);
  }
}

export async function claimReward(desafioId: string): Promise<{ xp_earned: number }> {
  try {
    if (isMock()) {
      const { mockClaimReward } = await import('@/lib/mocks/teen-desafios.mock');
      return mockClaimReward(desafioId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('teen_desafios')
      .update({ claimed: true })
      .eq('id', desafioId)
      .select('xp_reward')
      .single();
    if (error || !data) {
      console.error('[claimReward] Supabase error:', error?.message);
      return { xp_earned: 0 };
    }
    return { xp_earned: Number(data.xp_reward ?? 0) };
  } catch (error) {
    console.error('[claimReward] Fallback:', error);
    return { xp_earned: 0 };
  }
}
