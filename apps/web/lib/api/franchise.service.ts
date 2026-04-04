import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// --- DTOs ---

export type AcademyStatus = 'ativa' | 'inadimplente' | 'suspensa' | 'em_setup';

export interface FranchiseNetwork {
  id: string;
  name: string;
  unit_count: number;
}

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
  best_unit: { name: string; revenue: number } | null;
  worst_unit: { name: string; revenue: number } | null;
}

export interface NetworkMessage {
  subject: string;
  body: string;
  recipients: string[];
  channel: 'email' | 'push' | 'sms';
}

export interface NetworkUnit {
  id: string;
  name: string;
  city: string;
  state: string;
  students: number;
  revenue: number;
  nps: number;
  attendance_rate: number;
  status: string;
}

export interface RankedUnit {
  id: string;
  name: string;
  city: string;
  revenue: number;
  students: number;
  nps: number;
  rank_revenue: number;
  rank_students: number;
  rank_nps: number;
}

export interface RoyaltySummary {
  total_paid: number;
  total_pending: number;
  total_overdue: number;
  current_month_total: number;
}

export interface ComplianceUnit {
  academy_id: string;
  academy_name: string;
  overall_score: number;
  checked_at: string;
}

export interface RevenuePoint {
  month: string;
  total: number;
  academies: { academy_id: string; academy_name: string; revenue: number }[];
}

export interface BroadcastSummary {
  id: string;
  type: string;
  subject: string;
  body: string;
  channels: string[];
  sent_at: string;
  created_by: string;
  total_recipients: number;
  read_count: number;
  delivered_count: number;
}

export interface CurriculoItem {
  id: string;
  modalidade: string;
  nome: string;
  descricao: string;
  modulos: Record<string, unknown>[];
}

export interface StandardItem {
  id: string;
  category: string;
  name: string;
  description: string;
  required: boolean;
  checklist_items: Record<string, unknown>[];
  deadline: string | null;
}

export interface ExpansionData {
  leads: ExpansionLead[];
  current_units: { id: string; name: string; city: string; state: string }[];
}

export interface ExpansionLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  investment_capacity: number;
  experience: string;
  stage: string;
  viability_score: number | null;
  onboarding_step: string | null;
  notes: string;
}

// --- Helper: map a Supabase academy row to FranchiseAcademy ---

function mapAcademyRow(a: Record<string, unknown>): FranchiseAcademy {
  return {
    id: a.id as string,
    name: (a.name as string) ?? '',
    city: (a.city as string) ?? '',
    students: (a.students_count as number) ?? 0,
    revenue: (a.revenue as number) ?? 0,
    attendance_rate: (a.attendance_rate as number) ?? 0,
    nps: (a.nps as number) ?? 0,
    status: (a.status as AcademyStatus) ?? 'ativa',
  };
}

// --- Helper: current month string for financials queries (YYYY-MM format) ---

function currentMonthStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ====================================================================
// 1. getMyNetwork — Find the franchise for this franqueador user
// ====================================================================

export async function getMyNetwork(profileId: string): Promise<FranchiseNetwork | null> {
  try {
    if (isMock()) {
      const { mockGetMyNetwork } = await import('@/lib/mocks/franchise.mock');
      return mockGetMyNetwork(profileId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Step 1: Find academy_id(s) where this user has role 'franqueador'
    const { data: memberships, error: memError } = await supabase
      .from('memberships')
      .select('academy_id')
      .eq('profile_id', profileId)
      .eq('role', 'franqueador');

    if (memError) {
      logServiceError(memError, 'franchise');
      return null;
    }

    if (!memberships || memberships.length === 0) return null;

    const academyIds = memberships.map((m: Record<string, unknown>) => m.academy_id as string);

    // Step 2: Find franchise_units matching those academy_ids → get franchise_id
    const { data: units, error: unitError } = await supabase
      .from('franchise_units')
      .select('franchise_id, name')
      .in('academy_id', academyIds)
      .limit(1);

    if (unitError) {
      logServiceError(unitError, 'franchise');
      return null;
    }

    if (!units || units.length === 0) return null;

    const franchiseId = (units[0] as Record<string, unknown>).franchise_id as string;
    const franchiseName = (units[0] as Record<string, unknown>).name as string;

    // Step 3: Count total units in this franchise
    const { count, error: countError } = await supabase
      .from('franchise_units')
      .select('id', { count: 'exact', head: true })
      .eq('franchise_id', franchiseId);

    if (countError) {
      logServiceError(countError, 'franchise');
    }

    return {
      id: franchiseId,
      name: franchiseName ?? 'Rede de Franquias',
      unit_count: count ?? 1,
    };
  } catch (error) {
    logServiceError(error, 'franchise');
    return null;
  }
}

// ====================================================================
// 2. getNetworkUnits — List all units with stats
// ====================================================================

export async function getNetworkUnits(franchiseId: string): Promise<NetworkUnit[]> {
  try {
    if (isMock()) {
      const { mockGetAcademies } = await import('@/lib/mocks/franchise.mock');
      const academies = await mockGetAcademies(franchiseId);
      return academies.map((a) => ({
        id: a.id,
        name: a.name,
        city: a.city,
        state: '',
        students: a.students,
        revenue: a.revenue,
        nps: a.nps,
        attendance_rate: a.attendance_rate,
        status: a.status,
      }));
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Fetch from franchise_academies (which has the stats)
    const { data: academies, error: acadError } = await supabase
      .from('franchise_academies')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('name', { ascending: true });

    if (acadError) {
      logServiceError(acadError, 'franchise');
      return [];
    }

    // Also get state info from franchise_units
    const { data: units, error: unitError } = await supabase
      .from('franchise_units')
      .select('academy_id, state')
      .eq('franchise_id', franchiseId);

    if (unitError) {
      logServiceError(unitError, 'franchise');
    }

    const stateMap = new Map<string, string>();
    for (const u of (units ?? []) as Record<string, unknown>[]) {
      stateMap.set(u.academy_id as string, (u.state as string) ?? '');
    }

    return (academies ?? []).map((a: Record<string, unknown>) => ({
      id: a.id as string,
      name: (a.name as string) ?? '',
      city: (a.city as string) ?? '',
      state: stateMap.get(a.id as string) ?? '',
      students: (a.students_count as number) ?? 0,
      revenue: (a.revenue as number) ?? 0,
      nps: (a.nps as number) ?? 0,
      attendance_rate: (a.attendance_rate as number) ?? 0,
      status: (a.status as string) ?? 'ativa',
    }));
  } catch (error) {
    logServiceError(error, 'franchise');
    return [];
  }
}

// ====================================================================
// 3. getNetworkDashboard — Consolidated KPIs
// ====================================================================

export async function getNetworkDashboard(franchiseId: string): Promise<NetworkDashboard> {
  try {
    if (isMock()) {
      const { mockGetNetworkDashboard } = await import('@/lib/mocks/franchise.mock');
      return mockGetNetworkDashboard(franchiseId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // --- Fetch academies ---
    const { data: academies, error: acadError } = await supabase
      .from('franchise_academies')
      .select('*')
      .eq('franchise_id', franchiseId);

    if (acadError) {
      logServiceError(acadError, 'franchise');
    }

    const academyList: FranchiseAcademy[] = (academies ?? []).map(
      (a: Record<string, unknown>) => mapAcademyRow(a),
    );

    // --- Fetch alerts ---
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
      academy_id: (a.academy_id as string) ?? '',
      academy_name: (a.academy_name as string) ?? '',
      message: (a.message as string) ?? '',
      severity: (a.severity as 'warning' | 'critical') ?? 'warning',
      created_at: (a.created_at as string) ?? '',
    }));

    // --- Compute KPIs from academies ---
    const totalStudents = academyList.reduce((s, a) => s + a.students, 0);
    const totalRevenue = academyList.reduce((s, a) => s + a.revenue, 0);
    const avgNps = academyList.length
      ? academyList.reduce((s, a) => s + a.nps, 0) / academyList.length
      : 0;
    const avgAttendance = academyList.length
      ? academyList.reduce((s, a) => s + a.attendance_rate, 0) / academyList.length
      : 0;

    // --- Fetch monthly financials for revenue chart ---
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
    let totalRoyalties = 0;

    for (const row of finRecords) {
      const month = (row.month as string) ?? '';
      const academyId = (row.academy_id as string) ?? '';
      const rev = (row.revenue as number) ?? 0;
      const royalties = (row.royalties as number) ?? 0;
      totalRoyalties += royalties;
      const academyName = academyList.find((a) => a.id === academyId)?.name ?? '';
      const entry = monthMap.get(month) ?? { month, academies: [], total: 0 };
      entry.academies.push({ academy_id: academyId, academy_name: academyName, revenue: rev });
      entry.total += rev;
      monthMap.set(month, entry);
    }
    const monthlyData = Array.from(monthMap.values());

    const finTotalRevenue = monthlyData.reduce((s, m) => s + m.total, 0);
    const lastMonth = monthlyData[monthlyData.length - 1]?.total ?? 0;
    const prevMonth = monthlyData[monthlyData.length - 2]?.total ?? 0;
    const growthPct =
      prevMonth > 0
        ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100 * 10) / 10
        : 0;

    // If no royalties from DB, estimate at 10%
    if (totalRoyalties === 0) {
      totalRoyalties = Math.round(finTotalRevenue * 0.1);
    }

    // --- Best / Worst performing unit ---
    const sortedByRevenue = [...academyList].sort((a, b) => b.revenue - a.revenue);
    const bestUnit = sortedByRevenue.length > 0
      ? { name: sortedByRevenue[0].name, revenue: sortedByRevenue[0].revenue }
      : null;
    const worstUnit = sortedByRevenue.length > 1
      ? { name: sortedByRevenue[sortedByRevenue.length - 1].name, revenue: sortedByRevenue[sortedByRevenue.length - 1].revenue }
      : null;

    const kpis: NetworkKPIs = {
      total_academies: academyList.length,
      total_students: totalStudents,
      total_revenue: finTotalRevenue || totalRevenue,
      total_royalties: totalRoyalties || Math.round(totalRevenue * 0.1),
      avg_nps: Math.round(avgNps * 10) / 10,
      avg_attendance: Math.round(avgAttendance * 10) / 10,
    };

    return {
      kpis,
      academies: academyList,
      alerts: alertList,
      financials: {
        monthly_data: monthlyData,
        total_revenue: finTotalRevenue || totalRevenue,
        total_royalties: totalRoyalties || Math.round(totalRevenue * 0.1),
        growth_pct: growthPct,
      },
      best_unit: bestUnit,
      worst_unit: worstUnit,
    };
  } catch (error) {
    logServiceError(error, 'franchise');
    return {
      kpis: {
        total_academies: 0,
        total_students: 0,
        total_revenue: 0,
        total_royalties: 0,
        avg_nps: 0,
        avg_attendance: 0,
      },
      academies: [],
      alerts: [],
      financials: { monthly_data: [], total_revenue: 0, total_royalties: 0, growth_pct: 0 },
      best_unit: null,
      worst_unit: null,
    };
  }
}

// ====================================================================
// 4. getNetworkFinancials — Financial data by unit by month
// ====================================================================

export async function getNetworkFinancials(
  franchiseId: string,
  months?: number,
): Promise<NetworkFinancials> {
  try {
    if (isMock()) {
      const { mockGetFinancials } = await import('@/lib/mocks/franchise.mock');
      return mockGetFinancials(franchiseId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const limitRows = (months ?? 12) * 20; // generous limit for multiple academies

    const { data, error } = await supabase
      .from('franchise_financials')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('month', { ascending: true })
      .limit(limitRows);

    if (error) {
      logServiceError(error, 'franchise');
      return { monthly_data: [], total_revenue: 0, total_royalties: 0, growth_pct: 0 };
    }

    // Also fetch academy names
    const { data: acadData } = await supabase
      .from('franchise_academies')
      .select('id, name')
      .eq('franchise_id', franchiseId);

    const nameMap = new Map<string, string>();
    for (const a of (acadData ?? []) as Record<string, unknown>[]) {
      nameMap.set(a.id as string, (a.name as string) ?? '');
    }

    const rows = (data ?? []) as Record<string, unknown>[];
    const monthMap = new Map<string, MonthlyRevenueByAcademy>();
    let totalRoyalties = 0;

    for (const row of rows) {
      const month = (row.month as string) ?? '';
      const academyId = (row.academy_id as string) ?? '';
      const rev = (row.revenue as number) ?? 0;
      const royalties = (row.royalties as number) ?? 0;
      totalRoyalties += royalties;
      const entry = monthMap.get(month) ?? { month, academies: [], total: 0 };
      entry.academies.push({
        academy_id: academyId,
        academy_name: nameMap.get(academyId) ?? '',
        revenue: rev,
      });
      entry.total += rev;
      monthMap.set(month, entry);
    }
    const monthlyData = Array.from(monthMap.values()).slice(-(months ?? 12));

    const totalRevenue = monthlyData.reduce((s, m) => s + m.total, 0);
    const lastMonth = monthlyData[monthlyData.length - 1]?.total ?? 0;
    const prevMonth = monthlyData[monthlyData.length - 2]?.total ?? 0;
    const growthPct =
      prevMonth > 0
        ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100 * 10) / 10
        : 0;

    // If no royalties from DB, estimate at 10%
    if (totalRoyalties === 0) {
      totalRoyalties = Math.round(totalRevenue * 0.1);
    }

    return {
      monthly_data: monthlyData,
      total_revenue: totalRevenue,
      total_royalties: totalRoyalties,
      growth_pct: growthPct,
    };
  } catch (error) {
    logServiceError(error, 'franchise');
    return { monthly_data: [], total_revenue: 0, total_royalties: 0, growth_pct: 0 };
  }
}

// ====================================================================
// 5. getNetworkRanking — Rank units by revenue, students, NPS
// ====================================================================

export async function getNetworkRanking(franchiseId: string): Promise<RankedUnit[]> {
  try {
    if (isMock()) {
      const { mockGetAcademies } = await import('@/lib/mocks/franchise.mock');
      const academies = await mockGetAcademies(franchiseId);
      return rankAcademies(
        academies.map((a) => ({
          id: a.id,
          name: a.name,
          city: a.city,
          revenue: a.revenue,
          students: a.students,
          nps: a.nps,
        })),
      );
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_academies')
      .select('id, name, city, revenue, students_count, nps')
      .eq('franchise_id', franchiseId);

    if (error) {
      logServiceError(error, 'franchise');
      return [];
    }

    const items = (data ?? []).map((a: Record<string, unknown>) => ({
      id: a.id as string,
      name: (a.name as string) ?? '',
      city: (a.city as string) ?? '',
      revenue: (a.revenue as number) ?? 0,
      students: (a.students_count as number) ?? 0,
      nps: (a.nps as number) ?? 0,
    }));

    return rankAcademies(items);
  } catch (error) {
    logServiceError(error, 'franchise');
    return [];
  }
}

/** Helper to compute rankings across 3 dimensions */
function rankAcademies(
  items: { id: string; name: string; city: string; revenue: number; students: number; nps: number }[],
): RankedUnit[] {
  const byRevenue = [...items].sort((a, b) => b.revenue - a.revenue);
  const byStudents = [...items].sort((a, b) => b.students - a.students);
  const byNps = [...items].sort((a, b) => b.nps - a.nps);

  return byRevenue.map((item) => ({
    id: item.id,
    name: item.name,
    city: item.city,
    revenue: item.revenue,
    students: item.students,
    nps: item.nps,
    rank_revenue: byRevenue.findIndex((x) => x.id === item.id) + 1,
    rank_students: byStudents.findIndex((x) => x.id === item.id) + 1,
    rank_nps: byNps.findIndex((x) => x.id === item.id) + 1,
  }));
}

// ====================================================================
// 6. getRoyaltySummary — Royalty totals: paid, pending, overdue
// ====================================================================

export async function getRoyaltySummary(franchiseId: string): Promise<RoyaltySummary> {
  try {
    if (isMock()) {
      const { mockGetFinancials } = await import('@/lib/mocks/franchise.mock');
      const fin = await mockGetFinancials(franchiseId);
      return {
        total_paid: Math.round(fin.total_royalties * 0.7),
        total_pending: Math.round(fin.total_royalties * 0.2),
        total_overdue: Math.round(fin.total_royalties * 0.1),
        current_month_total: Math.round(fin.total_royalties / 12),
      };
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const curMonth = currentMonthStr();

    // Fetch all financials for this franchise
    const { data, error } = await supabase
      .from('franchise_financials')
      .select('month, royalties')
      .eq('franchise_id', franchiseId);

    if (error) {
      logServiceError(error, 'franchise');
      return { total_paid: 0, total_pending: 0, total_overdue: 0, current_month_total: 0 };
    }

    const rows = (data ?? []) as Record<string, unknown>[];
    let totalRoyalties = 0;
    let currentMonthTotal = 0;

    for (const row of rows) {
      const royalties = (row.royalties as number) ?? 0;
      const month = (row.month as string) ?? '';
      totalRoyalties += royalties;
      if (month === curMonth) {
        currentMonthTotal += royalties;
      }
    }

    // Also check royalty_calculations if the table exists, to get paid/pending/overdue status
    const { data: calcData, error: calcError } = await supabase
      .from('royalty_calculations')
      .select('status, total_due')
      .eq('franchise_id', franchiseId);

    if (calcError) {
      // Table may not exist -- fall back to estimate
      logServiceError(calcError, 'franchise');
      return {
        total_paid: Math.round(totalRoyalties * 0.7),
        total_pending: Math.round(totalRoyalties * 0.2),
        total_overdue: Math.round(totalRoyalties * 0.1),
        current_month_total: currentMonthTotal,
      };
    }

    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    for (const calc of (calcData ?? []) as Record<string, unknown>[]) {
      const status = calc.status as string;
      const amount = (calc.total_due as number) ?? 0;
      if (status === 'pago') totalPaid += amount;
      else if (status === 'pendente' || status === 'parcial') totalPending += amount;
      else if (status === 'atrasado') totalOverdue += amount;
    }

    // If no calc data, estimate from financials
    if (totalPaid === 0 && totalPending === 0 && totalOverdue === 0 && totalRoyalties > 0) {
      totalPaid = Math.round(totalRoyalties * 0.7);
      totalPending = Math.round(totalRoyalties * 0.2);
      totalOverdue = Math.round(totalRoyalties * 0.1);
    }

    return {
      total_paid: totalPaid,
      total_pending: totalPending,
      total_overdue: totalOverdue,
      current_month_total: currentMonthTotal,
    };
  } catch (error) {
    logServiceError(error, 'franchise');
    return { total_paid: 0, total_pending: 0, total_overdue: 0, current_month_total: 0 };
  }
}

// ====================================================================
// 7. getComplianceOverview — Compliance scores per unit
// ====================================================================

export async function getComplianceOverview(franchiseId: string): Promise<ComplianceUnit[]> {
  try {
    if (isMock()) {
      const { mockGetAcademies } = await import('@/lib/mocks/franchise.mock');
      const academies = await mockGetAcademies(franchiseId);
      return academies.map((a) => ({
        academy_id: a.id,
        academy_name: a.name,
        overall_score: Math.round(60 + Math.random() * 35),
        checked_at: new Date().toISOString(),
      }));
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Get the academy IDs for this franchise
    const { data: acadData, error: acadError } = await supabase
      .from('franchise_academies')
      .select('id, name')
      .eq('franchise_id', franchiseId);

    if (acadError) {
      logServiceError(acadError, 'franchise');
      return [];
    }

    const academyIds = (acadData ?? []).map((a: Record<string, unknown>) => a.id as string);

    if (academyIds.length === 0) return [];

    // Get the latest compliance check for each academy
    const { data: checks, error: checkError } = await supabase
      .from('franchise_compliance_checks')
      .select('academy_id, academy_name, overall_score, checked_at')
      .in('academy_id', academyIds)
      .order('checked_at', { ascending: false });

    if (checkError) {
      logServiceError(checkError, 'franchise');
      return [];
    }

    // De-duplicate: only keep the latest check per academy
    const seenAcademies = new Set<string>();
    const result: ComplianceUnit[] = [];

    for (const row of (checks ?? []) as Record<string, unknown>[]) {
      const academyId = row.academy_id as string;
      if (seenAcademies.has(academyId)) continue;
      seenAcademies.add(academyId);
      result.push({
        academy_id: academyId,
        academy_name: (row.academy_name as string) ?? '',
        overall_score: (row.overall_score as number) ?? 0,
        checked_at: (row.checked_at as string) ?? '',
      });
    }

    return result;
  } catch (error) {
    logServiceError(error, 'franchise');
    return [];
  }
}

// ====================================================================
// 8. getRevenueEvolution — Revenue chart data (last 6 months)
// ====================================================================

export async function getRevenueEvolution(franchiseId: string): Promise<RevenuePoint[]> {
  try {
    if (isMock()) {
      const { mockGetFinancials } = await import('@/lib/mocks/franchise.mock');
      const fin = await mockGetFinancials(franchiseId);
      return fin.monthly_data.slice(-6).map((m) => ({
        month: m.month,
        total: m.total,
        academies: m.academies,
      }));
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Calculate the date 6 months ago for filtering
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const sinceMonth = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('franchise_financials')
      .select('month, academy_id, revenue')
      .eq('franchise_id', franchiseId)
      .gte('month', sinceMonth)
      .order('month', { ascending: true });

    if (error) {
      logServiceError(error, 'franchise');
      return [];
    }

    // Fetch academy names
    const { data: acadData } = await supabase
      .from('franchise_academies')
      .select('id, name')
      .eq('franchise_id', franchiseId);

    const nameMap = new Map<string, string>();
    for (const a of (acadData ?? []) as Record<string, unknown>[]) {
      nameMap.set(a.id as string, (a.name as string) ?? '');
    }

    const monthMap = new Map<string, RevenuePoint>();
    for (const row of (data ?? []) as Record<string, unknown>[]) {
      const month = (row.month as string) ?? '';
      const academyId = (row.academy_id as string) ?? '';
      const rev = (row.revenue as number) ?? 0;
      const entry = monthMap.get(month) ?? { month, total: 0, academies: [] };
      entry.academies.push({
        academy_id: academyId,
        academy_name: nameMap.get(academyId) ?? '',
        revenue: rev,
      });
      entry.total += rev;
      monthMap.set(month, entry);
    }

    return Array.from(monthMap.values());
  } catch (error) {
    logServiceError(error, 'franchise');
    return [];
  }
}

// ====================================================================
// 9. getBroadcasts — List broadcasts with receipt status
// ====================================================================

export async function getBroadcastsSummary(franchiseId: string): Promise<BroadcastSummary[]> {
  try {
    if (isMock()) {
      const { mockGetBroadcastsSummary } = await import('@/lib/mocks/franchise.mock');
      return mockGetBroadcastsSummary(franchiseId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Fetch broadcasts
    const { data: broadcasts, error: bcError } = await supabase
      .from('franchise_broadcasts')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('sent_at', { ascending: false });

    if (bcError) {
      logServiceError(bcError, 'franchise');
      return [];
    }

    if (!broadcasts || broadcasts.length === 0) return [];

    const broadcastIds = broadcasts.map((b: Record<string, unknown>) => b.id as string);

    // Fetch receipts for all these broadcasts
    const { data: receipts, error: rcptError } = await supabase
      .from('franchise_broadcast_receipts')
      .select('broadcast_id, status')
      .in('broadcast_id', broadcastIds);

    if (rcptError) {
      logServiceError(rcptError, 'franchise');
    }

    // Group receipts by broadcast_id
    const receiptMap = new Map<string, { total: number; read: number; delivered: number }>();
    for (const r of (receipts ?? []) as Record<string, unknown>[]) {
      const bcId = r.broadcast_id as string;
      const status = r.status as string;
      const entry = receiptMap.get(bcId) ?? { total: 0, read: 0, delivered: 0 };
      entry.total += 1;
      if (status === 'lido') {
        entry.read += 1;
        entry.delivered += 1;
      } else if (status === 'entregue') {
        entry.delivered += 1;
      }
      receiptMap.set(bcId, entry);
    }

    return broadcasts.map((b: Record<string, unknown>) => {
      const id = b.id as string;
      const receiptStats = receiptMap.get(id) ?? { total: 0, read: 0, delivered: 0 };
      return {
        id,
        type: (b.type as string) ?? 'comunicado',
        subject: (b.subject as string) ?? '',
        body: (b.body as string) ?? '',
        channels: (b.channels as string[]) ?? [],
        sent_at: (b.sent_at as string) ?? (b.created_at as string) ?? '',
        created_by: (b.created_by as string) ?? '',
        total_recipients: receiptStats.total,
        read_count: receiptStats.read,
        delivered_count: receiptStats.delivered,
      };
    });
  } catch (error) {
    logServiceError(error, 'franchise');
    return [];
  }
}

// ====================================================================
// 10. getCurriculo — Curriculum data
// ====================================================================

export async function getCurriculo(franchiseId: string): Promise<CurriculoItem[]> {
  try {
    if (isMock()) {
      const { mockGetCurriculo } = await import('@/lib/mocks/franchise.mock');
      return mockGetCurriculo(franchiseId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_curriculos')
      .select('id, modalidade, nome, descricao, modulos')
      .eq('franchise_id', franchiseId)
      .order('modalidade', { ascending: true });

    if (error) {
      logServiceError(error, 'franchise');
      return [];
    }

    return (data ?? []).map((c: Record<string, unknown>) => ({
      id: c.id as string,
      modalidade: (c.modalidade as string) ?? '',
      nome: (c.nome as string) ?? '',
      descricao: (c.descricao as string) ?? '',
      modulos: (c.modulos as Record<string, unknown>[]) ?? [],
    }));
  } catch (error) {
    logServiceError(error, 'franchise');
    return [];
  }
}

// ====================================================================
// 11. getStandardsOverview — Standards / padronization data
// ====================================================================

export async function getStandardsOverview(franchiseId: string): Promise<StandardItem[]> {
  try {
    if (isMock()) {
      const { mockGetStandardsOverview } = await import('@/lib/mocks/franchise.mock');
      return mockGetStandardsOverview(franchiseId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_standards')
      .select('id, category, name, description, required, checklist_items, deadline')
      .eq('franchise_id', franchiseId)
      .order('category', { ascending: true });

    if (error) {
      logServiceError(error, 'franchise');
      return [];
    }

    return (data ?? []).map((s: Record<string, unknown>) => ({
      id: s.id as string,
      category: (s.category as string) ?? '',
      name: (s.name as string) ?? '',
      description: (s.description as string) ?? '',
      required: (s.required as boolean) ?? false,
      checklist_items: (s.checklist_items as Record<string, unknown>[]) ?? [],
      deadline: (s.deadline as string) ?? null,
    }));
  } catch (error) {
    logServiceError(error, 'franchise');
    return [];
  }
}

// ====================================================================
// 12. getExpansionData — Leads + current unit map
// ====================================================================

export async function getExpansionData(franchiseId: string): Promise<ExpansionData> {
  try {
    if (isMock()) {
      const { mockGetExpansionData } = await import('@/lib/mocks/franchise.mock');
      return mockGetExpansionData(franchiseId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Fetch leads
    const { data: leadsData, error: leadsError } = await supabase
      .from('franchise_leads')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('created_at', { ascending: false });

    if (leadsError) {
      logServiceError(leadsError, 'franchise');
    }

    const leads: ExpansionLead[] = (leadsData ?? []).map((l: Record<string, unknown>) => ({
      id: l.id as string,
      name: (l.name as string) ?? '',
      email: (l.email as string) ?? '',
      phone: (l.phone as string) ?? '',
      city: (l.city as string) ?? '',
      state: (l.state as string) ?? '',
      investment_capacity: (l.investment_capacity as number) ?? 0,
      experience: (l.experience as string) ?? '',
      stage: (l.stage as string) ?? 'lead',
      viability_score: (l.viability_score as number) ?? null,
      onboarding_step: (l.onboarding_step as string) ?? null,
      notes: (l.notes as string) ?? '',
    }));

    // Fetch current units for the map
    const { data: unitsData, error: unitsError } = await supabase
      .from('franchise_units')
      .select('id, name, city, state')
      .eq('franchise_id', franchiseId)
      .order('name', { ascending: true });

    if (unitsError) {
      logServiceError(unitsError, 'franchise');
    }

    const currentUnits = (unitsData ?? []).map((u: Record<string, unknown>) => ({
      id: u.id as string,
      name: (u.name as string) ?? '',
      city: (u.city as string) ?? '',
      state: (u.state as string) ?? '',
    }));

    return { leads, current_units: currentUnits };
  } catch (error) {
    logServiceError(error, 'franchise');
    return { leads: [], current_units: [] };
  }
}

// ====================================================================
// Legacy exports — keep backward compatibility with existing pages
// ====================================================================

/** @deprecated Use getNetworkUnits instead */
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

    return (data ?? []).map((a: Record<string, unknown>) => mapAcademyRow(a));
  } catch (error) {
    logServiceError(error, 'franchise');
    return [];
  }
}

/** @deprecated Use getNetworkFinancials instead */
export async function getFinancials(franchiseId: string): Promise<NetworkFinancials> {
  return getNetworkFinancials(franchiseId, 12);
}

export async function sendNetworkMessage(
  franchiseId: string,
  message: NetworkMessage,
): Promise<{ sent: number }> {
  try {
    if (isMock()) {
      const { mockSendNetworkMessage } = await import('@/lib/mocks/franchise.mock');
      return mockSendNetworkMessage(franchiseId, message);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase.from('franchise_broadcasts').insert({
      franchise_id: franchiseId,
      type: 'comunicado',
      subject: message.subject,
      body: message.body,
      channels: [message.channel],
      recipient_ids: message.recipients,
    });

    if (error) {
      logServiceError(error, 'franchise');
      return { sent: 0 };
    }

    return { sent: message.recipients.length || 1 };
  } catch (error) {
    logServiceError(error, 'franchise');
    return { sent: 0 };
  }
}
