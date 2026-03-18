import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export async function generateMonthlyNarrative(academyId: string, month: string): Promise<string> {
  try {
    if (isMock()) {
      const { mockGenerateMonthlyNarrative } = await import('@/lib/mocks/ai-reports.mock');
      return mockGenerateMonthlyNarrative(academyId, month);
    }
    try {
      const res = await fetch('/api/ai/monthly-narrative', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ academyId, month }) });
      return res.json().then((r: { narrative: string }) => r.narrative);
    } catch {
      console.warn('[ai-reports.generateMonthlyNarrative] API not available, using mock fallback');
      const { mockGenerateMonthlyNarrative } = await import('@/lib/mocks/ai-reports.mock');
      return mockGenerateMonthlyNarrative(academyId, month);
    }
  } catch (error) { handleServiceError(error, 'aiReports.monthly'); }
}

export async function generateStudentReport(studentId: string): Promise<string> {
  try {
    if (isMock()) {
      const { mockGenerateStudentReport } = await import('@/lib/mocks/ai-reports.mock');
      return mockGenerateStudentReport(studentId);
    }
    try {
      const res = await fetch('/api/ai/student-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId }) });
      return res.json().then((r: { report: string }) => r.report);
    } catch {
      console.warn('[ai-reports.generateStudentReport] API not available, using mock fallback');
      const { mockGenerateStudentReport } = await import('@/lib/mocks/ai-reports.mock');
      return mockGenerateStudentReport(studentId);
    }
  } catch (error) { handleServiceError(error, 'aiReports.student'); }
}

export async function generateClassReport(classId: string, month: string): Promise<string> {
  try {
    if (isMock()) {
      const { mockGenerateClassReport } = await import('@/lib/mocks/ai-reports.mock');
      return mockGenerateClassReport(classId, month);
    }
    try {
      const res = await fetch('/api/ai/class-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ classId, month }) });
      return res.json().then((r: { report: string }) => r.report);
    } catch {
      console.warn('[ai-reports.generateClassReport] API not available, using mock fallback');
      const { mockGenerateClassReport } = await import('@/lib/mocks/ai-reports.mock');
      return mockGenerateClassReport(classId, month);
    }
  } catch (error) { handleServiceError(error, 'aiReports.class'); }
}
