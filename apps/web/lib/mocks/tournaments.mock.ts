import type { TournamentDTO, BracketMatch } from '@/lib/api/tournaments.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const TOURNAMENTS: TournamentDTO[] = [
  { id: 'trn-1', name: 'Copa BlackBelt 2026', date: '2026-05-10', modality: 'BJJ', categories: ['Faixa Branca', 'Faixa Azul', 'Faixa Roxa+'], enrolledCount: 42, status: 'upcoming' },
  { id: 'trn-2', name: 'Torneio Interno Março', date: '2026-03-28', modality: 'BJJ', categories: ['Leve', 'Médio', 'Pesado'], enrolledCount: 16, status: 'upcoming' },
];

const BRACKET: BracketMatch[] = [
  { id: 'bm-1', round: 1, position: 1, player1: 'João Silva', player2: 'Pedro Santos', winner: 'João Silva', method: 'Finalização' },
  { id: 'bm-2', round: 1, position: 2, player1: 'Ana Costa', player2: 'Maria Oliveira', winner: 'Ana Costa', method: 'Pontos' },
  { id: 'bm-3', round: 1, position: 3, player1: 'Carlos Mendes', player2: 'Lucas Lima', winner: null },
  { id: 'bm-4', round: 1, position: 4, player1: 'Rafael Souza', player2: 'Bruno Alves', winner: null },
  { id: 'bm-5', round: 2, position: 1, player1: 'João Silva', player2: 'Ana Costa', winner: null },
  { id: 'bm-6', round: 2, position: 2, player1: null, player2: null, winner: null },
  { id: 'bm-7', round: 3, position: 1, player1: null, player2: null, winner: null },
];

export async function mockListTournaments(_academyId: string): Promise<TournamentDTO[]> {
  await delay();
  return TOURNAMENTS.map((t) => ({ ...t }));
}

export async function mockCreateTournament(_academyId: string, data: Omit<TournamentDTO, 'id' | 'enrolledCount' | 'status'>): Promise<TournamentDTO> {
  await delay();
  const t: TournamentDTO = { ...data, id: `trn-${Date.now()}`, enrolledCount: 0, status: 'upcoming' };
  TOURNAMENTS.push(t);
  return t;
}

export async function mockGetBracket(_tournamentId: string): Promise<BracketMatch[]> {
  await delay();
  return BRACKET.map((m) => ({ ...m }));
}
