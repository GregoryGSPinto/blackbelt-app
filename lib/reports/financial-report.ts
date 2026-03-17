// ============================================================
// BlackBelt v2 — Financial Report Generator
// Generates structured financial report data
// ============================================================

import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import type { FinancialReportData } from '@/lib/types/report';

export async function generateFinancialReport(
  academyId: string,
  period: string,
): Promise<FinancialReportData> {
  try {
    if (isMock()) {
      return getMockFinancialReport(academyId, period);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'reports.financial');
  }
}

function getMockFinancialReport(_academyId: string, period: string): FinancialReportData {
  const revenue = 47890;
  const revenuePrev = 44690;
  const changePct = Math.round(((revenue - revenuePrev) / revenuePrev) * 100);

  return {
    meta: {
      academy_name: 'Academia BlackBelt BJJ',
      generated_at: new Date().toISOString(),
      period,
      generated_by: 'Sistema BlackBelt',
    },
    summary: {
      revenue,
      revenue_prev: revenuePrev,
      revenue_change_pct: changePct,
      pending: 891,
      overdue: 4350,
      overdue_count: 3,
      paid_count: 17,
      total_count: 20,
      ticket_medio: Math.round(revenue / 17),
    },
    revenue_by_month: [
      { month: 'Out', revenue: 38500, pending: 1200 },
      { month: 'Nov', revenue: 40200, pending: 800 },
      { month: 'Dez', revenue: 41800, pending: 1500 },
      { month: 'Jan', revenue: 43500, pending: 900 },
      { month: 'Fev', revenue: 44690, pending: 1100 },
      { month: 'Mar', revenue: 47890, pending: 4350 },
    ],
    by_payment_method: [
      { method: 'PIX', count: 9, total: 24150 },
      { method: 'Cartao', count: 5, total: 15620 },
      { method: 'Boleto', count: 3, total: 8120 },
    ],
    overdue_list: [
      { student_name: 'Bruno Alves', amount: 397, due_date: '2026-03-10', days_overdue: 7 },
      { student_name: 'Julia Rocha', amount: 397, due_date: '2026-03-10', days_overdue: 7 },
      { student_name: 'Carlos Mendes', amount: 397, due_date: '2026-03-10', days_overdue: 7 },
    ],
  };
}
