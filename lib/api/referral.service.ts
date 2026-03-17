import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
    try {
      const res = await fetch(`/api/referral/code?academyId=${academyId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[referral.getReferralCode] API not available, using fallback');
      return {} as ReferralCode;
    }
  } catch (error) {
    handleServiceError(error, 'referral.getCode');
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
    try {
      const res = await fetch(`/api/referral/stats?academyId=${academyId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[referral.getReferralStats] API not available, using fallback');
      return {} as ReferralStats;
    }
  } catch (error) {
    handleServiceError(error, 'referral.stats');
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
    try {
      const res = await fetch(`/api/referral/list?academyId=${academyId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[referral.listReferrals] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'referral.list');
  }
}
