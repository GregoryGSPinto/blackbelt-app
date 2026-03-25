import { isMock } from '@/lib/env';

// ── Types ─────────────────────────────────────────────────────

export interface ReferralCode {
  code: string;
  referrerId: string;
  referrerName: string;
  academyId: string;
  discount: number; // percentage
  rewardMonths: number;
  usageCount: number;
  maxUses: number | null;
  active: boolean;
  createdAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  convertedReferrals: number;
  rewardMonthsEarned: number;
  pendingRewards: number;
}

export interface Referral {
  id: string;
  referralCode: string;
  referredAcademyName: string;
  status: 'pending' | 'trial' | 'converted' | 'expired';
  createdAt: string;
  convertedAt: string | null;
}

// ── Service ───────────────────────────────────────────────────

export async function getReferralCode(academyId: string): Promise<ReferralCode> {
  try {
    if (isMock()) {
      return {
        code: `REF-${academyId.slice(-6).toUpperCase()}`,
        referrerId: 'admin-1',
        referrerName: 'Roberto Silva',
        academyId,
        discount: 50,
        rewardMonths: 1,
        usageCount: 3,
        maxUses: null,
        active: true,
        createdAt: '2026-01-15T00:00:00Z',
      };
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('academy_id', academyId)
      .eq('active', true)
      .maybeSingle();

    if (error || !data) {
      console.error('[getReferralCode] Supabase error or no data:', error?.message);
      return { code: '', referrerId: '', referrerName: '', academyId, discount: 0, rewardMonths: 0, usageCount: 0, maxUses: null, active: false, createdAt: '' };
    }

    return {
      code: data.code ?? '',
      referrerId: data.referrer_id ?? '',
      referrerName: data.referrer_name ?? '',
      academyId: data.academy_id ?? academyId,
      discount: data.discount_pct ?? 0,
      rewardMonths: data.reward_months ?? 0,
      usageCount: data.usage_count ?? 0,
      maxUses: data.max_uses ?? null,
      active: data.active ?? false,
      createdAt: data.created_at ?? '',
    };
  } catch (error) {
    console.error('[getReferralCode] Fallback:', error);
    return { code: '', referrerId: '', referrerName: '', academyId, discount: 0, rewardMonths: 0, usageCount: 0, maxUses: null, active: false, createdAt: '' };
  }
}

export async function getReferralStats(academyId: string): Promise<ReferralStats> {
  try {
    if (isMock()) {
      return {
        totalReferrals: 5,
        convertedReferrals: 3,
        rewardMonthsEarned: 3,
        pendingRewards: 1,
      };
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('referrals')
      .select('id, status')
      .eq('academy_id', academyId);

    if (error || !data) {
      console.error('[getReferralStats] Supabase error:', error?.message);
      return { totalReferrals: 0, convertedReferrals: 0, rewardMonthsEarned: 0, pendingRewards: 0 };
    }

    const total = data.length;
    const converted = data.filter((r: { status: string }) => r.status === 'converted').length;
    const pending = data.filter((r: { status: string }) => r.status === 'pending').length;

    return {
      totalReferrals: total,
      convertedReferrals: converted,
      rewardMonthsEarned: converted, // 1 month per conversion
      pendingRewards: pending,
    };
  } catch (error) {
    console.error('[getReferralStats] Fallback:', error);
    return { totalReferrals: 0, convertedReferrals: 0, rewardMonthsEarned: 0, pendingRewards: 0 };
  }
}

export async function listReferrals(academyId: string): Promise<Referral[]> {
  try {
    if (isMock()) {
      return [
        { id: 'ref-1', referralCode: 'REF-ABC123', referredAcademyName: 'Nova Academia BJJ', status: 'converted', createdAt: '2026-01-20T00:00:00Z', convertedAt: '2026-02-01T00:00:00Z' },
        { id: 'ref-2', referralCode: 'REF-ABC123', referredAcademyName: 'Samurai Dojo', status: 'converted', createdAt: '2026-02-10T00:00:00Z', convertedAt: '2026-02-25T00:00:00Z' },
        { id: 'ref-3', referralCode: 'REF-ABC123', referredAcademyName: 'Dragon Fight Team', status: 'trial', createdAt: '2026-03-05T00:00:00Z', convertedAt: null },
        { id: 'ref-4', referralCode: 'REF-ABC123', referredAcademyName: 'Lions MMA', status: 'converted', createdAt: '2026-03-10T00:00:00Z', convertedAt: '2026-03-15T00:00:00Z' },
        { id: 'ref-5', referralCode: 'REF-ABC123', referredAcademyName: 'Wolf Pack BJJ', status: 'pending', createdAt: '2026-03-16T00:00:00Z', convertedAt: null },
      ];
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('[listReferrals] Supabase error:', error?.message);
      return [];
    }

    return data.map((r: Record<string, unknown>) => ({
      id: (r.id as string) ?? '',
      referralCode: (r.referral_code as string) ?? '',
      referredAcademyName: (r.referred_academy_name as string) ?? '',
      status: (r.status as Referral['status']) ?? 'pending',
      createdAt: (r.created_at as string) ?? '',
      convertedAt: (r.converted_at as string | null) ?? null,
    }));
  } catch (error) {
    console.error('[listReferrals] Fallback:', error);
    return [];
  }
}
