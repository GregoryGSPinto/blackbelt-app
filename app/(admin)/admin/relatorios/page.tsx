'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getReport } from '@/lib/api/relatorios.service';
import type { ReportType, ReportResult } from '@/lib/api/relatorios.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { ReportViewer } from '@/components/reports/ReportViewer';
import { generateMonthlyReport } from '@/lib/reports/monthly-report';
import { generateAttendanceReport } from '@/lib/reports/attendance-report';
import { generateFinancialReport } from '@/lib/reports/financial-report';
import type { ReportData, ReportType as ReportViewType } from '@/lib/types/report';

const ReportChart = dynamic(() => import('./ReportChart'), { ssr: false });

const REPORTS: Array<{ type: ReportType; label: string; description: string }> = [
  { type: 'presenca', label: 'Presença por Turma', description: 'Taxa de presença por turma no período selecionado' },
  { type: 'evolucao', label: 'Evolução de Alunos', description: 'Promoções de faixa ao longo do tempo' },
  { type: 'financeiro', label: 'Financeiro Consolidado', description: 'Receita e inadimplência por período' },
  { type: 'retencao', label: 'Retenção', description: 'Alunos ativos vs churn mensal' },
  { type: 'performance', label: 'Performance de Professores', description: 'Presença das turmas por professor' },
];

export default function AdminRelatoriosPage() {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<ReportType>('presenca');
  const [report, setReport] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('2025-10-01');
  const [to, setTo] = useState('2026-03-15');
  const [reportViewData, setReportViewData] = useState<ReportData | null>(null);
  const [reportViewType, setReportViewType] = useState<ReportViewType>('monthly');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getReport('academy-1', { type: selectedType, from, to })
      .then(setReport)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedType, from, to]);

  async function handleExport(format: 'pdf' | 'excel') {
    if (format === 'excel') {
      toast('Exportacao Excel em desenvolvimento', 'info');
      return;
    }
    setExporting(true);
    try {
      const period = `${from} a ${to}`;
      let data: ReportData;
      let viewType: ReportViewType;

      if (selectedType === 'presenca' || selectedType === 'performance') {
        data = await generateAttendanceReport('academy-1', period);
        viewType = 'attendance';
      } else if (selectedType === 'financeiro') {
        data = await generateFinancialReport('academy-1', period);
        viewType = 'financial';
      } else {
        data = await generateMonthlyReport('academy-1', period);
        viewType = 'monthly';
      }

      setReportViewData(data);
      setReportViewType(viewType);
    } catch {
      toast('Erro ao gerar relatorio', 'error');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Relatórios</h1>

      {/* Report selector */}
      <div className="flex flex-wrap gap-2">
        {REPORTS.map((r) => (
          <button key={r.type} onClick={() => setSelectedType(r.type)} className={`rounded-lg px-4 py-2 text-sm font-medium ${selectedType === r.type ? 'bg-bb-red text-white' : 'bg-bb-gray-100 text-bb-gray-500 hover:bg-bb-gray-200'}`}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="flex flex-wrap items-end gap-4 p-4">
        <div>
          <label className="block text-xs text-bb-gray-500">De</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 rounded border border-bb-gray-300 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-bb-gray-500">Até</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 rounded border border-bb-gray-300 px-3 py-1.5 text-sm" />
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleExport('pdf')} disabled={exporting}>{exporting ? 'Gerando...' : 'Exportar PDF'}</Button>
          <Button variant="ghost" size="sm" onClick={() => handleExport('excel')}>Exportar Excel</Button>
        </div>
      </Card>

      {loading ? (
        <Skeleton variant="card" className="h-80" />
      ) : report ? (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Object.entries(report.summary).map(([key, value]) => (
              <Card key={key} className="p-4">
                <p className="text-xs text-bb-gray-500">{key}</p>
                <p className="mt-1 text-xl font-bold text-bb-black">{value}</p>
              </Card>
            ))}
          </div>

          {/* Chart */}
          <Card className="p-4">
            <h2 className="mb-4 font-semibold text-bb-black">{report.title}</h2>
            <ReportChart report={report} />
          </Card>

          {/* Data table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                  <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Item</th>
                  <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Valor Principal</th>
                  {report.data[0]?.value2 !== undefined && (
                    <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Valor Secundário</th>
                  )}
                </tr></thead>
                <tbody>
                  {report.data.map((d) => (
                    <tr key={d.label} className="border-b border-bb-gray-100">
                      <td className="px-4 py-3 font-medium text-bb-black">{d.label}</td>
                      <td className="px-4 py-3 text-right text-bb-gray-500">{selectedType === 'financeiro' ? `R$ ${d.value.toLocaleString('pt-BR')}` : selectedType === 'presenca' || selectedType === 'performance' ? `${d.value}%` : d.value}</td>
                      {d.value2 !== undefined && (
                        <td className="px-4 py-3 text-right text-bb-gray-500">{selectedType === 'financeiro' ? `R$ ${d.value2.toLocaleString('pt-BR')}` : d.value2}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}

      {/* ── Report Viewer (PDF/Print) ──────────────────────────────── */}
      {reportViewData && (
        <ReportViewer
          type={reportViewType}
          data={reportViewData}
          onClose={() => setReportViewData(null)}
        />
      )}
    </div>
  );
}
