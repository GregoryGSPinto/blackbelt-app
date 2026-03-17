import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type SearchResultGroup = 'alunos' | 'turmas' | 'videos' | 'leads' | 'comunicados' | 'paginas';

export interface SearchResult {
  id: string;
  group: SearchResultGroup;
  title: string;
  subtitle: string;
  url: string;
  icon: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

export interface CommandItem {
  id: string;
  label: string;
  description: string;
  url: string;
  icon: string;
}

export async function globalSearch(
  query: string,
  academyId: string,
): Promise<SearchResponse> {
  try {
    if (isMock()) {
      const { mockGlobalSearch } = await import('@/lib/mocks/search.mock');
      return mockGlobalSearch(query, academyId);
    }
    try {
      const params = new URLSearchParams({ q: query, academyId });
      const res = await fetch(`/api/search?${params}`);
      if (!res.ok) throw new ServiceError(res.status, 'search.global');
      return res.json();
    } catch {
      console.warn('[search.globalSearch] API not available, using fallback');
      return {} as SearchResponse;
    }

  } catch (error) {
    handleServiceError(error, 'search.global');
  }
}

export function getCommands(): CommandItem[] {
  return [
    {
      id: 'cmd-nova-turma',
      label: '/nova-turma',
      description: 'Criar nova turma',
      url: '/admin/turmas/nova',
      icon: '🥋',
    },
    {
      id: 'cmd-novo-aluno',
      label: '/novo-aluno',
      description: 'Cadastrar novo aluno',
      url: '/admin/alunos/novo',
      icon: '👤',
    },
    {
      id: 'cmd-cobranca',
      label: '/cobranca',
      description: 'Gerar cobranca',
      url: '/admin/financeiro/cobranca',
      icon: '💰',
    },
    {
      id: 'cmd-comunicado',
      label: '/comunicado',
      description: 'Enviar comunicado',
      url: '/admin/comunicados/novo',
      icon: '📢',
    },
  ];
}
