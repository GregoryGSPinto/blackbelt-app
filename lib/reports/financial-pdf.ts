// ============================================================
// BlackBelt v2 — Financial PDF Report (F7)
// Gera PDF de relatorio financeiro usando jsPDF.
// ============================================================

interface FinancialRow {
  studentName: string;
  plan: string;
  amount: number;
  status: string;
  paymentDate: string;
}

interface FinancialSummary {
  totalReceived: number;
  totalPending: number;
  totalOverdue: number;
}

interface FinancialPDFOptions {
  academyName: string;
  period: string;
  summary: FinancialSummary;
  rows: FinancialRow[];
  generatedBy?: string;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Gera PDF de relatorio financeiro.
 * Retorna Blob do PDF ou null se jsPDF nao estiver disponivel.
 */
export async function generateFinancialPDF(
  options: FinancialPDFOptions
): Promise<Blob | null> {
  try {
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;

    if (!jsPDF) {
      console.warn('[PDF] jsPDF nao disponivel. Instale com: pnpm add jspdf');
      return null;
    }

    // Importar autotable plugin
    try {
      await import('jspdf-autotable');
    } catch {
      console.warn('[PDF] jspdf-autotable nao disponivel. Tabela sera simplificada.');
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // ── Header ──────────────────────────────────────────────
    doc.setFillColor(198, 40, 40); // #C62828
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('BLACKBELT', pageWidth / 2, 16, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(options.academyName, pageWidth / 2, 24, { align: 'center' });

    doc.setFontSize(9);
    doc.text(`Relatorio Financeiro — ${options.period}`, pageWidth / 2, 31, { align: 'center' });

    // ── Resumo financeiro ───────────────────────────────────
    let yPos = 45;
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo Financeiro', 14, yPos);

    yPos += 10;

    // Cards de resumo
    const cardWidth = (pageWidth - 42) / 3;

    // Card: Recebido
    doc.setFillColor(232, 245, 233); // verde claro
    doc.roundedRect(14, yPos, cardWidth, 24, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor(56, 142, 60);
    doc.text('TOTAL RECEBIDO', 14 + cardWidth / 2, yPos + 8, { align: 'center' });
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(formatBRL(options.summary.totalReceived), 14 + cardWidth / 2, yPos + 18, { align: 'center' });

    // Card: Pendente
    const card2X = 14 + cardWidth + 7;
    doc.setFillColor(255, 248, 225); // amarelo claro
    doc.roundedRect(card2X, yPos, cardWidth, 24, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(245, 127, 23);
    doc.text('TOTAL PENDENTE', card2X + cardWidth / 2, yPos + 8, { align: 'center' });
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(formatBRL(options.summary.totalPending), card2X + cardWidth / 2, yPos + 18, { align: 'center' });

    // Card: Atrasado
    const card3X = card2X + cardWidth + 7;
    doc.setFillColor(255, 235, 238); // vermelho claro
    doc.roundedRect(card3X, yPos, cardWidth, 24, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(198, 40, 40);
    doc.text('TOTAL ATRASADO', card3X + cardWidth / 2, yPos + 8, { align: 'center' });
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(formatBRL(options.summary.totalOverdue), card3X + cardWidth / 2, yPos + 18, { align: 'center' });

    // ── Tabela de pagamentos ────────────────────────────────
    yPos += 36;
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalhamento', 14, yPos);

    yPos += 8;

    const STATUS_LABELS: Record<string, string> = {
      paid: 'Pago',
      pending: 'Pendente',
      overdue: 'Atrasado',
      cancelled: 'Cancelado',
    };

    const tableData = options.rows.map((row) => [
      row.studentName,
      row.plan,
      formatBRL(row.amount),
      STATUS_LABELS[row.status] || row.status,
      row.paymentDate,
    ]);

    // Tentar usar autoTable se disponivel
    const docAny = doc as unknown as Record<string, unknown>;
    if (typeof docAny.autoTable === 'function') {
      (docAny.autoTable as (config: Record<string, unknown>) => void)({
        startY: yPos,
        head: [['Aluno', 'Plano', 'Valor', 'Status', 'Data Pagamento']],
        body: tableData,
        margin: { left: 14, right: 14 },
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [198, 40, 40],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 35 },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 35, halign: 'center' },
        },
        didParseCell: (data: { column: { index: number }; cell: { styles: Record<string, unknown> }; row: { section: string; raw: string[] } }) => {
          if (data.column.index === 3 && data.row.section === 'body') {
            const status = data.row.raw[3];
            if (status === 'Pago') {
              data.cell.styles.textColor = [56, 142, 60];
            } else if (status === 'Atrasado') {
              data.cell.styles.textColor = [198, 40, 40];
            } else if (status === 'Pendente') {
              data.cell.styles.textColor = [245, 127, 23];
            }
          }
        },
      });
    } else {
      // Fallback: tabela simples sem autoTable
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(198, 40, 40);
      doc.rect(14, yPos - 5, pageWidth - 28, 8, 'F');
      doc.text('Aluno', 16, yPos);
      doc.text('Plano', 65, yPos);
      doc.text('Valor', 105, yPos);
      doc.text('Status', 135, yPos);
      doc.text('Data Pag.', 165, yPos);

      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 51, 51);

      for (const row of options.rows.slice(0, 40)) {
        doc.setFontSize(9);
        doc.text(row.studentName.slice(0, 25), 16, yPos);
        doc.text(row.plan.slice(0, 18), 65, yPos);
        doc.text(formatBRL(row.amount), 105, yPos);
        doc.text(STATUS_LABELS[row.status] || row.status, 135, yPos);
        doc.text(row.paymentDate, 165, yPos);
        yPos += 6;

        // Nova pagina se necessario
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      }
    }

    // ── Footer ──────────────────────────────────────────────
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const footerY = doc.internal.pageSize.getHeight() - 10;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Gerado pelo BlackBelt em ${now}${options.generatedBy ? ` por ${options.generatedBy}` : ''}`,
        14,
        footerY
      );
      doc.text(`Pagina ${i} de ${pageCount}`, pageWidth - 14, footerY, { align: 'right' });
    }

    return doc.output('blob');
  } catch (error) {
    console.error('[PDF] Erro ao gerar relatorio financeiro:', error);
    return null;
  }
}
