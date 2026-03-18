import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export interface AppStoreItem {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  author: string;
  category: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  downloads: number;
  screenshots: string[];
  version: string;
  compatibility: string;
  features: string[];
  featured: boolean;
}

export interface AppReview {
  id: string;
  appId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AppCategory {
  id: string;
  name: string;
  count: number;
}

export async function listApps(params?: { category?: string; search?: string }): Promise<AppStoreItem[]> {
  try {
    if (isMock()) {
      const { mockListApps } = await import('@/lib/mocks/app-store.mock');
      return mockListApps(params);
    }
    try {
      const query = new URLSearchParams();
      if (params?.category) query.set('category', params.category);
      if (params?.search) query.set('search', params.search);
      const res = await fetch(`/api/v1/app-store?${query}`);
      return res.json();
    } catch {
      console.warn('[app-store.listApps] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'appStore.list'); }
}

export async function getApp(appId: string): Promise<AppStoreItem> {
  try {
    if (isMock()) {
      const { mockGetApp } = await import('@/lib/mocks/app-store.mock');
      return mockGetApp(appId);
    }
    try {
      const res = await fetch(`/api/v1/app-store/${appId}`);
      return res.json();
    } catch {
      console.warn('[app-store.getApp] API not available, using fallback');
      return { id: '', name: '', description: '', longDescription: '', author: '', category: '', price: 0, currency: 'BRL', rating: 0, reviewCount: 0, downloads: 0, screenshots: [], version: '', compatibility: '', features: [], featured: false } as AppStoreItem;
    }
  } catch (error) { handleServiceError(error, 'appStore.get'); }
}

export async function getAppReviews(appId: string): Promise<AppReview[]> {
  try {
    if (isMock()) {
      const { mockGetAppReviews } = await import('@/lib/mocks/app-store.mock');
      return mockGetAppReviews(appId);
    }
    try {
      const res = await fetch(`/api/v1/app-store/${appId}/reviews`);
      return res.json();
    } catch {
      console.warn('[app-store.getAppReviews] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'appStore.reviews'); }
}

export async function submitApp(data: Omit<AppStoreItem, 'id' | 'rating' | 'reviewCount' | 'downloads' | 'featured'>): Promise<AppStoreItem> {
  try {
    if (isMock()) {
      const { mockSubmitApp } = await import('@/lib/mocks/app-store.mock');
      return mockSubmitApp(data);
    }
    try {
      const res = await fetch('/api/v1/app-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    } catch {
      console.warn('[app-store.submitApp] API not available, using fallback');
      return { id: '', name: '', description: '', longDescription: '', author: '', category: '', price: 0, currency: 'BRL', rating: 0, reviewCount: 0, downloads: 0, screenshots: [], version: '', compatibility: '', features: [], featured: false } as AppStoreItem;
    }
  } catch (error) { handleServiceError(error, 'appStore.submit'); }
}

export async function getCategories(): Promise<AppCategory[]> {
  try {
    if (isMock()) {
      const { mockGetCategories } = await import('@/lib/mocks/app-store.mock');
      return mockGetCategories();
    }
    try {
      const res = await fetch('/api/v1/app-store/categories');
      return res.json();
    } catch {
      console.warn('[app-store.getCategories] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'appStore.categories'); }
}

export async function getFeatured(): Promise<AppStoreItem[]> {
  try {
    if (isMock()) {
      const { mockGetFeatured } = await import('@/lib/mocks/app-store.mock');
      return mockGetFeatured();
    }
    try {
      const res = await fetch('/api/v1/app-store/featured');
      return res.json();
    } catch {
      console.warn('[app-store.getFeatured] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'appStore.featured'); }
}
