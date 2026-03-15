import { NextResponse } from 'next/server';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  checks: {
    app: { status: 'ok' | 'error'; latencyMs: number };
    database: { status: 'ok' | 'error' | 'mock'; latencyMs: number };
    memory: { usedMB: number; totalMB: number };
  };
}

const START_TIME = Date.now();

export async function GET() {
  const now = Date.now();
  const uptime = Math.floor((now - START_TIME) / 1000);

  let dbStatus: 'ok' | 'error' | 'mock' = 'mock';
  let dbLatency = 0;

  const isMock = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isMock && supabaseUrl && supabaseKey) {
    const dbStart = Date.now();
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });
      dbStatus = res.ok ? 'ok' : 'error';
    } catch {
      dbStatus = 'error';
    }
    dbLatency = Date.now() - dbStart;
  }

  const overallStatus = dbStatus === 'error' ? 'degraded' : 'healthy';

  const health: HealthCheck = {
    status: overallStatus,
    version: '2.0.0',
    uptime,
    timestamp: new Date().toISOString(),
    checks: {
      app: { status: 'ok', latencyMs: 1 },
      database: { status: dbStatus, latencyMs: dbLatency },
      memory: {
        usedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        totalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    },
  };

  return NextResponse.json(health);
}
