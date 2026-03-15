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
    const res = await fetch(`/api/kids/dashboard?studentId=${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'kids.dashboard');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'kids.dashboard');
  }
}
