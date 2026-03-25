'use client';

import { useEffect, useState } from 'react';
import {
  listContratos,
  listContratosTemplates,
  gerarContrato,
  enviarParaAssinatura,
  getContratosMetrics,
  type Contrato,
  type ContratoTemplate,
  type ContratosMetrics,
  type StatusContrato,
} from '@/lib/api/contratos-v2.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import {
  FileTextIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
} from '@/components/shell/icons';
import { PlanGate } from '@/components/plans/PlanGate';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

const STATUS_LABEL: Record<StatusContrato, string> = {
  rascunho: 'Rascunho',
  enviado: 'Enviado',
  visualizado: 'Visualizado',
  assinado: 'Assinado',
  expirado: 'Expirado',
};

const STATUS_COLOR: Record<StatusContrato, { bg: string; text: string }> = {
  rascunho: { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' },
  enviado: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  visualizado: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
  assinado: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  expirado: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
};

const TIPO_LABEL: Record<string, string> = {
  matricula: 'Matricula',
  termo_responsabilidade: 'Termo de Responsabilidade',
  codigo_conduta: 'Codigo de Conduta',
  cancelamento: 'Cancelamento',
};

type TabKey = 'contratos' | 'templates';

export default function ContratosPage() {
  const { toast } = useToast();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [templates, setTemplates] = useState<ContratoTemplate[]>([]);
  const [metrics, setMetrics] = useState<ContratosMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('contratos');
  const [showGenerate, setShowGenerate] = useState(false);
  const [genForm, setGenForm] = useState({ templateId: '', alunoNome: '' });
  const [showSend, setShowSend] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [preview, setPreview] = useState<Contrato | null>(null);

  useEffect(() => {
    Promise.all([
      listContratos(getActiveAcademyId()),
      listContratosTemplates(getActiveAcademyId()),
      getContratosMetrics(getActiveAcademyId()),
    ])
      .then(([c, t, m]) => {
        setContratos(c);
        setTemplates(t);
        setMetrics(m);
        if (t.length > 0) setGenForm((prev) => ({ ...prev, templateId: t[0].id }));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    try {
      const contrato = await gerarContrato(genForm.templateId, `aluno-${Date.now()}`, { aluno_nome: genForm.alunoNome, academia_nome: 'BlackBelt Academy' });
      setContratos((prev) => [...prev, contrato]);
      setShowGenerate(false);
      setGenForm((prev) => ({ ...prev, alunoNome: '' }));
      toast('Contrato gerado', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleSend(contratoId: string, metodo: 'email' | 'whatsapp') {
    try {
      await enviarParaAssinatura(contratoId, metodo);
      setContratos((prev) =>
        prev.map((c) => (c.id === contratoId ? { ...c, status: 'enviado' as StatusContrato, enviadoPor: metodo } : c)),
      );
      setShowSend(null);
      toast(`Contrato enviado via ${metodo}`, 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-24" />)}
        </div>
        <Skeleton variant="card" className="h-12 w-64" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  const filtered = filterStatus === 'all' ? contratos : contratos.filter((c) => c.status === filterStatus);

  return (
    <PlanGate module="financeiro">
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Contratos</h1>
        <Button onClick={() => setShowGenerate(true)}>Gerar Contrato</Button>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Ativos', value: metrics.contratosAtivos, icon: FileTextIcon, color: '#3B82F6' },
            { label: 'Pendentes', value: metrics.pendentesAssinatura, icon: ClockIcon, color: '#F59E0B' },
            { label: 'Taxa Assinatura', value: `${metrics.taxaAssinatura}%`, icon: CheckCircleIcon, color: '#10B981' },
          ].map((m) => (
            <Card key={m.label} className="p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${m.color}20` }}>
                  <m.icon className="h-5 w-5" style={{ color: m.color }} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>{m.label}</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{m.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
        {(['contratos', 'templates'] as TabKey[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{
              color: tab === t ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
              borderBottom: tab === t ? '2px solid var(--bb-brand)' : '2px solid transparent',
            }}
          >
            {t === 'contratos' ? 'Contratos' : 'Templates'}
          </button>
        ))}
      </div>

      {tab === 'contratos' && (
        <>
          <div className="flex flex-wrap gap-2">
            {['all', 'rascunho', 'enviado', 'visualizado', 'assinado', 'expirado'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  background: filterStatus === s ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
                  color: filterStatus === s ? 'white' : 'var(--bb-ink-60)',
                }}
              >
                {s === 'all' ? 'Todos' : STATUS_LABEL[s as StatusContrato]}
              </button>
            ))}
          </div>

          <div
            className="overflow-hidden"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--bb-depth-3)', borderBottom: '1px solid var(--bb-glass-border)' }}>
                    <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Nome</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium md:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Tipo</th>
                    <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Status</th>
                    <th className="hidden px-4 py-3 text-right text-xs font-medium md:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Criado em</th>
                    <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const statusColors = STATUS_COLOR[c.status];
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                        <td className="px-4 py-3">
                          <p className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>{c.alunoNome}</p>
                          <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{c.templateNome}</p>
                        </td>
                        <td className="hidden px-4 py-3 text-xs md:table-cell" style={{ color: 'var(--bb-ink-60)' }}>{c.templateNome}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
                            style={{ background: statusColors.bg, color: statusColors.text }}
                          >
                            {STATUS_LABEL[c.status]}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-right text-xs md:table-cell" style={{ color: 'var(--bb-ink-60)' }}>
                          {new Date(c.criadoEm).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-wrap justify-end gap-1">
                            <button
                              onClick={() => setPreview(c)}
                              className="rounded px-2 py-1 text-xs font-medium transition-colors"
                              style={{ color: 'var(--bb-ink-60)', background: 'var(--bb-depth-3)' }}
                              title="Visualizar"
                            >
                              <EyeIcon className="inline h-3.5 w-3.5" />
                            </button>
                            {(c.status === 'rascunho' || c.status === 'visualizado') && (
                              <button
                                onClick={() => setShowSend(c.id)}
                                className="rounded px-2 py-1 text-xs font-medium transition-colors"
                                style={{ color: 'var(--bb-brand)' }}
                              >
                                Enviar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                        Nenhum contrato encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'templates' && (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((t) => (
            <Card key={t.id} className="p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{t.nome}</h3>
                  <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>Tipo: {TIPO_LABEL[t.tipo] ?? t.tipo}</p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Criado em: {new Date(t.criadoEm).toLocaleDateString('pt-BR')}</p>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{
                    background: t.ativo ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)',
                    color: t.ativo ? '#10B981' : '#6B7280',
                  }}
                >
                  {t.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              {t.variaveis.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {t.variaveis.map((v) => (
                    <span
                      key={v}
                      className="rounded px-1.5 py-0.5 text-[10px] font-mono"
                      style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Generate Modal */}
      <Modal open={showGenerate} onClose={() => setShowGenerate(false)} title="Gerar Contrato">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Template</label>
            <select
              value={genForm.templateId}
              onChange={(e) => setGenForm({ ...genForm, templateId: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', borderColor: 'var(--bb-glass-border)' }}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Nome do Aluno</label>
            <input
              value={genForm.alunoNome}
              onChange={(e) => setGenForm({ ...genForm, alunoNome: e.target.value })}
              placeholder="Nome completo"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', borderColor: 'var(--bb-glass-border)' }}
            />
          </div>
          <Button className="w-full" onClick={handleGenerate} disabled={!genForm.alunoNome}>Gerar</Button>
        </div>
      </Modal>

      {/* Send Modal */}
      <Modal open={!!showSend} onClose={() => setShowSend(null)} title="Enviar para Assinatura">
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>Escolha o canal de envio:</p>
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => showSend && handleSend(showSend, 'email')}>Email</Button>
            <Button className="flex-1" onClick={() => showSend && handleSend(showSend, 'whatsapp')}>WhatsApp</Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview ? `${preview.alunoNome} — ${preview.templateNome}` : ''}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={preview ? { background: STATUS_COLOR[preview.status].bg, color: STATUS_COLOR[preview.status].text } : {}}
            >
              {preview ? STATUS_LABEL[preview.status] : ''}
            </span>
            {preview?.enviadoPor && (
              <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                Enviado via {preview.enviadoPor}
              </span>
            )}
            {preview?.assinadoEm && (
              <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                Assinado em {new Date(preview.assinadoEm).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
          <div
            className="rounded-lg p-4 text-sm leading-relaxed"
            style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
            dangerouslySetInnerHTML={{ __html: preview?.conteudoFinal ?? '' }}
          />
          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            Criado em: {preview ? new Date(preview.criadoEm).toLocaleDateString('pt-BR') : ''}
          </p>
        </div>
      </Modal>
    </div>
    </PlanGate>
  );
}
