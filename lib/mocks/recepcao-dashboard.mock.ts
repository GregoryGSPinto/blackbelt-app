import type { RecepcaoDashboardDTO } from '@/lib/api/recepcao-dashboard.service';

export function mockGetRecepcaoDashboard(): RecepcaoDashboardDTO {
  return {
    aulaEmAndamento: {
      turma: 'Jiu-Jitsu Avancado',
      professor: 'Prof. Ricardo',
      horario: '09:00 - 10:00',
      presentes: 18,
      capacidade: 25,
      sala: 'Tatame 1',
    },
    aulasHoje: [
      { turma: 'Jiu-Jitsu Iniciante', horario: '06:30', professor: 'Prof. Carlos', sala: 'Tatame 1', matriculados: 22, capacidade: 30, status: 'concluida' },
      { turma: 'Jiu-Jitsu Avancado', horario: '09:00', professor: 'Prof. Ricardo', sala: 'Tatame 1', matriculados: 18, capacidade: 25, status: 'em_andamento' },
      { turma: 'Kids BJJ', horario: '14:00', professor: 'Prof. Ana', sala: 'Tatame 2', matriculados: 15, capacidade: 20, status: 'proxima' },
      { turma: 'Muay Thai', horario: '18:00', professor: 'Prof. Felipe', sala: 'Sala 1', matriculados: 28, capacidade: 30, status: 'proxima' },
      { turma: 'Jiu-Jitsu Competicao', horario: '19:30', professor: 'Prof. Ricardo', sala: 'Tatame 1', matriculados: 12, capacidade: 20, status: 'proxima' },
      { turma: 'MMA', horario: '20:30', professor: 'Prof. Marcos', sala: 'Sala 1', matriculados: 16, capacidade: 20, status: 'proxima' },
    ],
    checkinsHoje: [
      { alunoNome: 'Lucas Ferreira', faixa: 'blue', turma: 'Jiu-Jitsu Avancado', horario: '08:55', metodo: 'qr' },
      { alunoNome: 'Mariana Silva', faixa: 'purple', turma: 'Jiu-Jitsu Avancado', horario: '08:52', metodo: 'qr' },
      { alunoNome: 'Pedro Santos', faixa: 'white', turma: 'Jiu-Jitsu Avancado', horario: '08:50', metodo: 'manual' },
      { alunoNome: 'Ana Costa', faixa: 'blue', turma: 'Jiu-Jitsu Iniciante', horario: '06:28', metodo: 'qr' },
      { alunoNome: 'Rafael Oliveira', faixa: 'white', turma: 'Jiu-Jitsu Iniciante', horario: '06:25', metodo: 'catraca' },
    ],
    totalCheckinsHoje: 24,
    pendencias: [
      { tipo: 'pagamento_vencido', titulo: '3 pagamentos vencidos hoje', descricao: 'Carlos M., Juliana R., Andre F. com mensalidades vencidas', urgencia: 'alta', acao: { label: 'Ver cobrancas', rota: '/recepcao/caixa' } },
      { tipo: 'aula_experimental', titulo: '2 experimentais agendadas', descricao: 'Fernanda Lima (14h) e Gustavo Rocha (18h)', urgencia: 'media', acao: { label: 'Ver experimentais', rota: '/recepcao/experimentais' } },
      { tipo: 'contrato_pendente', titulo: '1 contrato pendente', descricao: 'Maria Joaquina - aguardando assinatura desde 12/03', urgencia: 'media', acao: { label: 'Ver contratos', rota: '/recepcao/cadastro' } },
      { tipo: 'cadastro_incompleto', titulo: 'Cadastro incompleto', descricao: 'Roberto Alves - falta documento e foto', urgencia: 'baixa', acao: { label: 'Completar', rota: '/recepcao/cadastro' } },
    ],
    experimentaisHoje: [
      { id: 'exp-1', nomeVisitante: 'Fernanda Lima', telefone: '(11) 99999-1234', turma: 'Kids BJJ', horario: '14:00', status: 'confirmada', origem: 'instagram' },
      { id: 'exp-2', nomeVisitante: 'Gustavo Rocha', telefone: '(11) 98888-5678', turma: 'Muay Thai', horario: '18:00', status: 'agendada', origem: 'indicacao' },
    ],
    aniversariantes: [
      { nome: 'Lucas Ferreira', idade: 28 },
      { nome: 'Prof. Ana Paula', idade: 34 },
    ],
    resumo: {
      alunosAtivos: 187,
      aulasHoje: 6,
      pagamentosVencidosHoje: 3,
      experimentaisHoje: 2,
    },
  };
}
