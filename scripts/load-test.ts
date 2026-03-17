// ── Load Test Script (P-098) ─────────────────────────────────
// Usage: npx tsx scripts/load-test.ts [--base-url URL] [--concurrency N] [--duration-ms N]
//
// Simulates concurrent API requests to validate performance under load.
// For production load testing, use k6 or Artillery with this as a reference.

interface LoadTestConfig {
  baseUrl: string;
  concurrency: number;
  durationMs: number;
}

interface EndpointTest {
  name: string;
  method: 'GET' | 'POST';
  path: string;
  body?: Record<string, unknown>;
  expectedStatus: number;
}

interface TestResult {
  endpoint: string;
  totalRequests: number;
  successCount: number;
  failureCount: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  requestsPerSecond: number;
}

// ── Endpoints ────────────────────────────────────────────────

const ENDPOINTS: EndpointTest[] = [
  { name: 'Health Check', method: 'GET', path: '/api/health', expectedStatus: 200 },
  { name: 'Dashboard', method: 'GET', path: '/api/admin/dashboard', expectedStatus: 200 },
  { name: 'Students List', method: 'GET', path: '/api/students?page=1&limit=20', expectedStatus: 200 },
  { name: 'Classes List', method: 'GET', path: '/api/classes?date=2026-03-17', expectedStatus: 200 },
  { name: 'Financeiro', method: 'GET', path: '/api/financial/summary', expectedStatus: 200 },
  { name: 'Attendance', method: 'GET', path: '/api/attendance/today', expectedStatus: 200 },
  { name: 'Analytics', method: 'GET', path: '/api/analytics/overview', expectedStatus: 200 },
  { name: 'Notifications', method: 'GET', path: '/api/notifications?limit=10', expectedStatus: 200 },
  { name: 'Search', method: 'GET', path: '/api/search?q=silva&limit=5', expectedStatus: 200 },
  { name: 'Audit Log', method: 'GET', path: '/api/audit?page=1&limit=50', expectedStatus: 200 },
];

// ── Helpers ──────────────────────────────────────────────────

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function measureRequest(
  baseUrl: string,
  endpoint: EndpointTest,
): Promise<{ success: boolean; latencyMs: number }> {
  const url = `${baseUrl}${endpoint.path}`;
  const start = performance.now();

  try {
    const res = await fetch(url, {
      method: endpoint.method,
      headers: { 'Content-Type': 'application/json' },
      body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
    });
    const latencyMs = performance.now() - start;
    return { success: res.status === endpoint.expectedStatus, latencyMs };
  } catch {
    const latencyMs = performance.now() - start;
    return { success: false, latencyMs };
  }
}

// ── Runner ───────────────────────────────────────────────────

async function runEndpointTest(
  config: LoadTestConfig,
  endpoint: EndpointTest,
): Promise<TestResult> {
  const latencies: number[] = [];
  let successCount = 0;
  let failureCount = 0;

  const startTime = Date.now();

  while (Date.now() - startTime < config.durationMs) {
    const batch = Array.from({ length: config.concurrency }, () =>
      measureRequest(config.baseUrl, endpoint),
    );

    const results = await Promise.all(batch);
    for (const r of results) {
      latencies.push(r.latencyMs);
      if (r.success) successCount++;
      else failureCount++;
    }
  }

  const sorted = latencies.sort((a, b) => a - b);
  const totalRequests = successCount + failureCount;
  const elapsedSeconds = config.durationMs / 1000;

  return {
    endpoint: endpoint.name,
    totalRequests,
    successCount,
    failureCount,
    avgLatencyMs: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
    p95LatencyMs: Math.round(percentile(sorted, 95)),
    p99LatencyMs: Math.round(percentile(sorted, 99)),
    minLatencyMs: Math.round(sorted[0]),
    maxLatencyMs: Math.round(sorted[sorted.length - 1]),
    requestsPerSecond: Math.round(totalRequests / elapsedSeconds),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name: string, fallback: string) => {
    const idx = args.indexOf(name);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
  };

  const config: LoadTestConfig = {
    baseUrl: getArg('--base-url', 'http://localhost:3000'),
    concurrency: parseInt(getArg('--concurrency', '10'), 10),
    durationMs: parseInt(getArg('--duration-ms', '10000'), 10),
  };

  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║         BlackBelt v2 — Load Test Suite              ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`  Base URL:     ${config.baseUrl}`);
  console.log(`  Concurrency:  ${config.concurrency}`);
  console.log(`  Duration:     ${config.durationMs}ms per endpoint`);
  console.log(`  Endpoints:    ${ENDPOINTS.length}`);
  console.log('');

  const results: TestResult[] = [];

  for (const endpoint of ENDPOINTS) {
    process.stdout.write(`  Testing: ${endpoint.name}...`);
    const result = await runEndpointTest(config, endpoint);
    results.push(result);
    console.log(` ${result.successCount}/${result.totalRequests} ok (avg ${result.avgLatencyMs}ms)`);
  }

  // ── Summary ──────────────────────────────────────────────
  console.log('\n┌─────────────────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ Endpoint              │ Reqs  │ OK    │ Fail │ Avg ms │ P95 ms │ P99 ms │ RPS         │');
  console.log('├─────────────────────────────────────────────────────────────────────────────────────────┤');

  for (const r of results) {
    const name = r.endpoint.padEnd(22);
    const reqs = String(r.totalRequests).padStart(5);
    const ok = String(r.successCount).padStart(5);
    const fail = String(r.failureCount).padStart(4);
    const avg = String(r.avgLatencyMs).padStart(6);
    const p95 = String(r.p95LatencyMs).padStart(6);
    const p99 = String(r.p99LatencyMs).padStart(6);
    const rps = String(r.requestsPerSecond).padStart(11);
    console.log(`│ ${name}│ ${reqs} │ ${ok} │ ${fail} │ ${avg} │ ${p95} │ ${p99} │ ${rps} │`);
  }

  console.log('└─────────────────────────────────────────────────────────────────────────────────────────┘');

  // ── SLA check ────────────────────────────────────────────
  const SLA_P95_MS = 500;
  const failures = results.filter((r) => r.p95LatencyMs > SLA_P95_MS);
  if (failures.length > 0) {
    console.log(`\n⚠ ${failures.length} endpoint(s) exceeded SLA (P95 < ${SLA_P95_MS}ms):`);
    for (const f of failures) {
      console.log(`   - ${f.endpoint}: P95 = ${f.p95LatencyMs}ms`);
    }
    process.exit(1);
  } else {
    console.log(`\n✓ All endpoints within SLA (P95 < ${SLA_P95_MS}ms)`);
  }
}

main().catch((err) => {
  console.error('Load test failed:', err);
  process.exit(1);
});
