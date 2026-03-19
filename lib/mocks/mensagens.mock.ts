import { Role } from '@/lib/types/domain';
import type {
  Contact,
  Conversation,
  ConversationMessage,
  BroadcastMessage,
  MessageTarget,
  MessageType,
  SendBroadcastOptions,
} from '@/lib/types/messaging';

const delay = () => new Promise<void>((r) => setTimeout(r, 250));

// ────────────────────────────────────────────────────────────
// MOCK PROFILES
// ────────────────────────────────────────────────────────────

const PROFILES = {
  joao: {
    profile_id: 'prof-joao-001',
    display_name: 'Joao Mendes',
    avatar_url: null,
    role: Role.AlunoAdulto,
    role_badge: 'Aluno',
    classes_in_common: ['BJJ Iniciante', 'BJJ Avancado'],
    children_linked: [] as string[],
  },
  andre: {
    profile_id: 'prof-andre-001',
    display_name: 'Andre Oliveira',
    avatar_url: null,
    role: Role.Professor,
    role_badge: 'Professor',
    classes_in_common: ['BJJ Iniciante', 'BJJ Avancado', 'BJJ Kids'],
    children_linked: [] as string[],
  },
  patricia: {
    profile_id: 'prof-patricia-001',
    display_name: 'Patricia Santos',
    avatar_url: null,
    role: Role.Responsavel,
    role_badge: 'Responsavel',
    classes_in_common: [] as string[],
    children_linked: ['Sophia Santos'],
  },
  roberto: {
    profile_id: 'prof-roberto-001',
    display_name: 'Roberto Almeida',
    avatar_url: null,
    role: Role.Admin,
    role_badge: 'Admin',
    classes_in_common: [] as string[],
    children_linked: [] as string[],
  },
  recepcao: {
    profile_id: 'prof-recepcao-001',
    display_name: 'Carla Souza',
    avatar_url: null,
    role: Role.Recepcao,
    role_badge: 'Recepcao',
    classes_in_common: [] as string[],
    children_linked: [] as string[],
  },
  maria: {
    profile_id: 'prof-maria-001',
    display_name: 'Maria Ferreira',
    avatar_url: null,
    role: Role.AlunoAdulto,
    role_badge: 'Aluna',
    classes_in_common: ['BJJ Iniciante'],
    children_linked: [] as string[],
  },
  lucas: {
    profile_id: 'prof-lucas-001',
    display_name: 'Lucas Silva',
    avatar_url: null,
    role: Role.AlunoTeen,
    role_badge: 'Aluno Teen',
    classes_in_common: ['BJJ Iniciante'],
    children_linked: [] as string[],
  },
} as const;

// ────────────────────────────────────────────────────────────
// MOCK CONVERSATIONS
// ────────────────────────────────────────────────────────────

function makeContact(key: keyof typeof PROFILES, overrides?: Partial<Contact>): Contact {
  const p = PROFILES[key];
  return {
    profile_id: p.profile_id,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    role: p.role,
    role_badge: p.role_badge,
    classes_in_common: [...p.classes_in_common],
    children_linked: [...p.children_linked],
    last_message: null,
    last_message_at: null,
    unread_count: 0,
    ...overrides,
  };
}

const CONVERSATIONS: Conversation[] = [
  // 1. Joao (aluno) <-> Andre (professor) — aula de reposicao
  {
    id: 'conv-001',
    academy_id: 'acad-001',
    participant_a: PROFILES.andre.profile_id,
    participant_b: PROFILES.joao.profile_id,
    other_participant: makeContact('joao', {
      last_message: 'Professor, posso fazer reposicao na sexta?',
      last_message_at: '2026-03-19T14:30:00Z',
      unread_count: 2,
    }),
    type: 'direct',
    last_message_text: 'Professor, posso fazer reposicao na sexta?',
    last_message_at: '2026-03-19T14:30:00Z',
    last_message_by: PROFILES.joao.profile_id,
    unread_count: 2,
    is_archived: false,
    created_at: '2026-03-10T10:00:00Z',
  },
  // 2. Patricia (responsavel) <-> Andre (professor) — sobre a Sophia
  {
    id: 'conv-002',
    academy_id: 'acad-001',
    participant_a: PROFILES.andre.profile_id,
    participant_b: PROFILES.patricia.profile_id,
    other_participant: makeContact('patricia', {
      last_message: 'Como a Sophia esta evoluindo nas aulas?',
      last_message_at: '2026-03-19T10:15:00Z',
      unread_count: 1,
    }),
    type: 'direct',
    last_message_text: 'Como a Sophia esta evoluindo nas aulas?',
    last_message_at: '2026-03-19T10:15:00Z',
    last_message_by: PROFILES.patricia.profile_id,
    unread_count: 1,
    is_archived: false,
    created_at: '2026-03-08T09:00:00Z',
  },
  // 3. Roberto (admin) <-> Andre (professor) — avaliacao de alunos
  {
    id: 'conv-003',
    academy_id: 'acad-001',
    participant_a: PROFILES.andre.profile_id,
    participant_b: PROFILES.roberto.profile_id,
    other_participant: makeContact('roberto', {
      last_message: 'Andre, preciso da avaliacao dos alunos ate sexta.',
      last_message_at: '2026-03-18T16:00:00Z',
      unread_count: 0,
    }),
    type: 'direct',
    last_message_text: 'Andre, preciso da avaliacao dos alunos ate sexta.',
    last_message_at: '2026-03-18T16:00:00Z',
    last_message_by: PROFILES.roberto.profile_id,
    unread_count: 0,
    is_archived: false,
    created_at: '2026-03-05T08:00:00Z',
  },
  // 4. Roberto (admin) <-> Joao (aluno) — graduacao de faixa
  {
    id: 'conv-004',
    academy_id: 'acad-001',
    participant_a: PROFILES.joao.profile_id,
    participant_b: PROFILES.roberto.profile_id,
    other_participant: makeContact('joao', {
      last_message: 'Obrigado pela informacao sobre a graduacao!',
      last_message_at: '2026-03-17T20:00:00Z',
      unread_count: 0,
    }),
    type: 'direct',
    last_message_text: 'Obrigado pela informacao sobre a graduacao!',
    last_message_at: '2026-03-17T20:00:00Z',
    last_message_by: PROFILES.joao.profile_id,
    unread_count: 0,
    is_archived: false,
    created_at: '2026-03-01T12:00:00Z',
  },
  // 5. Recepcao <-> Patricia (responsavel) — pagamento
  {
    id: 'conv-005',
    academy_id: 'acad-001',
    participant_a: PROFILES.patricia.profile_id,
    participant_b: PROFILES.recepcao.profile_id,
    other_participant: makeContact('patricia', {
      last_message: 'O boleto da mensalidade ja esta disponivel?',
      last_message_at: '2026-03-16T11:00:00Z',
      unread_count: 1,
    }),
    type: 'direct',
    last_message_text: 'O boleto da mensalidade ja esta disponivel?',
    last_message_at: '2026-03-16T11:00:00Z',
    last_message_by: PROFILES.patricia.profile_id,
    unread_count: 1,
    is_archived: false,
    created_at: '2026-02-20T09:00:00Z',
  },
];

// ────────────────────────────────────────────────────────────
// MOCK MESSAGES
// ────────────────────────────────────────────────────────────

const MESSAGES: Record<string, ConversationMessage[]> = {
  'conv-001': [
    {
      id: 'msg-001-1',
      conversation_id: 'conv-001',
      sender_id: PROFILES.joao.profile_id,
      text: 'Oi professor, tudo bem?',
      type: 'text',
      attachment_url: null,
      read_at: '2026-03-19T14:01:00Z',
      metadata: null,
      created_at: '2026-03-19T14:00:00Z',
      deleted_at: null,
    },
    {
      id: 'msg-001-2',
      conversation_id: 'conv-001',
      sender_id: PROFILES.andre.profile_id,
      text: 'Tudo sim, Joao! Em que posso te ajudar?',
      type: 'text',
      attachment_url: null,
      read_at: '2026-03-19T14:06:00Z',
      metadata: null,
      created_at: '2026-03-19T14:05:00Z',
      deleted_at: null,
    },
    {
      id: 'msg-001-3',
      conversation_id: 'conv-001',
      sender_id: PROFILES.joao.profile_id,
      text: 'Perdi a aula de quarta por causa do trabalho. Tem como fazer reposicao?',
      type: 'text',
      attachment_url: null,
      read_at: '2026-03-19T14:11:00Z',
      metadata: null,
      created_at: '2026-03-19T14:10:00Z',
      deleted_at: null,
    },
    {
      id: 'msg-001-4',
      conversation_id: 'conv-001',
      sender_id: PROFILES.andre.profile_id,
      text: 'Claro! Pode vir na turma de sabado as 10h. Vai ser um treino mais leve, otimo para reposicao.',
      type: 'text',
      attachment_url: null,
      read_at: '2026-03-19T14:16:00Z',
      metadata: null,
      created_at: '2026-03-19T14:15:00Z',
      deleted_at: null,
    },
    {
      id: 'msg-001-5',
      conversation_id: 'conv-001',
      sender_id: PROFILES.joao.profile_id,
      text: 'Perfeito, obrigado! Vou sim.',
      type: 'text',
      attachment_url: null,
      read_at: '2026-03-19T14:21:00Z',
      metadata: null,
      created_at: '2026-03-19T14:20:00Z',
      deleted_at: null,
    },
    {
      id: 'msg-001-6',
      conversation_id: 'conv-001',
      sender_id: PROFILES.joao.profile_id,
      text: 'Professor, posso fazer reposicao na sexta?',
      type: 'text',
      attachment_url: null,
      read_at: null,
      metadata: null,
      created_at: '2026-03-19T14:30:00Z',
      deleted_at: null,
    },
  ],
  'conv-002': [
    {
      id: 'msg-002-1',
      conversation_id: 'conv-002',
      sender_id: PROFILES.patricia.profile_id,
      text: 'Boa tarde, professor! Queria saber sobre o progresso da Sophia.',
      type: 'text',
      attachment_url: null,
      read_at: '2026-03-19T10:02:00Z',
      metadata: null,
      created_at: '2026-03-19T10:00:00Z',
      deleted_at: null,
    },
    {
      id: 'msg-002-2',
      conversation_id: 'conv-002',
      sender_id: PROFILES.andre.profile_id,
      text: 'Oi Patricia! A Sophia esta indo muito bem. Ela tem se destacado na disciplina e na tecnica.',
      type: 'text',
      attachment_url: null,
      read_at: '2026-03-19T10:11:00Z',
      metadata: null,
      created_at: '2026-03-19T10:10:00Z',
      deleted_at: null,
    },
    {
      id: 'msg-002-3',
      conversation_id: 'conv-002',
      sender_id: PROFILES.patricia.profile_id,
      text: 'Como a Sophia esta evoluindo nas aulas?',
      type: 'text',
      attachment_url: null,
      read_at: null,
      metadata: null,
      created_at: '2026-03-19T10:15:00Z',
      deleted_at: null,
    },
  ],
  'conv-003': [
    {
      id: 'msg-003-1',
      conversation_id: 'conv-003',
      sender_id: PROFILES.roberto.profile_id,
      text: 'Andre, precisamos alinhar a avaliacao trimestral dos alunos.',
      type: 'text',
      attachment_url: null,
      read_at: '2026-03-18T15:32:00Z',
      metadata: null,
      created_at: '2026-03-18T15:30:00Z',
      deleted_at: null,
    },
    {
      id: 'msg-003-2',
      conversation_id: 'conv-003',
      sender_id: PROFILES.andre.profile_id,
      text: 'Claro, Roberto. Ja estou preparando as fichas de avaliacao.',
      type: 'text',
      attachment_url: null,
      read_at: '2026-03-18T15:41:00Z',
      metadata: null,
      created_at: '2026-03-18T15:40:00Z',
      deleted_at: null,
    },
    {
      id: 'msg-003-3',
      conversation_id: 'conv-003',
      sender_id: PROFILES.roberto.profile_id,
      text: 'Andre, preciso da avaliacao dos alunos ate sexta.',
      type: 'text',
      attachment_url: null,
      read_at: '2026-03-18T16:05:00Z',
      metadata: null,
      created_at: '2026-03-18T16:00:00Z',
      deleted_at: null,
    },
  ],
  'conv-004': [
    {
      id: 'msg-004-1',
      conversation_id: 'conv-004',
      sender_id: PROFILES.roberto.profile_id,
      text: 'Joao, parabens pela sua evolucao! Voce esta apto para a graduacao de faixa azul.',
      type: 'text',
      attachment_url: null,
      read_at: '2026-03-17T19:32:00Z',
      metadata: null,
      created_at: '2026-03-17T19:30:00Z',
      deleted_at: null,
    },
    {
      id: 'msg-004-2',
      conversation_id: 'conv-004',
      sender_id: PROFILES.joao.profile_id,
      text: 'Serio? Que noticia incrivel! Quando sera a cerimonia?',
      type: 'text',
      attachment_url: null,
      read_at: '2026-03-17T19:41:00Z',
      metadata: null,
      created_at: '2026-03-17T19:40:00Z',
      deleted_at: null,
    },
    {
      id: 'msg-004-3',
      conversation_id: 'conv-004',
      sender_id: PROFILES.roberto.profile_id,
      text: 'Sera no dia 28 de marco, as 19h. Convide sua familia!',
      type: 'text',
      attachment_url: null,
      read_at: '2026-03-17T19:51:00Z',
      metadata: null,
      created_at: '2026-03-17T19:50:00Z',
      deleted_at: null,
    },
    {
      id: 'msg-004-4',
      conversation_id: 'conv-004',
      sender_id: PROFILES.joao.profile_id,
      text: 'Obrigado pela informacao sobre a graduacao!',
      type: 'text',
      attachment_url: null,
      read_at: '2026-03-17T20:01:00Z',
      metadata: null,
      created_at: '2026-03-17T20:00:00Z',
      deleted_at: null,
    },
  ],
  'conv-005': [
    {
      id: 'msg-005-1',
      conversation_id: 'conv-005',
      sender_id: PROFILES.patricia.profile_id,
      text: 'Ola, bom dia! Gostaria de saber sobre a mensalidade da Sophia.',
      type: 'text',
      attachment_url: null,
      read_at: '2026-03-16T10:32:00Z',
      metadata: null,
      created_at: '2026-03-16T10:30:00Z',
      deleted_at: null,
    },
    {
      id: 'msg-005-2',
      conversation_id: 'conv-005',
      sender_id: PROFILES.recepcao.profile_id,
      text: 'Bom dia, Patricia! A mensalidade de marco vence dia 20. Posso enviar o boleto por aqui?',
      type: 'text',
      attachment_url: null,
      read_at: '2026-03-16T10:41:00Z',
      metadata: null,
      created_at: '2026-03-16T10:40:00Z',
      deleted_at: null,
    },
    {
      id: 'msg-005-3',
      conversation_id: 'conv-005',
      sender_id: PROFILES.patricia.profile_id,
      text: 'O boleto da mensalidade ja esta disponivel?',
      type: 'text',
      attachment_url: null,
      read_at: null,
      metadata: null,
      created_at: '2026-03-16T11:00:00Z',
      deleted_at: null,
    },
  ],
};

// ────────────────────────────────────────────────────────────
// MOCK BROADCASTS
// ────────────────────────────────────────────────────────────

const BROADCASTS: BroadcastMessage[] = [
  {
    id: 'bcast-001',
    academy_id: 'acad-001',
    sender_id: PROFILES.roberto.profile_id,
    sender_name: 'Roberto Almeida',
    target: 'all_students',
    target_class_id: null,
    target_belt: null,
    target_profile_ids: null,
    subject: 'Lembrete: Graduacao de Faixas',
    text: 'Atencao alunos! A cerimonia de graduacao de faixas sera no dia 28/03 as 19h. Confirme sua presenca na recepcao. Venham com o kimono limpo e tragam seus familiares!',
    total_recipients: 45,
    read_count: 32,
    created_at: '2026-03-18T09:00:00Z',
  },
  {
    id: 'bcast-002',
    academy_id: 'acad-001',
    sender_id: PROFILES.andre.profile_id,
    sender_name: 'Andre Oliveira',
    target: 'class',
    target_class_id: 'class-bjj-ini',
    target_belt: null,
    target_profile_ids: null,
    subject: 'Aula especial amanha',
    text: 'Turma de BJJ Iniciante: amanha teremos uma aula especial com foco em raspagens e passagens de guarda. Nao faltem! Tragam disposicao extra.',
    total_recipients: 18,
    read_count: 12,
    created_at: '2026-03-19T08:00:00Z',
  },
];

// ────────────────────────────────────────────────────────────
// CONTACT MATRIX BY ROLE
// ────────────────────────────────────────────────────────────

function getContactsForRole(
  _profileId: string,
  role: Role,
  _academyId: string,
): Contact[] {
  switch (role) {
    case Role.Admin:
    case Role.Gestor:
      // Admin can message anyone
      return [
        makeContact('andre', { last_message: 'Avaliacao pronta', last_message_at: '2026-03-18T16:00:00Z' }),
        makeContact('joao', { last_message: 'Graduacao de faixa', last_message_at: '2026-03-17T20:00:00Z' }),
        makeContact('patricia', { last_message: 'Sobre a Sophia', last_message_at: '2026-03-19T10:15:00Z' }),
        makeContact('recepcao', { last_message: 'Pagamento ok', last_message_at: '2026-03-15T09:00:00Z' }),
        makeContact('maria', { last_message: null, last_message_at: null }),
        makeContact('lucas', { last_message: null, last_message_at: null }),
      ];
    case Role.Professor:
      // Professor: admin + students of his classes + parents
      return [
        makeContact('roberto', { last_message: 'Avaliacao ate sexta', last_message_at: '2026-03-18T16:00:00Z' }),
        makeContact('joao', { last_message: 'Reposicao na sexta?', last_message_at: '2026-03-19T14:30:00Z', unread_count: 2 }),
        makeContact('patricia', { last_message: 'Sophia evoluindo', last_message_at: '2026-03-19T10:15:00Z', unread_count: 1 }),
        makeContact('maria', { last_message: null, last_message_at: null }),
        makeContact('lucas', { last_message: null, last_message_at: null }),
      ];
    case Role.AlunoAdulto:
      // Aluno: admin + professors of his classes
      return [
        makeContact('andre', { last_message: 'Pode vir sabado as 10h', last_message_at: '2026-03-19T14:15:00Z' }),
        makeContact('roberto', { last_message: 'Graduacao dia 28/03', last_message_at: '2026-03-17T19:50:00Z' }),
      ];
    case Role.AlunoTeen:
      // Teen: only professors of his classes
      return [
        makeContact('andre', { last_message: null, last_message_at: null }),
      ];
    case Role.Responsavel:
      // Responsavel: admin + professors of children
      return [
        makeContact('andre', { last_message: 'Sophia se destacou', last_message_at: '2026-03-19T10:10:00Z' }),
        makeContact('roberto', { last_message: null, last_message_at: null }),
        makeContact('recepcao', { last_message: 'Boleto disponivel', last_message_at: '2026-03-16T10:40:00Z', unread_count: 0 }),
      ];
    case Role.Recepcao:
      // Recepcao: admin + professors + students + parents
      return [
        makeContact('roberto', { last_message: null, last_message_at: null }),
        makeContact('andre', { last_message: null, last_message_at: null }),
        makeContact('joao', { last_message: null, last_message_at: null }),
        makeContact('patricia', { last_message: 'Boleto da mensalidade', last_message_at: '2026-03-16T11:00:00Z', unread_count: 1 }),
        makeContact('maria', { last_message: null, last_message_at: null }),
      ];
    default:
      return [];
  }
}

// ────────────────────────────────────────────────────────────
// EXPORTED MOCK FUNCTIONS
// ────────────────────────────────────────────────────────────

export async function mockGetMyContacts(
  profileId: string,
  role: Role,
  academyId: string,
): Promise<Contact[]> {
  await delay();
  return getContactsForRole(profileId, role, academyId);
}

export async function mockGetConversations(profileId: string): Promise<Conversation[]> {
  await delay();
  // Return conversations where profileId is a participant
  return CONVERSATIONS
    .filter(
      (c) => c.participant_a === profileId || c.participant_b === profileId,
    )
    .map((c) => {
      // Swap other_participant perspective
      const isA = c.participant_a === profileId;
      const otherKey = isA ? c.participant_b : c.participant_a;
      const otherProfile = Object.values(PROFILES).find((p) => p.profile_id === otherKey);
      if (!otherProfile) return c;

      return {
        ...c,
        other_participant: makeContact(
          Object.keys(PROFILES).find(
            (k) => PROFILES[k as keyof typeof PROFILES].profile_id === otherKey,
          ) as keyof typeof PROFILES,
          {
            last_message: c.last_message_text,
            last_message_at: c.last_message_at,
            unread_count: c.last_message_by !== profileId ? c.unread_count : 0,
          },
        ),
        unread_count: c.last_message_by !== profileId ? c.unread_count : 0,
      };
    })
    .sort((a, b) => {
      const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return dateB - dateA;
    });
}

export async function mockGetOrCreateConversation(
  profileId: string,
  otherProfileId: string,
  academyId: string,
): Promise<Conversation> {
  await delay();
  // Find existing
  const existing = CONVERSATIONS.find(
    (c) =>
      (c.participant_a === profileId && c.participant_b === otherProfileId) ||
      (c.participant_a === otherProfileId && c.participant_b === profileId),
  );
  if (existing) return existing;

  // Create new
  const otherKey = Object.keys(PROFILES).find(
    (k) => PROFILES[k as keyof typeof PROFILES].profile_id === otherProfileId,
  ) as keyof typeof PROFILES | undefined;

  const newConv: Conversation = {
    id: `conv-${Date.now()}`,
    academy_id: academyId,
    participant_a: profileId < otherProfileId ? profileId : otherProfileId,
    participant_b: profileId < otherProfileId ? otherProfileId : profileId,
    other_participant: otherKey
      ? makeContact(otherKey)
      : {
          profile_id: otherProfileId,
          display_name: 'Desconhecido',
          avatar_url: null,
          role: Role.AlunoAdulto,
          role_badge: 'Aluno',
          classes_in_common: [],
          children_linked: [],
          last_message: null,
          last_message_at: null,
          unread_count: 0,
        },
    type: 'direct',
    last_message_text: null,
    last_message_at: null,
    last_message_by: null,
    unread_count: 0,
    is_archived: false,
    created_at: new Date().toISOString(),
  };
  CONVERSATIONS.push(newConv);
  return newConv;
}

export async function mockGetMessages(
  conversationId: string,
  _page?: number,
  _limit?: number,
): Promise<ConversationMessage[]> {
  await delay();
  return MESSAGES[conversationId] ?? [];
}

export async function mockSendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  type: MessageType = 'text',
): Promise<ConversationMessage> {
  await delay();
  const now = new Date().toISOString();
  const msg: ConversationMessage = {
    id: `msg-${Date.now()}`,
    conversation_id: conversationId,
    sender_id: senderId,
    text,
    type,
    attachment_url: null,
    read_at: null,
    metadata: null,
    created_at: now,
    deleted_at: null,
  };
  // Add to local store
  if (!MESSAGES[conversationId]) {
    MESSAGES[conversationId] = [];
  }
  MESSAGES[conversationId].push(msg);
  return msg;
}

export async function mockMarkAsRead(
  _conversationId: string,
  _profileId: string,
): Promise<void> {
  await delay();
}

export async function mockDeleteMessage(_messageId: string): Promise<void> {
  await delay();
}

export async function mockSendBroadcast(
  academyId: string,
  senderId: string,
  target: MessageTarget,
  text: string,
  opts?: SendBroadcastOptions,
): Promise<BroadcastMessage> {
  await delay();
  const senderProfile = Object.values(PROFILES).find((p) => p.profile_id === senderId);
  const broadcast: BroadcastMessage = {
    id: `bcast-${Date.now()}`,
    academy_id: academyId,
    sender_id: senderId,
    sender_name: senderProfile?.display_name ?? 'Desconhecido',
    target,
    target_class_id: opts?.target_class_id ?? null,
    target_belt: opts?.target_belt ?? null,
    target_profile_ids: opts?.target_profile_ids ?? null,
    subject: opts?.subject ?? null,
    text,
    total_recipients: target === 'all' ? 60 : target === 'class' ? 18 : 45,
    read_count: 0,
    created_at: new Date().toISOString(),
  };
  BROADCASTS.push(broadcast);
  return broadcast;
}

export async function mockGetBroadcasts(_profileId: string): Promise<BroadcastMessage[]> {
  await delay();
  return [...BROADCASTS].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function mockMarkBroadcastRead(
  _broadcastId: string,
  _profileId: string,
): Promise<void> {
  await delay();
}

export async function mockGetTotalUnread(profileId: string): Promise<number> {
  await delay();
  // Find role by profileId
  const profile = Object.values(PROFILES).find((p) => p.profile_id === profileId);
  if (!profile) return 0;
  switch (profile.role) {
    case Role.AlunoAdulto:
      return 3;
    case Role.Professor:
      return 5;
    case Role.Admin:
      return 2;
    case Role.Responsavel:
      return 1;
    case Role.AlunoTeen:
      return 1;
    case Role.Recepcao:
      return 2;
    default:
      return 0;
  }
}

export async function mockSearchMessages(
  _profileId: string,
  query: string,
): Promise<ConversationMessage[]> {
  await delay();
  const allMessages = Object.values(MESSAGES).flat();
  const q = query.toLowerCase();
  return allMessages.filter((m) => m.text.toLowerCase().includes(q));
}
