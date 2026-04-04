'use client';

import { forwardRef, useCallback, useRef } from 'react';
import type {
  ReportType,
  MonthlyReportData,
  AttendanceReportData,
  FinancialReportData,
} from '@/lib/types/report';
import { DownloadIcon, XIcon } from '@/components/shell/icons';

// ── Helpers ────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
}

function fmtBRL(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

// ── Props ──────────────────────────────────────────────────────────────

interface ReportViewerProps {
  type: ReportType;
  data: MonthlyReportData | AttendanceReportData | FinancialReportData;
  onClose?: () => void;
}

// ── Component ──────────────────────────────────────────────────────────

const ReportViewer = forwardRef<HTMLDivElement, ReportViewerProps>(
  function ReportViewer({ type, data, onClose }, ref) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useCallback(() => {
      window.print();
    }, []);

    const handleDownload = useCallback(async () => {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(data.meta.academy_name, pageWidth / 2, y, { align: 'center' });
      y += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const titleMap: Record<string, string> = { monthly: 'Relatorio Mensal', attendance: 'Relatorio de Presenca', financial: 'Relatorio Financeiro' };
      doc.text(`${titleMap[type] ?? 'Relatorio'} — ${data.meta.period}`, pageWidth / 2, y, { align: 'center' });
      y += 6;
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Gerado em ${new Date(data.meta.generated_at).toLocaleDateString('pt-BR')} por ${data.meta.generated_by}`, pageWidth / 2, y, { align: 'center' });
      doc.setTextColor(0);
      y += 10;

      // Helper to add a section title
      const section = (title: string) => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, y);
        y += 2;
        doc.setDrawColor(200);
        doc.line(14, y, pageWidth - 14, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      };

      // Helper to add stat row
      const stat = (label: string, value: string) => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(label, 16, y);
        doc.text(value, pageWidth - 16, y, { align: 'right' });
        y += 6;
      };

      if (type === 'monthly') {
        const d = data as import('@/lib/types/report').MonthlyReportData;
        const s = d.summary;
        section('Resumo Geral');
        stat('Total Alunos', String(s.total_students));
        stat('Novos', `+${s.new_students}`);
        stat('Cancelados', String(s.churned_students));
        stat('Presencas', String(s.total_attendance));
        stat('Taxa Presenca', `${s.attendance_rate.toFixed(1)}%`);
        stat('Receita', fmtBRL(s.revenue));
        stat('Receita Anterior', fmtBRL(s.revenue_prev));
        stat('Inadimplentes', `${s.overdue_count} (${fmtBRL(s.overdue_amount)})`);
        y += 4;
        if (d.top_classes.length > 0) {
          section('Top Turmas');
          autoTable(doc, {
            startY: y,
            head: [['Turma', 'Modalidade', 'Alunos', 'Presenca']],
            body: d.top_classes.map((c) => [c.class_name, c.modality, String(c.students), `${c.attendance_rate.toFixed(1)}%`]),
            margin: { left: 14, right: 14 },
            styles: { fontSize: 9 },
          });
          y = ((doc as unknown as Record<string, Record<string, number>>).lastAutoTable?.finalY ?? y + 22) + 8;
        }
        if (d.belt_distribution.length > 0) {
          section('Distribuicao de Faixas');
          autoTable(doc, {
            startY: y,
            head: [['Faixa', 'Quantidade']],
            body: d.belt_distribution.map((b) => [b.belt, String(b.count)]),
            margin: { left: 14, right: 14 },
            styles: { fontSize: 9 },
          });
        }
      } else if (type === 'financial') {
        const d = data as import('@/lib/types/report').FinancialReportData;
        const s = d.summary;
        section('Resumo Financeiro');
        stat('Receita', fmtBRL(s.revenue));
        stat('Mes Anterior', fmtBRL(s.revenue_prev));
        stat('Variacao', `${s.revenue_change_pct >= 0 ? '+' : ''}${s.revenue_change_pct}%`);
        stat('Ticket Medio', fmtBRL(s.ticket_medio));
        stat('Pendente', fmtBRL(s.pending));
        stat('Atrasado', fmtBRL(s.overdue));
        stat('Pagos', String(s.paid_count));
        stat('Total', String(s.total_count));
      } else if (type === 'attendance') {
        const d = data as import('@/lib/types/report').AttendanceReportData;
        const s = d.summary;
        section('Resumo de Presenca');
        stat('Total Aulas', String(s.total_classes));
        stat('Total Check-ins', String(s.total_checkins));
        stat('Media por Aula', s.avg_per_class.toFixed(1));
        stat('Taxa Presenca', `${s.attendance_rate.toFixed(1)}%`);
        stat('Melhor Dia', s.best_day);
        stat('Pior Dia', s.worst_day);
      }

      doc.save(`relatorio-${type}-${data.meta.period.replace(/\s/g, '_')}.pdf`);
    }, [type, data]);

    return (
      <div ref={ref}>
        {/* Action bar (hidden on print) */}
        <div
          className="mb-4 flex items-center justify-between print:hidden"
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            {type === 'monthly' && 'Relatorio Mensal'}
            {type === 'attendance' && 'Relatorio de Presenca'}
            {type === 'financial' && 'Relatorio Financeiro'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium transition-all hover:opacity-80"
              style={{ background: 'var(--bb-brand)', color: '#fff' }}
            >
              <DownloadIcon className="h-4 w-4" />
              Exportar PDF
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium transition-all hover:opacity-80"
              style={{
                background: 'var(--bb-depth-3)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              Imprimir
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center rounded-lg min-h-[44px] min-w-[44px] transition-all hover:opacity-80"
                style={{ color: 'var(--bb-ink-60)' }}
                aria-label="Fechar"
              >
                <XIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Print-friendly report content */}
        <div
          ref={printRef}
          className="rounded-lg p-6 print:p-0 print:rounded-none print:border-none"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
              {data.meta.academy_name}
            </h1>
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              Periodo: {data.meta.period} | Gerado em: {new Date(data.meta.generated_at).toLocaleDateString('pt-BR')} | Por: {data.meta.generated_by}
            </p>
          </div>

          {type === 'monthly' && <MonthlySection data={data as MonthlyReportData} />}
          {type === 'attendance' && <AttendanceSection data={data as AttendanceReportData} />}
          {type === 'financial' && <FinancialSection data={data as FinancialReportData} />}
        </div>
      </div>
    );
  },
);

ReportViewer.displayName = 'ReportViewer';
export { ReportViewer };

// ── Monthly Section ────────────────────────────────────────────────────

function MonthlySection({ data }: { data: MonthlyReportData }) {
  const s = data.summary;
  const revChange = s.revenue_prev > 0
    ? Math.round(((s.revenue - s.revenue_prev) / s.revenue_prev) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)', borderBottom: '2px solid var(--bb-glass-border)', paddingBottom: '4px' }}>
          Resumo Geral
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total Alunos" value={fmt(s.total_students)} />
          <StatCard label="Novos" value={`+${s.new_students}`} />
          <StatCard label="Cancelados" value={fmt(s.churned_students)} />
          <StatCard label="Turmas Ativas" value={fmt(s.active_classes)} />
          <StatCard label="Presencas" value={fmt(s.total_attendance)} />
          <StatCard label="Taxa Presenca" value={fmtPct(s.attendance_rate)} />
          <StatCard label="Receita" value={fmtBRL(s.revenue)} />
          <StatCard label="Variacao" value={`${revChange >= 0 ? '+' : ''}${revChange}%`} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)', borderBottom: '2px solid var(--bb-glass-border)', paddingBottom: '4px' }}>
          Top Turmas
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bb-depth-3)' }}>
                <th className="px-3 py-2 text-left text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Turma</th>
                <th className="px-3 py-2 text-left text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Modalidade</th>
                <th className="px-3 py-2 text-right text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Alunos</th>
                <th className="px-3 py-2 text-right text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Presenca</th>
              </tr>
            </thead>
            <tbody>
              {data.top_classes.map((c) => (
                <tr key={c.class_name} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                  <td className="px-3 py-2" style={{ color: 'var(--bb-ink-100)' }}>{c.class_name}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--bb-ink-60)' }}>{c.modality}</td>
                  <td className="px-3 py-2 text-right" style={{ color: 'var(--bb-ink-100)' }}>{c.students}</td>
                  <td className="px-3 py-2 text-right" style={{ color: 'var(--bb-success)' }}>{fmtPct(c.attendance_rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)', borderBottom: '2px solid var(--bb-glass-border)', paddingBottom: '4px' }}>
          Distribuicao de Faixas
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {data.belt_distribution.map((b) => (
            <div key={b.belt} className="rounded-lg p-3 text-center" style={{ background: 'var(--bb-depth-3)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{b.count}</p>
              <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{b.belt}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)', borderBottom: '2px solid var(--bb-glass-border)', paddingBottom: '4px' }}>
          Retencao
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Taxa Retencao" value={fmtPct(data.retention.rate)} />
          <StatCard label="Em Risco" value={fmt(data.retention.at_risk_count)} />
        </div>
      </div>
    </div>
  );
}

// ── Attendance Section ─────────────────────────────────────────────────

function AttendanceSection({ data }: { data: AttendanceReportData }) {
  const s = data.summary;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)', borderBottom: '2px solid var(--bb-glass-border)', paddingBottom: '4px' }}>
          Resumo de Presenca
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Total Aulas" value={fmt(s.total_classes)} />
          <StatCard label="Total Check-ins" value={fmt(s.total_checkins)} />
          <StatCard label="Media por Aula" value={s.avg_per_class.toFixed(1)} />
          <StatCard label="Taxa Presenca" value={fmtPct(s.attendance_rate)} />
          <StatCard label="Melhor Dia" value={s.best_day} />
          <StatCard label="Pior Dia" value={s.worst_day} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)', borderBottom: '2px solid var(--bb-glass-border)', paddingBottom: '4px' }}>
          Por Modalidade
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bb-depth-3)' }}>
                <th className="px-3 py-2 text-left text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Modalidade</th>
                <th className="px-3 py-2 text-right text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Aulas</th>
                <th className="px-3 py-2 text-right text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Media</th>
                <th className="px-3 py-2 text-right text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Taxa</th>
              </tr>
            </thead>
            <tbody>
              {data.by_modality.map((m) => (
                <tr key={m.modality} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                  <td className="px-3 py-2" style={{ color: 'var(--bb-ink-100)' }}>{m.modality}</td>
                  <td className="px-3 py-2 text-right" style={{ color: 'var(--bb-ink-100)' }}>{m.classes}</td>
                  <td className="px-3 py-2 text-right" style={{ color: 'var(--bb-ink-100)' }}>{m.avg_attendance.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right" style={{ color: 'var(--bb-success)' }}>{fmtPct(m.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)', borderBottom: '2px solid var(--bb-glass-border)', paddingBottom: '4px' }}>
          Presenca por Dia da Semana
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {data.by_day_of_week.map((d) => (
            <div key={d.day} className="rounded-lg p-3 text-center" style={{ background: 'var(--bb-depth-3)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{d.avg_attendance.toFixed(0)}</p>
              <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{d.day}</p>
            </div>
          ))}
        </div>
      </div>

      {data.absent_alerts.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)', borderBottom: '2px solid var(--bb-glass-border)', paddingBottom: '4px' }}>
            Alertas de Ausencia
          </h2>
          <div className="space-y-2">
            {data.absent_alerts.map((a) => (
              <div
                key={a.student_name}
                className="flex items-center justify-between rounded-lg p-3"
                style={{ background: 'var(--bb-depth-3)', borderLeft: '4px solid var(--bb-danger)' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{a.student_name}</p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    Ultimo check-in: {new Date(a.last_attendance).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--bb-danger)' }}>{a.days_absent} dias</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Financial Section ──────────────────────────────────────────────────

function FinancialSection({ data }: { data: FinancialReportData }) {
  const s = data.summary;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)', borderBottom: '2px solid var(--bb-glass-border)', paddingBottom: '4px' }}>
          Resumo Financeiro
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Receita" value={fmtBRL(s.revenue)} />
          <StatCard label="Mes Anterior" value={fmtBRL(s.revenue_prev)} />
          <StatCard label="Variacao" value={`${s.revenue_change_pct >= 0 ? '+' : ''}${s.revenue_change_pct}%`} />
          <StatCard label="Ticket Medio" value={fmtBRL(s.ticket_medio)} />
          <StatCard label="Pendente" value={fmtBRL(s.pending)} />
          <StatCard label="Atrasado" value={fmtBRL(s.overdue)} />
          <StatCard label="Pagos" value={fmt(s.paid_count)} />
          <StatCard label="Total" value={fmt(s.total_count)} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)', borderBottom: '2px solid var(--bb-glass-border)', paddingBottom: '4px' }}>
          Receita por Mes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bb-depth-3)' }}>
                <th className="px-3 py-2 text-left text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Mes</th>
                <th className="px-3 py-2 text-right text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Receita</th>
                <th className="px-3 py-2 text-right text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Pendente</th>
              </tr>
            </thead>
            <tbody>
              {data.revenue_by_month.map((r) => (
                <tr key={r.month} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                  <td className="px-3 py-2" style={{ color: 'var(--bb-ink-100)' }}>{r.month}</td>
                  <td className="px-3 py-2 text-right" style={{ color: 'var(--bb-success)' }}>{fmtBRL(r.revenue)}</td>
                  <td className="px-3 py-2 text-right" style={{ color: 'var(--bb-danger)' }}>{fmtBRL(r.pending)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)', borderBottom: '2px solid var(--bb-glass-border)', paddingBottom: '4px' }}>
          Por Metodo de Pagamento
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {data.by_payment_method.map((m) => (
            <div key={m.method} className="rounded-lg p-3 text-center" style={{ background: 'var(--bb-depth-3)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{fmtBRL(m.total)}</p>
              <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{m.method} ({m.count})</p>
            </div>
          ))}
        </div>
      </div>

      {data.overdue_list.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)', borderBottom: '2px solid var(--bb-glass-border)', paddingBottom: '4px' }}>
            Inadimplentes
          </h2>
          <div className="space-y-2">
            {data.overdue_list.map((o) => (
              <div
                key={o.student_name}
                className="flex items-center justify-between rounded-lg p-3"
                style={{ background: 'var(--bb-depth-3)', borderLeft: '4px solid var(--bb-danger)' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{o.student_name}</p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    Venc: {new Date(o.due_date).toLocaleDateString('pt-BR')} · {o.days_overdue} dias
                  </p>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--bb-danger)' }}>{fmtBRL(o.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── StatCard ───────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-3" style={{ background: 'var(--bb-depth-3)' }}>
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>{label}</p>
      <p className="mt-1 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{value}</p>
    </div>
  );
}
