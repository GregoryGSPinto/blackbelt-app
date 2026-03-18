import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface ImportRow {
  name: string;
  email: string;
  phone: string;
  modality: string;
  belt: string;
}

export interface ParsedCSVResult {
  headers: string[];
  rows: ImportRow[];
  totalRows: number;
}

export interface DuplicateCheckResult {
  duplicates: number[];
  matchDetails: Record<number, string>;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
  errorDetails: { row: number; reason: string }[];
}

export async function parseCSV(file: File): Promise<ParsedCSVResult> {
  try {
    if (isMock()) {
      const { mockParseCSV } = await import('@/lib/mocks/importacao.mock');
      return mockParseCSV(file);
    }
    // API not yet implemented — use mock
    const { mockParseCSV } = await import('@/lib/mocks/importacao.mock');
      return mockParseCSV(file);
  } catch (error) { handleServiceError(error, 'importacao.parseCSV'); }
}

export async function detectDuplicates(rows: ImportRow[], academyId: string): Promise<DuplicateCheckResult> {
  try {
    if (isMock()) {
      const { mockDetectDuplicates } = await import('@/lib/mocks/importacao.mock');
      return mockDetectDuplicates(rows, academyId);
    }
    try {
      const res = await fetch('/api/import/duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows, academyId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'importacao.detectDuplicates');
      return res.json();
    } catch {
      console.warn('[importacao.detectDuplicates] API not available, using mock fallback');
      const { mockDetectDuplicates } = await import('@/lib/mocks/importacao.mock');
      return mockDetectDuplicates(rows, academyId);
    }
  } catch (error) { handleServiceError(error, 'importacao.detectDuplicates'); }
}

export async function importStudents(rows: ImportRow[], academyId: string): Promise<ImportResult> {
  try {
    if (isMock()) {
      const { mockImportStudents } = await import('@/lib/mocks/importacao.mock');
      return mockImportStudents(rows, academyId);
    }
    try {
      const res = await fetch('/api/import/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows, academyId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'importacao.importStudents');
      return res.json();
    } catch {
      console.warn('[importacao.importStudents] API not available, using mock fallback');
      const { mockImportStudents } = await import('@/lib/mocks/importacao.mock');
      return mockImportStudents(rows, academyId);
    }
  } catch (error) { handleServiceError(error, 'importacao.importStudents'); }
}
