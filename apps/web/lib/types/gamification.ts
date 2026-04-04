// ── Gamification types (P-074, P-075) ─────────────────────────

export interface XPEvent {
  type: 'attendance' | 'video_watched' | 'quiz_correct' | 'series_complete' | 'streak_7d' | 'streak_30d' | 'class_given' | 'evaluation' | 'video_published' | 'graduation_proposed';
  xp: number;
}

export const XP_VALUES: Record<XPEvent['type'], number> = {
  attendance: 10,
  video_watched: 5,
  quiz_correct: 3,
  series_complete: 50,
  streak_7d: 100,
  streak_30d: 500,
  class_given: 10,
  evaluation: 5,
  video_published: 20,
  graduation_proposed: 15,
};

export interface PlayerProfile {
  userId: string;
  name: string;
  role: 'student' | 'professor';
  totalXP: number;
  level: number;
  levelName: string;
  xpForNextLevel: number;
  xpProgress: number; // percentage 0-100
  streak: number;
  badges: Badge[];
  rank: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number; // 0-100
  requirement: number;
  current: number;
  category: 'attendance' | 'content' | 'achievement' | 'social' | 'special';
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  totalXP: number;
  level: number;
  levelName: string;
  badges: number;
}

export function getLevelInfo(xp: number): { level: number; name: string; xpForNext: number; progress: number } {
  const level = Math.floor(xp / 100) + 1;
  const cappedLevel = Math.min(level, 100);
  const xpInLevel = xp % 100;
  const progress = xpInLevel;

  let name: string;
  if (cappedLevel <= 10) name = `Faixa Branca Lv.${cappedLevel}`;
  else if (cappedLevel <= 25) name = `Faixa Azul Lv.${cappedLevel}`;
  else if (cappedLevel <= 40) name = `Faixa Roxa Lv.${cappedLevel}`;
  else if (cappedLevel <= 60) name = `Faixa Marrom Lv.${cappedLevel}`;
  else if (cappedLevel <= 80) name = `Faixa Preta Lv.${cappedLevel}`;
  else name = `Mestre Lv.${cappedLevel}`;

  return { level: cappedLevel, name, xpForNext: 100 - xpInLevel, progress };
}
