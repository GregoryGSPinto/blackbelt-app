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

  const health: HealthCheck = {
    status: 'healthy',
    version: '2.0.0',
    uptime,
    timestamp: new Date().toISOString(),
    checks: {
      app: { status: 'ok', latencyMs: 1 },
      database: { status: 'mock', latencyMs: 0 },
      memory: {
        usedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        totalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    },
  };

  return NextResponse.json(health);
}
