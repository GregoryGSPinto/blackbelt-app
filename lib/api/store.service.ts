import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    try {
      const params = new URLSearchParams({ academyId });
      if (filters?.category) params.set('category', filters.category);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.search) params.set('search', filters.search);
      if (filters?.featured !== undefined) params.set('featured', String(filters.featured));
      if (filters?.low_stock) params.set('low_stock', 'true');
      const res = await fetch(`/api/store/products?${params.toString()}`);
      if (!res.ok) throw new ServiceError(res.status, 'store.listProducts');
      return res.json();
    } catch {
      console.warn('[store.listProducts] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'store.listProducts'); }
}

export async function getProduct(id: string): Promise<Product> {
  try {
    if (isMock()) {
      const { mockGetProduct } = await import('@/lib/mocks/store.mock');
      return mockGetProduct(id);
    }
    try {
      const res = await fetch(`/api/store/products/${id}`);
      if (!res.ok) throw new ServiceError(res.status, 'store.getProduct');
      return res.json();
    } catch {
      console.warn('[store.getProduct] API not available, using fallback');
      return { id: '', academy_id: '', name: '', description: '', images: [], category: 'acessorio', price: 0, variants: [], stock_total: 0, low_stock_alert: 0, status: 'draft', featured: false, created_at: '', updated_at: '' } as Product;
    }
  } catch (error) { handleServiceError(error, 'store.getProduct'); }
}

export async function createProduct(data: CreateProductData): Promise<Product> {
  try {
    if (isMock()) {
      const { mockCreateProduct } = await import('@/lib/mocks/store.mock');
      return mockCreateProduct(data);
    }
    try {
      const res = await fetch('/api/store/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new ServiceError(res.status, 'store.createProduct');
      return res.json();
    } catch {
      console.warn('[store.createProduct] API not available, using fallback');
      return { id: '', academy_id: '', name: '', description: '', images: [], category: 'acessorio', price: 0, variants: [], stock_total: 0, low_stock_alert: 0, status: 'draft', featured: false, created_at: '', updated_at: '' } as Product;
    }
  } catch (error) { handleServiceError(error, 'store.createProduct'); }
}

export async function updateProduct(id: string, data: Partial<CreateProductData>): Promise<Product> {
  try {
    if (isMock()) {
      const { mockUpdateProduct } = await import('@/lib/mocks/store.mock');
      return mockUpdateProduct(id, data);
    }
    try {
      const res = await fetch(`/api/store/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new ServiceError(res.status, 'store.updateProduct');
      return res.json();
    } catch {
      console.warn('[store.updateProduct] API not available, using fallback');
      return { id: '', academy_id: '', name: '', description: '', images: [], category: 'acessorio', price: 0, variants: [], stock_total: 0, low_stock_alert: 0, status: 'draft', featured: false, created_at: '', updated_at: '' } as Product;
    }
  } catch (error) { handleServiceError(error, 'store.updateProduct'); }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteProduct } = await import('@/lib/mocks/store.mock');
      return mockDeleteProduct(id);
    }
    try {
      const res = await fetch(`/api/store/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new ServiceError(res.status, 'store.deleteProduct');
    } catch {
      console.warn('[store.deleteProduct] API not available, using fallback');
    }
  } catch (error) { handleServiceError(error, 'store.deleteProduct'); }
}
