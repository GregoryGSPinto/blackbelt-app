import type { AcessoAcademia } from '@/lib/api/recepcao-acesso.service';

export function mockGetAcesso(): AcessoAcademia {
  return {
    totalDentro: 23,
    capacidadeMaxima: 50,
    pessoasDentro: [
      { id: 'p-1', nome: 'Prof. Ricardo', tipo: 'professor', horaEntrada: '08:30', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-2', nome: 'Lucas Ferreira', tipo: 'aluno', faixa: 'blue', horaEntrada: '08:55', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-3', nome: 'Mariana Silva', tipo: 'aluno', faixa: 'purple', horaEntrada: '08:52', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-4', nome: 'Pedro Santos', tipo: 'aluno', faixa: 'white', horaEntrada: '08:50', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-5', nome: 'Carlos Mendes', tipo: 'aluno', faixa: 'purple', horaEntrada: '08:48' },
      { id: 'p-6', nome: 'Bruno Alves', tipo: 'aluno', faixa: 'blue', horaEntrada: '08:45', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-7', nome: 'Camila Souza', tipo: 'aluno', faixa: 'white', horaEntrada: '08:42', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-8', nome: 'Diego Ramos', tipo: 'aluno', faixa: 'blue', horaEntrada: '08:40', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-9', nome: 'Eduarda Lima', tipo: 'aluno', faixa: 'white', horaEntrada: '08:38', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-10', nome: 'Felipe Costa', tipo: 'aluno', faixa: 'blue', horaEntrada: '08:35', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-11', nome: 'Gabriela Rocha', tipo: 'aluno', faixa: 'white', horaEntrada: '08:55', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-12', nome: 'Henrique Nunes', tipo: 'aluno', faixa: 'purple', horaEntrada: '08:50', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-13', nome: 'Isabella Martins', tipo: 'aluno', faixa: 'blue', horaEntrada: '08:48' },
      { id: 'p-14', nome: 'Joao Pedro', tipo: 'aluno', faixa: 'white', horaEntrada: '08:45', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-15', nome: 'Karen Oliveira', tipo: 'aluno', faixa: 'white', horaEntrada: '08:42', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-16', nome: 'Leonardo Dias', tipo: 'aluno', faixa: 'blue', horaEntrada: '08:55', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-17', nome: 'Monica Freitas', tipo: 'aluno', faixa: 'white', horaEntrada: '08:52' },
      { id: 'p-18', nome: 'Nicolas Barbosa', tipo: 'aluno', faixa: 'blue', horaEntrada: '08:50', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-19', nome: 'Olivia Cardoso', tipo: 'aluno', faixa: 'white', horaEntrada: '08:48', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-20', nome: 'Sr. Roberto', tipo: 'visitante', horaEntrada: '09:10' },
      { id: 'p-21', nome: 'Paulo Henrique', tipo: 'aluno', faixa: 'brown', horaEntrada: '08:30', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-22', nome: 'Renata Gomes', tipo: 'aluno', faixa: 'blue', horaEntrada: '08:55', turma: 'Jiu-Jitsu Avancado' },
      { id: 'p-23', nome: 'Prof. Ana', tipo: 'professor', horaEntrada: '08:00' },
    ],
    movimentacao: [
      { id: 'm-1', nome: 'Lucas Ferreira', tipo: 'aluno', direcao: 'entrada', horario: '08:55' },
      { id: 'm-2', nome: 'Mariana Silva', tipo: 'aluno', direcao: 'entrada', horario: '08:52' },
      { id: 'm-3', nome: 'Pedro Santos', tipo: 'aluno', direcao: 'entrada', horario: '08:50' },
      { id: 'm-4', nome: 'Sr. Roberto', tipo: 'visitante', direcao: 'entrada', horario: '09:10' },
      { id: 'm-5', nome: 'Ana Costa', tipo: 'aluno', direcao: 'saida', horario: '07:35' },
      { id: 'm-6', nome: 'Rafael Oliveira', tipo: 'aluno', direcao: 'saida', horario: '07:32' },
      { id: 'm-7', nome: 'Prof. Carlos', tipo: 'professor', direcao: 'saida', horario: '07:40' },
      { id: 'm-8', nome: 'Prof. Ricardo', tipo: 'professor', direcao: 'entrada', horario: '08:30' },
    ],
  };
}

export function mockRegistrarEntrada(_data: { nome: string; tipo: string }): { ok: boolean } {
  return { ok: true };
}

export function mockRegistrarSaida(_id: string): { ok: boolean } {
  return { ok: true };
}
