import { isMock } from '@/lib/env';
import type { BeltLevel } from '@/lib/types/domain';
import { logServiceError } from '@/lib/api/errors';

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
  if (isMock()) {
    const { mockGetTeenDashboard } = await import('@/lib/mocks/teen.mock');
    return mockGetTeenDashboard(studentId);
  }

  const EMPTY: TeenDashboardDTO = {
    profile: { student_id: '', display_name: '', avatar: null, belt: 'branca' as BeltLevel, title: '', bio: '' },
    xp: 0, level: 1, next_level_xp: 100, rank_position: 0, xp_this_week: 0, videos_watched: 0,
    active_challenge: null, weekly_challenges: [], ranking: [], achievements: [],
    next_achievement: null, streak: { current_days: 0, best_ever: 0, is_active: false },
    continue_watching: [], next_class: null,
  };

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // ── Parallel queries ─────────────────────────────────────
  const [studentRes, xpTotalRes, xpWeekRes, challengesRes, achievementsRes, attendanceRes, enrollmentsRes, rankingRes] = await Promise.all([
    supabase.from('students')
      .select('id, belt, academy_id, profiles!students_profile_id_fkey(display_name, avatar)')
      .eq('id', studentId)
      .single(),
    supabase.from('xp_ledger')
      .select('amount')
      .eq('student_id', studentId),
    supabase.from('xp_ledger')
      .select('amount')
      .eq('student_id', studentId)
      .gte('created_at', weekAgo),
    supabase.from('achievement_definitions')
      .select('id, name, description, icon, type, target, category')
      .in('category', ['challenge', 'weekly']),
    supabase.from('achievements')
      .select('id, type, granted_at, achievement_definitions(id, name, icon, description, target)')
      .eq('student_id', studentId),
    supabase.from('attendance')
      .select('checked_at')
      .eq('student_id', studentId)
      .order('checked_at', { ascending: false }),
    supabase.from('class_enrollments')
      .select('class_id, classes(id, schedule, modalities(name), profiles!classes_professor_id_fkey(display_name), units(name))')
      .eq('student_id', studentId)
      .eq('status', 'active'),
    supabase.from('xp_ledger')
      .select('student_id, amount, students!inner(profiles!students_profile_id_fkey(display_name, avatar))')
      .order('amount', { ascending: false }),
  ]);

  if (studentRes.error || !studentRes.data) {
    logServiceError(studentRes.error, 'teen');
    return EMPTY;
  }

  const student = studentRes.data;
  const profileData = student.profiles as Record<string, unknown> | null;
  const displayName = (profileData?.display_name ?? '') as string;
  const avatar = (profileData?.avatar ?? null) as string | null;

  // ── XP & Level ───────────────────────────────────────────
  const totalXp = (xpTotalRes.data ?? []).reduce((sum: number, r: Record<string, unknown>) => sum + (Number(r.amount) || 0), 0);
  const xpThisWeek = (xpWeekRes.data ?? []).reduce((sum: number, r: Record<string, unknown>) => sum + (Number(r.amount) || 0), 0);
  const level = Math.floor(totalXp / 100) + 1;
  const nextLevelXp = level * 100;

  // ── Profile ──────────────────────────────────────────────
  const profile: TeenProfileDTO = {
    student_id: studentId,
    display_name: displayName,
    avatar,
    belt: (student.belt ?? 'branca') as BeltLevel,
    title: `Nível ${level}`,
    bio: '',
  };

  // ── Challenges (from achievement_definitions with category challenge/weekly) ──
  const earnedIds = new Set((achievementsRes.data ?? []).map((a: Record<string, unknown>) => {
    const def = a.achievement_definitions as Record<string, unknown> | null;
    return def?.id ? String(def.id) : '';
  }));

  const weeklyChallenges: TeenWeeklyChallengeDTO[] = (challengesRes.data ?? [])
    .filter((d: Record<string, unknown>) => String(d.category) === 'weekly')
    .slice(0, 3)
    .map((d: Record<string, unknown>) => ({
      id: String(d.id ?? ''),
      title: String(d.name ?? ''),
      emoji: String(d.icon ?? '🎯'),
      progress: earnedIds.has(String(d.id)) ? Number(d.target ?? 1) : 0,
      target: Number(d.target ?? 1),
      reward_xp: 50,
    }));

  const activeChallengeDef = (challengesRes.data ?? []).find(
    (d: Record<string, unknown>) => String(d.category) === 'challenge' && !earnedIds.has(String(d.id))
  ) as Record<string, unknown> | undefined;

  const activeChallenge: TeenChallengeDTO | null = activeChallengeDef ? {
    id: String(activeChallengeDef.id ?? ''),
    title: String(activeChallengeDef.name ?? ''),
    progress: 0,
    target: Number(activeChallengeDef.target ?? 1),
    days_remaining: 7,
    reward_xp: 100,
    emoji: String(activeChallengeDef.icon ?? '🔥'),
  } : null;

  // ── Rankings (aggregate XP per student) ──────────────────
  const xpByStudent = new Map<string, { xp: number; name: string; avatar: string | null }>();
  for (const row of (rankingRes.data ?? []) as Record<string, unknown>[]) {
    const sid = String(row.student_id ?? '');
    const amt = Number(row.amount ?? 0);
    const s = row.students as Record<string, unknown> | null;
    const p = s?.profiles as Record<string, unknown> | null;
    const entry = xpByStudent.get(sid) ?? { xp: 0, name: (p?.display_name ?? '') as string, avatar: (p?.avatar ?? null) as string | null };
    entry.xp += amt;
    xpByStudent.set(sid, entry);
  }
  const sortedRanking = Array.from(xpByStudent.entries())
    .sort((a, b) => b[1].xp - a[1].xp)
    .slice(0, 20);
  const ranking: TeenRankingEntryDTO[] = sortedRanking.map(([sid, info], idx) => ({
    student_id: sid,
    display_name: info.name,
    avatar: info.avatar,
    xp: info.xp,
    rank: idx + 1,
    is_current_user: sid === studentId,
  }));
  const rankPosition = ranking.find(r => r.is_current_user)?.rank ?? 0;

  // ── Achievements ─────────────────────────────────────────
  const achievements: TeenAchievementDTO[] = (achievementsRes.data ?? []).map((a: Record<string, unknown>) => {
    const def = a.achievement_definitions as Record<string, unknown> | null;
    return {
      id: String(a.id ?? ''),
      name: String(def?.name ?? ''),
      icon: String(def?.icon ?? '🏆'),
      unlocked: true,
      unlocked_at: a.granted_at ? String(a.granted_at) : null,
      glow_color: '#fbbf24',
    };
  });

  // ── Next achievement ─────────────────────────────────────
  const allDefs = challengesRes.data ?? [];
  const nextDef = allDefs.find((d: Record<string, unknown>) => !earnedIds.has(String(d.id))) as Record<string, unknown> | undefined;
  const nextAchievement: TeenNextAchievementDTO | null = nextDef ? {
    name: String(nextDef.name ?? ''),
    icon: String(nextDef.icon ?? '🎯'),
    progress: 0,
    target: Number(nextDef.target ?? 1),
    description: String(nextDef.description ?? ''),
  } : null;

  // ── Streak (consecutive days from attendance) ────────────
  let currentDays = 0;
  let bestEver = 0;
  let streak = 0;
  const attendanceDates = (attendanceRes.data ?? [])
    .map((r: Record<string, unknown>) => (r.checked_at as string).split('T')[0])
    .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i); // unique dates
  if (attendanceDates.length > 0) {
    streak = 1;
    let maxStreak = 1;
    for (let i = 1; i < attendanceDates.length; i++) {
      const prev = new Date(attendanceDates[i - 1]);
      const curr = new Date(attendanceDates[i]);
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
      } else {
        if (streak > maxStreak) maxStreak = streak;
        streak = 1;
      }
    }
    if (streak > maxStreak) maxStreak = streak;
    // Check if current streak is active (last attendance today or yesterday)
    const lastDate = new Date(attendanceDates[0]);
    const diffFromNow = Math.round((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    currentDays = diffFromNow <= 1 ? streak : 0;
    bestEver = maxStreak;
  }

  const streakDTO: TeenStreakDTO = {
    current_days: currentDays,
    best_ever: bestEver,
    is_active: currentDays > 0,
  };

  // ── Next class ───────────────────────────────────────────
  let nextClass: TeenNextClassDTO | null = null;
  const currentDay = now.getDay();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  for (const enrollment of (enrollmentsRes.data ?? []) as Record<string, unknown>[]) {
    const cls = enrollment.classes as Record<string, unknown> | null;
    if (!cls) continue;
    const schedule = (cls.schedule as Array<{ day_of_week: number; start_time: string; end_time: string }>) ?? [];
    const mod = cls.modalities as Record<string, unknown> | null;
    const prof = cls.profiles as Record<string, unknown> | null;
    const unit = cls.units as Record<string, unknown> | null;
    for (const slot of schedule) {
      if (slot.day_of_week === currentDay && slot.start_time > currentTime) {
        if (!nextClass || slot.start_time < nextClass.starts_at) {
          nextClass = {
            id: String(cls.id ?? ''),
            title: (mod?.name ?? '') as string,
            instructor: (prof?.display_name ?? '') as string,
            starts_at: slot.start_time,
            location: (unit?.name ?? '') as string,
          };
        }
      }
    }
  }

  return {
    profile,
    xp: totalXp,
    level,
    next_level_xp: nextLevelXp,
    rank_position: rankPosition,
    xp_this_week: xpThisWeek,
    videos_watched: 0,
    active_challenge: activeChallenge,
    weekly_challenges: weeklyChallenges,
    ranking,
    achievements,
    next_achievement: nextAchievement,
    streak: streakDTO,
    continue_watching: [],
    next_class: nextClass,
  };
}
