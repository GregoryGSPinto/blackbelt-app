import type { PlayerProfile, LeaderboardEntry, Badge } from '@/lib/types/gamification';
import { getLevelInfo } from '@/lib/types/gamification';

const BADGES: Badge[] = [
  { id: 'b-1', name: 'Primeiro Treino', description: 'Compareça ao seu primeiro treino', icon: '🥋', unlocked: true, unlockedAt: '2026-01-15T00:00:00Z', progress: 100, requirement: 1, current: 1, category: 'attendance' },
  { id: 'b-2', name: 'Semana Perfeita', description: '7 dias seguidos de treino', icon: '🔥', unlocked: true, unlockedAt: '2026-02-01T00:00:00Z', progress: 100, requirement: 7, current: 7, category: 'attendance' },
  { id: 'b-3', name: 'Maratonista', description: '30 dias seguidos de treino', icon: '💪', unlocked: false, unlockedAt: null, progress: 70, requirement: 30, current: 21, category: 'attendance' },
  { id: 'b-4', name: 'Estudante Dedicado', description: 'Assista 50 vídeos', icon: '📹', unlocked: true, unlockedAt: '2026-02-15T00:00:00Z', progress: 100, requirement: 50, current: 50, category: 'content' },
  { id: 'b-5', name: 'Mestre dos Quizzes', description: 'Acerte 100 questões', icon: '🧠', unlocked: false, unlockedAt: null, progress: 65, requirement: 100, current: 65, category: 'content' },
  { id: 'b-6', name: '100 Treinos', description: 'Complete 100 sessões de treino', icon: '🏆', unlocked: false, unlockedAt: null, progress: 82, requirement: 100, current: 82, category: 'achievement' },
  { id: 'b-7', name: 'Faixa Azul', description: 'Alcance a faixa azul', icon: '🟦', unlocked: true, unlockedAt: '2026-03-01T00:00:00Z', progress: 100, requirement: 1, current: 1, category: 'achievement' },
  { id: 'b-8', name: 'Parceiro de Treino', description: 'Treine com 10 parceiros diferentes', icon: '🤝', unlocked: false, unlockedAt: null, progress: 40, requirement: 10, current: 4, category: 'social' },
  { id: 'b-9', name: 'Embaixador', description: 'Indique 3 amigos', icon: '📢', unlocked: false, unlockedAt: null, progress: 33, requirement: 3, current: 1, category: 'social' },
  { id: 'b-10', name: 'Competidor', description: 'Participe de um campeonato', icon: '🏅', unlocked: false, unlockedAt: null, progress: 0, requirement: 1, current: 0, category: 'special' },
];

export function mockGetPlayerProfile(userId: string): PlayerProfile {
  const totalXP = 1250;
  const info = getLevelInfo(totalXP);
  return {
    userId,
    name: 'Lucas Ferreira',
    role: 'student',
    totalXP,
    level: info.level,
    levelName: info.name,
    xpForNextLevel: info.xpForNext,
    xpProgress: info.progress,
    streak: 14,
    badges: BADGES,
    rank: 3,
  };
}

export function mockGetLeaderboard(_academyId: string, _classId?: string): LeaderboardEntry[] {
  const students = [
    { userId: 's-1', name: 'Rafael Costa', xp: 2450 },
    { userId: 's-2', name: 'Ana Clara', xp: 2100 },
    { userId: 's-3', name: 'Lucas Ferreira', xp: 1250 },
    { userId: 's-4', name: 'Pedro Henrique', xp: 980 },
    { userId: 's-5', name: 'Mariana Santos', xp: 870 },
    { userId: 's-6', name: 'Bruno Lima', xp: 650 },
    { userId: 's-7', name: 'Julia Almeida', xp: 520 },
    { userId: 's-8', name: 'Diego Souza', xp: 410 },
    { userId: 's-9', name: 'Carla Rodrigues', xp: 310 },
    { userId: 's-10', name: 'Felipe Ramos', xp: 180 },
  ];

  return students.map((s, i) => {
    const info = getLevelInfo(s.xp);
    return {
      rank: i + 1,
      userId: s.userId,
      name: s.name,
      totalXP: s.xp,
      level: info.level,
      levelName: info.name,
      badges: Math.floor(s.xp / 300),
    };
  });
}

export function mockGetAllBadges(): Badge[] {
  return BADGES;
}
