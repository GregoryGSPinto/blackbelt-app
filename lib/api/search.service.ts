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
    const term = `%${query}%`;
    const results: SearchResult[] = [];

    // Search students by name
    try {
      const { data: students } = await supabase
        .from('students')
        .select('id, belt, profile:profiles!students_profile_id_fkey(display_name)')
        .eq('academy_id', academyId)
        .ilike('profiles.display_name', term)
        .limit(10);
      for (const s of (students ?? []) as Array<{ id: string; belt: string; profile: { display_name: string } | null }>) {
        if (!s.profile?.display_name) continue;
        results.push({
          id: s.id,
          group: 'alunos',
          title: s.profile.display_name,
          subtitle: `Faixa: ${s.belt}`,
          url: `/admin/alunos/${s.id}`,
          icon: 'user',
        });
      }
    } catch (err) {
      console.error('[globalSearch] students search error:', err);
    }

    // Search classes by name
    try {
      const { data: classes } = await supabase
        .from('classes')
        .select('id, name')
        .eq('academy_id', academyId)
        .ilike('name', term)
        .limit(10);
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
      console.error('[globalSearch] classes search error:', err);
    }

    // Search profiles (professors, etc.) by display_name
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, role')
        .ilike('display_name', term)
        .limit(10);
      for (const p of (profiles ?? []) as Array<{ id: string; display_name: string; role: string }>) {
        // Skip if already in students results
        if (results.some(r => r.title === p.display_name && r.group === 'alunos')) continue;
        results.push({
          id: p.id,
          group: 'alunos',
          title: p.display_name,
          subtitle: p.role,
          url: `/admin/perfil/${p.id}`,
          icon: 'user',
        });
      }
    } catch (err) {
      console.error('[globalSearch] profiles search error:', err);
    }

    return { results, total: results.length };
  } catch (error) {
    console.error('[globalSearch] Fallback:', error);
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
