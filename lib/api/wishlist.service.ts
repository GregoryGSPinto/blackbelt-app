import { isMock } from '@/lib/env';
import type { Product } from '@/lib/api/store.service';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product: Product;
  added_at: string;
}

export async function addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
  try {
    if (isMock()) {
      const { mockAddToWishlist } = await import('@/lib/mocks/wishlist.mock');
      return mockAddToWishlist(userId, productId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('wishlist')
      .insert({ user_id: userId, product_id: productId })
      .select('*, products(*)')
      .single();

    if (error || !data) {
      console.warn('[addToWishlist] Supabase error:', error?.message);
      return { id: '', user_id: userId, product_id: productId, product: {} as Product, added_at: '' };
    }

    return data as unknown as WishlistItem;
  } catch (error) {
    console.warn('[addToWishlist] Fallback:', error);
    return { id: '', user_id: userId, product_id: productId, product: {} as Product, added_at: '' };
  }
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockRemoveFromWishlist } = await import('@/lib/mocks/wishlist.mock');
      return mockRemoveFromWishlist(userId, productId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.warn('[removeFromWishlist] Supabase error:', error.message);
    }
  } catch (error) {
    console.warn('[removeFromWishlist] Fallback:', error);
  }
}

export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  try {
    if (isMock()) {
      const { mockGetWishlist } = await import('@/lib/mocks/wishlist.mock');
      return mockGetWishlist(userId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('wishlist')
      .select('*, products(*)')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error || !data) {
      console.warn('[getWishlist] Supabase error:', error?.message);
      return [];
    }

    return data as unknown as WishlistItem[];
  } catch (error) {
    console.warn('[getWishlist] Fallback:', error);
    return [];
  }
}
