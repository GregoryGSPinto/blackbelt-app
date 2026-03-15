import type { BracketDTO, MatchDTO, BracketMethod, SubmitResultPayload, MatchResultMethod } from '@/lib/api/brackets.service';

const delay = () => new Promise((r) => setTimeout(r, 350 + Math.random() * 150));

const FIGHTERS = [
  { id: 'f-1', name: 'Lucas Ferreira' },
  { id: 'f-2', name: 'Rafael Santos' },
  { id: 'f-3', name: 'Pedro Oliveira' },
  { id: 'f-4', name: 'Matheus Costa' },
  { id: 'f-5', name: 'Gabriel Almeida' },
  { id: 'f-6', name: 'Bruno Lima' },
  { id: 'f-7', name: 'Thiago Nascimento' },
  { id: 'f-8', name: 'Diego Ribeiro' },
  { id: 'f-9', name: 'Felipe Souza' },
  { id: 'f-10', name: 'André Martins' },
  { id: 'f-11', name: 'Rodrigo Campos' },
  { id: 'f-12', name: 'Vinícius Rocha' },
  { id: 'f-13', name: 'Gustavo Pereira' },
  { id: 'f-14', name: 'Leandro Silva' },
  { id: 'f-15', name: 'Marcelo Barbosa' },
  { id: 'f-16', name: 'Eduardo Mendes' },
];

const METHODS: MatchResultMethod[] = ['submission', 'points', 'points', 'submission', 'dq', 'points', 'submission', 'walkover'];

function buildSingleEliminationBracket(): MatchDTO[] {
  const matches: MatchDTO[] = [];
  const baseTime = new Date('2026-04-18T09:00:00Z');

  // Round 1 — 8 matches (16 fighters)
  for (let i = 0; i < 8; i++) {
    const fa = FIGHTERS[i * 2];
    const fb = FIGHTERS[i * 2 + 1];
    const winner = i < 7 ? (i % 2 === 0 ? fa : fb) : null; // Last match pending
    const method = winner ? METHODS[i] : null;
    const scoreA = winner ? (method === 'points' ? (winner.id === fa.id ? 7 : 2) : 0) : null;
    const scoreB = winner ? (method === 'points' ? (winner.id === fb.id ? 7 : 2) : 0) : null;
    const duration = winner ? 180 + Math.floor(Math.random() * 180) : null;

    matches.push({
      id: `match-r1-${i + 1}`,
      bracket_id: 'bracket-1',
      round: 1,
      position: i + 1,
      fighter_a_id: fa.id,
      fighter_a_name: fa.name,
      fighter_b_id: fb.id,
      fighter_b_name: fb.name,
      winner_id: winner?.id ?? null,
      winner_name: winner?.name ?? null,
      method,
      score_a: scoreA,
      score_b: scoreB,
      duration_seconds: duration,
      notes: method === 'submission' ? 'Triângulo' : method === 'dq' ? 'Falta grave' : null,
      mat_number: (i % 3) + 1,
      scheduled_time: new Date(baseTime.getTime() + i * 20 * 60000).toISOString(),
    });
  }

  // Round 2 — 4 matches (winners of R1)
  const r1Winners = [
    FIGHTERS[0], // match 1 winner
    FIGHTERS[3], // match 2 winner
    FIGHTERS[4], // match 3 winner
    FIGHTERS[7], // match 4 winner
  ];
  for (let i = 0; i < 4; i++) {
    const fa = r1Winners[i] ?? null;
    const fb = i < 3 ? { id: `f-${9 + i}`, name: FIGHTERS[8 + i].name } : null;
    const winner = i < 3 ? fa : null;

    matches.push({
      id: `match-r2-${i + 1}`,
      bracket_id: 'bracket-1',
      round: 2,
      position: i + 1,
      fighter_a_id: fa?.id ?? null,
      fighter_a_name: fa?.name ?? null,
      fighter_b_id: fb?.id ?? null,
      fighter_b_name: fb?.name ?? null,
      winner_id: winner?.id ?? null,
      winner_name: winner?.name ?? null,
      method: winner ? 'points' : null,
      score_a: winner ? 5 : null,
      score_b: winner ? 2 : null,
      duration_seconds: winner ? 300 : null,
      notes: null,
      mat_number: (i % 3) + 1,
      scheduled_time: new Date(baseTime.getTime() + (8 + i) * 20 * 60000).toISOString(),
    });
  }

  // Round 3 — Semifinals (2 matches)
  matches.push({
    id: 'match-r3-1',
    bracket_id: 'bracket-1',
    round: 3,
    position: 1,
    fighter_a_id: FIGHTERS[0].id,
    fighter_a_name: FIGHTERS[0].name,
    fighter_b_id: FIGHTERS[4].id,
    fighter_b_name: FIGHTERS[4].name,
    winner_id: FIGHTERS[0].id,
    winner_name: FIGHTERS[0].name,
    method: 'submission',
    score_a: 0,
    score_b: 0,
    duration_seconds: 210,
    notes: 'Armlock',
    mat_number: 1,
    scheduled_time: new Date(baseTime.getTime() + 12 * 20 * 60000).toISOString(),
  });

  matches.push({
    id: 'match-r3-2',
    bracket_id: 'bracket-1',
    round: 3,
    position: 2,
    fighter_a_id: FIGHTERS[7].id,
    fighter_a_name: FIGHTERS[7].name,
    fighter_b_id: null,
    fighter_b_name: null,
    winner_id: null,
    winner_name: null,
    method: null,
    score_a: null,
    score_b: null,
    duration_seconds: null,
    notes: null,
    mat_number: 2,
    scheduled_time: new Date(baseTime.getTime() + 13 * 20 * 60000).toISOString(),
  });

  // Round 4 — Final
  matches.push({
    id: 'match-r4-1',
    bracket_id: 'bracket-1',
    round: 4,
    position: 1,
    fighter_a_id: null,
    fighter_a_name: null,
    fighter_b_id: null,
    fighter_b_name: null,
    winner_id: null,
    winner_name: null,
    method: null,
    score_a: null,
    score_b: null,
    duration_seconds: null,
    notes: null,
    mat_number: 1,
    scheduled_time: new Date(baseTime.getTime() + 14 * 20 * 60000).toISOString(),
  });

  return matches;
}

const DEFAULT_BRACKET: BracketDTO = {
  id: 'bracket-1',
  championship_id: 'champ-1',
  category_id: 'cat-champ-1-1',
  method: 'single_elimination',
  total_rounds: 4,
  matches: buildSingleEliminationBracket(),
};

export async function mockGenerateBracket(_championshipId: string, categoryId: string, method: BracketMethod): Promise<BracketDTO> {
  await delay();
  return {
    ...DEFAULT_BRACKET,
    category_id: categoryId,
    method,
    matches: DEFAULT_BRACKET.matches.map((m) => ({ ...m })),
  };
}

export async function mockGetBracketByCategory(_categoryId: string): Promise<BracketDTO> {
  await delay();
  return {
    ...DEFAULT_BRACKET,
    matches: DEFAULT_BRACKET.matches.map((m) => ({ ...m })),
  };
}

export async function mockSubmitResult(matchId: string, result: SubmitResultPayload): Promise<MatchDTO> {
  await delay();
  const match = DEFAULT_BRACKET.matches.find((m) => m.id === matchId);
  if (!match) throw new Error('Match not found');
  match.winner_id = result.winner_id;
  match.winner_name = match.fighter_a_id === result.winner_id ? match.fighter_a_name : match.fighter_b_name;
  match.method = result.method;
  match.score_a = result.score_a;
  match.score_b = result.score_b;
  match.duration_seconds = result.duration_seconds;
  match.notes = result.notes ?? null;
  return { ...match };
}

export async function mockGetMatchDetails(matchId: string): Promise<MatchDTO> {
  await delay();
  const match = DEFAULT_BRACKET.matches.find((m) => m.id === matchId);
  if (!match) throw new Error('Match not found');
  return { ...match };
}
