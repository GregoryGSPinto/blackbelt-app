import type { WishlistItem } from '@/lib/api/wishlist.service';
import type { Product } from '@/lib/api/store.service';

const delay = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

const WISHLIST_PRODUCTS: Product[] = [
  {
    id: 'prod-1', academy_id: 'academy-1', name: 'Quimono Branco Competição A1',
    description: 'Quimono de competição em tecido trançado premium. Gramatura 550g/m². Aprovado pela IBJJF.',
    images: ['/img/store/quimono-branco-1.jpg'], category: 'quimono', price: 389.90, compare_at_price: 449.90,
    variants: [{ id: 'v-1a', name: 'A0', sku: 'QBC-A0', stock: 5 }, { id: 'v-1b', name: 'A1', sku: 'QBC-A1', stock: 8 }],
    stock_total: 34, low_stock_alert: 5, status: 'active', featured: true,
    created_at: '2025-11-01T10:00:00Z', updated_at: '2026-03-01T14:00:00Z',
  },
  {
    id: 'prod-8', academy_id: 'academy-1', name: 'Luva de MMA Profissional',
    description: 'Luva aberta de MMA em couro sintético premium. Proteção de punho com velcro duplo.',
    images: ['/img/store/luva-mma-1.jpg'], category: 'equipamento', price: 219.90, compare_at_price: 259.90,
    variants: [{ id: 'v-8a', name: 'P', sku: 'LMP-P', stock: 5 }, { id: 'v-8b', name: 'M', sku: 'LMP-M', stock: 9 }],
    stock_total: 21, low_stock_alert: 5, status: 'active', featured: true,
    created_at: '2026-02-01T10:00:00Z', updated_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'prod-14', academy_id: 'academy-1', name: 'Short de Luta No-Gi',
    description: 'Short de luta para treinos sem quimono. Tecido stretch com abertura lateral.',
    images: ['/img/store/short-nogi-1.jpg'], category: 'vestuario', price: 119.90, compare_at_price: 139.90,
    variants: [{ id: 'v-14a', name: 'P', sku: 'SNG-P', stock: 0 }, { id: 'v-14b', name: 'M', sku: 'SNG-M', stock: 0 }],
    stock_total: 0, low_stock_alert: 5, status: 'out_of_stock', featured: false,
    created_at: '2026-02-05T10:00:00Z', updated_at: '2026-03-14T10:00:00Z',
  },
  {
    id: 'prod-10', academy_id: 'academy-1', name: 'Bolsa de Treino Esportiva',
    description: 'Bolsa esportiva com compartimento para quimono molhado e porta-garrafa lateral.',
    images: ['/img/store/bolsa-treino-1.jpg'], category: 'acessorio', price: 159.90,
    variants: [{ id: 'v-10a', name: 'Único', sku: 'BTE-U', stock: 14 }],
    stock_total: 14, low_stock_alert: 5, status: 'active', featured: false,
    created_at: '2026-01-05T10:00:00Z', updated_at: '2026-02-20T10:00:00Z',
  },
];

const WISHLIST: WishlistItem[] = WISHLIST_PRODUCTS.map((p, i) => ({
  id: `wish-${i + 1}`,
  user_id: 'user-1',
  product_id: p.id,
  product: p,
  added_at: new Date(Date.now() - (i + 1) * 86400000 * 3).toISOString(),
}));

export async function mockAddToWishlist(_userId: string, productId: string): Promise<WishlistItem> {
  await delay();
  const item: WishlistItem = {
    id: `wish-${Date.now()}`,
    user_id: _userId,
    product_id: productId,
    product: WISHLIST_PRODUCTS[0],
    added_at: new Date().toISOString(),
  };
  WISHLIST.push(item);
  return { ...item };
}

export async function mockRemoveFromWishlist(_userId: string, productId: string): Promise<void> {
  await delay();
  const idx = WISHLIST.findIndex((w) => w.product_id === productId);
  if (idx !== -1) WISHLIST.splice(idx, 1);
}

export async function mockGetWishlist(_userId: string): Promise<WishlistItem[]> {
  await delay();
  return WISHLIST.map((w) => ({ ...w, product: { ...w.product } }));
}
