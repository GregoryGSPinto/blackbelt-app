import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';
import { logServiceError } from '@/lib/api/errors';

// ── Types ─────────────────────────────────────────────────────

export interface ImportColumnMapping {
  csvColumn: string;
  systemField: string;
}

export interface ImportPreviewRow {
  rowNumber: number;
  data: Record<string, string>;
  errors: string[];
  valid: boolean;
}

export interface ImportPreview {
  headers: string[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: ImportPreviewRow[];
  suggestedMappings: ImportColumnMapping[];
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

const STUDENT_FIELDS = [
  { field: 'name', label: 'Nome', required: true },
  { field: 'email', label: 'Email', required: true },
  { field: 'phone', label: 'Telefone', required: false },
  { field: 'belt', label: 'Faixa', required: false },
  { field: 'class', label: 'Turma', required: false },
  { field: 'birth_date', label: 'Data de Nascimento', required: false },
  { field: 'cpf', label: 'CPF', required: false },
];

export function getAvailableFields() {
  return STUDENT_FIELDS;
}

// ── Parse CSV ─────────────────────────────────────────────────

export function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || '';
    });
    return row;
  });

  return { headers, rows };
}

// ── Suggest mappings ──────────────────────────────────────────

function suggestMapping(csvHeaders: string[]): ImportColumnMapping[] {
  const mappings: ImportColumnMapping[] = [];
  const fieldAliases: Record<string, string[]> = {
    name: ['nome', 'name', 'aluno', 'student'],
    email: ['email', 'e-mail', 'e_mail'],
    phone: ['telefone', 'phone', 'celular', 'tel'],
    belt: ['faixa', 'belt', 'graduacao', 'graduação'],
    class: ['turma', 'class', 'classe'],
    birth_date: ['nascimento', 'birth', 'data_nascimento', 'birth_date', 'dt_nasc'],
    cpf: ['cpf', 'documento', 'document'],
  };

  for (const header of csvHeaders) {
    const lower = header.toLowerCase().trim();
    for (const [field, aliases] of Object.entries(fieldAliases)) {
      if (aliases.some((a) => lower.includes(a))) {
        mappings.push({ csvColumn: header, systemField: field });
        break;
      }
    }
  }

  return mappings;
}

// ── Preview import ────────────────────────────────────────────

export async function previewImport(
  file: File,
  mappings?: ImportColumnMapping[],
): Promise<ImportPreview> {
  try {
    const text = await file.text();
    const { headers, rows } = parseCSV(text);
    const suggestedMappings = mappings || suggestMapping(headers);

    const nameMapping = suggestedMappings.find((m) => m.systemField === 'name');
    const emailMapping = suggestedMappings.find((m) => m.systemField === 'email');

    const previewRows: ImportPreviewRow[] = rows.slice(0, 20).map((row, i) => {
      const errors: string[] = [];
      if (nameMapping && !row[nameMapping.csvColumn]) errors.push('Nome obrigatório');
      if (emailMapping && !row[emailMapping.csvColumn]) errors.push('Email obrigatório');
      if (emailMapping && row[emailMapping.csvColumn] && !row[emailMapping.csvColumn].includes('@')) {
        errors.push('Email inválido');
      }
      return { rowNumber: i + 2, data: row, errors, valid: errors.length === 0 };
    });

    const validRows = previewRows.filter((r) => r.valid).length;

    return {
      headers,
      totalRows: rows.length,
      validRows,
      invalidRows: previewRows.length - validRows,
      rows: previewRows,
      suggestedMappings,
    };
  } catch (error) {
    logServiceError(error, 'import');
    return { headers: [], totalRows: 0, validRows: 0, invalidRows: 0, rows: [], suggestedMappings: [] };
  }
}

// ── Execute import ────────────────────────────────────────────

export async function executeImport(
  academyId: string,
  file: File,
  mappings: ImportColumnMapping[],
): Promise<ImportResult> {
  try {
    if (isMock()) {
      const text = await file.text();
      const { rows } = parseCSV(text);
      const count = rows.length;
      logger.debug('[MOCK] Importing students', { count, academyId });
      return {
        imported: Math.floor(count * 0.95),
        skipped: Math.ceil(count * 0.05),
        errors: [
          { row: 3, message: 'Email duplicado' },
        ],
      };
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const text = await file.text();
    const { rows } = parseCSV(text);

    let imported = 0;
    let skipped = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const studentData: Record<string, string> = {};

      for (const mapping of mappings) {
        studentData[mapping.systemField] = row[mapping.csvColumn] || '';
      }

      if (!studentData.name || !studentData.email) {
        skipped++;
        errors.push({ row: i + 2, message: 'Nome ou email ausente' });
        continue;
      }

      const { error } = await supabase
        .from('students')
        .insert({
          academy_id: academyId,
          name: studentData.name,
          email: studentData.email,
          phone: studentData.phone || null,
          belt: studentData.belt || 'white',
          birth_date: studentData.birth_date || null,
          cpf: studentData.cpf || null,
        });

      if (error) {
        skipped++;
        errors.push({ row: i + 2, message: error.message });
      } else {
        imported++;
      }
    }

    return { imported, skipped, errors };
  } catch (error) {
    logServiceError(error, 'import');
    return { imported: 0, skipped: 0, errors: [] };
  }
}
