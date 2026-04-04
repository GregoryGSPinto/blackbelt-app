import type {
  AdminDashboardDTO,
  AdminMetrics,
} from '@/lib/api/admin.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGetAdminDashboard(_academyId: string): Promise<AdminDashboardDTO> {
  await delay();
  return {
    totalAlunos: 127,
    alunosAtivos: 112,
    novosEsteMes: 8,
    totalTurmas: 8,
    turmasHoje: 5,
    receitaMensal: 18_450,
    inadimplencia: 7.2,
    presencaMedia: 74,
    ultimosCheckins: [
      { student_name: 'João Mendes', class_name: 'BJJ Manhã', time: '07:15' },
      { student_name: 'Maria Oliveira', class_name: 'BJJ Manhã', time: '07:12' },
      { student_name: 'Lucas Ferreira', class_name: 'BJJ Manhã', time: '07:08' },
      { student_name: 'Ana Costa', class_name: 'Judô Manhã', time: '08:02' },
      { student_name: 'Pedro Santos', class_name: 'Judô Manhã', time: '07:58' },
    ],
    proximasAulas: [
      { class_name: 'Karatê Noite', professor_name: 'Roberto Lima', time: '19:00', enrolled: 11 },
      { class_name: 'BJJ Noite', professor_name: 'Carlos Silva', time: '19:00', enrolled: 15 },
      { class_name: 'MMA Noite', professor_name: 'Fernanda Costa', time: '20:30', enrolled: 7 },
    ],
    alertas: [
      { type: 'payment', message: '9 faturas vencidas há mais de 7 dias', severity: 'error' },
      { type: 'capacity', message: 'BJJ Noite com 15/20 vagas (75%)', severity: 'warning' },
      { type: 'system', message: 'Backup do banco realizado com sucesso', severity: 'info' },
    ],
  };
}

export async function mockGetAdminMetrics(_academyId: string, _period: string): Promise<AdminMetrics> {
  await delay();

  const presencaPorDia: AdminMetrics['presencaPorDia'] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    presencaPorDia.push({
      date: d.toISOString().split('T')[0],
      count: d.getDay() === 0 ? 0 : 30 + Math.floor(Math.random() * 50),
    });
  }

  return {
    presencaPorDia,
    receitaPorMes: [
      { month: '2025-10', receita: 16_200, inadimplencia: 1_800 },
      { month: '2025-11', receita: 17_100, inadimplencia: 1_500 },
      { month: '2025-12', receita: 15_800, inadimplencia: 2_200 },
      { month: '2026-01', receita: 17_800, inadimplencia: 1_400 },
      { month: '2026-02', receita: 18_000, inadimplencia: 1_200 },
      { month: '2026-03', receita: 18_450, inadimplencia: 1_350 },
    ],
    alunosPorFaixa: [
      { belt: 'Branca', count: 38 },
      { belt: 'Cinza', count: 12 },
      { belt: 'Amarela', count: 18 },
      { belt: 'Laranja', count: 15 },
      { belt: 'Verde', count: 14 },
      { belt: 'Azul', count: 11 },
      { belt: 'Roxa', count: 7 },
      { belt: 'Marrom', count: 4 },
      { belt: 'Preta', count: 2 },
    ],
    turmasLotacao: [
      { name: 'BJJ Noite', percent: 75 },
      { name: 'BJJ Manhã', percent: 60 },
      { name: 'Karatê Noite', percent: 55 },
      { name: 'Judô Manhã', percent: 56 },
      { name: 'Karatê Manhã', percent: 56 },
      { name: 'Judô Tarde', percent: 53 },
      { name: 'MMA Noite', percent: 58 },
      { name: 'MMA Sábado', percent: 42 },
    ],
  };
}
