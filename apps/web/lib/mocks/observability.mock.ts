import type { SystemStatus } from '@/lib/api/observability.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

export async function mockGetSystemStatus(): Promise<SystemStatus> {
  await delay();
  return {
    uptime: 864000,
    version: '2.0.0',
    healthStatus: 'healthy',
    avgResponseTime: 145,
    errorRate: 0.3,
    activeUsers: 42,
    recentErrors: [
      { id: 'err-1', message: 'PaymentGateway timeout on webhook delivery', count: 3, lastSeen: '2025-07-10T14:30:00Z', level: 'warning' },
      { id: 'err-2', message: 'Email channel: rate limit exceeded for Resend', count: 1, lastSeen: '2025-07-10T12:00:00Z', level: 'warning' },
      { id: 'err-3', message: 'Supabase connection pool exhausted briefly', count: 1, lastSeen: '2025-07-09T22:00:00Z', level: 'error' },
    ],
    uptimeHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
      uptime: 99.5 + Math.random() * 0.5,
    })),
  };
}
