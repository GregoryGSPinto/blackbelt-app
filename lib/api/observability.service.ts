import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export interface SystemStatus {
  uptime: number;
  version: string;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
  avgResponseTime: number;
  errorRate: number;
  activeUsers: number;
  recentErrors: { id: string; message: string; count: number; lastSeen: string; level: 'error' | 'warning' }[];
  uptimeHistory: { date: string; uptime: number }[];
}

export async function getSystemStatus(): Promise<SystemStatus> {
  try {
    if (isMock()) {
      const { mockGetSystemStatus } = await import('@/lib/mocks/observability.mock');
      return mockGetSystemStatus();
    }
    try {
      const res = await fetch('/api/system/status');
      return res.json();
    } catch {
      console.warn('[observability.getSystemStatus] API not available, using fallback');
      return {} as SystemStatus;
    }
  } catch (error) { handleServiceError(error, 'observability.status'); }
}
