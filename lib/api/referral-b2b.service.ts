import { isMock } from '@/lib/env';

export interface ReferralStatsDTO {
  code: string;
  totalReferrals: number;
  convertedReferrals: number;
  creditsEarned: number;
  creditsUsed: number;
  referrals: { academyName: string; status: 'pending' | 'active' | 'churned'; createdAt: string }[];
}

export async function getReferralCode(academyId: string): Promise<string> {
  try {
    if (isMock()) {
      const { mockGetReferralCode } = await import('@/lib/mocks/referral-b2b.mock');
      return mockGetReferralCode(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('academy_id', academyId)
      .maybeSingle();
    if (error || !data) {
      console.error('[getReferralCode] Supabase error:', error?.message);
      return '';
    }
    return String(data.code ?? '');
  } catch (error) {
    console.error('[getReferralCode] Fallback:', error);
    return '';
  }
}

export async function getReferralStats(academyId: string): Promise<ReferralStatsDTO> {
  try {
    if (isMock()) {
      const { mockGetReferralStats } = await import('@/lib/mocks/referral-b2b.mock');
      return mockGetReferralStats(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('referral_stats')
      .select('*')
      .eq('academy_id', academyId)
      .maybeSingle();
    if (error || !data) {
      console.error('[getReferralStats] Supabase error:', error?.message);
      return { code: '', totalReferrals: 0, convertedReferrals: 0, creditsEarned: 0, creditsUsed: 0, referrals: [] };
    }
    return data as unknown as ReferralStatsDTO;
  } catch (error) {
    console.error('[getReferralStats] Fallback:', error);
    return { code: '', totalReferrals: 0, convertedReferrals: 0, creditsEarned: 0, creditsUsed: 0, referrals: [] };
  }
}

export async function applyReferralCredit(academyId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockApplyCredit } = await import('@/lib/mocks/referral-b2b.mock');
      return mockApplyCredit(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase.rpc('apply_referral_credit', {
      p_academy_id: academyId,
    });
    if (error) {
      console.error('[applyReferralCredit] Supabase error:', error.message);
    }
  } catch (error) {
    console.error('[applyReferralCredit] Fallback:', error);
  }
}

export async function trackReferralClick(code: string): Promise<void> {
  try {
    if (isMock()) return;
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    supabase
      .from('referral_clicks')
      .insert({ code, clicked_at: new Date().toISOString() })
      .then(() => {});
  } catch { /* fire-and-forget */ }
}
