import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

// ──────────────────────────────────────────────────────────────
// TYPES — Sessions
// ──────────────────────────────────────────────────────────────

export interface ActiveSession {
  id: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'professor' | 'aluno_adulto' | 'aluno_teen' | 'responsavel' | 'recepcao';
  academyId: string;
  academyName: string;
  currentPage: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  deviceModel: string;
  os: string;
  browser: string;
  ip: string;
  city: string;
  startedAt: string;
  lastActivityAt: string;
  pagesViewed: number;
  screenResolution: string;
  connectionType: string;
}

export interface SessionSummary {
  id: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'professor' | 'aluno_adulto' | 'aluno_teen' | 'responsavel' | 'recepcao';
  academyId: string;
  academyName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  deviceModel: string;
  os: string;
  browser: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  pagesViewed: number;
  city: string;
}

export interface SessionPageVisit {
  path: string;
  timestamp: string;
  loadTimeMs: number;
}

export interface SessionPerformanceMetrics {
  avgLCP: number;
  avgFCP: number;
  avgCLS: number;
  avgTTFB: number;
}

export interface SessionDetail {
  id: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'professor' | 'aluno_adulto' | 'aluno_teen' | 'responsavel' | 'recepcao';
  academyId: string;
  academyName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  deviceModel: string;
  os: string;
  browser: string;
  ip: string;
  city: string;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  pagesViewed: number;
  screenResolution: string;
  connectionType: string;
  pageHistory: SessionPageVisit[];
  errors: SessionErrorEntry[];
  performanceMetrics: SessionPerformanceMetrics;
}

export interface SessionErrorEntry {
  id: string;
  message: string;
  severity: 'critical' | 'error' | 'warning';
  timestamp: string;
  page: string;
}

export interface SessionFilter {
  role?: string;
  academyId?: string;
  deviceType?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ──────────────────────────────────────────────────────────────
// TYPES — Errors
// ──────────────────────────────────────────────────────────────

export interface JSError {
  id: string;
  severity: 'critical' | 'error' | 'warning';
  message: string;
  stack: string;
  page: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  affectedUsers: number;
  affectedSessions: number;
  browser: string;
  os: string;
  resolved: boolean;
}

export interface APIError {
  id: string;
  type: 'timeout' | 'rls_denied' | 'not_found';
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  statusCode: number;
  message: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  avgResponseTimeMs: number;
  affectedUsers: number;
}

export interface ErrorSummary {
  jsErrors: JSError[];
  apiErrors: APIError[];
  totalCritical: number;
  totalError: number;
  totalWarning: number;
  totalApiErrors: number;
  errorRate: number;
  errorsLast1h: number;
  errorsLast24h: number;
}

export interface PageErrorInfo {
  page: string;
  jsErrors: number;
  apiErrors: number;
  totalErrors: number;
  criticalCount: number;
  errorRate: number;
}

export interface ErrorTrendPoint {
  hour: string;
  critical: number;
  error: number;
  warning: number;
  total: number;
}

// ──────────────────────────────────────────────────────────────
// TYPES — Performance
// ──────────────────────────────────────────────────────────────

export interface PerformanceOverview {
  avgLCP: number;
  avgFCP: number;
  avgCLS: number;
  avgTTFB: number;
  avgFID: number;
  p75LCP: number;
  p75FCP: number;
  p75CLS: number;
  p95LCP: number;
  p95FCP: number;
  p95CLS: number;
  totalPageLoads: number;
  goodLCP: number;
  needsImprovementLCP: number;
  poorLCP: number;
  goodFCP: number;
  needsImprovementFCP: number;
  poorFCP: number;
  goodCLS: number;
  needsImprovementCLS: number;
  poorCLS: number;
}

export interface PagePerformance {
  page: string;
  avgLCP: number;
  avgFCP: number;
  avgCLS: number;
  avgTTFB: number;
  loadCount: number;
  errorRate: number;
}

export interface DevicePerformance {
  deviceType: 'mobile' | 'desktop' | 'tablet';
  avgLCP: number;
  avgFCP: number;
  avgCLS: number;
  avgTTFB: number;
  sampleSize: number;
  topModel: string;
}

export interface PerformanceTrendPoint {
  date: string;
  avgLCP: number;
  avgFCP: number;
  avgCLS: number;
  p75LCP: number;
  totalPageLoads: number;
}

// ──────────────────────────────────────────────────────────────
// TYPES — Devices
// ──────────────────────────────────────────────────────────────

export interface DeviceBreakdownSubItem {
  label: string;
  percentage: number;
  count: number;
}

export interface DeviceBreakdownItem {
  type: 'mobile' | 'desktop' | 'tablet';
  percentage: number;
  count: number;
  subBreakdown: DeviceBreakdownSubItem[];
}

export interface BreakdownItem {
  label: string;
  percentage: number;
  count: number;
}

export interface DeviceModelInfo {
  model: string;
  count: number;
  percentage: number;
  avgLCP: number;
  avgFCP: number;
  avgCLS: number;
  os: string;
  type: 'mobile' | 'desktop' | 'tablet';
}

export interface ConnectionInfo {
  type: string;
  percentage: number;
  count: number;
  avgLatencyMs: number;
  avgLCP: number;
}

// ──────────────────────────────────────────────────────────────
// TYPES — Tickets
// ──────────────────────────────────────────────────────────────

export interface TicketMessage {
  id: string;
  from: 'user' | 'support' | 'system';
  userName: string;
  text: string;
  timestamp: string;
}

export interface TicketCreator {
  userId: string;
  userName: string;
  userRole: string;
  academyName: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'bug' | 'question' | 'feature_request' | 'account' | 'billing';
  createdBy: TicketCreator;
  assignedTo: string | null;
  academyId: string;
  academyName: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  messages: TicketMessage[];
}

export interface CreateTicketDTO {
  subject: string;
  description: string;
  priority: string;
  category: string;
}

export interface TicketFilter {
  status?: string;
  priority?: string;
  category?: string;
  academyId?: string;
}

export interface TicketCategoryCount {
  category: string;
  count: number;
}

export interface TicketPriorityCount {
  priority: string;
  count: number;
}

export interface TicketMetrics {
  totalOpen: number;
  totalInProgress: number;
  totalResolved: number;
  totalAll: number;
  avgResolutionTimeHours: number;
  avgFirstResponseTimeMinutes: number;
  satisfactionScore: number;
  ticketsLast24h: number;
  ticketsLast7d: number;
  ticketsLast30d: number;
  byCategory: TicketCategoryCount[];
  byPriority: TicketPriorityCount[];
}

// ──────────────────────────────────────────────────────────────
// TYPES — Engagement
// ──────────────────────────────────────────────────────────────

export interface EngagementOverview {
  dau: number;
  wau: number;
  mau: number;
  dauWauRatio: number;
  dauMauRatio: number;
  avgSessionDurationMinutes: number;
  avgPagesPerSession: number;
  bounceRate: number;
  avgSessionsPerUser: number;
  totalSessions24h: number;
  totalPageViews24h: number;
  newUsers7d: number;
  returningUsers7d: number;
}

export interface PagePopularityItem {
  page: string;
  views: number;
  uniqueUsers: number;
  avgTimeOnPageSeconds: number;
  bounceRate: number;
  exitRate: number;
}

export interface FeatureUsageItem {
  feature: string;
  usageCount: number;
  uniqueUsers: number;
  category: string;
  trend: 'up' | 'down' | 'stable';
}

export interface PeakHourItem {
  hour: number;
  sessions: number;
  pageViews: number;
}

export interface RetentionItem {
  day: number;
  percentage: number;
  users: number;
}

export interface TopUser {
  userId: string;
  userName: string;
  userRole: string;
  academyName: string;
  sessions: number;
  totalMinutes: number;
  pagesViewed: number;
  lastSeen: string;
}

// ──────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS — Sessions
// ──────────────────────────────────────────────────────────────

export async function getActiveSessions(): Promise<ActiveSession[]> {
  try {
    if (isMock()) {
      const { mockGetActiveSessions } = await import('@/lib/mocks/suporte.mock');
      return await mockGetActiveSessions();
    }
    const res = await fetch('/api/suporte/sessions/active');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getActiveSessions');
  }
}

export async function getSessionHistory(filters?: SessionFilter): Promise<SessionSummary[]> {
  try {
    if (isMock()) {
      const { mockGetSessionHistory } = await import('@/lib/mocks/suporte.mock');
      return await mockGetSessionHistory();
    }
    const params = new URLSearchParams();
    if (filters?.role) params.set('role', filters.role);
    if (filters?.academyId) params.set('academyId', filters.academyId);
    if (filters?.deviceType) params.set('deviceType', filters.deviceType);
    if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.set('dateTo', filters.dateTo);
    const qs = params.toString();
    const res = await fetch(`/api/suporte/sessions/history${qs ? `?${qs}` : ''}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getSessionHistory');
  }
}

export async function getSessionDetail(sessionId: string): Promise<SessionDetail> {
  try {
    if (isMock()) {
      const { mockGetSessionDetail } = await import('@/lib/mocks/suporte.mock');
      return await mockGetSessionDetail(sessionId);
    }
    const res = await fetch(`/api/suporte/sessions/${sessionId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getSessionDetail');
  }
}

// ──────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS — Errors
// ──────────────────────────────────────────────────────────────

export async function getRecentErrors(): Promise<ErrorSummary> {
  try {
    if (isMock()) {
      const { mockGetRecentErrors } = await import('@/lib/mocks/suporte.mock');
      return await mockGetRecentErrors();
    }
    const res = await fetch('/api/suporte/errors/recent');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getRecentErrors');
  }
}

export async function getErrorsByPage(): Promise<PageErrorInfo[]> {
  try {
    if (isMock()) {
      const { mockGetErrorsByPage } = await import('@/lib/mocks/suporte.mock');
      return await mockGetErrorsByPage();
    }
    const res = await fetch('/api/suporte/errors/by-page');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getErrorsByPage');
  }
}

export async function getErrorTrend(): Promise<ErrorTrendPoint[]> {
  try {
    if (isMock()) {
      const { mockGetErrorTrend } = await import('@/lib/mocks/suporte.mock');
      return await mockGetErrorTrend();
    }
    const res = await fetch('/api/suporte/errors/trend');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getErrorTrend');
  }
}

// ──────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS — Performance
// ──────────────────────────────────────────────────────────────

export async function getPerformanceOverview(): Promise<PerformanceOverview> {
  try {
    if (isMock()) {
      const { mockGetPerformanceOverview } = await import('@/lib/mocks/suporte.mock');
      return await mockGetPerformanceOverview();
    }
    const res = await fetch('/api/suporte/performance/overview');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getPerformanceOverview');
  }
}

export async function getPerformanceByPage(): Promise<PagePerformance[]> {
  try {
    if (isMock()) {
      const { mockGetPerformanceByPage } = await import('@/lib/mocks/suporte.mock');
      return await mockGetPerformanceByPage();
    }
    const res = await fetch('/api/suporte/performance/by-page');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getPerformanceByPage');
  }
}

export async function getPerformanceByDevice(): Promise<DevicePerformance[]> {
  try {
    if (isMock()) {
      const { mockGetPerformanceByDevice } = await import('@/lib/mocks/suporte.mock');
      return await mockGetPerformanceByDevice();
    }
    const res = await fetch('/api/suporte/performance/by-device');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getPerformanceByDevice');
  }
}

export async function getPerformanceTrend(): Promise<PerformanceTrendPoint[]> {
  try {
    if (isMock()) {
      const { mockGetPerformanceTrend } = await import('@/lib/mocks/suporte.mock');
      return await mockGetPerformanceTrend();
    }
    const res = await fetch('/api/suporte/performance/trend');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getPerformanceTrend');
  }
}

// ──────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS — Devices
// ──────────────────────────────────────────────────────────────

export async function getDeviceBreakdown(): Promise<DeviceBreakdownItem[]> {
  try {
    if (isMock()) {
      const { mockGetDeviceBreakdown } = await import('@/lib/mocks/suporte.mock');
      return await mockGetDeviceBreakdown();
    }
    const res = await fetch('/api/suporte/devices/breakdown');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getDeviceBreakdown');
  }
}

export async function getOSBreakdown(): Promise<BreakdownItem[]> {
  try {
    if (isMock()) {
      const { mockGetOSBreakdown } = await import('@/lib/mocks/suporte.mock');
      return await mockGetOSBreakdown();
    }
    const res = await fetch('/api/suporte/devices/os');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getOSBreakdown');
  }
}

export async function getBrowserBreakdown(): Promise<BreakdownItem[]> {
  try {
    if (isMock()) {
      const { mockGetBrowserBreakdown } = await import('@/lib/mocks/suporte.mock');
      return await mockGetBrowserBreakdown();
    }
    const res = await fetch('/api/suporte/devices/browser');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getBrowserBreakdown');
  }
}

export async function getDeviceModels(): Promise<DeviceModelInfo[]> {
  try {
    if (isMock()) {
      const { mockGetDeviceModels } = await import('@/lib/mocks/suporte.mock');
      return await mockGetDeviceModels();
    }
    const res = await fetch('/api/suporte/devices/models');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getDeviceModels');
  }
}

export async function getConnectionBreakdown(): Promise<ConnectionInfo[]> {
  try {
    if (isMock()) {
      const { mockGetConnectionBreakdown } = await import('@/lib/mocks/suporte.mock');
      return await mockGetConnectionBreakdown();
    }
    const res = await fetch('/api/suporte/devices/connection');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getConnectionBreakdown');
  }
}

// ──────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS — Tickets
// ──────────────────────────────────────────────────────────────

export async function getTickets(filters?: TicketFilter): Promise<SupportTicket[]> {
  try {
    if (isMock()) {
      const { mockGetTickets } = await import('@/lib/mocks/suporte.mock');
      return await mockGetTickets();
    }
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.academyId) params.set('academyId', filters.academyId);
    const qs = params.toString();
    const res = await fetch(`/api/suporte/tickets${qs ? `?${qs}` : ''}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getTickets');
  }
}

export async function getTicket(id: string): Promise<SupportTicket> {
  try {
    if (isMock()) {
      const { mockGetTicket } = await import('@/lib/mocks/suporte.mock');
      return await mockGetTicket(id);
    }
    const res = await fetch(`/api/suporte/tickets/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getTicket');
  }
}

export async function createTicket(data: CreateTicketDTO): Promise<SupportTicket> {
  try {
    if (isMock()) {
      const { mockCreateTicket } = await import('@/lib/mocks/suporte.mock');
      return await mockCreateTicket(data);
    }
    const res = await fetch('/api/suporte/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.createTicket');
  }
}

export async function updateTicketStatus(id: string, status: string): Promise<SupportTicket> {
  try {
    if (isMock()) {
      const { mockUpdateTicketStatus } = await import('@/lib/mocks/suporte.mock');
      return await mockUpdateTicketStatus(id, status);
    }
    const res = await fetch(`/api/suporte/tickets/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.updateTicketStatus');
  }
}

export async function addTicketMessage(id: string, from: string, text: string): Promise<SupportTicket> {
  try {
    if (isMock()) {
      const { mockAddTicketMessage } = await import('@/lib/mocks/suporte.mock');
      return await mockAddTicketMessage(id, from, text);
    }
    const res = await fetch(`/api/suporte/tickets/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, text }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.addTicketMessage');
  }
}

export async function getTicketMetrics(): Promise<TicketMetrics> {
  try {
    if (isMock()) {
      const { mockGetTicketMetrics } = await import('@/lib/mocks/suporte.mock');
      return await mockGetTicketMetrics();
    }
    const res = await fetch('/api/suporte/tickets/metrics');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getTicketMetrics');
  }
}

// ──────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS — Engagement
// ──────────────────────────────────────────────────────────────

export async function getEngagementOverview(): Promise<EngagementOverview> {
  try {
    if (isMock()) {
      const { mockGetEngagementOverview } = await import('@/lib/mocks/suporte.mock');
      return await mockGetEngagementOverview();
    }
    const res = await fetch('/api/suporte/engagement/overview');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getEngagementOverview');
  }
}

export async function getPagePopularity(): Promise<PagePopularityItem[]> {
  try {
    if (isMock()) {
      const { mockGetPagePopularity } = await import('@/lib/mocks/suporte.mock');
      return await mockGetPagePopularity();
    }
    const res = await fetch('/api/suporte/engagement/pages');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getPagePopularity');
  }
}

export async function getFeatureUsage(): Promise<FeatureUsageItem[]> {
  try {
    if (isMock()) {
      const { mockGetFeatureUsage } = await import('@/lib/mocks/suporte.mock');
      return await mockGetFeatureUsage();
    }
    const res = await fetch('/api/suporte/engagement/features');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getFeatureUsage');
  }
}

export async function getPeakHours(): Promise<PeakHourItem[]> {
  try {
    if (isMock()) {
      const { mockGetPeakHours } = await import('@/lib/mocks/suporte.mock');
      return await mockGetPeakHours();
    }
    const res = await fetch('/api/suporte/engagement/peak-hours');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getPeakHours');
  }
}

export async function getRetention(): Promise<RetentionItem[]> {
  try {
    if (isMock()) {
      const { mockGetRetention } = await import('@/lib/mocks/suporte.mock');
      return await mockGetRetention();
    }
    const res = await fetch('/api/suporte/engagement/retention');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getRetention');
  }
}

export async function getTopUsers(): Promise<TopUser[]> {
  try {
    if (isMock()) {
      const { mockGetTopUsers } = await import('@/lib/mocks/suporte.mock');
      return await mockGetTopUsers();
    }
    const res = await fetch('/api/suporte/engagement/top-users');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleServiceError(error, 'suporte.getTopUsers');
  }
}
