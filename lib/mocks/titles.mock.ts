import type { TitleDTO } from '@/lib/api/titles.service';

const delay = () => new Promise((r) => setTimeout(r, 350));

const TITLES: TitleDTO[] = [
  // Common
  { id: 'title-1', name: 'Iniciante', description: 'Completou seu primeiro check-in', rarity: 'common', requirement: 'Realizar 1 check-in', icon_url: '/titles/iniciante.svg', color: '#9CA3AF', is_unlocked: true, is_equipped: false, unlocked_at: '2025-09-15' },
  { id: 'title-2', name: 'Regular', description: 'Frequenta a academia regularmente', rarity: 'common', requirement: '30 check-ins realizados', icon_url: '/titles/regular.svg', color: '#9CA3AF', is_unlocked: true, is_equipped: false, unlocked_at: '2025-11-02' },
  { id: 'title-3', name: 'Dedicado', description: 'Demonstra dedicação constante nos treinos', rarity: 'common', requirement: '100 check-ins realizados', icon_url: '/titles/dedicado.svg', color: '#9CA3AF', is_unlocked: false, is_equipped: false },
  // Rare
  { id: 'title-4', name: 'Faixa de Ferro', description: 'Resistência inabalável no tatame', rarity: 'rare', requirement: '50 aulas consecutivas sem falta', icon_url: '/titles/faixa-ferro.svg', color: '#3B82F6', is_unlocked: false, is_equipped: false },
  { id: 'title-5', name: 'Streak Master', description: 'Mestre das sequências de treino', rarity: 'rare', requirement: 'Streak de 30 dias consecutivos', icon_url: '/titles/streak-master.svg', color: '#3B82F6', is_unlocked: true, is_equipped: false, unlocked_at: '2026-01-20' },
  { id: 'title-6', name: 'Estudioso', description: 'Consumiu muito conteúdo educativo', rarity: 'rare', requirement: 'Assistir 50 vídeos de técnica', icon_url: '/titles/estudioso.svg', color: '#3B82F6', is_unlocked: false, is_equipped: false },
  // Epic
  { id: 'title-7', name: 'Embaixador', description: 'Trouxe novos alunos para a academia', rarity: 'epic', requirement: 'Indicar 5 amigos que se matricularam', icon_url: '/titles/embaixador.svg', color: '#8B5CF6', is_unlocked: false, is_equipped: false },
  { id: 'title-8', name: 'Competidor', description: 'Participou de torneios com destaque', rarity: 'epic', requirement: 'Participar de 3 torneios', icon_url: '/titles/competidor.svg', color: '#8B5CF6', is_unlocked: false, is_equipped: false },
  { id: 'title-9', name: 'Mentor', description: 'Ajuda outros alunos em sua jornada', rarity: 'epic', requirement: 'Receber 20 avaliações positivas de colegas', icon_url: '/titles/mentor.svg', color: '#8B5CF6', is_unlocked: false, is_equipped: false },
  // Legendary
  { id: 'title-10', name: 'Centurião', description: 'Lenda viva da academia, 1000 aulas completas', rarity: 'legendary', requirement: '1000 check-ins realizados', icon_url: '/titles/centuriao.svg', color: '#F59E0B', is_unlocked: false, is_equipped: false },
  { id: 'title-11', name: 'Faixa Preta', description: 'O mais alto nível de comprometimento', rarity: 'legendary', requirement: 'Alcançar faixa preta na academia', icon_url: '/titles/faixa-preta.svg', color: '#F59E0B', is_unlocked: false, is_equipped: false },
  { id: 'title-12', name: 'Guerreiro Lendário', description: 'Top 1 da Season por 3 temporadas', rarity: 'legendary', requirement: 'Ser #1 em 3 Seasons diferentes', icon_url: '/titles/guerreiro-lendario.svg', color: '#F59E0B', is_unlocked: true, is_equipped: true, unlocked_at: '2026-02-01' },
];

export async function mockGetAvailableTitles(_userId: string): Promise<TitleDTO[]> {
  await delay();
  return TITLES.map((t) => ({ ...t }));
}

export async function mockGetMyTitles(_userId: string): Promise<TitleDTO[]> {
  await delay();
  return TITLES.filter((t) => t.is_unlocked).map((t) => ({ ...t }));
}

export async function mockEquipTitle(_userId: string, titleId: string): Promise<{ success: boolean }> {
  await delay();
  TITLES.forEach((t) => { t.is_equipped = t.id === titleId; });
  return { success: true };
}

export async function mockUnequipTitle(_userId: string): Promise<{ success: boolean }> {
  await delay();
  TITLES.forEach((t) => { t.is_equipped = false; });
  return { success: true };
}
