import type { Suggestion, UserRole } from '@/lib/api/suggestions.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const STUDENT_SUGGESTIONS: Suggestion[] = [
  {
    id: 'sug-s1',
    category: 'frequency_drop',
    priority: 'high',
    title: 'Sua frequencia caiu',
    description: 'Voce treinou 2x esta semana vs 4x na anterior. Que tal voltar ao ritmo?',
    actionLabel: 'Ver horarios',
    actionUrl: '/dashboard/turmas',
    icon: '📉',
    dismissedUntil: null,
  },
  {
    id: 'sug-s2',
    category: 'near_record',
    priority: 'medium',
    title: 'Perto do seu recorde!',
    description: 'Faltam 2 treinos para bater seu recorde de 18 treinos no mes.',
    actionLabel: 'Ver progresso',
    actionUrl: '/dashboard/progresso',
    icon: '🔥',
    dismissedUntil: null,
  },
  {
    id: 'sug-s3',
    category: 'near_achievement',
    priority: 'low',
    title: 'Conquista proxima',
    description: 'Mais 1 semana com 3+ treinos e voce desbloqueia "Maquina de Treino".',
    actionLabel: 'Ver conquistas',
    actionUrl: '/dashboard/conquistas',
    icon: '🏆',
    dismissedUntil: null,
  },
];

const ADMIN_SUGGESTIONS: Suggestion[] = [
  {
    id: 'sug-a1',
    category: 'capacity_warning',
    priority: 'high',
    title: 'Turma lotando',
    description: 'BJJ Noite esta com 95% de capacidade nas ultimas 2 semanas. Considere abrir nova turma.',
    actionLabel: 'Ver turma',
    actionUrl: '/admin/turmas',
    icon: '⚠️',
    dismissedUntil: null,
  },
  {
    id: 'sug-a2',
    category: 'lead_followup',
    priority: 'medium',
    title: '3 leads sem resposta',
    description: 'Leads de mais de 48h sem contato: Maria, Pedro, Lucia.',
    actionLabel: 'Ver leads',
    actionUrl: '/admin/leads',
    icon: '📱',
    dismissedUntil: null,
  },
  {
    id: 'sug-a3',
    category: 'slow_slot',
    priority: 'low',
    title: 'Horario com baixa adesao',
    description: 'Terca 14h tem media de 3 alunos. Considere reagendar ou promover.',
    actionLabel: 'Ver analytics',
    actionUrl: '/admin/analytics',
    icon: '📊',
    dismissedUntil: null,
  },
];

const TEACHER_SUGGESTIONS: Suggestion[] = [
  {
    id: 'sug-t1',
    category: 'evaluation_candidate',
    priority: 'high',
    title: 'Alunos prontos para avaliacao',
    description: 'Joao Silva e Ana Costa completaram os requisitos para avaliacao de faixa.',
    actionLabel: 'Avaliar',
    actionUrl: '/professor/avaliacoes',
    icon: '🥋',
    dismissedUntil: null,
  },
  {
    id: 'sug-t2',
    category: 'absent_student',
    priority: 'medium',
    title: 'Aluno ausente',
    description: 'Lucas Mendes nao treina ha 10 dias. Pode ser bom entrar em contato.',
    actionLabel: 'Enviar mensagem',
    actionUrl: '/professor/mensagens',
    icon: '👋',
    dismissedUntil: null,
  },
  {
    id: 'sug-t3',
    category: 'absent_student',
    priority: 'medium',
    title: 'Queda de presenca',
    description: 'Fernanda Rocha reduziu de 4x para 1x por semana no ultimo mes.',
    actionLabel: 'Ver perfil',
    actionUrl: '/professor/alunos/fernanda-rocha',
    icon: '📉',
    dismissedUntil: null,
  },
];

const SUGGESTIONS_BY_ROLE: Record<UserRole, Suggestion[]> = {
  student: STUDENT_SUGGESTIONS,
  admin: ADMIN_SUGGESTIONS,
  teacher: TEACHER_SUGGESTIONS,
};

export async function mockGetSuggestions(
  role: UserRole,
  _userId: string,
  _academyId: string,
): Promise<Suggestion[]> {
  await delay();
  const all = SUGGESTIONS_BY_ROLE[role] ?? [];
  // Max 3 per session, filter out dismissed
  const now = new Date().toISOString();
  return all
    .filter((s) => !s.dismissedUntil || s.dismissedUntil < now)
    .slice(0, 3)
    .map((s) => ({ ...s }));
}

export async function mockDismissSuggestion(_suggestionId: string): Promise<void> {
  await delay();
}
