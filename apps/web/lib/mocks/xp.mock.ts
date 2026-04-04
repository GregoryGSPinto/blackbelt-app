import { BeltLevel } from '@/lib/types';
import type { XPDTO, RankedStudent } from '@/lib/api/xp.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGetXP(_studentId: string): Promise<XPDTO> {
  await delay();
  return { xp: 2450, level: 7, nextLevelXP: 3000, rank: 3 };
}

export async function mockGetLeaderboard(_academyId: string): Promise<RankedStudent[]> {
  await delay();
  return [
    { student_id: 'stu-7', display_name: 'Rafael Souza', avatar: null, belt: BeltLevel.Brown, xp: 4200, level: 12, rank: 1 },
    { student_id: 'stu-2', display_name: 'Maria Oliveira', avatar: null, belt: BeltLevel.Purple, xp: 3800, level: 10, rank: 2 },
    { student_id: 'stu-teen', display_name: 'Bruna Alves', avatar: null, belt: BeltLevel.Orange, xp: 2450, level: 7, rank: 3 },
    { student_id: 'stu-1', display_name: 'João Mendes', avatar: null, belt: BeltLevel.Blue, xp: 2300, level: 7, rank: 4 },
    { student_id: 'stu-5', display_name: 'Lucas Ferreira', avatar: null, belt: BeltLevel.Green, xp: 1950, level: 6, rank: 5 },
  ];
}
