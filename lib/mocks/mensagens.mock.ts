import type {
  ConversationDTO,
  MessageDTO,
  StudentContextDTO,
  SuggestedMessageDTO,
} from '@/lib/api/mensagens.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const CONVERSATIONS: ConversationDTO[] = [
  {
    id: 'conv-1',
    participant_id: 'stu-1',
    participant_name: 'Joao Mendes',
    participant_avatar: null,
    participant_belt: 'blue',
    last_message: 'Professor, preciso de ajuda com a tecnica de guarda',
    last_message_time: '14:30',
    unread_count: 2,
    is_at_risk: true,
  },
  {
    id: 'conv-2',
    participant_id: 'stu-2',
    participant_name: 'Maria Oliveira',
    participant_avatar: null,
    participant_belt: 'purple',
    last_message: 'Obrigada pela dica de ontem!',
    last_message_time: '10:15',
    unread_count: 0,
    is_at_risk: false,
  },
  {
    id: 'conv-3',
    participant_id: 'stu-3',
    participant_name: 'Rafael Souza',
    participant_avatar: null,
    participant_belt: 'white',
    last_message: 'Posso fazer reposicao na turma de manha?',
    last_message_time: 'Ontem',
    unread_count: 1,
    is_at_risk: true,
  },
  {
    id: 'conv-4',
    participant_id: 'stu-4',
    participant_name: 'Lucas Ferreira',
    participant_avatar: null,
    participant_belt: 'green',
    last_message: 'Quando sera a proxima avaliacao?',
    last_message_time: 'Ontem',
    unread_count: 0,
    is_at_risk: false,
  },
  {
    id: 'conv-5',
    participant_id: 'stu-5',
    participant_name: 'Ana Costa',
    participant_avatar: null,
    participant_belt: 'yellow',
    last_message: 'Vou faltar amanha, tudo bem?',
    last_message_time: '2 dias',
    unread_count: 0,
    is_at_risk: true,
  },
];

const MESSAGES_BY_CONV: Record<string, MessageDTO[]> = {
  'conv-1': [
    { id: 'm-1', from_id: 'stu-1', from_name: 'Joao Mendes', from_avatar: null, content: 'Professor, tudo bem?', sent_at: '2026-03-14T14:00:00Z', is_mine: false, read_at: '2026-03-14T14:01:00Z' },
    { id: 'm-2', from_id: 'prof-1', from_name: 'Carlos Silva', from_avatar: null, content: 'Tudo sim, Joao! Em que posso ajudar?', sent_at: '2026-03-14T14:05:00Z', is_mine: true, read_at: '2026-03-14T14:06:00Z' },
    { id: 'm-3', from_id: 'stu-1', from_name: 'Joao Mendes', from_avatar: null, content: 'Estou com dificuldade na passagem de guarda. Tem alguma dica?', sent_at: '2026-03-14T14:10:00Z', is_mine: false, read_at: '2026-03-14T14:11:00Z' },
    { id: 'm-4', from_id: 'prof-1', from_name: 'Carlos Silva', from_avatar: null, content: 'Claro! Foca na pressao do quadril e no controle das mangas. Amanha vamos treinar isso.', sent_at: '2026-03-14T14:15:00Z', is_mine: true, read_at: '2026-03-14T14:16:00Z' },
    { id: 'm-5', from_id: 'stu-1', from_name: 'Joao Mendes', from_avatar: null, content: 'Perfeito, obrigado! Vou assistir o video que voce compartilhou tambem.', sent_at: '2026-03-14T14:20:00Z', is_mine: false, read_at: '2026-03-14T14:21:00Z' },
    { id: 'm-6', from_id: 'stu-1', from_name: 'Joao Mendes', from_avatar: null, content: 'Professor, preciso de ajuda com a tecnica de guarda', sent_at: '2026-03-14T14:30:00Z', is_mine: false, read_at: null },
  ],
  'conv-2': [
    { id: 'm-10', from_id: 'stu-2', from_name: 'Maria Oliveira', from_avatar: null, content: 'Professor, aquela dica da raspagem foi otima!', sent_at: '2026-03-14T10:00:00Z', is_mine: false, read_at: '2026-03-14T10:02:00Z' },
    { id: 'm-11', from_id: 'prof-1', from_name: 'Carlos Silva', from_avatar: null, content: 'Que bom! Continue praticando, voce esta evoluindo muito.', sent_at: '2026-03-14T10:10:00Z', is_mine: true, read_at: '2026-03-14T10:11:00Z' },
    { id: 'm-12', from_id: 'stu-2', from_name: 'Maria Oliveira', from_avatar: null, content: 'Obrigada pela dica de ontem!', sent_at: '2026-03-14T10:15:00Z', is_mine: false, read_at: '2026-03-14T10:16:00Z' },
  ],
  'conv-3': [
    { id: 'm-20', from_id: 'stu-3', from_name: 'Rafael Souza', from_avatar: null, content: 'Oi professor, nao consegui ir na aula de ontem.', sent_at: '2026-03-13T18:00:00Z', is_mine: false, read_at: '2026-03-13T18:30:00Z' },
    { id: 'm-21', from_id: 'prof-1', from_name: 'Carlos Silva', from_avatar: null, content: 'Sem problemas! Pode repor amanha na turma das 8h.', sent_at: '2026-03-13T18:35:00Z', is_mine: true, read_at: '2026-03-13T19:00:00Z' },
    { id: 'm-22', from_id: 'stu-3', from_name: 'Rafael Souza', from_avatar: null, content: 'Posso fazer reposicao na turma de manha?', sent_at: '2026-03-14T08:00:00Z', is_mine: false, read_at: null },
  ],
  'conv-4': [
    { id: 'm-30', from_id: 'stu-4', from_name: 'Lucas Ferreira', from_avatar: null, content: 'Professor, quando sera a proxima avaliacao de faixa?', sent_at: '2026-03-13T16:00:00Z', is_mine: false, read_at: '2026-03-13T16:05:00Z' },
    { id: 'm-31', from_id: 'prof-1', from_name: 'Carlos Silva', from_avatar: null, content: 'Final do mes, dia 28. Voce ja esta quase pronto!', sent_at: '2026-03-13T16:10:00Z', is_mine: true, read_at: '2026-03-13T16:15:00Z' },
    { id: 'm-32', from_id: 'stu-4', from_name: 'Lucas Ferreira', from_avatar: null, content: 'Quando sera a proxima avaliacao?', sent_at: '2026-03-13T16:20:00Z', is_mine: false, read_at: '2026-03-13T16:25:00Z' },
  ],
  'conv-5': [
    { id: 'm-40', from_id: 'stu-5', from_name: 'Ana Costa', from_avatar: null, content: 'Professor, estou com uma lesao no joelho.', sent_at: '2026-03-12T09:00:00Z', is_mine: false, read_at: '2026-03-12T09:05:00Z' },
    { id: 'm-41', from_id: 'prof-1', from_name: 'Carlos Silva', from_avatar: null, content: 'Cuide-se! Quando melhorar, fazemos um treino adaptado.', sent_at: '2026-03-12T09:10:00Z', is_mine: true, read_at: '2026-03-12T09:15:00Z' },
    { id: 'm-42', from_id: 'stu-5', from_name: 'Ana Costa', from_avatar: null, content: 'Vou faltar amanha, tudo bem?', sent_at: '2026-03-13T20:00:00Z', is_mine: false, read_at: '2026-03-13T20:10:00Z' },
  ],
};

const STUDENT_CONTEXTS: Record<string, StudentContextDTO> = {
  'stu-1': {
    student_id: 'stu-1',
    display_name: 'Joao Mendes',
    belt: 'blue',
    avatar: null,
    last_attendance: '2026-03-14T19:00:00Z',
    streak: 12,
    health_score: 45,
    latest_evaluation: {
      technique: 7,
      discipline: 8,
      attendance: 6,
      evolution: 7,
      date: '2026-02-28',
    },
    current_plan: 'Plano Mensal',
    plan_status: 'active',
    is_at_risk: true,
  },
  'stu-2': {
    student_id: 'stu-2',
    display_name: 'Maria Oliveira',
    belt: 'purple',
    avatar: null,
    last_attendance: '2026-03-14T07:00:00Z',
    streak: 28,
    health_score: 92,
    latest_evaluation: {
      technique: 9,
      discipline: 10,
      attendance: 9,
      evolution: 9,
      date: '2026-03-01',
    },
    current_plan: 'Plano Trimestral',
    plan_status: 'active',
    is_at_risk: false,
  },
  'stu-3': {
    student_id: 'stu-3',
    display_name: 'Rafael Souza',
    belt: 'white',
    avatar: null,
    last_attendance: '2026-03-10T19:00:00Z',
    streak: 0,
    health_score: 32,
    latest_evaluation: null,
    current_plan: 'Plano Mensal',
    plan_status: 'past_due',
    is_at_risk: true,
  },
  'stu-4': {
    student_id: 'stu-4',
    display_name: 'Lucas Ferreira',
    belt: 'green',
    avatar: null,
    last_attendance: '2026-03-14T19:00:00Z',
    streak: 8,
    health_score: 78,
    latest_evaluation: {
      technique: 8,
      discipline: 7,
      attendance: 8,
      evolution: 8,
      date: '2026-02-15',
    },
    current_plan: 'Plano Anual',
    plan_status: 'active',
    is_at_risk: false,
  },
  'stu-5': {
    student_id: 'stu-5',
    display_name: 'Ana Costa',
    belt: 'yellow',
    avatar: null,
    last_attendance: '2026-03-08T07:00:00Z',
    streak: 0,
    health_score: 28,
    latest_evaluation: {
      technique: 5,
      discipline: 6,
      attendance: 3,
      evolution: 4,
      date: '2026-01-20',
    },
    current_plan: 'Plano Mensal',
    plan_status: 'past_due',
    is_at_risk: true,
  },
};

const SUGGESTED_MESSAGES: Record<string, SuggestedMessageDTO[]> = {
  'stu-1': [
    { id: 'sug-1', label: 'Motivacao', content: 'Joao, percebi que voce esta com dificuldades. Vamos marcar um treino especial essa semana? Quero te ajudar a evoluir!' },
    { id: 'sug-2', label: 'Retorno', content: 'Oi Joao! Sentimos sua falta nos ultimos treinos. Esta tudo bem?' },
  ],
  'stu-3': [
    { id: 'sug-3', label: 'Boas-vindas', content: 'Rafael, vi que voce esta no inicio da jornada. Que tal vir no treino de sabado? Vai ser mais leve e otimo pra praticar!' },
    { id: 'sug-4', label: 'Pagamento', content: 'Rafael, notei que ha uma pendencia no seu plano. Posso te ajudar a resolver?' },
  ],
  'stu-5': [
    { id: 'sug-5', label: 'Recuperacao', content: 'Ana, como esta o joelho? Quando voce estiver melhor, temos treino adaptado esperando por voce!' },
    { id: 'sug-6', label: 'Retorno', content: 'Ana, sentimos sua falta! O grupo esta perguntando por voce. Quando pode voltar?' },
  ],
};

export async function mockGetConversations(_profileId: string): Promise<ConversationDTO[]> {
  await delay();
  return CONVERSATIONS;
}

export async function mockGetMessages(conversationId: string): Promise<MessageDTO[]> {
  await delay();
  return MESSAGES_BY_CONV[conversationId] ?? [];
}

export async function mockSendMessage(conversationId: string, content: string): Promise<MessageDTO> {
  await delay();
  const now = new Date().toISOString();
  return {
    id: `msg-${Date.now()}`,
    from_id: 'prof-1',
    from_name: 'Carlos Silva',
    from_avatar: null,
    content,
    sent_at: now,
    is_mine: true,
    read_at: null,
  };
}

export async function mockGetStudentContext(studentId: string): Promise<StudentContextDTO> {
  await delay();
  return STUDENT_CONTEXTS[studentId] ?? STUDENT_CONTEXTS['stu-1'];
}

export async function mockGetSuggestedMessages(studentId: string): Promise<SuggestedMessageDTO[]> {
  await delay();
  return SUGGESTED_MESSAGES[studentId] ?? [];
}

export async function mockMarkRead(_conversationId: string): Promise<void> {
  await delay();
}
