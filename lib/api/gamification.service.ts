import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import { logger } from '@/lib/monitoring/logger';
import type { PlayerProfile, LeaderboardEntry, Badge } from '@/lib/types/gamification';

export async function getPlayerProfile(userId: string): Promise<PlayerProfile> {
  try {
    if (isMock()) {
      const { mockGetPlayerProfile } = await import('@/lib/mocks/gamification.mock');
      return mockGetPlayerProfile(userId);
    }
    try {
      const res = await fetch(`/api/gamification/profile/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[gamification.getPlayerProfile] API not available, using fallback');
      return { id: "", name: "", level: 0, xp: 0, xp_next_level: 0, achievements: [], badges: [], streak: 0 } as unknown as PlayerProfile;
    }
  } catch (error) {
    handleServiceError(error, 'gamification.profile');
  }
}

export async function getLeaderboard(
  academyId: string,
  classId?: string,
): Promise<LeaderboardEntry[]> {
  try {
    if (isMock()) {
      const { mockGetLeaderboard } = await import('@/lib/mocks/gamification.mock');
      return mockGetLeaderboard(academyId, classId);
    }
    try {
      const params = new URLSearchParams({ academyId });
      if (classId) params.set('classId', classId);
      const res = await fetch(`/api/gamification/leaderboard?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[gamification.getLeaderboard] API not available, using fallback');
      return [];
    }

  } catch (error) {
    handleServiceError(error, 'gamification.leaderboard');
  }
}

export async function getAllBadges(): Promise<Badge[]> {
  try {
    if (isMock()) {
      const { mockGetAllBadges } = await import('@/lib/mocks/gamification.mock');
      return mockGetAllBadges();
    }
    try {
      const res = await fetch('/api/gamification/badges');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[gamification.getAllBadges] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'gamification.badges');
  }
}

export async function awardXP(
  userId: string,
  eventType: string,
  amount: number,
): Promise<{ newTotal: number; levelUp: boolean; newLevel: number }> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] Award XP', { amount, userId, eventType });
      return { newTotal: 1250 + amount, levelUp: false, newLevel: 13 };
    }
    const res = await fetch('/api/gamification/xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, eventType, amount }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'gamification.awardXP');
  }
}
