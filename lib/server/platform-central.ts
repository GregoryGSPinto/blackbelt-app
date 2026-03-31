import { getAdminClient } from '@/lib/supabase/admin';
import {
  type AIObservabilitySnapshot,
  type BreakpointHeatmapItem,
  type DeviceDistributionItem,
  type DeviceRouteRiskItem,
  type DevicesLayoutSnapshot,
  type ErrorMetricItem,
  type ErrorsPerformanceSnapshot,
  type HealthAcademySnapshot,
  type HealthComponentSnapshot,
  type HealthSecurityAISnapshot,
  type PerformanceMetricItem,
  type PlatformAttentionItem,
  type PlatformCentralSnapshot,
  type PlatformOverview,
  type PlatformScoreCard,
  type PlatformSignalStatus,
  type PlatformTrendPoint,
  type ReleaseRegressionItem,
  type ResolutionDistributionItem,
  type SupportFeedbackComment,
  type SupportFeedbackItem,
  type SupportFeedbackMetrics,
  type SupportFeedbackSnapshot,
} from '@/lib/api/platform-central.service';
import {
  scoreAuthFailures,
  scoreErrorRate,
  scoreLatency,
  scoreRisk,
  scoreSecurity,
  scoreUx,
  summarizeStatuses,
} from '@/lib/platform/scoring';

type ActorContext = {
  userId: string;
  profileId: string;
};

type RawFeedbackItem = {
  id: string;
  academy_id: string | null;
  reporter_user_id: string | null;
  reporter_profile_id: string | null;
  category: SupportFeedbackItem['category'];
  severity: SupportFeedbackItem['severity'];
  status: SupportFeedbackItem['status'];
  title: string;
  description: string;
  route_path: string | null;
  source_page: string | null;
  device_type: SupportFeedbackItem['deviceType'];
  viewport_width: number | null;
  viewport_height: number | null;
  browser_name: string | null;
  os_name: string | null;
  release_version: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  last_activity_at: string;
  created_at: string;
};

type RawComment = {
  id: string;
  item_id: string;
  body: string;
  is_internal: boolean;
  author_profile_id: string | null;
  created_at: string;
};

type RawAssignment = {
  item_id: string;
  assigned_profile_id: string | null;
  active: boolean;
};

type RawProfile = {
  id: string;
  display_name: string;
  role: string;
};

type RawAcademy = {
  id: string;
  name: string;
};

function formatViewport(width: number | null, height: number | null): string {
  if (!width || !height) return 'n/a';
  return `${width}x${height}`;
}

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function scoreCard(value: number, status: PlatformSignalStatus): PlatformScoreCard {
  return { value: round(value), status };
}

async function getSupportFeedbackSnapshot(periodStartIso: string): Promise<SupportFeedbackSnapshot> {
  const admin = getAdminClient();
  const [
    { data: itemRows },
    { data: commentRows },
    { data: assignmentRows },
    { data: academyRows },
    { data: profileRows },
    { data: tagJoinRows },
    { data: tagRows },
  ] = await Promise.all([
    admin
      .from('support_feedback_items')
      .select('id, academy_id, reporter_user_id, reporter_profile_id, category, severity, status, title, description, route_path, source_page, device_type, viewport_width, viewport_height, browser_name, os_name, release_version, first_response_at, resolved_at, last_activity_at, created_at')
      .gte('created_at', periodStartIso)
      .order('created_at', { ascending: false })
      .limit(120),
    admin
      .from('support_feedback_comments')
      .select('id, item_id, body, is_internal, author_profile_id, created_at')
      .order('created_at', { ascending: true }),
    admin
      .from('support_feedback_assignments')
      .select('item_id, assigned_profile_id, active')
      .eq('active', true),
    admin.from('academies').select('id, name'),
    admin.from('profiles').select('id, display_name, role'),
    admin.from('support_feedback_item_tags').select('item_id, tag_id'),
    admin.from('support_feedback_tags').select('id, slug, label'),
  ]);

  const profiles = new Map(((profileRows ?? []) as RawProfile[]).map((profile) => [profile.id, profile]));
  const academies = new Map(((academyRows ?? []) as RawAcademy[]).map((academy) => [academy.id, academy.name]));
  const assignments = new Map(
    ((assignmentRows ?? []) as RawAssignment[])
      .filter((assignment) => assignment.active)
      .map((assignment) => [assignment.item_id, assignment.assigned_profile_id]),
  );
  const tagsById = new Map(((tagRows ?? []) as Array<{ id: string; slug: string; label: string }>).map((tag) => [tag.id, tag.label]));
  const tagMap = new Map<string, string[]>();
  for (const joinRow of (tagJoinRows ?? []) as Array<{ item_id: string; tag_id: string }>) {
    const tagLabel = tagsById.get(joinRow.tag_id);
    if (!tagLabel) continue;
    tagMap.set(joinRow.item_id, [...(tagMap.get(joinRow.item_id) ?? []), tagLabel]);
  }
  const commentsByItem = new Map<string, SupportFeedbackComment[]>();
  for (const comment of (commentRows ?? []) as RawComment[]) {
    const author = comment.author_profile_id ? profiles.get(comment.author_profile_id) : null;
    const parsed: SupportFeedbackComment = {
      id: comment.id,
      body: comment.body,
      isInternal: comment.is_internal,
      authorName: author?.display_name ?? 'Sistema',
      createdAt: comment.created_at,
    };
    commentsByItem.set(comment.item_id, [...(commentsByItem.get(comment.item_id) ?? []), parsed]);
  }

  const items = ((itemRows ?? []) as RawFeedbackItem[]).map((row) => {
    const reporter = row.reporter_profile_id ? profiles.get(row.reporter_profile_id) : null;
    const assigneeProfileId = assignments.get(row.id);
    const assignee = assigneeProfileId ? profiles.get(assigneeProfileId) : null;
    const comments = commentsByItem.get(row.id) ?? [];
    return {
      id: row.id,
      academyId: row.academy_id,
      academyName: row.academy_id ? academies.get(row.academy_id) ?? 'Tenant não identificado' : 'Global',
      reporterName: reporter?.display_name ?? 'Usuário',
      reporterRole: reporter?.role ?? 'desconhecido',
      category: row.category,
      severity: row.severity,
      status: row.status,
      title: row.title,
      description: row.description,
      routePath: row.route_path,
      sourcePage: row.source_page,
      deviceType: row.device_type,
      viewport: formatViewport(row.viewport_width, row.viewport_height),
      browserName: row.browser_name,
      osName: row.os_name,
      releaseVersion: row.release_version,
      tags: tagMap.get(row.id) ?? [],
      assignedTo: assignee?.display_name ?? null,
      commentCount: comments.length,
      lastActivityAt: row.last_activity_at,
      createdAt: row.created_at,
      comments,
    } satisfies SupportFeedbackItem;
  });

  const withFirstResponse = (itemRows ?? []).filter((row) => Boolean((row as RawFeedbackItem).first_response_at)) as RawFeedbackItem[];
  const resolvedRows = (itemRows ?? []).filter((row) => Boolean((row as RawFeedbackItem).resolved_at)) as RawFeedbackItem[];

  const metrics: SupportFeedbackMetrics = {
    total: items.length,
    open: items.filter((item) => item.status === 'new' || item.status === 'triaged').length,
    inProgress: items.filter((item) => item.status === 'in_progress' || item.status === 'waiting_customer').length,
    critical: items.filter((item) => item.severity === 'critical').length,
    resolved: items.filter((item) => item.status === 'resolved' || item.status === 'closed').length,
    avgFirstResponseHours: round(
      withFirstResponse.reduce((sum, row) => (
        sum + ((new Date(row.first_response_at as string).getTime() - new Date(row.created_at).getTime()) / 3600000)
      ), 0) / Math.max(withFirstResponse.length, 1),
      1,
    ),
    avgResolutionHours: round(
      resolvedRows.reduce((sum, row) => (
        sum + ((new Date(row.resolved_at as string).getTime() - new Date(row.created_at).getTime()) / 3600000)
      ), 0) / Math.max(resolvedRows.length, 1),
      1,
    ),
    byCategory: (['feedback', 'complaint', 'suggestion', 'bug', 'question', 'incident', 'praise'] as const).map((category) => ({
      category,
      count: items.filter((item) => item.category === category).length,
    })),
    byStatus: (['new', 'triaged', 'in_progress', 'waiting_customer', 'resolved', 'closed', 'archived'] as const).map((status) => ({
      status,
      count: items.filter((item) => item.status === status).length,
    })),
  };

  return { metrics, items };
}

async function getErrorsPerformanceSnapshot(periodStartIso: string): Promise<ErrorsPerformanceSnapshot> {
  const admin = getAdminClient();
  const [{ data: errorRows }, { data: performanceRows }, { data: rawErrors }] = await Promise.all([
    admin
      .from('platform_error_route_metrics_v')
      .select('*')
      .order('error_count', { ascending: false })
      .limit(20),
    admin
      .from('platform_performance_route_metrics_v')
      .select('*')
      .order('avg_load_time_ms', { ascending: false })
      .limit(20),
    admin
      .from('app_error_events')
      .select('release_version, occurred_at')
      .gte('occurred_at', periodStartIso),
  ]);

  const topErrors = ((errorRows ?? []) as Array<Record<string, unknown>>).map((row) => ({
    routePath: (row.route_path as string) ?? '/unknown',
    deviceType: (row.device_type as ErrorMetricItem['deviceType']) ?? 'unknown',
    releaseVersion: (row.release_version as string) ?? 'unknown',
    errorCount: Number(row.error_count ?? 0),
    criticalCount: Number(row.critical_count ?? 0),
    authFailures: Number(row.auth_failures ?? 0),
    timeoutCount: Number(row.timeout_count ?? 0),
    impactedTenants: Number(row.impacted_tenants ?? 0),
    lastSeenAt: String(row.last_seen_at ?? ''),
  })) satisfies ErrorMetricItem[];

  const slowRoutes = ((performanceRows ?? []) as Array<Record<string, unknown>>).map((row) => ({
    routePath: (row.route_path as string) ?? '/unknown',
    deviceType: (row.device_type as PerformanceMetricItem['deviceType']) ?? 'unknown',
    releaseVersion: (row.release_version as string) ?? 'unknown',
    samples: Number(row.samples ?? 0),
    avgLoadTimeMs: Number(row.avg_load_time_ms ?? 0),
    avgLcpMs: Number(row.avg_lcp_ms ?? 0),
    avgTtfbMs: Number(row.avg_ttfb_ms ?? 0),
    avgApiLatencyMs: Number(row.avg_api_latency_ms ?? 0),
    p95LoadTimeMs: Number(row.p95_load_time_ms ?? 0),
    p95LcpMs: Number(row.p95_lcp_ms ?? 0),
  })) satisfies PerformanceMetricItem[];

  const releaseMap = new Map<string, { errorCount: number; totalLatency: number; samples: number; routes: Set<string> }>();
  for (const row of topErrors) {
    const current = releaseMap.get(row.releaseVersion) ?? { errorCount: 0, totalLatency: 0, samples: 0, routes: new Set<string>() };
    current.errorCount += row.errorCount;
    current.routes.add(row.routePath);
    releaseMap.set(row.releaseVersion, current);
  }
  for (const row of slowRoutes) {
    const current = releaseMap.get(row.releaseVersion) ?? { errorCount: 0, totalLatency: 0, samples: 0, routes: new Set<string>() };
    current.totalLatency += row.avgLoadTimeMs * row.samples;
    current.samples += row.samples;
    current.routes.add(row.routePath);
    releaseMap.set(row.releaseVersion, current);
  }

  const releaseRegressions = Array.from(releaseMap.entries())
    .map(([releaseVersion, current]) => ({
      releaseVersion,
      errorCount: current.errorCount,
      avgLoadTimeMs: current.samples > 0 ? Math.round(current.totalLatency / current.samples) : 0,
      impactedRoutes: current.routes.size,
    }))
    .sort((left, right) => right.errorCount - left.errorCount || right.avgLoadTimeMs - left.avgLoadTimeMs)
    .slice(0, 8) satisfies ReleaseRegressionItem[];

  const totals = {
    errors: topErrors.reduce((sum, item) => sum + item.errorCount, 0),
    authFailures: topErrors.reduce((sum, item) => sum + item.authFailures, 0),
    timeouts: topErrors.reduce((sum, item) => sum + item.timeoutCount, 0),
    regressions: releaseRegressions.filter((release) => release.errorCount > 0).length,
  };

  if (!topErrors.length && rawErrors?.length) {
    totals.errors = rawErrors.length;
  }

  return { totals, topErrors, slowRoutes, releaseRegressions };
}

async function getDevicesLayoutSnapshot(periodStartIso: string): Promise<DevicesLayoutSnapshot> {
  const admin = getAdminClient();
  const [{ data: deviceRows }, { data: rawRiskRows }, { data: routeErrorRows }, { data: routePerfRows }] = await Promise.all([
    admin
      .from('platform_device_layout_metrics_v')
      .select('*')
      .order('snapshot_count', { ascending: false }),
    admin
      .from('app_device_snapshots')
      .select('route_path, device_type, layout_risk_score')
      .gte('captured_at', periodStartIso),
    admin
      .from('platform_error_route_metrics_v')
      .select('*')
      .order('error_count', { ascending: false })
      .limit(40),
    admin
      .from('platform_performance_route_metrics_v')
      .select('*')
      .order('avg_load_time_ms', { ascending: false })
      .limit(40),
  ]);

  const distributionMap = new Map<string, number>();
  const resolutionMap = new Map<string, { count: number; risk: number }>();
  const heatmapMap = new Map<string, BreakpointHeatmapItem>();
  for (const row of (deviceRows ?? []) as Array<Record<string, unknown>>) {
    const deviceType = (row.device_type as DeviceDistributionItem['deviceType']) ?? 'unknown';
    const count = Number(row.snapshot_count ?? 0);
    const breakpoint = String(row.breakpoint ?? 'unknown');
    const resolution = String(row.resolution ?? '0x0');
    const avgLayoutRiskScore = Number(row.avg_layout_risk_score ?? 0);
    distributionMap.set(deviceType, (distributionMap.get(deviceType) ?? 0) + count);
    const existingResolution = resolutionMap.get(resolution) ?? { count: 0, risk: 0 };
    existingResolution.count += count;
    existingResolution.risk += avgLayoutRiskScore * count;
    resolutionMap.set(resolution, existingResolution);
    const heatmapKey = `${deviceType}:${breakpoint}`;
    heatmapMap.set(heatmapKey, {
      breakpoint,
      deviceType,
      count: (heatmapMap.get(heatmapKey)?.count ?? 0) + count,
    });
  }

  const routeRiskMap = new Map<string, DeviceRouteRiskItem>();
  for (const row of (routeErrorRows ?? []) as Array<Record<string, unknown>>) {
    const routePath = (row.route_path as string) ?? '/unknown';
    const deviceType = (row.device_type as DeviceRouteRiskItem['deviceType']) ?? 'unknown';
    const key = `${routePath}:${deviceType}`;
    const current = routeRiskMap.get(key) ?? {
      routePath,
      deviceType,
      errors: 0,
      avgLoadTimeMs: 0,
      layoutRiskScore: 0,
    };
    current.errors += Number(row.error_count ?? 0);
    routeRiskMap.set(key, current);
  }
  for (const row of (routePerfRows ?? []) as Array<Record<string, unknown>>) {
    const routePath = (row.route_path as string) ?? '/unknown';
    const deviceType = (row.device_type as DeviceRouteRiskItem['deviceType']) ?? 'unknown';
    const key = `${routePath}:${deviceType}`;
    const current = routeRiskMap.get(key) ?? {
      routePath,
      deviceType,
      errors: 0,
      avgLoadTimeMs: 0,
      layoutRiskScore: 0,
    };
    current.avgLoadTimeMs = Number(row.avg_load_time_ms ?? 0);
    routeRiskMap.set(key, current);
  }
  for (const row of (rawRiskRows ?? []) as Array<Record<string, unknown>>) {
    const routePath = (row.route_path as string) ?? '/unknown';
    const deviceType = (row.device_type as DeviceRouteRiskItem['deviceType']) ?? 'unknown';
    const key = `${routePath}:${deviceType}`;
    const current = routeRiskMap.get(key) ?? {
      routePath,
      deviceType,
      errors: 0,
      avgLoadTimeMs: 0,
      layoutRiskScore: 0,
    };
    current.layoutRiskScore = Math.max(current.layoutRiskScore, Number(row.layout_risk_score ?? 0));
    routeRiskMap.set(key, current);
  }

  return {
    distribution: Array.from(distributionMap.entries())
      .map(([deviceType, count]) => ({ deviceType: deviceType as DeviceDistributionItem['deviceType'], count }))
      .sort((left, right) => right.count - left.count),
    resolutions: Array.from(resolutionMap.entries())
      .map(([resolution, current]) => ({
        resolution,
        count: current.count,
        avgLayoutRiskScore: current.count > 0 ? round(current.risk / current.count, 1) : 0,
      }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 12) satisfies ResolutionDistributionItem[],
    heatmap: Array.from(heatmapMap.values()).sort((left, right) => right.count - left.count),
    routeRisks: Array.from(routeRiskMap.values())
      .sort((left, right) => {
        const rightWeight = right.errors * 10 + right.avgLoadTimeMs + right.layoutRiskScore * 20;
        const leftWeight = left.errors * 10 + left.avgLoadTimeMs + left.layoutRiskScore * 20;
        return rightWeight - leftWeight;
      })
      .slice(0, 12),
  };
}

async function getHealthSecurityAISnapshot(): Promise<HealthSecurityAISnapshot> {
  const admin = getAdminClient();
  const [{ data: healthRows }, { data: aiRows }] = await Promise.all([
    admin
      .from('platform_health_risk_latest_v')
      .select('*')
      .order('risk_score', { ascending: false }),
    admin
      .from('model_observability_snapshots')
      .select('*')
      .order('snapshot_at', { ascending: false })
      .limit(20),
  ]);

  const latest = ((healthRows ?? []) as Array<Record<string, unknown>>).map((row) => ({
    academyId: String(row.academy_id ?? ''),
    academyName: String(row.academy_name ?? 'Tenant não identificado'),
    overallStatus: (row.overall_status as PlatformSignalStatus) ?? 'unknown',
    riskScore: row.risk_score == null ? null : Number(row.risk_score),
    securityScore: row.security_score == null ? null : Number(row.security_score),
    uxScore: row.ux_score == null ? null : Number(row.ux_score),
    suspiciousLogins: Number(row.suspicious_logins ?? 0),
    authFailures: Number(row.auth_failures ?? 0),
    releaseRegressionPercent: row.release_regression_percent == null ? null : Number(row.release_regression_percent),
    repeatedErrorGrowthPercent: row.repeated_error_growth_percent == null ? null : Number(row.repeated_error_growth_percent),
    snapshotAt: row.snapshot_at ? String(row.snapshot_at) : null,
    components: ((row.components as Array<Record<string, unknown>> | null) ?? []).map((component) => ({
      component: String(component.component ?? 'unknown'),
      status: (component.status as PlatformSignalStatus) ?? 'unknown',
      uptimePercent: component.uptime_percent == null ? null : Number(component.uptime_percent),
      errorRatePercent: component.error_rate_percent == null ? null : Number(component.error_rate_percent),
      latencyMs: component.latency_ms == null ? null : Number(component.latency_ms),
      consecutiveFailures: Number(component.consecutive_failures ?? 0),
      checkedAt: component.checked_at ? String(component.checked_at) : null,
      details: (component.details as Record<string, unknown>) ?? {},
    })) satisfies HealthComponentSnapshot[],
  })) satisfies HealthAcademySnapshot[];

  const vulnerabilities: HealthSecurityAISnapshot['vulnerabilities'] = [];
  for (const academy of latest.slice(0, 8)) {
    if ((academy.releaseRegressionPercent ?? 0) >= 25) {
      vulnerabilities.push({
        title: `Regressão pós-release em ${academy.academyName}`,
        severity: 'high',
        detail: `${round(academy.releaseRegressionPercent ?? 0)}% de crescimento de erro/performance após release.`,
      });
    }
    if (academy.authFailures >= 20 || academy.suspiciousLogins >= 10) {
      vulnerabilities.push({
        title: `Falhas repetidas de login em ${academy.academyName}`,
        severity: academy.suspiciousLogins >= 20 ? 'critical' : 'high',
        detail: `${academy.authFailures} falhas de autenticação e ${academy.suspiciousLogins} sinais suspeitos.`,
      });
    }
  }

  const aiConfiguredRow = ((aiRows ?? []) as Array<Record<string, unknown>>).find((row) => row.status !== 'not_configured');
  const latestAiRow = (aiConfiguredRow ?? (aiRows ?? [])[0] ?? null) as Record<string, unknown> | null;
  const ai: AIObservabilitySnapshot = latestAiRow
    ? {
        configured: latestAiRow.status !== 'not_configured',
        provider: (latestAiRow.provider as string | null) ?? null,
        model: (latestAiRow.model as string | null) ?? null,
        status: (latestAiRow.status as PlatformSignalStatus) ?? 'not_configured',
        avgLatencyMs: latestAiRow.avg_latency_ms == null ? null : Number(latestAiRow.avg_latency_ms),
        requestCount: Number(latestAiRow.request_count ?? 0),
        errorCount: Number(latestAiRow.error_count ?? 0),
        timeoutCount: Number(latestAiRow.timeout_count ?? 0),
        estimatedCost: latestAiRow.estimated_cost == null ? null : Number(latestAiRow.estimated_cost),
      }
    : {
        configured: false,
        provider: null,
        model: null,
        status: 'not_configured',
        avgLatencyMs: null,
        requestCount: 0,
        errorCount: 0,
        timeoutCount: 0,
        estimatedCost: null,
      };

  const overallStatus = summarizeStatuses(latest.map((academy) => academy.overallStatus));

  return { overallStatus, latest, vulnerabilities, ai };
}

function buildAttention(
  overview: {
    topAffectedRoutes: PlatformOverview['topAffectedRoutes'];
    criticalIncidents: number;
    impactedTenants: number;
  },
  support: SupportFeedbackSnapshot,
  errorsPerformance: ErrorsPerformanceSnapshot,
  healthSecurityAI: HealthSecurityAISnapshot,
): PlatformAttentionItem[] {
  const items: PlatformAttentionItem[] = [];
  for (const route of overview.topAffectedRoutes.slice(0, 3)) {
    items.push({
      title: `Rota crítica: ${route.routePath}`,
      detail: `${route.errors} erros e ${route.affectedTenants} tenants afetados.`,
      status: route.errors >= 20 ? 'critical' : 'warning',
      routePath: route.routePath,
    });
  }
  if (support.metrics.critical > 0) {
    items.push({
      title: 'Fila crítica de suporte',
      detail: `${support.metrics.critical} itens críticos pendentes na triagem.`,
      status: support.metrics.critical >= 5 ? 'critical' : 'warning',
    });
  }
  if (errorsPerformance.totals.authFailures > 0) {
    items.push({
      title: 'Falhas de autenticação detectadas',
      detail: `${errorsPerformance.totals.authFailures} falhas no período analisado.`,
      status: scoreAuthFailures(errorsPerformance.totals.authFailures),
    });
  }
  const riskyAcademy = healthSecurityAI.latest.find((academy) => academy.overallStatus === 'critical');
  if (riskyAcademy) {
    items.push({
      title: `Tenant em risco: ${riskyAcademy.academyName}`,
      detail: `Risco ${round(riskyAcademy.riskScore ?? 0)} com ${riskyAcademy.authFailures} falhas de auth.`,
      status: 'critical',
      academyName: riskyAcademy.academyName,
    });
  }
  return items.slice(0, 6);
}

export async function getPlatformCentralSnapshot(periodDays = 30): Promise<PlatformCentralSnapshot> {
  const admin = getAdminClient();
  const since = new Date();
  since.setDate(since.getDate() - periodDays + 1);
  const periodStartIso = since.toISOString();
  const periodStartDate = periodStartIso.slice(0, 10);

  const [
    { data: trendRows },
    { data: incidentRows },
    { data: sessionRows },
    { data: errorAcademyRows },
    support,
    errorsPerformance,
    devicesLayout,
    healthSecurityAI,
  ] = await Promise.all([
    admin
      .from('platform_overview_daily_v')
      .select('*')
      .gte('day', periodStartDate)
      .order('day', { ascending: true }),
    admin
      .from('platform_incidents')
      .select('id, severity, status')
      .gte('started_at', periodStartIso),
    admin
      .from('app_telemetry_sessions')
      .select('user_id, academy_id, last_seen_at')
      .gte('last_seen_at', periodStartIso),
    admin
      .from('app_error_events')
      .select('academy_id')
      .gte('occurred_at', periodStartIso),
    getSupportFeedbackSnapshot(periodStartIso),
    getErrorsPerformanceSnapshot(periodStartIso),
    getDevicesLayoutSnapshot(periodStartIso),
    getHealthSecurityAISnapshot(),
  ]);

  const trend = ((trendRows ?? []) as Array<Record<string, unknown>>).map((row) => ({
    date: String(row.day ?? ''),
    accesses: Number(row.access_count ?? 0),
    activeUsers: Number(row.active_users ?? 0),
    activeTenants: Number(row.active_tenants ?? 0),
    errors: Number(row.error_count ?? 0),
    avgLatencyMs: Number(row.avg_latency_ms ?? 0),
  })) satisfies PlatformTrendPoint[];

  const totalAccesses = trend.reduce((sum, point) => sum + point.accesses, 0);
  const uniqueUsers = new Set(((sessionRows ?? []) as Array<Record<string, unknown>>).map((row) => row.user_id).filter(Boolean)).size;
  const uniqueTenants = new Set(((sessionRows ?? []) as Array<Record<string, unknown>>).map((row) => row.academy_id).filter(Boolean)).size;
  const impactedTenants = new Set(((errorAcademyRows ?? []) as Array<Record<string, unknown>>).map((row) => row.academy_id).filter(Boolean)).size;
  const errorRatePercent = totalAccesses > 0 ? round((errorsPerformance.totals.errors / totalAccesses) * 100, 2) : 0;
  const weightedLatencyBase = errorsPerformance.slowRoutes.reduce((sum, row) => sum + row.avgLoadTimeMs * row.samples, 0);
  const weightedLatencySamples = errorsPerformance.slowRoutes.reduce((sum, row) => sum + row.samples, 0);
  const avgLatencyMs = weightedLatencySamples > 0 ? Math.round(weightedLatencyBase / weightedLatencySamples) : 0;
  const topAffectedRoutes = errorsPerformance.topErrors.slice(0, 5).map((item) => ({
    routePath: item.routePath,
    errors: item.errorCount,
    affectedTenants: item.impactedTenants,
  }));
  const criticalIncidents = ((incidentRows ?? []) as Array<Record<string, unknown>>).filter((row) => row.severity === 'critical' && row.status !== 'resolved' && row.status !== 'closed').length;

  const healthAverage = healthSecurityAI.latest.length
    ? healthSecurityAI.latest.reduce((sum, academy) => sum + (100 - (academy.riskScore ?? 50)), 0) / healthSecurityAI.latest.length
    : 0;
  const securityAverage = healthSecurityAI.latest.length
    ? healthSecurityAI.latest.reduce((sum, academy) => sum + (academy.securityScore ?? 0), 0) / healthSecurityAI.latest.length
    : 0;
  const uxAverage = healthSecurityAI.latest.length
    ? healthSecurityAI.latest.reduce((sum, academy) => sum + (academy.uxScore ?? 0), 0) / healthSecurityAI.latest.length
    : 0;

  const overview: PlatformOverview = {
    generatedAt: new Date().toISOString(),
    totalAccesses,
    activeUsers: uniqueUsers,
    activeTenants: uniqueTenants,
    errorRatePercent,
    avgLatencyMs,
    criticalIncidents,
    impactedTenants,
    topAffectedRoutes,
    healthScore: scoreCard(healthAverage, scoreRisk(100 - healthAverage)),
    securityScore: scoreCard(securityAverage, scoreSecurity(securityAverage)),
    uxScore: scoreCard(uxAverage, scoreUx(uxAverage)),
    trend,
    attention: [],
  };

  overview.attention = buildAttention(
    {
      topAffectedRoutes,
      criticalIncidents,
      impactedTenants,
    },
    support,
    errorsPerformance,
    healthSecurityAI,
  );

  overview.healthScore.status = scoreRisk(100 - overview.healthScore.value);
  overview.securityScore.status = scoreSecurity(overview.securityScore.value);
  overview.uxScore.status = summarizeStatuses([
    scoreUx(overview.uxScore.value),
    scoreLatency(avgLatencyMs),
    scoreErrorRate(errorRatePercent),
  ]);

  return {
    overview,
    support,
    errorsPerformance: {
      ...errorsPerformance,
      releaseRegressions: errorsPerformance.releaseRegressions.map((release) => ({
        ...release,
        errorCount: release.errorCount,
      })),
    },
    devicesLayout,
    healthSecurityAI,
  };
}

export async function updateSupportFeedbackItem(
  itemId: string,
  payload: {
    status?: SupportFeedbackItem['status'];
    severity?: SupportFeedbackItem['severity'];
    assignedProfileId?: string | null;
    tagSlugs?: string[];
  },
  actor: ActorContext,
): Promise<SupportFeedbackItem> {
  const admin = getAdminClient();
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  };
  if (payload.status) {
    updatePayload.status = payload.status;
    if (payload.status === 'resolved' || payload.status === 'closed') {
      updatePayload.resolved_at = new Date().toISOString();
    }
  }
  if (payload.severity) updatePayload.severity = payload.severity;

  await admin.from('support_feedback_items').update(updatePayload).eq('id', itemId);

  if (payload.assignedProfileId !== undefined) {
    await admin
      .from('support_feedback_assignments')
      .update({
        active: false,
        unassigned_at: new Date().toISOString(),
      })
      .eq('item_id', itemId)
      .eq('active', true);

    if (payload.assignedProfileId) {
      await admin.from('support_feedback_assignments').insert({
        item_id: itemId,
        assigned_profile_id: payload.assignedProfileId,
        assigned_by_profile_id: actor.profileId,
        active: true,
      });
    }
  }

  if (payload.tagSlugs) {
    const normalizedSlugs = payload.tagSlugs
      .map((slug) => slug.trim().toLowerCase())
      .filter(Boolean);

    for (const slug of normalizedSlugs) {
      await admin
        .from('support_feedback_tags')
        .upsert({ slug, label: slug.replace(/-/g, ' ') }, { onConflict: 'slug' });
    }

    const { data: tagRows } = await admin
      .from('support_feedback_tags')
      .select('id, slug')
      .in('slug', normalizedSlugs);

    await admin.from('support_feedback_item_tags').delete().eq('item_id', itemId);
    if (tagRows?.length) {
      await admin.from('support_feedback_item_tags').insert(
        tagRows.map((row) => ({
          item_id: itemId,
          tag_id: row.id,
        })),
      );
    }
  }

  const snapshot = await getSupportFeedbackSnapshot('1970-01-01T00:00:00.000Z');
  const updatedItem = snapshot.items.find((item) => item.id === itemId);
  if (!updatedItem) {
    throw new Error('Item de suporte não encontrado após atualização.');
  }
  return updatedItem;
}

export async function createSupportFeedbackComment(
  itemId: string,
  body: string,
  isInternal: boolean,
  actor: ActorContext,
): Promise<SupportFeedbackComment> {
  const admin = getAdminClient();
  const { data: comment, error } = await admin
    .from('support_feedback_comments')
    .insert({
      item_id: itemId,
      author_user_id: actor.userId,
      author_profile_id: actor.profileId,
      is_internal: isInternal,
      body,
    })
    .select('id, item_id, body, is_internal, author_profile_id, created_at')
    .single();

  if (error || !comment) {
    throw error ?? new Error('Falha ao criar comentário interno.');
  }

  const { data: currentItem } = await admin
    .from('support_feedback_items')
    .select('first_response_at')
    .eq('id', itemId)
    .single();

  const nextUpdate: Record<string, unknown> = {
    last_activity_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (isInternal && !currentItem?.first_response_at) {
    nextUpdate.first_response_at = new Date().toISOString();
  }

  await admin.from('support_feedback_items').update(nextUpdate).eq('id', itemId);

  const { data: profile } = await admin
    .from('profiles')
    .select('display_name')
    .eq('id', actor.profileId)
    .single();

  return {
    id: comment.id,
    body: comment.body,
    isInternal: comment.is_internal,
    authorName: profile?.display_name ?? 'Super Admin',
    createdAt: comment.created_at,
  };
}
