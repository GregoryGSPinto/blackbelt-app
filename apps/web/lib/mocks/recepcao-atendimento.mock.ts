import type { AlunoAtendimento } from '@/lib/api/recepcao-atendimento.service';

const MOCK_ALUNOS: AlunoAtendimento[] = [
  {
    id: 'a-1', nome: 'Lucas Ferreira', email: 'lucas@email.com', telefone: '(11) 99999-1111',
    faixa: 'blue', tipo: 'adulto', statusFinanceiro: 'em_dia', plano: 'Semestral',
    proximoVencimento: '25/03/2026', ultimoCheckin: 'Hoje 08:55', presencasMes: 14,
    turmas: ['Jiu-Jitsu Avancado', 'MMA'], alertas: [],
  },
  {
    id: 'a-2', nome: 'Juliana Rodrigues', email: 'juliana@email.com', telefone: '(11) 98888-2222',
    faixa: 'white', tipo: 'adulto', statusFinanceiro: 'atrasado', diasAtraso: 12, valorDevido: 189.90,
    plano: 'Mensal', proximoVencimento: '05/03/2026', ultimoCheckin: '10/03/2026 18:00',
    presencasMes: 6, turmas: ['Muay Thai'], alertas: ['Mensalidade vencida ha 12 dias'],
  },
  {
    id: 'a-3', nome: 'Pedro Santos', email: 'pedro@email.com', telefone: '(11) 97777-3333',
    faixa: 'white', tipo: 'adulto', statusFinanceiro: 'em_dia', plano: 'Trimestral',
    proximoVencimento: '15/04/2026', ultimoCheckin: 'Hoje 08:50', presencasMes: 18,
    turmas: ['Jiu-Jitsu Avancado'], alertas: [],
  },
  {
    id: 'a-4', nome: 'Carlos Mendes', email: 'carlos@email.com', telefone: '(11) 96666-4444',
    faixa: 'purple', tipo: 'adulto', statusFinanceiro: 'atrasado', diasAtraso: 5, valorDevido: 159.90,
    plano: 'Trimestral', proximoVencimento: '12/03/2026', ultimoCheckin: '14/03/2026 09:00',
    presencasMes: 10, turmas: ['Jiu-Jitsu Avancado', 'Jiu-Jitsu Competicao'],
    alertas: ['Mensalidade vencida ha 5 dias'],
  },
  {
    id: 'a-5', nome: 'Ana Beatriz Lima', email: 'ana@email.com', telefone: '(11) 95555-5555',
    faixa: 'yellow', tipo: 'kids', statusFinanceiro: 'em_dia', plano: 'Mensal',
    proximoVencimento: '20/03/2026', ultimoCheckin: '15/03/2026 14:00', presencasMes: 8,
    turmas: ['Kids BJJ'], alertas: [],
  },
];

export function mockBuscarAluno(query: string): AlunoAtendimento[] {
  const q = query.toLowerCase();
  return MOCK_ALUNOS.filter(
    (a) => a.nome.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.telefone.includes(q),
  );
}

export function mockCheckinManual(_alunoId: string, _turmaId: string): { ok: boolean } {
  return { ok: true };
}

export function mockRegistrarPagamento(_data: { alunoId: string; valor: number; metodo: string; referencia: string }): { ok: boolean } {
  return { ok: true };
}
