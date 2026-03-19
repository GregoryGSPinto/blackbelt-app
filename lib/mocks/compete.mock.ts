import type {
  Tournament,
  TournamentCircuit,
  TournamentCategory,
  TournamentRegistration,
  TournamentBracket,
  TournamentMatch,
  AthleteProfile,
  AcademyTournamentStats,
  TournamentFeedItem,
  TournamentPrediction,
  TournamentFilters,
  CategoryFilters,
  RegistrationFilters,
  MatchResult,
  MedalTable,
  TournamentStats,
  MatchMethod,
  SocialCardType,
  Sponsor,
} from '@/lib/types/compete';
import { BeltLevel } from '@/lib/types/domain';

// ── Constants ───────────────────────────────────────────────
const T_ID = 'trn-copa-bh-2026';
const T_SLUG = 'copa-blackbelt-bh-2026';
const CIRCUIT_ID = 'circuit-mg-2026';
const NOW = '2026-04-15T18:00:00Z';

interface AcademyDef { id: string; name: string; athletes: number }

const ACADEMIES: AcademyDef[] = [
  { id: 'acad-1', name: 'Guerreiros BJJ', athletes: 12 },
  { id: 'acad-2', name: 'Alliance BH', athletes: 10 },
  { id: 'acad-3', name: 'Gracie Barra BH', athletes: 8 },
  { id: 'acad-4', name: 'Atos BH', athletes: 6 },
  { id: 'acad-5', name: 'Nova União MG', athletes: 6 },
  { id: 'acad-6', name: 'CheckMat BH', athletes: 5 },
  { id: 'acad-7', name: 'GFTeam MG', athletes: 5 },
  { id: 'acad-8', name: 'Dream Art MG', athletes: 4 },
  { id: 'acad-9', name: 'Carlson Gracie BH', athletes: 4 },
  { id: 'acad-10', name: 'Ryan Gracie BH', athletes: 4 },
  { id: 'acad-11', name: 'Ribeiro JJ BH', athletes: 4 },
  { id: 'acad-12', name: 'Soul Fighters MG', athletes: 3 },
  { id: 'acad-13', name: 'ZR Team BH', athletes: 3 },
  { id: 'acad-14', name: 'De La Riva BH', athletes: 3 },
  { id: 'acad-15', name: 'Cicero Costha BH', athletes: 3 },
  { id: 'acad-16', name: 'BTT BH', athletes: 3 },
  { id: 'acad-17', name: 'Infight MG', athletes: 3 },
  { id: 'acad-18', name: 'Caio Terra BH', athletes: 3 },
  { id: 'acad-19', name: 'Unity BH', athletes: 2 },
  { id: 'acad-20', name: 'Ns Brotherhood BH', athletes: 2 },
  { id: 'acad-21', name: 'Fight Sports MG', athletes: 2 },
  { id: 'acad-22', name: 'Barbosa JJ BH', athletes: 2 },
  { id: 'acad-23', name: 'Lotus Club MG', athletes: 2 },
  { id: 'acad-24', name: 'Gordo JJ BH', athletes: 2 },
  { id: 'acad-25', name: 'Kimura BJJ MG', athletes: 2 },
];

const MOCK_SPONSORS: Sponsor[] = [
  { id: 'sp-1', name: 'BlackBelt Pro', logo_url: '/images/sponsors/blackbelt.png', website_url: 'https://blackbelt.com', tier: 'gold' },
  { id: 'sp-2', name: 'Fight Gear', logo_url: '/images/sponsors/fightgear.png', website_url: null, tier: 'silver' },
];

// ── Tournaments ─────────────────────────────────────────────

export const MOCK_TOURNAMENT: Tournament = {
  id: T_ID,
  academy_id: 'acad-1',
  circuit_id: CIRCUIT_ID,
  name: 'Copa BlackBelt BH 2026',
  slug: T_SLUG,
  description: 'O maior campeonato de Jiu-Jitsu de Belo Horizonte. Atletas de todo o estado competindo em diversas categorias.',
  banner_url: '/images/tournaments/copa-blackbelt-bh.jpg',
  location: 'Ginásio Poliesportivo de BH',
  address: 'Av. Augusto de Lima, 2000 - Barro Preto',
  city: 'Belo Horizonte',
  state: 'MG',
  start_date: '2026-04-15',
  end_date: '2026-04-16',
  registration_deadline: '2026-04-10',
  modalities: ['BJJ'],
  status: 'completed',
  rules_url: null,
  max_athletes: 200,
  registration_fee: 100,
  areas_count: 4,
  organizer_id: 'org-1',
  organizer_name: 'Organização Copa BlackBelt',
  sponsors: MOCK_SPONSORS,
  approved_at: '2026-03-01T12:00:00Z',
  approved_by: 'superadmin-1',
  rejection_reason: null,
  created_at: '2026-02-15T10:00:00Z',
  updated_at: NOW,
};

const MOCK_TOURNAMENT_UPCOMING: Tournament = {
  ...MOCK_TOURNAMENT,
  id: 'trn-etapa2-mg',
  name: 'Copa BlackBelt Uberlândia 2026',
  slug: 'copa-blackbelt-uberlandia-2026',
  start_date: '2026-06-20',
  end_date: '2026-06-21',
  location: 'Ginásio Sabiazinho',
  city: 'Uberlândia',
  status: 'registration_open',
  approved_at: '2026-05-01T12:00:00Z',
  created_at: '2026-04-20T10:00:00Z',
  updated_at: '2026-05-01T12:00:00Z',
};

const MOCK_TOURNAMENT_PENDING: Tournament = {
  ...MOCK_TOURNAMENT,
  id: 'trn-pending-1',
  name: 'Copa Titans MMA 2026',
  slug: 'copa-titans-mma-2026',
  start_date: '2026-08-10',
  end_date: '2026-08-11',
  location: 'Arena MMA',
  city: 'São Paulo',
  state: 'SP',
  status: 'aguardando_aprovacao',
  approved_at: null,
  approved_by: null,
  rejection_reason: null,
  created_at: '2026-03-18T10:00:00Z',
  updated_at: '2026-03-18T10:00:00Z',
};

// ── Circuit ─────────────────────────────────────────────────

export const MOCK_CIRCUIT: TournamentCircuit = {
  id: CIRCUIT_ID,
  name: 'Circuito BlackBelt MG 2026',
  slug: 'circuito-blackbelt-mg-2026',
  description: 'Série de 4 etapas de Jiu-Jitsu em Minas Gerais ao longo de 2026.',
  season: '2026',
  logo_url: '/images/circuits/circuito-mg.png',
  tournament_ids: [T_ID, 'trn-etapa2-mg'],
  created_at: '2026-01-10T10:00:00Z',
  updated_at: NOW,
};

// ── Categories ──────────────────────────────────────────────

export const MOCK_CATEGORIES: TournamentCategory[] = [
  { id: 'cat-1', tournament_id: T_ID, name: 'Branca Galo Masc', modality: 'BJJ', gender: 'male', age_min: 18, age_max: 99, weight_min: null, weight_max: 57.5, belt_min: BeltLevel.White, belt_max: BeltLevel.White, bracket_type: 'single_elimination', match_duration_seconds: 300, registered_count: 8, max_athletes: null, created_at: '2026-03-01T12:00:00Z', updated_at: '2026-03-01T12:00:00Z' },
  { id: 'cat-2', tournament_id: T_ID, name: 'Branca Leve Masc', modality: 'BJJ', gender: 'male', age_min: 18, age_max: 99, weight_min: 57.6, weight_max: 76, belt_min: BeltLevel.White, belt_max: BeltLevel.White, bracket_type: 'single_elimination', match_duration_seconds: 300, registered_count: 12, max_athletes: null, created_at: '2026-03-01T12:00:00Z', updated_at: '2026-03-01T12:00:00Z' },
  { id: 'cat-3', tournament_id: T_ID, name: 'Azul Pena Masc', modality: 'BJJ', gender: 'male', age_min: 18, age_max: 99, weight_min: null, weight_max: 70, belt_min: BeltLevel.Blue, belt_max: BeltLevel.Blue, bracket_type: 'single_elimination', match_duration_seconds: 360, registered_count: 10, max_athletes: null, created_at: '2026-03-01T12:00:00Z', updated_at: '2026-03-01T12:00:00Z' },
  { id: 'cat-4', tournament_id: T_ID, name: 'Azul Médio Masc', modality: 'BJJ', gender: 'male', age_min: 18, age_max: 99, weight_min: 70.1, weight_max: 82, belt_min: BeltLevel.Blue, belt_max: BeltLevel.Blue, bracket_type: 'single_elimination', match_duration_seconds: 360, registered_count: 10, max_athletes: null, created_at: '2026-03-01T12:00:00Z', updated_at: '2026-03-01T12:00:00Z' },
  { id: 'cat-5', tournament_id: T_ID, name: 'Roxa Leve Masc', modality: 'BJJ', gender: 'male', age_min: 18, age_max: 99, weight_min: null, weight_max: 76, belt_min: BeltLevel.Purple, belt_max: BeltLevel.Purple, bracket_type: 'single_elimination', match_duration_seconds: 420, registered_count: 8, max_athletes: null, created_at: '2026-03-01T12:00:00Z', updated_at: '2026-03-01T12:00:00Z' },
  { id: 'cat-6', tournament_id: T_ID, name: 'Roxa Pesado Masc', modality: 'BJJ', gender: 'male', age_min: 18, age_max: 99, weight_min: 82.1, weight_max: 94, belt_min: BeltLevel.Purple, belt_max: BeltLevel.Purple, bracket_type: 'single_elimination', match_duration_seconds: 420, registered_count: 8, max_athletes: null, created_at: '2026-03-01T12:00:00Z', updated_at: '2026-03-01T12:00:00Z' },
  { id: 'cat-7', tournament_id: T_ID, name: 'Marrom/Preta Leve Masc', modality: 'BJJ', gender: 'male', age_min: 18, age_max: 99, weight_min: null, weight_max: 76, belt_min: BeltLevel.Brown, belt_max: BeltLevel.Black, bracket_type: 'single_elimination', match_duration_seconds: 480, registered_count: 8, max_athletes: null, created_at: '2026-03-01T12:00:00Z', updated_at: '2026-03-01T12:00:00Z' },
  { id: 'cat-8', tournament_id: T_ID, name: 'Preta Absoluto Masc', modality: 'BJJ', gender: 'male', age_min: 18, age_max: 99, weight_min: null, weight_max: null, belt_min: BeltLevel.Black, belt_max: BeltLevel.Black, bracket_type: 'single_elimination', match_duration_seconds: 600, registered_count: 8, max_athletes: null, created_at: '2026-03-01T12:00:00Z', updated_at: '2026-03-01T12:00:00Z' },
  { id: 'cat-9', tournament_id: T_ID, name: 'Branca Leve Fem', modality: 'BJJ', gender: 'female', age_min: 18, age_max: 99, weight_min: null, weight_max: 64, belt_min: BeltLevel.White, belt_max: BeltLevel.White, bracket_type: 'single_elimination', match_duration_seconds: 300, registered_count: 8, max_athletes: null, created_at: '2026-03-01T12:00:00Z', updated_at: '2026-03-01T12:00:00Z' },
  { id: 'cat-10', tournament_id: T_ID, name: 'Azul Médio Fem', modality: 'BJJ', gender: 'female', age_min: 18, age_max: 99, weight_min: 64.1, weight_max: 74, belt_min: BeltLevel.Blue, belt_max: BeltLevel.Blue, bracket_type: 'single_elimination', match_duration_seconds: 360, registered_count: 8, max_athletes: null, created_at: '2026-03-01T12:00:00Z', updated_at: '2026-03-01T12:00:00Z' },
  { id: 'cat-11', tournament_id: T_ID, name: 'Juvenil Branca Leve Masc', modality: 'BJJ', gender: 'male', age_min: 16, age_max: 17, weight_min: null, weight_max: 66, belt_min: BeltLevel.White, belt_max: BeltLevel.White, bracket_type: 'single_elimination', match_duration_seconds: 300, registered_count: 8, max_athletes: null, created_at: '2026-03-01T12:00:00Z', updated_at: '2026-03-01T12:00:00Z' },
  { id: 'cat-12', tournament_id: T_ID, name: 'Master Azul Pesado Masc', modality: 'BJJ', gender: 'male', age_min: 30, age_max: 99, weight_min: 82.1, weight_max: 94, belt_min: BeltLevel.Blue, belt_max: BeltLevel.Blue, bracket_type: 'single_elimination', match_duration_seconds: 300, registered_count: 8, max_athletes: null, created_at: '2026-03-01T12:00:00Z', updated_at: '2026-03-01T12:00:00Z' },
];

// ── Fighters (8 per category) ───────────────────────────────

interface FighterDef { id: string; name: string; academyIdx: number }
const CF: Record<string, FighterDef[]> = {
  'cat-1': [{id:'f-1',name:'Lucas Mendes',academyIdx:0},{id:'f-2',name:'Rafael Gomes',academyIdx:1},{id:'f-3',name:'Pedro Alves',academyIdx:2},{id:'f-4',name:'Matheus Dias',academyIdx:3},{id:'f-5',name:'Bruno Cardoso',academyIdx:4},{id:'f-6',name:'Thiago Reis',academyIdx:5},{id:'f-7',name:'Diego Nunes',academyIdx:6},{id:'f-8',name:'Vitor Prado',academyIdx:7}],
  'cat-2': [{id:'f-9',name:'Gabriel Santos',academyIdx:0},{id:'f-10',name:'André Ribeiro',academyIdx:1},{id:'f-11',name:'Caio Lopes',academyIdx:2},{id:'f-12',name:'Felipe Rocha',academyIdx:3},{id:'f-13',name:'Marcos Vieira',academyIdx:8},{id:'f-14',name:'Luan Costa',academyIdx:9},{id:'f-15',name:'Henrique Melo',academyIdx:10},{id:'f-16',name:'Igor Barros',academyIdx:11}],
  'cat-3': [{id:'f-17',name:'Rodrigo Campos',academyIdx:0},{id:'f-18',name:'Vinícius Rocha',academyIdx:1},{id:'f-19',name:'Gustavo Pereira',academyIdx:2},{id:'f-20',name:'Leandro Silva',academyIdx:4},{id:'f-21',name:'Marcelo Barbosa',academyIdx:5},{id:'f-22',name:'Eduardo Lima',academyIdx:12},{id:'f-23',name:'Fernando Souza',academyIdx:13},{id:'f-24',name:'Ricardo Ramos',academyIdx:14}],
  'cat-4': [{id:'f-25',name:'Paulo Freitas',academyIdx:0},{id:'f-26',name:'Tiago Moreira',academyIdx:1},{id:'f-27',name:'Danilo Oliveira',academyIdx:3},{id:'f-28',name:'Renato Cruz',academyIdx:6},{id:'f-29',name:'Samuel Teixeira',academyIdx:7},{id:'f-30',name:'Otávio Martins',academyIdx:15},{id:'f-31',name:'Alex Cunha',academyIdx:16},{id:'f-32',name:'Fábio Duarte',academyIdx:17}],
  'cat-5': [{id:'f-33',name:'Roberto Cyborg',academyIdx:0},{id:'f-34',name:'Anderson Pires',academyIdx:2},{id:'f-35',name:'Jonas Batista',academyIdx:4},{id:'f-36',name:'William Cardozo',academyIdx:1},{id:'f-37',name:'Cristiano Faria',academyIdx:8},{id:'f-38',name:'Renan Tavares',academyIdx:18},{id:'f-39',name:'Murilo Pinto',academyIdx:19},{id:'f-40',name:'Júlio Araújo',academyIdx:20}],
  'cat-6': [{id:'f-41',name:'Cássio Monteiro',academyIdx:0},{id:'f-42',name:'Douglas Rangel',academyIdx:1},{id:'f-43',name:'Adriano Machado',academyIdx:3},{id:'f-44',name:'Luciano Braga',academyIdx:5},{id:'f-45',name:'Márcio Neves',academyIdx:9},{id:'f-46',name:'Sandro Ferraz',academyIdx:10},{id:'f-47',name:'Nelson Assis',academyIdx:21},{id:'f-48',name:'Elias Moura',academyIdx:22}],
  'cat-7': [{id:'f-49',name:'Wagner Telles',academyIdx:0},{id:'f-50',name:'Carlos Alberto',academyIdx:2},{id:'f-51',name:'Sérgio Maia',academyIdx:1},{id:'f-52',name:'Bernardo Queiroz',academyIdx:6},{id:'f-53',name:'Antônio Lacerda',academyIdx:11},{id:'f-54',name:'Rogério Guedes',academyIdx:14},{id:'f-55',name:'Emerson Vale',academyIdx:23},{id:'f-56',name:'Valter Resende',academyIdx:24}],
  'cat-8': [{id:'f-57',name:'Marcos Souza',academyIdx:0},{id:'f-58',name:'Kleber Nogueira',academyIdx:1},{id:'f-59',name:'Jefferson Brito',academyIdx:2},{id:'f-60',name:'Edson Marques',academyIdx:4},{id:'f-61',name:'Alessandro Fonseca',academyIdx:7},{id:'f-62',name:'Ronaldo Paiva',academyIdx:3},{id:'f-63',name:'Cleber Maciel',academyIdx:12},{id:'f-64',name:'Norberto Leal',academyIdx:15}],
  'cat-9': [{id:'f-65',name:'Ana Paula Soares',academyIdx:0},{id:'f-66',name:'Bruna Oliveira',academyIdx:1},{id:'f-67',name:'Camila Santos',academyIdx:2},{id:'f-68',name:'Daniela Ferreira',academyIdx:3},{id:'f-69',name:'Elaine Rodrigues',academyIdx:5},{id:'f-70',name:'Fernanda Lima',academyIdx:8},{id:'f-71',name:'Gisele Moreira',academyIdx:13},{id:'f-72',name:'Helena Teixeira',academyIdx:16}],
  'cat-10': [{id:'f-73',name:'Isabela Mendes',academyIdx:0},{id:'f-74',name:'Juliana Alves',academyIdx:1},{id:'f-75',name:'Karen Ribeiro',academyIdx:4},{id:'f-76',name:'Larissa Costa',academyIdx:6},{id:'f-77',name:'Marina Lopes',academyIdx:10},{id:'f-78',name:'Natália Gomes',academyIdx:17},{id:'f-79',name:'Olívia Dias',academyIdx:19},{id:'f-80',name:'Patrícia Nunes',academyIdx:22}],
  'cat-11': [{id:'f-81',name:'Cauã Silva',academyIdx:0},{id:'f-82',name:'Davi Martins',academyIdx:1},{id:'f-83',name:'Enzo Pereira',academyIdx:2},{id:'f-84',name:'Guilherme Rocha',academyIdx:4},{id:'f-85',name:'João Pedro Costa',academyIdx:7},{id:'f-86',name:'Lucas Barros',academyIdx:9},{id:'f-87',name:'Miguel Souza',academyIdx:15},{id:'f-88',name:'Nicolas Reis',academyIdx:20}],
  'cat-12': [{id:'f-89',name:'André Fonseca',academyIdx:0},{id:'f-90',name:'Carlos Medeiros',academyIdx:2},{id:'f-91',name:'Fábio Nogueira',academyIdx:3},{id:'f-92',name:'Jorge Lacerda',academyIdx:5},{id:'f-93',name:'Márcio Teixeira',academyIdx:11},{id:'f-94',name:'Paulo Queiroz',academyIdx:14},{id:'f-95',name:'Ricardo Maia',academyIdx:18},{id:'f-96',name:'Sérgio Vale',academyIdx:21}],
};

const METHODS: MatchMethod[] = ['submissao', 'pontos', 'pontos', 'submissao', 'pontos', 'submissao', 'pontos'];

// ── Build Bracket Matches ───────────────────────────────────

function buildBracketMatches(catId: string, bracketId: string): TournamentMatch[] {
  const fighters = CF[catId];
  if (!fighters) return [];
  const matches: TournamentMatch[] = [];
  const bt = new Date('2026-04-15T09:00:00Z');
  const catName = MOCK_CATEGORIES.find(c => c.id === catId)?.name ?? '';

  // Round 1 — 4 matches
  const r1W: FighterDef[] = [];
  for (let i = 0; i < 4; i++) {
    const fa = fighters[i * 2], fb = fighters[i * 2 + 1];
    const w = i % 2 === 0 ? fa : fb;
    r1W.push(w);
    const m = METHODS[i % METHODS.length];
    const sA = m === 'pontos' ? (w.id === fa.id ? 6 : 2) : 0;
    const sB = m === 'pontos' ? (w.id === fb.id ? 6 : 2) : 0;
    const time = new Date(bt.getTime() + i * 15 * 60000);
    matches.push({
      id: `${catId}-r1-${i + 1}`, bracket_id: bracketId, tournament_id: T_ID, category_id: catId, category_name: catName,
      round: 1, match_number: i + 1, area: (i % 4) + 1, scheduled_time: time.toISOString(),
      athlete1_id: fa.id, athlete1_name: fa.name, athlete1_academy: ACADEMIES[fa.academyIdx].name,
      athlete2_id: fb.id, athlete2_name: fb.name, athlete2_academy: ACADEMIES[fb.academyIdx].name,
      winner_id: w.id, loser_id: w.id === fa.id ? fb.id : fa.id, method: m,
      score_athlete1: sA, score_athlete2: sB,
      penalties_athlete1: 0, penalties_athlete2: 0,
      advantages_athlete1: m === 'pontos' ? 2 : 0, advantages_athlete2: m === 'pontos' ? 1 : 0,
      duration_seconds: 180 + i * 30, status: 'completed', next_match_id: `${catId}-r2-${Math.floor(i / 2) + 1}`,
      started_at: time.toISOString(), completed_at: new Date(time.getTime() + (180 + i * 30) * 1000).toISOString(),
      created_at: '2026-04-14T12:00:00Z', updated_at: '2026-04-15T12:00:00Z',
    });
  }

  // Round 2 — 2 matches
  const r2W: FighterDef[] = [];
  for (let i = 0; i < 2; i++) {
    const fa = r1W[i * 2], fb = r1W[i * 2 + 1];
    const w = fa;
    r2W.push(w);
    const m: MatchMethod = i === 0 ? 'pontos' : 'submissao';
    const time = new Date(bt.getTime() + (4 + i) * 20 * 60000);
    matches.push({
      id: `${catId}-r2-${i + 1}`, bracket_id: bracketId, tournament_id: T_ID, category_id: catId, category_name: catName,
      round: 2, match_number: i + 1, area: 1, scheduled_time: time.toISOString(),
      athlete1_id: fa.id, athlete1_name: fa.name, athlete1_academy: ACADEMIES[fa.academyIdx].name,
      athlete2_id: fb.id, athlete2_name: fb.name, athlete2_academy: ACADEMIES[fb.academyIdx].name,
      winner_id: w.id, loser_id: fb.id, method: m,
      score_athlete1: m === 'pontos' ? 4 : 0, score_athlete2: m === 'pontos' ? 2 : 0,
      advantages_athlete1: 2, advantages_athlete2: 0, penalties_athlete1: 0, penalties_athlete2: 0,
      duration_seconds: 240 + i * 60, status: 'completed', next_match_id: `${catId}-final`,
      started_at: time.toISOString(), completed_at: new Date(time.getTime() + (240 + i * 60) * 1000).toISOString(),
      created_at: '2026-04-14T12:00:00Z', updated_at: '2026-04-15T14:00:00Z',
    });
  }

  // Final
  const fa = r2W[0], fb = r2W[1];
  const finalTime = new Date(bt.getTime() + 6 * 25 * 60000);
  matches.push({
    id: `${catId}-final`, bracket_id: bracketId, tournament_id: T_ID, category_id: catId, category_name: catName,
    round: 3, match_number: 1, area: 1, scheduled_time: finalTime.toISOString(),
    athlete1_id: fa.id, athlete1_name: fa.name, athlete1_academy: ACADEMIES[fa.academyIdx].name,
    athlete2_id: fb.id, athlete2_name: fb.name, athlete2_academy: ACADEMIES[fb.academyIdx].name,
    winner_id: fa.id, loser_id: fb.id, method: 'pontos',
    score_athlete1: 8, score_athlete2: 4, advantages_athlete1: 3, advantages_athlete2: 1,
    penalties_athlete1: 0, penalties_athlete2: 0,
    duration_seconds: 360, status: 'completed', next_match_id: null,
    started_at: finalTime.toISOString(), completed_at: new Date(finalTime.getTime() + 360 * 1000).toISOString(),
    created_at: '2026-04-14T12:00:00Z', updated_at: '2026-04-16T17:00:00Z',
  });

  return matches;
}

// ── Brackets + Matches ──────────────────────────────────────

export const MOCK_BRACKETS: (TournamentBracket & { _matches: TournamentMatch[] })[] = MOCK_CATEGORIES.map((cat) => {
  const bid = `bracket-${cat.id}`;
  const ms = buildBracketMatches(cat.id, bid);
  return {
    id: bid, category_id: cat.id, tournament_id: T_ID,
    bracket_type: 'single_elimination' as const, rounds_count: 3, current_round: 3, is_complete: true,
    created_at: '2026-04-14T12:00:00Z', updated_at: '2026-04-16T18:00:00Z',
    _matches: ms,
  };
});

const ALL_MATCHES: TournamentMatch[] = MOCK_BRACKETS.flatMap(b => b._matches);

// ── Registrations ───────────────────────────────────────────


export const MOCK_REGISTRATIONS: TournamentRegistration[] = Object.entries(CF).flatMap(([catId, fighters]) =>
  fighters.map((f, i) => ({
    id: `reg-${f.id}`, tournament_id: T_ID, category_id: catId,
    athlete_profile_id: `ap-${f.id}`, academy_id: ACADEMIES[f.academyIdx].id,
    athlete_name: f.name, academy_name: ACADEMIES[f.academyIdx].name,
    weight: 70 + i * 2, seed: i + 1,
    status: 'weighed_in' as const, payment_status: 'paid' as const,
    payment_amount: 100, payment_method: 'pix', payment_reference: `PIX-${f.id}`,
    checked_in_at: '2026-04-15T07:00:00Z', weighed_in_at: '2026-04-15T07:30:00Z', weigh_in_weight: 70 + i * 2,
    created_at: '2026-03-20T10:00:00Z', updated_at: '2026-04-15T07:30:00Z',
  })),
);

// ── Medal Table ─────────────────────────────────────────────

export const MOCK_MEDAL_TABLE: MedalTable[] = [
  { academy_id: 'acad-1', academy_name: 'Guerreiros BJJ', academy_logo_url: null, gold: 4, silver: 2, bronze: 3, total: 9, ranking_position: 1 },
  { academy_id: 'acad-2', academy_name: 'Alliance BH', academy_logo_url: null, gold: 3, silver: 3, bronze: 2, total: 8, ranking_position: 2 },
  { academy_id: 'acad-3', academy_name: 'Gracie Barra BH', academy_logo_url: null, gold: 2, silver: 2, bronze: 4, total: 8, ranking_position: 3 },
  { academy_id: 'acad-4', academy_name: 'Atos BH', academy_logo_url: null, gold: 1, silver: 2, bronze: 1, total: 4, ranking_position: 4 },
  { academy_id: 'acad-5', academy_name: 'Nova União MG', academy_logo_url: null, gold: 1, silver: 1, bronze: 2, total: 4, ranking_position: 5 },
  { academy_id: 'acad-6', academy_name: 'CheckMat BH', academy_logo_url: null, gold: 1, silver: 1, bronze: 0, total: 2, ranking_position: 6 },
  { academy_id: 'acad-7', academy_name: 'GFTeam MG', academy_logo_url: null, gold: 0, silver: 1, bronze: 2, total: 3, ranking_position: 7 },
  { academy_id: 'acad-8', academy_name: 'Dream Art MG', academy_logo_url: null, gold: 0, silver: 0, bronze: 2, total: 2, ranking_position: 8 },
];

// ── Academy Stats ───────────────────────────────────────────

export const MOCK_ACADEMY_STATS: AcademyTournamentStats[] = MOCK_MEDAL_TABLE.map((m, i) => ({
  id: `ats-${m.academy_id}`, academy_id: m.academy_id, academy_name: m.academy_name, academy_logo_url: null,
  circuit_id: CIRCUIT_ID, tournaments_participated: 1,
  total_athletes: ACADEMIES[i]?.athletes ?? 3,
  medals_gold: m.gold, medals_silver: m.silver, medals_bronze: m.bronze,
  total_points: m.gold * 5 + m.silver * 3 + m.bronze * 1, ranking_position: m.ranking_position,
  created_at: NOW, updated_at: NOW,
}));

// ── Feed ────────────────────────────────────────────────────

export const MOCK_FEED: TournamentFeedItem[] = [
  { id: 'feed-1', tournament_id: T_ID, type: 'medal', title: 'Quadro geral de medalhas finalizado!', content: 'Guerreiros BJJ lidera com 4 ouros, 2 pratas e 3 bronzes.', image_url: null, match_id: null, category_name: null, author_name: 'Organização', created_at: '2026-04-16T18:00:00Z' },
  { id: 'feed-2', tournament_id: T_ID, type: 'result', title: 'Final Preta Absoluto: Marcos Souza campeão!', content: 'Marcos Souza (Guerreiros) vence por 8x4 nos pontos.', image_url: null, match_id: 'cat-8-final', category_name: 'Preta Absoluto Masc', author_name: null, created_at: '2026-04-16T17:30:00Z' },
  { id: 'feed-3', tournament_id: T_ID, type: 'result', title: 'Final Marrom/Preta Leve: Wagner Telles ouro!', content: 'Wagner Telles (Guerreiros) domina a final por pontos.', image_url: null, match_id: 'cat-7-final', category_name: 'Marrom/Preta Leve Masc', author_name: null, created_at: '2026-04-16T16:45:00Z' },
  { id: 'feed-4', tournament_id: T_ID, type: 'photo', title: 'Pódio Azul Pena Masculino', content: '', image_url: '/images/feed/podio-azul-pena.jpg', match_id: null, category_name: 'Azul Pena Masc', author_name: 'Organização', created_at: '2026-04-16T16:00:00Z' },
  { id: 'feed-5', tournament_id: T_ID, type: 'result', title: 'Final Roxa Pesado: Cássio Monteiro campeão!', content: 'Cássio (Guerreiros) finaliza com Triângulo em 3min.', image_url: null, match_id: 'cat-6-final', category_name: 'Roxa Pesado Masc', author_name: null, created_at: '2026-04-16T15:30:00Z' },
  { id: 'feed-6', tournament_id: T_ID, type: 'announcement', title: 'Intervalo para almoço', content: 'Lutas retornam às 13h30. Aproveitem a praça de alimentação.', image_url: null, match_id: null, category_name: null, author_name: 'Organização', created_at: '2026-04-15T12:00:00Z' },
  { id: 'feed-7', tournament_id: T_ID, type: 'result', title: 'Branca Galo: Lucas Mendes ouro!', content: 'Lucas Mendes (Guerreiros) vence final por 8x4.', image_url: null, match_id: 'cat-1-final', category_name: 'Branca Galo Masc', author_name: null, created_at: '2026-04-15T11:30:00Z' },
  { id: 'feed-8', tournament_id: T_ID, type: 'photo', title: 'Público lotando o ginásio!', content: '', image_url: '/images/feed/publico-ginasio.jpg', match_id: null, category_name: null, author_name: 'Organização', created_at: '2026-04-15T10:30:00Z' },
  { id: 'feed-9', tournament_id: T_ID, type: 'announcement', title: 'Copa BlackBelt BH 2026 começou!', content: 'Bem-vindos! 120 atletas, 25 academias, 12 categorias. Oss!', image_url: null, match_id: null, category_name: null, author_name: 'Organização', created_at: '2026-04-15T08:00:00Z' },
  { id: 'feed-10', tournament_id: T_ID, type: 'schedule_change', title: 'Ajuste de horário: Azul Médio', content: 'Quartas-de-final do Azul Médio adiantadas para 9h30.', image_url: null, match_id: null, category_name: 'Azul Médio Masc', author_name: 'Organização', created_at: '2026-04-15T08:30:00Z' },
];

// ── Athlete Profiles ────────────────────────────────────────

export const MOCK_ATHLETE_PROFILES: AthleteProfile[] = [
  { id: 'ap-1', user_id: 'f-57', profile_id: 'prof-57', academy_id: 'acad-1', display_name: 'Marcos Souza', avatar_url: null, belt: BeltLevel.Black, weight: 82, birth_date: '1994-05-12', gender: 'male', modalities: ['BJJ'], wins: 38, losses: 5, draws: 2, medals_gold: 10, medals_silver: 3, medals_bronze: 2, ranking_points: 320, created_at: '2024-01-10T10:00:00Z', updated_at: NOW },
  { id: 'ap-2', user_id: 'f-33', profile_id: 'prof-33', academy_id: 'acad-1', display_name: 'Roberto Cyborg', avatar_url: null, belt: BeltLevel.Purple, weight: 76, birth_date: '1996-08-20', gender: 'male', modalities: ['BJJ'], wins: 28, losses: 3, draws: 1, medals_gold: 7, medals_silver: 2, medals_bronze: 1, ranking_points: 260, created_at: '2024-03-15T10:00:00Z', updated_at: NOW },
  { id: 'ap-3', user_id: 'f-58', profile_id: 'prof-58', academy_id: 'acad-2', display_name: 'Kleber Nogueira', avatar_url: null, belt: BeltLevel.Black, weight: 94, birth_date: '1992-01-15', gender: 'male', modalities: ['BJJ'], wins: 30, losses: 8, draws: 2, medals_gold: 6, medals_silver: 5, medals_bronze: 3, ranking_points: 220, created_at: '2024-02-01T10:00:00Z', updated_at: NOW },
  { id: 'ap-4', user_id: 'f-65', profile_id: 'prof-65', academy_id: 'acad-1', display_name: 'Ana Paula Soares', avatar_url: null, belt: BeltLevel.White, weight: 58, birth_date: '2000-11-03', gender: 'female', modalities: ['BJJ'], wins: 16, losses: 3, draws: 1, medals_gold: 4, medals_silver: 2, medals_bronze: 1, ranking_points: 150, created_at: '2025-01-10T10:00:00Z', updated_at: NOW },
  { id: 'ap-5', user_id: 'f-49', profile_id: 'prof-49', academy_id: 'acad-1', display_name: 'Wagner Telles', avatar_url: null, belt: BeltLevel.Brown, weight: 76, birth_date: '1990-03-25', gender: 'male', modalities: ['BJJ'], wins: 29, losses: 4, draws: 2, medals_gold: 8, medals_silver: 2, medals_bronze: 3, ranking_points: 280, created_at: '2024-06-01T10:00:00Z', updated_at: NOW },
];

// ── Predictions ─────────────────────────────────────────────

export const MOCK_PREDICTIONS: TournamentPrediction[] = [
  { id: 'pred-1', tournament_id: T_ID, category_id: 'cat-8', user_id: 'user-1', predicted_winner_id: 'f-57', actual_winner_id: 'f-57', is_correct: true, points_earned: 10, created_at: '2026-04-15T08:00:00Z' },
  { id: 'pred-2', tournament_id: T_ID, category_id: 'cat-7', user_id: 'user-1', predicted_winner_id: 'f-49', actual_winner_id: 'f-49', is_correct: true, points_earned: 10, created_at: '2026-04-15T08:05:00Z' },
  { id: 'pred-3', tournament_id: T_ID, category_id: 'cat-1', user_id: 'user-2', predicted_winner_id: 'f-1', actual_winner_id: 'f-1', is_correct: true, points_earned: 10, created_at: '2026-04-15T08:10:00Z' },
  { id: 'pred-4', tournament_id: T_ID, category_id: 'cat-6', user_id: 'user-2', predicted_winner_id: 'f-42', actual_winner_id: 'f-41', is_correct: false, points_earned: 0, created_at: '2026-04-15T08:15:00Z' },
  { id: 'pred-5', tournament_id: T_ID, category_id: 'cat-9', user_id: 'user-3', predicted_winner_id: 'f-65', actual_winner_id: 'f-65', is_correct: true, points_earned: 10, created_at: '2026-04-15T08:20:00Z' },
];

// ── Helper Factories ────────────────────────────────────────

function makeRegistration(tournamentId: string, categoryId: string, data: { athlete_profile_id: string; academy_id: string; athlete_name: string; academy_name: string; weight?: number }): TournamentRegistration {
  return {
    id: `reg-${Date.now()}`, tournament_id: tournamentId, category_id: categoryId,
    athlete_profile_id: data.athlete_profile_id, academy_id: data.academy_id,
    athlete_name: data.athlete_name, academy_name: data.academy_name,
    weight: data.weight ?? null, seed: null,
    status: 'pending', payment_status: 'pending', payment_amount: 0, payment_method: null, payment_reference: null,
    checked_in_at: null, weighed_in_at: null, weigh_in_weight: null,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
}

// ════════════════════════════════════════════════════════════
// EXPORTED MOCK FUNCTIONS
// ════════════════════════════════════════════════════════════

// ── Tournaments ─────────────────────────────────────────────

export function mockGetTournaments(filters?: TournamentFilters): Tournament[] {
  let r = [MOCK_TOURNAMENT, MOCK_TOURNAMENT_UPCOMING, MOCK_TOURNAMENT_PENDING];
  if (filters?.status) r = r.filter(t => t.status === filters.status);
  if (filters?.city) r = r.filter(t => t.city === filters.city);
  if (filters?.search) r = r.filter(t => t.name.toLowerCase().includes(filters.search!.toLowerCase()));
  return r;
}

export function mockGetTournament(slug: string): Tournament {
  if (slug === T_SLUG) return MOCK_TOURNAMENT;
  if (slug === MOCK_TOURNAMENT_UPCOMING.slug) return MOCK_TOURNAMENT_UPCOMING;
  if (slug === MOCK_TOURNAMENT_PENDING.slug) return MOCK_TOURNAMENT_PENDING;
  return { ...MOCK_TOURNAMENT, slug };
}

export function mockCreateTournament(
  data: Omit<Tournament, 'id' | 'created_at' | 'updated_at' | 'status' | 'approved_at' | 'approved_by' | 'rejection_reason'>,
): Tournament {
  return {
    ...data,
    id: `trn-${Date.now()}`,
    status: 'aguardando_aprovacao',
    approved_at: null,
    approved_by: null,
    rejection_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function mockUpdateTournament(
  _id: string,
  data: Partial<Omit<Tournament, 'id' | 'created_at' | 'updated_at'>>,
): Tournament {
  return { ...MOCK_TOURNAMENT, ...data, updated_at: new Date().toISOString() };
}

export function mockApproveTournament(id: string): Tournament {
  const t = id === MOCK_TOURNAMENT_PENDING.id ? MOCK_TOURNAMENT_PENDING : MOCK_TOURNAMENT;
  return { ...t, status: 'published', approved_at: new Date().toISOString(), approved_by: 'superadmin-1', rejection_reason: null };
}

export function mockRejectTournament(id: string, reason: string): Tournament {
  const t = id === MOCK_TOURNAMENT_PENDING.id ? MOCK_TOURNAMENT_PENDING : MOCK_TOURNAMENT;
  return { ...t, status: 'cancelled', rejection_reason: reason };
}

export function mockGetPendingTournaments(): Tournament[] {
  return [MOCK_TOURNAMENT_PENDING];
}

export function mockPublishTournament(_id: string): void { /* noop */ }
export function mockOpenRegistration(_id: string): void { /* noop */ }
export function mockCloseRegistration(_id: string): void { /* noop */ }
export function mockStartTournament(_id: string): void { /* noop */ }
export function mockCompleteTournament(_id: string): void { /* noop */ }

export function mockGetTournamentStats(_id: string): TournamentStats {
  return {
    tournament_id: T_ID,
    total_registrations: 120,
    confirmed_registrations: 120,
    checked_in_count: 120,
    weighed_in_count: 120,
    categories_count: 12,
    brackets_generated: 12,
    matches_total: ALL_MATCHES.length,
    matches_completed: ALL_MATCHES.filter(m => m.status === 'completed').length,
    matches_in_progress: 0,
    matches_pending: 0,
    academies_count: 25,
    revenue_total: 12000,
    revenue_collected: 12000,
  };
}

// ── Circuits ────────────────────────────────────────────────

export function mockGetCircuits(): TournamentCircuit[] { return [MOCK_CIRCUIT]; }
export function mockGetCircuit(_slug: string): TournamentCircuit { return MOCK_CIRCUIT; }

export function mockGetCircuitRanking(_circuitId: string): AcademyTournamentStats[] {
  return MOCK_ACADEMY_STATS;
}

// ── Categories ──────────────────────────────────────────────

export function mockGetCategories(_tournamentId: string, filters?: CategoryFilters): TournamentCategory[] {
  let r = [...MOCK_CATEGORIES];
  if (filters?.modality) r = r.filter(c => c.modality === filters.modality);
  if (filters?.gender) r = r.filter(c => c.gender === filters.gender);
  if (filters?.search) r = r.filter(c => c.name.toLowerCase().includes(filters.search!.toLowerCase()));
  return r;
}

export function mockCreateCategory(
  tournamentId: string,
  data: Omit<TournamentCategory, 'id' | 'tournament_id' | 'created_at' | 'updated_at' | 'registered_count'>,
): TournamentCategory {
  return {
    ...data,
    id: `cat-${Date.now()}`,
    tournament_id: tournamentId,
    registered_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function mockGenerateStandardCategories(
  _tournamentId: string,
  _modality: string,
  _config: { gender: ('male' | 'female' | 'mixed')[]; includeAbsolute: boolean },
): TournamentCategory[] {
  return MOCK_CATEGORIES;
}

export function mockSuggestCategory(
  _birthDate: string,
  weight: number,
  gender: 'male' | 'female',
  belt: BeltLevel,
): TournamentCategory {
  const match = MOCK_CATEGORIES.find(c =>
    c.gender === gender &&
    c.belt_min === belt &&
    (c.weight_max === null || weight <= c.weight_max),
  );
  return match ?? MOCK_CATEGORIES[0];
}

// ── Registrations ───────────────────────────────────────────

export function mockRegisterAthlete(
  tournamentId: string,
  categoryId: string,
  data: { athlete_profile_id: string; academy_id: string; athlete_name: string; academy_name: string; weight?: number },
): TournamentRegistration {
  return makeRegistration(tournamentId, categoryId, data);
}

export function mockRegisterBatch(
  tournamentId: string,
  _academyId: string,
  athletes: { category_id: string; athlete_profile_id: string; athlete_name: string; weight?: number }[],
): TournamentRegistration[] {
  return athletes.map(a => makeRegistration(tournamentId, a.category_id, {
    athlete_profile_id: a.athlete_profile_id,
    academy_id: _academyId,
    athlete_name: a.athlete_name,
    academy_name: ACADEMIES[0].name,
    weight: a.weight,
  }));
}

export function mockGetRegistrations(_tournamentId: string, filters?: RegistrationFilters): TournamentRegistration[] {
  let r = [...MOCK_REGISTRATIONS];
  if (filters?.category_id) r = r.filter(reg => reg.category_id === filters.category_id);
  if (filters?.academy_id) r = r.filter(reg => reg.academy_id === filters.academy_id);
  if (filters?.status) r = r.filter(reg => reg.status === filters.status);
  if (filters?.payment_status) r = r.filter(reg => reg.payment_status === filters.payment_status);
  if (filters?.search) r = r.filter(reg => reg.athlete_name.toLowerCase().includes(filters.search!.toLowerCase()));
  return r;
}

export function mockGetRegistrationsByAcademy(_tournamentId: string, academyId: string): TournamentRegistration[] {
  return MOCK_REGISTRATIONS.filter(r => r.academy_id === academyId);
}

export function mockGetMyRegistrations(_userId: string): TournamentRegistration[] {
  return MOCK_REGISTRATIONS.slice(0, 2);
}

export function mockConfirmPayment(_registrationId: string, _paymentData: { method: string; reference: string; amount: number }): void { /* noop */ }
export function mockCancelRegistration(_registrationId: string): void { /* noop */ }
export function mockCheckInAthlete(_registrationId: string): void { /* noop */ }

export function mockWeighInAthlete(_registrationId: string, _weight: number): { passed: boolean; category: TournamentCategory } {
  return { passed: true, category: MOCK_CATEGORIES[0] };
}

// ── Brackets ────────────────────────────────────────────────

export function mockGenerateBracket(categoryId: string): TournamentBracket {
  const b = MOCK_BRACKETS.find(b => b.category_id === categoryId) ?? MOCK_BRACKETS[0];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _matches, ...bracket } = b;
  return bracket;
}

export function mockGetBracket(categoryId: string): { bracket: TournamentBracket; matches: TournamentMatch[] } {
  const b = MOCK_BRACKETS.find(b => b.category_id === categoryId) ?? MOCK_BRACKETS[0];
  const { _matches, ...bracket } = b;
  return { bracket, matches: _matches };
}

export function mockGetAllBrackets(_tournamentId: string): TournamentBracket[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return MOCK_BRACKETS.map(({ _matches, ...b }) => b);
}

// ── Matches ─────────────────────────────────────────────────

export function mockGetMatchesByArea(_tournamentId: string, area: number): TournamentMatch[] {
  return ALL_MATCHES.filter(m => m.area === area);
}

export function mockGetNextMatches(_tournamentId: string): TournamentMatch[] {
  return ALL_MATCHES.filter(m => m.status === 'pending').slice(0, 20);
}

export function mockCallMatch(_matchId: string, _area: number): void { /* noop */ }
export function mockStartMatch(_matchId: string): void { /* noop */ }
export function mockRecordResult(_matchId: string, _result: MatchResult): void { /* noop */ }

export function mockGetLiveMatches(_tournamentId: string): TournamentMatch[] {
  return ALL_MATCHES.filter(m => m.status === 'in_progress').slice(0, 4);
}

export function mockGetCompletedMatches(_tournamentId: string): TournamentMatch[] {
  return ALL_MATCHES.filter(m => m.status === 'completed');
}

// ── Feed ────────────────────────────────────────────────────

export function mockGetFeed(_tournamentId: string, limit?: number): TournamentFeedItem[] {
  return limit ? MOCK_FEED.slice(0, limit) : MOCK_FEED;
}

export function mockPostAnnouncement(tournamentId: string, text: string): TournamentFeedItem {
  return {
    id: `feed-${Date.now()}`, tournament_id: tournamentId, type: 'announcement',
    title: 'Anúncio', content: text, image_url: null, match_id: null, category_name: null, author_name: 'Organização',
    created_at: new Date().toISOString(),
  };
}

export function mockPostPhoto(tournamentId: string, photoUrl: string, caption: string): TournamentFeedItem {
  return {
    id: `feed-${Date.now()}`, tournament_id: tournamentId, type: 'photo',
    title: caption, content: caption, image_url: photoUrl, match_id: null, category_name: null, author_name: 'Organização',
    created_at: new Date().toISOString(),
  };
}

// ── Results ─────────────────────────────────────────────────

export function mockGetResults(_tournamentId: string): { categories: { category: TournamentCategory; podium: TournamentRegistration[] }[] } {
  return {
    categories: MOCK_CATEGORIES.slice(0, 4).map(cat => ({
      category: cat,
      podium: MOCK_REGISTRATIONS.filter(r => r.category_id === cat.id).slice(0, 3),
    })),
  };
}

export function mockGetResultsByAcademy(_tournamentId: string): { academies: { academy_id: string; academy_name: string; athletes: TournamentRegistration[] }[] } {
  const byAcademy = new Map<string, { academy_id: string; academy_name: string; athletes: TournamentRegistration[] }>();
  for (const reg of MOCK_REGISTRATIONS.slice(0, 20)) {
    if (!byAcademy.has(reg.academy_id)) {
      byAcademy.set(reg.academy_id, { academy_id: reg.academy_id, academy_name: reg.academy_name, athletes: [] });
    }
    byAcademy.get(reg.academy_id)!.athletes.push(reg);
  }
  return { academies: Array.from(byAcademy.values()) };
}

export function mockGetMedalTable(_tournamentId: string): MedalTable[] {
  return MOCK_MEDAL_TABLE;
}

export function mockGenerateCertificate(_registrationId: string): { url: string } {
  return { url: '/certificates/cert-mock.pdf' };
}

export function mockGetAthleteResults(athleteProfileId: string): TournamentMatch[] {
  return ALL_MATCHES.filter(m => m.athlete1_id === athleteProfileId || m.athlete2_id === athleteProfileId);
}

// ── Athlete Profiles ────────────────────────────────────────

export function mockGetAthleteProfile(id: string): AthleteProfile {
  return MOCK_ATHLETE_PROFILES.find(a => a.id === id) ?? MOCK_ATHLETE_PROFILES[0];
}

export function mockGetAthleteByUser(userId: string): AthleteProfile {
  return MOCK_ATHLETE_PROFILES.find(a => a.user_id === userId) ?? MOCK_ATHLETE_PROFILES[0];
}

export function mockUpdateAthleteProfile(
  id: string,
  data: Partial<Omit<AthleteProfile, 'id' | 'created_at' | 'updated_at'>>,
): AthleteProfile {
  const existing = MOCK_ATHLETE_PROFILES.find(a => a.id === id) ?? MOCK_ATHLETE_PROFILES[0];
  return { ...existing, ...data, updated_at: new Date().toISOString() };
}

// ── Rankings ────────────────────────────────────────────────

export function mockGetAcademyRanking(_circuitId?: string): AcademyTournamentStats[] {
  return MOCK_ACADEMY_STATS;
}

export function mockGetAthleteRanking(_modality?: string, belt?: BeltLevel): AthleteProfile[] {
  let r = [...MOCK_ATHLETE_PROFILES];
  if (belt) r = r.filter(a => a.belt === belt);
  return r.sort((a, b) => b.ranking_points - a.ranking_points);
}

// ── Predictions ─────────────────────────────────────────────

export function mockSubmitPrediction(tournamentId: string, categoryId: string, winnerId: string): TournamentPrediction {
  return {
    id: `pred-${Date.now()}`, tournament_id: tournamentId, category_id: categoryId,
    user_id: 'user-current', predicted_winner_id: winnerId,
    actual_winner_id: null, is_correct: null, points_earned: 0,
    created_at: new Date().toISOString(),
  };
}

export function mockGetMyPredictions(tournamentId: string): TournamentPrediction[] {
  return MOCK_PREDICTIONS.filter(p => p.tournament_id === tournamentId);
}

export function mockGetPredictionLeaderboard(_tournamentId: string): { userId: string; name: string; correct: number; points: number }[] {
  return [
    { userId: 'user-1', name: 'João Apostador', correct: 8, points: 80 },
    { userId: 'user-3', name: 'Maria Palpiteira', correct: 7, points: 70 },
    { userId: 'user-2', name: 'Pedro Chutador', correct: 6, points: 60 },
    { userId: 'user-4', name: 'Ana Previsão', correct: 5, points: 50 },
    { userId: 'user-5', name: 'Carlos Bolão', correct: 3, points: 30 },
  ];
}

// ── Social Cards ────────────────────────────────────────────

export function mockGenerateSocialCard(_type: SocialCardType, _data: Record<string, unknown>): { imageUrl: string } {
  return { imageUrl: '/images/social-cards/mock-card.png' };
}
