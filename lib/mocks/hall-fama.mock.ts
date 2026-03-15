import type { HallOfFameDTO } from '@/lib/api/hall-fama.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

export async function mockGetHallOfFame(_academyId: string): Promise<HallOfFameDTO> {
  await delay();
  return {
    records: [
      {
        id: 'rec-1',
        category: 'streak',
        title: 'Maior sequência de presença',
        holderName: 'Rafael Mendes',
        holderAvatar: null,
        value: '47 dias',
        description: 'Treinou 47 dias consecutivos sem faltar uma única aula',
        achievedAt: '2026-02-28',
        modality: 'BJJ',
      },
      {
        id: 'rec-2',
        category: 'frequency',
        title: 'Mais aulas no mês',
        holderName: 'Rafael Mendes',
        holderAvatar: null,
        value: '22 aulas',
        description: 'Maior número de aulas frequentadas em um único mês',
        achievedAt: '2026-02-28',
        modality: 'BJJ',
      },
      {
        id: 'rec-3',
        category: 'promotion',
        title: 'Promoção mais rápida',
        holderName: 'Ana Carol Souza',
        holderAvatar: null,
        value: '4 meses',
        description: 'Conseguiu a faixa azul em apenas 4 meses de treino dedicado',
        achievedAt: '2026-01-15',
        modality: 'BJJ',
      },
      {
        id: 'rec-4',
        category: 'xp',
        title: 'Maior XP acumulado',
        holderName: 'Carlos Silva',
        holderAvatar: null,
        value: '12.450 XP',
        description: 'Maior pontuação de experiência entre todos os alunos da academia',
        achievedAt: '2026-03-01',
        modality: 'Geral',
      },
      {
        id: 'rec-5',
        category: 'competitions',
        title: 'Mais medalhas em campeonatos',
        holderName: 'Fernanda Lima',
        holderAvatar: null,
        value: '8 medalhas',
        description: '5 ouros, 2 pratas e 1 bronze em campeonatos estaduais e nacionais',
        achievedAt: '2026-03-05',
        modality: 'Judô',
      },
      {
        id: 'rec-6',
        category: 'versatility',
        title: 'Mais modalidades praticadas',
        holderName: 'Marcos Oliveira',
        holderAvatar: null,
        value: '4 modalidades',
        description: 'Treina BJJ, Muay Thai, Judô e Wrestling simultaneamente',
        achievedAt: '2026-02-10',
        modality: 'Multi',
      },
      {
        id: 'rec-7',
        category: 'veteran',
        title: 'Aluno mais antigo',
        holderName: 'Roberto Alves',
        holderAvatar: null,
        value: '6 anos',
        description: 'Aluno mais antigo da academia, desde a inauguração',
        achievedAt: '2020-03-15',
        modality: 'BJJ',
      },
    ],
    updatedAt: '2026-03-15T08:00:00Z',
  };
}
