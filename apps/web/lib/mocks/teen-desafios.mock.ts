import type { DesafiosOverview, DesafioTeen } from '@/lib/api/teen-desafios.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const today = new Date();
const endOfDay = new Date(today);
endOfDay.setHours(23, 59, 59, 999);

const endOfWeek = new Date(today);
endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
endOfWeek.setHours(23, 59, 59, 999);

const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

const endOfSpecial = new Date(today);
endOfSpecial.setDate(today.getDate() + 45);

const ACTIVE_CHALLENGES: DesafioTeen[] = [
  // Daily challenges
  {
    id: 'des-d1',
    title: 'Treinar Hoje',
    description: 'Participe de pelo menos 1 aula hoje na academia.',
    emoji: '🥋',
    type: 'diario',
    xp_reward: 50,
    progress: 0,
    target: 1,
    completed: false,
    completed_at: null,
    expires_at: endOfDay.toISOString(),
  },
  {
    id: 'des-d2',
    title: 'Assistir Video',
    description: 'Assista 1 video completo na biblioteca de tecnicas.',
    emoji: '🎬',
    type: 'diario',
    xp_reward: 30,
    progress: 1,
    target: 1,
    completed: true,
    completed_at: null, // completed but unclaimed
    expires_at: endOfDay.toISOString(),
  },
  {
    id: 'des-d3',
    title: 'Praticar Kata',
    description: 'Pratique pelo menos 1 kata completo fora da aula.',
    emoji: '🧘',
    type: 'diario',
    xp_reward: 40,
    progress: 0,
    target: 1,
    completed: false,
    completed_at: null,
    expires_at: endOfDay.toISOString(),
  },
  // Weekly challenges
  {
    id: 'des-w1',
    title: 'Treine 3x na Semana',
    description: 'Participe de 3 aulas durante esta semana.',
    emoji: '💪',
    type: 'semanal',
    xp_reward: 150,
    progress: 2,
    target: 3,
    completed: false,
    completed_at: null,
    expires_at: endOfWeek.toISOString(),
  },
  {
    id: 'des-w2',
    title: 'Complete 2 Videos',
    description: 'Assista 2 videos completos na biblioteca de tecnicas.',
    emoji: '📺',
    type: 'semanal',
    xp_reward: 100,
    progress: 1,
    target: 2,
    completed: false,
    completed_at: null,
    expires_at: endOfWeek.toISOString(),
  },
  {
    id: 'des-w3',
    title: 'Traga um Amigo',
    description: 'Convide um amigo para uma aula experimental.',
    emoji: '🤝',
    type: 'semanal',
    xp_reward: 200,
    progress: 0,
    target: 1,
    completed: false,
    completed_at: null,
    expires_at: endOfWeek.toISOString(),
  },
  // Monthly challenges
  {
    id: 'des-m1',
    title: '12 Aulas no Mes',
    description: 'Participe de 12 aulas durante este mes.',
    emoji: '🗓️',
    type: 'mensal',
    xp_reward: 500,
    progress: 8,
    target: 12,
    completed: false,
    completed_at: null,
    expires_at: endOfMonth.toISOString(),
  },
  {
    id: 'des-m2',
    title: 'Desafios Semanais Completos',
    description: 'Complete todos os desafios semanais do mes.',
    emoji: '🏅',
    type: 'mensal',
    xp_reward: 400,
    progress: 2,
    target: 4,
    completed: false,
    completed_at: null,
    expires_at: endOfMonth.toISOString(),
  },
  // Special challenge
  {
    id: 'des-s1',
    title: 'Preparacao para Torneio',
    description: 'Complete todas as etapas de preparacao para o proximo torneio regional.',
    emoji: '🏆',
    type: 'especial',
    xp_reward: 1000,
    progress: 3,
    target: 10,
    completed: false,
    completed_at: null,
    expires_at: endOfSpecial.toISOString(),
  },
];

const COMPLETED_CHALLENGES: DesafioTeen[] = [
  {
    id: 'des-c1',
    title: 'Treinar Ontem',
    description: 'Participou de pelo menos 1 aula.',
    emoji: '🥋',
    type: 'diario',
    xp_reward: 50,
    progress: 1,
    target: 1,
    completed: true,
    completed_at: new Date(Date.now() - 86400000).toISOString(),
    expires_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'des-c2',
    title: 'Streak de 5 Dias',
    description: 'Mantenha um streak de 5 dias consecutivos de treino.',
    emoji: '🔥',
    type: 'semanal',
    xp_reward: 200,
    progress: 5,
    target: 5,
    completed: true,
    completed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    expires_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'des-c3',
    title: 'Primeiro Video',
    description: 'Assista seu primeiro video na biblioteca.',
    emoji: '🎬',
    type: 'diario',
    xp_reward: 30,
    progress: 1,
    target: 1,
    completed: true,
    completed_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    expires_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'des-c4',
    title: '8 Aulas em Fevereiro',
    description: 'Participou de 8 aulas no mes de fevereiro.',
    emoji: '🗓️',
    type: 'mensal',
    xp_reward: 350,
    progress: 8,
    target: 8,
    completed: true,
    completed_at: '2026-02-28T23:59:59.000Z',
    expires_at: '2026-02-28T23:59:59.000Z',
  },
];

export async function mockGetDesafios(_studentId: string): Promise<DesafiosOverview> {
  await delay();
  return {
    active: ACTIVE_CHALLENGES,
    completed: COMPLETED_CHALLENGES,
    total_xp_earned: COMPLETED_CHALLENGES.reduce((sum, c) => sum + c.xp_reward, 0),
    streak_bonus: 75,
  };
}

export async function mockClaimReward(_desafioId: string): Promise<{ xp_earned: number }> {
  await delay();
  return { xp_earned: 30 };
}
