import { isMock } from '@/lib/env';

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
      console.warn('[app-store.listApps] API not available, using mock fallback');
      const { mockListApps } = await import('@/lib/mocks/app-store.mock');
      return mockListApps(params);
    }
  } catch (error) {
    console.warn('[listApps] Fallback:', error);
    return [];
  }
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
      console.warn('[app-store.getApp] API not available, using mock fallback');
      const { mockGetApp } = await import('@/lib/mocks/app-store.mock');
      return mockGetApp(appId);
    }
  } catch (error) {
    console.warn('[getApp] Fallback:', error);
    return { id: '', name: '', description: '', longDescription: '', author: '', category: '', price: 0, currency: 'BRL', rating: 0, reviewCount: 0, downloads: 0, screenshots: [], version: '', compatibility: '', features: [], featured: false };
  }
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
      console.warn('[app-store.getAppReviews] API not available, using mock fallback');
      const { mockGetAppReviews } = await import('@/lib/mocks/app-store.mock');
      return mockGetAppReviews(appId);
    }
  } catch (error) {
    console.warn('[getAppReviews] Fallback:', error);
    return [];
  }
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
      console.warn('[app-store.submitApp] API not available, using mock fallback');
      const { mockSubmitApp } = await import('@/lib/mocks/app-store.mock');
      return mockSubmitApp(data);
    }
  } catch (error) {
    console.warn('[submitApp] Fallback:', error);
    return { ...data, id: '', rating: 0, reviewCount: 0, downloads: 0, featured: false };
  }
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
      console.warn('[app-store.getCategories] API not available, using mock fallback');
      const { mockGetCategories } = await import('@/lib/mocks/app-store.mock');
      return mockGetCategories();
    }
  } catch (error) {
    console.warn('[getCategories] Fallback:', error);
    return [];
  }
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
      console.warn('[app-store.getFeatured] API not available, using mock fallback');
      const { mockGetFeatured } = await import('@/lib/mocks/app-store.mock');
      return mockGetFeatured();
    }
  } catch (error) {
    console.warn('[getFeatured] Fallback:', error);
    return [];
  }
}
