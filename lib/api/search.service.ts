import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.rpc('global_search', {
      p_query: query,
      p_academy_id: academyId,
    });
    if (error || !data) {
      console.warn('[globalSearch] Supabase error:', error?.message);
      return { results: [], total: 0 };
    }
    const results = (data as unknown as SearchResult[]) ?? [];
    return { results, total: results.length };
  } catch (error) {
    console.warn('[globalSearch] Fallback:', error);
    return { results: [], total: 0 };
  }
}

export function getCommands(): CommandItem[] {
  return [
    {
      id: 'cmd-nova-turma',
      label: '/nova-turma',
      description: 'Criar nova turma',
      url: '/admin/turmas/nova',
      icon: '\uD83E\uDD4B',
    },
    {
      id: 'cmd-novo-aluno',
      label: '/novo-aluno',
      description: 'Cadastrar novo aluno',
      url: '/admin/alunos/novo',
      icon: '\uD83D\uDC64',
    },
    {
      id: 'cmd-cobranca',
      label: '/cobranca',
      description: 'Gerar cobranca',
      url: '/admin/financeiro/cobranca',
      icon: '\uD83D\uDCB0',
    },
    {
      id: 'cmd-comunicado',
      label: '/comunicado',
      description: 'Enviar comunicado',
      url: '/admin/comunicados/novo',
      icon: '\uD83D\uDCE2',
    },
  ];
}
