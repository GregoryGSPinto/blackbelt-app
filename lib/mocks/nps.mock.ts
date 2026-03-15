import type { NPSDataDTO } from '@/lib/api/nps.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const NPS_DATA: NPSDataDTO = {
  nps_score: 72,
  total_responses: 25,
  promoters_count: 18,
  passives_count: 4,
  detractors_count: 3,
  promoters_pct: 72,
  passives_pct: 16,
  detractors_pct: 12,
  distribution: [
    { score: 0, count: 0 },
    { score: 1, count: 1 },
    { score: 2, count: 0 },
    { score: 3, count: 1 },
    { score: 4, count: 0 },
    { score: 5, count: 1 },
    { score: 6, count: 0 },
    { score: 7, count: 2 },
    { score: 8, count: 2 },
    { score: 9, count: 8 },
    { score: 10, count: 10 },
  ],
  feedback: [
    {
      id: 'fb-1',
      respondent_name: 'Joao Mendes',
      score: 10,
      comment: 'Melhor academia da regiao! Professor atencioso e turmas organizadas.',
      created_at: '2026-03-14T10:00:00Z',
      category: 'promoter',
    },
    {
      id: 'fb-2',
      respondent_name: 'Maria Oliveira',
      score: 9,
      comment: 'Adoro o ambiente e a metodologia de ensino. Evolui muito desde que entrei.',
      created_at: '2026-03-13T14:00:00Z',
      category: 'promoter',
    },
    {
      id: 'fb-3',
      respondent_name: 'Rafael Souza',
      score: 7,
      comment: 'Bom, mas poderia ter mais horarios disponiveis.',
      created_at: '2026-03-12T09:00:00Z',
      category: 'passive',
    },
    {
      id: 'fb-4',
      respondent_name: 'Lucas Ferreira',
      score: 10,
      comment: 'Ambiente incrivel! Me sinto em casa. O professor e muito dedicado.',
      created_at: '2026-03-11T16:00:00Z',
      category: 'promoter',
    },
    {
      id: 'fb-5',
      respondent_name: 'Ana Costa',
      score: 3,
      comment: 'Valores altos comparado a concorrencia. Poderiam ter plano familia.',
      created_at: '2026-03-10T11:00:00Z',
      category: 'detractor',
    },
    {
      id: 'fb-6',
      respondent_name: 'Carlos Lima',
      score: 9,
      comment: 'Muito bom! A academia tem otima estrutura e os professores sao excelentes.',
      created_at: '2026-03-09T15:00:00Z',
      category: 'promoter',
    },
    {
      id: 'fb-7',
      respondent_name: 'Patricia Santos',
      score: 8,
      comment: 'Gosto bastante. So acho que o vestiario poderia ser melhor.',
      created_at: '2026-03-08T12:00:00Z',
      category: 'passive',
    },
    {
      id: 'fb-8',
      respondent_name: 'Bruno Alves',
      score: 1,
      comment: 'Tive problemas com o cancelamento do plano. Atendimento dificultou o processo.',
      created_at: '2026-03-07T10:00:00Z',
      category: 'detractor',
    },
    {
      id: 'fb-9',
      respondent_name: 'Fernanda Rocha',
      score: 10,
      comment: 'Excelente! Ja indiquei para varios amigos. O ambiente e acolhedor.',
      created_at: '2026-03-06T14:00:00Z',
      category: 'promoter',
    },
    {
      id: 'fb-10',
      respondent_name: 'Diego Torres',
      score: 9,
      comment: 'Muito satisfeito com a evolucao tecnica. Professor sempre disponivel.',
      created_at: '2026-03-05T09:00:00Z',
      category: 'promoter',
    },
  ],
  trend: [
    { month: 'Out', score: 58 },
    { month: 'Nov', score: 62 },
    { month: 'Dez', score: 65 },
    { month: 'Jan', score: 68 },
    { month: 'Fev', score: 70 },
    { month: 'Mar', score: 72 },
  ],
};

export async function mockGetNPSData(_academyId: string): Promise<NPSDataDTO> {
  await delay();
  return NPS_DATA;
}
