// ============================================================
// BlackBelt v2 — Monthly Report Generator
// Generates structured monthly academy report data
// ============================================================

import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import type { MonthlyReportData } from '@/lib/types/report';

export async function generateMonthlyReport(
  academyId: string,
  period: string,
): Promise<MonthlyReportData> {
  try {
    if (isMock()) {
      return getMockMonthlyReport(academyId, period);
    }
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'reports.monthly');
  }
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
