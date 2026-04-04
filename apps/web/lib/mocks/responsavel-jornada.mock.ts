import type { JornadaDependente } from '@/lib/api/responsavel-jornada.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const JORNADAS: Record<string, JornadaDependente> = {
  'stu-sophia': {
    student_id: 'stu-sophia',
    display_name: 'Sophia',
    belt: 'green',
    belt_label: 'Faixa Verde',
    started_at: '2024-08-12',
    total_classes: 187,
    total_days: 582,
    milestones: [
      {
        id: 'jm-01',
        title: 'Primeira Aula',
        description: 'Sophia participou da sua primeira aula de Jiu-Jitsu e adorou!',
        date: '2024-08-12',
        type: 'special',
        emoji: '\u2B50',
      },
      {
        id: 'jm-02',
        title: 'Faixa Cinza Conquistada',
        description: 'Aprovada na avaliacao para Faixa Cinza apos 3 meses de treino.',
        date: '2024-11-20',
        type: 'belt',
        emoji: '\uD83E\uDD4B',
      },
      {
        id: 'jm-03',
        title: 'Streak de 20 Dias',
        description: 'Treinou 20 dias consecutivos sem faltar nenhuma aula.',
        date: '2025-01-15',
        type: 'streak',
        emoji: '\uD83D\uDD25',
      },
      {
        id: 'jm-04',
        title: 'Primeiro Campeonato',
        description: 'Participou do Campeonato Regional Kids e conquistou medalha de bronze.',
        date: '2025-03-08',
        type: 'competition',
        emoji: '\uD83E\uDD49',
      },
      {
        id: 'jm-05',
        title: 'Faixa Amarela Conquistada',
        description: 'Evoluiu para Faixa Amarela com nota maxima na avaliacao tecnica.',
        date: '2025-05-10',
        type: 'belt',
        emoji: '\uD83E\uDD4B',
      },
      {
        id: 'jm-06',
        title: '100 Aulas Completadas',
        description: 'Marco de 100 aulas concluidas na academia. Dedicacao exemplar!',
        date: '2025-07-22',
        type: 'achievement',
        emoji: '\uD83C\uDFC6',
      },
      {
        id: 'jm-07',
        title: 'Campeonato Estadual — Ouro',
        description: 'Conquistou medalha de ouro na categoria Teen no Campeonato Estadual.',
        date: '2025-09-14',
        type: 'competition',
        emoji: '\uD83E\uDD47',
      },
      {
        id: 'jm-08',
        title: 'Faixa Verde Conquistada',
        description: 'Promovida para Faixa Verde pelo Prof. Carlos. Proxima meta: Faixa Azul!',
        date: '2026-02-20',
        type: 'belt',
        emoji: '\uD83E\uDD4B',
      },
      {
        id: 'jm-09',
        title: 'Top 3 no Ranking da Academia',
        description: 'Entrou no Top 3 do ranking geral da academia pela pontuacao acumulada.',
        date: '2026-03-05',
        type: 'achievement',
        emoji: '\uD83C\uDFC5',
      },
      {
        id: 'jm-10',
        title: 'Streak de 10 Dias',
        description: 'Mais uma sequencia de 10 dias consecutivos de treino neste mes.',
        date: '2026-03-12',
        type: 'streak',
        emoji: '\uD83D\uDD25',
      },
    ],
  },
  'stu-miguel': {
    student_id: 'stu-miguel',
    display_name: 'Miguel',
    belt: 'gray',
    belt_label: 'Faixa Cinza',
    started_at: '2025-11-05',
    total_classes: 42,
    total_days: 133,
    milestones: [
      {
        id: 'jm-11',
        title: 'Primeira Aula',
        description: 'Miguel comecou sua jornada no Jiu-Jitsu Kids. Muito animado!',
        date: '2025-11-05',
        type: 'special',
        emoji: '\u2B50',
      },
      {
        id: 'jm-12',
        title: '10 Aulas Completadas',
        description: 'Chegou a marca de 10 aulas. Ja conhece os movimentos basicos.',
        date: '2025-12-02',
        type: 'achievement',
        emoji: '\uD83C\uDF1F',
      },
      {
        id: 'jm-13',
        title: 'Faixa Cinza Conquistada',
        description: 'Aprovado na primeira avaliacao e recebeu a Faixa Cinza!',
        date: '2026-01-10',
        type: 'belt',
        emoji: '\uD83E\uDD4B',
      },
      {
        id: 'jm-14',
        title: 'Streak de 5 Dias',
        description: 'Primeira sequencia de 5 dias consecutivos de treino.',
        date: '2026-01-20',
        type: 'streak',
        emoji: '\uD83D\uDD25',
      },
      {
        id: 'jm-15',
        title: '20 Estrelas Coletadas',
        description: 'Acumulou 20 estrelas no sistema gamificado do perfil Kids.',
        date: '2026-02-15',
        type: 'achievement',
        emoji: '\uD83C\uDF1F',
      },
      {
        id: 'jm-16',
        title: 'Figurinha Rara Desbloqueada',
        description: 'Desbloqueou a figurinha rara "Dragao Dourado" por bom comportamento.',
        date: '2026-03-08',
        type: 'special',
        emoji: '\uD83C\uDF89',
      },
      {
        id: 'jm-17',
        title: 'Primeiro Campeonato Interno',
        description: 'Participou do campeonato interno da academia na categoria Kids.',
        date: '2026-03-15',
        type: 'competition',
        emoji: '\uD83C\uDFC6',
      },
      {
        id: 'jm-18',
        title: '40 Aulas Completadas',
        description: 'Quase na marca de 50 aulas! Continua evoluindo a cada treino.',
        date: '2026-03-16',
        type: 'achievement',
        emoji: '\uD83D\uDCAA',
      },
    ],
  },
};

export async function mockGetJornadaDependente(studentId: string): Promise<JornadaDependente> {
  await delay();
  const jornada = JORNADAS[studentId];
  if (!jornada) {
    return {
      student_id: studentId,
      display_name: 'Aluno',
      belt: 'white',
      belt_label: 'Faixa Branca',
      started_at: '2026-01-01',
      total_classes: 0,
      total_days: 0,
      milestones: [],
    };
  }
  return jornada;
}
