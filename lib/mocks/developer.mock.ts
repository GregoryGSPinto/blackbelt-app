import type {
  DeveloperProfile,
  DeveloperApp,
  DeveloperStats,
  APIUsageRecord,
} from '@/lib/api/developer.service';

const profile: DeveloperProfile = {
  id: 'dev-001',
  name: 'Carlos Silva',
  email: 'carlos@fightmetrics.com',
  company: 'FightMetrics',
  website: 'https://fightmetrics.com',
  verified: true,
  createdAt: '2025-03-10T10:00:00Z',
};

const apps: DeveloperApp[] = [
  {
    id: 'app-training-tracker',
    name: 'Training Tracker Pro',
    status: 'approved',
    version: '2.0.1',
    submittedAt: '2025-06-01T12:00:00Z',
    category: 'analytics',
  },
  {
    id: 'app-competition-manager',
    name: 'Competition Manager',
    status: 'in_review',
    version: '1.3.0',
    submittedAt: '2025-11-20T09:00:00Z',
    category: 'automation',
  },
];

export function mockGetDeveloperProfile(): DeveloperProfile {
  return profile;
}

export function mockCreateDeveloperAccount(data: {
  name: string;
  email: string;
  company: string;
  website: string;
}): DeveloperProfile {
  return {
    id: `dev-${Date.now()}`,
    ...data,
    verified: false,
    createdAt: new Date().toISOString(),
  };
}

export function mockGetSubmittedApps(): DeveloperApp[] {
  return apps;
}

export function mockSubmitAppForReview(appId: string): DeveloperApp {
  const app = apps.find((a) => a.id === appId);
  if (!app) throw new Error('App not found');
  return { ...app, status: 'in_review', submittedAt: new Date().toISOString() };
}

export function mockGetDeveloperStats(): DeveloperStats {
  return {
    totalApps: 2,
    totalDownloads: 1120,
    totalRevenue: 8940.50,
    averageRating: 4.55,
    activeInstalls: 487,
  };
}

export function mockGetAPIUsage(days?: number): APIUsageRecord[] {
  const count = days ?? 30;
  const records: APIUsageRecord[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    records.push({
      date: date.toISOString().split('T')[0],
      requests: Math.floor(Math.random() * 5000) + 500,
      errors: Math.floor(Math.random() * 20),
      latencyP50: Math.floor(Math.random() * 50) + 10,
      latencyP99: Math.floor(Math.random() * 200) + 100,
    });
  }
  return records;
}
