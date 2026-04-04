import type { Insight } from '@/lib/api/insights.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

export async function mockGenerateInsights(_academyId: string): Promise<Insight[]> {
  await delay();
  const now = new Date().toISOString();
  return [
    { id: 'ins-1', type: 'CHURN_ALERT', severity: 'critical', title: '5 alunos não vieram há 10+ dias', description: 'Lucas, Pedro, Ana, Bruno e Mariana estão em risco de abandonar a academia.', actionUrl: '/admin/analytics', data: { count: 5 }, created_at: now },
    { id: 'ins-2', type: 'PAYMENT_OVERDUE', severity: 'critical', title: '12 faturas vencidas há 5+ dias', description: 'R$ 2.400 em inadimplência acumulada. Considere enviar lembretes.', actionUrl: '/admin/financeiro', data: { count: 12, amount: 2400 }, created_at: now },
    { id: 'ins-3', type: 'CLASS_FULL', severity: 'warning', title: 'BJJ Avançado está 95% lotada', description: 'Considere abrir uma nova turma ou aumentar a capacidade.', actionUrl: '/admin/turmas', data: { class_name: 'BJJ Avançado', occupancy: 95 }, created_at: now },
    { id: 'ins-4', type: 'BELT_READY', severity: 'info', title: '3 alunos prontos para promoção', description: 'Gabriel, Juliana e Rafael atendem os requisitos de presença e avaliação.', actionUrl: '/admin/turmas', data: { count: 3 }, created_at: now },
    { id: 'ins-5', type: 'ATTENDANCE_RECORD', severity: 'info', title: 'Presença geral subiu 20% este mês', description: 'A frequência da academia está no melhor nível dos últimos 6 meses!', actionUrl: '/admin/analytics', data: { increase: 20 }, created_at: now },
    { id: 'ins-6', type: 'PROFESSOR_HIGHLIGHT', severity: 'info', title: 'Prof. Amanda com 95% de presença média', description: 'Destaque do mês entre os professores da academia.', actionUrl: '/admin/analytics', data: { professor: 'Amanda' }, created_at: now },
    { id: 'ins-7', type: 'CLASS_EMPTY', severity: 'warning', title: 'Karatê Kids tem só 3 alunos', description: 'Considere promover a turma ou mesclar com outra.', actionUrl: '/admin/turmas', data: { class_name: 'Karatê Kids', enrolled: 3 }, created_at: now },
  ];
}
