import type { UserFeedback, FeedbackType, FeedbackStatus } from '@/lib/api/feedback.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const MOCK_FEEDBACK: UserFeedback[] = [
  {
    id: 'fb-001',
    academy_id: 'academy-1',
    profile_id: 'profile-1',
    type: 'suggestion',
    message: 'Seria otimo ter um calendario integrado com Google Calendar para sincronizar os horarios das aulas automaticamente.',
    rating: 4,
    page_url: '/dashboard/turmas',
    user_agent: 'Mozilla/5.0',
    status: 'new',
    admin_reply: null,
    created_at: '2026-03-25T14:30:00Z',
  },
  {
    id: 'fb-002',
    academy_id: 'academy-1',
    profile_id: 'profile-2',
    type: 'bug',
    message: 'Quando tento fazer check-in pelo celular, a pagina fica carregando infinitamente. Testei no Safari e Chrome, mesmo problema.',
    rating: 2,
    page_url: '/dashboard/checkin',
    user_agent: 'Mozilla/5.0 (iPhone)',
    status: 'read',
    admin_reply: null,
    created_at: '2026-03-24T09:15:00Z',
  },
  {
    id: 'fb-003',
    academy_id: 'academy-1',
    profile_id: 'profile-3',
    type: 'praise',
    message: 'O novo sistema de graduacoes ficou incrivel! Muito mais facil de acompanhar a evolucao dos alunos. Parabens a equipe!',
    rating: 5,
    page_url: '/admin/graduacoes',
    user_agent: 'Mozilla/5.0',
    status: 'replied',
    admin_reply: 'Muito obrigado pelo feedback positivo! Ficamos felizes que esta gostando.',
    created_at: '2026-03-22T16:45:00Z',
  },
  {
    id: 'fb-004',
    academy_id: 'academy-1',
    profile_id: 'profile-4',
    type: 'complaint',
    message: 'O relatorio financeiro nao esta exportando corretamente para PDF. Os valores ficam cortados na margem direita.',
    rating: 1,
    page_url: '/admin/relatorios',
    user_agent: 'Mozilla/5.0',
    status: 'resolved',
    admin_reply: 'Corrigimos o problema de exportacao. Por favor, tente novamente e nos avise se persistir.',
    created_at: '2026-03-20T11:00:00Z',
  },
  {
    id: 'fb-005',
    academy_id: 'academy-1',
    profile_id: 'profile-5',
    type: 'other',
    message: 'Gostaria de saber se ha planos para adicionar suporte a multiplos idiomas no sistema. Temos alunos estrangeiros.',
    rating: 3,
    page_url: '/admin/configuracoes',
    user_agent: 'Mozilla/5.0',
    status: 'new',
    admin_reply: null,
    created_at: '2026-03-19T08:20:00Z',
  },
];

let feedbackStore = [...MOCK_FEEDBACK];

export async function mockSubmitFeedback(
  academyId: string,
  data: { type: FeedbackType; message: string; rating?: number; page_url?: string },
): Promise<UserFeedback> {
  await delay();
  const newFeedback: UserFeedback = {
    id: `fb-${Date.now()}`,
    academy_id: academyId,
    profile_id: 'profile-mock',
    type: data.type,
    message: data.message,
    rating: data.rating ?? null,
    page_url: data.page_url ?? null,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    status: 'new',
    admin_reply: null,
    created_at: new Date().toISOString(),
  };
  feedbackStore = [newFeedback, ...feedbackStore];
  return newFeedback;
}

export async function mockListFeedback(
  _academyId: string,
  filters?: { status?: FeedbackStatus; type?: FeedbackType },
): Promise<UserFeedback[]> {
  await delay();
  let result = [...feedbackStore];
  if (filters?.status) {
    result = result.filter((f) => f.status === filters.status);
  }
  if (filters?.type) {
    result = result.filter((f) => f.type === filters.type);
  }
  return result;
}

export async function mockGetFeedbackCount(
  _academyId: string,
  status?: FeedbackStatus,
): Promise<number> {
  await delay();
  if (status) {
    return feedbackStore.filter((f) => f.status === status).length;
  }
  return feedbackStore.length;
}

export async function mockMarkAsRead(feedbackId: string): Promise<UserFeedback | null> {
  await delay();
  const idx = feedbackStore.findIndex((f) => f.id === feedbackId);
  if (idx === -1) return null;
  feedbackStore[idx] = { ...feedbackStore[idx], status: 'read' };
  return feedbackStore[idx];
}

export async function mockReplyToFeedback(
  feedbackId: string,
  reply: string,
): Promise<UserFeedback | null> {
  await delay();
  const idx = feedbackStore.findIndex((f) => f.id === feedbackId);
  if (idx === -1) return null;
  feedbackStore[idx] = { ...feedbackStore[idx], status: 'replied', admin_reply: reply };
  return feedbackStore[idx];
}

export async function mockResolveFeedback(feedbackId: string): Promise<UserFeedback | null> {
  await delay();
  const idx = feedbackStore.findIndex((f) => f.id === feedbackId);
  if (idx === -1) return null;
  feedbackStore[idx] = { ...feedbackStore[idx], status: 'resolved' };
  return feedbackStore[idx];
}
