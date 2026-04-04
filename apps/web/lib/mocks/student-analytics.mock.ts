import type { StudentPerformanceDTO } from '@/lib/api/student-analytics.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const MONTHS_PT = ['Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar'];

export async function mockGetStudentPerformance(_studentId: string): Promise<StudentPerformanceDTO> {
  await delay();
  return {
    radar: { technique: 82, discipline: 68, attendance: 88, evolution: 75 },
    class_avg_radar: { technique: 72, discipline: 70, attendance: 78, evolution: 65 },
    monthly_attendance: MONTHS_PT.map((m, i) => ({ month: m, count: 8 + Math.floor(Math.random() * 8) + i })),
    max_streak: 14,
    total_training_hours: 186,
    recommendations: [
      'Foque em disciplina esta semana — sua nota está 2 pontos abaixo da média.',
      'Você treina 2x/semana. Para progredir mais rápido, tente 3x.',
      'Sua técnica está acima da média — parabéns! Continue assim.',
    ],
    video_suggestions: [
      { id: 'vid-3', title: 'Triângulo — Detalhes', reason: 'Reforçar técnica de finalização' },
      { id: 'vid-1', title: 'Guarda Fechada — Fundamentos', reason: 'Baseado na sua avaliação de guarda' },
    ],
  };
}
