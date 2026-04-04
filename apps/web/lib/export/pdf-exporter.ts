// ── BlackBelt Enterprise PDF Exporter ──────────────────────────
// Branded PDF with header, footer, tables, and metadata
// Uses jsPDF + jspdf-autotable (already installed)

import jsPDF from 'jspdf';
import autoTable, { type UserOptions } from 'jspdf-autotable';
import { logger } from '@/lib/monitoring/logger';

// ── Types ─────────────────────────────────────────────────────

export interface PDFColumn {
  key: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: unknown) => string;
}

export interface PDFExportOptions {
  title: string;
  subtitle?: string;
  academyName?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter';
  /** Extra metadata lines below subtitle */
  metadata?: { label: string; value: string }[];
  /** Footer note (e.g., "Dados filtrados por período X") */
  footerNote?: string;
  filename?: string;
}

// ── Brand Constants ───────────────────────────────────────────

const BRAND = {
  red: '#C62828',
  dark: '#0A0A0A',
  darkCard: '#1A1A1A',
  gray: '#6B7280',
  grayLight: '#9CA3AF',
  white: '#FFFFFF',
  text: '#E5E7EB',
  fontFamily: 'helvetica',
} as const;

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

// ── Header ────────────────────────────────────────────────────

function drawHeader(
  doc: jsPDF,
  options: PDFExportOptions,
  pageWidth: number,
): number {
  const margin = 14;
  let y = 15;

  // Brand bar at top
  doc.setFillColor(BRAND.red);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Logo text: BLACK + BELT
  doc.setFont(BRAND.fontFamily, 'bold');
  doc.setFontSize(20);
  doc.setTextColor(BRAND.dark);
  doc.text('BLACK', margin, y + 8);
  const blackWidth = doc.getTextWidth('BLACK');
  doc.setTextColor(BRAND.red);
  doc.text('BELT', margin + blackWidth, y + 8);
  y += 14;

  // Academy name (right aligned)
  if (options.academyName) {
    doc.setFont(BRAND.fontFamily, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(BRAND.gray);
    doc.text(options.academyName, pageWidth - margin, 18, { align: 'right' });
  }

  // Date (right aligned)
  doc.setFontSize(8);
  doc.setTextColor(BRAND.grayLight);
  doc.text(formatDate(), pageWidth - margin, 24, { align: 'right' });

  // Separator line
  y += 4;
  doc.setDrawColor(BRAND.red);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Title
  doc.setFont(BRAND.fontFamily, 'bold');
  doc.setFontSize(16);
  doc.setTextColor(BRAND.dark);
  doc.text(options.title, margin, y);
  y += 6;

  // Subtitle
  if (options.subtitle) {
    doc.setFont(BRAND.fontFamily, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(BRAND.gray);
    doc.text(options.subtitle, margin, y);
    y += 5;
  }

  // Metadata rows
  if (options.metadata && options.metadata.length > 0) {
    doc.setFontSize(9);
    for (const meta of options.metadata) {
      doc.setFont(BRAND.fontFamily, 'bold');
      doc.setTextColor(BRAND.dark);
      doc.text(`${meta.label}: `, margin, y);
      const labelWidth = doc.getTextWidth(`${meta.label}: `);
      doc.setFont(BRAND.fontFamily, 'normal');
      doc.setTextColor(BRAND.gray);
      doc.text(meta.value, margin + labelWidth, y);
      y += 4.5;
    }
  }

  y += 4;
  return y;
}

// ── Footer ────────────────────────────────────────────────────

function drawFooter(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  pageNumber: number,
  totalPages: number,
  footerNote?: string,
): void {
  const margin = 14;
  const footerY = pageHeight - 12;

  // Separator
  doc.setDrawColor('#E5E7EB');
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  // Footer note (left)
  if (footerNote) {
    doc.setFont(BRAND.fontFamily, 'italic');
    doc.setFontSize(7);
    doc.setTextColor(BRAND.grayLight);
    doc.text(footerNote, margin, footerY);
  }

  // Page number (center)
  doc.setFont(BRAND.fontFamily, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(BRAND.gray);
  doc.text(`${pageNumber} / ${totalPages}`, pageWidth / 2, footerY, {
    align: 'center',
  });

  // Brand (right)
  doc.setFontSize(7);
  doc.setTextColor(BRAND.grayLight);
  doc.text('blackbelts.com.br', pageWidth - margin, footerY, {
    align: 'right',
  });
}

// ── Main Export Function ──────────────────────────────────────

export function exportToPDF<T extends Record<string, unknown>>(
  data: T[],
  columns: PDFColumn[],
  options: PDFExportOptions,
): void {
  if (data.length === 0) {
    logger.warn('[PDF Export] Nenhum dado para exportar');
    return;
  }

  try {
    const orientation = options.orientation ?? 'portrait';
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: options.pageSize ?? 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    // Draw header on first page
    const startY = drawHeader(doc, options, pageWidth);

    // Prepare table data
    const tableHeaders = columns.map((col) => col.label);
    const tableBody = data.map((row) =>
      columns.map((col) => {
        const val = row[col.key];
        if (col.format) return col.format(val);
        if (val == null) return '';
        return String(val);
      }),
    );

    // Column styles
    const columnStyles: UserOptions['columnStyles'] = {};
    columns.forEach((col, i) => {
      if (col.align || col.width) {
        columnStyles[i] = {
          ...(col.align && { halign: col.align }),
          ...(col.width && { cellWidth: col.width }),
        };
      }
    });

    // Draw table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableBody,
      startY,
      margin: { left: margin, right: margin, bottom: 20 },
      styles: {
        font: BRAND.fontFamily,
        fontSize: 8.5,
        cellPadding: 3,
        textColor: [30, 30, 30],
        lineColor: [229, 231, 235],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [198, 40, 40], // BRAND.red
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      columnStyles,
      didDrawPage: (hookData) => {
        // Draw header on subsequent pages
        if (hookData.pageNumber > 1) {
          doc.setFillColor(BRAND.red);
          doc.rect(0, 0, pageWidth, 2, 'F');

          doc.setFont(BRAND.fontFamily, 'bold');
          doc.setFontSize(10);
          doc.setTextColor(BRAND.dark);
          doc.text(options.title, margin, 10);

          doc.setFont(BRAND.fontFamily, 'normal');
          doc.setFontSize(7);
          doc.setTextColor(BRAND.grayLight);
          doc.text(formatDate(), pageWidth - margin, 10, { align: 'right' });
        }
      },
    });

    // Draw footers on all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawFooter(doc, pageWidth, pageHeight, i, totalPages, options.footerNote);
    }

    // Summary row at the end
    const lastPage = totalPages;
    doc.setPage(lastPage);
    const finalY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? pageHeight - 30;

    if (finalY < pageHeight - 25) {
      doc.setFont(BRAND.fontFamily, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(BRAND.gray);
      doc.text(
        `Total de registros: ${data.length}`,
        margin,
        finalY + 8,
      );
    }

    // Generate filename
    const fname = options.filename
      ? sanitizeFilename(options.filename)
      : `blackbelt_${sanitizeFilename(options.title)}_${new Date().toISOString().slice(0, 10)}`;

    doc.save(`${fname}.pdf`);
    logger.info('[PDF Export] Exportado com sucesso', {
      rows: data.length,
      filename: fname,
    });
  } catch (error) {
    logger.error('[PDF Export] Erro ao gerar PDF', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// ── Quick Export (simple API) ─────────────────────────────────

export function quickExportPDF(
  data: Record<string, unknown>[],
  title: string,
  academyName?: string,
): void {
  if (data.length === 0) return;

  const keys = Object.keys(data[0]);
  const columns: PDFColumn[] = keys.map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
  }));

  exportToPDF(data, columns, { title, academyName });
}
