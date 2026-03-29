import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('estoque')
      .select('*')
      .eq('academy_id', academyId);

    if (error || !data) {
      logServiceError(error, 'estoque');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      nome: String(row.nome ?? ''),
      categoria: (row.categoria ?? 'outro') as CategoriaEstoque,
      tamanho: row.tamanho ? String(row.tamanho) : undefined,
      cor: row.cor ? String(row.cor) : undefined,
      quantidadeAtual: Number(row.quantidade_atual ?? 0),
      estoqueMinimo: Number(row.estoque_minimo ?? 0),
      precoVenda: Number(row.preco_venda ?? 0),
      precoCusto: Number(row.preco_custo ?? 0),
      ultimaMovimentacao: String(row.ultima_movimentacao ?? ''),
      status: (row.status ?? 'ok') as StatusEstoque,
    }));
  } catch (error) {
    logServiceError(error, 'estoque');
    return [];
  }
}

export async function updateEstoque(produtoId: string, quantidade: number, tipo: TipoMovimentacao, motivo: string): Promise<MovimentacaoEstoque> {
  try {
    if (isMock()) {
      const { mockUpdateEstoque } = await import('@/lib/mocks/estoque.mock');
      return mockUpdateEstoque(produtoId, quantidade, tipo, motivo);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('movimentacoes_estoque')
      .insert({ produto_id: produtoId, quantidade, tipo, motivo })
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'estoque');
      return { id: '', produtoId, tipo, quantidade, motivo, responsavel: '', data: new Date().toISOString() };
    }

    return {
      id: String(data.id),
      produtoId: String(data.produto_id ?? produtoId),
      tipo: (data.tipo ?? tipo) as TipoMovimentacao,
      quantidade: Number(data.quantidade ?? 0),
      motivo: String(data.motivo ?? ''),
      responsavel: String(data.responsavel ?? ''),
      data: String(data.created_at ?? new Date().toISOString()),
    };
  } catch (error) {
    logServiceError(error, 'estoque');
    return { id: '', produtoId, tipo, quantidade, motivo, responsavel: '', data: new Date().toISOString() };
  }
}

export async function getMovimentacoes(produtoId: string): Promise<MovimentacaoEstoque[]> {
  try {
    if (isMock()) {
      const { mockGetMovimentacoes } = await import('@/lib/mocks/estoque.mock');
      return mockGetMovimentacoes(produtoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('movimentacoes_estoque')
      .select('*')
      .eq('produto_id', produtoId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      logServiceError(error, 'estoque');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      produtoId: String(row.produto_id ?? ''),
      tipo: (row.tipo ?? 'ajuste') as TipoMovimentacao,
      quantidade: Number(row.quantidade ?? 0),
      motivo: String(row.motivo ?? ''),
      responsavel: String(row.responsavel ?? ''),
      data: String(row.created_at ?? ''),
    }));
  } catch (error) {
    logServiceError(error, 'estoque');
    return [];
  }
}

export async function getAlertasEstoqueBaixo(academyId: string): Promise<ProdutoEstoque[]> {
  try {
    if (isMock()) {
      const { mockGetAlertasEstoqueBaixo } = await import('@/lib/mocks/estoque.mock');
      return mockGetAlertasEstoqueBaixo(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('estoque')
      .select('*')
      .eq('academy_id', academyId)
      .in('status', ['baixo', 'zerado']);

    if (error || !data) {
      logServiceError(error, 'estoque');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      nome: String(row.nome ?? ''),
      categoria: (row.categoria ?? 'outro') as CategoriaEstoque,
      tamanho: row.tamanho ? String(row.tamanho) : undefined,
      cor: row.cor ? String(row.cor) : undefined,
      quantidadeAtual: Number(row.quantidade_atual ?? 0),
      estoqueMinimo: Number(row.estoque_minimo ?? 0),
      precoVenda: Number(row.preco_venda ?? 0),
      precoCusto: Number(row.preco_custo ?? 0),
      ultimaMovimentacao: String(row.ultima_movimentacao ?? ''),
      status: (row.status ?? 'baixo') as StatusEstoque,
    }));
  } catch (error) {
    logServiceError(error, 'estoque');
    return [];
  }
}
