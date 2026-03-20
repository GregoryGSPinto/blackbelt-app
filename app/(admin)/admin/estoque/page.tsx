'use client';

import { useEffect, useState } from 'react';
import { getEstoque, updateEstoque, getMovimentacoes, getAlertasEstoqueBaixo } from '@/lib/api/estoque.service';
import type { ProdutoEstoque, MovimentacaoEstoque, TipoMovimentacao, CategoriaEstoque } from '@/lib/api/estoque.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { PlanGate } from '@/components/plans/PlanGate';
import { translateError } from '@/lib/utils/error-translator';

const CATEGORIA_LABEL: Record<CategoriaEstoque, string> = {
  kimono: 'Kimono',
  rashguard: 'Rashguard',
  camiseta: 'Camiseta',
  acessorio: 'Acessorio',
  faixa: 'Faixa',
  outro: 'Outro',
};

const MOTIVOS_ENTRADA = ['Compra', 'Doacao', 'Ajuste'];
const MOTIVOS_SAIDA = ['Venda', 'Perda', 'Ajuste'];

const ALL_CATEGORIAS: CategoriaEstoque[] = ['kimono', 'rashguard', 'camiseta', 'acessorio', 'faixa', 'outro'];

export default function EstoquePage() {
  const { toast } = useToast();
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [alertas, setAlertas] = useState<ProdutoEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [movModal, setMovModal] = useState<{ produtoId: string; tipo: TipoMovimentacao; nome: string } | null>(null);
  const [movForm, setMovForm] = useState({ quantidade: '', motivo: '' });
  const [historicoModal, setHistoricoModal] = useState<{ produtoId: string; nome: string; movs: MovimentacaoEstoque[] } | null>(null);
  const [filterCategoria, setFilterCategoria] = useState<CategoriaEstoque | ''>('');

  useEffect(() => {
    async function load() {
      try {
        const [prods, alerts] = await Promise.all([
          getEstoque('academy-1'),
          getAlertasEstoqueBaixo('academy-1'),
        ]);
        setProdutos(prods);
        setAlertas(alerts);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleMovimento() {
    if (!movModal || !movForm.motivo) return;
    const qtd = parseInt(movForm.quantidade, 10);
    if (!qtd || qtd <= 0) {
      toast('Preencha quantidade e motivo', 'error');
      return;
    }
    try {
      await updateEstoque(movModal.produtoId, qtd, movModal.tipo, movForm.motivo);
      setProdutos((prev) =>
        prev.map((p) => {
          if (p.id !== movModal.produtoId) return p;
          const newQtd = movModal.tipo === 'entrada' ? p.quantidadeAtual + qtd : Math.max(0, p.quantidadeAtual - qtd);
          const newStatus = newQtd <= 0 ? 'zerado' as const : newQtd < p.estoqueMinimo ? 'baixo' as const : 'ok' as const;
          return { ...p, quantidadeAtual: newQtd, status: newStatus };
        }),
      );
      toast(movModal.tipo === 'entrada' ? 'Entrada registrada' : 'Saída registrada', 'success');
      setMovModal(null);
      setMovForm({ quantidade: '', motivo: '' });
      const alerts = await getAlertasEstoqueBaixo('academy-1');
      setAlertas(alerts);
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function openHistorico(produtoId: string, nome: string) {
    try {
      const movs = await getMovimentacoes(produtoId);
      setHistoricoModal({ produtoId, nome, movs: movs.slice(-10).reverse() });
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  const filteredProdutos = filterCategoria
    ? produtos.filter((p) => p.categoria === filterCategoria)
    : produtos;

  const totalSKUs = produtos.length;
  const valorEstoque = produtos.reduce((sum, p) => sum + p.quantidadeAtual * p.precoCusto, 0);

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-24" />)}
        </div>
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  return (
    <PlanGate module="loja">
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Estoque</h1>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {alertas.map((a) => (
            <div
              key={a.id}
              className="p-3"
              style={{
                background: 'var(--bb-depth-2)',
                border: `1px solid ${a.status === 'zerado' ? 'var(--bb-error, #EF4444)' : '#F59E0B'}`,
                borderRadius: 'var(--bb-radius-lg)',
              }}
            >
              <p className="text-sm font-semibold" style={{ color: a.status === 'zerado' ? 'var(--bb-error, #EF4444)' : '#F59E0B' }}>
                {a.nome} {a.status === 'zerado' ? '— ZERADO' : `— apenas ${a.quantidadeAtual} unidades`}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Total SKUs</p>
          <p className="mt-1 text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>{totalSKUs}</p>
        </Card>
        <Card className="p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Valor em Estoque</p>
          <p className="mt-1 text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>R$ {valorEstoque.toLocaleString('pt-BR')}</p>
        </Card>
        <Card className="p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Itens em Alerta</p>
          <p className="mt-1 text-2xl font-extrabold" style={{ color: alertas.length > 0 ? '#EF4444' : '#22C55E' }}>{alertas.length}</p>
        </Card>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategoria('')}
          className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
          style={{
            background: filterCategoria === '' ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
            color: filterCategoria === '' ? '#fff' : 'var(--bb-ink-60)',
            border: '1px solid var(--bb-glass-border)',
          }}
        >
          Todos
        </button>
        {ALL_CATEGORIAS.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategoria(cat)}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: filterCategoria === cat ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
              color: filterCategoria === cat ? '#fff' : 'var(--bb-ink-60)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            {CATEGORIA_LABEL[cat]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="overflow-hidden"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid var(--bb-glass-border)',
          borderRadius: 'var(--bb-radius-lg)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Produto</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium sm:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Categoria</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium md:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Tamanho</th>
                <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Qtd Atual</th>
                <th className="hidden px-4 py-3 text-right text-xs font-medium sm:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Mínimo</th>
                <th className="hidden px-4 py-3 text-right text-xs font-medium md:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Preço Venda</th>
                <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProdutos.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{p.nome}</span>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>{CATEGORIA_LABEL[p.categoria]}</span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>{p.tamanho ?? '\u2014'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="font-mono text-sm font-bold"
                      style={{
                        color: p.status === 'zerado' ? '#EF4444' : p.status === 'baixo' ? '#F59E0B' : '#22C55E',
                      }}
                    >
                      {p.quantidadeAtual}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-right sm:table-cell">
                    <span className="font-mono text-sm" style={{ color: 'var(--bb-ink-60)' }}>{p.estoqueMinimo}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-right md:table-cell">
                    <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>R$ {p.precoVenda}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <button
                        onClick={() => { setMovModal({ produtoId: p.id, tipo: 'entrada', nome: p.nome }); setMovForm({ quantidade: '', motivo: '' }); }}
                        className="rounded px-2 py-1 text-xs font-medium transition-colors"
                        style={{ color: '#22C55E', background: 'rgba(34,197,94,0.1)' }}
                      >
                        Entrada
                      </button>
                      <button
                        onClick={() => { setMovModal({ produtoId: p.id, tipo: 'saida', nome: p.nome }); setMovForm({ quantidade: '', motivo: '' }); }}
                        className="rounded px-2 py-1 text-xs font-medium transition-colors"
                        style={{ color: '#EF4444', background: 'rgba(239,68,68,0.1)' }}
                        disabled={p.quantidadeAtual <= 0}
                      >
                        Saída
                      </button>
                      <button
                        onClick={() => openHistorico(p.id, p.nome)}
                        className="rounded px-2 py-1 text-xs font-medium transition-colors"
                        style={{ color: 'var(--bb-ink-60)', background: 'var(--bb-depth-3)' }}
                      >
                        Histórico
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProdutos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Movimento */}
      <Modal
        open={!!movModal}
        onClose={() => { setMovModal(null); setMovForm({ quantidade: '', motivo: '' }); }}
        title={movModal ? `${movModal.tipo === 'entrada' ? 'Entrada' : 'Saída'} — ${movModal.nome}` : ''}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Quantidade</label>
            <input
              type="number"
              min="1"
              value={movForm.quantidade}
              onChange={(e) => setMovForm({ ...movForm, quantidade: e.target.value })}
              placeholder="0"
              className="mt-1 w-full rounded-lg px-3 py-2 text-sm"
              style={{
                background: 'var(--bb-depth-3)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Motivo</label>
            <select
              value={movForm.motivo}
              onChange={(e) => setMovForm({ ...movForm, motivo: e.target.value })}
              className="mt-1 w-full rounded-lg px-3 py-2 text-sm"
              style={{
                background: 'var(--bb-depth-3)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
              }}
            >
              <option value="">Selecione...</option>
              {(movModal?.tipo === 'entrada' ? MOTIVOS_ENTRADA : MOTIVOS_SAIDA).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <Button
            className="w-full"
            onClick={handleMovimento}
            disabled={!movForm.quantidade || !movForm.motivo}
          >
            Confirmar
          </Button>
        </div>
      </Modal>

      {/* Modal Histórico */}
      <Modal
        open={!!historicoModal}
        onClose={() => setHistoricoModal(null)}
        title={historicoModal ? `Histórico — ${historicoModal.nome}` : ''}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                <th className="px-3 py-2 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Data</th>
                <th className="px-3 py-2 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Tipo</th>
                <th className="px-3 py-2 text-right text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Qtd</th>
                <th className="px-3 py-2 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Motivo</th>
                <th className="px-3 py-2 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Responsável</th>
              </tr>
            </thead>
            <tbody>
              {historicoModal?.movs.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                  <td className="px-3 py-2 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    {new Date(m.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                      style={{
                        color: m.tipo === 'entrada' ? '#22C55E' : '#EF4444',
                        background: m.tipo === 'entrada' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      }}
                    >
                      {m.tipo}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                    {m.tipo === 'entrada' ? '+' : '-'}{m.quantidade}
                  </td>
                  <td className="px-3 py-2 text-xs" style={{ color: 'var(--bb-ink-60)' }}>{m.motivo}</td>
                  <td className="px-3 py-2 text-xs" style={{ color: 'var(--bb-ink-60)' }}>{m.responsavel}</td>
                </tr>
              ))}
              {(!historicoModal?.movs || historicoModal.movs.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                    Sem movimentações registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
    </PlanGate>
  );
}
