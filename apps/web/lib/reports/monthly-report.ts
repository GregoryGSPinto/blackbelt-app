// ============================================================
// BlackBelt v2 — Monthly Report Generator
// Generates structured monthly academy report data
// ============================================================

import { isMock } from '@/lib/env';
import type { MonthlyReportData } from '@/lib/types/report';

export async function generateMonthlyReport(
  academyId: string,
  period: string,
): Promise<MonthlyReportData> {
  if (isMock()) {
    return getMockMonthlyReport(academyId, period);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
  const startOfPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfPrev = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

  // Parallel queries
  const [
    studentsRes,
    newStudentsRes,
    attendanceRes,
    revenueRes,
    prevRevenueRes,
    overdueRes,
    academyRes,
  ] = await Promise.all([
    supabase.from('students').select('belt').eq('academy_id', academyId),
    supabase.from('students').select('id', { count: 'exact', head: true }).eq('academy_id', academyId).gte('created_at', startOfMonth),
    supabase.from('attendance').select('id', { count: 'exact', head: true }).gte('checked_at', startOfMonth).lte('checked_at', endOfMonth),
    supabase.from('invoices').select('amount, subscriptions!inner(plans!inner(academy_id))').eq('subscriptions.plans.academy_id', academyId).eq('status', 'paid').gte('due_date', startOfMonth.slice(0, 10)).lte('due_date', endOfMonth.slice(0, 10)),
    supabase.from('invoices').select('amount, subscriptions!inner(plans!inner(academy_id))').eq('subscriptions.plans.academy_id', academyId).eq('status', 'paid').gte('due_date', startOfPrev.slice(0, 10)).lte('due_date', endOfPrev.slice(0, 10)),
    supabase.from('invoices').select('amount, subscriptions!inner(plans!inner(academy_id))').eq('subscriptions.plans.academy_id', academyId).in('status', ['open', 'uncollectible']).lt('due_date', now.toISOString().slice(0, 10)),
    supabase.from('academies').select('name').eq('id', academyId).single(),
  ]);

  const students = studentsRes.data ?? [];
  const totalStudents = students.length;
  const newStudents = newStudentsRes.count ?? 0;
  const totalAttendance = attendanceRes.count ?? 0;

  type AmtRow = { amount: number };
  const revenue = (revenueRes.data ?? []).reduce((s: number, r: AmtRow) => s + r.amount, 0);
  const revenuePrev = (prevRevenueRes.data ?? []).reduce((s: number, r: AmtRow) => s + r.amount, 0);
  const overdueRows = overdueRes.data ?? [];
  const overdueAmount = overdueRows.reduce((s: number, r: AmtRow) => s + r.amount, 0);

  // Belt distribution
  const beltMap = new Map<string, number>();
  for (const s of students) {
    const belt = (s.belt as string) || 'Sem faixa';
    beltMap.set(belt, (beltMap.get(belt) ?? 0) + 1);
  }
  const belt_distribution = Array.from(beltMap.entries()).map(([belt, count]) => ({ belt, count }));

  const academyName = (academyRes.data?.name as string) ?? 'Academia';

  return {
    meta: {
      academy_name: academyName,
      generated_at: now.toISOString(),
      period,
      generated_by: 'Sistema BlackBelt',
    },
    summary: {
      total_students: totalStudents,
      new_students: newStudents,
      churned_students: 0,
      active_classes: 0,
      total_attendance: totalAttendance,
      attendance_rate: totalStudents > 0 ? Math.round((totalAttendance / (totalStudents * 20)) * 100) : 0,
      revenue,
      revenue_prev: revenuePrev,
      overdue_amount: overdueAmount,
      overdue_count: overdueRows.length,
    },
    top_classes: [],
    belt_distribution,
    retention: {
      rate: totalStudents > 0 ? Math.round(((totalStudents - 0) / totalStudents) * 1000) / 10 : 0,
      at_risk_count: 0,
    },
  };
}

function getMockMonthlyReport(_academyId: string, period: string): MonthlyReportData {
  return {
    meta: {
      academy_name: 'Academia BlackBelt BJJ',
      generated_at: new Date().toISOString(),
      period,
      generated_by: 'Sistema BlackBelt',
    },
    summary: {
      total_students: 187,
      new_students: 12,
      churned_students: 3,
      active_classes: 18,
      total_attendance: 2340,
      attendance_rate: 78.5,
      revenue: 47890,
      revenue_prev: 44690,
      overdue_amount: 4350,
      overdue_count: 3,
    },
    top_classes: [
      { class_name: 'Jiu-Jitsu Fundamentals', modality: 'Jiu-Jitsu', attendance_rate: 92, students: 28 },
      { class_name: 'Muay Thai Avancado', modality: 'Muay Thai', attendance_rate: 88, students: 22 },
      { class_name: 'Kids BJJ', modality: 'Jiu-Jitsu', attendance_rate: 85, students: 35 },
      { class_name: 'No-Gi Intermediario', modality: 'Jiu-Jitsu', attendance_rate: 82, students: 18 },
      { class_name: 'Boxe Fitness', modality: 'Boxe', attendance_rate: 79, students: 15 },
    ],
    belt_distribution: [
      { belt: 'Branca', count: 72 },
      { belt: 'Cinza', count: 15 },
      { belt: 'Amarela', count: 12 },
      { belt: 'Laranja', count: 8 },
      { belt: 'Verde', count: 6 },
      { belt: 'Azul', count: 38 },
      { belt: 'Roxa', count: 22 },
      { belt: 'Marrom', count: 10 },
      { belt: 'Preta', count: 4 },
    ],
    retention: {
      rate: 94.2,
      at_risk_count: 7,
    },
  };
}
