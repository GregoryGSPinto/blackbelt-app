import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import { logger } from '@/lib/monitoring/logger';

// ── Types ─────────────────────────────────────────────────────

export interface WeeklyReportData {
  academyName: string;
  period: { start: string; end: string };
  newStudents: number;
  totalAttendance: number;
  avgAttendanceRate: number;
  revenue: number;
  revenueChange: number;
  atRiskStudents: { name: string; daysSinceLastVisit: number }[];
  highlights: string[];
  topClass: { name: string; attendance: number };
}

export interface ReportRecipient {
  role: 'admin' | 'professor' | 'parent';
  name: string;
  email: string;
}

// ── Service ───────────────────────────────────────────────────

export async function generateWeeklyReport(academyId: string): Promise<WeeklyReportData> {
  try {
    if (isMock()) {
      return {
        academyName: 'Guerreiros BJJ',
        period: { start: '2026-03-10', end: '2026-03-16' },
        newStudents: 4,
        totalAttendance: 342,
        avgAttendanceRate: 78,
        revenue: 12450,
        revenueChange: 8.5,
        atRiskStudents: [
          { name: 'Bruno Lima', daysSinceLastVisit: 7 },
          { name: 'Marcos Oliveira', daysSinceLastVisit: 12 },
        ],
        highlights: [
          'Ana Clara completou 100 treinos',
          'Turma de BJJ Avançado bateu recorde de presença',
          '3 novos alunos vieram por indicação',
        ],
        topClass: { name: 'BJJ Fundamentos', attendance: 28 },
      };
    }
    const res = await fetch(`/api/reports/weekly?academyId=${academyId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'weeklyReport.generate');
  }
}

export async function sendWeeklyReport(
  academyId: string,
  recipients: ReportRecipient[],
): Promise<{ sent: number }> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] Sending weekly report', { recipientCount: recipients.length });
      return { sent: recipients.length };
    }
    const res = await fetch('/api/reports/weekly/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ academyId, recipients }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'weeklyReport.send');
  }
}
