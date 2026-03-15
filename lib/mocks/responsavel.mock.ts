import { BeltLevel } from '@/lib/types/domain';
import type { GuardianDashboardDTO } from '@/lib/api/responsavel.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGetGuardianDashboard(_profileId: string): Promise<GuardianDashboardDTO> {
  await delay();
  return {
    profile_id: 'prof-guardian-1',
    guardian_name: 'Carla Mendes',
    children: [
      {
        student_id: 'stu-sophia',
        display_name: 'Sophia',
        avatar: null,
        age: 16,
        belt: BeltLevel.Green,
        belt_label: 'Faixa Verde',
        frequency_percent: 87,
        payment: {
          plan_name: 'Teen',
          price: 149,
          status: 'em_dia',
        },
        health_score: {
          score: 92,
          label: 'Excelente',
          color: '#10b981',
        },
        week_attendance: {
          mon: 'present',
          tue: 'absent',
          wed: 'present',
          thu: 'present',
          fri: 'pending',
        },
        journey_milestones: [
          { id: 'jm-1', title: 'Conquistou Faixa Verde', date: '2026-02-20', emoji: '🥋' },
          { id: 'jm-2', title: 'Top 3 no Ranking', date: '2026-03-05', emoji: '🏆' },
          { id: 'jm-3', title: 'Streak de 10 dias', date: '2026-03-12', emoji: '🔥' },
        ],
        messages: [
          {
            id: 'msg-1',
            teacher_name: 'Prof. Carlos',
            preview: 'Sophia está evoluindo muito bem na guarda! Parabéns.',
            time: '14:30',
            unread: true,
          },
          {
            id: 'msg-2',
            teacher_name: 'Prof. Ana',
            preview: 'Lembrete: competição regional dia 25.',
            time: 'Ontem',
            unread: false,
          },
        ],
      },
      {
        student_id: 'stu-miguel',
        display_name: 'Miguel',
        avatar: null,
        age: 10,
        belt: BeltLevel.Gray,
        belt_label: 'Faixa Cinza',
        frequency_percent: 75,
        payment: {
          plan_name: 'Kids',
          price: 99,
          status: 'em_dia',
        },
        health_score: {
          score: 78,
          label: 'Bom',
          color: '#f59e0b',
        },
        week_attendance: {
          mon: 'none',
          tue: 'present',
          wed: 'none',
          thu: 'present',
          fri: 'none',
        },
        journey_milestones: [
          { id: 'jm-4', title: 'Primeira aula concluída', date: '2026-01-10', emoji: '⭐' },
          { id: 'jm-5', title: '20 estrelas coletadas', date: '2026-02-15', emoji: '🌟' },
          { id: 'jm-6', title: 'Figurinha rara desbloqueada', date: '2026-03-08', emoji: '🎉' },
        ],
        messages: [
          {
            id: 'msg-3',
            teacher_name: 'Prof. Marcos',
            preview: 'Miguel está se adaptando bem à turma. Muito disciplinado!',
            time: '10:15',
            unread: true,
          },
        ],
      },
    ],
    consolidated: {
      total_monthly: 248,
      child_count: 2,
    },
  };
}
