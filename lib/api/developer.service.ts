import { isMock } from '@/lib/env';

export interface DeveloperProfile {
  id: string;
  name: string;
  email: string;
  company: string;
  website: string;
  verified: boolean;
  createdAt: string;
}

export interface DeveloperApp {
  id: string;
  name: string;
  status: 'draft' | 'in_review' | 'approved' | 'rejected';
  version: string;
  submittedAt: string | null;
  category: string;
}

export interface DeveloperStats {
  totalApps: number;
  totalDownloads: number;
  totalRevenue: number;
  averageRating: number;
  activeInstalls: number;
}

export interface APIUsageRecord {
  date: string;
  requests: number;
  errors: number;
  latencyP50: number;
  latencyP99: number;
}

export async function getDeveloperProfile(): Promise<DeveloperProfile> {
  try {
    if (isMock()) {
      const { mockGetDeveloperProfile } = await import('@/lib/mocks/developer.mock');
      return mockGetDeveloperProfile();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[getDeveloperProfile] No authenticated user');
      return { id: '', name: '', email: '', company: '', website: '', verified: false, createdAt: '' };
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, metadata')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('[getDeveloperProfile] Supabase error:', error.message);
      return { id: '', name: '', email: '', company: '', website: '', verified: false, createdAt: '' };
    }

    const meta = (profile?.metadata ?? {}) as Record<string, unknown>;
    const dev = (meta.developer ?? {}) as Record<string, unknown>;

    return {
      id: profile?.id ?? '',
      name: (dev.name as string) ?? profile?.full_name ?? '',
      email: (dev.email as string) ?? profile?.email ?? '',
      company: (dev.company as string) ?? '',
      website: (dev.website as string) ?? '',
      verified: (dev.verified as boolean) ?? false,
      createdAt: (dev.createdAt as string) ?? '',
    };
  } catch (error) {
    console.error('[getDeveloperProfile] Fallback:', error);
    return { id: '', name: '', email: '', company: '', website: '', verified: false, createdAt: '' };
  }
}

export async function createDeveloperAccount(data: {
  name: string;
  email: string;
  company: string;
  website: string;
}): Promise<DeveloperProfile> {
  try {
    if (isMock()) {
      const { mockCreateDeveloperAccount } = await import('@/lib/mocks/developer.mock');
      return mockCreateDeveloperAccount(data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[createDeveloperAccount] No authenticated user');
      return { id: '', name: data.name, email: data.email, company: data.company, website: data.website, verified: false, createdAt: '' };
    }

    const now = new Date().toISOString();

    // Read current profile metadata
    const { data: profile } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', user.id)
      .single();

    const meta = (profile?.metadata ?? {}) as Record<string, unknown>;
    const devInfo = { ...data, verified: false, createdAt: now };

    const { error } = await supabase
      .from('profiles')
      .update({ metadata: { ...meta, developer: devInfo } })
      .eq('id', user.id);

    if (error) {
      console.error('[createDeveloperAccount] Supabase error:', error.message);
    }

    return {
      id: user.id,
      name: data.name,
      email: data.email,
      company: data.company,
      website: data.website,
      verified: false,
      createdAt: now,
    };
  } catch (error) {
    console.error('[createDeveloperAccount] Fallback:', error);
    return { id: '', name: data.name, email: data.email, company: data.company, website: data.website, verified: false, createdAt: '' };
  }
}

export async function getSubmittedApps(): Promise<DeveloperApp[]> {
  try {
    if (isMock()) {
      const { mockGetSubmittedApps } = await import('@/lib/mocks/developer.mock');
      return mockGetSubmittedApps();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: profile } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', user.id)
      .single();

    const meta = (profile?.metadata ?? {}) as Record<string, unknown>;
    const dev = (meta.developer ?? {}) as Record<string, unknown>;
    return (dev.submitted_apps ?? []) as DeveloperApp[];
  } catch (error) {
    console.error('[getSubmittedApps] Fallback:', error);
    return [];
  }
}

export async function submitAppForReview(appId: string): Promise<DeveloperApp> {
  try {
    if (isMock()) {
      const { mockSubmitAppForReview } = await import('@/lib/mocks/developer.mock');
      return mockSubmitAppForReview(appId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { id: appId, name: '', status: 'draft', version: '', submittedAt: null, category: '' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', user.id)
      .single();

    const meta = (profile?.metadata ?? {}) as Record<string, unknown>;
    const dev = (meta.developer ?? {}) as Record<string, unknown>;
    const apps = (dev.submitted_apps ?? []) as DeveloperApp[];
    const now = new Date().toISOString();

    const idx = apps.findIndex((a) => a.id === appId);
    if (idx >= 0) {
      apps[idx] = { ...apps[idx], status: 'in_review', submittedAt: now };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ metadata: { ...meta, developer: { ...dev, submitted_apps: apps } } })
      .eq('id', user.id);

    if (error) {
      console.error('[submitAppForReview] Supabase error:', error.message);
    }

    return idx >= 0 ? apps[idx] : { id: appId, name: '', status: 'in_review' as const, version: '', submittedAt: now, category: '' };
  } catch (error) {
    console.error('[submitAppForReview] Fallback:', error);
    return { id: appId, name: '', status: 'draft', version: '', submittedAt: null, category: '' };
  }
}

export async function getDeveloperStats(): Promise<DeveloperStats> {
  try {
    if (isMock()) {
      const { mockGetDeveloperStats } = await import('@/lib/mocks/developer.mock');
      return mockGetDeveloperStats();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { totalApps: 0, totalDownloads: 0, totalRevenue: 0, averageRating: 0, activeInstalls: 0 };

    const { data: profile } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', user.id)
      .single();

    const meta = (profile?.metadata ?? {}) as Record<string, unknown>;
    const dev = (meta.developer ?? {}) as Record<string, unknown>;
    const stats = (dev.stats ?? {}) as Record<string, unknown>;

    return {
      totalApps: (stats.totalApps as number) ?? 0,
      totalDownloads: (stats.totalDownloads as number) ?? 0,
      totalRevenue: (stats.totalRevenue as number) ?? 0,
      averageRating: (stats.averageRating as number) ?? 0,
      activeInstalls: (stats.activeInstalls as number) ?? 0,
    };
  } catch (error) {
    console.error('[getDeveloperStats] Fallback:', error);
    return { totalApps: 0, totalDownloads: 0, totalRevenue: 0, averageRating: 0, activeInstalls: 0 };
  }
}

export async function getAPIUsage(days?: number): Promise<APIUsageRecord[]> {
  try {
    if (isMock()) {
      const { mockGetAPIUsage } = await import('@/lib/mocks/developer.mock');
      return mockGetAPIUsage(days);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: profile } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', user.id)
      .single();

    const meta = (profile?.metadata ?? {}) as Record<string, unknown>;
    const dev = (meta.developer ?? {}) as Record<string, unknown>;
    return (dev.api_usage ?? []) as APIUsageRecord[];
  } catch (error) {
    console.error('[getAPIUsage] Fallback:', error);
    return [];
  }
}
