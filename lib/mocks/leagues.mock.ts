import type { LeagueDTO, LeagueAcademy, AcademyLeagueStats } from '@/lib/api/leagues.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

const ACADEMIES: LeagueAcademy[] = [
  { academy_id: 'ac-1', name: 'Gracie Barra Centro', logo: '/logos/gb-centro.png', total_points: 18450, student_count: 85, per_capita_avg: 217.1, rank: 1 },
  { academy_id: 'ac-2', name: 'Alliance Norte', logo: '/logos/alliance-norte.png', total_points: 15200, student_count: 72, per_capita_avg: 211.1, rank: 2 },
  { academy_id: 'ac-3', name: 'CheckMat Sul', logo: '/logos/checkmat-sul.png', total_points: 12800, student_count: 63, per_capita_avg: 203.2, rank: 3 },
  { academy_id: 'ac-4', name: 'Atos JJ Leste', logo: '/logos/atos-leste.png', total_points: 11300, student_count: 58, per_capita_avg: 194.8, rank: 4 },
  { academy_id: 'ac-5', name: 'Nova União Oeste', logo: '/logos/nu-oeste.png', total_points: 10100, student_count: 55, per_capita_avg: 183.6, rank: 5 },
  { academy_id: 'ac-6', name: 'Carlson Gracie Jardins', logo: '/logos/cg-jardins.png', total_points: 8750, student_count: 48, per_capita_avg: 182.3, rank: 6 },
  { academy_id: 'ac-7', name: 'GFTeam Moema', logo: '/logos/gft-moema.png', total_points: 7200, student_count: 42, per_capita_avg: 171.4, rank: 7 },
  { academy_id: 'ac-8', name: 'Ribeiro JJ Pinheiros', logo: '/logos/ribeiro-pinheiros.png', total_points: 5900, student_count: 38, per_capita_avg: 155.3, rank: 8 },
];

const LEAGUE: LeagueDTO = {
  id: 'league-s3',
  name: 'Liga Guerreiros de Tatame',
  season_id: 'season-3',
  academies: ACADEMIES,
  rules: 'Pontuação normalizada por número de alunos (média per capita). Check-in = 10 pts, Desafio = 25-100 pts, Conquista = 50 pts, Avaliação positiva = 30 pts, Trazer amigo = 100 pts.',
  start_date: '2026-02-01',
  end_date: '2026-04-30',
  prizes: [
    '1º lugar: Troféu Liga + Banner no app por 30 dias',
    '2º lugar: Badge de prata + destaque por 15 dias',
    '3º lugar: Badge de bronze + destaque por 7 dias',
  ],
};

const MY_ACADEMY_STATS: AcademyLeagueStats = {
  academy_id: 'ac-1',
  rank: 1,
  total_points: 18450,
  per_capita_avg: 217.1,
  student_count: 85,
  top_contributors: [
    { student_id: 'student-1', student_name: 'Lucas Silva', points: 2820 },
    { student_id: 'student-2', student_name: 'Pedro Oliveira', points: 2690 },
    { student_id: 'student-3', student_name: 'Gabriel Santos', points: 2540 },
    { student_id: 'student-4', student_name: 'Rafael Costa', points: 2380 },
    { student_id: 'student-5', student_name: 'Matheus Souza', points: 2210 },
  ],
  opted_in: true,
};

export async function mockGetActiveLeague(): Promise<LeagueDTO> {
  await delay();
  return { ...LEAGUE, academies: ACADEMIES.map((a) => ({ ...a })) };
}

export async function mockGetLeagueStandings(): Promise<LeagueAcademy[]> {
  await delay();
  return ACADEMIES.map((a) => ({ ...a }));
}

export async function mockGetMyAcademyRank(_academyId: string): Promise<AcademyLeagueStats> {
  await delay();
  return { ...MY_ACADEMY_STATS, top_contributors: MY_ACADEMY_STATS.top_contributors.map((c) => ({ ...c })) };
}

export async function mockContributePoints(_studentId: string, _action: string): Promise<{ points_added: number; total_points: number }> {
  await delay();
  return { points_added: 10, total_points: 18460 };
}

export async function mockToggleOptIn(_academyId: string, optIn: boolean): Promise<{ success: boolean }> {
  await delay();
  MY_ACADEMY_STATS.opted_in = optIn;
  return { success: true };
}
