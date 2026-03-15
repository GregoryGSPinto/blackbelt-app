import { BeltLevel } from '@/lib/types';
import type { AlunoDashboardDTO } from '@/lib/api/aluno.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGetAlunoDashboard(_studentId: string): Promise<AlunoDashboardDTO> {
  await delay();
  return {
    proximaAula: {
      class_id: 'class-bjj-noite',
      modality_name: 'Brazilian Jiu-Jitsu',
      professor_name: 'Carlos Silva',
      start_time: '19:00',
      end_time: '20:30',
      unit_name: 'Unidade Centro',
    },
    progressoFaixa: {
      faixa_atual: BeltLevel.Blue,
      proxima_faixa: BeltLevel.Purple,
      percentual: 65,
      aulas_necessarias: 80,
      aulas_concluidas: 52,
    },
    frequenciaMes: {
      total_aulas: 12,
      presencas: 9,
      dias_presentes: [1, 3, 5, 7, 8, 10, 12, 14, 15],
    },
    streak: 5,
    conteudoRecomendado: [
      { video_id: 'vid-1', title: 'Guarda Fechada — Fundamentos', duration: 15, belt_level: BeltLevel.Blue },
      { video_id: 'vid-2', title: 'Raspagem de Gancho', duration: 12, belt_level: BeltLevel.Blue },
      { video_id: 'vid-3', title: 'Passagem de Guarda — Pressão', duration: 20, belt_level: BeltLevel.Blue },
    ],
    ultimasConquistas: [
      { id: 'ach-1', name: 'Streak 5 dias', type: 'attendance_streak', granted_at: '2026-03-14' },
      { id: 'ach-2', name: '50 aulas', type: 'class_milestone', granted_at: '2026-03-10' },
    ],
  };
}
