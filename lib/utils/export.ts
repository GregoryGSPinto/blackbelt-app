// ── Universal Export Utility ───────────────────────────────────
// P-057: CSV, Excel (xlsx via SheetJS), PDF (jsPDF)
// For now: CSV implemented natively. Excel/PDF noted as future deps.

export interface ExportColumn {
  key: string;
  label: string;
  format?: (value: unknown) => string;
}

function escapeCSV(value: unknown): string {
  const str = value == null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  filename: string,
): void {
  const header = columns.map((c) => escapeCSV(c.label)).join(',');
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const val = row[col.key];
        return escapeCSV(col.format ? col.format(val) : val);
      })
      .join(','),
  );

  const csv = [header, ...rows].join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `blackbelt_${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
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

// Placeholder for future xlsx/pdf deps
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  filename: string,
): void {
  // TODO: Install sheetjs (xlsx) for native Excel export
  // For now, fall back to CSV
  console.warn('[Export] Excel not available yet, falling back to CSV');
  exportToCSV(data, columns, filename);
}

export function exportToPDF<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  filename: string,
): void {
  // TODO: Install jspdf + jspdf-autotable for PDF export
  console.warn('[Export] PDF not available yet, falling back to CSV');
  exportToCSV(data, columns, filename);
}
