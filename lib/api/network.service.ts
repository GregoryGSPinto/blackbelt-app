import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

export interface NetworkAcademy {
  id: string;
  name: string;
  slug: string;
  city: string;
  totalStudents: number;
  activeStudents: number;
  monthlyRevenue: number;
  attendanceRate: number;
}

export interface NetworkDashboardDTO {
  totalAcademies: number;
  totalStudents: number;
  totalRevenue: number;
  avgAttendance: number;
  academies: NetworkAcademy[];
}

export interface ComparisonDTO {
  metric: string;
  academies: { id: string; name: string; value: number }[];
}

export interface ConsolidatedFinancials {
  totalMRR: number;
  totalOverdue: number;
  byAcademy: { id: string; name: string; mrr: number; overdue: number; churn: number }[];
}

export async function getNetworkDashboard(ownerId: string): Promise<NetworkDashboardDTO> {
  try {
    if (isMock()) {
      const { mockGetNetworkDashboard } = await import('@/lib/mocks/network.mock');
      return mockGetNetworkDashboard(ownerId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // 1. Get franchise network for this owner
      const { data: networks, error: netError } = await supabase
        .from('franchise_networks')
        .select('id, name')
        .eq('owner_profile_id', ownerId)
        .limit(1);

      if (netError) {
        logServiceError(netError, 'network');
      }

      const network = networks?.[0];
      if (!network) {
        return { totalAcademies: 0, totalStudents: 0, totalRevenue: 0, avgAttendance: 0, academies: [] };
      }

      // 2. Get franchise_academies for that network, join academies by id
      const { data: franchiseAcademies, error: faError } = await supabase
        .from('franchise_academies')
        .select('id, name, city')
        .eq('franchise_id', network.id);

      if (faError) {
        logServiceError(faError, 'network');
      }

      const faList = franchiseAcademies ?? [];

      // 3. For each academy, count students and sum paid invoices
      const academies: NetworkAcademy[] = await Promise.all(
        faList.map(async (fa: { id: string; name: string; city: string | null }) => {
          // Try to find the real academy record
          const { data: academy } = await supabase
            .from('academies')
            .select('id, name, slug')
            .eq('id', fa.id)
            .maybeSingle();

          const academyId = academy?.id ?? fa.id;
          const academyName = academy?.name ?? fa.name ?? '';
          const academySlug = academy?.slug ?? '';

          // Count total students
          const { count: totalStudents } = await supabase
            .from('students')
            .select('id', { count: 'exact', head: true })
            .eq('academy_id', academyId);

          // Count active students (those with active memberships)
          const { count: activeStudents } = await supabase
            .from('memberships')
            .select('id', { count: 'exact', head: true })
            .eq('academy_id', academyId)
            .eq('status', 'active');

          // Sum paid invoices this month for revenue
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

          const { data: invoiceData } = await supabase
            .from('invoices')
            .select('amount, subscription_id, subscriptions!inner(student_id, students!inner(academy_id))')
            .eq('subscriptions.students.academy_id', academyId)
            .eq('status', 'paid')
            .gte('paid_at', monthStart)
            .lte('paid_at', monthEnd);

          const monthlyRevenue = (invoiceData ?? []).reduce(
            (sum: number, inv: Record<string, unknown>) => sum + (Number(inv.amount) || 0),
            0
          );

          // Attendance rate: attendance records this month / (total students * classes this month)
          // Simplified: just count attendance records
          const { count: attendanceCount } = await supabase
            .from('attendance')
            .select('id', { count: 'exact', head: true })
            .in('student_id', (await supabase.from('students').select('id').eq('academy_id', academyId)).data?.map((s: { id: string }) => s.id) ?? [])
            .gte('checked_at', monthStart)
            .lte('checked_at', monthEnd);

          const attendanceRate = (totalStudents ?? 0) > 0
            ? Math.round(((attendanceCount ?? 0) / Math.max(totalStudents ?? 1, 1)) * 100)
            : 0;

          return {
            id: academyId,
            name: academyName,
            slug: academySlug,
            city: fa.city ?? '',
            totalStudents: totalStudents ?? 0,
            activeStudents: activeStudents ?? 0,
            monthlyRevenue,
            attendanceRate: Math.min(attendanceRate, 100),
          };
        })
      );

      const totalStudents = academies.reduce((s, a) => s + a.totalStudents, 0);
      const totalRevenue = academies.reduce((s, a) => s + a.monthlyRevenue, 0);
      const avgAttendance = academies.length
        ? Math.round(academies.reduce((s, a) => s + a.attendanceRate, 0) / academies.length)
        : 0;

      return {
        totalAcademies: academies.length,
        totalStudents,
        totalRevenue,
        avgAttendance,
        academies,
      };
    } catch (err) {
      logServiceError(err, 'network');
      const { mockGetNetworkDashboard } = await import('@/lib/mocks/network.mock');
      return mockGetNetworkDashboard(ownerId);
    }
  } catch (error) {
    logServiceError(error, 'network');
    return { totalAcademies: 0, totalStudents: 0, totalRevenue: 0, avgAttendance: 0, academies: [] };
  }
}

export async function getAcademyComparison(academyIds: string[], metric: string): Promise<ComparisonDTO> {
  try {
    if (isMock()) {
      const { mockGetAcademyComparison } = await import('@/lib/mocks/network.mock');
      return mockGetAcademyComparison(academyIds, metric);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const results: { id: string; name: string; value: number }[] = await Promise.all(
        academyIds.map(async (academyId) => {
          // Get academy name
          const { data: academy } = await supabase
            .from('academies')
            .select('name')
            .eq('id', academyId)
            .maybeSingle();

          const name = academy?.name ?? academyId;
          let value = 0;

          if (metric === 'students') {
            const { count } = await supabase
              .from('students')
              .select('id', { count: 'exact', head: true })
              .eq('academy_id', academyId);
            value = count ?? 0;
          } else if (metric === 'revenue') {
            const { data: invoiceData } = await supabase
              .from('invoices')
              .select('amount, subscription_id, subscriptions!inner(student_id, students!inner(academy_id))')
              .eq('subscriptions.students.academy_id', academyId)
              .eq('status', 'paid');
            value = (invoiceData ?? []).reduce(
              (sum: number, inv: Record<string, unknown>) => sum + (Number(inv.amount) || 0),
              0
            );
          } else if (metric === 'attendance') {
            const { data: studentIds } = await supabase
              .from('students')
              .select('id')
              .eq('academy_id', academyId);

            const ids = (studentIds ?? []).map((s: { id: string }) => s.id);
            if (ids.length > 0) {
              const now = new Date();
              const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
              const { count } = await supabase
                .from('attendance')
                .select('id', { count: 'exact', head: true })
                .in('student_id', ids)
                .gte('checked_at', monthStart);
              value = count ?? 0;
            }
          }

          return { id: academyId, name, value };
        })
      );

      return { metric, academies: results };
    } catch (err) {
      logServiceError(err, 'network');
      const { mockGetAcademyComparison } = await import('@/lib/mocks/network.mock');
      return mockGetAcademyComparison(academyIds, metric);
    }
  } catch (error) {
    logServiceError(error, 'network');
    return { metric, academies: [] };
  }
}

export async function getNetworkFinancials(ownerId: string): Promise<ConsolidatedFinancials> {
  try {
    if (isMock()) {
      const { mockGetNetworkFinancials } = await import('@/lib/mocks/network.mock');
      return mockGetNetworkFinancials(ownerId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // 1. Get all academies in owner's network
      const { data: networks } = await supabase
        .from('franchise_networks')
        .select('id')
        .eq('owner_profile_id', ownerId)
        .limit(1);

      const network = networks?.[0];
      if (!network) {
        return { totalMRR: 0, totalOverdue: 0, byAcademy: [] };
      }

      const { data: franchiseAcademies } = await supabase
        .from('franchise_academies')
        .select('id, name')
        .eq('franchise_id', network.id);

      const faList = franchiseAcademies ?? [];

      // 2. Aggregate invoices by status across all academies
      const byAcademy = await Promise.all(
        faList.map(async (fa: { id: string; name: string | null }) => {
          // Get academy name from real table if available
          const { data: academy } = await supabase
            .from('academies')
            .select('name')
            .eq('id', fa.id)
            .maybeSingle();

          const name = academy?.name ?? fa.name ?? '';

          // Get student IDs for this academy
          const { data: students } = await supabase
            .from('students')
            .select('id')
            .eq('academy_id', fa.id);

          const studentIds = (students ?? []).map((s: { id: string }) => s.id);

          let mrr = 0;
          let overdue = 0;
          let cancelledCount = 0;
          let totalSubCount = 0;

          if (studentIds.length > 0) {
            // Get subscriptions for these students
            const { data: subs } = await supabase
              .from('subscriptions')
              .select('id, status, plan_id, plans(price)')
              .in('student_id', studentIds);

            const subList = subs ?? [];
            totalSubCount = subList.length;

            // MRR = sum of plan prices for active subscriptions
            mrr = subList
              .filter((s: Record<string, unknown>) => s.status === 'active')
              .reduce((sum: number, s: Record<string, unknown>) => {
                const plans = s.plans as Record<string, unknown> | null;
                return sum + (Number(plans?.price) || 0);
              }, 0);

            cancelledCount = subList.filter((s: Record<string, unknown>) => s.status === 'cancelled').length;

            // Overdue = sum of open/uncollectible invoices past due
            const subIds = subList.map((s: Record<string, unknown>) => s.id as string);
            if (subIds.length > 0) {
              const today = new Date().toISOString().split('T')[0];
              const { data: overdueInvoices } = await supabase
                .from('invoices')
                .select('amount')
                .in('subscription_id', subIds)
                .in('status', ['open', 'uncollectible'])
                .lt('due_date', today);

              overdue = (overdueInvoices ?? []).reduce(
                (sum: number, inv: Record<string, unknown>) => sum + (Number(inv.amount) || 0),
                0
              );
            }
          }

          const churn = totalSubCount > 0
            ? Math.round((cancelledCount / totalSubCount) * 1000) / 10
            : 0;

          return { id: fa.id, name, mrr, overdue, churn };
        })
      );

      const totalMRR = byAcademy.reduce((s, a) => s + a.mrr, 0);
      const totalOverdue = byAcademy.reduce((s, a) => s + a.overdue, 0);

      return { totalMRR, totalOverdue, byAcademy };
    } catch (err) {
      logServiceError(err, 'network');
      const { mockGetNetworkFinancials } = await import('@/lib/mocks/network.mock');
      return mockGetNetworkFinancials(ownerId);
    }
  } catch (error) {
    logServiceError(error, 'network');
    return { totalMRR: 0, totalOverdue: 0, byAcademy: [] };
  }
}

export async function transferStudent(studentId: string, fromAcademy: string, toAcademy: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockTransferStudent } = await import('@/lib/mocks/network.mock');
      return mockTransferStudent(studentId, fromAcademy, toAcademy);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // 1. Update students SET academy_id = toAcademy WHERE id = studentId AND academy_id = fromAcademy
      const { error: studentError } = await supabase
        .from('students')
        .update({ academy_id: toAcademy })
        .eq('id', studentId)
        .eq('academy_id', fromAcademy);

      if (studentError) {
        logServiceError(studentError, 'network');
        return;
      }

      // 2. Update memberships: deactivate old, create/activate new
      // Get the student's profile_id
      const { data: student } = await supabase
        .from('students')
        .select('profile_id')
        .eq('id', studentId)
        .maybeSingle();

      if (student?.profile_id) {
        // Deactivate old membership
        const { error: deactivateError } = await supabase
          .from('memberships')
          .update({ status: 'inactive' })
          .eq('profile_id', student.profile_id)
          .eq('academy_id', fromAcademy);

        if (deactivateError) {
          logServiceError(deactivateError, 'network');
        }

        // Upsert new membership for target academy
        const { error: upsertError } = await supabase
          .from('memberships')
          .upsert(
            {
              profile_id: student.profile_id,
              academy_id: toAcademy,
              role: 'aluno_adulto',
              status: 'active',
            },
            { onConflict: 'profile_id,academy_id,role' }
          );

        if (upsertError) {
          logServiceError(upsertError, 'network');
        }
      }
    } catch (err) {
      logServiceError(err, 'network');
    }
  } catch (error) {
    logServiceError(error, 'network');
  }
}
