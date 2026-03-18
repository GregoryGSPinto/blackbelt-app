import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type TitleRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface TitleDTO {
  id: string;
  name: string;
  description: string;
  rarity: TitleRarity;
  requirement: string;
  icon_url: string;
  color: string;
  is_unlocked: boolean;
  is_equipped: boolean;
  unlocked_at?: string;
}

export async function getAvailableTitles(userId: string): Promise<TitleDTO[]> {
  try {
    if (isMock()) {
      const { mockGetAvailableTitles } = await import('@/lib/mocks/titles.mock');
      return mockGetAvailableTitles(userId);
    }
    try {
      const res = await fetch(`/api/titles/available?userId=${userId}`);
      if (!res.ok) throw new ServiceError(res.status, 'titles.available');
      return res.json();
    } catch {
      console.warn('[titles.getAvailableTitles] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'titles.available'); }
}

export async function getMyTitles(userId: string): Promise<TitleDTO[]> {
  try {
    if (isMock()) {
      const { mockGetMyTitles } = await import('@/lib/mocks/titles.mock');
      return mockGetMyTitles(userId);
    }
    try {
      const res = await fetch(`/api/titles/mine?userId=${userId}`);
      if (!res.ok) throw new ServiceError(res.status, 'titles.mine');
      return res.json();
    } catch {
      console.warn('[titles.getMyTitles] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'titles.mine'); }
}

export async function equipTitle(userId: string, titleId: string): Promise<{ success: boolean }> {
  try {
    if (isMock()) {
      const { mockEquipTitle } = await import('@/lib/mocks/titles.mock');
      return mockEquipTitle(userId, titleId);
    }
    try {
      const res = await fetch('/api/titles/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, titleId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'titles.equip');
      return res.json();
    } catch {
      console.warn('[titles.equipTitle] API not available, using fallback');
      return { success: false };
    }
  } catch (error) { handleServiceError(error, 'titles.equip'); }
}

export async function unequipTitle(userId: string): Promise<{ success: boolean }> {
  try {
    if (isMock()) {
      const { mockUnequipTitle } = await import('@/lib/mocks/titles.mock');
      return mockUnequipTitle(userId);
    }
    try {
      const res = await fetch('/api/titles/unequip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'titles.unequip');
      return res.json();
    } catch {
      console.warn('[titles.unequipTitle] API not available, using fallback');
      return { success: false };
    }
  } catch (error) { handleServiceError(error, 'titles.unequip'); }
}
