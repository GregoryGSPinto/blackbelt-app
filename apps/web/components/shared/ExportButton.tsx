'use client';

import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { exportToCSV, exportToPDF } from '@/lib/export';
import type { CSVColumn, CSVExportOptions } from '@/lib/export';
import type { PDFColumn, PDFExportOptions } from '@/lib/export';

// ── Types ─────────────────────────────────────────────────────

export type ExportFormat = 'csv' | 'pdf';

export interface ExportColumn {
  key: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: unknown) => string;
}

export interface ExportButtonProps {
  /** Data to export — can be a function for lazy loading */
  data: Record<string, unknown>[] | (() => Record<string, unknown>[] | Promise<Record<string, unknown>[]>);
  columns: ExportColumn[];
  title: string;
  academyName?: string;
  /** Available formats (default: both) */
  formats?: ExportFormat[];
  /** Extra metadata for the export */
  metadata?: { label: string; value: string }[];
  footerNote?: string;
  filename?: string;
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
}

// ── Component ─────────────────────────────────────────────────

export function ExportButton({
  data,
  columns,
  title,
  academyName,
  formats = ['csv', 'pdf'],
  metadata,
  footerNote,
  filename,
  disabled,
  size = 'md',
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  async function resolveData(): Promise<Record<string, unknown>[]> {
    if (typeof data === 'function') {
      const result = data();
      return result instanceof Promise ? await result : result;
    }
    return data;
  }

  async function handleExport(format: ExportFormat) {
    setLoading(true);
    setOpen(false);

    try {
      const rows = await resolveData();
      if (rows.length === 0) return;

      if (format === 'csv') {
        const csvColumns: CSVColumn[] = columns.map((c) => ({
          key: c.key,
          label: c.label,
          format: c.format,
        }));
        const csvOptions: CSVExportOptions = {
          title,
          academyName,
          metadata,
          filename,
          includeMetadata: true,
        };
        exportToCSV(rows, csvColumns, csvOptions);
      } else if (format === 'pdf') {
        const pdfColumns: PDFColumn[] = columns.map((c) => ({
          key: c.key,
          label: c.label,
          width: c.width,
          align: c.align,
          format: c.format,
        }));
        const pdfOptions: PDFExportOptions = {
          title,
          academyName,
          metadata,
          footerNote,
          filename,
        };
        exportToPDF(rows, pdfColumns, pdfOptions);
      }
    } catch {
      // Error already logged in exporters
    } finally {
      setLoading(false);
    }
  }

  // Single format — no dropdown needed
  if (formats.length === 1) {
    return (
      <button
        onClick={() => handleExport(formats[0])}
        disabled={disabled || loading}
        className={`inline-flex items-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm'
        }`}
        style={{
          backgroundColor: 'var(--bb-depth-4)',
          color: 'var(--bb-ink-100)',
          borderRadius: 'var(--bb-radius-md)',
          border: '1px solid var(--bb-glass-border)',
        } as CSSProperties}
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <Download className="h-4 w-4" />
        )}
        Exportar {formats[0].toUpperCase()}
      </button>
    );
  }

  // Multiple formats — dropdown
  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled || loading}
        className={`inline-flex items-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm'
        }`}
        style={{
          backgroundColor: 'var(--bb-depth-4)',
          color: 'var(--bb-ink-100)',
          borderRadius: 'var(--bb-radius-md)',
          border: '1px solid var(--bb-glass-border)',
        } as CSSProperties}
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <Download className="h-4 w-4" />
        )}
        Exportar
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-1 w-48 py-1"
          style={{
            backgroundColor: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-md)',
            boxShadow: 'var(--bb-shadow-lg)',
            animation: 'fadeIn 0.15s ease-out',
          } as CSSProperties}
        >
          {formats.includes('csv') && (
            <button
              onClick={() => handleExport('csv')}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors"
              style={{ color: 'var(--bb-ink-80)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bb-depth-4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <FileSpreadsheet className="h-4 w-4" style={{ color: 'var(--bb-success)' }} />
              <div className="text-left">
                <div className="font-medium">CSV</div>
                <div className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  Compatível com Excel
                </div>
              </div>
            </button>
          )}

          {formats.includes('pdf') && (
            <button
              onClick={() => handleExport('pdf')}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors"
              style={{ color: 'var(--bb-ink-80)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bb-depth-4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <FileText className="h-4 w-4" style={{ color: '#C62828' }} />
              <div className="text-left">
                <div className="font-medium">PDF</div>
                <div className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  Com marca BlackBelt
                </div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
