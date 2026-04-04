import type { LiveMatchDTO, CategoryResultDTO, MedalTableEntry, UpdateEvent } from '@/lib/api/championship-live.service';

const delay = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

const LIVE_MATCHES: LiveMatchDTO[] = [
  {
    match_id: 'match-live-1', mat_number: 1, category_label: 'BJJ Branca-Azul Leve Masc',
    fighter_a_name: 'Lucas Ferreira', fighter_b_name: 'Rafael Santos',
    score_a: 4, score_b: 2, elapsed_seconds: 185, status: 'in_progress', winner_name: null, method: null,
  },
  {
    match_id: 'match-live-2', mat_number: 2, category_label: 'BJJ Roxa-Preta Pesado Masc',
    fighter_a_name: 'Gustavo Pereira', fighter_b_name: 'Leandro Silva',
    score_a: 0, score_b: 0, elapsed_seconds: 92, status: 'in_progress', winner_name: null, method: null,
  },
  {
    match_id: 'match-live-3', mat_number: 3, category_label: 'BJJ Branca-Azul Leve Fem',
    fighter_a_name: 'Ana Paula Soares', fighter_b_name: 'Juliana Moreira',
    score_a: 6, score_b: 4, elapsed_seconds: 240, status: 'in_progress', winner_name: null, method: null,
  },
  {
    match_id: 'match-live-4', mat_number: 1, category_label: 'Judô Leve Masc',
    fighter_a_name: 'Roberto Yamamoto', fighter_b_name: 'Carlos Tanaka',
    score_a: 10, score_b: 0, elapsed_seconds: 45, status: 'finished', winner_name: 'Roberto Yamamoto', method: 'Ippon',
  },
];

const CATEGORY_RESULTS: CategoryResultDTO[] = [
  {
    category_id: 'cat-r-1', category_label: 'BJJ Branca-Azul Médio Masc', modality: 'BJJ',
    gold: { athlete_id: 'ath-5', athlete_name: 'Gabriel Almeida', academy: 'Academia Vitória Oeste' },
    silver: { athlete_id: 'ath-6', athlete_name: 'Bruno Lima', academy: 'Team Bushido Moema' },
    bronze: [
      { athlete_id: 'ath-7', athlete_name: 'Thiago Nascimento', academy: 'Equipe Samurai Jardins' },
      { athlete_id: 'ath-8', athlete_name: 'Diego Ribeiro', academy: 'Academia Leão Pinheiros' },
    ],
  },
  {
    category_id: 'cat-r-2', category_label: 'BJJ Roxa-Preta Leve Masc', modality: 'BJJ',
    gold: { athlete_id: 'ath-9', athlete_name: 'Felipe Souza', academy: 'Academia Tatame Centro' },
    silver: { athlete_id: 'ath-10', athlete_name: 'André Martins', academy: 'Team Kime Norte' },
    bronze: [
      { athlete_id: 'ath-11', athlete_name: 'Rodrigo Campos', academy: 'Escola Ippon Sul' },
      { athlete_id: 'ath-12', athlete_name: 'Vinícius Rocha', academy: 'Equipe Dragão Leste' },
    ],
  },
  {
    category_id: 'cat-r-3', category_label: 'BJJ Branca-Azul Leve Fem', modality: 'BJJ',
    gold: { athlete_id: 'ath-17', athlete_name: 'Ana Paula Soares', academy: 'Academia Tatame Centro' },
    silver: { athlete_id: 'ath-19', athlete_name: 'Camila Teixeira', academy: 'Escola Ippon Sul' },
    bronze: [
      { athlete_id: 'ath-18', athlete_name: 'Juliana Moreira', academy: 'Team Kime Norte' },
      { athlete_id: 'ath-20', athlete_name: 'Bianca Araújo', academy: 'Equipe Dragão Leste' },
    ],
  },
  {
    category_id: 'cat-r-4', category_label: 'BJJ Branca-Azul Médio Fem', modality: 'BJJ',
    gold: { athlete_id: 'ath-21', athlete_name: 'Fernanda Cardoso', academy: 'Academia Vitória Oeste' },
    silver: { athlete_id: 'ath-22', athlete_name: 'Patrícia Nunes', academy: 'Team Bushido Moema' },
    bronze: [
      { athlete_id: 'ath-23', athlete_name: 'Isabela Correia', academy: 'Equipe Samurai Jardins' },
      { athlete_id: 'ath-24', athlete_name: 'Letícia Monteiro', academy: 'Academia Leão Pinheiros' },
    ],
  },
  {
    category_id: 'cat-r-5', category_label: 'Judô Leve Masc', modality: 'Judô',
    gold: { athlete_id: 'ath-25', athlete_name: 'Roberto Yamamoto', academy: 'Judô Nippon' },
    silver: { athlete_id: 'ath-26', athlete_name: 'Carlos Tanaka', academy: 'Budokan SP' },
    bronze: [
      { athlete_id: 'ath-27', athlete_name: 'Marcos Fujimoto', academy: 'Kodokan Brasil' },
      { athlete_id: 'ath-28', athlete_name: 'Daniel Watanabe', academy: 'Judô Nippon' },
    ],
  },
  {
    category_id: 'cat-r-6', category_label: 'Judô Médio Masc', modality: 'Judô',
    gold: { athlete_id: 'ath-29', athlete_name: 'Paulo Takahashi', academy: 'Budokan SP' },
    silver: { athlete_id: 'ath-30', athlete_name: 'Ricardo Morimoto', academy: 'Kodokan Brasil' },
    bronze: [
      { athlete_id: 'ath-31', athlete_name: 'Alexandre Nakamura', academy: 'Judô Nippon' },
      { athlete_id: 'ath-32', athlete_name: 'João Sato', academy: 'Budokan SP' },
    ],
  },
  {
    category_id: 'cat-r-7', category_label: 'BJJ Roxa-Preta Pesado Masc', modality: 'BJJ',
    gold: { athlete_id: 'ath-13', athlete_name: 'Gustavo Pereira', academy: 'Academia Vitória Oeste' },
    silver: { athlete_id: 'ath-14', athlete_name: 'Leandro Silva', academy: 'Team Bushido Moema' },
    bronze: [
      { athlete_id: 'ath-15', athlete_name: 'Marcelo Barbosa', academy: 'Equipe Samurai Jardins' },
      { athlete_id: 'ath-16', athlete_name: 'Eduardo Mendes', academy: 'Academia Leão Pinheiros' },
    ],
  },
  {
    category_id: 'cat-r-8', category_label: 'BJJ Branca-Azul Leve Masc', modality: 'BJJ',
    gold: { athlete_id: 'ath-1', athlete_name: 'Lucas Ferreira', academy: 'Academia Tatame Centro' },
    silver: { athlete_id: 'ath-2', athlete_name: 'Rafael Santos', academy: 'Team Kime Norte' },
    bronze: [
      { athlete_id: 'ath-3', athlete_name: 'Pedro Oliveira', academy: 'Escola Ippon Sul' },
      { athlete_id: 'ath-4', athlete_name: 'Matheus Costa', academy: 'Equipe Dragão Leste' },
    ],
  },
];

const MEDAL_TABLE: MedalTableEntry[] = [
  { academy_id: 'ac-1', academy_name: 'Academia Tatame Centro', gold: 3, silver: 0, bronze: 1, total: 4 },
  { academy_id: 'ac-5', academy_name: 'Academia Vitória Oeste', gold: 2, silver: 0, bronze: 0, total: 2 },
  { academy_id: 'ac-jn', academy_name: 'Judô Nippon', gold: 1, silver: 0, bronze: 3, total: 4 },
  { academy_id: 'ac-bs', academy_name: 'Budokan SP', gold: 1, silver: 1, bronze: 1, total: 3 },
  { academy_id: 'ac-2', academy_name: 'Team Kime Norte', gold: 0, silver: 2, bronze: 1, total: 3 },
  { academy_id: 'ac-7', academy_name: 'Team Bushido Moema', gold: 0, silver: 2, bronze: 0, total: 2 },
  { academy_id: 'ac-3', academy_name: 'Escola Ippon Sul', gold: 0, silver: 1, bronze: 2, total: 3 },
  { academy_id: 'ac-4', academy_name: 'Equipe Dragão Leste', gold: 0, silver: 0, bronze: 2, total: 2 },
  { academy_id: 'ac-6', academy_name: 'Equipe Samurai Jardins', gold: 0, silver: 0, bronze: 2, total: 2 },
  { academy_id: 'ac-8', academy_name: 'Academia Leão Pinheiros', gold: 0, silver: 0, bronze: 2, total: 2 },
  { academy_id: 'ac-kb', academy_name: 'Kodokan Brasil', gold: 0, silver: 1, bronze: 1, total: 2 },
  { academy_id: 'ac-nu2', academy_name: 'Academia Vitória Recife', gold: 1, silver: 0, bronze: 0, total: 1 },
];

export async function mockGetLiveMatches(_championshipId: string): Promise<LiveMatchDTO[]> {
  await delay();
  return LIVE_MATCHES.map((m) => ({ ...m }));
}

export async function mockGetResults(_championshipId: string, categoryId?: string): Promise<CategoryResultDTO[]> {
  await delay();
  if (categoryId) {
    return CATEGORY_RESULTS.filter((r) => r.category_id === categoryId).map((r) => ({ ...r }));
  }
  return CATEGORY_RESULTS.map((r) => ({ ...r }));
}

export async function mockGetMedalTable(_championshipId: string): Promise<MedalTableEntry[]> {
  await delay();
  return MEDAL_TABLE.map((e) => ({ ...e }));
}

export function mockSubscribeToUpdates(_championshipId: string, callback: (event: UpdateEvent) => void): () => void {
  const interval = setInterval(() => {
    const match = LIVE_MATCHES.find((m) => m.status === 'in_progress');
    if (match) {
      match.elapsed_seconds += 5;
      if (Math.random() > 0.7) {
        match.score_a += Math.random() > 0.5 ? 2 : 0;
        match.score_b += Math.random() > 0.5 ? 2 : 0;
      }
      callback({ type: 'match_update', payload: { ...match } });
    }
  }, 5000);
  return () => clearInterval(interval);
}
