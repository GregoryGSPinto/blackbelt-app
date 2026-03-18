import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import { logger } from '@/lib/monitoring/logger';

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
    handleServiceError(error, 'import.preview');
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
    try {

      const formData = new FormData();
      formData.append('file', file);
      formData.append('academyId', academyId);
      formData.append('mappings', JSON.stringify(mappings));

      const res = await fetch('/api/import/students', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[import.executeImport] API not available, using fallback');
      return { imported: 0, skipped: 0, errors: [] } as ImportResult;
    }

  } catch (error) {
    handleServiceError(error, 'import.execute');
  }
}
