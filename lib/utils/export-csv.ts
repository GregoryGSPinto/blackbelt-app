/**
 * Export data array to CSV file with BOM for Excel compatibility.
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  columns?: { key: string; label: string }[],
) {
  if (data.length === 0) return;

  const cols = columns ?? Object.keys(data[0]).map((k) => ({ key: k, label: k }));
  const BOM = '\uFEFF';
  const headers = cols.map((c) => c.label).join(';');
  const rows = data
    .map((row) =>
      cols
        .map((c) => {
          const val = row[c.key];
          if (val == null) return '';
          const str = String(val);
          return str.includes(';') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
        })
        .join(';'),
    )
    .join('\n');
  const csv = BOM + headers + '\n' + rows;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
