import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    try {
      const res = await fetch(`/api/conquistas/v2?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'conquistas-v2.getAchievements');
      return res.json();
    } catch {
      console.warn('[conquistas-v2.getAchievements] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'conquistas-v2.getAchievements');
  }
}

export async function getAchievementProgress(studentId: string): Promise<AchievementProgressDTO> {
  try {
    if (isMock()) {
      const { mockGetAchievementProgress } = await import('@/lib/mocks/conquistas-v2.mock');
      return mockGetAchievementProgress(studentId);
    }
    try {
      const res = await fetch(`/api/conquistas/v2/progress?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'conquistas-v2.getProgress');
      return res.json();
    } catch {
      console.warn('[conquistas-v2.getAchievementProgress] API not available, using fallback');
      return { achievement_id: "", title: "", description: "", icon: "", progress: 0, target: 0, completed: false, completed_at: null } as unknown as AchievementProgressDTO;
    }
  } catch (error) {
    handleServiceError(error, 'conquistas-v2.getProgress');
  }
}
