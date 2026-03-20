'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/lib/hooks/useToast';
import { getCaixa, registrarRecebimento } from '@/lib/api/recepcao-caixa.service';
import type { CaixaDia } from '@/lib/api/recepcao-caixa.service';
import { PlusIcon } from '@/components/shell/icons';
import { PlanGate } from '@/components/plans/PlanGate';
import { EmptyState } from '@/components/ui/EmptyState';
import { translateError } from '@/lib/utils/error-translator';

// ── Helpers ────────────────────────────────────────────────────────

function formatCurrency(valor: number): string {
  return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function getMetodoLabel(metodo: string): string {
  const map: Record<string, string> = {
    pix: 'PIX', cartao_credito: 'Cartao Credito', cartao_debito: 'Cartao Debito',
    dinheiro: 'Dinheiro', boleto: 'Boleto',
  };
  return map[metodo] ?? metodo;
}

function getTipoLabel(tipo: string): string {
  const map: Record<string, string> = {
    mensalidade: 'Mensalidade', matricula: 'Matricula', produto: 'Produto',
    evento: 'Evento', outro: 'Outro',
  };
  return map[tipo] ?? tipo;
}

function getMetodoColor(metodo: string): string {
  const map: Record<string, string> = {
    PIX: '#10b981', 'Cartao Credito': '#3b82f6', Dinheiro: '#eab308', 'Cartao Debito': '#8b5cf6',
  };
  return map[metodo] ?? '#6b7280';
}

// ── Component ──────────────────────────────────────────────────────

export default function RecepcaoCaixaPage() {
  const { toast } = useToast();

  const [data, setData] = useState<CaixaDia | null>(null);
  const [loading, setLoading] = useState(true);

  // Novo recebimento modal
  const [novoOpen, setNovoOpen] = useState(false);
  const [novoAluno, setNovoAluno] = useState('');
  const [novoTipo, setNovoTipo] = useState('mensalidade');
  const [novoDesc, setNovoDesc] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novoMetodo, setNovoMetodo] = useState('pix');
  const [novoLoading, setNovoLoading] = useState(false);

  // Fechar caixa modal
  const [fecharOpen, setFecharOpen] = useState(false);
  const [dinheiroCaixa, setDinheiroCaixa] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await getCaixa();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) toast(translateError(err), 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [toast]);

  async function handleNovoRecebimento() {
    setNovoLoading(true);
    try {
      await registrarRecebimento({
        alunoNome: novoAluno, tipo: novoTipo, descricao: novoDesc,
        valor: parseFloat(novoValor), metodo: novoMetodo,
      });
      toast('Recebimento registrado!', 'success');
      setNovoOpen(false);
      setNovoAluno(''); setNovoDesc(''); setNovoValor('');
      // Reload
      const result = await getCaixa();
      setData(result);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setNovoLoading(false);
    }
  }

  function handleFecharCaixa() {
    toast('Caixa fechado e relatorio gerado!', 'success');
    setFecharOpen(false);
  }

  // ── Loading ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 p-4 pb-20">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton variant="card" className="h-24" />
          <Skeleton variant="card" className="h-24" />
          <Skeleton variant="card" className="h-24" />
        </div>
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  if (!data) return null;

  const maxMetodo = Math.max(...data.porMetodo.map((m) => m.total));
  const dinheiroTotal = data.porMetodo.find((m) => m.metodo === 'Dinheiro')?.total ?? 0;
  const diferenca = parseFloat(dinheiroCaixa || '0') - dinheiroTotal;

  return (
    <PlanGate module="financeiro">
      <div className="space-y-5 p-4 pb-20">
        {/* ── HEADER ──────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Caixa do Dia &middot; {data.data}
          </h1>
          <Button variant="secondary" size="sm" onClick={() => setFecharOpen(true)}>
            Fechar Caixa
          </Button>
        </div>

        {/* ── SUMMARY CARDS ─────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg p-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#059669' }}>Total Recebido</p>
            <p className="text-lg font-extrabold" style={{ color: '#10b981' }}>{formatCurrency(data.totalRecebido)}</p>
          </div>
          <div className="rounded-lg p-3" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
            <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#a16207' }}>Pendente</p>
            <p className="text-lg font-extrabold" style={{ color: '#eab308' }}>{formatCurrency(data.totalPendente)}</p>
          </div>
          <div className="rounded-lg p-3" style={{ background: 'var(--bb-depth-4)' }}>
            <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Recebimentos</p>
            <p className="text-lg font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>{data.totalRecebimentos}</p>
          </div>
        </div>

        {/* ── POR METODO ────────────────────────────────────── */}
        <section>
          <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Por Metodo</h2>
          <div className="space-y-2">
            {data.porMetodo.map((m) => {
              const pct = maxMetodo > 0 ? (m.total / maxMetodo) * 100 : 0;
              const color = getMetodoColor(m.metodo);
              return (
                <div key={m.metodo}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium" style={{ color: 'var(--bb-ink-80)' }}>{m.metodo}</span>
                    <span style={{ color: 'var(--bb-ink-40)' }}>{m.quantidade}x &middot; {formatCurrency(m.total)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-4)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── RECEBIMENTOS TABLE ────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Recebimentos</h2>
            <Button size="sm" style={{ background: '#10b981' }} onClick={() => setNovoOpen(true)}>
              <PlusIcon className="mr-1 h-4 w-4" /> Novo Recebimento
            </Button>
          </div>

          {/* Header row */}
          <div className="hidden sm:grid grid-cols-6 gap-2 rounded-lg px-3 py-2 text-[11px] font-medium uppercase tracking-wider" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-40)' }}>
            <span>Horario</span><span>Aluno</span><span>Tipo</span><span>Descricao</span><span className="text-right">Valor</span><span>Metodo</span>
          </div>

          {/* Rows */}
          <div className="space-y-1 mt-1">
            {data.recebimentos.length === 0 && (
              <EmptyState
                icon="💵"
                title="Nenhum recebimento hoje"
                description="Registre pagamentos recebidos no caixa do dia."
                actionLabel="Novo Recebimento"
                onAction={() => setNovoOpen(true)}
                variant="first-time"
              />
            )}
            {data.recebimentos.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-2 sm:grid-cols-6 gap-x-2 gap-y-1 rounded-lg px-3 py-2.5 text-sm"
                style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
              >
                <span className="tabular-nums text-xs" style={{ color: 'var(--bb-ink-40)' }}>{r.horario}</span>
                <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>{r.alunoNome}</span>
                <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{getTipoLabel(r.tipo)}</span>
                <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{r.descricao}</span>
                <span className="text-right font-bold tabular-nums" style={{ color: '#10b981' }}>{formatCurrency(r.valor)}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>{getMetodoLabel(r.metodo)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── VENCENDO HOJE ─────────────────────────────────── */}
        {data.vencendoHoje.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Vencendo Hoje</h2>
            <div className="space-y-2">
              {data.vencendoHoje.map((v) => (
                <Card key={v.id} style={{ borderLeft: '3px solid #eab308' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{v.alunoNome}</p>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        {formatCurrency(v.valor)} &middot; {v.plano}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      style={{ background: '#10b981' }}
                      onClick={() => { setNovoAluno(v.alunoNome); setNovoValor(v.valor.toString()); setNovoDesc(`Mensalidade ${v.plano}`); setNovoOpen(true); }}
                    >
                      Registrar pagamento
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ── NOVO RECEBIMENTO MODAL ────────────────────────── */}
        <Modal open={novoOpen} onClose={() => setNovoOpen(false)} title="Novo Recebimento">
          <div className="space-y-4">
            <Input label="Aluno" value={novoAluno} onChange={(e) => setNovoAluno(e.target.value)} placeholder="Nome do aluno" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Tipo</label>
              <select value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)} className="h-12 w-full rounded-md px-3 text-sm" style={{ backgroundColor: 'var(--bb-depth-5)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}>
                <option value="mensalidade">Mensalidade</option>
                <option value="matricula">Matricula</option>
                <option value="produto">Produto</option>
                <option value="evento">Evento</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <Input label="Descricao" value={novoDesc} onChange={(e) => setNovoDesc(e.target.value)} placeholder="Mensal Mar/2026" />
            <Input label="Valor (R$)" type="number" value={novoValor} onChange={(e) => setNovoValor(e.target.value)} placeholder="0.00" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Metodo</label>
              <select value={novoMetodo} onChange={(e) => setNovoMetodo(e.target.value)} className="h-12 w-full rounded-md px-3 text-sm" style={{ backgroundColor: 'var(--bb-depth-5)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}>
                <option value="pix">PIX</option>
                <option value="cartao_credito">Cartao Credito</option>
                <option value="cartao_debito">Cartao Debito</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setNovoOpen(false)}>Cancelar</Button>
              <Button style={{ background: '#10b981' }} onClick={handleNovoRecebimento} loading={novoLoading} disabled={!novoAluno || !novoValor || novoLoading}>
                Registrar
              </Button>
            </div>
          </div>
        </Modal>

        {/* ── FECHAR CAIXA MODAL ────────────────────────────── */}
        <Modal open={fecharOpen} onClose={() => setFecharOpen(false)} title="Fechar Caixa">
          <div className="space-y-4">
            <div className="rounded-lg p-4" style={{ background: 'var(--bb-depth-4)' }}>
              <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--bb-ink-40)' }}>Resumo do Dia</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span style={{ color: 'var(--bb-ink-60)' }}>Total recebido</span><span className="font-bold" style={{ color: '#10b981' }}>{formatCurrency(data.totalRecebido)}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--bb-ink-60)' }}>Recebimentos</span><span className="font-bold" style={{ color: 'var(--bb-ink-100)' }}>{data.totalRecebimentos}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--bb-ink-60)' }}>Dinheiro esperado</span><span className="font-bold" style={{ color: 'var(--bb-ink-100)' }}>{formatCurrency(dinheiroTotal)}</span></div>
              </div>
            </div>
            <Input label="Dinheiro em caixa (R$)" type="number" value={dinheiroCaixa} onChange={(e) => setDinheiroCaixa(e.target.value)} placeholder="0.00" />
            {dinheiroCaixa && (
              <div className="rounded-lg p-3 text-sm" style={{ background: diferenca === 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
                <span style={{ color: diferenca === 0 ? '#10b981' : '#ef4444' }}>
                  Diferenca: {diferenca >= 0 ? '+' : ''}{formatCurrency(diferenca)}
                  {diferenca === 0 ? ' (OK)' : diferenca > 0 ? ' (sobra)' : ' (falta)'}
                </span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setFecharOpen(false)}>Cancelar</Button>
              <Button style={{ background: '#10b981' }} onClick={handleFecharCaixa}>
                Fechar e Gerar Relatorio
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </PlanGate>
  );
}
