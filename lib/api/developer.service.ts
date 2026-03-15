import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
    const res = await fetch('/api/v1/developer/profile');
    return res.json();
  } catch (error) { handleServiceError(error, 'developer.profile'); }
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
    const res = await fetch('/api/v1/developer/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  } catch (error) { handleServiceError(error, 'developer.create'); }
}

export async function getSubmittedApps(): Promise<DeveloperApp[]> {
  try {
    if (isMock()) {
      const { mockGetSubmittedApps } = await import('@/lib/mocks/developer.mock');
      return mockGetSubmittedApps();
    }
    const res = await fetch('/api/v1/developer/apps');
    return res.json();
  } catch (error) { handleServiceError(error, 'developer.apps'); }
}

export async function submitAppForReview(appId: string): Promise<DeveloperApp> {
  try {
    if (isMock()) {
      const { mockSubmitAppForReview } = await import('@/lib/mocks/developer.mock');
      return mockSubmitAppForReview(appId);
    }
    const res = await fetch(`/api/v1/developer/apps/${appId}/submit`, { method: 'POST' });
    return res.json();
  } catch (error) { handleServiceError(error, 'developer.submitApp'); }
}

export async function getDeveloperStats(): Promise<DeveloperStats> {
  try {
    if (isMock()) {
      const { mockGetDeveloperStats } = await import('@/lib/mocks/developer.mock');
      return mockGetDeveloperStats();
    }
    const res = await fetch('/api/v1/developer/stats');
    return res.json();
  } catch (error) { handleServiceError(error, 'developer.stats'); }
}

export async function getAPIUsage(days?: number): Promise<APIUsageRecord[]> {
  try {
    if (isMock()) {
      const { mockGetAPIUsage } = await import('@/lib/mocks/developer.mock');
      return mockGetAPIUsage(days);
    }
    const res = await fetch(`/api/v1/developer/api-usage?days=${days ?? 30}`);
    return res.json();
  } catch (error) { handleServiceError(error, 'developer.apiUsage'); }
}
