import { BeltLevel } from '@/lib/types';
import type { ParentDashboardDTO } from '@/lib/api/parent.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGetParentDashboard(_parentId: string): Promise<ParentDashboardDTO> {
  await delay();
  return {
    filhos: [
      {
        student_id: 'stu-teen',
        display_name: 'Bruna Alves',
        avatar: null,
        belt: BeltLevel.Orange,
        idade: 15,
        presenca_mes: { total: 12, presentes: 10 },
        ultima_aula: '2026-03-14',
        proxima_aula: 'Hoje 19:00 — BJJ Noite',
        pagamento_status: 'em_dia',
      },
      {
        student_id: 'stu-kids',
        display_name: 'Lucas Alves',
        avatar: null,
        belt: BeltLevel.White,
        idade: 8,
        presenca_mes: { total: 8, presentes: 6 },
        ultima_aula: '2026-03-13',
        proxima_aula: 'Amanhã 09:00 — Judô Manhã',
        pagamento_status: 'pendente',
      },
    ],
    notificacoes: [
      { id: 'n-1', message: 'Prof. Carlos enviou uma mensagem sobre Bruna', type: 'mensagem', time: '14:30', read: false },
      { id: 'n-2', message: 'Bruna alcançou 10 presenças este mês!', type: 'conquista', time: 'Ontem', read: false },
      { id: 'n-3', message: 'Fatura de Lucas vence em 3 dias', type: 'pagamento', time: '2 dias atrás', read: true },
    ],
  };
}
