'use client';

import { useEffect, useState } from 'react';
import { getMyNetwork, getNetworkDashboard, type NetworkDashboard, type AcademyStatus } from '@/lib/api/franchise.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/lib/hooks/useToast';
import { useAuth } from '@/lib/hooks/useAuth';
import { sendNetworkMessage } from '@/lib/api/franchise.service';
import { translateError } from '@/lib/utils/error-translator';
import { BarChart3, Building2 } from 'lucide-react';

const STATUS_LABEL: Record<AcademyStatus, string> = { ativa: 'Ativa', inadimplente: 'Inadimplente', suspensa: 'Suspensa', em_setup: 'Em Setup' };
const STATUS_STYLE: Record<AcademyStatus, React.CSSProperties> = { ativa: { background: 'color-mix(in srgb, var(--bb-success) 15%, transparent)', color: 'var(--bb-success)' }, inadimplente: { background: 'color-mix(in srgb, var(--bb-danger) 15%, transparent)', color: 'var(--bb-danger)' }, suspensa: { background: 'color-mix(in srgb, var(--bb-warning) 15%, transparent)', color: 'var(--bb-warning)' }, em_setup: { background: 'color-mix(in srgb, var(--bb-brand) 15%, transparent)', color: 'var(--bb-brand)' } };
const ALERT_ICON: Record<string, string> = { high_churn: 'Churn', overdue: 'Atraso', attendance_drop: 'Frequencia', low_nps: 'NPS' };

export default function FranqueadorDashboardPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [franchiseId, setFranchiseId] = useState('');
  const [dashboard, setDashboard] = useState<NetworkDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [msgModal, setMsgModal] = useState(false);
  const [msgForm, setMsgForm] = useState({ subject: '', body: '', channel: 'email' as 'email' | 'push' | 'sms' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      if (!profile?.id) return;
      try {
        const network = await getMyNetwork(profile.id);
        if (!network) return;
        setFranchiseId(network.id);
        const result = await getNetworkDashboard(network.id);
        setDashboard(result);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSendMessage() {
    if (!franchiseId) return;
    setSending(true);
    try {
      await sendNetworkMessage(franchiseId, {
        subject: msgForm.subject,
        body: msgForm.body,
        recipients: [],
        channel: msgForm.channel,
      });
      setMsgModal(false);
      setMsgForm({ subject: '', body: '', channel: 'email' });
      toast('Mensagem enviada para a rede', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!dashboard) return <EmptyState icon={<BarChart3 className="h-12 w-12" />} title="Nenhuma rede encontrada" description="Nao foi possivel encontrar sua rede de franquias. Verifique se voce tem acesso como franqueador." variant="first-time" />;

  const { kpis, academies, alerts, financials } = dashboard;

  // Sort academies by revenue descending for ranking
  const ranked = [...academies].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-bb-black">Dashboard da Rede</h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setMsgModal(true)}>Enviar Mensagem</Button>
          <Button variant="secondary" onClick={() => toast('Entre em contato com o suporte para cadastrar novas franquias.', 'info')}>
            Nova Franquia
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Academias', value: kpis.total_academies.toString() },
          { label: 'Alunos na Rede', value: kpis.total_students.toLocaleString('pt-BR') },
          { label: 'Receita Total (12m)', value: `R$ ${(kpis.total_revenue / 1000).toFixed(0)}k` },
          { label: 'Royalties (12m)', value: `R$ ${(kpis.total_royalties / 1000).toFixed(0)}k` },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <p className="text-xs text-bb-gray-500">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-bb-black">{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-bb-gray-500">NPS Medio da Rede</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: kpis.avg_nps >= 70 ? 'var(--bb-success)' : 'var(--bb-warning)' }}>{kpis.avg_nps}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-bb-gray-500">Frequencia Media</p>
          <p className="mt-1 text-2xl font-bold text-bb-black">{kpis.avg_attendance}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-bb-gray-500">Crescimento</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: financials.growth_pct >= 0 ? 'var(--bb-success)' : 'var(--bb-danger)' }}>
            {financials.growth_pct >= 0 ? '+' : ''}{financials.growth_pct}%
          </p>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-l-4 p-4" style={{ borderLeftColor: 'var(--bb-danger)' }}>
          <h2 className="mb-3 font-semibold text-bb-black">Alertas da Rede</h2>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 rounded-lg p-3" style={{ background: alert.severity === 'critical' ? 'color-mix(in srgb, var(--bb-danger) 8%, transparent)' : 'color-mix(in srgb, var(--bb-warning) 8%, transparent)' }}>
                <span className="mt-0.5 rounded px-2 py-0.5 text-[10px] font-bold uppercase" style={alert.severity === 'critical' ? { background: 'color-mix(in srgb, var(--bb-danger) 25%, transparent)', color: 'var(--bb-danger)' } : { background: 'color-mix(in srgb, var(--bb-warning) 25%, transparent)', color: 'var(--bb-warning)' }}>
                  {ALERT_ICON[alert.type] ?? alert.type}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-bb-black">{alert.academy_name}</p>
                  <p className="text-xs text-bb-gray-500">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Franchise Ranking */}
      <Card className="overflow-hidden">
        <div className="border-b border-bb-gray-300 p-4">
          <h2 className="font-semibold text-bb-black">Ranking das Franquias</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">#</th>
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Academia</th>
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Cidade</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Alunos</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Receita</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Frequencia</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">NPS</th>
                <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {ranked.length === 0 && (
                <tr><td colSpan={8}>
                  <EmptyState
                    icon={<Building2 className="h-12 w-12" />}
                    title="Nenhuma franquia cadastrada"
                    description="Cadastre franquias para visualizar o ranking da rede."
                    variant="first-time"
                  />
                </td></tr>
              )}
              {ranked.map((academy, idx) => (
                <tr key={academy.id} className="border-b border-bb-gray-100">
                  <td className="px-4 py-3 font-bold text-bb-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-bb-black">{academy.name}</td>
                  <td className="px-4 py-3 text-bb-gray-500">{academy.city}</td>
                  <td className="px-4 py-3 text-right text-bb-gray-500">{academy.students}</td>
                  <td className="px-4 py-3 text-right text-bb-gray-500">R$ {academy.revenue.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right">
                    <span style={{ color: academy.attendance_rate >= 80 ? 'var(--bb-success)' : academy.attendance_rate >= 70 ? 'var(--bb-warning)' : 'var(--bb-danger)' }}>
                      {academy.attendance_rate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span style={{ color: academy.nps >= 70 ? 'var(--bb-success)' : academy.nps >= 50 ? 'var(--bb-warning)' : 'var(--bb-danger)' }}>
                      {academy.nps}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium" style={STATUS_STYLE[academy.status]}>
                      {STATUS_LABEL[academy.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Revenue Chart - simple bar representation */}
      <Card className="p-4">
        <h2 className="mb-4 font-semibold text-bb-black">Receita por Mes (ultimos 12 meses)</h2>
        {financials.monthly_data.length === 0 && (
          <EmptyState
            icon={<BarChart3 className="h-12 w-12" />}
            title="Nenhum dado de receita disponível"
            description="Os dados de receita mensal aparecerão aqui conforme as franquias reportarem faturamento."
            variant="default"
          />
        )}
        <div className="space-y-2">
          {financials.monthly_data.slice(-6).map((m) => {
            const maxRevenue = Math.max(...financials.monthly_data.map((d) => d.total));
            const pct = maxRevenue > 0 ? (m.total / maxRevenue) * 100 : 0;
            return (
              <div key={m.month} className="flex items-center gap-3">
                <span className="w-16 text-xs text-bb-gray-500">{m.month}</span>
                <div className="flex-1">
                  <div className="h-6 rounded bg-bb-gray-200">
                    <div className="flex h-full rounded bg-bb-primary" style={{ width: `${pct}%` }}>
                      {m.academies.map((a, i) => (
                        <div
                          key={a.academy_id}
                          className="h-full first:rounded-l last:rounded-r"
                          style={{
                            width: `${m.total > 0 ? (a.revenue / m.total) * 100 : 0}%`,
                            backgroundColor: ['#dc2626', '#f97316', '#eab308', '#22c55e', '#3b82f6'][i % 5],
                            opacity: 0.8,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="w-24 text-right text-xs font-medium text-bb-gray-500">R$ {(m.total / 1000).toFixed(0)}k</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {academies.map((a, i) => (
            <div key={a.id} className="flex items-center gap-1 text-xs text-bb-gray-500">
              <span className="inline-block h-2.5 w-2.5 rounded" style={{ backgroundColor: ['#dc2626', '#f97316', '#eab308', '#22c55e', '#3b82f6'][i % 5] }} />
              {a.name.replace('Black Belt ', '')}
            </div>
          ))}
        </div>
      </Card>

      {/* Send Message Modal */}
      <Modal open={msgModal} onClose={() => setMsgModal(false)} title="Enviar Mensagem para a Rede">
        <div className="space-y-3">
          <input
            placeholder="Assunto"
            value={msgForm.subject}
            onChange={(e) => setMsgForm({ ...msgForm, subject: e.target.value })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Mensagem..."
            value={msgForm.body}
            onChange={(e) => setMsgForm({ ...msgForm, body: e.target.value })}
            rows={4}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />
          <select
            value={msgForm.channel}
            onChange={(e) => setMsgForm({ ...msgForm, channel: e.target.value as 'email' | 'push' | 'sms' })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          >
            <option value="email">E-mail</option>
            <option value="push">Push Notification</option>
            <option value="sms">SMS</option>
          </select>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setMsgModal(false)}>Cancelar</Button>
            <Button className="flex-1" loading={sending} onClick={handleSendMessage} disabled={!msgForm.subject || !msgForm.body}>
              Enviar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
