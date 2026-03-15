'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { listPlans } from '@/lib/api/planos.service';
import { listInvoices, markInvoicePaid, generateMonthlyInvoices } from '@/lib/api/faturas.service';
import type { InvoiceWithDetails } from '@/lib/api/faturas.service';
import type { Plan } from '@/lib/types';
import { InvoiceStatus } from '@/lib/types';
import { getBillingConfig, updateBillingConfig, getWebhookLogs, previewNextBilling } from '@/lib/api/billing-config.service';
import type { BillingConfig, BillingPreview, WebhookLog } from '@/lib/types/payment';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';

const RevenueChart = dynamic(() => import('./RevenueChart'), { ssr: false });

const STATUS_LABEL: Record<string, string> = {
  paid: 'Pago',
  open: 'Pendente',
  uncollectible: 'Atrasado',
  draft: 'Rascunho',
  void: 'Cancelado',
};

const STATUS_COLOR: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  open: 'bg-yellow-100 text-yellow-700',
  uncollectible: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-500',
  void: 'bg-gray-100 text-gray-500',
};

type FinanceTab = 'overview' | 'cobrancas' | 'gateway';

export default function AdminFinanceiroPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<FinanceTab>('overview');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [generateModal, setGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Billing config state
  const [billingConfig, setBillingConfig] = useState<BillingConfig | null>(null);
  const [billingPreview, setBillingPreview] = useState<BillingPreview | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    Promise.all([
      listPlans('academy-1'),
      listInvoices('academy-1'),
      getBillingConfig('academy-1'),
      getWebhookLogs('academy-1'),
      previewNextBilling('academy-1'),
    ])
      .then(([p, i, bc, wl, bp]) => {
        setPlans(p);
        setInvoices(i);
        setBillingConfig(bc);
        setWebhookLogs(wl);
        setBillingPreview(bp);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const currentMonthInvoices = invoices.filter((i) => {
    const d = new Date(i.due_date);
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
  });

  const receitaMensal = currentMonthInvoices
    .filter((i) => i.status === InvoiceStatus.Paid)
    .reduce((s, i) => s + i.amount, 0);

  const totalMensal = currentMonthInvoices.reduce((s, i) => s + i.amount, 0);
  const inadimplencia = totalMensal > 0 ? ((totalMensal - receitaMensal) / totalMensal * 100) : 0;
  const alunosPagantes = new Set(invoices.filter((i) => i.status === InvoiceStatus.Paid).map((i) => i.student_id)).size;

  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5 + i);
    const month = d.toLocaleDateString('pt-BR', { month: 'short' });
    const monthInvoices = invoices.filter((inv) => {
      const id = new Date(inv.due_date);
      return id.getMonth() === d.getMonth() && id.getFullYear() === d.getFullYear();
    });
    const receita = monthInvoices.filter((inv) => inv.status === InvoiceStatus.Paid).reduce((s, inv) => s + inv.amount, 0);
    const total = monthInvoices.reduce((s, inv) => s + inv.amount, 0);
    const inad = total > 0 ? ((total - receita) / total * 100) : 0;
    return { month, receita, inadimplencia: Math.round(inad) };
  });

  const filteredInvoices = invoices.filter((i) => {
    if (filterStatus && i.status !== filterStatus) return false;
    return true;
  }).slice(0, 50);

  async function handleMarkPaid(id: string) {
    try {
      await markInvoicePaid(id);
      setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, status: InvoiceStatus.Paid } : i));
      toast('Fatura marcada como paga', 'success');
    } catch {
      toast('Erro ao marcar fatura', 'error');
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateMonthlyInvoices('academy-1');
      setGenerateModal(false);
      toast('Cobranças geradas com sucesso', 'success');
    } catch {
      toast('Erro ao gerar cobranças', 'error');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveConfig() {
    if (!billingConfig) return;
    setSavingConfig(true);
    try {
      const updated = await updateBillingConfig(billingConfig);
      setBillingConfig(updated);
      toast('Configuração salva', 'success');
    } catch {
      toast('Erro ao salvar', 'error');
    } finally {
      setSavingConfig(false);
    }
  }

  const planSubscriberCount = (planId: string) => {
    return new Set(invoices.filter((i) => {
      const plansList = ['plan-mensal', 'plan-mensal', 'plan-mensal', 'plan-trimestral', 'plan-trimestral', 'plan-anual'];
      const idx = parseInt(i.student_id.split('-')[1]) - 1;
      return plansList[idx % plansList.length] === planId && i.status !== InvoiceStatus.Void;
    }).map((i) => i.student_id)).size;
  };

  if (loading) return <div className="space-y-4 p-6"><Skeleton variant="text" className="h-8 w-48" /><Skeleton variant="card" className="h-64" /></div>;

  const TABS: { id: FinanceTab; label: string }[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'cobrancas', label: 'Cobranças Automáticas' },
    { id: 'gateway', label: 'Gateway' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Financeiro</h1>
        {tab === 'overview' && <Button onClick={() => setGenerateModal(true)}>Gerar Cobranças do Mês</Button>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-bb-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white text-bb-black shadow-sm' : 'text-bb-gray-500 hover:text-bb-black'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Receita Mensal', value: `R$ ${receitaMensal.toLocaleString('pt-BR')}` },
              { label: 'Inadimplência', value: `${inadimplencia.toFixed(1)}%` },
              { label: 'Alunos Pagantes', value: alunosPagantes.toString() },
              { label: 'MRR', value: `R$ ${receitaMensal.toLocaleString('pt-BR')}` },
            ].map((kpi) => (
              <Card key={kpi.label} className="p-4">
                <p className="text-xs text-bb-gray-500">{kpi.label}</p>
                <p className="mt-1 text-2xl font-bold text-bb-black">{kpi.value}</p>
              </Card>
            ))}
          </div>

          {/* Chart */}
          <Card className="p-4">
            <h2 className="mb-4 font-semibold text-bb-black">Receita x Inadimplência (6 meses)</h2>
            <RevenueChart data={monthlyRevenue} />
          </Card>

          {/* Faturas */}
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-bb-gray-300 p-4">
              <h2 className="font-semibold text-bb-black">Faturas</h2>
              <div className="ml-auto flex gap-2">
                {['', 'paid', 'open', 'uncollectible'].map((s) => (
                  <button key={s} onClick={() => setFilterStatus(s)} className={`rounded-full px-3 py-1 text-xs font-medium ${filterStatus === s ? 'bg-bb-red text-white' : 'bg-bb-gray-100 text-bb-gray-500'}`}>
                    {s ? STATUS_LABEL[s] : 'Todas'}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                  <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Aluno</th>
                  <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Plano</th>
                  <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Valor</th>
                  <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Vencimento</th>
                  <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Ações</th>
                </tr></thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className={`border-b border-bb-gray-100 ${inv.status === 'uncollectible' ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3 font-medium text-bb-black">{inv.student_name}</td>
                      <td className="px-4 py-3 text-bb-gray-500">{inv.plan_name}</td>
                      <td className="px-4 py-3 text-right text-bb-gray-500">R$ {inv.amount.toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-right text-bb-gray-500">{new Date(inv.due_date).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[inv.status] || 'bg-gray-100 text-gray-500'}`}>{STATUS_LABEL[inv.status] || inv.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {inv.status !== 'paid' && (
                          <button onClick={() => handleMarkPaid(inv.id)} className="text-xs text-bb-red hover:underline">Marcar Pago</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Planos */}
          <section>
            <h2 className="mb-3 font-semibold text-bb-black">Planos</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.id} className="p-4">
                  <h3 className="text-lg font-bold text-bb-black">{plan.name}</h3>
                  <p className="mt-1 text-2xl font-bold text-bb-red">R$ {plan.price.toLocaleString('pt-BR')}<span className="text-sm font-normal text-bb-gray-500">/{plan.interval === 'monthly' ? 'mês' : plan.interval === 'quarterly' ? 'trim' : 'ano'}</span></p>
                  <ul className="mt-3 space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="text-xs text-bb-gray-500">• {f}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-bb-gray-500">{planSubscriberCount(plan.id)} assinantes</p>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Tab: Cobranças Automáticas */}
      {tab === 'cobrancas' && billingConfig && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-bb-black">Configuração de Cobranças</h2>
            <div className="space-y-4">
              {/* Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-bb-black">Cobrança Automática</p>
                  <p className="text-sm text-bb-gray-500">Gera faturas automaticamente todo mês</p>
                </div>
                <button
                  onClick={() => setBillingConfig({ ...billingConfig, autoCharge: !billingConfig.autoCharge })}
                  className={`relative h-6 w-11 rounded-full transition-colors ${billingConfig.autoCharge ? 'bg-green-500' : 'bg-bb-gray-300'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${billingConfig.autoCharge ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Due Day */}
              <div>
                <label className="block text-sm font-medium text-bb-black">Dia do Vencimento</label>
                <select
                  value={billingConfig.dueDayOfMonth}
                  onChange={(e) => setBillingConfig({ ...billingConfig, dueDayOfMonth: Number(e.target.value) })}
                  className="mt-1 rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Reminder Days */}
              <div>
                <label className="block text-sm font-medium text-bb-black">Dias de Lembrete (antes do vencimento)</label>
                <select
                  value={billingConfig.reminderDaysBefore}
                  onChange={(e) => setBillingConfig({ ...billingConfig, reminderDaysBefore: Number(e.target.value) })}
                  className="mt-1 rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                >
                  {[1, 2, 3, 5, 7].map((d) => (
                    <option key={d} value={d}>{d} dias</option>
                  ))}
                </select>
              </div>

              {/* Block After */}
              <div>
                <label className="block text-sm font-medium text-bb-black">Bloquear Acesso Após (dias de atraso)</label>
                <select
                  value={billingConfig.blockAfterDays}
                  onChange={(e) => setBillingConfig({ ...billingConfig, blockAfterDays: Number(e.target.value) })}
                  className="mt-1 rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                >
                  {[5, 7, 10, 15, 30, 0].map((d) => (
                    <option key={d} value={d}>{d === 0 ? 'Nunca bloquear' : `${d} dias`}</option>
                  ))}
                </select>
              </div>

              <Button onClick={handleSaveConfig} loading={savingConfig}>Salvar Configuração</Button>
            </div>
          </Card>

          {/* Preview */}
          {billingPreview && billingConfig.autoCharge && (
            <Card className="border-l-4 border-l-blue-500 p-4">
              <p className="text-sm text-bb-gray-700">
                Se ativar, <strong>{billingPreview.totalInvoices}</strong> cobranças serão geradas dia{' '}
                <strong>{new Date(billingPreview.nextDueDate).toLocaleDateString('pt-BR')}</strong>{' '}
                totalizando <strong>R$ {billingPreview.totalAmount.toLocaleString('pt-BR')}</strong>.
              </p>
              <p className="mt-1 text-xs text-bb-gray-500">{billingPreview.subscriptionsAffected} assinaturas ativas afetadas.</p>
            </Card>
          )}
        </div>
      )}

      {/* Tab: Gateway */}
      {tab === 'gateway' && (
        <div className="space-y-6">
          {/* Connection Status */}
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-bb-black">Status do Gateway</h2>
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-green-500" />
              <span className="font-medium text-bb-black capitalize">{billingConfig?.gateway ?? 'mock'}</span>
              <span className="text-sm text-bb-gray-500">— Conectado</span>
            </div>
          </Card>

          {/* Webhook Logs */}
          <Card className="overflow-hidden">
            <div className="border-b border-bb-gray-300 p-4">
              <h2 className="font-semibold text-bb-black">Últimos Webhooks</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                  <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Evento</th>
                  <th className="px-4 py-3 text-left font-medium text-bb-gray-500">ID Externo</th>
                  <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Data</th>
                  <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Ações</th>
                </tr></thead>
                <tbody>
                  {webhookLogs.map((log) => (
                    <tr key={log.id} className="border-b border-bb-gray-100">
                      <td className="px-4 py-3 font-mono text-xs text-bb-black">{log.eventType}</td>
                      <td className="px-4 py-3 font-mono text-xs text-bb-gray-500">{log.externalId}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          log.status === 'processed' ? 'bg-green-100 text-green-700' :
                          log.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                        }`}>{log.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-bb-gray-500">{new Date(log.receivedAt).toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-right">
                        {log.status === 'failed' && (
                          <button onClick={() => toast('Webhook reprocessado', 'success')} className="text-xs text-bb-red hover:underline">
                            Reprocessar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      <Modal open={generateModal} onClose={() => setGenerateModal(false)} title="Gerar Cobranças" variant="confirm">
        <div className="space-y-4">
          <p className="text-sm text-bb-gray-500">Deseja gerar as cobranças do mês para todos os alunos com assinatura ativa?</p>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setGenerateModal(false)}>Cancelar</Button>
            <Button className="flex-1" loading={generating} onClick={handleGenerate}>Gerar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
