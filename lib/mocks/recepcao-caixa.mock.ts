import type { CaixaDia } from '@/lib/api/recepcao-caixa.service';

export function mockGetCaixa(): CaixaDia {
  return {
    data: '17/03/2026',
    totalRecebido: 3847.60,
    totalPendente: 529.70,
    totalRecebimentos: 12,
    porMetodo: [
      { metodo: 'PIX', total: 1689.80, quantidade: 5 },
      { metodo: 'Cartao Credito', total: 1199.70, quantidade: 4 },
      { metodo: 'Dinheiro', total: 579.80, quantidade: 2 },
      { metodo: 'Cartao Debito', total: 378.30, quantidade: 1 },
    ],
    recebimentos: [
      { id: 'r-1', horario: '08:15', alunoNome: 'Pedro Santos', tipo: 'mensalidade', descricao: 'Mensal Mar/2026', valor: 189.90, metodo: 'pix' },
      { id: 'r-2', horario: '08:30', alunoNome: 'Maria Joaquina', tipo: 'matricula', descricao: 'Taxa matricula', valor: 99.90, metodo: 'cartao_credito' },
      { id: 'r-3', horario: '09:10', alunoNome: 'Rafael Oliveira', tipo: 'mensalidade', descricao: 'Trimestral Mar/2026', valor: 159.90, metodo: 'pix' },
      { id: 'r-4', horario: '09:45', alunoNome: 'Ana Costa', tipo: 'produto', descricao: 'Kimono A3 Branco', valor: 289.90, metodo: 'cartao_credito' },
      { id: 'r-5', horario: '10:20', alunoNome: 'Lucas Ferreira', tipo: 'mensalidade', descricao: 'Semestral Mar/2026', valor: 139.90, metodo: 'pix' },
      { id: 'r-6', horario: '11:00', alunoNome: 'Bruno Alves', tipo: 'mensalidade', descricao: 'Mensal Mar/2026', valor: 189.90, metodo: 'dinheiro' },
      { id: 'r-7', horario: '11:30', alunoNome: 'Camila Souza', tipo: 'evento', descricao: 'Seminario Prof. Visitante', valor: 120.00, metodo: 'pix' },
      { id: 'r-8', horario: '12:15', alunoNome: 'Diego Ramos', tipo: 'mensalidade', descricao: 'Mensal Mar/2026', valor: 189.90, metodo: 'cartao_credito' },
      { id: 'r-9', horario: '13:00', alunoNome: 'Eduarda Lima', tipo: 'produto', descricao: 'Rashguard P', valor: 149.90, metodo: 'cartao_credito' },
      { id: 'r-10', horario: '14:30', alunoNome: 'Felipe Costa', tipo: 'mensalidade', descricao: 'Mensal Mar/2026', valor: 189.90, metodo: 'dinheiro' },
      { id: 'r-11', horario: '15:00', alunoNome: 'Gabriela Rocha', tipo: 'mensalidade', descricao: 'Anual Mar/2026', valor: 119.90, metodo: 'pix' },
      { id: 'r-12', horario: '15:45', alunoNome: 'Henrique Nunes', tipo: 'mensalidade', descricao: 'Trimestral Mar/2026', valor: 159.90, metodo: 'cartao_debito' },
    ],
    vencendoHoje: [
      { id: 'v-1', alunoNome: 'Carlos Mendes', valor: 159.90, plano: 'Trimestral' },
      { id: 'v-2', alunoNome: 'Juliana Rodrigues', valor: 189.90, plano: 'Mensal' },
      { id: 'v-3', alunoNome: 'Andre Farias', valor: 179.90, plano: 'Mensal + Muay Thai' },
    ],
  };
}

export function mockRegistrarRecebimento(_data: {
  alunoNome: string;
  tipo: string;
  descricao: string;
  valor: number;
  metodo: string;
}): { ok: boolean; id: string } {
  return { ok: true, id: 'r-new-' + Date.now() };
}
