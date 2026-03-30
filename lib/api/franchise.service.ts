import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// --- DTOs ---

export type AcademyStatus = 'ativa' | 'inadimplente' | 'suspensa' | 'em_setup';

export interface FranchiseAcademy {
  id: string;
  name: string;
  city: string;
  students: number;
  revenue: number;
  attendance_rate: number;
  nps: number;
  status: AcademyStatus;
}

export interface NetworkKPIs {
  total_academies: number;
  total_students: number;
  total_revenue: number;
  total_royalties: number;
  avg_nps: number;
  avg_attendance: number;
}

export interface NetworkAlert {
  id: string;
  type: 'high_churn' | 'overdue' | 'attendance_drop' | 'low_nps';
  academy_id: string;
  academy_name: string;
  message: string;
  severity: 'warning' | 'critical';
  created_at: string;
}

export interface MonthlyRevenueByAcademy {
  month: string;
  academies: { academy_id: string; academy_name: string; revenue: number }[];
  total: number;
}

export interface NetworkFinancials {
  monthly_data: MonthlyRevenueByAcademy[];
  total_revenue: number;
  total_royalties: number;
  growth_pct: number;
}

export interface NetworkDashboard {
  kpis: NetworkKPIs;
  academies: FranchiseAcademy[];
  alerts: NetworkAlert[];
  financials: NetworkFinancials;
}

export interface NetworkMessage {
  subject: string;
  body: string;
  recipients: string[];
  channel: 'email' | 'push' | 'sms';
}

// --- Service Functions ---

export async function getNetworkDashboard(franchiseId: string): Promise<NetworkDashboard> {
  try {
    if (isMock()) {
      const { mockGetNetworkDashboard } = await import('@/lib/mocks/franchise.mock');
      return mockGetNetworkDashboard(franchiseId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Fetch academies for this franchise
    const { data: academies, error: acadError } = await supabase
      .from('franchise_academies')
      .select('*')
      .eq('franchise_id', franchiseId);

    if (acadError) {
      logServiceError(acadError, 'franchise');
    }

    const academyList: FranchiseAcademy[] = (academies ?? []).map((a: Record<string, unknown>) => ({
      id: a.id as string,
      name: (a.name as string) ?? '',
      city: (a.city as string) ?? '',
      students: (a.students_count as number) ?? 0,
      revenue: (a.revenue as number) ?? 0,
      attendance_rate: (a.attendance_rate as number) ?? 0,
      nps: (a.nps as number) ?? 0,
      status: (a.status as AcademyStatus) ?? 'ativa',
    }));

    // Fetch alerts
    const { data: alerts, error: alertError } = await supabase
      .from('franchise_alerts')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (alertError) {
      logServiceError(alertError, 'franchise');
    }

    const alertList: NetworkAlert[] = (alerts ?? []).map((a: Record<string, unknown>) => ({
      id: a.id as string,
      type: a.type as NetworkAlert['type'],
      academy_id: a.academy_id as string,
      academy_name: (a.academy_name as string) ?? '',
      message: (a.message as string) ?? '',
      severity: (a.severity as 'warning' | 'critical') ?? 'warning',
      created_at: a.created_at as string,
    }));

    // Compute KPIs from academies
    const totalStudents = academyList.reduce((s, a) => s + a.students, 0);
    const totalRevenue = academyList.reduce((s, a) => s + a.revenue, 0);
    const avgNps = academyList.length ? academyList.reduce((s, a) => s + a.nps, 0) / academyList.length : 0;
    const avgAttendance = academyList.length ? academyList.reduce((s, a) => s + a.attendance_rate, 0) / academyList.length : 0;

    const kpis: NetworkKPIs = {
      total_academies: academyList.length,
      total_students: totalStudents,
      total_revenue: totalRevenue,
      total_royalties: totalRevenue * 0.1,
      avg_nps: Math.round(avgNps * 10) / 10,
      avg_attendance: Math.round(avgAttendance * 10) / 10,
    };

    // Fetch monthly financials for revenue chart
    const { data: finRows, error: finError } = await supabase
      .from('franchise_financials')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('month', { ascending: true });

    if (finError) {
      logServiceError(finError, 'franchise');
    }

    const finRecords = (finRows ?? []) as Record<string, unknown>[];
    const monthMap = new Map<string, MonthlyRevenueByAcademy>();
    for (const row of finRecords) {
      const month = (row.month as string) ?? '';
      const academyId = (row.academy_id as string) ?? '';
      const rev = (row.revenue as number) ?? 0;
      const academyName = academyList.find((a) => a.id === academyId)?.name ?? '';
      const entry = monthMap.get(month) ?? { month, academies: [], total: 0 };
      entry.academies.push({ academy_id: academyId, academy_name: academyName, revenue: rev });
      entry.total += rev;
      monthMap.set(month, entry);
    }
    const monthlyData = Array.from(monthMap.values());

    const finTotalRevenue = monthlyData.reduce((s, m) => s + m.total, 0);
    const finTotalRoyalties = Math.round(finTotalRevenue * 0.1);
    const lastMonth = monthlyData[monthlyData.length - 1]?.total ?? 0;
    const prevMonth = monthlyData[monthlyData.length - 2]?.total ?? 0;
    const growthPct = prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100 * 10) / 10 : 0;

    return {
      kpis,
      academies: academyList,
      alerts: alertList,
      financials: {
        monthly_data: monthlyData,
        total_revenue: finTotalRevenue || totalRevenue,
        total_royalties: finTotalRoyalties || totalRevenue * 0.1,
        growth_pct: growthPct,
      },
    };
  } catch (error) {
    logServiceError(error, 'franchise');
    return {
      kpis: { total_academies: 0, total_students: 0, total_revenue: 0, total_royalties: 0, avg_nps: 0, avg_attendance: 0 },
      academies: [],
      alerts: [],
      financials: { monthly_data: [], total_revenue: 0, total_royalties: 0, growth_pct: 0 },
    };
  }
}

export async function getAcademies(franchiseId: string): Promise<FranchiseAcademy[]> {
  try {
    if (isMock()) {
      const { mockGetAcademies } = await import('@/lib/mocks/franchise.mock');
      return mockGetAcademies(franchiseId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_academies')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('name', { ascending: true });

    if (error) {
      logServiceError(error, 'franchise');
      return [];
    }

    return (data ?? []).map((a: Record<string, unknown>) => ({
      id: a.id as string,
      name: (a.name as string) ?? '',
      city: (a.city as string) ?? '',
      students: (a.students_count as number) ?? 0,
      revenue: (a.revenue as number) ?? 0,
      attendance_rate: (a.attendance_rate as number) ?? 0,
      nps: (a.nps as number) ?? 0,
      status: (a.status as AcademyStatus) ?? 'ativa',
    }));
  } catch (error) {
    logServiceError(error, 'franchise');
    return [];
  }
}

export async function getFinancials(franchiseId: string): Promise<NetworkFinancials> {
  try {
    if (isMock()) {
      const { mockGetFinancials } = await import('@/lib/mocks/franchise.mock');
      return mockGetFinancials(franchiseId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_financials')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('month', { ascending: true })
      .limit(60);

    if (error) {
      logServiceError(error, 'franchise');
      return { monthly_data: [], total_revenue: 0, total_royalties: 0, growth_pct: 0 };
    }

    const rows = (data ?? []) as Record<string, unknown>[];
    const monthMap = new Map<string, MonthlyRevenueByAcademy>();
    for (const row of rows) {
      const month = (row.month as string) ?? '';
      const academyId = (row.academy_id as string) ?? '';
      const rev = (row.revenue as number) ?? 0;
      const entry = monthMap.get(month) ?? { month, academies: [], total: 0 };
      entry.academies.push({ academy_id: academyId, academy_name: '', revenue: rev });
      entry.total += rev;
      monthMap.set(month, entry);
    }
    const monthlyData = Array.from(monthMap.values()).slice(-12);

    const totalRevenue = monthlyData.reduce((s, m) => s + m.total, 0);
    const lastMonth = monthlyData[monthlyData.length - 1]?.total ?? 0;
    const prevMonth = monthlyData[monthlyData.length - 2]?.total ?? 0;
    const growthPct = prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100 * 10) / 10 : 0;

    return {
      monthly_data: monthlyData,
      total_revenue: totalRevenue,
      total_royalties: Math.round(totalRevenue * 0.1),
      growth_pct: growthPct,
    };
  } catch (error) {
    logServiceError(error, 'franchise');
    return { monthly_data: [], total_revenue: 0, total_royalties: 0, growth_pct: 0 };
  }
}

export async function sendNetworkMessage(franchiseId: string, message: NetworkMessage): Promise<{ sent: number }> {
  try {
    if (isMock()) {
      const { mockSendNetworkMessage } = await import('@/lib/mocks/franchise.mock');
      return mockSendNetworkMessage(franchiseId, message);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('franchise_messages')
      .insert({
        franchise_id: franchiseId,
        subject: message.subject,
        body: message.body,
        recipients: message.recipients,
        channel: message.channel,
      });

    if (error) {
      logServiceError(error, 'franchise');
      return { sent: 0 };
    }

    return { sent: message.recipients.length };
  } catch (error) {
    logServiceError(error, 'franchise');
    return { sent: 0 };
  }
}
