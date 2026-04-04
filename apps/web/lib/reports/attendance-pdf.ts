// ============================================================
// BlackBelt v2 — Attendance PDF Report (F7)
// Gera PDF de relatorio de frequencia usando jsPDF.
// ============================================================

interface AttendanceRow {
  studentName: string;
  className: string;
  attendancePercent: number;
  absences: number;
}

interface AttendancePDFOptions {
  academyName: string;
  period: string;
  rows: AttendanceRow[];
  generatedBy?: string;
}

/**
 * Gera PDF de relatorio de frequencia.
 * Retorna Blob do PDF ou null se jsPDF nao estiver disponivel.
 */
export async function generateAttendancePDF(
  options: AttendancePDFOptions
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
    doc.text(`Relatorio de Frequencia — ${options.period}`, pageWidth / 2, 31, { align: 'center' });

    // ── Resumo ──────────────────────────────────────────────
    const totalStudents = options.rows.length;
    const avgAttendance = totalStudents > 0
      ? (options.rows.reduce((sum, r) => sum + r.attendancePercent, 0) / totalStudents).toFixed(1)
      : '0.0';
    const totalAbsences = options.rows.reduce((sum, r) => sum + r.absences, 0);

    let yPos = 45;
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo', 14, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de alunos: ${totalStudents}`, 14, yPos);
    doc.text(`Frequencia media: ${avgAttendance}%`, 80, yPos);
    doc.text(`Total de faltas: ${totalAbsences}`, 150, yPos);

    // ── Tabela ──────────────────────────────────────────────
    yPos += 12;

    const tableData = options.rows.map((row) => [
      row.studentName,
      row.className,
      `${row.attendancePercent.toFixed(1)}%`,
      String(row.absences),
    ]);

    // Tentar usar autoTable se disponivel
    const docAny = doc as unknown as Record<string, unknown>;
    if (typeof docAny.autoTable === 'function') {
      (docAny.autoTable as (config: Record<string, unknown>) => void)({
        startY: yPos,
        head: [['Aluno', 'Turma', 'Frequencia', 'Faltas']],
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
          0: { cellWidth: 60 },
          1: { cellWidth: 50 },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
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
      doc.text('Turma', 80, yPos);
      doc.text('Freq.', 135, yPos);
      doc.text('Faltas', 160, yPos);

      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 51, 51);

      for (const row of options.rows.slice(0, 40)) {
        doc.setFontSize(9);
        doc.text(row.studentName.slice(0, 30), 16, yPos);
        doc.text(row.className.slice(0, 25), 80, yPos);
        doc.text(`${row.attendancePercent.toFixed(1)}%`, 135, yPos);
        doc.text(String(row.absences), 165, yPos);
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
    console.error('[PDF] Erro ao gerar relatorio de frequencia:', error);
    return null;
  }
}
