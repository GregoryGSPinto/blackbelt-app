'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getDevedores,
  getInadimplenciaMetrics,
  registrarContato,
} from '@/lib/api/inadimplencia.service';
import type {
  Devedor,
  InadimplenciaMetrics,
  ContatoTipo,
  ContatoResultado,
  StatusCobranca,
} from '@/lib/api/inadimplencia.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { PlanGate } from '@/components/plans/PlanGate';
import { translateError } from '@/lib/utils/error-translator';

// ── Constants ──────────────────────────────────────────────────────────

const STATUS_LABEL: Record<StatusCobranca, string> = {
  pendente: 'Pendente',
  contatado: 'Contatado',
  negociando: 'Negociando',
  promessa: 'Promessa',
  perdido: 'Perdido',
};

const STATUS_STYLE: Record<StatusCobranca, { bg: string; text: string }> = {
  pendente: { bg: 'var(--bb-depth-4)', text: 'var(--bb-ink-60)' },
  contatado: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6' },
  negociando: { bg: 'rgba(234, 179, 8, 0.15)', text: '#EAB308' },
  promessa: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E' },
  perdido: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' },
};

const CONTATO_TIPO_LABEL: Record<ContatoTipo, string> = {
  ligacao: 'Ligacao',
  whatsapp: 'WhatsApp',
  email: 'Email',
  presencial: 'Presencial',
};

const CONTATO_RESULTADO_LABEL: Record<ContatoResultado, string> = {
  sem_resposta: 'Sem resposta',
  negociando: 'Negociando',
  promessa_pagamento: 'Promessa de pagamento',
  recusa: 'Recusa',
};

// ── Helpers ────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getDiasAtrasoColor(dias: number): string {
  if (dias > 30) return '#991B1B';
  if (dias > 15) return '#EF4444';
  if (dias > 7) return '#F97316';
  return '#EAB308';
}

function getWhatsAppMessage(nome: string, valor: number, dias: number, dataVencimento: string): string {
  const dataFormatted = new Date(dataVencimento).toLocaleDateString('pt-BR');
  if (dias <= 7) {
    return `Oi ${nome}! Sua mensalidade venceu dia ${dataFormatted}. Precisa de ajuda com o pagamento?`;
  }
  if (dias <= 15) {
    return `Ola ${nome}, sua mensalidade de ${formatCurrency(valor)} esta em aberto ha ${dias} dias. Entre em contato para regularizar.`;
  }
  return `${nome}, sua matricula sera suspensa em 5 dias por inadimplencia. Regularize pelo app ou fale conosco.`;
}

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// ── Page ───────────────────────────────────────────────────────────────

export default function InadimplenciaPage() {
  const { toast } = useToast();
  const [devedores, setDevedores] = useState<Devedor[]>([]);
  const [metrics, setMetrics] = useState<InadimplenciaMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [contatoModal, setContatoModal] = useState<{ devedorId: string; devedorNome: string } | null>(null);
  const [contatoForm, setContatoForm] = useState<{
    tipo: ContatoTipo;
    resultado: ContatoResultado;
    observacao: string;
  }>({
    tipo: 'ligacao',
    resultado: 'sem_resposta',
    observacao: '',
  });

  const loadData = useCallback(async () => {
    try {
      const [devList, devMetrics] = await Promise.all([
        getDevedores('academy-1'),
        getInadimplenciaMetrics('academy-1'),
      ]);
      setDevedores(devList.sort((a, b) => b.diasAtraso - a.diasAtraso));
      setMetrics(devMetrics);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Actions ────────────────────────────────────────────────────────

  function handleWhatsApp(devedor: Devedor) {
    const phone = cleanPhone(devedor.alunoTelefone);
    const message = getWhatsAppMessage(devedor.alunoNome, devedor.valorDevido, devedor.diasAtraso, devedor.ultimoPagamento);
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  function handleEmail() {
    toast('Email de cobranca enviado', 'success');
  }

  async function handleRegistrarContato() {
    if (!contatoModal) return;
    try {
      await registrarContato(
        contatoModal.devedorId,
        contatoForm.tipo,
        contatoForm.resultado,
        contatoForm.observacao,
      );
      toast('Contato registrado com sucesso', 'success');
      setContatoModal(null);
      setContatoForm({ tipo: 'ligacao', resultado: 'sem_resposta', observacao: '' });
      setLoading(true);
      await loadData();
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  // ── Skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-28" />
          ))}
        </div>
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  return (
    <PlanGate module="churn_prediction">
    <div className="space-y-6 p-6">
      {/* Title */}
      <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
        Inadimplencia
      </h1>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center text-lg font-bold"
                style={{ borderRadius: 'var(--bb-radius-sm)', background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }}
              >
                !
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Total Inadimplentes</p>
                <p className="text-xl font-bold" style={{ color: 'var(--bb-error)' }}>
                  {metrics.totalDevedores}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center text-lg font-bold"
                style={{ borderRadius: 'var(--bb-radius-sm)', background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }}
              >
                $
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Valor em Aberto</p>
                <p className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                  {formatCurrency(metrics.valorTotalDevido)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center text-lg font-bold"
                style={{ borderRadius: 'var(--bb-radius-sm)', background: 'rgba(234, 179, 8, 0.12)', color: '#EAB308' }}
              >
                ~
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Media de Atraso</p>
                <p className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                  {metrics.mediaAtraso} dias
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center text-lg font-bold"
                style={{ borderRadius: 'var(--bb-radius-sm)', background: 'rgba(34, 197, 94, 0.12)', color: '#22C55E' }}
              >
                +
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Recuperado Mes</p>
                <p className="text-xl font-bold" style={{ color: 'var(--bb-success)' }}>
                  {formatCurrency(metrics.recuperadoMes)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Devedores - Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {devedores.map((devedor) => (
          <DevedorCard
            key={devedor.id}
            devedor={devedor}
            onWhatsApp={handleWhatsApp}
            onEmail={handleEmail}
            onRegistrarContato={(d) => setContatoModal({ devedorId: d.id, devedorNome: d.alunoNome })}
          />
        ))}
        {devedores.length === 0 && (
          <div className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Nenhum devedor encontrado
          </div>
        )}
      </div>

      {/* Devedores - Desktop Table */}
      <Card className="hidden overflow-hidden p-0 md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                {['Aluno', 'Plano', 'Valor', 'Dias Atraso', 'Ultimo Contato', 'Status', 'Acoes'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium"
                    style={{ color: 'var(--bb-ink-60)', background: 'var(--bb-depth-4)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {devedores.map((devedor) => (
                <tr
                  key={devedor.id}
                  style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center text-[10px] font-bold"
                        style={{
                          borderRadius: '50%',
                          background: 'var(--bb-depth-4)',
                          color: 'var(--bb-ink-60)',
                        }}
                      >
                        {devedor.alunoNome.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                        {devedor.alunoNome}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--bb-ink-80)' }}>
                    {devedor.plano}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {formatCurrency(devedor.valorDevido)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={devedor.diasAtraso > 30 ? 'font-bold' : 'font-medium'}
                      style={{ color: getDiasAtrasoColor(devedor.diasAtraso) }}
                    >
                      {devedor.diasAtraso} dias
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    {devedor.ultimoContato
                      ? new Date(devedor.ultimoContato.data).toLocaleDateString('pt-BR')
                      : 'Nunca'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        borderRadius: 'var(--bb-radius-sm)',
                        background: STATUS_STYLE[devedor.statusCobranca].bg,
                        color: STATUS_STYLE[devedor.statusCobranca].text,
                      }}
                    >
                      {STATUS_LABEL[devedor.statusCobranca]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleWhatsApp(devedor)}
                        className="px-2 py-1 text-xs font-medium text-white transition-opacity hover:opacity-80"
                        style={{ borderRadius: 'var(--bb-radius-sm)', background: '#25D366' }}
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={handleEmail}
                        className="px-2 py-1 text-xs font-medium transition-opacity hover:opacity-80"
                        style={{
                          borderRadius: 'var(--bb-radius-sm)',
                          background: 'var(--bb-depth-4)',
                          color: 'var(--bb-ink-80)',
                        }}
                      >
                        Email
                      </button>
                      <button
                        onClick={() => setContatoModal({ devedorId: devedor.id, devedorNome: devedor.alunoNome })}
                        className="px-2 py-1 text-xs font-medium text-white transition-opacity hover:opacity-80"
                        style={{ borderRadius: 'var(--bb-radius-sm)', background: 'var(--bb-brand)' }}
                      >
                        Registrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {devedores.length === 0 && (
            <div className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Nenhum devedor encontrado
            </div>
          )}
        </div>
      </Card>

      {/* Contact Modal */}
      <Modal
        open={!!contatoModal}
        onClose={() => setContatoModal(null)}
        title={contatoModal ? `Registrar Contato — ${contatoModal.devedorNome}` : ''}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Tipo
            </label>
            <select
              value={contatoForm.tipo}
              onChange={(e) => setContatoForm({ ...contatoForm, tipo: e.target.value as ContatoTipo })}
              className="w-full px-3 py-2 text-sm"
              style={{
                borderRadius: 'var(--bb-radius-sm)',
                background: 'var(--bb-depth-4)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              {(Object.keys(CONTATO_TIPO_LABEL) as ContatoTipo[]).map((t) => (
                <option key={t} value={t}>{CONTATO_TIPO_LABEL[t]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Resultado
            </label>
            <select
              value={contatoForm.resultado}
              onChange={(e) => setContatoForm({ ...contatoForm, resultado: e.target.value as ContatoResultado })}
              className="w-full px-3 py-2 text-sm"
              style={{
                borderRadius: 'var(--bb-radius-sm)',
                background: 'var(--bb-depth-4)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              {(Object.keys(CONTATO_RESULTADO_LABEL) as ContatoResultado[]).map((r) => (
                <option key={r} value={r}>{CONTATO_RESULTADO_LABEL[r]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Observacao
            </label>
            <textarea
              value={contatoForm.observacao}
              onChange={(e) => setContatoForm({ ...contatoForm, observacao: e.target.value })}
              rows={3}
              className="w-full resize-none px-3 py-2 text-sm"
              style={{
                borderRadius: 'var(--bb-radius-sm)',
                background: 'var(--bb-depth-4)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
              placeholder="Detalhes do contato..."
            />
          </div>

          <Button variant="primary" className="w-full" onClick={handleRegistrarContato}>
            Registrar
          </Button>
        </div>
      </Modal>
    </div>
    </PlanGate>
  );
}

// ── Devedor Card (Mobile) ────────────────────────────────────────────

function DevedorCard({
  devedor,
  onWhatsApp,
  onEmail,
  onRegistrarContato,
}: {
  devedor: Devedor;
  onWhatsApp: (d: Devedor) => void;
  onEmail: () => void;
  onRegistrarContato: (d: Devedor) => void;
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center text-xs font-bold"
            style={{
              borderRadius: '50%',
              background: 'var(--bb-depth-4)',
              color: 'var(--bb-ink-60)',
            }}
          >
            {devedor.alunoNome.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>{devedor.alunoNome}</p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{devedor.plano}</p>
          </div>
        </div>
        <span
          className="inline-block px-2 py-0.5 text-[10px] font-medium"
          style={{
            borderRadius: 'var(--bb-radius-sm)',
            background: STATUS_STYLE[devedor.statusCobranca].bg,
            color: STATUS_STYLE[devedor.statusCobranca].text,
          }}
        >
          {STATUS_LABEL[devedor.statusCobranca]}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <div>
          <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Valor</p>
          <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
            {formatCurrency(devedor.valorDevido)}
          </p>
        </div>
        <div>
          <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Atraso</p>
          <p
            className={`text-sm ${devedor.diasAtraso > 30 ? 'font-bold' : 'font-medium'}`}
            style={{ color: getDiasAtrasoColor(devedor.diasAtraso) }}
          >
            {devedor.diasAtraso} dias
          </p>
        </div>
        <div>
          <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Ult. Contato</p>
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            {devedor.ultimoContato
              ? new Date(devedor.ultimoContato.data).toLocaleDateString('pt-BR')
              : 'Nunca'}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onWhatsApp(devedor)}
          className="flex-1 px-2 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-80"
          style={{ borderRadius: 'var(--bb-radius-sm)', background: '#25D366' }}
        >
          WhatsApp
        </button>
        <button
          onClick={onEmail}
          className="flex-1 px-2 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
          style={{ borderRadius: 'var(--bb-radius-sm)', background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}
        >
          Email
        </button>
        <button
          onClick={() => onRegistrarContato(devedor)}
          className="flex-1 px-2 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-80"
          style={{ borderRadius: 'var(--bb-radius-sm)', background: 'var(--bb-brand)' }}
        >
          Contato
        </button>
      </div>
    </Card>
  );
}
