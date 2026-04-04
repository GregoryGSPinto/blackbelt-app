import { BeltLevel } from '@/lib/types/domain';
import type { TeenDashboardDTO } from '@/lib/api/teen.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGetTeenDashboard(_studentId: string): Promise<TeenDashboardDTO> {
  await delay();
  return {
    profile: {
      student_id: 'stu-teen-lucas',
      display_name: 'Lucas Ferreira',
      avatar: null,
      belt: BeltLevel.Orange,
      title: 'Guerreiro do Tatame',
      bio: 'Oss! Treino desde os 12 anos. Foco na faixa verde!',
    },
    xp: 2450,
    level: 8,
    next_level_xp: 3000,
    rank_position: 3,
    xp_this_week: 340,
    videos_watched: 7,
    active_challenge: {
      id: 'ch-marco-2026',
      title: 'GUERREIRO DE MARÇO',
      progress: 8,
      target: 12,
      days_remaining: 16,
      reward_xp: 500,
      emoji: '💪',
    },
    weekly_challenges: [
      { id: 'wc-1', title: 'Treine 3x esta semana', emoji: '🥋', progress: 2, target: 3, reward_xp: 150 },
      { id: 'wc-2', title: 'Assista 2 vídeos', emoji: '🎬', progress: 1, target: 2, reward_xp: 80 },
      { id: 'wc-3', title: 'Pratique 1 kata completo', emoji: '🧘', progress: 0, target: 1, reward_xp: 100 },
    ],
    ranking: [
      { student_id: 'stu-1', display_name: 'Sophia', avatar: null, xp: 3100, rank: 1, is_current_user: false },
      { student_id: 'stu-2', display_name: 'Valentina', avatar: null, xp: 2800, rank: 2, is_current_user: false },
      { student_id: 'stu-teen-lucas', display_name: 'Lucas', avatar: null, xp: 2450, rank: 3, is_current_user: true },
      { student_id: 'stu-4', display_name: 'Pedro', avatar: null, xp: 2200, rank: 4, is_current_user: false },
      { student_id: 'stu-5', display_name: 'Ana', avatar: null, xp: 1900, rank: 5, is_current_user: false },
    ],
    achievements: [
      { id: 'ach-1', name: 'Streak 7 dias', icon: '🔥', unlocked: true, unlocked_at: '2026-03-10', glow_color: '#f97316' },
      { id: 'ach-2', name: 'Faixa Laranja', icon: '🥋', unlocked: true, unlocked_at: '2026-02-15', glow_color: '#f59e0b' },
      { id: 'ach-3', name: '50 Aulas', icon: '💪', unlocked: true, unlocked_at: '2026-01-20', glow_color: '#10b981' },
      { id: 'ach-4', name: 'Top 3 Ranking', icon: '🏆', unlocked: true, unlocked_at: '2026-03-05', glow_color: '#eab308' },
      { id: 'ach-5', name: 'Primeira Competicao', icon: '🥇', unlocked: false, unlocked_at: null, glow_color: '#6366f1' },
    ],
    next_achievement: {
      name: '100 Aulas',
      icon: '🎯',
      progress: 72,
      target: 100,
      description: 'Participe de 100 aulas para desbloquear!',
    },
    streak: {
      current_days: 5,
      best_ever: 12,
      is_active: true,
    },
    continue_watching: [
      { id: 'vid-1', title: 'Postura base e equilibrio', thumbnail_emoji: '🥋', progress_percent: 65, duration_label: '4:30 restantes', reward_xp: 30 },
      { id: 'vid-2', title: 'Defesa pessoal nivel 2', thumbnail_emoji: '🛡️', progress_percent: 20, duration_label: '12:00 restantes', reward_xp: 50 },
    ],
    next_class: {
      id: 'cls-next-1',
      title: 'Jiu-Jitsu Teen Avancado',
      instructor: 'Sensei Ricardo',
      starts_at: new Date(Date.now() + 3 * 60 * 60 * 1000 + 42 * 60 * 1000).toISOString(),
      location: 'Tatame Principal',
    },
  };
}
