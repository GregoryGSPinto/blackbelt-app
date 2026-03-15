import type { FamilyCalendarDTO, MonthlyReportDTO } from '@/lib/api/agenda-familiar.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGetFamilyCalendar(_profileId: string): Promise<FamilyCalendarDTO> {
  await delay();
  return {
    profile_id: 'prof-guardian-1',
    week_start: '2026-03-16',
    week_end: '2026-03-22',
    events: [
      { id: 'ev-1', child_name: 'Sophia', child_avatar: null, class_name: 'BJJ Teen', day_of_week: 1, day_label: 'Seg', time: '19h', color: '#10b981' },
      { id: 'ev-2', child_name: 'Miguel', child_avatar: null, class_name: 'Jiu-Jitsu Kids', day_of_week: 2, day_label: 'Ter', time: '17h', color: '#6366f1' },
      { id: 'ev-3', child_name: 'Sophia', child_avatar: null, class_name: 'BJJ Teen', day_of_week: 3, day_label: 'Qua', time: '19h', color: '#10b981' },
      { id: 'ev-4', child_name: 'Miguel', child_avatar: null, class_name: 'Jiu-Jitsu Kids', day_of_week: 4, day_label: 'Qui', time: '17h', color: '#6366f1' },
      { id: 'ev-5', child_name: 'Sophia', child_avatar: null, class_name: 'BJJ Teen', day_of_week: 5, day_label: 'Sex', time: '19h', color: '#10b981' },
      { id: 'ev-6', child_name: 'Sophia', child_avatar: null, class_name: 'Sparring', day_of_week: 6, day_label: 'Sáb', time: '10h', color: '#f59e0b' },
      { id: 'ev-7', child_name: 'Miguel', child_avatar: null, class_name: 'Judô Kids', day_of_week: 6, day_label: 'Sáb', time: '09h', color: '#ef4444' },
    ],
  };
}

export async function mockGetMonthlyReport(_profileId: string, _month: string): Promise<MonthlyReportDTO> {
  await delay();
  return {
    profile_id: 'prof-guardian-1',
    month_label: 'Março 2026',
    month: '2026-03',
    children: [
      {
        student_id: 'stu-sophia',
        display_name: 'Sophia',
        attendance_count: 10,
        attendance_total: 12,
        attendance_percent: 83,
        xp_gained: 650,
        belt_current: 'Faixa Verde',
        achievements_count: 2,
        highlights: [
          'Top 3 no ranking da academia',
          'Streak de 10 dias consecutivos',
        ],
      },
      {
        student_id: 'stu-miguel',
        display_name: 'Miguel',
        attendance_count: 6,
        attendance_total: 8,
        attendance_percent: 75,
        xp_gained: 0,
        belt_current: 'Faixa Cinza',
        achievements_count: 1,
        highlights: [
          'Conquistou figurinha rara do álbum',
          'Ganhou 15 estrelas novas',
        ],
      },
    ],
    payments: [
      { child_name: 'Sophia', plan_name: 'Teen', amount: 149, status: 'em_dia' },
      { child_name: 'Miguel', plan_name: 'Kids', amount: 99, status: 'em_dia' },
    ],
    total_paid: 248,
  };
}
