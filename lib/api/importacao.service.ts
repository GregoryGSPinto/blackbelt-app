import { isMock } from '@/lib/env';

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
    // CSV parsing is client-side only, no Supabase needed
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const rows: ImportRow[] = lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim());
      return { name: cols[0] ?? '', email: cols[1] ?? '', phone: cols[2] ?? '', modality: cols[3] ?? '', belt: cols[4] ?? '' };
    });
    return { headers, rows, totalRows: rows.length };
  } catch (error) {
    console.error('[parseCSV] Fallback:', error);
    return { headers: [], rows: [], totalRows: 0 };
  }
}

export async function detectDuplicates(rows: ImportRow[], academyId: string): Promise<DuplicateCheckResult> {
  try {
    if (isMock()) {
      const { mockDetectDuplicates } = await import('@/lib/mocks/importacao.mock');
      return mockDetectDuplicates(rows, academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const emails = rows.map(r => r.email).filter(Boolean);
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('academy_id', academyId)
      .in('email', emails);
    if (error || !data) {
      console.error('[detectDuplicates] Supabase error:', error?.message);
      return { duplicates: [], matchDetails: {} };
    }
    const existingEmails = new Set(data.map((d: { email: string }) => d.email));
    const duplicates: number[] = [];
    const matchDetails: Record<number, string> = {};
    rows.forEach((r, i) => {
      if (existingEmails.has(r.email)) {
        duplicates.push(i);
        matchDetails[i] = `Email ${r.email} already exists`;
      }
    });
    return { duplicates, matchDetails };
  } catch (error) {
    console.error('[detectDuplicates] Fallback:', error);
    return { duplicates: [], matchDetails: {} };
  }
}

export async function importStudents(rows: ImportRow[], academyId: string): Promise<ImportResult> {
  try {
    if (isMock()) {
      const { mockImportStudents } = await import('@/lib/mocks/importacao.mock');
      return mockImportStudents(rows, academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let imported = 0;
    let skipped = 0;
    const errorDetails: { row: number; reason: string }[] = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const { error } = await supabase
        .from('profiles')
        .insert({ academy_id: academyId, display_name: r.name, email: r.email, phone: r.phone, modality: r.modality, belt: r.belt, role: 'student' });
      if (error) {
        if (error.code === '23505') {
          skipped++;
        } else {
          errorDetails.push({ row: i, reason: error.message });
        }
      } else {
        imported++;
      }
    }
    return { imported, skipped, errors: errorDetails.length, errorDetails };
  } catch (error) {
    console.error('[importStudents] Fallback:', error);
    return { imported: 0, skipped: 0, errors: rows.length, errorDetails: [{ row: 0, reason: 'Unexpected error' }] };
  }
}
