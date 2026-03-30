'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  listMensalidades,
  getFinancialSummary,
  getRevenueChart,
  getOverdueList,
  markAsPaid,
  markAsManuallyPaid,
} from '@/lib/api/financial.service';
import type { Mensalidade, FinancialSummary, FinancialChartPoint, OverdueItem } from '@/lib/types/financial';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToast } from '@/lib/hooks/useToast';
import { DollarIcon, TrendingUpIcon, UsersIcon, SearchIcon } from '@/components/shell/icons';
import { ReportViewer } from '@/components/reports/ReportViewer';
import { generateFinancialReport } from '@/lib/reports/financial-report';
import type { FinancialReportData } from '@/lib/types/report';
import { PlanGate } from '@/components/plans/PlanGate';
import { translateError } from '@/lib/utils/error-translator';
import { exportToCSV } from '@/lib/utils/export-csv';
import { Download, Plus } from 'lucide-react';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { isMock } from '@/lib/env';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ChargeStudentModal } from '@/components/finance/ChargeStudentModal';
import { ManualPaymentModal } from '@/components/finance/ManualPaymentModal';
import type { ManualPaymentData } from '@/components/finance/ManualPaymentModal';

const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });

type Tab = 'mensalidades' | 'cobrancas' | 'inadimplentes' | 'relatorio';

interface StudentPaymentRow {
  id: string;
  student_name: string;
  description: string;
  amount_cents: number;
  due_date: string;
  status: string;
  invoice_url: string | null;
  billing_type: string;
}

const SP_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Pago',
  RECEIVED: 'Pago',
  OVERDUE: 'Vencido',
  REFUNDED: 'Devolvido',
  CANCELLED: 'Cancelado',
};

const SP_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'rgba(234,179,8,0.15)', text: '#EAB308' },
  CONFIRMED: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
  RECEIVED: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
  OVERDUE: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  REFUNDED: { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' },
  CANCELLED: { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' },
};

const STATUS_LABELS: Record<string, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  atrasado: 'Atrasado',
  isento: 'Isento',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pago: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
  pendente: { bg: 'rgba(234,179,8,0.15)', text: '#EAB308' },
  atrasado: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  isento: { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' },
};

const chartTooltipStyle: React.CSSProperties = {
  backgroundColor: 'var(--bb-depth-4)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: '8px',
  color: 'var(--bb-ink-100)',
  fontSize: '12px',
};

function fmt(n: number): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
}

export default function AdminFinanceiroPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('mensalidades');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [chart, setChart] = useState<FinancialChartPoint[]>([]);
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [overdue, setOverdue] = useState<OverdueItem[]>([]);

  const [reportData, setReportData] = useState<FinancialReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Charge modal + bank config
  const [chargeOpen, setChargeOpen] = useState(false);
  const [bankConfigured, setBankConfigured] = useState<boolean | null>(null);
  const [studentPayments, setStudentPayments] = useState<StudentPaymentRow[]>([]);

  // Manual payment modal
  const [manualPaymentData, setManualPaymentData] = useState<ManualPaymentData | null>(null);
  const [manualPaymentOpen, setManualPaymentOpen] = useState(false);
  const [manualPaymentSaving, setManualPaymentSaving] = useState(false);

  // Filters — default to current month
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [s, c, m, o] = await Promise.all([
          getFinancialSummary(getActiveAcademyId()),
          getRevenueChart(getActiveAcademyId()),
          listMensalidades(getActiveAcademyId(), { month: filterMonth, status: filterStatus || undefined, search: filterSearch || undefined }),
          getOverdueList(getActiveAcademyId()),
        ]);
        setSummary(s);
        setChart(c);
        setMensalidades(m);
        setOverdue(o);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filterMonth, filterStatus, filterSearch, toast]);

  // Load bank config + student payments
  useEffect(() => {
    async function loadBankAndPayments() {
      try {
        if (isMock()) {
          setBankConfigured(false);
          setStudentPayments([]);
          return;
        }
        const supabase = createBrowserClient();
        const academyId = getActiveAcademyId();
        const [{ data: acad }, { data: payments }] = await Promise.all([
          supabase
            .from('academies')
            .select('bank_account_configured')
            .eq('id', academyId)
            .single(),
          supabase
            .from('student_payments')
            .select('id, description, amount_cents, due_date, status, invoice_url, billing_type, student_profile_id')
            .eq('academy_id', academyId)
            .order('created_at', { ascending: false })
            .limit(50),
        ]);
        setBankConfigured(acad?.bank_account_configured ?? false);
        if (payments && payments.length > 0) {
          // Fetch student names
          const profileIds = [...new Set(payments.map((p: { student_profile_id: string }) => p.student_profile_id))];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', profileIds);
          const nameMap = new Map((profiles || []).map((p: { id: string; display_name: string }) => [p.id, p.display_name]));
          setStudentPayments(payments.map((p: { id: string; student_profile_id: string; description: string; amount_cents: number; due_date: string; status: string; invoice_url: string | null; billing_type: string }) => ({
            ...p,
            student_name: nameMap.get(p.student_profile_id) || 'Aluno',
          })));
        }
      } catch {
        // silent
      }
    }
    loadBankAndPayments();
  }, []);

  async function handleMarkPaid(id: string) {
    try {
      const updated = await markAsPaid(id, 'PIX');
      setMensalidades((prev) => prev.map((m) => (m.id === id ? updated : m)));
      toast('Pagamento registrado!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  function openManualPayment(m: Mensalidade) {
    setManualPaymentData({
      invoiceId: m.id,
      studentName: m.student_name,
      amount: m.amount,
      referenceMonth: m.reference_month,
    });
    setManualPaymentOpen(true);
  }

  async function handleManualPaymentConfirm(paymentMethod: string, notes: string) {
    if (!manualPaymentData) return;
    setManualPaymentSaving(true);
    try {
      const updated = await markAsManuallyPaid(manualPaymentData.invoiceId, paymentMethod, notes);
      setMensalidades((prev) => prev.map((m) => (m.id === manualPaymentData.invoiceId ? updated : m)));
      toast(`Pagamento de ${manualPaymentData.studentName} registrado com sucesso`, 'success');
      setManualPaymentOpen(false);
      setManualPaymentData(null);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setManualPaymentSaving(false);
    }
  }

  if (loading || !summary) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" className="h-28" />)}
        </div>
        <Skeleton variant="card" className="h-72" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  const trendPct = summary.revenue_last_month > 0
    ? Math.round(((summary.revenue_this_month - summary.revenue_last_month) / summary.revenue_last_month) * 100)
    : 0;

  return (
    <PlanGate module="financeiro">
      <div className="min-h-screen space-y-6 p-4 sm:p-6 overflow-x-hidden" data-stagger>
        {/* ── Stats ─────────────────────────────────────────────────── */}
        <section className="animate-reveal">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>Financeiro</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChargeOpen(true)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all hover:opacity-80"
                style={{ background: 'var(--bb-brand)' }}
              >
                <Plus className="h-3.5 w-3.5" />
                Gerar Cobranca
              </button>
              <button
                onClick={() =>
                  exportToCSV(
                    mensalidades.map((m) => ({
                      Aluno: m.student_name,
                      Valor: m.amount,
                      Vencimento: new Date(m.due_date).toLocaleDateString('pt-BR'),
                      Pagamento: m.payment_method || '',
                      Status: STATUS_LABELS[m.status] ?? m.status,
                    })),
                    'financeiro',
                  )
                }
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
                style={{
                  background: 'var(--bb-depth-3)',
                  color: 'var(--bb-ink-80)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <Download className="h-3.5 w-3.5" />
                Exportar
              </button>
            </div>
          </div>

          {/* Bank not configured warning */}
          {bankConfigured === false && (
            <div
              className="mb-4 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}
            >
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#EAB308' }}>Configure seus dados bancarios para gerar cobrancas</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--bb-ink-60)' }}>
                  Voce precisa informar sua conta bancaria para receber pagamentos dos alunos.
                </p>
              </div>
              <Link
                href="/admin/configuracoes/dados-bancarios"
                className="rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium text-white transition-all hover:opacity-80 whitespace-nowrap flex items-center"
                style={{ background: 'var(--bb-brand)' }}
              >
                Configurar agora
              </Link>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Receita Mês', value: `R$ ${fmt(summary.revenue_this_month)}`, icon: <DollarIcon className="h-4 w-4" />, trend: `${trendPct >= 0 ? '+' : ''}${trendPct}% vs anterior`, trendUp: trendPct >= 0 },
              { label: 'Pendente', value: `R$ ${fmt(summary.pending_amount)}`, icon: <TrendingUpIcon className="h-4 w-4" />, trend: `${summary.total_count - summary.paid_count} alunos`, trendUp: true },
              { label: 'Atrasado', value: `R$ ${fmt(summary.overdue_amount)}`, icon: <UsersIcon className="h-4 w-4" />, trend: `${summary.overdue_count} inadimplentes`, trendUp: false },
              { label: 'Ticket Médio', value: `R$ ${fmt(summary.ticket_medio)}`, icon: <DollarIcon className="h-4 w-4" />, trend: `${summary.paid_count} pagos`, trendUp: true },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="p-4"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 'var(--bb-radius-lg)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--bb-ink-40)' }}>{kpi.icon}</span>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>{kpi.label}</p>
                </div>
                <p className="mt-2 text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>{kpi.value}</p>
                <p className="mt-1 text-xs" style={{ color: kpi.trendUp ? '#22C55E' : '#EF4444' }}>{kpi.trend}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Chart ─────────────────────────────────────────────────── */}
        <section className="animate-reveal">
          <div
            className="p-5"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Receita — Últimos 6 Meses</h2>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <XAxis dataKey="month" tick={{ fill: 'var(--bb-ink-40)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--bb-ink-40)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [`R$ ${fmt(Number(value))}`, 'Receita']}
                  />
                  <Bar dataKey="receita" fill="#22C55E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pendente" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <section className="animate-reveal">
          <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--bb-depth-3)' }}>
            {[
              { key: 'mensalidades' as Tab, label: 'Mensalidades' },
              { key: 'cobrancas' as Tab, label: `Cobrancas (${studentPayments.length})` },
              { key: 'inadimplentes' as Tab, label: `Inadimplentes (${overdue.length})` },
              { key: 'relatorio' as Tab, label: 'Relatorio' },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className="flex-1 rounded-md px-2 sm:px-4 py-2 min-h-[44px] text-xs sm:text-sm font-medium transition-all"
                style={{
                  background: tab === t.key ? 'var(--bb-brand)' : 'transparent',
                  color: tab === t.key ? '#fff' : 'var(--bb-ink-60)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Tab: Mensalidades ──────────────────────────────────────── */}
        {tab === 'mensalidades' && (
          <section className="animate-reveal space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
                <input
                  type="text"
                  placeholder="Buscar aluno..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="w-full rounded-lg py-2 pl-9 pr-3 min-h-[44px] text-sm"
                  style={{
                    background: 'var(--bb-depth-2)',
                    border: '1px solid var(--bb-glass-border)',
                    color: 'var(--bb-ink-100)',
                  }}
                />
              </div>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="rounded-lg px-3 py-2 min-h-[44px] text-sm w-full sm:w-auto"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  color: 'var(--bb-ink-100)',
                }}
              >
                {Array.from({ length: 6 }, (_, i) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - i);
                  const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                  const label = d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
                  return <option key={val} value={val}>{label}</option>;
                })}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg px-3 py-2 min-h-[44px] text-sm w-full sm:w-auto"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  color: 'var(--bb-ink-100)',
                }}
              >
                <option value="">Todos</option>
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>

            {/* List */}
            <div className="space-y-2">
              {mensalidades.length === 0 ? (
                <EmptyState
                  icon={DollarIcon}
                  title="Nenhuma fatura registrada"
                  description="Gere sua primeira fatura para controlar as finanças."
                />
              ) : (
                mensalidades.map((m) => {
                  const sc = m.status === 'pago' && m.manual_payment
                    ? { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' }
                    : (STATUS_COLORS[m.status] ?? STATUS_COLORS.pendente);

                  // Build status label with visual differentiation
                  let statusLabel: string;
                  if (m.status === 'pago' && m.manual_payment) {
                    statusLabel = `Baixa manual${m.payment_method ? ` — ${m.payment_method}` : ''}`;
                  } else if (m.status === 'pago' && m.paid_at) {
                    statusLabel = `Pago em ${new Date(m.paid_at).toLocaleDateString('pt-BR')}`;
                  } else {
                    statusLabel = STATUS_LABELS[m.status] ?? m.status;
                  }

                  return (
                    <div
                      key={m.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-lg p-3"
                      style={{
                        background: 'var(--bb-depth-2)',
                        border: '1px solid var(--bb-glass-border)',
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>
                          {m.student_name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                          Venc: {new Date(m.due_date).toLocaleDateString('pt-BR')}
                          {m.status === 'pago' && !m.manual_payment && m.payment_method && ` · ${m.payment_method}`}
                          {m.manual_payment && m.payment_notes && ` · ${m.payment_notes}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                          R$ {fmt(m.amount)}
                        </p>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap"
                          style={{ background: sc.bg, color: sc.text }}
                        >
                          {statusLabel}
                        </span>
                        {(m.status === 'pendente' || m.status === 'atrasado') && (
                          <>
                            <button
                              type="button"
                              onClick={() => openManualPayment(m)}
                              className="rounded-lg px-3 py-1.5 min-h-[44px] text-xs font-medium transition-all hover:opacity-80 whitespace-nowrap"
                              style={{
                                background: 'var(--bb-brand)',
                                color: '#fff',
                              }}
                            >
                              Dar baixa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkPaid(m.id)}
                              className="rounded-lg px-3 py-1.5 min-h-[44px] min-w-[44px] text-xs font-medium transition-all hover:opacity-80"
                              style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
                            >
                              Pago
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* ── Tab: Cobrancas (student_payments) ─────────────────────── */}
        {tab === 'cobrancas' && (
          <section className="animate-reveal space-y-3">
            {studentPayments.length === 0 ? (
              <EmptyState
                icon={DollarIcon}
                title="Nenhuma cobranca gerada"
                description="Use o botao Gerar Cobranca para criar a primeira."
              />
            ) : (
              studentPayments.map((sp) => {
                const sc = SP_STATUS_COLORS[sp.status] ?? SP_STATUS_COLORS.PENDING;
                return (
                  <div
                    key={sp.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-lg p-3"
                    style={{
                      background: 'var(--bb-depth-2)',
                      border: '1px solid var(--bb-glass-border)',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>
                        {sp.student_name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        {sp.description} · Venc: {new Date(sp.due_date).toLocaleDateString('pt-BR')} · {sp.billing_type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                        R$ {fmt(sp.amount_cents / 100)}
                      </p>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {SP_STATUS_LABELS[sp.status] ?? sp.status}
                      </span>
                      {sp.invoice_url && (
                        <a
                          href={sp.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80 whitespace-nowrap"
                          style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
                        >
                          Ver link
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </section>
        )}

        {/* ── Tab: Inadimplentes ─────────────────────────────────────── */}
        {tab === 'inadimplentes' && (
          <section className="animate-reveal space-y-3">
            {overdue.length === 0 ? (
              <div
                className="rounded-lg p-8 text-center"
                style={{ background: 'var(--bb-success-surface)', borderLeft: '4px solid #22C55E' }}
              >
                <p className="text-sm font-medium" style={{ color: '#22C55E' }}>
                  Nenhum inadimplente! Todas as mensalidades estão em dia.
                </p>
              </div>
            ) : (
              overdue.map((o) => (
                <div
                  key={`${o.student_id}-${o.reference_month}`}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-lg p-4"
                  style={{
                    background: 'var(--bb-depth-2)',
                    borderLeft: '4px solid #EF4444',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{o.student_name}</p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      Venc: {new Date(o.due_date).toLocaleDateString('pt-BR')} · {o.days_overdue} dias atraso
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-sm font-bold" style={{ color: '#EF4444' }}>R$ {fmt(o.amount)}</p>
                    <button
                      type="button"
                      className="rounded-lg px-3 py-1.5 min-h-[44px] text-xs font-medium transition-all hover:opacity-80 whitespace-nowrap"
                      style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                      onClick={() => toast(`Lembrete enviado para ${o.student_name}`, 'success')}
                    >
                      Enviar Cobranca
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* ── Tab: Relatório ─────────────────────────────────────────── */}
        {tab === 'relatorio' && (
          <section className="animate-reveal">
            {reportData ? (
              <ReportViewer
                type="financial"
                data={reportData}
                onClose={() => setReportData(null)}
              />
            ) : (
              <div
                className="p-5"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 'var(--bb-radius-lg)',
                }}
              >
                <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                  Resumo Mensal — {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>

                <div className="space-y-3">
                  {[
                    { label: 'Receita Total', value: `R$ ${fmt(summary.revenue_this_month)}` },
                    { label: 'Receita Mês Anterior', value: `R$ ${fmt(summary.revenue_last_month)}` },
                    { label: 'Variação', value: `${trendPct >= 0 ? '+' : ''}${trendPct}%` },
                    { label: 'Pendente', value: `R$ ${fmt(summary.pending_amount)}` },
                    { label: 'Atrasado', value: `R$ ${fmt(summary.overdue_amount)}` },
                    { label: 'Total Pagos', value: `${summary.paid_count}` },
                    { label: 'Total Mensalidades', value: `${summary.total_count}` },
                    { label: 'Ticket Médio', value: `R$ ${fmt(summary.ticket_medio)}` },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between py-2"
                      style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                    >
                      <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>{row.label}</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={reportLoading}
                  onClick={async () => {
                    setReportLoading(true);
                    try {
                      const data = await generateFinancialReport(getActiveAcademyId(), new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));
                      setReportData(data);
                    } catch (err) {
                      toast(translateError(err), 'error');
                    } finally {
                      setReportLoading(false);
                    }
                  }}
                  className="mt-4 w-full sm:w-auto rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ background: 'var(--bb-brand)', color: '#fff' }}
                >
                  {reportLoading ? 'Gerando...' : 'Exportar PDF'}
                </button>
              </div>
            )}
          </section>
        )}
        {/* Manual Payment Modal */}
        <ManualPaymentModal
          open={manualPaymentOpen}
          data={manualPaymentData}
          saving={manualPaymentSaving}
          onClose={() => {
            setManualPaymentOpen(false);
            setManualPaymentData(null);
          }}
          onConfirm={handleManualPaymentConfirm}
        />

        {/* Charge Modal */}
        <ChargeStudentModal
          open={chargeOpen}
          onClose={() => setChargeOpen(false)}
          onCreated={() => {
            // Reload student payments
            if (!isMock()) {
              const supabase = createBrowserClient();
              supabase
                .from('student_payments')
                .select('id, description, amount_cents, due_date, status, invoice_url, billing_type, student_profile_id')
                .eq('academy_id', getActiveAcademyId())
                .order('created_at', { ascending: false })
                .limit(50)
                .then(({ data }: { data: Array<{ id: string; student_profile_id: string; description: string; amount_cents: number; due_date: string; status: string; invoice_url: string | null; billing_type: string }> | null }) => {
                  if (data) {
                    const profileIds = [...new Set(data.map((p) => p.student_profile_id))];
                    supabase
                      .from('profiles')
                      .select('id, display_name')
                      .in('id', profileIds)
                      .then(({ data: profiles }: { data: Array<{ id: string; display_name: string }> | null }) => {
                        const nameMap = new Map((profiles || []).map((p) => [p.id, p.display_name]));
                        setStudentPayments(data.map((p) => ({
                          ...p,
                          student_name: nameMap.get(p.student_profile_id) || 'Aluno',
                        })));
                      });
                  }
                });
            }
          }}
        />
      </div>
    </PlanGate>
  );
}
