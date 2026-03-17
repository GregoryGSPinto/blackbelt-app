'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  listMensalidades,
  getFinancialSummary,
  getRevenueChart,
  getOverdueList,
  markAsPaid,
} from '@/lib/api/financial.service';
import type { Mensalidade, FinancialSummary, FinancialChartPoint, OverdueItem } from '@/lib/types/financial';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { DollarIcon, TrendingUpIcon, UsersIcon, SearchIcon } from '@/components/shell/icons';

const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });

type Tab = 'mensalidades' | 'inadimplentes' | 'relatorio';

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

  // Filters
  const [filterMonth, setFilterMonth] = useState('2026-03');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [s, c, m, o] = await Promise.all([
          getFinancialSummary('academy-1'),
          getRevenueChart('academy-1'),
          listMensalidades('academy-1', { month: filterMonth, status: filterStatus || undefined, search: filterSearch || undefined }),
          getOverdueList('academy-1'),
        ]);
        setSummary(s);
        setChart(c);
        setMensalidades(m);
        setOverdue(o);
      } catch {
        toast('Erro ao carregar dados financeiros', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filterMonth, filterStatus, filterSearch, toast]);

  async function handleMarkPaid(id: string) {
    try {
      const updated = await markAsPaid(id, 'PIX');
      setMensalidades((prev) => prev.map((m) => (m.id === id ? updated : m)));
      toast('Pagamento registrado!', 'success');
    } catch {
      toast('Erro ao registrar pagamento', 'error');
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
    <div className="min-h-screen space-y-6 p-4 sm:p-6 overflow-x-hidden" data-stagger>
      {/* ── Stats ─────────────────────────────────────────────────── */}
      <section className="animate-reveal">
        <h1 className="mb-4 text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>Financeiro</h1>
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
            { key: 'inadimplentes' as Tab, label: `Inadimplentes (${overdue.length})` },
            { key: 'relatorio' as Tab, label: 'Relatório' },
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
              <option value="2026-03">Mar/2026</option>
              <option value="2026-02">Fev/2026</option>
              <option value="2026-01">Jan/2026</option>
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
              <p className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                Nenhuma mensalidade encontrada.
              </p>
            ) : (
              mensalidades.map((m) => {
                const sc = STATUS_COLORS[m.status] ?? STATUS_COLORS.pendente;
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
                        {m.payment_method && ` · ${m.payment_method}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                        R$ {fmt(m.amount)}
                      </p>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {STATUS_LABELS[m.status]}
                      </span>
                      {(m.status === 'pendente' || m.status === 'atrasado') && (
                        <button
                          type="button"
                          onClick={() => handleMarkPaid(m.id)}
                          className="rounded-lg px-3 py-1.5 min-h-[44px] min-w-[44px] text-xs font-medium transition-all hover:opacity-80"
                          style={{ background: '#22C55E', color: '#fff' }}
                        >
                          Pago
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
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
          <div
            className="p-5"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Resumo Mensal — Março 2026
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
              onClick={() => toast('Exportação em desenvolvimento', 'info')}
              className="mt-4 w-full sm:w-auto rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium transition-all hover:opacity-80"
              style={{ background: 'var(--bb-brand)', color: '#fff' }}
            >
              Exportar Relatório
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
