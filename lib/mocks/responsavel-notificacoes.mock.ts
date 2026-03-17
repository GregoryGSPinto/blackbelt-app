import type { NotificacaoResponsavel } from '@/lib/api/responsavel-notificacoes.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const MOCK_NOTIFICACOES: NotificacaoResponsavel[] = [
  {
    id: 'notif-01',
    type: 'presenca',
    title: 'Presenca Confirmada',
    body: 'Sophia fez check-in na aula de BJJ Teen Avancado hoje as 16:30.',
    student_name: 'Sophia',
    read: false,
    created_at: '2026-03-17T16:30:00Z',
  },
  {
    id: 'notif-02',
    type: 'alerta',
    title: 'Frequencia Baixa',
    body: 'Miguel faltou 3 aulas consecutivas esta semana. Verifique a situacao.',
    student_name: 'Miguel',
    read: false,
    created_at: '2026-03-17T10:00:00Z',
  },
  {
    id: 'notif-03',
    type: 'pagamento',
    title: 'Mensalidade Pendente',
    body: 'A mensalidade de Marco do plano Kids de Miguel vence em 3 dias (20/03).',
    student_name: 'Miguel',
    read: false,
    created_at: '2026-03-17T08:00:00Z',
  },
  {
    id: 'notif-04',
    type: 'mensagem',
    title: 'Nova Mensagem do Professor',
    body: 'Prof. Carlos enviou uma mensagem sobre o progresso da Sophia na guarda.',
    student_name: 'Sophia',
    read: false,
    created_at: '2026-03-16T14:30:00Z',
  },
  {
    id: 'notif-05',
    type: 'evento',
    title: 'Campeonato Regional — Inscricoes',
    body: 'As inscricoes para o Campeonato Regional Teen estao abertas. Prazo: 20/03.',
    student_name: 'Sophia',
    read: false,
    created_at: '2026-03-15T09:00:00Z',
  },
  {
    id: 'notif-06',
    type: 'avaliacao',
    title: 'Avaliacao Tecnica Agendada',
    body: 'A avaliacao tecnica de Miguel para grau na Faixa Cinza esta agendada para 28/03.',
    student_name: 'Miguel',
    read: true,
    created_at: '2026-03-14T11:00:00Z',
  },
  {
    id: 'notif-07',
    type: 'presenca',
    title: 'Presenca Confirmada',
    body: 'Miguel fez check-in na aula de BJJ Kids hoje as 15:00.',
    student_name: 'Miguel',
    read: true,
    created_at: '2026-03-13T15:00:00Z',
  },
  {
    id: 'notif-08',
    type: 'pagamento',
    title: 'Pagamento Confirmado',
    body: 'O pagamento da mensalidade de Marco do plano Teen de Sophia foi confirmado.',
    student_name: 'Sophia',
    read: true,
    created_at: '2026-03-12T10:15:00Z',
  },
  {
    id: 'notif-09',
    type: 'evento',
    title: 'Horario Especial — Semana Santa',
    body: 'A academia funcionara em horario reduzido durante a Semana Santa. Confira os novos horarios.',
    student_name: 'Sophia',
    read: true,
    created_at: '2026-03-12T08:00:00Z',
  },
  {
    id: 'notif-10',
    type: 'avaliacao',
    title: 'Resultado da Avaliacao',
    body: 'Sophia foi aprovada na avaliacao tecnica com nota 9.2. Parabens!',
    student_name: 'Sophia',
    read: true,
    created_at: '2026-03-10T16:00:00Z',
  },
  {
    id: 'notif-11',
    type: 'mensagem',
    title: 'Mensagem do Prof. Marcos',
    body: 'Prof. Marcos elogiou a disciplina do Miguel durante a aula de quinta-feira.',
    student_name: 'Miguel',
    read: true,
    created_at: '2026-03-08T14:00:00Z',
  },
  {
    id: 'notif-12',
    type: 'alerta',
    title: 'Documento Pendente',
    body: 'O atestado medico de Miguel precisa ser renovado ate 30/03. Envie pelo app.',
    student_name: 'Miguel',
    read: true,
    created_at: '2026-03-06T09:30:00Z',
  },
];

export async function mockGetNotificacoes(_guardianId: string): Promise<NotificacaoResponsavel[]> {
  await delay();
  return MOCK_NOTIFICACOES;
}

export async function mockMarcarLida(_id: string): Promise<void> {
  await delay();
}

export async function mockMarcarTodasLidas(_guardianId: string): Promise<void> {
  await delay();
}
