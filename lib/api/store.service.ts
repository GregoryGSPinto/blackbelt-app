import { isMock } from '@/lib/env';

export type ProductCategory = 'quimono' | 'faixa' | 'equipamento' | 'acessorio' | 'vestuario' | 'suplemento';
export type ProductStatus = 'active' | 'draft' | 'out_of_stock';

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price?: number;
}

export interface Product {
  id: string;
  academy_id: string;
  name: string;
  description: string;
  images: string[];
  category: ProductCategory;
  price: number;
  compare_at_price?: number;
  variants: ProductVariant[];
  stock_total: number;
  low_stock_alert: number;
  status: ProductStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category?: ProductCategory;
  status?: ProductStatus;
  search?: string;
  featured?: boolean;
  low_stock?: boolean;
}

export interface CreateProductData {
  name: string;
  description: string;
  images: string[];
  category: ProductCategory;
  price: number;
  compare_at_price?: number;
  variants: Omit<ProductVariant, 'id'>[];
  low_stock_alert: number;
  status: ProductStatus;
  featured: boolean;
}

export async function listProducts(academyId: string, filters?: ProductFilters): Promise<Product[]> {
  try {
    if (isMock()) {
      const { mockListProducts } = await import('@/lib/mocks/store.mock');
      return mockListProducts(academyId, filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase.from('products').select('*').eq('academy_id', academyId);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.featured !== undefined) query = query.eq('featured', filters.featured);
    if (filters?.search) query = query.ilike('name', `%${filters.search}%`);

    const { data, error } = await query;

    if (error || !data) {
      console.error('[listProducts] Supabase error:', error?.message);
      return [];
    }

    return data as unknown as Product[];
  } catch (error) {
    console.error('[listProducts] Fallback:', error);
    return [];
  }
}

export async function getProduct(id: string): Promise<Product> {
  try {
    if (isMock()) {
      const { mockGetProduct } = await import('@/lib/mocks/store.mock');
      return mockGetProduct(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('[getProduct] Supabase error:', error?.message);
      return { id, academy_id: '', name: '', description: '', images: [], category: 'acessorio', price: 0, variants: [], stock_total: 0, low_stock_alert: 0, status: 'draft', featured: false, created_at: '', updated_at: '' };
    }

    return data as unknown as Product;
  } catch (error) {
    console.error('[getProduct] Fallback:', error);
    return { id, academy_id: '', name: '', description: '', images: [], category: 'acessorio', price: 0, variants: [], stock_total: 0, low_stock_alert: 0, status: 'draft', featured: false, created_at: '', updated_at: '' };
  }
}

export async function createProduct(data: CreateProductData): Promise<Product> {
  try {
    if (isMock()) {
      const { mockCreateProduct } = await import('@/lib/mocks/store.mock');
      return mockCreateProduct(data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('products')
      .insert(data)
      .select()
      .single();

    if (error || !row) {
      console.error('[createProduct] Supabase error:', error?.message);
      return { id: '', academy_id: '', ...data, stock_total: 0, variants: [], created_at: '', updated_at: '' } as unknown as Product;
    }

    return row as unknown as Product;
  } catch (error) {
    console.error('[createProduct] Fallback:', error);
    return { id: '', academy_id: '', ...data, stock_total: 0, variants: [], created_at: '', updated_at: '' } as unknown as Product;
  }
}

export async function updateProduct(id: string, data: Partial<CreateProductData>): Promise<Product> {
  try {
    if (isMock()) {
      const { mockUpdateProduct } = await import('@/lib/mocks/store.mock');
      return mockUpdateProduct(id, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('products')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error || !row) {
      console.error('[updateProduct] Supabase error:', error?.message);
      return { id, academy_id: '', name: '', description: '', images: [], category: 'acessorio', price: 0, variants: [], stock_total: 0, low_stock_alert: 0, status: 'draft', featured: false, created_at: '', updated_at: '' };
    }

    return row as unknown as Product;
  } catch (error) {
    console.error('[updateProduct] Fallback:', error);
    return { id, academy_id: '', name: '', description: '', images: [], category: 'acessorio', price: 0, variants: [], stock_total: 0, low_stock_alert: 0, status: 'draft', featured: false, created_at: '', updated_at: '' };
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteProduct } = await import('@/lib/mocks/store.mock');
      return mockDeleteProduct(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[deleteProduct] Supabase error:', error.message);
    }
  } catch (error) {
    console.error('[deleteProduct] Fallback:', error);
  }
}
