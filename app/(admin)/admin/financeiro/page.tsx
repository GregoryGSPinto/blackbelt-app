'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Download, History, Pencil, Plus, RefreshCw, Send, Wallet } from 'lucide-react';
import { PlanGate } from '@/components/plans/PlanGate';
import { Skeleton } from '@/components/ui/Skeleton';
import { ManualPaymentModal } from '@/components/finance/ManualPaymentModal';
import type { ManualPaymentData } from '@/components/finance/ManualPaymentModal';
import { ChargeStudentModal } from '@/components/finance/ChargeStudentModal';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { exportToCSV } from '@/lib/utils/export-csv';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import {
  BILLING_TYPE_LABELS,
  BILLING_STATUS_COLORS,
  BILLING_STATUS_LABELS,
  CHECKIN_GOAL_COLORS,
  CHECKIN_GOAL_LABELS,
  PAYMENT_METHOD_LABELS,
  RECURRENCE_LABELS,
  formatCentsToBRL,
  generateMonthlyInvoices,
  getExecutiveFinancialDashboard,
  getPaymentHistory,
  listStudentFinancialRows,
  recordCheckinGoalAlerts,
  refreshFinancialProfileCaches,
  type StudentInvoice,
  type StudentFinancialListItem,
} from '@/lib/api/student-billing.service';
import { getFinancialSummary, getRevenueChart, markAsManuallyPaid } from '@/lib/api/financial.service';
import type { FinancialSummary, FinancialChartPoint } from '@/lib/types/financial';

const RevenueChart = dynamic(() => import('./RevenueChart'), { ssr: false });

type FinanceFilter =
  | 'todos'
  | 'particular'
  | 'gympass'
  | 'totalpass'
  | 'bolsista'
  | 'cortesia'
  | 'convenio'
  | 'avulso'
  | 'atrasados'
  | 'vence_hoje'
  | 'vence_em_breve'
  | 'isentos'
  | 'abaixo_meta';

interface HistoryModalState {
  studentName: string;
  items: StudentInvoice[];
}

const FILTER_OPTIONS: Array<{ id: FinanceFilter; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'particular', label: 'Particular' },
  { id: 'gympass', label: 'GymPass' },
  { id: 'totalpass', label: 'TotalPass' },
  { id: 'bolsista', label: 'Bolsista' },
  { id: 'cortesia', label: 'Cortesia' },
  { id: 'convenio', label: 'Convênio' },
  { id: 'avulso', label: 'Avulso' },
  { id: 'atrasados', label: 'Atrasados' },
  { id: 'vence_hoje', label: 'Vence hoje' },
  { id: 'vence_em_breve', label: 'Vence em breve' },
  { id: 'isentos', label: 'Isentos' },
  { id: 'abaixo_meta', label: 'Abaixo da meta' },
];

function mapFilter(filter: FinanceFilter): Parameters<typeof listStudentFinancialRows>[1] {
  switch (filter) {
    case 'particular':
    case 'gympass':
    case 'totalpass':
    case 'bolsista':
    case 'cortesia':
    case 'convenio':
    case 'avulso':
      return { financialModel: filter };
    case 'atrasados':
      return { financialStatus: 'atrasado' };
    case 'vence_hoje':
      return { financialStatus: 'vence_hoje' };
    case 'vence_em_breve':
      return { financialStatus: 'vence_em_breve' };
    case 'isentos':
      return { onlyExempt: true };
    case 'abaixo_meta':
      return { belowGoal: true };
    default:
      return {};
  }
}

function paymentStatusLabel(status: string | null): string {
  if (!status) return 'Sem cobrança';
  const labels: Record<string, string> = {
    PENDING: 'Pendente',
    CONFIRMED: 'Confirmado',
    RECEIVED: 'Recebido',
    OVERDUE: 'Atrasado',
    REFUNDED: 'Devolvido',
    CANCELLED: 'Cancelado',
  };
  return labels[status] ?? status;
}

function paymentStatusStyle(status: string | null) {
  const map: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: 'rgba(234,179,8,0.15)', text: '#EAB308' },
    CONFIRMED: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
    RECEIVED: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
    OVERDUE: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
    REFUNDED: { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' },
    CANCELLED: { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' },
  };
  return map[status ?? ''] ?? { bg: 'var(--bb-depth-4)', text: 'var(--bb-ink-60)' };
}

function HistoryModal({ state, onClose }: { state: HistoryModalState | null; onClose: () => void }) {
  if (!state) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-3xl rounded-2xl p-6"
        style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Histórico financeiro
            </h2>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              {state.studentName}
            </p>
          </div>
          <button onClick={onClose} className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Fechar
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
          {state.items.length === 0 ? (
            <div className="rounded-xl p-6 text-sm" style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-60)' }}>
              Nenhuma cobrança registrada para este aluno.
            </div>
          ) : (
            state.items.map((item) => {
              const statusStyle = paymentStatusStyle(item.status);
              return (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-xl p-4 md:grid-cols-[1.3fr,0.8fr,0.8fr,0.8fr]"
                  style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                      {item.reference_month ?? 'Sem referência'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      {item.invoice_url ? 'Cobrança externa disponível' : 'Registro interno'}
                    </p>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>
                    {formatCentsToBRL(item.amount)}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>
                    {new Date(`${item.due_date}T00:00:00`).toLocaleDateString('pt-BR')}
                  </div>
                  <div>
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: statusStyle.bg, color: statusStyle.text }}>
                      {paymentStatusLabel(item.status)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminFinanceiroPage() {
  const { toast } = useToast();
  const academyId = getActiveAcademyId();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FinanceFilter>('todos');
  const [rows, setRows] = useState<StudentFinancialListItem[]>([]);
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof getExecutiveFinancialDashboard>> | null>(null);
  const [chargeOpen, setChargeOpen] = useState(false);
  const [historyState, setHistoryState] = useState<HistoryModalState | null>(null);
  const [manualPaymentOpen, setManualPaymentOpen] = useState(false);
  const [manualPaymentSaving, setManualPaymentSaving] = useState(false);
  const [manualPaymentData, setManualPaymentData] = useState<ManualPaymentData | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [chartData, setChartData] = useState<FinancialChartPoint[]>([]);

  const load = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      await refreshFinancialProfileCaches(academyId);

      const [list, executive, summaryData, chart] = await Promise.all([
        listStudentFinancialRows(academyId, { ...mapFilter(activeFilter), search: search || undefined }),
        getExecutiveFinancialDashboard(academyId),
        getFinancialSummary(academyId),
        getRevenueChart(academyId),
      ]);

      setRows(list);
      setDashboard(executive);
      setSummary(summaryData);
      setChartData(chart);
    } catch (error) {
      toast(translateError(error), 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [academyId, activeFilter, search, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const term = search.toLowerCase();
    return rows.filter((row) => row.student_name.toLowerCase().includes(term));
  }, [rows, search]);

  async function handleHistory(row: StudentFinancialListItem) {
    try {
      const items = await getPaymentHistory(academyId, row.profile_id);
      setHistoryState({ studentName: row.student_name, items });
    } catch (error) {
      toast(translateError(error), 'error');
    }
  }

  function openManualPayment(row: StudentFinancialListItem) {
    if (!row.latest_payment_id || !row.latest_payment_amount_cents) {
      toast('Gere uma cobrança antes de registrar o pagamento manual.', 'error');
      return;
    }

    setManualPaymentData({
      invoiceId: row.latest_payment_id,
      studentName: row.student_name,
      amount: row.latest_payment_amount_cents / 100,
      referenceMonth: row.latest_payment_due_date?.slice(0, 7) ?? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    });
    setManualPaymentOpen(true);
  }

  async function handleManualPaymentConfirm(paymentMethod: string, notes: string) {
    if (!manualPaymentData) return;
    setManualPaymentSaving(true);
    try {
      await markAsManuallyPaid(manualPaymentData.invoiceId, paymentMethod, notes);
      setManualPaymentOpen(false);
      setManualPaymentData(null);
      toast('Pagamento manual registrado.', 'success');
      await load(true);
    } catch (error) {
      toast(translateError(error), 'error');
    } finally {
      setManualPaymentSaving(false);
    }
  }

  async function handleResendAlert(row: StudentFinancialListItem) {
    try {
      const count = await recordCheckinGoalAlerts(academyId, row.membership_id, true);
      if (count === 0) {
        toast('Nenhum alerta elegível para este aluno hoje.', 'error');
        return;
      }
      toast(`Alerta registrado para ${count} destinatário(s).`, 'success');
      await load(true);
    } catch (error) {
      toast(translateError(error), 'error');
    }
  }

  async function handleGenerateRecurringCharges() {
    try {
      const count = await generateMonthlyInvoices(academyId);
      toast(count > 0 ? `${count} cobrança(s) recorrente(s) gerada(s).` : 'Nenhuma cobrança pendente para gerar.', 'success');
      await load(true);
    } catch (error) {
      toast(translateError(error), 'error');
    }
  }

  if (loading || !dashboard) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-56" />
        <div className="grid gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} variant="card" className="h-28" />
          ))}
        </div>
        <Skeleton variant="card" className="h-80" />
      </div>
    );
  }

  return (
    <PlanGate module="financeiro">
      <div className="min-h-screen space-y-6 p-4 sm:p-6" data-stagger>
        <section className="animate-reveal flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
              Financeiro por aluno
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Vínculo, cobrança, vencimento, repasse externo, meta de check-ins e alertas em uma única operação.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => load(true)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={handleGenerateRecurringCharges}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
            >
              <Wallet className="h-4 w-4" />
              Gerar recorrências
            </button>
            <button
              onClick={() => setChargeOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
              style={{ background: 'var(--bb-brand)', color: '#fff' }}
            >
              <Plus className="h-4 w-4" />
              Gerar cobrança
            </button>
            <button
              onClick={() =>
                exportToCSV(
                  filteredRows.map((row) => ({
                    Aluno: row.student_name,
                    Vinculo: BILLING_TYPE_LABELS[row.financial_model],
                    Pagamento: PAYMENT_METHOD_LABELS[row.payment_method_default],
                    Recorrencia: RECURRENCE_LABELS[row.recurrence],
                    Valor: formatCentsToBRL(Math.max(row.amount_cents - row.discount_amount_cents, 0)),
                    ProximoVencimento: row.next_due_date ?? '',
                    StatusFinanceiro: BILLING_STATUS_LABELS[row.financial_status],
                    CheckinsMes: row.current_month_checkins,
                    MinimoCheckins: row.monthly_checkin_minimum,
                    MetaCheckins: CHECKIN_GOAL_LABELS[row.checkin_goal_status],
                    AlertaHoje: row.alert_sent_today ? 'Sim' : 'Nao',
                  })),
                  'financeiro-por-aluno',
                )
              }
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>
        </section>

        <section className="animate-reveal grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Receita prevista do mês', value: formatCentsToBRL(dashboard.expectedRevenueCents), hint: 'Configurações ativas com cobrança direta' },
            { label: 'Receita recebida', value: formatCentsToBRL(dashboard.receivedRevenueCents), hint: 'Pagamentos confirmados/recebidos' },
            { label: 'Inadimplentes', value: String(dashboard.overdueCount), hint: `${dashboard.dueTodayCount} vencem hoje · ${dashboard.dueSoonCount} vencem em breve` },
            { label: 'Abaixo da meta', value: String(dashboard.belowGoalCount), hint: `${dashboard.alertsSentToday} alerta(s) enviados hoje` },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl p-4"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
            >
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--bb-ink-40)' }}>
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
                {card.value}
              </p>
              <p className="mt-2 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                {card.hint}
              </p>
            </div>
          ))}
        </section>

        {/* Revenue Chart + Summary */}
        {summary && (
          <section className="animate-reveal grid gap-4 xl:grid-cols-[1.5fr,1fr]">
            <div className="rounded-2xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
              <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                Receita — últimos 6 meses
              </h2>
              {chartData.length > 0 ? (
                <RevenueChart data={chartData.map(p => ({ month: p.month, receita: p.receita, inadimplencia: summary.total_count > 0 ? Math.round((summary.overdue_count / summary.total_count) * 100) : 0 }))} />
              ) : (
                <div className="flex h-64 items-center justify-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                  Sem dados de receita para exibir.
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
                <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--bb-ink-40)' }}>Comparativo mensal</p>
                <p className="mt-2 text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
                  {formatCentsToBRL(summary.revenue_this_month)}
                </p>
                <p className="mt-1 text-xs" style={{ color: summary.revenue_last_month > 0 && summary.revenue_this_month >= summary.revenue_last_month ? '#22C55E' : '#EF4444' }}>
                  {summary.revenue_last_month > 0
                    ? `${summary.revenue_this_month >= summary.revenue_last_month ? '+' : ''}${Math.round(((summary.revenue_this_month - summary.revenue_last_month) / summary.revenue_last_month) * 100)}% vs mês anterior`
                    : 'Sem dados do mês anterior'}
                </p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
                <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--bb-ink-40)' }}>Inadimplência</p>
                <p className="mt-2 text-2xl font-extrabold" style={{ color: summary.total_count > 0 && (summary.overdue_count / summary.total_count) > 0.1 ? '#EF4444' : 'var(--bb-ink-100)' }}>
                  {summary.total_count > 0 ? Math.round((summary.overdue_count / summary.total_count) * 100) : 0}%
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  {summary.overdue_count} de {summary.total_count} faturas
                </p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
                <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--bb-ink-40)' }}>Ticket médio</p>
                <p className="mt-2 text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
                  {formatCentsToBRL(summary.ticket_medio)}
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  {summary.paid_count} aluno(s) pagante(s)
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="animate-reveal grid gap-4 xl:grid-cols-[1.5fr,1fr]">
          <div className="rounded-2xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                Atenção imediata
              </h2>
              <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                atrasados, vencimentos próximos e risco em plataformas
              </span>
            </div>
            <div className="space-y-2">
              {dashboard.immediateAttention.slice(0, 6).map((row) => (
                <div
                  key={row.membership_id}
                  className="grid gap-2 rounded-xl p-3 md:grid-cols-[1.4fr,0.8fr,0.8fr]"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                      {row.student_name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      {BILLING_TYPE_LABELS[row.financial_model]} · {PAYMENT_METHOD_LABELS[row.payment_method_default]}
                    </p>
                  </div>
                  <div>
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: BILLING_STATUS_COLORS[row.financial_status].bg, color: BILLING_STATUS_COLORS[row.financial_status].text }}>
                      {BILLING_STATUS_LABELS[row.financial_status]}
                    </span>
                  </div>
                  <div>
                    {row.checkin_goal_status !== 'ok' ? (
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: CHECKIN_GOAL_COLORS[row.checkin_goal_status].bg, color: CHECKIN_GOAL_COLORS[row.checkin_goal_status].text }}>
                        {CHECKIN_GOAL_LABELS[row.checkin_goal_status]}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        {row.next_due_date ? new Date(`${row.next_due_date}T00:00:00`).toLocaleDateString('pt-BR') : 'Sem vencimento'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
            <h2 className="text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Alunos por vínculo
            </h2>
            <div className="mt-4 space-y-3">
              {dashboard.byModel.map((item) => (
                <div key={item.model} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: 'var(--bb-depth-3)' }}>
                  <span className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>
                    {BILLING_TYPE_LABELS[item.model]}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="animate-reveal space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar aluno..."
              className="w-full rounded-lg px-3 py-2 text-sm xl:max-w-sm"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
            />
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setActiveFilter(option.id)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium"
                  style={{
                    background: activeFilter === option.id ? 'var(--bb-brand)' : 'var(--bb-depth-2)',
                    color: activeFilter === option.id ? '#fff' : 'var(--bb-ink-80)',
                    border: activeFilter === option.id ? '1px solid transparent' : '1px solid var(--bb-glass-border)',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                    {['Aluno', 'Vínculo', 'Pagamento', 'Recorrência', 'Valor', 'Próx. vencimento', 'Status', 'Meta externa', 'Alerta', 'Ações'].map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const financialColor = BILLING_STATUS_COLORS[row.financial_status];
                    const paymentColor = paymentStatusStyle(row.latest_payment_status);
                    const goalColor = CHECKIN_GOAL_COLORS[row.checkin_goal_status];
                    return (
                      <tr key={row.membership_id} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                              {row.student_name}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                              {row.student_email || 'Sem email'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)' }}>
                            {BILLING_TYPE_LABELS[row.financial_model]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <p style={{ color: 'var(--bb-ink-100)' }}>{PAYMENT_METHOD_LABELS[row.payment_method_default]}</p>
                            <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: paymentColor.bg, color: paymentColor.text }}>
                              {paymentStatusLabel(row.latest_payment_status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--bb-ink-100)' }}>
                          {RECURRENCE_LABELS[row.recurrence]}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--bb-ink-100)' }}>
                          {formatCentsToBRL(Math.max(row.amount_cents - row.discount_amount_cents, 0))}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--bb-ink-100)' }}>
                          {row.next_due_date ? new Date(`${row.next_due_date}T00:00:00`).toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: financialColor.bg, color: financialColor.text }}>
                            {BILLING_STATUS_LABELS[row.financial_status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {(row.financial_model === 'gympass' || row.financial_model === 'totalpass') ? (
                            <div className="space-y-1">
                              <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: goalColor.bg, color: goalColor.text }}>
                                {CHECKIN_GOAL_LABELS[row.checkin_goal_status]}
                              </span>
                              <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                                {row.current_month_checkins}/{row.monthly_checkin_minimum}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs" style={{ color: row.alert_sent_today ? '#22C55E' : 'var(--bb-ink-60)' }}>
                            {row.alert_sent_today ? 'Enviado hoje' : 'Sem envio hoje'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => openManualPayment(row)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
                              style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)' }}
                            >
                              <Wallet className="h-3.5 w-3.5" />
                              Baixa manual
                            </button>
                            <button
                              onClick={() => setChargeOpen(true)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
                              style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)' }}
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Gerar cobrança
                            </button>
                            <Link
                              href={row.student_id ? `/admin/alunos/${row.student_id}` : '/admin/alunos'}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
                              style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)' }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Editar
                            </Link>
                            <button
                              onClick={() => handleResendAlert(row)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
                              style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)' }}
                            >
                              <Send className="h-3.5 w-3.5" />
                              Reenviar alerta
                            </button>
                            <button
                              onClick={() => handleHistory(row)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
                              style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)' }}
                            >
                              <History className="h-3.5 w-3.5" />
                              Histórico
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredRows.length === 0 && (
              <div className="p-8 text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Nenhum aluno encontrado para o recorte selecionado.
              </div>
            )}
          </div>
        </section>

        <ChargeStudentModal
          open={chargeOpen}
          onClose={() => setChargeOpen(false)}
          onCreated={() => {
            setChargeOpen(false);
            load(true);
          }}
        />

        <ManualPaymentModal
          open={manualPaymentOpen}
          data={manualPaymentData}
          saving={manualPaymentSaving}
          onClose={() => setManualPaymentOpen(false)}
          onConfirm={handleManualPaymentConfirm}
        />

        <HistoryModal state={historyState} onClose={() => setHistoryState(null)} />
      </div>
    </PlanGate>
  );
}
