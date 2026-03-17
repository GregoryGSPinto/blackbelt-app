import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { BeltLevel } from '@/lib/types/domain';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface TeenChallengeDTO {
  id: string;
  title: string;
  progress: number;
  target: number;
  days_remaining: number;
  reward_xp: number;
  emoji: string;
}

export interface TeenRankingEntryDTO {
  student_id: string;
  display_name: string;
  avatar: string | null;
  xp: number;
  rank: number;
  is_current_user: boolean;
}

export interface TeenAchievementDTO {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  unlocked_at: string | null;
  glow_color: string;
}

export interface TeenNextAchievementDTO {
  name: string;
  icon: string;
  progress: number;
  target: number;
  description: string;
}

export interface TeenStreakDTO {
  current_days: number;
  best_ever: number;
  is_active: boolean;
}

export interface TeenProfileDTO {
  student_id: string;
  display_name: string;
  avatar: string | null;
  belt: BeltLevel;
  title: string;
  bio: string;
}

export interface TeenWeeklyChallengeDTO {
  id: string;
  title: string;
  emoji: string;
  progress: number;
  target: number;
  reward_xp: number;
}

export interface TeenContinueWatchingDTO {
  id: string;
  title: string;
  thumbnail_emoji: string;
  progress_percent: number;
  duration_label: string;
  reward_xp: number;
}

export interface TeenNextClassDTO {
  id: string;
  title: string;
  instructor: string;
  starts_at: string;
  location: string;
}

export interface TeenDashboardDTO {
  profile: TeenProfileDTO;
  xp: number;
  level: number;
  next_level_xp: number;
  rank_position: number;
  xp_this_week: number;
  videos_watched: number;
  active_challenge: TeenChallengeDTO | null;
  weekly_challenges: TeenWeeklyChallengeDTO[];
  ranking: TeenRankingEntryDTO[];
  achievements: TeenAchievementDTO[];
  next_achievement: TeenNextAchievementDTO | null;
  streak: TeenStreakDTO;
  continue_watching: TeenContinueWatchingDTO[];
  next_class: TeenNextClassDTO | null;
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getTeenDashboard(studentId: string): Promise<TeenDashboardDTO> {
  try {
    if (isMock()) {
      const { mockGetTeenDashboard } = await import('@/lib/mocks/teen.mock');
      return mockGetTeenDashboard(studentId);
    }
    const res = await fetch(`/api/teen/dashboard?studentId=${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'teen.dashboard');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'teen.dashboard');
  }
}
