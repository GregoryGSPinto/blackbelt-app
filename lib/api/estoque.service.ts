import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type CategoriaEstoque = 'kimono' | 'rashguard' | 'camiseta' | 'acessorio' | 'faixa' | 'outro';
export type StatusEstoque = 'ok' | 'baixo' | 'zerado';
export type TipoMovimentacao = 'entrada' | 'saida' | 'ajuste';

export interface ProdutoEstoque {
  id: string;
  nome: string;
  categoria: CategoriaEstoque;
  tamanho?: string;
  cor?: string;
  quantidadeAtual: number;
  estoqueMinimo: number;
  precoVenda: number;
  precoCusto: number;
  ultimaMovimentacao: string;
  status: StatusEstoque;
}

export interface MovimentacaoEstoque {
  id: string;
  produtoId: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  motivo: string;
  responsavel: string;
  data: string;
}

export async function getEstoque(academyId: string): Promise<ProdutoEstoque[]> {
  try {
    if (isMock()) {
      const { mockGetEstoque } = await import('@/lib/mocks/estoque.mock');
      return mockGetEstoque(academyId);
    }
    // API not yet implemented — use mock
    const { mockGetEstoque } = await import('@/lib/mocks/estoque.mock');
      return mockGetEstoque(academyId);
  } catch (error) { handleServiceError(error, 'estoque.list'); }
}

export async function updateEstoque(produtoId: string, quantidade: number, tipo: TipoMovimentacao, motivo: string): Promise<MovimentacaoEstoque> {
  try {
    if (isMock()) {
      const { mockUpdateEstoque } = await import('@/lib/mocks/estoque.mock');
      return mockUpdateEstoque(produtoId, quantidade, tipo, motivo);
    }
    try {
      const res = await fetch(`/api/estoque/${produtoId}/movimentacao`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantidade, tipo, motivo }) });
      if (!res.ok) throw new ServiceError(res.status, 'estoque.update');
      return res.json();
    } catch {
      console.warn('[estoque.updateEstoque] API not available, using mock fallback');
      const { mockUpdateEstoque } = await import('@/lib/mocks/estoque.mock');
      return mockUpdateEstoque(produtoId, quantidade, tipo, motivo);
    }
  } catch (error) { handleServiceError(error, 'estoque.update'); }
}

export async function getMovimentacoes(produtoId: string): Promise<MovimentacaoEstoque[]> {
  try {
    if (isMock()) {
      const { mockGetMovimentacoes } = await import('@/lib/mocks/estoque.mock');
      return mockGetMovimentacoes(produtoId);
    }
    // API not yet implemented — use mock
    const { mockGetMovimentacoes } = await import('@/lib/mocks/estoque.mock');
      return mockGetMovimentacoes(produtoId);
  } catch (error) { handleServiceError(error, 'estoque.movimentacoes'); }
}

export async function getAlertasEstoqueBaixo(academyId: string): Promise<ProdutoEstoque[]> {
  try {
    if (isMock()) {
      const { mockGetAlertasEstoqueBaixo } = await import('@/lib/mocks/estoque.mock');
      return mockGetAlertasEstoqueBaixo(academyId);
    }
    // API not yet implemented — use mock
    const { mockGetAlertasEstoqueBaixo } = await import('@/lib/mocks/estoque.mock');
      return mockGetAlertasEstoqueBaixo(academyId);
  } catch (error) { handleServiceError(error, 'estoque.alertas'); }
}
