import type {
  AchievementV2DTO,
  AchievementProgressDTO,
} from '@/lib/api/conquistas-v2.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const ALL_ACHIEVEMENTS: AchievementV2DTO[] = [
  // JORNADA (blue)
  { id: 'av2-1', name: 'Primeira Aula', description: 'Completou sua primeira aula de Jiu-Jitsu', category: 'JORNADA', rarity: 'common', icon: '🥋', is_earned: true, earned_at: '2025-06-01', progress_percent: null, progress_label: null },
  { id: 'av2-2', name: '10 Aulas', description: 'Participou de 10 aulas', category: 'JORNADA', rarity: 'common', icon: '💪', is_earned: true, earned_at: '2025-07-15', progress_percent: null, progress_label: null },
  { id: 'av2-3', name: '50 Aulas', description: 'Participou de 50 aulas', category: 'JORNADA', rarity: 'rare', icon: '🏅', is_earned: true, earned_at: '2026-01-10', progress_percent: null, progress_label: null },
  { id: 'av2-4', name: '100 Aulas', description: 'Participou de 100 aulas — Centurião!', category: 'JORNADA', rarity: 'epic', icon: '🏆', is_earned: false, earned_at: null, progress_percent: 72, progress_label: '72/100 aulas' },
  { id: 'av2-5', name: '500 Aulas', description: 'Meio milhar de treinos — Lendário!', category: 'JORNADA', rarity: 'legendary', icon: '👑', is_earned: false, earned_at: null, progress_percent: 14, progress_label: '72/500 aulas' },
  { id: 'av2-6', name: '1 Ano de Treino', description: 'Completou 1 ano treinando sem parar', category: 'JORNADA', rarity: 'rare', icon: '📅', is_earned: false, earned_at: null, progress_percent: 80, progress_label: '9/12 meses' },

  // CONSTANCIA (orange)
  { id: 'av2-7', name: 'Streak 7 Dias', description: '7 dias consecutivos de presença', category: 'CONSTANCIA', rarity: 'common', icon: '🔥', is_earned: true, earned_at: '2026-02-20', progress_percent: null, progress_label: null },
  { id: 'av2-8', name: 'Streak 30 Dias', description: '30 dias consecutivos — Inabalável!', category: 'CONSTANCIA', rarity: 'rare', icon: '🔥', is_earned: false, earned_at: null, progress_percent: 77, progress_label: '23/30 dias' },
  { id: 'av2-9', name: 'Streak 90 Dias', description: '90 dias sem faltar — Máquina!', category: 'CONSTANCIA', rarity: 'epic', icon: '🔥', is_earned: false, earned_at: null, progress_percent: 26, progress_label: '23/90 dias' },
  { id: 'av2-10', name: 'Streak 365 Dias', description: 'Um ano inteiro sem faltar — Lenda!', category: 'CONSTANCIA', rarity: 'legendary', icon: '🔥', is_earned: false, earned_at: null, progress_percent: 6, progress_label: '23/365 dias' },
  { id: 'av2-11', name: 'Madrugador', description: 'Treinou 20 vezes antes das 8h da manhã', category: 'CONSTANCIA', rarity: 'rare', icon: '🌅', is_earned: true, earned_at: '2026-03-01', progress_percent: null, progress_label: null },

  // FAIXA (belt color)
  { id: 'av2-12', name: 'Faixa Cinza', description: 'Promovido à faixa cinza', category: 'FAIXA', rarity: 'common', icon: '🥋', is_earned: true, earned_at: '2025-03-15', progress_percent: null, progress_label: null },
  { id: 'av2-13', name: 'Faixa Amarela', description: 'Promovido à faixa amarela', category: 'FAIXA', rarity: 'common', icon: '🥋', is_earned: true, earned_at: '2025-06-20', progress_percent: null, progress_label: null },
  { id: 'av2-14', name: 'Faixa Laranja', description: 'Promovido à faixa laranja', category: 'FAIXA', rarity: 'rare', icon: '🥋', is_earned: true, earned_at: '2025-09-10', progress_percent: null, progress_label: null },
  { id: 'av2-15', name: 'Faixa Verde', description: 'Promovido à faixa verde', category: 'FAIXA', rarity: 'rare', icon: '🥋', is_earned: true, earned_at: '2025-11-30', progress_percent: null, progress_label: null },
  { id: 'av2-16', name: 'Faixa Azul', description: 'Promovido à faixa azul', category: 'FAIXA', rarity: 'epic', icon: '🥋', is_earned: true, earned_at: '2026-02-01', progress_percent: null, progress_label: null },
  { id: 'av2-17', name: 'Faixa Roxa', description: 'Promovido à faixa roxa', category: 'FAIXA', rarity: 'epic', icon: '🥋', is_earned: false, earned_at: null, progress_percent: 45, progress_label: '45% do caminho' },
  { id: 'av2-18', name: 'Faixa Preta', description: 'Promovido à faixa preta — Mestre!', category: 'FAIXA', rarity: 'legendary', icon: '🥋', is_earned: false, earned_at: null, progress_percent: 12, progress_label: '12% do caminho' },

  // SOCIAL (green)
  { id: 'av2-19', name: 'Primeira Amizade', description: 'Adicionou seu primeiro amigo na academia', category: 'SOCIAL', rarity: 'common', icon: '🤝', is_earned: true, earned_at: '2025-06-05', progress_percent: null, progress_label: null },
  { id: 'av2-20', name: 'Influenciador', description: '10 curtidas em um post do feed', category: 'SOCIAL', rarity: 'rare', icon: '⭐', is_earned: true, earned_at: '2026-01-20', progress_percent: null, progress_label: null },
  { id: 'av2-21', name: 'Mentor', description: 'Ajudou 5 alunos novatos no seu primeiro mês', category: 'SOCIAL', rarity: 'epic', icon: '🧑‍🏫', is_earned: false, earned_at: null, progress_percent: 60, progress_label: '3/5 alunos' },
  { id: 'av2-22', name: 'Embaixador', description: 'Indicou 3 amigos que se matricularam', category: 'SOCIAL', rarity: 'legendary', icon: '🏛️', is_earned: false, earned_at: null, progress_percent: 33, progress_label: '1/3 indicações' },

  // COMPETICAO (gold)
  { id: 'av2-23', name: 'Primeira Competição', description: 'Participou da sua primeira competição', category: 'COMPETICAO', rarity: 'rare', icon: '🏟️', is_earned: true, earned_at: '2025-10-05', progress_percent: null, progress_label: null },
  { id: 'av2-24', name: 'Medalha de Ouro', description: 'Conquistou medalha de ouro em competição', category: 'COMPETICAO', rarity: 'epic', icon: '🥇', is_earned: false, earned_at: null, progress_percent: 0, progress_label: 'Participe de uma competição' },
  { id: 'av2-25', name: 'Campeão Estadual', description: 'Campeão do campeonato estadual', category: 'COMPETICAO', rarity: 'legendary', icon: '🏆', is_earned: false, earned_at: null, progress_percent: 0, progress_label: 'Vença o estadual' },

  // CONTEUDO (purple)
  { id: 'av2-26', name: 'Primeiro Vídeo', description: 'Assistiu seu primeiro vídeo na plataforma', category: 'CONTEUDO', rarity: 'common', icon: '🎬', is_earned: true, earned_at: '2025-06-10', progress_percent: null, progress_label: null },
  { id: 'av2-27', name: 'Maratonista', description: 'Assistiu 10 vídeos em uma semana', category: 'CONTEUDO', rarity: 'rare', icon: '📺', is_earned: true, earned_at: '2026-02-15', progress_percent: null, progress_label: null },
  { id: 'av2-28', name: 'Trilha Completa', description: 'Completou uma trilha oficial inteira', category: 'CONTEUDO', rarity: 'epic', icon: '🎓', is_earned: false, earned_at: null, progress_percent: 75, progress_label: '6/8 vídeos' },
  { id: 'av2-29', name: 'Enciclopédia Viva', description: 'Assistiu 100 vídeos na plataforma', category: 'CONTEUDO', rarity: 'legendary', icon: '📚', is_earned: false, earned_at: null, progress_percent: 34, progress_label: '34/100 vídeos' },
];

export async function mockGetAchievements(_studentId: string): Promise<AchievementV2DTO[]> {
  await delay();
  return ALL_ACHIEVEMENTS;
}

export async function mockGetAchievementProgress(_studentId: string): Promise<AchievementProgressDTO> {
  await delay();
  const earned = ALL_ACHIEVEMENTS.filter((a) => a.is_earned);
  const total = ALL_ACHIEVEMENTS.length;

  // Find most rare earned achievement
  let mostRare: AchievementV2DTO | null = null;
  for (const ach of earned) {
    if (!mostRare || RARITY_ORDER.indexOf(ach.rarity) > RARITY_ORDER.indexOf(mostRare.rarity)) {
      mostRare = ach;
    }
  }

  return {
    student_id: _studentId,
    total,
    earned: earned.length,
    percent: Math.round((earned.length / total) * 100),
    most_rare_earned: mostRare,
  };
}
