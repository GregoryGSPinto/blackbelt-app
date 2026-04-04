import { logServiceError } from '@/lib/api/errors';

export type PlatformSignalStatus = 'healthy' | 'warning' | 'critical' | 'unknown' | 'not_configured';
export type PlatformDeviceType = 'desktop' | 'tablet' | 'mobile' | 'tv' | 'bot' | 'unknown';
export type SupportFeedbackCategory = 'feedback' | 'complaint' | 'suggestion' | 'bug' | 'question' | 'incident' | 'praise';
export type PlatformSeverity = 'low' | 'medium' | 'high' | 'critical';
export type PlatformWorkflowStatus = 'new' | 'triaged' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed' | 'archived';

export interface PlatformTrendPoint {
  date: string;
  accesses: number;
  activeUsers: number;
  activeTenants: number;
  errors: number;
  avgLatencyMs: number;
}

export interface PlatformAttentionItem {
  title: string;
  detail: string;
  status: PlatformSignalStatus;
  routePath?: string;
  academyName?: string;
}

export interface PlatformScoreCard {
  value: number;
  status: PlatformSignalStatus;
}

export interface PlatformOverview {
  generatedAt: string;
  totalAccesses: number;
  activeUsers: number;
  activeTenants: number;
  errorRatePercent: number;
  avgLatencyMs: number;
  criticalIncidents: number;
  impactedTenants: number;
  topAffectedRoutes: Array<{ routePath: string; errors: number; affectedTenants: number }>;
  healthScore: PlatformScoreCard;
  securityScore: PlatformScoreCard;
  uxScore: PlatformScoreCard;
  trend: PlatformTrendPoint[];
  attention: PlatformAttentionItem[];
}

export interface SupportFeedbackComment {
  id: string;
  body: string;
  isInternal: boolean;
  authorName: string;
  createdAt: string;
}

export interface SupportFeedbackItem {
  id: string;
  academyId: string | null;
  academyName: string;
  reporterName: string;
  reporterRole: string;
  category: SupportFeedbackCategory;
  severity: PlatformSeverity;
  status: PlatformWorkflowStatus;
  title: string;
  description: string;
  routePath: string | null;
  sourcePage: string | null;
  deviceType: PlatformDeviceType;
  viewport: string;
  browserName: string | null;
  osName: string | null;
  releaseVersion: string | null;
  tags: string[];
  assignedTo: string | null;
  commentCount: number;
  lastActivityAt: string;
  createdAt: string;
  comments: SupportFeedbackComment[];
}

export interface SupportFeedbackMetrics {
  total: number;
  open: number;
  inProgress: number;
  critical: number;
  resolved: number;
  avgFirstResponseHours: number;
  avgResolutionHours: number;
  byCategory: Array<{ category: SupportFeedbackCategory; count: number }>;
  byStatus: Array<{ status: PlatformWorkflowStatus; count: number }>;
}

export interface SupportFeedbackSnapshot {
  metrics: SupportFeedbackMetrics;
  items: SupportFeedbackItem[];
}

export interface ErrorMetricItem {
  routePath: string;
  deviceType: PlatformDeviceType;
  releaseVersion: string;
  errorCount: number;
  criticalCount: number;
  authFailures: number;
  timeoutCount: number;
  impactedTenants: number;
  lastSeenAt: string;
}

export interface PerformanceMetricItem {
  routePath: string;
  deviceType: PlatformDeviceType;
  releaseVersion: string;
  samples: number;
  avgLoadTimeMs: number;
  avgLcpMs: number;
  avgTtfbMs: number;
  avgApiLatencyMs: number;
  p95LoadTimeMs: number;
  p95LcpMs: number;
}

export interface ReleaseRegressionItem {
  releaseVersion: string;
  errorCount: number;
  avgLoadTimeMs: number;
  impactedRoutes: number;
}

export interface ErrorsPerformanceSnapshot {
  totals: {
    errors: number;
    authFailures: number;
    timeouts: number;
    regressions: number;
  };
  topErrors: ErrorMetricItem[];
  slowRoutes: PerformanceMetricItem[];
  releaseRegressions: ReleaseRegressionItem[];
}

export interface DeviceDistributionItem {
  deviceType: PlatformDeviceType;
  count: number;
}

export interface ResolutionDistributionItem {
  resolution: string;
  count: number;
  avgLayoutRiskScore: number;
}

export interface BreakpointHeatmapItem {
  breakpoint: string;
  deviceType: PlatformDeviceType;
  count: number;
}

export interface DeviceRouteRiskItem {
  routePath: string;
  deviceType: PlatformDeviceType;
  errors: number;
  avgLoadTimeMs: number;
  layoutRiskScore: number;
}

export interface DevicesLayoutSnapshot {
  distribution: DeviceDistributionItem[];
  resolutions: ResolutionDistributionItem[];
  heatmap: BreakpointHeatmapItem[];
  routeRisks: DeviceRouteRiskItem[];
}

export interface HealthComponentSnapshot {
  component: string;
  status: PlatformSignalStatus;
  uptimePercent: number | null;
  errorRatePercent: number | null;
  latencyMs: number | null;
  consecutiveFailures: number;
  checkedAt: string | null;
  details: Record<string, unknown>;
}

export interface HealthAcademySnapshot {
  academyId: string;
  academyName: string;
  overallStatus: PlatformSignalStatus;
  riskScore: number | null;
  securityScore: number | null;
  uxScore: number | null;
  suspiciousLogins: number;
  authFailures: number;
  releaseRegressionPercent: number | null;
  repeatedErrorGrowthPercent: number | null;
  snapshotAt: string | null;
  components: HealthComponentSnapshot[];
}

export interface VulnerabilitySignal {
  title: string;
  severity: PlatformSeverity;
  detail: string;
}

export interface AIObservabilitySnapshot {
  configured: boolean;
  provider: string | null;
  model: string | null;
  status: PlatformSignalStatus;
  avgLatencyMs: number | null;
  requestCount: number;
  errorCount: number;
  timeoutCount: number;
  estimatedCost: number | null;
}

export interface HealthSecurityAISnapshot {
  overallStatus: PlatformSignalStatus;
  latest: HealthAcademySnapshot[];
  vulnerabilities: VulnerabilitySignal[];
  ai: AIObservabilitySnapshot;
}

export interface PlatformCentralSnapshot {
  overview: PlatformOverview;
  support: SupportFeedbackSnapshot;
  errorsPerformance: ErrorsPerformanceSnapshot;
  devicesLayout: DevicesLayoutSnapshot;
  healthSecurityAI: HealthSecurityAISnapshot;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Falha ao carregar Central da Plataforma');
  }
  return response.json() as Promise<T>;
}

export async function getPlatformCentralSnapshot(periodDays = 30): Promise<PlatformCentralSnapshot> {
  try {
    const response = await fetch(`/api/superadmin/platform-central?periodDays=${periodDays}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    return parseResponse<PlatformCentralSnapshot>(response);
  } catch (error) {
    logServiceError(error, 'platform-central');
    throw error;
  }
}

export async function updatePlatformFeedbackItem(
  itemId: string,
  payload: {
    status?: PlatformWorkflowStatus;
    severity?: PlatformSeverity;
    assignedProfileId?: string | null;
    tagSlugs?: string[];
  },
): Promise<SupportFeedbackItem> {
  try {
    const response = await fetch('/api/superadmin/platform-central', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, ...payload }),
    });
    return parseResponse<SupportFeedbackItem>(response);
  } catch (error) {
    logServiceError(error, 'platform-central');
    throw error;
  }
}

export async function addPlatformFeedbackComment(
  itemId: string,
  body: string,
  isInternal: boolean,
): Promise<SupportFeedbackComment> {
  try {
    const response = await fetch('/api/superadmin/platform-central', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, body, isInternal }),
    });
    return parseResponse<SupportFeedbackComment>(response);
  } catch (error) {
    logServiceError(error, 'platform-central');
    throw error;
  }
}
