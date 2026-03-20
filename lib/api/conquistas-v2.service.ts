import { isMock } from '@/lib/env';
// handleServiceError removed — graceful console.warn fallback pattern

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export type AchievementCategory = 'JORNADA' | 'CONSTANCIA' | 'FAIXA' | 'SOCIAL' | 'COMPETICAO' | 'CONTEUDO';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementV2DTO {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  is_earned: boolean;
  earned_at: string | null;
  /** Progress toward earning (0–100). Null if already earned. */
  progress_percent: number | null;
  progress_label: string | null;
}

export interface AchievementProgressDTO {
  student_id: string;
  total: number;
  earned: number;
  percent: number;
  most_rare_earned: AchievementV2DTO | null;
}

export const CATEGORY_META: Record<AchievementCategory, { label: string; color: string }> = {
  JORNADA: { label: 'Jornada', color: '#3B82F6' },      // blue
  CONSTANCIA: { label: 'Constância', color: '#F97316' }, // orange
  FAIXA: { label: 'Faixa', color: '#dynamic' },          // belt color
  SOCIAL: { label: 'Social', color: '#22C55E' },         // green
  COMPETICAO: { label: 'Competição', color: '#EAB308' }, // gold
  CONTEUDO: { label: 'Conteúdo', color: '#A855F7' },     // purple
};

export const RARITY_ORDER: AchievementRarity[] = ['common', 'rare', 'epic', 'legendary'];

// ────────────────────────────────────────────────────────────
// Service functions
// ────────────────────────────────────────────────────────────

export async function getAchievements(studentId: string): Promise<AchievementV2DTO[]> {
  try {
    if (isMock()) {
      const { mockGetAchievements } = await import('@/lib/mocks/conquistas-v2.mock');
      return mockGetAchievements(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('achievements_v2')
      .select('id, name, description, category, rarity, icon, is_earned, earned_at, progress_percent, progress_label')
      .eq('student_id', studentId)
      .order('rarity', { ascending: false });

    if (error) {
      console.warn('[getAchievements] Supabase error:', error.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      name: String(row.name ?? ''),
      description: String(row.description ?? ''),
      category: (row.category as AchievementCategory) ?? 'JORNADA',
      rarity: (row.rarity as AchievementRarity) ?? 'common',
      icon: String(row.icon ?? ''),
      is_earned: Boolean(row.is_earned),
      earned_at: row.earned_at ? String(row.earned_at) : null,
      progress_percent: row.is_earned ? null : (row.progress_percent != null ? Number(row.progress_percent) : null),
      progress_label: row.progress_label ? String(row.progress_label) : null,
    }));
  } catch (error) {
    console.warn('[getAchievements] Fallback:', error);
    return [];
  }
}

export async function getAchievementProgress(studentId: string): Promise<AchievementProgressDTO> {
  try {
    if (isMock()) {
      const { mockGetAchievementProgress } = await import('@/lib/mocks/conquistas-v2.mock');
      return mockGetAchievementProgress(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Fetch all achievements for student to compute progress
    const { data, error } = await supabase
      .from('achievements_v2')
      .select('id, name, description, category, rarity, icon, is_earned, earned_at, progress_percent, progress_label')
      .eq('student_id', studentId);

    if (error) {
      console.warn('[getAchievementProgress] Supabase error:', error.message);
      return { student_id: studentId, total: 0, earned: 0, percent: 0, most_rare_earned: null };
    }

    const rows = data ?? [];
    const total = rows.length;
    const earnedRows = rows.filter((r: Record<string, unknown>) => Boolean(r.is_earned));
    const earned = earnedRows.length;
    const percent = total > 0 ? Math.round((earned / total) * 100) : 0;

    // Find the most rare earned achievement
    let mostRare: AchievementV2DTO | null = null;
    if (earnedRows.length > 0) {
      const sorted = [...earnedRows].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
        const aIdx = RARITY_ORDER.indexOf((a.rarity as AchievementRarity) ?? 'common');
        const bIdx = RARITY_ORDER.indexOf((b.rarity as AchievementRarity) ?? 'common');
        return bIdx - aIdx;
      });
      const top = sorted[0];
      mostRare = {
        id: String(top.id ?? ''),
        name: String(top.name ?? ''),
        description: String(top.description ?? ''),
        category: (top.category as AchievementCategory) ?? 'JORNADA',
        rarity: (top.rarity as AchievementRarity) ?? 'common',
        icon: String(top.icon ?? ''),
        is_earned: true,
        earned_at: top.earned_at ? String(top.earned_at) : null,
        progress_percent: null,
        progress_label: null,
      };
    }

    return { student_id: studentId, total, earned, percent, most_rare_earned: mostRare };
  } catch (error) {
    console.warn('[getAchievementProgress] Fallback:', error);
    return { student_id: studentId, total: 0, earned: 0, percent: 0, most_rare_earned: null };
  }
}
