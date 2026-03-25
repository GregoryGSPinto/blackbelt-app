import { isMock } from '@/lib/env';

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
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Query recent error events from telemetry_events
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: errorEvents, error: evErr } = await supabase
        .from('telemetry_events')
        .select('id, event_type, data, severity, created_at')
        .in('severity', ['error', 'critical'])
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false })
        .limit(50);
      if (evErr) {
        console.error('[getSystemStatus] telemetry_events query error:', evErr.message);
      }

      // Count total events in last 24h for error rate
      const { count: totalEvents } = await supabase
        .from('telemetry_events')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo);

      // Count active sessions (active users)
      const { count: activeUsers } = await supabase
        .from('telemetry_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      // Aggregate recent errors by message
      const errorMap: Record<string, { count: number; lastSeen: string; level: 'error' | 'warning' }> = {};
      for (const ev of (errorEvents ?? []) as Array<{ id: string; data: { message?: string }; severity: string; created_at: string }>) {
        const msg = ev.data?.message ?? ev.severity;
        if (!errorMap[msg]) {
          errorMap[msg] = { count: 0, lastSeen: ev.created_at, level: ev.severity === 'critical' ? 'error' : 'warning' };
        }
        errorMap[msg].count++;
      }

      const recentErrors = Object.entries(errorMap).slice(0, 10).map(([message, info], idx) => ({
        id: `err-${idx}`,
        message,
        count: info.count,
        lastSeen: info.lastSeen,
        level: info.level as 'error' | 'warning',
      }));

      const errorCount = (errorEvents ?? []).length;
      const errorRate = totalEvents && totalEvents > 0 ? Math.round((errorCount / totalEvents) * 100 * 100) / 100 : 0;
      const healthStatus: 'healthy' | 'degraded' | 'unhealthy' = errorRate > 10 ? 'unhealthy' : errorRate > 2 ? 'degraded' : 'healthy';

      return {
        uptime: 99.9,
        version: process.env.NEXT_PUBLIC_APP_VERSION ?? '2.0.0',
        healthStatus,
        avgResponseTime: 0,
        errorRate,
        activeUsers: activeUsers ?? 0,
        recentErrors,
        uptimeHistory: [],
      };
    } catch (err) {
      console.error('[observability.getSystemStatus] error, using fallback:', err);
      return { uptime: 0, version: '', healthStatus: 'unhealthy' as const, avgResponseTime: 0, errorRate: 0, activeUsers: 0, recentErrors: [], uptimeHistory: [] };
    }
  } catch (error) {
    console.error('[getSystemStatus] Fallback:', error);
    return { uptime: 0, version: '', healthStatus: 'unhealthy', avgResponseTime: 0, errorRate: 0, activeUsers: 0, recentErrors: [], uptimeHistory: [] };
  }
}
