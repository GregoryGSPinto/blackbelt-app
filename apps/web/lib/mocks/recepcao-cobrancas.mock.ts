import type { Inadimplente, Pagamento, ResumoCobrancas } from '@/lib/api/recepcao-cobrancas.service';

const MOCK_INADIMPLENTES: Inadimplente[] = [
  { id: 'i1', nome: 'Pedro Henrique', avatar: '', valor: 179, diasAtraso: 45, telefone: '5511999991111', email: 'pedro@email.com', turma: 'BJJ Adulto', faixa: 'azul' },
  { id: 'i2', nome: 'Mariana Costa', avatar: '', valor: 149, diasAtraso: 30, telefone: '5511999992222', email: 'mariana@email.com', turma: 'Muay Thai', faixa: 'branca' },
  { id: 'i3', nome: 'Felipe Santos', avatar: '', valor: 199, diasAtraso: 22, telefone: '5511999993333', email: 'felipe@email.com', turma: 'BJJ Adulto', faixa: 'roxa' },
  { id: 'i4', nome: 'Juliana Almeida', avatar: '', valor: 179, diasAtraso: 15, telefone: '5511999994444', email: 'juliana@email.com', turma: 'BJJ Feminino', faixa: 'branca' },
  { id: 'i5', nome: 'Thiago Oliveira', avatar: '', valor: 149, diasAtraso: 10, telefone: '5511999995555', email: 'thiago@email.com', turma: 'Muay Thai', faixa: 'branca' },
  { id: 'i6', nome: 'Amanda Ferreira', avatar: '', valor: 229, diasAtraso: 8, telefone: '5511999996666', email: 'amanda@email.com', turma: 'BJJ + Muay Thai', faixa: 'azul' },
  { id: 'i7', nome: 'Bruno Rodrigues', avatar: '', valor: 179, diasAtraso: 5, telefone: '5511999997777', email: 'bruno@email.com', turma: 'BJJ Adulto', faixa: 'branca' },
  { id: 'i8', nome: 'Larissa Lima', avatar: '', valor: 149, diasAtraso: 2, telefone: '5511999998888', email: 'larissa@email.com', turma: 'Muay Thai', faixa: 'branca' },
];

const MOCK_HISTORICO: Pagamento[] = [
  { id: 'pg1', alunoId: 'i1', valor: 179, forma: 'pix', data: '2026-02-05', registradoPor: 'Recepção' },
  { id: 'pg2', alunoId: 'i1', valor: 179, forma: 'cartao', data: '2026-01-08', registradoPor: 'Recepção' },
  { id: 'pg3', alunoId: 'i1', valor: 179, forma: 'dinheiro', data: '2025-12-10', registradoPor: 'Recepção' },
];

export function mockGetInadimplentes(): { inadimplentes: Inadimplente[]; resumo: ResumoCobrancas } {
  const total = MOCK_INADIMPLENTES.reduce((sum, i) => sum + i.valor, 0);
  return {
    inadimplentes: MOCK_INADIMPLENTES,
    resumo: { totalInadimplente: total, quantidadeInadimplentes: MOCK_INADIMPLENTES.length },
  };
}

export function mockRegistrarPagamento(_alunoId: string, _valor: number, _forma: string): { success: boolean } {
  return { success: true };
}

export function mockGetHistorico(_alunoId: string): Pagamento[] {
  return MOCK_HISTORICO;
}
