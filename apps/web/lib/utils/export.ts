// ── Universal Export Utility ───────────────────────────────────
// Delegates to enterprise exporters in lib/export/
// Keeps backward-compatible API for existing call sites

import { exportToCSV as enterpriseCSV } from '@/lib/export/csv-exporter';
import { exportToPDF as enterprisePDF } from '@/lib/export/pdf-exporter';

export interface ExportColumn {
  key: string;
  label: string;
  format?: (value: unknown) => string;
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  filename: string,
): void {
  enterpriseCSV(data, columns, { title: filename, filename });
}

export function exportToJSON<T>(data: T[], filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `blackbelt_${filename}_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  filename: string,
): void {
  // Excel falls back to CSV with semicolons (Excel-friendly)
  enterpriseCSV(data, columns, { title: filename, filename, useSemicolon: true });
}

export function exportToPDF<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  filename: string,
): void {
  enterprisePDF(data, columns, { title: filename, filename });
}
