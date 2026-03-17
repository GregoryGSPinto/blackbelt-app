'use client';

import { useState, useEffect, useCallback, type CSSProperties } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import {
  listComunicados,
  createComunicado,
  enviarComunicado,
  deleteComunicado,
  type ComunicadoSaaS,
  type TipoComunicado,
  type CreateComunicadoPayload,
  type CanalComunicado,
} from '@/lib/api/superadmin-comunicacao.service';

// ── Constants ───────────────────────────────────────────────────────────

const TIPO_STYLES: Record<TipoComunicado, { bg: string; text: string; label: string }> = {
  informativo: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Informativo' },
  manutencao: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'Manutencao' },
  novidade: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'Novidade' },
  urgente: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'Urgente' },
  promocao: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7', label: 'Promocao' },
};

const CANAL_LABELS: Record<CanalComunicado, string> = {
  email: 'Email',
  push: 'Push',
  in_app: 'In-App',
};

type TabKey = 'enviados' | 'rascunhos';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function segmentLabel(com: ComunicadoSaaS): string {
  switch (com.segmentacao.tipo) {
    case 'todos': return 'Todos';
    case 'por_plano': return 'Por Plano';
    case 'por_health': return 'Por Health Score';
    case 'por_feature': return 'Por Feature';
    case 'manual': return 'Manual';
    default: return '-';
  }
}

function MetricBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="h-1.5 w-12 overflow-hidden rounded-full"
        style={{ background: 'var(--bb-depth-4)' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-[10px] tabular-nums" style={{ color: 'var(--bb-ink-40)' }}>
        {value}
      </span>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────

export default function ComunicacaoPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [enviados, setEnviados] = useState<ComunicadoSaaS[]>([]);
  const [rascunhos, setRascunhos] = useState<ComunicadoSaaS[]>([]);
  const [tab, setTab] = useState<TabKey>('enviados');

  // Detail modal
  const [detailItem, setDetailItem] = useState<ComunicadoSaaS | null>(null);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [formTipo, setFormTipo] = useState<TipoComunicado>('informativo');
  const [formTitulo, setFormTitulo] = useState('');
  const [formMensagem, setFormMensagem] = useState('');
  const [formSegTipo, setFormSegTipo] = useState<'todos' | 'por_plano' | 'por_health' | 'manual'>('todos');
  const [formPlanos, setFormPlanos] = useState<string[]>([]);
  const [formHealthScore, setFormHealthScore] = useState(50);
  const [formManualIds, setFormManualIds] = useState('');
  const [formCanais, setFormCanais] = useState<CanalComunicado[]>(['email']);
  const [creating, setCreating] = useState(false);

  // Action loading
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [envData, rascData] = await Promise.all([
        listComunicados('enviado'),
        listComunicados(),
      ]);
      setEnviados(envData.filter((c) => c.status === 'enviado'));
      setRascunhos(rascData.filter((c) => c.status === 'rascunho' || c.status === 'agendado'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Helpers ───────────────────────────────────────────────────────────

  function resetForm() {
    setFormTipo('informativo');
    setFormTitulo('');
    setFormMensagem('');
    setFormSegTipo('todos');
    setFormPlanos([]);
    setFormHealthScore(50);
    setFormManualIds('');
    setFormCanais(['email']);
    setShowCreate(false);
  }

  function buildSegmentacao() {
    switch (formSegTipo) {
      case 'todos':
        return { tipo: 'todos' as const };
      case 'por_plano':
        return { tipo: 'por_plano' as const, filtro: formPlanos.join(',') };
      case 'por_health':
        return { tipo: 'por_health' as const, filtro: String(formHealthScore) };
      case 'manual':
        return {
          tipo: 'manual' as const,
          academiasIds: formManualIds.split(',').map((s) => s.trim()).filter(Boolean),
        };
      default:
        return { tipo: 'todos' as const };
    }
  }

  function togglePlano(plano: string) {
    setFormPlanos((prev) =>
      prev.includes(plano) ? prev.filter((p) => p !== plano) : [...prev, plano],
    );
  }

  function toggleCanal(canal: CanalComunicado) {
    setFormCanais((prev) =>
      prev.includes(canal) ? prev.filter((c) => c !== canal) : [...prev, canal],
    );
  }

  // ── Actions ───────────────────────────────────────────────────────────

  async function handleCreate(enviarAgora: boolean) {
    if (!formTitulo.trim()) {
      toast('Titulo e obrigatorio.', 'error');
      return;
    }
    if (!formMensagem.trim()) {
      toast('Mensagem e obrigatoria.', 'error');
      return;
    }
    if (formCanais.length === 0) {
      toast('Selecione pelo menos um canal.', 'error');
      return;
    }
    setCreating(true);
    try {
      const payload: CreateComunicadoPayload = {
        titulo: formTitulo.trim(),
        mensagem: formMensagem.trim(),
        tipo: formTipo,
        segmentacao: buildSegmentacao(),
        canal: formCanais,
      };
      const created = await createComunicado(payload);

      if (enviarAgora) {
        const sent = await enviarComunicado(created.id);
        setEnviados((prev) => [sent, ...prev]);
        toast('Comunicado enviado com sucesso!', 'success');
      } else {
        setRascunhos((prev) => [created, ...prev]);
        toast('Rascunho salvo com sucesso!', 'success');
      }
      resetForm();
    } catch {
      toast('Erro ao criar comunicado.', 'error');
    } finally {
      setCreating(false);
    }
  }

  async function handleEnviar(id: string) {
    setActionLoadingId(id);
    try {
      const sent = await enviarComunicado(id);
      setRascunhos((prev) => prev.filter((c) => c.id !== id));
      setEnviados((prev) => [sent, ...prev]);
      toast('Comunicado enviado!', 'success');
    } catch {
      toast('Erro ao enviar comunicado.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDelete(id: string) {
    setActionLoadingId(id);
    try {
      await deleteComunicado(id);
      setRascunhos((prev) => prev.filter((c) => c.id !== id));
      toast('Comunicado excluido.', 'success');
    } catch {
      toast('Erro ao excluir comunicado.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton variant="text" className="h-8 w-64" />
        <div className="flex gap-3">
          <Skeleton variant="text" className="h-10 w-32" />
          <Skeleton variant="text" className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="table-row" className="h-14" />
          ))}
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────

  const tabs: Array<{ key: TabKey; label: string; count: number }> = [
    { key: 'enviados', label: 'Enviados', count: enviados.length },
    { key: 'rascunhos', label: 'Rascunhos / Agendados', count: rascunhos.length },
  ];

  const inputStyle: CSSProperties = {
    background: 'var(--bb-depth-2)',
    color: 'var(--bb-ink-100)',
    border: '1px solid var(--bb-glass-border)',
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Central de Comunicacao
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Envie comunicados para as academias da plataforma
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          style={{ background: '#f59e0b', color: '#fff' }}
        >
          + Novo Comunicado
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
        {tabs.map((t) => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors"
              style={{ color: isActive ? '#f59e0b' : 'var(--bb-ink-60)' }}
            >
              {t.label}
              <span
                className="rounded-full px-1.5 py-0.5 text-xs"
                style={{
                  background: isActive ? 'rgba(245,158,11,0.12)' : 'var(--bb-depth-4)',
                  color: isActive ? '#f59e0b' : 'var(--bb-ink-40)',
                }}
              >
                {t.count}
              </span>
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 h-0.5 w-full"
                  style={{ background: '#f59e0b' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Enviados */}
      {tab === 'enviados' && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                {['Titulo', 'Tipo', 'Segmento', 'Canal', 'Enviado em', 'Metricas'].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--bb-ink-40)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enviados.map((com) => {
                const tipo = TIPO_STYLES[com.tipo];
                return (
                  <tr
                    key={com.id}
                    onClick={() => setDetailItem(com)}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bb-depth-2)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = 'transparent';
                    }}
                  >
                    <td className="px-3 py-3 font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                      {com.titulo}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ background: tipo.bg, color: tipo.text }}
                      >
                        {tipo.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      {segmentLabel(com)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        {com.canal.map((c) => (
                          <span
                            key={c}
                            className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                            style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                          >
                            {CANAL_LABELS[c]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      {com.enviadoEm ? formatDate(com.enviadoEm) : '-'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <MetricBar
                          value={com.metricas.entregues}
                          max={com.metricas.totalDestinatarios}
                          color="#22c55e"
                        />
                        <MetricBar
                          value={com.metricas.abertos}
                          max={com.metricas.totalDestinatarios}
                          color="#3b82f6"
                        />
                        <MetricBar
                          value={com.metricas.clicados}
                          max={com.metricas.totalDestinatarios}
                          color="#a855f7"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {enviados.length === 0 && (
            <div className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              Nenhum comunicado enviado.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Rascunhos / Agendados */}
      {tab === 'rascunhos' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rascunhos.map((com) => {
            const tipo = TIPO_STYLES[com.tipo];
            const isActionLoading = actionLoadingId === com.id;
            return (
              <Card key={com.id} className="flex flex-col p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: tipo.bg, color: tipo.text }}
                  >
                    {tipo.label}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      background: com.status === 'agendado' ? 'rgba(59,130,246,0.15)' : 'var(--bb-depth-4)',
                      color: com.status === 'agendado' ? '#3b82f6' : 'var(--bb-ink-40)',
                    }}
                  >
                    {com.status === 'agendado' ? 'Agendado' : 'Rascunho'}
                  </span>
                </div>

                <h3 className="mb-1 font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                  {com.titulo}
                </h3>
                <p
                  className="mb-3 flex-1 text-xs line-clamp-3"
                  style={{ color: 'var(--bb-ink-60)' }}
                >
                  {com.mensagem}
                </p>

                <div className="mb-3 flex flex-wrap gap-1">
                  {com.canal.map((c) => (
                    <span
                      key={c}
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                      style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                    >
                      {CANAL_LABELS[c]}
                    </span>
                  ))}
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                    style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                  >
                    {segmentLabel(com)}
                  </span>
                </div>

                {com.agendadoPara && (
                  <p className="mb-3 text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                    Agendado: {formatDate(com.agendadoPara)}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    disabled={isActionLoading}
                    onClick={() => handleEnviar(com.id)}
                    className="flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                    style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
                  >
                    Enviar Agora
                  </button>
                  <button
                    disabled={isActionLoading}
                    onClick={() => handleDelete(com.id)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                  >
                    Excluir
                  </button>
                </div>
              </Card>
            );
          })}

          {rascunhos.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              Nenhum rascunho ou agendamento.
            </div>
          )}
        </div>
      )}

      {/* ─── Detail Modal (Enviado) ────────────────────────────────────── */}
      <Modal open={!!detailItem} onClose={() => setDetailItem(null)} title="Detalhes do Comunicado">
        {detailItem && (() => {
          const tipo = TIPO_STYLES[detailItem.tipo];
          const m = detailItem.metricas;
          const total = m.totalDestinatarios || 1;
          return (
            <div className="space-y-5">
              {/* Title + badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ background: tipo.bg, color: tipo.text }}
                >
                  {tipo.label}
                </span>
                {detailItem.canal.map((c) => (
                  <span
                    key={c}
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                    style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                  >
                    {CANAL_LABELS[c]}
                  </span>
                ))}
              </div>

              {/* Message preview */}
              <div
                className="rounded-lg p-4"
                style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
              >
                <h3 className="mb-2 font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                  {detailItem.titulo}
                </h3>
                <p className="whitespace-pre-wrap text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                  {detailItem.mensagem}
                </p>
              </div>

              {/* Info rows */}
              <div className="space-y-2">
                {[
                  { label: 'Segmentacao', value: segmentLabel(detailItem) },
                  { label: 'Enviado em', value: detailItem.enviadoEm ? formatDate(detailItem.enviadoEm) : '-' },
                  { label: 'Criado por', value: detailItem.criadoPor },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between rounded-lg px-3 py-2"
                    style={{ background: 'var(--bb-depth-2)' }}
                  >
                    <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{row.label}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Detailed metrics */}
              <div>
                <h4
                  className="mb-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--bb-ink-40)' }}
                >
                  Metricas
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Destinatarios', value: m.totalDestinatarios, color: 'var(--bb-ink-60)' },
                    { label: 'Entregues', value: m.entregues, color: '#22c55e', pct: ((m.entregues / total) * 100).toFixed(1) },
                    { label: 'Abertos', value: m.abertos, color: '#3b82f6', pct: ((m.abertos / total) * 100).toFixed(1) },
                    { label: 'Clicados', value: m.clicados, color: '#a855f7', pct: ((m.clicados / total) * 100).toFixed(1) },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-lg p-3 text-center"
                      style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
                    >
                      <p className="text-xl font-bold" style={{ color: metric.color }}>
                        {metric.value}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                        {metric.label}
                        {'pct' in metric && metric.pct ? ` (${metric.pct}%)` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full" variant="ghost" onClick={() => setDetailItem(null)}>
                Fechar
              </Button>
            </div>
          );
        })()}
      </Modal>

      {/* ─── Create Modal ──────────────────────────────────────────────── */}
      <Modal open={showCreate} onClose={resetForm} title="Novo Comunicado">
        <div className="space-y-4">
          {/* Tipo */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Tipo *
            </label>
            <select
              value={formTipo}
              onChange={(e) => setFormTipo(e.target.value as TipoComunicado)}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            >
              <option value="informativo">Informativo</option>
              <option value="manutencao">Manutencao</option>
              <option value="novidade">Novidade</option>
              <option value="urgente">Urgente</option>
              <option value="promocao">Promocao</option>
            </select>
          </div>

          {/* Titulo */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Titulo *
            </label>
            <input
              type="text"
              value={formTitulo}
              onChange={(e) => setFormTitulo(e.target.value)}
              placeholder="Ex: Manutencao programada dia 20/03"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          {/* Mensagem */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Mensagem *
            </label>
            <textarea
              value={formMensagem}
              onChange={(e) => setFormMensagem(e.target.value)}
              rows={4}
              placeholder="Corpo do comunicado..."
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          {/* Segmentacao */}
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Segmentacao
            </label>
            <div className="space-y-2">
              {([
                { key: 'todos' as const, label: 'Todos', detail: '62 academias' },
                { key: 'por_plano' as const, label: 'Por Plano', detail: null },
                { key: 'por_health' as const, label: 'Por Health Score', detail: null },
                { key: 'manual' as const, label: 'Manual', detail: null },
              ]).map((seg) => (
                <div key={seg.key}>
                  <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                    <input
                      type="radio"
                      name="segmentacao"
                      checked={formSegTipo === seg.key}
                      onChange={() => setFormSegTipo(seg.key)}
                      className="accent-amber-500"
                    />
                    {seg.label}
                    {seg.detail && (
                      <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        ({seg.detail})
                      </span>
                    )}
                  </label>

                  {/* Conditional content */}
                  {formSegTipo === 'por_plano' && seg.key === 'por_plano' && (
                    <div className="ml-6 mt-2 flex flex-wrap gap-2">
                      {['Starter', 'Pro', 'BlackBelt', 'Enterprise'].map((plano) => (
                        <label
                          key={plano}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer"
                          style={{
                            background: formPlanos.includes(plano) ? 'rgba(245,158,11,0.12)' : 'var(--bb-depth-4)',
                            color: formPlanos.includes(plano) ? '#f59e0b' : 'var(--bb-ink-60)',
                            border: `1px solid ${formPlanos.includes(plano) ? '#f59e0b' : 'var(--bb-glass-border)'}`,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formPlanos.includes(plano)}
                            onChange={() => togglePlano(plano)}
                            className="hidden"
                          />
                          {plano}
                        </label>
                      ))}
                    </div>
                  )}

                  {formSegTipo === 'por_health' && seg.key === 'por_health' && (
                    <div className="ml-6 mt-2 flex items-center gap-3">
                      <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        Score abaixo de
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formHealthScore}
                        onChange={(e) => setFormHealthScore(Number(e.target.value))}
                        className="w-20 rounded-lg px-2 py-1 text-sm text-center focus:outline-none"
                        style={inputStyle}
                      />
                    </div>
                  )}

                  {formSegTipo === 'manual' && seg.key === 'manual' && (
                    <div className="ml-6 mt-2">
                      <input
                        type="text"
                        value={formManualIds}
                        onChange={(e) => setFormManualIds(e.target.value)}
                        placeholder="IDs separados por virgula"
                        className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                        style={inputStyle}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Canal */}
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
              Canal *
            </label>
            <div className="flex flex-wrap gap-2">
              {(['email', 'push', 'in_app'] as CanalComunicado[]).map((canal) => (
                <label
                  key={canal}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium cursor-pointer transition-colors"
                  style={{
                    background: formCanais.includes(canal) ? 'rgba(245,158,11,0.12)' : 'var(--bb-depth-4)',
                    color: formCanais.includes(canal) ? '#f59e0b' : 'var(--bb-ink-60)',
                    border: `1px solid ${formCanais.includes(canal) ? '#f59e0b' : 'var(--bb-glass-border)'}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formCanais.includes(canal)}
                    onChange={() => toggleCanal(canal)}
                    className="hidden"
                  />
                  {CANAL_LABELS[canal]}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              disabled={creating}
              onClick={() => handleCreate(false)}
            >
              Salvar Rascunho
            </Button>
            <Button
              className="flex-1"
              loading={creating}
              onClick={() => handleCreate(true)}
              style={{ background: '#f59e0b', color: '#fff' }}
            >
              Enviar Agora
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
