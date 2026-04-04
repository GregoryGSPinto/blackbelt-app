import type { CadastroRapido, CadastroResult, PlanoResumo, TurmaResumo } from '@/lib/api/recepcao-cadastro.service';

export function mockCadastrarRapido(_data: CadastroRapido): CadastroResult {
  return {
    alunoId: 'aluno-new-' + Date.now(),
    tipo: _data.tipo,
    loginTemporario: { email: _data.email, senhaTemporaria: 'Bb@2026!' },
    contratoGerado: _data.tipo === 'matricula',
    proximaAula: { turma: 'Jiu-Jitsu Iniciante', horario: 'Amanha 06:30' },
  };
}

export function mockGetPlanos(): PlanoResumo[] {
  return [
    { id: 'plan-1', nome: 'Mensal', valor: 189.90, beneficios: ['1 modalidade', 'Acesso ao app', 'Kimono incluso'] },
    { id: 'plan-2', nome: 'Trimestral', valor: 159.90, beneficios: ['1 modalidade', 'Acesso ao app', 'Kimono incluso', '15% desconto'] },
    { id: 'plan-3', nome: 'Semestral', valor: 139.90, beneficios: ['2 modalidades', 'Acesso ao app', 'Kimono incluso', '25% desconto'] },
    { id: 'plan-4', nome: 'Anual', valor: 119.90, beneficios: ['Todas modalidades', 'Acesso ao app', 'Kimono incluso', '35% desconto', 'Personal 1x/mes'] },
  ];
}

export function mockGetTurmasDisponiveis(): TurmaResumo[] {
  return [
    { id: 'turma-1', nome: 'Jiu-Jitsu Iniciante', horario: 'Seg/Qua/Sex 06:30-07:30', professor: 'Prof. Carlos', vagas: 8 },
    { id: 'turma-2', nome: 'Jiu-Jitsu Avancado', horario: 'Seg/Qua/Sex 09:00-10:00', professor: 'Prof. Ricardo', vagas: 7 },
    { id: 'turma-3', nome: 'Kids BJJ', horario: 'Ter/Qui 14:00-15:00', professor: 'Prof. Ana', vagas: 5 },
    { id: 'turma-4', nome: 'Muay Thai', horario: 'Seg/Qua/Sex 18:00-19:00', professor: 'Prof. Felipe', vagas: 2 },
    { id: 'turma-5', nome: 'Judo Iniciante', horario: 'Ter/Qui 19:00-20:00', professor: 'Prof. Marcos', vagas: 10 },
    { id: 'turma-6', nome: 'MMA', horario: 'Seg/Qua/Sex 20:30-21:30', professor: 'Prof. Marcos', vagas: 4 },
  ];
}
