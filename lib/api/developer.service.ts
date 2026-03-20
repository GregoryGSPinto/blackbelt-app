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
    try {
      const res = await fetch('/api/v1/developer/profile');
      return res.json();
    } catch {
      console.warn('[developer.getDeveloperProfile] API not available, using mock fallback');
      const { mockGetDeveloperProfile } = await import('@/lib/mocks/developer.mock');
      return mockGetDeveloperProfile();
    }
  } catch (error) {
    console.warn('[getDeveloperProfile] Fallback:', error);
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
    try {
      const res = await fetch('/api/v1/developer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    } catch {
      console.warn('[developer.createDeveloperAccount] API not available, using mock fallback');
      const { mockCreateDeveloperAccount } = await import('@/lib/mocks/developer.mock');
      return mockCreateDeveloperAccount(data);
    }
  } catch (error) {
    console.warn('[createDeveloperAccount] Fallback:', error);
    return { id: '', name: data.name, email: data.email, company: data.company, website: data.website, verified: false, createdAt: '' };
  }
}

export async function getSubmittedApps(): Promise<DeveloperApp[]> {
  try {
    if (isMock()) {
      const { mockGetSubmittedApps } = await import('@/lib/mocks/developer.mock');
      return mockGetSubmittedApps();
    }
    try {
      const res = await fetch('/api/v1/developer/apps');
      return res.json();
    } catch {
      console.warn('[developer.getSubmittedApps] API not available, using mock fallback');
      const { mockGetSubmittedApps } = await import('@/lib/mocks/developer.mock');
      return mockGetSubmittedApps();
    }
  } catch (error) {
    console.warn('[getSubmittedApps] Fallback:', error);
    return [];
  }
}

export async function submitAppForReview(appId: string): Promise<DeveloperApp> {
  try {
    if (isMock()) {
      const { mockSubmitAppForReview } = await import('@/lib/mocks/developer.mock');
      return mockSubmitAppForReview(appId);
    }
    try {
      const res = await fetch(`/api/v1/developer/apps/${appId}/submit`, { method: 'POST' });
      return res.json();
    } catch {
      console.warn('[developer.submitAppForReview] API not available, using mock fallback');
      const { mockSubmitAppForReview } = await import('@/lib/mocks/developer.mock');
      return mockSubmitAppForReview(appId);
    }
  } catch (error) {
    console.warn('[submitAppForReview] Fallback:', error);
    return { id: appId, name: '', status: 'draft', version: '', submittedAt: null, category: '' };
  }
}

export async function getDeveloperStats(): Promise<DeveloperStats> {
  try {
    if (isMock()) {
      const { mockGetDeveloperStats } = await import('@/lib/mocks/developer.mock');
      return mockGetDeveloperStats();
    }
    try {
      const res = await fetch('/api/v1/developer/stats');
      return res.json();
    } catch {
      console.warn('[developer.getDeveloperStats] API not available, using mock fallback');
      const { mockGetDeveloperStats } = await import('@/lib/mocks/developer.mock');
      return mockGetDeveloperStats();
    }
  } catch (error) {
    console.warn('[getDeveloperStats] Fallback:', error);
    return { totalApps: 0, totalDownloads: 0, totalRevenue: 0, averageRating: 0, activeInstalls: 0 };
  }
}

export async function getAPIUsage(days?: number): Promise<APIUsageRecord[]> {
  try {
    if (isMock()) {
      const { mockGetAPIUsage } = await import('@/lib/mocks/developer.mock');
      return mockGetAPIUsage(days);
    }
    try {
      const res = await fetch(`/api/v1/developer/api-usage?days=${days ?? 30}`);
      return res.json();
    } catch {
      console.warn('[developer.getAPIUsage] API not available, using mock fallback');
      const { mockGetAPIUsage } = await import('@/lib/mocks/developer.mock');
      return mockGetAPIUsage(days);
    }
  } catch (error) {
    console.warn('[getAPIUsage] Fallback:', error);
    return [];
  }
}
