import { isMock } from '@/lib/env';

export async function generateMonthlyNarrative(academyId: string, month: string): Promise<string> {
  try {
    if (isMock()) {
      const { mockGenerateMonthlyNarrative } = await import('@/lib/mocks/ai-reports.mock');
      return mockGenerateMonthlyNarrative(academyId, month);
    }
    try {
      const res = await fetch('/api/ai/monthly-narrative', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ academyId, month }) });
      if (!res.ok) {
        console.warn('[generateMonthlyNarrative] API error:', res.status);
        return '';
      }
      return res.json().then((r: { narrative: string }) => r.narrative);
    } catch {
      console.warn('[ai-reports.generateMonthlyNarrative] API not available, using mock fallback');
      const { mockGenerateMonthlyNarrative } = await import('@/lib/mocks/ai-reports.mock');
      return mockGenerateMonthlyNarrative(academyId, month);
    }
  } catch (error) {
    console.warn('[generateMonthlyNarrative] Fallback:', error);
    return '';
  }
}

export async function generateStudentReport(studentId: string): Promise<string> {
  try {
    if (isMock()) {
      const { mockGenerateStudentReport } = await import('@/lib/mocks/ai-reports.mock');
      return mockGenerateStudentReport(studentId);
    }
    try {
      const res = await fetch('/api/ai/student-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId }) });
      if (!res.ok) {
        console.warn('[generateStudentReport] API error:', res.status);
        return '';
      }
      return res.json().then((r: { report: string }) => r.report);
    } catch {
      console.warn('[ai-reports.generateStudentReport] API not available, using mock fallback');
      const { mockGenerateStudentReport } = await import('@/lib/mocks/ai-reports.mock');
      return mockGenerateStudentReport(studentId);
    }
  } catch (error) {
    console.warn('[generateStudentReport] Fallback:', error);
    return '';
  }
}

export async function generateClassReport(classId: string, month: string): Promise<string> {
  try {
    if (isMock()) {
      const { mockGenerateClassReport } = await import('@/lib/mocks/ai-reports.mock');
      return mockGenerateClassReport(classId, month);
    }
    try {
      const res = await fetch('/api/ai/class-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ classId, month }) });
      if (!res.ok) {
        console.warn('[generateClassReport] API error:', res.status);
        return '';
      }
      return res.json().then((r: { report: string }) => r.report);
    } catch {
      console.warn('[ai-reports.generateClassReport] API not available, using mock fallback');
      const { mockGenerateClassReport } = await import('@/lib/mocks/ai-reports.mock');
      return mockGenerateClassReport(classId, month);
    }
  } catch (error) {
    console.warn('[generateClassReport] Fallback:', error);
    return '';
  }
}
