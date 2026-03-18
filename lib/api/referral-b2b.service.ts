import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
    try {
      const res = await fetch(`/api/referral/code?academyId=${academyId}`);
      return res.json().then((r: { code: string }) => r.code);
    } catch {
      console.warn('[referral-b2b.getReferralCode] API not available, using mock fallback');
      const { mockGetReferralCode } = await import('@/lib/mocks/referral-b2b.mock');
      return mockGetReferralCode(academyId);
    }
  } catch (error) { handleServiceError(error, 'referral.getCode'); }
}

export async function getReferralStats(academyId: string): Promise<ReferralStatsDTO> {
  try {
    if (isMock()) {
      const { mockGetReferralStats } = await import('@/lib/mocks/referral-b2b.mock');
      return mockGetReferralStats(academyId);
    }
    try {
      const res = await fetch(`/api/referral/stats?academyId=${academyId}`);
      return res.json();
    } catch {
      console.warn('[referral-b2b.getReferralStats] API not available, using mock fallback');
      const { mockGetReferralStats } = await import('@/lib/mocks/referral-b2b.mock');
      return mockGetReferralStats(academyId);
    }
  } catch (error) { handleServiceError(error, 'referral.getStats'); }
}

export async function applyReferralCredit(academyId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockApplyCredit } = await import('@/lib/mocks/referral-b2b.mock');
      return mockApplyCredit(academyId);
    }
    try {
      await fetch('/api/referral/apply-credit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ academyId }) });
    } catch {
      console.warn('[referral-b2b.applyReferralCredit] API not available, using fallback');
    }
  } catch (error) { handleServiceError(error, 'referral.applyCredit'); }
}

export async function trackReferralClick(code: string): Promise<void> {
  try {
    if (isMock()) return;
    fetch('/api/referral/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) }).catch(() => {});
  } catch { /* fire-and-forget */ }
}
