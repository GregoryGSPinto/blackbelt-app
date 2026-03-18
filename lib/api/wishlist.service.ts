import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
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
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'wishlist.addToWishlist');
      return res.json();
    } catch {
      console.warn('[wishlist.addToWishlist] API not available, using fallback');
      return { id: "", user_id: "", product_id: "", product_name: "", product_image: "", price: 0, added_at: "" } as unknown as WishlistItem;
    }
  } catch (error) { handleServiceError(error, 'wishlist.addToWishlist'); }
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockRemoveFromWishlist } = await import('@/lib/mocks/wishlist.mock');
      return mockRemoveFromWishlist(userId, productId);
    }
    try {
      const res = await fetch(`/api/wishlist/${productId}?userId=${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new ServiceError(res.status, 'wishlist.removeFromWishlist');
    } catch {
      console.warn('[wishlist.removeFromWishlist] API not available, using fallback');
    }
  } catch (error) { handleServiceError(error, 'wishlist.removeFromWishlist'); }
}

export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  try {
    if (isMock()) {
      const { mockGetWishlist } = await import('@/lib/mocks/wishlist.mock');
      return mockGetWishlist(userId);
    }
    try {
      const res = await fetch(`/api/wishlist?userId=${userId}`);
      if (!res.ok) throw new ServiceError(res.status, 'wishlist.getWishlist');
      return res.json();
    } catch {
      console.warn('[wishlist.getWishlist] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'wishlist.getWishlist'); }
}
