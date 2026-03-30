'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import {
  getInadimplentes,
  registrarPagamento,
  getHistoricoPagamentos,
} from '@/lib/api/recepcao-cobrancas.service';
import type { Inadimplente, Pagamento } from '@/lib/api/recepcao-cobrancas.service';
import { useToast } from '@/lib/hooks/useToast';

const FAIXA_COLORS: Record<string, string> = {
  branca: '#f5f5f5', azul: '#2563eb', roxa: '#7c3aed', marrom: '#92400e', preta: '#1e1e1e',
};

function urgenciaBadge(dias: number): { bg: string; text: string; label: string } {
  if (dias >= 30) return { bg: '#ef444425', text: '#ef4444', label: `${dias}d` };
  if (dias >= 8) return { bg: '#f9731625', text: '#f97316', label: `${dias}d` };
  return { bg: '#eab30825', text: '#eab308', label: `${dias}d` };
}

export default function RecepcaoCobrancasPage() {
  useTheme();
  const { toast } = useToast();

  const [inadimplentes, setInadimplentes] = useState<Inadimplente[]>([]);
  const [totalInadimplente, setTotalInadimplente] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal: registrar pagamento
  const [showPagamento, setShowPagamento] = useState(false);
  const [pagAluno, setPagAluno] = useState<Inadimplente | null>(null);
  const [pagValor, setPagValor] = useState('');
  const [pagForma, setPagForma] = useState<'dinheiro' | 'pix' | 'cartao' | 'boleto'>('pix');
  const [pagLoading, setPagLoading] = useState(false);

  // Modal: histórico
  const [showHistorico, setShowHistorico] = useState(false);
  const [histAluno, setHistAluno] = useState<Inadimplente | null>(null);
  const [historico, setHistorico] = useState<Pagamento[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getInadimplentes();
      setInadimplentes(res.inadimplentes);
      setTotalInadimplente(res.resumo.totalInadimplente);
    } catch (err) {
      console.error('[RecepcaoCobrancasPage]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function abrirPagamento(aluno: Inadimplente) {
    setPagAluno(aluno);
    setPagValor(aluno.valor.toFixed(2).replace('.', ','));
    setPagForma('pix');
    setShowPagamento(true);
  }

  async function confirmarPagamento() {
    if (!pagAluno) return;
    setPagLoading(true);
    const valor = parseFloat(pagValor.replace(',', '.'));
    const res = await registrarPagamento(pagAluno.id, valor, pagForma);
    if (res.success) {
      toast(`Pagamento de R$ ${pagValor} registrado para ${pagAluno.nome}!`, 'success');
      setShowPagamento(false);
      await load();
    } else {
      toast('Erro ao registrar pagamento', 'error');
    }
    setPagLoading(false);
  }

  async function abrirHistorico(aluno: Inadimplente) {
    setHistAluno(aluno);
    setShowHistorico(true);
    setHistLoading(true);
    const h = await getHistoricoPagamentos(aluno.id);
    setHistorico(h);
    setHistLoading(false);
  }

  function abrirWhatsApp(aluno: Inadimplente) {
    const texto = encodeURIComponent(`Olá ${aluno.nome.split(' ')[0]}! Sua mensalidade de R$${aluno.valor.toFixed(2).replace('.', ',')} venceu há ${aluno.diasAtraso} dias. Posso ajudar?`);
    window.open(`https://wa.me/${aluno.telefone}?text=${texto}`, '_blank');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Cobranças</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4" style={{ background: '#ef444415' }}>
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Total inadimplente</p>
          <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>
            R$ {totalInadimplente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-xl p-4" style={{ background: '#f9731615' }}>
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Alunos</p>
          <p className="text-2xl font-bold" style={{ color: '#f97316' }}>{inadimplentes.length}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl" style={{ background: 'var(--bb-depth-3)' }} />
          ))}
        </div>
      ) : inadimplentes.length === 0 ? (
        <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bb-depth-3)' }}>
          <p className="text-2xl">🎉</p>
          <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>Nenhum inadimplente! Parabéns!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {inadimplentes.map((aluno) => {
            const badge = urgenciaBadge(aluno.diasAtraso);
            return (
              <div key={aluno.id} className="rounded-xl p-4" style={{ background: 'var(--bb-depth-3)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: FAIXA_COLORS[aluno.faixa] || '#6b7280' }}>
                    {aluno.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>{aluno.nome}</p>
                      <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: badge.bg, color: badge.text }}>{badge.label}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      R$ {aluno.valor.toFixed(2).replace('.', ',')} · {aluno.turma}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => abrirWhatsApp(aluno)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium"
                    style={{ background: '#25D36620', color: '#25D366' }}
                  >
                    📱 WhatsApp
                  </button>
                  <button
                    onClick={() => abrirPagamento(aluno)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                    style={{ background: '#22c55e' }}
                  >
                    💰 Registrar Pagamento
                  </button>
                  <button
                    onClick={() => abrirHistorico(aluno)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium"
                    style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}
                  >
                    📋 Histórico
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Registrar Pagamento */}
      {showPagamento && pagAluno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowPagamento(false)}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--bb-depth-3)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              Registrar Pagamento — {pagAluno.nome}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Valor (R$)</label>
                <input
                  type="text"
                  value={pagValor}
                  onChange={(e) => setPagValor(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Forma de pagamento</label>
                <select
                  value={pagForma}
                  onChange={(e) => setPagForma(e.target.value as typeof pagForma)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                >
                  <option value="pix">PIX</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao">Cartão</option>
                  <option value="boleto">Boleto</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowPagamento(false)} className="flex-1 rounded-lg px-4 py-2 text-sm font-medium" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>
                Cancelar
              </button>
              <button
                onClick={confirmarPagamento}
                disabled={pagLoading}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                style={{ background: '#22c55e' }}
              >
                {pagLoading ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Histórico */}
      {showHistorico && histAluno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowHistorico(false)}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--bb-depth-3)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              Histórico — {histAluno.nome}
            </h3>
            {histLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg" style={{ background: 'var(--bb-depth-4)' }} />)}
              </div>
            ) : historico.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Nenhum pagamento registrado</p>
            ) : (
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {historico.map((pag) => (
                  <div key={pag.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'var(--bb-depth-4)' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>R$ {pag.valor.toFixed(2).replace('.', ',')}</p>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{pag.data} · {pag.forma}</p>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{pag.registradoPor}</span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowHistorico(false)}
              className="mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium"
              style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
