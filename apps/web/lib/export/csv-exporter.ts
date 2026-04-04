// ── BlackBelt Enterprise CSV Exporter ──────────────────────────
// Full-featured CSV with PapaParse, BOM for Excel, metadata header
// Supports column formatting, semicolon separator for PT-BR locale

import Papa from 'papaparse';
import { logger } from '@/lib/monitoring/logger';

// ── Types ─────────────────────────────────────────────────────

export interface CSVColumn {
  key: string;
  label: string;
  format?: (value: unknown) => string;
}

export interface CSVExportOptions {
  title?: string;
  academyName?: string;
  /** Use semicolon delimiter for PT-BR Excel compatibility (default: true) */
  useSemicolon?: boolean;
  /** Include metadata header rows (academy, date, total) */
  includeMetadata?: boolean;
  filename?: string;
  /** Extra metadata key-value pairs */
  metadata?: { label: string; value: string }[];
}

// ── Helpers ───────────────────────────────────────────────────

function formatDate(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Main Export Function ──────────────────────────────────────

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: CSVColumn[],
  options: CSVExportOptions = {},
): void {
  if (data.length === 0) {
    logger.warn('[CSV Export] Nenhum dado para exportar');
    return;
  }

  try {
    const delimiter = options.useSemicolon !== false ? ';' : ',';
    const includeMetadata = options.includeMetadata !== false;

    // Build rows with formatted values
    const formattedData = data.map((row) => {
      const formatted: Record<string, string> = {};
      for (const col of columns) {
        const val = row[col.key];
        formatted[col.label] = col.format
          ? col.format(val)
          : val == null
            ? ''
            : String(val);
      }
      return formatted;
    });

    // Generate CSV with PapaParse
    const csv = Papa.unparse(formattedData, {
      delimiter,
      quotes: true,
      header: true,
    });

    // Build metadata header
    let metadataBlock = '';
    if (includeMetadata) {
      const metaLines: string[] = [];
      if (options.title) {
        metaLines.push(`# Relatório: ${options.title}`);
      }
      if (options.academyName) {
        metaLines.push(`# Academia: ${options.academyName}`);
      }
      metaLines.push(`# Gerado em: ${formatDate()}`);
      metaLines.push(`# Total de registros: ${data.length}`);

      if (options.metadata) {
        for (const meta of options.metadata) {
          metaLines.push(`# ${meta.label}: ${meta.value}`);
        }
      }

      metaLines.push(''); // Empty line before data
      metadataBlock = metaLines.join('\n') + '\n';
    }

    // BOM for Excel UTF-8 detection
    const BOM = '\uFEFF';
    const fullContent = BOM + metadataBlock + csv;

    const blob = new Blob([fullContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const fname = options.filename
      ? sanitizeFilename(options.filename)
      : `blackbelt_${sanitizeFilename(options.title || 'export')}_${new Date().toISOString().slice(0, 10)}`;

    downloadBlob(blob, `${fname}.csv`);

    logger.info('[CSV Export] Exportado com sucesso', {
      rows: data.length,
      columns: columns.length,
      filename: fname,
    });
  } catch (error) {
    logger.error('[CSV Export] Erro ao gerar CSV', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// ── Quick Export (simple API) ─────────────────────────────────

export function quickExportCSV(
  data: Record<string, unknown>[],
  title: string,
  academyName?: string,
): void {
  if (data.length === 0) return;

  const keys = Object.keys(data[0]);
  const columns: CSVColumn[] = keys.map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
  }));

  exportToCSV(data, columns, { title, academyName });
}

// ── Parse CSV (for import) ────────────────────────────────────

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  errors: Papa.ParseError[];
}

export function parseCSVFile(file: File): Promise<ParsedCSV> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
      transform: (value: string) => value.trim(),
      complete: (results) => {
        resolve({
          headers: results.meta.fields || [],
          rows: results.data,
          totalRows: results.data.length,
          errors: results.errors,
        });
      },
      error: () => {
        resolve({ headers: [], rows: [], totalRows: 0, errors: [] });
      },
    });
  });
}
