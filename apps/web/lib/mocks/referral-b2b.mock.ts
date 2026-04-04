import type { ReferralStatsDTO } from '@/lib/api/referral-b2b.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

export async function mockGetReferralCode(_academyId: string): Promise<string> {
  await delay();
  return 'BLACKBELT-ABC123';
}

export async function mockGetReferralStats(_academyId: string): Promise<ReferralStatsDTO> {
  await delay();
  return {
    code: 'BLACKBELT-ABC123',
    totalReferrals: 5,
    convertedReferrals: 3,
    creditsEarned: 3,
    creditsUsed: 2,
    referrals: [
      { academyName: 'Academia Tatame Moema', status: 'active', createdAt: '2025-06-15T10:00:00Z' },
      { academyName: 'Team Alpha MMA', status: 'active', createdAt: '2025-05-20T14:00:00Z' },
      { academyName: 'Oss Dojo', status: 'active', createdAt: '2025-04-10T08:00:00Z' },
      { academyName: 'Fight Club SP', status: 'pending', createdAt: '2025-07-01T12:00:00Z' },
      { academyName: 'Nova Academia', status: 'pending', createdAt: '2025-07-08T16:00:00Z' },
    ],
  };
}

export async function mockApplyCredit(_academyId: string): Promise<void> {
  await delay();
}
