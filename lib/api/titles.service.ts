import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('titles')
      .select('*')
      .order('rarity');
    if (error) {
      logServiceError(error, 'titles');
      return [];
    }
    return (data ?? []) as TitleDTO[];
  } catch (error) {
    logServiceError(error, 'titles');
    return [];
  }
}

export async function getMyTitles(userId: string): Promise<TitleDTO[]> {
  try {
    if (isMock()) {
      const { mockGetMyTitles } = await import('@/lib/mocks/titles.mock');
      return mockGetMyTitles(userId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('user_titles')
      .select('*, titles(*)')
      .eq('user_id', userId);
    if (error) {
      logServiceError(error, 'titles');
      return [];
    }
    return (data ?? []) as unknown as TitleDTO[];
  } catch (error) {
    logServiceError(error, 'titles');
    return [];
  }
}

export async function equipTitle(userId: string, titleId: string): Promise<{ success: boolean }> {
  try {
    if (isMock()) {
      const { mockEquipTitle } = await import('@/lib/mocks/titles.mock');
      return mockEquipTitle(userId, titleId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    // Unequip all first
    await supabase
      .from('user_titles')
      .update({ is_equipped: false })
      .eq('user_id', userId);
    // Equip selected
    const { error } = await supabase
      .from('user_titles')
      .update({ is_equipped: true })
      .eq('user_id', userId)
      .eq('title_id', titleId);
    if (error) {
      logServiceError(error, 'titles');
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    logServiceError(error, 'titles');
    return { success: false };
  }
}

export async function unequipTitle(userId: string): Promise<{ success: boolean }> {
  try {
    if (isMock()) {
      const { mockUnequipTitle } = await import('@/lib/mocks/titles.mock');
      return mockUnequipTitle(userId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('user_titles')
      .update({ is_equipped: false })
      .eq('user_id', userId);
    if (error) {
      logServiceError(error, 'titles');
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    logServiceError(error, 'titles');
    return { success: false };
  }
}
