import type { ChallengeDTO } from '@/lib/api/challenges.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const CHALLENGES: ChallengeDTO[] = [
  { id: 'ch-1', title: 'Guerreiro da Semana', description: 'Venha 4x esta semana', type: 'presenca', startDate: '2026-03-10', endDate: '2026-03-16', target: 4, progress: 3, reward: '50 XP', badge: 'Guerreiro', active: true, participantCount: 28 },
  { id: 'ch-2', title: 'Streak de 7 Dias', description: '7 dias consecutivos de treino', type: 'streak', startDate: '2026-03-01', endDate: '2026-03-31', target: 7, progress: 5, reward: '100 XP + Badge', badge: 'Imparável', active: true, participantCount: 15 },
  { id: 'ch-3', title: 'Traga um Amigo', description: 'Convide um amigo para aula experimental', type: 'social', startDate: '2026-03-01', endDate: '2026-03-31', target: 1, progress: 0, reward: '30 XP + Badge Embaixador', badge: 'Embaixador', active: true, participantCount: 8 },
  { id: 'ch-4', title: 'Maratona de Vídeos', description: 'Assista 3 vídeos da série Fundamentos', type: 'conteudo', startDate: '2026-03-01', endDate: '2026-03-31', target: 3, progress: 1, reward: '25 XP', active: true, participantCount: 22 },
  { id: 'ch-5', title: 'Nota Máxima', description: 'Tire nota 80+ na próxima avaliação', type: 'avaliacao', startDate: '2026-03-01', endDate: '2026-04-30', target: 80, progress: 0, reward: '75 XP + Badge', badge: 'Excelência', active: true, participantCount: 35 },
];

export async function mockListChallenges(_academyId: string): Promise<ChallengeDTO[]> {
  await delay();
  return CHALLENGES.map((c) => ({ ...c }));
}

export async function mockCreateChallenge(_academyId: string, data: Omit<ChallengeDTO, 'id' | 'progress' | 'participantCount'>): Promise<ChallengeDTO> {
  await delay();
  const ch: ChallengeDTO = { ...data, id: `ch-${Date.now()}`, progress: 0, participantCount: 0 };
  CHALLENGES.push(ch);
  return ch;
}
