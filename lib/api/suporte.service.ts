import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('active_sessions')
      .select('*')
      .order('last_activity_at', { ascending: false });
    if (error) {
      console.error('[getActiveSessions] Supabase error:', error.message);
      return [];
    }
    return (data ?? []) as ActiveSession[];
  } catch (error) {
    console.error('[getActiveSessions] Fallback:', error);
    return [];
  }
}

export async function getSessionHistory(filters?: SessionFilter): Promise<SessionSummary[]> {
  try {
    if (isMock()) {
      const { mockGetSessionHistory } = await import('@/lib/mocks/suporte.mock');
      return await mockGetSessionHistory();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase
      .from('session_history')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(100);
    if (filters?.role) {
      query = query.eq('user_role', filters.role);
    }
    if (filters?.academyId) {
      query = query.eq('academy_id', filters.academyId);
    }
    if (filters?.deviceType) {
      query = query.eq('device_type', filters.deviceType);
    }
    if (filters?.dateFrom) {
      query = query.gte('started_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('started_at', filters.dateTo);
    }
    const { data, error } = await query;
    if (error) {
      console.error('[getSessionHistory] Supabase error:', error.message);
      return [];
    }
    return (data ?? []) as SessionSummary[];
  } catch (error) {
    console.error('[getSessionHistory] Fallback:', error);
    return [];
  }
}

export async function getSessionDetail(sessionId: string): Promise<SessionDetail> {
  const emptyDetail: SessionDetail = {
    id: sessionId,
    userId: '',
    userName: '',
    userRole: 'admin',
    academyId: '',
    academyName: '',
    deviceType: 'desktop',
    deviceModel: '',
    os: '',
    browser: '',
    ip: '',
    city: '',
    startedAt: '',
    endedAt: null,
    durationMinutes: null,
    pagesViewed: 0,
    screenResolution: '',
    connectionType: '',
    pageHistory: [],
    errors: [],
    performanceMetrics: { avgLCP: 0, avgFCP: 0, avgCLS: 0, avgTTFB: 0 },
  };
  try {
    if (isMock()) {
      const { mockGetSessionDetail } = await import('@/lib/mocks/suporte.mock');
      return await mockGetSessionDetail(sessionId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('session_history')
      .select('*')
      .eq('id', sessionId)
      .single();
    if (error || !data) {
      console.error('[getSessionDetail] Supabase error:', error?.message);
      return emptyDetail;
    }
    return data as SessionDetail;
  } catch (error) {
    console.error('[getSessionDetail] Fallback:', error);
    return emptyDetail;
  }
}

// ──────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS — Errors
// ──────────────────────────────────────────────────────────────

const emptyErrorSummary: ErrorSummary = {
  jsErrors: [],
  apiErrors: [],
  totalCritical: 0,
  totalError: 0,
  totalWarning: 0,
  totalApiErrors: 0,
  errorRate: 0,
  errorsLast1h: 0,
  errorsLast24h: 0,
};

export async function getRecentErrors(): Promise<ErrorSummary> {
  try {
    if (isMock()) {
      const { mockGetRecentErrors } = await import('@/lib/mocks/suporte.mock');
      return await mockGetRecentErrors();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .order('last_seen', { ascending: false })
      .limit(100);
    if (error || !data) {
      console.error('[getRecentErrors] Supabase error:', error?.message);
      return emptyErrorSummary;
    }
    return data as unknown as ErrorSummary;
  } catch (error) {
    console.error('[getRecentErrors] Fallback:', error);
    return emptyErrorSummary;
  }
}

export async function getErrorsByPage(): Promise<PageErrorInfo[]> {
  try {
    if (isMock()) {
      const { mockGetErrorsByPage } = await import('@/lib/mocks/suporte.mock');
      return await mockGetErrorsByPage();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('error_logs_by_page')
      .select('*')
      .order('total_errors', { ascending: false });
    if (error || !data) {
      console.error('[getErrorsByPage] Supabase error:', error?.message);
      return [];
    }
    return data as PageErrorInfo[];
  } catch (error) {
    console.error('[getErrorsByPage] Fallback:', error);
    return [];
  }
}

export async function getErrorTrend(): Promise<ErrorTrendPoint[]> {
  try {
    if (isMock()) {
      const { mockGetErrorTrend } = await import('@/lib/mocks/suporte.mock');
      return await mockGetErrorTrend();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('error_trend')
      .select('*')
      .order('hour', { ascending: true });
    if (error || !data) {
      console.error('[getErrorTrend] Supabase error:', error?.message);
      return [];
    }
    return data as ErrorTrendPoint[];
  } catch (error) {
    console.error('[getErrorTrend] Fallback:', error);
    return [];
  }
}

// ──────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS — Performance
// ──────────────────────────────────────────────────────────────

const emptyPerformanceOverview: PerformanceOverview = {
  avgLCP: 0, avgFCP: 0, avgCLS: 0, avgTTFB: 0, avgFID: 0,
  p75LCP: 0, p75FCP: 0, p75CLS: 0,
  p95LCP: 0, p95FCP: 0, p95CLS: 0,
  totalPageLoads: 0,
  goodLCP: 0, needsImprovementLCP: 0, poorLCP: 0,
  goodFCP: 0, needsImprovementFCP: 0, poorFCP: 0,
  goodCLS: 0, needsImprovementCLS: 0, poorCLS: 0,
};

export async function getPerformanceOverview(): Promise<PerformanceOverview> {
  try {
    if (isMock()) {
      const { mockGetPerformanceOverview } = await import('@/lib/mocks/suporte.mock');
      return await mockGetPerformanceOverview();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('performance_overview')
      .select('*')
      .single();
    if (error || !data) {
      console.error('[getPerformanceOverview] Supabase error:', error?.message);
      return emptyPerformanceOverview;
    }
    return data as PerformanceOverview;
  } catch (error) {
    console.error('[getPerformanceOverview] Fallback:', error);
    return emptyPerformanceOverview;
  }
}

export async function getPerformanceByPage(): Promise<PagePerformance[]> {
  try {
    if (isMock()) {
      const { mockGetPerformanceByPage } = await import('@/lib/mocks/suporte.mock');
      return await mockGetPerformanceByPage();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('performance_by_page')
      .select('*')
      .order('load_count', { ascending: false });
    if (error || !data) {
      console.error('[getPerformanceByPage] Supabase error:', error?.message);
      return [];
    }
    return data as PagePerformance[];
  } catch (error) {
    console.error('[getPerformanceByPage] Fallback:', error);
    return [];
  }
}

export async function getPerformanceByDevice(): Promise<DevicePerformance[]> {
  try {
    if (isMock()) {
      const { mockGetPerformanceByDevice } = await import('@/lib/mocks/suporte.mock');
      return await mockGetPerformanceByDevice();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('performance_by_device')
      .select('*');
    if (error || !data) {
      console.error('[getPerformanceByDevice] Supabase error:', error?.message);
      return [];
    }
    return data as DevicePerformance[];
  } catch (error) {
    console.error('[getPerformanceByDevice] Fallback:', error);
    return [];
  }
}

export async function getPerformanceTrend(): Promise<PerformanceTrendPoint[]> {
  try {
    if (isMock()) {
      const { mockGetPerformanceTrend } = await import('@/lib/mocks/suporte.mock');
      return await mockGetPerformanceTrend();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('performance_trend')
      .select('*')
      .order('date', { ascending: true });
    if (error || !data) {
      console.error('[getPerformanceTrend] Supabase error:', error?.message);
      return [];
    }
    return data as PerformanceTrendPoint[];
  } catch (error) {
    console.error('[getPerformanceTrend] Fallback:', error);
    return [];
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('device_breakdown')
      .select('*');
    if (error || !data) {
      console.error('[getDeviceBreakdown] Supabase error:', error?.message);
      return [];
    }
    return data as DeviceBreakdownItem[];
  } catch (error) {
    console.error('[getDeviceBreakdown] Fallback:', error);
    return [];
  }
}

export async function getOSBreakdown(): Promise<BreakdownItem[]> {
  try {
    if (isMock()) {
      const { mockGetOSBreakdown } = await import('@/lib/mocks/suporte.mock');
      return await mockGetOSBreakdown();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('os_breakdown')
      .select('*');
    if (error || !data) {
      console.error('[getOSBreakdown] Supabase error:', error?.message);
      return [];
    }
    return data as BreakdownItem[];
  } catch (error) {
    console.error('[getOSBreakdown] Fallback:', error);
    return [];
  }
}

export async function getBrowserBreakdown(): Promise<BreakdownItem[]> {
  try {
    if (isMock()) {
      const { mockGetBrowserBreakdown } = await import('@/lib/mocks/suporte.mock');
      return await mockGetBrowserBreakdown();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('browser_breakdown')
      .select('*');
    if (error || !data) {
      console.error('[getBrowserBreakdown] Supabase error:', error?.message);
      return [];
    }
    return data as BreakdownItem[];
  } catch (error) {
    console.error('[getBrowserBreakdown] Fallback:', error);
    return [];
  }
}

export async function getDeviceModels(): Promise<DeviceModelInfo[]> {
  try {
    if (isMock()) {
      const { mockGetDeviceModels } = await import('@/lib/mocks/suporte.mock');
      return await mockGetDeviceModels();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('device_models')
      .select('*')
      .order('count', { ascending: false });
    if (error || !data) {
      console.error('[getDeviceModels] Supabase error:', error?.message);
      return [];
    }
    return data as DeviceModelInfo[];
  } catch (error) {
    console.error('[getDeviceModels] Fallback:', error);
    return [];
  }
}

export async function getConnectionBreakdown(): Promise<ConnectionInfo[]> {
  try {
    if (isMock()) {
      const { mockGetConnectionBreakdown } = await import('@/lib/mocks/suporte.mock');
      return await mockGetConnectionBreakdown();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('connection_breakdown')
      .select('*');
    if (error || !data) {
      console.error('[getConnectionBreakdown] Supabase error:', error?.message);
      return [];
    }
    return data as ConnectionInfo[];
  } catch (error) {
    console.error('[getConnectionBreakdown] Fallback:', error);
    return [];
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.academyId) {
      query = query.eq('academy_id', filters.academyId);
    }
    const { data, error } = await query;
    if (error || !data) {
      console.error('[getTickets] Supabase error:', error?.message);
      return [];
    }
    return data as SupportTicket[];
  } catch (error) {
    console.error('[getTickets] Fallback:', error);
    return [];
  }
}

export async function getTicket(id: string): Promise<SupportTicket> {
  const emptyTicket: SupportTicket = {
    id,
    subject: '',
    description: '',
    status: 'open',
    priority: 'medium',
    category: 'question',
    createdBy: { userId: '', userName: '', userRole: '', academyName: '' },
    assignedTo: null,
    academyId: '',
    academyName: '',
    createdAt: '',
    updatedAt: '',
    resolvedAt: null,
    messages: [],
  };
  try {
    if (isMock()) {
      const { mockGetTicket } = await import('@/lib/mocks/suporte.mock');
      return await mockGetTicket(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) {
      console.error('[getTicket] Supabase error:', error?.message);
      return emptyTicket;
    }
    return data as SupportTicket;
  } catch (error) {
    console.error('[getTicket] Fallback:', error);
    return emptyTicket;
  }
}

export async function createTicket(data: CreateTicketDTO): Promise<SupportTicket> {
  const emptyTicket: SupportTicket = {
    id: '',
    subject: data.subject,
    description: data.description,
    status: 'open',
    priority: data.priority as SupportTicket['priority'],
    category: data.category as SupportTicket['category'],
    createdBy: { userId: '', userName: '', userRole: '', academyName: '' },
    assignedTo: null,
    academyId: '',
    academyName: '',
    createdAt: '',
    updatedAt: '',
    resolvedAt: null,
    messages: [],
  };
  try {
    if (isMock()) {
      const { mockCreateTicket } = await import('@/lib/mocks/suporte.mock');
      return await mockCreateTicket(data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        subject: data.subject,
        description: data.description,
        priority: data.priority,
        category: data.category,
        status: 'open',
      })
      .select('*')
      .single();
    if (error || !ticket) {
      console.error('[createTicket] Supabase error:', error?.message);
      return emptyTicket;
    }
    return ticket as SupportTicket;
  } catch (error) {
    console.error('[createTicket] Fallback:', error);
    return emptyTicket;
  }
}

export async function updateTicketStatus(id: string, status: string): Promise<SupportTicket> {
  const emptyTicket: SupportTicket = {
    id,
    subject: '',
    description: '',
    status: status as SupportTicket['status'],
    priority: 'medium',
    category: 'question',
    createdBy: { userId: '', userName: '', userRole: '', academyName: '' },
    assignedTo: null,
    academyId: '',
    academyName: '',
    createdAt: '',
    updatedAt: '',
    resolvedAt: null,
    messages: [],
  };
  try {
    if (isMock()) {
      const { mockUpdateTicketStatus } = await import('@/lib/mocks/suporte.mock');
      return await mockUpdateTicketStatus(id, status);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const updatePayload: Record<string, string> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (status === 'resolved') {
      updatePayload.resolved_at = new Date().toISOString();
    }
    const { data, error } = await supabase
      .from('support_tickets')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) {
      console.error('[updateTicketStatus] Supabase error:', error?.message);
      return emptyTicket;
    }
    return data as SupportTicket;
  } catch (error) {
    console.error('[updateTicketStatus] Fallback:', error);
    return emptyTicket;
  }
}

export async function addTicketMessage(id: string, from: string, text: string): Promise<SupportTicket> {
  const emptyTicket: SupportTicket = {
    id,
    subject: '',
    description: '',
    status: 'open',
    priority: 'medium',
    category: 'question',
    createdBy: { userId: '', userName: '', userRole: '', academyName: '' },
    assignedTo: null,
    academyId: '',
    academyName: '',
    createdAt: '',
    updatedAt: '',
    resolvedAt: null,
    messages: [],
  };
  try {
    if (isMock()) {
      const { mockAddTicketMessage } = await import('@/lib/mocks/suporte.mock');
      return await mockAddTicketMessage(id, from, text);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error: msgError } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: id,
        from_type: from,
        text,
      });
    if (msgError) {
      console.error('[addTicketMessage] Supabase error:', msgError.message);
      return emptyTicket;
    }
    const { data: ticket, error: fetchError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchError || !ticket) {
      console.error('[addTicketMessage] Fetch error:', fetchError?.message);
      return emptyTicket;
    }
    return ticket as SupportTicket;
  } catch (error) {
    console.error('[addTicketMessage] Fallback:', error);
    return emptyTicket;
  }
}

export async function getTicketMetrics(): Promise<TicketMetrics> {
  const emptyMetrics: TicketMetrics = {
    totalOpen: 0,
    totalInProgress: 0,
    totalResolved: 0,
    totalAll: 0,
    avgResolutionTimeHours: 0,
    avgFirstResponseTimeMinutes: 0,
    satisfactionScore: 0,
    ticketsLast24h: 0,
    ticketsLast7d: 0,
    ticketsLast30d: 0,
    byCategory: [],
    byPriority: [],
  };
  try {
    if (isMock()) {
      const { mockGetTicketMetrics } = await import('@/lib/mocks/suporte.mock');
      return await mockGetTicketMetrics();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { count: totalOpen } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');
    const { count: totalInProgress } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress');
    const { count: totalResolved } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved');
    const { count: totalAll } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true });
    return {
      ...emptyMetrics,
      totalOpen: totalOpen ?? 0,
      totalInProgress: totalInProgress ?? 0,
      totalResolved: totalResolved ?? 0,
      totalAll: totalAll ?? 0,
    };
  } catch (error) {
    console.error('[getTicketMetrics] Fallback:', error);
    return emptyMetrics;
  }
}

// ──────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS — Engagement
// ──────────────────────────────────────────────────────────────

const emptyEngagement: EngagementOverview = {
  dau: 0, wau: 0, mau: 0,
  dauWauRatio: 0, dauMauRatio: 0,
  avgSessionDurationMinutes: 0, avgPagesPerSession: 0,
  bounceRate: 0, avgSessionsPerUser: 0,
  totalSessions24h: 0, totalPageViews24h: 0,
  newUsers7d: 0, returningUsers7d: 0,
};

export async function getEngagementOverview(): Promise<EngagementOverview> {
  try {
    if (isMock()) {
      const { mockGetEngagementOverview } = await import('@/lib/mocks/suporte.mock');
      return await mockGetEngagementOverview();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('engagement_overview')
      .select('*')
      .single();
    if (error || !data) {
      console.error('[getEngagementOverview] Supabase error:', error?.message);
      return emptyEngagement;
    }
    return data as EngagementOverview;
  } catch (error) {
    console.error('[getEngagementOverview] Fallback:', error);
    return emptyEngagement;
  }
}

export async function getPagePopularity(): Promise<PagePopularityItem[]> {
  try {
    if (isMock()) {
      const { mockGetPagePopularity } = await import('@/lib/mocks/suporte.mock');
      return await mockGetPagePopularity();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('page_popularity')
      .select('*')
      .order('views', { ascending: false });
    if (error || !data) {
      console.error('[getPagePopularity] Supabase error:', error?.message);
      return [];
    }
    return data as PagePopularityItem[];
  } catch (error) {
    console.error('[getPagePopularity] Fallback:', error);
    return [];
  }
}

export async function getFeatureUsage(): Promise<FeatureUsageItem[]> {
  try {
    if (isMock()) {
      const { mockGetFeatureUsage } = await import('@/lib/mocks/suporte.mock');
      return await mockGetFeatureUsage();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('feature_usage')
      .select('*')
      .order('usage_count', { ascending: false });
    if (error || !data) {
      console.error('[getFeatureUsage] Supabase error:', error?.message);
      return [];
    }
    return data as FeatureUsageItem[];
  } catch (error) {
    console.error('[getFeatureUsage] Fallback:', error);
    return [];
  }
}

export async function getPeakHours(): Promise<PeakHourItem[]> {
  try {
    if (isMock()) {
      const { mockGetPeakHours } = await import('@/lib/mocks/suporte.mock');
      return await mockGetPeakHours();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('peak_hours')
      .select('*')
      .order('hour', { ascending: true });
    if (error || !data) {
      console.error('[getPeakHours] Supabase error:', error?.message);
      return [];
    }
    return data as PeakHourItem[];
  } catch (error) {
    console.error('[getPeakHours] Fallback:', error);
    return [];
  }
}

export async function getRetention(): Promise<RetentionItem[]> {
  try {
    if (isMock()) {
      const { mockGetRetention } = await import('@/lib/mocks/suporte.mock');
      return await mockGetRetention();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('retention')
      .select('*')
      .order('day', { ascending: true });
    if (error || !data) {
      console.error('[getRetention] Supabase error:', error?.message);
      return [];
    }
    return data as RetentionItem[];
  } catch (error) {
    console.error('[getRetention] Fallback:', error);
    return [];
  }
}

export async function getTopUsers(): Promise<TopUser[]> {
  try {
    if (isMock()) {
      const { mockGetTopUsers } = await import('@/lib/mocks/suporte.mock');
      return await mockGetTopUsers();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('top_users')
      .select('*')
      .order('total_minutes', { ascending: false })
      .limit(20);
    if (error || !data) {
      console.error('[getTopUsers] Supabase error:', error?.message);
      return [];
    }
    return data as TopUser[];
  } catch (error) {
    console.error('[getTopUsers] Fallback:', error);
    return [];
  }
}
