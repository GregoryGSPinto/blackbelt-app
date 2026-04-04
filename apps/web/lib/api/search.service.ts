import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  professor: 'Professor',
  recepcao: 'Recepção',
  aluno_adulto: 'Aluno Adulto',
  aluno_teen: 'Aluno Teen',
  aluno_kids: 'Aluno Kids',
  responsavel: 'Responsável',
  franqueador: 'Franqueador',
  superadmin: 'Super Admin',
};

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
    const term = `%${query}%`;
    const results: SearchResult[] = [];

    // Search members via memberships + profiles
    if (academyId) {
      try {
        const { data: members } = await supabase
          .from('memberships')
          .select('id, role, status, profile_id, profiles!inner(id, display_name)')
          .eq('academy_id', academyId)
          .eq('status', 'active')
          .ilike('profiles.display_name', term)
          .limit(8);
        for (const m of (members ?? []) as Array<{ id: string; role: string; profile_id: string; profiles: { id: string; display_name: string } }>) {
          if (!m.profiles?.display_name) continue;
          results.push({
            id: m.profiles.id,
            group: 'alunos',
            title: m.profiles.display_name,
            subtitle: ROLE_LABELS[m.role] ?? m.role,
            url: `/admin/alunos/${m.profiles.id}`,
            icon: 'user',
          });
        }
      } catch (err) {
        logServiceError(err, 'search');
      }
    }

    // Search classes by name
    if (academyId) {
      try {
        const { data: classes } = await supabase
          .from('classes')
          .select('id, name')
          .eq('academy_id', academyId)
          .ilike('name', term)
          .limit(5);
        for (const c of (classes ?? []) as Array<{ id: string; name: string }>) {
          results.push({
            id: c.id,
            group: 'turmas',
            title: c.name ?? '',
            subtitle: 'Turma',
            url: `/admin/turmas/${c.id}`,
            icon: 'calendar',
          });
        }
      } catch (err) {
        logServiceError(err, 'search');
      }
    }

    return { results, total: results.length };
  } catch (error) {
    logServiceError(error, 'search');
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
