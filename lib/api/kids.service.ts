import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { BeltLevel } from '@/lib/types/domain';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface KidsBeltDTO {
  current: BeltLevel;
  current_label: string;
  current_color: string;
  next: BeltLevel;
  next_label: string;
  next_color: string;
  stars_to_next: number;
}

export interface KidsNextClassDTO {
  class_name: string;
  day_label: string;
  time: string;
  days_until: number;
}

export interface KidsStickerDTO {
  id: string;
  name: string;
  image_emoji: string;
  collected: boolean;
}

export interface KidsStickerAlbumDTO {
  total: number;
  collected: number;
  stickers: KidsStickerDTO[];
}

export interface KidsExchangeOptionDTO {
  id: string;
  stars_cost: number;
  label: string;
  emoji: string;
  available: boolean;
}

export interface KidsWeekStarsDTO {
  total: number;
  new_this_week: number;
}

export interface KidsDashboardDTO {
  student_id: string;
  display_name: string;
  avatar: string | null;
  belt: KidsBeltDTO;
  stars: KidsWeekStarsDTO;
  next_class: KidsNextClassDTO | null;
  sticker_album: KidsStickerAlbumDTO;
  exchange_options: KidsExchangeOptionDTO[];
  motivational_message: string;
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getKidsDashboard(studentId: string): Promise<KidsDashboardDTO> {
  try {
    if (isMock()) {
      const { mockGetKidsDashboard } = await import('@/lib/mocks/kids.mock');
      return mockGetKidsDashboard(studentId);
    }
    try {
      const res = await fetch(`/api/kids/dashboard?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'kids.dashboard');
      return res.json();
    } catch {
      console.warn('[kids.getKidsDashboard] API not available, using fallback');
      return {
        student_id: '', display_name: '', avatar: null,
        belt: { current: 'branca' as BeltLevel, current_label: 'Branca', current_color: '#fff', next: 'cinza' as BeltLevel, next_label: 'Cinza', next_color: '#9ca3af', stars_to_next: 0 },
        stars: { total: 0, new_this_week: 0 },
        next_class: null,
        sticker_album: { total: 0, collected: 0, stickers: [] },
        exchange_options: [],
        motivational_message: 'Bem-vindo ao BlackBelt!',
      };
    }
  } catch (error) {
    handleServiceError(error, 'kids.dashboard');
  }
}
