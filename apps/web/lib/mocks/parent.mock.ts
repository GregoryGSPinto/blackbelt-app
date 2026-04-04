import { BeltLevel } from '@/lib/types';
import type { ParentDashboardDTO } from '@/lib/api/parent.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGetParentDashboard(_parentId: string): Promise<ParentDashboardDTO> {
  await delay();
  return {
    filhos: [
      {
        student_id: 'stu-teen',
        profile_id: 'prof-teen',
        display_name: 'Bruna Alves',
        avatar: null,
        belt: BeltLevel.Orange,
        belt_label: 'Faixa Laranja',
        idade: 15,
        role: 'aluno_teen',
        presenca_mes: { total: 12, presentes: 10 },
        ultima_aula: '2026-03-14',
        proxima_aula: 'Hoje 19:00 — BJJ Noite',
        pagamento_status: 'em_dia',
        streak: 5,
      },
      {
        student_id: 'stu-kids',
        profile_id: 'prof-kids',
        display_name: 'Lucas Alves',
        avatar: null,
        belt: BeltLevel.White,
        belt_label: 'Faixa Branca',
        idade: 8,
        role: 'aluno_kids',
        presenca_mes: { total: 8, presentes: 6 },
        ultima_aula: '2026-03-13',
        proxima_aula: 'Amanha 09:00 — Judo Manha',
        pagamento_status: 'pendente',
        streak: 2,
      },
    ],
    notificacoes: [
      { id: 'n-1', message: 'Prof. Carlos enviou uma mensagem sobre Bruna', type: 'mensagem', time: '14:30', read: false },
      { id: 'n-2', message: 'Bruna alcancou 10 presencas este mes!', type: 'conquista', time: 'Ontem', read: false },
      { id: 'n-3', message: 'Fatura de Lucas vence em 3 dias', type: 'pagamento', time: '2 dias atras', read: true },
    ],
  };
}
