import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_settings')
      .select('settings')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      logServiceError(error, 'app-store');
    }

    const settings = (data?.settings ?? {}) as Record<string, unknown>;
    let apps = (settings.app_store_apps ?? []) as AppStoreItem[];

    if (params?.category) {
      apps = apps.filter((a) => a.category === params.category);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      apps = apps.filter((a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }

    return apps;
  } catch (error) {
    logServiceError(error, 'app-store');
    return [];
  }
}

export async function getApp(appId: string): Promise<AppStoreItem> {
  try {
    if (isMock()) {
      const { mockGetApp } = await import('@/lib/mocks/app-store.mock');
      return mockGetApp(appId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_settings')
      .select('settings')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      logServiceError(error, 'app-store');
    }

    const settings = (data?.settings ?? {}) as Record<string, unknown>;
    const apps = (settings.app_store_apps ?? []) as AppStoreItem[];
    const found = apps.find((a) => a.id === appId);

    if (found) return found;

    return { id: appId, name: '', description: '', longDescription: '', author: '', category: '', price: 0, currency: 'BRL', rating: 0, reviewCount: 0, downloads: 0, screenshots: [], version: '', compatibility: '', features: [], featured: false };
  } catch (error) {
    logServiceError(error, 'app-store');
    return { id: '', name: '', description: '', longDescription: '', author: '', category: '', price: 0, currency: 'BRL', rating: 0, reviewCount: 0, downloads: 0, screenshots: [], version: '', compatibility: '', features: [], featured: false };
  }
}

export async function getAppReviews(appId: string): Promise<AppReview[]> {
  try {
    if (isMock()) {
      const { mockGetAppReviews } = await import('@/lib/mocks/app-store.mock');
      return mockGetAppReviews(appId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_settings')
      .select('settings')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      logServiceError(error, 'app-store');
    }

    const settings = (data?.settings ?? {}) as Record<string, unknown>;
    const reviews = (settings.app_store_reviews ?? []) as AppReview[];
    return reviews.filter((r) => r.appId === appId);
  } catch (error) {
    logServiceError(error, 'app-store');
    return [];
  }
}

export async function submitApp(data: Omit<AppStoreItem, 'id' | 'rating' | 'reviewCount' | 'downloads' | 'featured'>): Promise<AppStoreItem> {
  try {
    if (isMock()) {
      const { mockSubmitApp } = await import('@/lib/mocks/app-store.mock');
      return mockSubmitApp(data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const newApp: AppStoreItem = {
      ...data,
      id: crypto.randomUUID(),
      rating: 0,
      reviewCount: 0,
      downloads: 0,
      featured: false,
    };

    const { data: existing } = await supabase
      .from('academy_settings')
      .select('settings')
      .limit(1)
      .single();

    const settings = (existing?.settings ?? {}) as Record<string, unknown>;
    const apps = (settings.app_store_apps ?? []) as AppStoreItem[];
    apps.push(newApp);

    const { error } = await supabase.from('academy_settings').upsert(
      { academy_id: (existing as Record<string, unknown>)?.academy_id as string ?? '', settings: { ...settings, app_store_apps: apps }, updated_at: new Date().toISOString() },
      { onConflict: 'academy_id' },
    );

    if (error) {
      logServiceError(error, 'app-store');
    }

    return newApp;
  } catch (error) {
    logServiceError(error, 'app-store');
    return { ...data, id: '', rating: 0, reviewCount: 0, downloads: 0, featured: false };
  }
}

export async function getCategories(): Promise<AppCategory[]> {
  try {
    if (isMock()) {
      const { mockGetCategories } = await import('@/lib/mocks/app-store.mock');
      return mockGetCategories();
    }
    // Return curated categories list
    return [
      { id: 'management', name: 'Gestão', count: 0 },
      { id: 'communication', name: 'Comunicação', count: 0 },
      { id: 'finance', name: 'Financeiro', count: 0 },
      { id: 'marketing', name: 'Marketing', count: 0 },
      { id: 'competition', name: 'Competição', count: 0 },
      { id: 'training', name: 'Treinamento', count: 0 },
      { id: 'analytics', name: 'Analytics', count: 0 },
      { id: 'integration', name: 'Integrações', count: 0 },
    ];
  } catch (error) {
    logServiceError(error, 'app-store');
    return [];
  }
}

export async function getFeatured(): Promise<AppStoreItem[]> {
  try {
    if (isMock()) {
      const { mockGetFeatured } = await import('@/lib/mocks/app-store.mock');
      return mockGetFeatured();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_settings')
      .select('settings')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      logServiceError(error, 'app-store');
    }

    const settings = (data?.settings ?? {}) as Record<string, unknown>;
    const apps = (settings.app_store_apps ?? []) as AppStoreItem[];
    return apps.filter((a) => a.featured);
  } catch (error) {
    logServiceError(error, 'app-store');
    return [];
  }
}
