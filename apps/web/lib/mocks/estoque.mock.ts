import type { ProdutoEstoque, MovimentacaoEstoque, TipoMovimentacao } from '@/lib/api/estoque.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const PRODUTOS: ProdutoEstoque[] = [
  { id: 'prod-1', nome: 'Kimono Branco A1', categoria: 'kimono', tamanho: 'A1', cor: 'branco', quantidadeAtual: 15, estoqueMinimo: 5, precoVenda: 280, precoCusto: 140, ultimaMovimentacao: '2026-03-10T14:00:00Z', status: 'ok' },
  { id: 'prod-2', nome: 'Kimono Branco A2', categoria: 'kimono', tamanho: 'A2', cor: 'branco', quantidadeAtual: 2, estoqueMinimo: 5, precoVenda: 300, precoCusto: 150, ultimaMovimentacao: '2026-03-08T10:00:00Z', status: 'baixo' },
  { id: 'prod-3', nome: 'Kimono Branco A3', categoria: 'kimono', tamanho: 'A3', cor: 'branco', quantidadeAtual: 8, estoqueMinimo: 5, precoVenda: 320, precoCusto: 160, ultimaMovimentacao: '2026-03-12T16:00:00Z', status: 'ok' },
  { id: 'prod-4', nome: 'Rashguard Preta P', categoria: 'rashguard', tamanho: 'P', cor: 'preto', quantidadeAtual: 10, estoqueMinimo: 5, precoVenda: 150, precoCusto: 65, ultimaMovimentacao: '2026-03-14T09:00:00Z', status: 'ok' },
  { id: 'prod-5', nome: 'Rashguard Preta M', categoria: 'rashguard', tamanho: 'M', cor: 'preto', quantidadeAtual: 0, estoqueMinimo: 5, precoVenda: 150, precoCusto: 65, ultimaMovimentacao: '2026-03-05T11:00:00Z', status: 'zerado' },
  { id: 'prod-6', nome: 'Rashguard Preta G', categoria: 'rashguard', tamanho: 'G', cor: 'preto', quantidadeAtual: 6, estoqueMinimo: 5, precoVenda: 160, precoCusto: 70, ultimaMovimentacao: '2026-03-11T15:00:00Z', status: 'ok' },
  { id: 'prod-7', nome: 'Camiseta BlackBelt P', categoria: 'camiseta', tamanho: 'P', cor: 'preto', quantidadeAtual: 20, estoqueMinimo: 5, precoVenda: 79, precoCusto: 30, ultimaMovimentacao: '2026-03-15T08:00:00Z', status: 'ok' },
  { id: 'prod-8', nome: 'Camiseta BlackBelt M', categoria: 'camiseta', tamanho: 'M', cor: 'preto', quantidadeAtual: 15, estoqueMinimo: 5, precoVenda: 79, precoCusto: 30, ultimaMovimentacao: '2026-03-15T08:00:00Z', status: 'ok' },
  { id: 'prod-9', nome: 'Camiseta BlackBelt G', categoria: 'camiseta', tamanho: 'G', cor: 'preto', quantidadeAtual: 12, estoqueMinimo: 5, precoVenda: 79, precoCusto: 30, ultimaMovimentacao: '2026-03-15T08:00:00Z', status: 'ok' },
  { id: 'prod-10', nome: 'Faixa Branca', categoria: 'faixa', cor: 'branco', quantidadeAtual: 3, estoqueMinimo: 5, precoVenda: 35, precoCusto: 12, ultimaMovimentacao: '2026-03-13T10:00:00Z', status: 'baixo' },
  { id: 'prod-11', nome: 'Faixa Azul', categoria: 'faixa', cor: 'azul', quantidadeAtual: 8, estoqueMinimo: 5, precoVenda: 40, precoCusto: 15, ultimaMovimentacao: '2026-03-09T14:00:00Z', status: 'ok' },
  { id: 'prod-12', nome: 'Protetor Bucal', categoria: 'acessorio', quantidadeAtual: 25, estoqueMinimo: 5, precoVenda: 45, precoCusto: 15, ultimaMovimentacao: '2026-03-16T12:00:00Z', status: 'ok' },
];

const MOVIMENTACOES: MovimentacaoEstoque[] = [
  { id: 'mov-1', produtoId: 'prod-1', tipo: 'entrada', quantidade: 20, motivo: 'Compra fornecedor Keiko', responsavel: 'Admin', data: '2026-03-01T10:00:00Z' },
  { id: 'mov-2', produtoId: 'prod-1', tipo: 'saida', quantidade: 3, motivo: 'Venda para alunos novos', responsavel: 'Recepção', data: '2026-03-05T14:00:00Z' },
  { id: 'mov-3', produtoId: 'prod-1', tipo: 'saida', quantidade: 2, motivo: 'Venda para alunos', responsavel: 'Recepção', data: '2026-03-10T14:00:00Z' },
  { id: 'mov-4', produtoId: 'prod-2', tipo: 'entrada', quantidade: 10, motivo: 'Compra fornecedor Keiko', responsavel: 'Admin', data: '2026-02-15T10:00:00Z' },
  { id: 'mov-5', produtoId: 'prod-2', tipo: 'saida', quantidade: 8, motivo: 'Vendas diversas', responsavel: 'Recepção', data: '2026-03-08T10:00:00Z' },
  { id: 'mov-6', produtoId: 'prod-3', tipo: 'entrada', quantidade: 12, motivo: 'Compra fornecedor Vulkan', responsavel: 'Admin', data: '2026-02-20T09:00:00Z' },
  { id: 'mov-7', produtoId: 'prod-3', tipo: 'saida', quantidade: 4, motivo: 'Venda para alunos', responsavel: 'Recepção', data: '2026-03-12T16:00:00Z' },
  { id: 'mov-8', produtoId: 'prod-4', tipo: 'entrada', quantidade: 15, motivo: 'Compra fornecedor Naja', responsavel: 'Admin', data: '2026-03-01T11:00:00Z' },
  { id: 'mov-9', produtoId: 'prod-4', tipo: 'saida', quantidade: 5, motivo: 'Venda loja', responsavel: 'Recepção', data: '2026-03-14T09:00:00Z' },
  { id: 'mov-10', produtoId: 'prod-5', tipo: 'entrada', quantidade: 10, motivo: 'Compra fornecedor Naja', responsavel: 'Admin', data: '2026-02-10T10:00:00Z' },
  { id: 'mov-11', produtoId: 'prod-5', tipo: 'saida', quantidade: 10, motivo: 'Vendas e promoção de inauguração', responsavel: 'Recepção', data: '2026-03-05T11:00:00Z' },
  { id: 'mov-12', produtoId: 'prod-10', tipo: 'entrada', quantidade: 10, motivo: 'Compra fornecedor Torah', responsavel: 'Admin', data: '2026-02-01T10:00:00Z' },
  { id: 'mov-13', produtoId: 'prod-10', tipo: 'saida', quantidade: 7, motivo: 'Graduação e vendas', responsavel: 'Prof. André', data: '2026-03-13T10:00:00Z' },
  { id: 'mov-14', produtoId: 'prod-12', tipo: 'entrada', quantidade: 30, motivo: 'Compra fornecedor', responsavel: 'Admin', data: '2026-03-01T08:00:00Z' },
  { id: 'mov-15', produtoId: 'prod-12', tipo: 'saida', quantidade: 5, motivo: 'Vendas para alunos iniciantes', responsavel: 'Recepção', data: '2026-03-16T12:00:00Z' },
  { id: 'mov-16', produtoId: 'prod-7', tipo: 'entrada', quantidade: 25, motivo: 'Lote camisetas personalizadas', responsavel: 'Admin', data: '2026-03-10T08:00:00Z' },
  { id: 'mov-17', produtoId: 'prod-7', tipo: 'saida', quantidade: 5, motivo: 'Venda no evento', responsavel: 'Recepção', data: '2026-03-15T08:00:00Z' },
  { id: 'mov-18', produtoId: 'prod-11', tipo: 'ajuste', quantidade: 8, motivo: 'Inventário — contagem física', responsavel: 'Admin', data: '2026-03-09T14:00:00Z' },
];

export async function mockGetEstoque(_academyId: string): Promise<ProdutoEstoque[]> {
  await delay();
  return PRODUTOS.map((p) => ({ ...p }));
}

export async function mockUpdateEstoque(produtoId: string, quantidade: number, tipo: TipoMovimentacao, motivo: string): Promise<MovimentacaoEstoque> {
  await delay();
  const produto = PRODUTOS.find((p) => p.id === produtoId);
  if (produto) {
    if (tipo === 'entrada') produto.quantidadeAtual += quantidade;
    else if (tipo === 'saida') produto.quantidadeAtual -= quantidade;
    else produto.quantidadeAtual = quantidade;

    if (produto.quantidadeAtual <= 0) { produto.quantidadeAtual = Math.max(0, produto.quantidadeAtual); produto.status = 'zerado'; }
    else if (produto.quantidadeAtual < produto.estoqueMinimo) produto.status = 'baixo';
    else produto.status = 'ok';

    produto.ultimaMovimentacao = new Date().toISOString();
  }
  const mov: MovimentacaoEstoque = { id: `mov-${Date.now()}`, produtoId, tipo, quantidade, motivo, responsavel: 'Admin', data: new Date().toISOString() };
  MOVIMENTACOES.push(mov);
  return mov;
}

export async function mockGetMovimentacoes(produtoId: string): Promise<MovimentacaoEstoque[]> {
  await delay();
  return MOVIMENTACOES.filter((m) => m.produtoId === produtoId).map((m) => ({ ...m }));
}

export async function mockGetAlertasEstoqueBaixo(_academyId: string): Promise<ProdutoEstoque[]> {
  await delay();
  return PRODUTOS.filter((p) => p.status === 'baixo' || p.status === 'zerado').map((p) => ({ ...p }));
}
