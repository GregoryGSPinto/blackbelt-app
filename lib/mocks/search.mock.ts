import type { SearchResponse, SearchResult } from '@/lib/api/search.service';

const delay = () => new Promise((r) => setTimeout(r, 150));

const ALL_RESULTS: SearchResult[] = [
  // Alunos
  { id: 'sr-1', group: 'alunos', title: 'Joao Silva', subtitle: 'Faixa Azul - BJJ', url: '/admin/alunos/joao-silva', icon: '👤' },
  { id: 'sr-2', group: 'alunos', title: 'Ana Costa', subtitle: 'Faixa Branca - BJJ', url: '/admin/alunos/ana-costa', icon: '👤' },
  { id: 'sr-3', group: 'alunos', title: 'Pedro Lima', subtitle: 'Faixa Amarela - Judo', url: '/admin/alunos/pedro-lima', icon: '👤' },
  { id: 'sr-4', group: 'alunos', title: 'Maria Oliveira', subtitle: 'Faixa Branca - BJJ', url: '/admin/alunos/maria-oliveira', icon: '👤' },
  { id: 'sr-5', group: 'alunos', title: 'Lucas Mendes', subtitle: 'Faixa Azul - BJJ', url: '/admin/alunos/lucas-mendes', icon: '👤' },
  // Turmas
  { id: 'sr-6', group: 'turmas', title: 'BJJ Avancado - Noite', subtitle: 'Seg/Qua/Sex 19:00', url: '/admin/turmas/bjj-avancado-noite', icon: '🥋' },
  { id: 'sr-7', group: 'turmas', title: 'BJJ Iniciante - Manha', subtitle: 'Ter/Qui 07:00', url: '/admin/turmas/bjj-iniciante-manha', icon: '🥋' },
  { id: 'sr-8', group: 'turmas', title: 'Kids BJJ', subtitle: 'Sab 09:00', url: '/admin/turmas/kids-bjj', icon: '🥋' },
  // Videos
  { id: 'sr-9', group: 'videos', title: 'Guarda Fechada - Basico', subtitle: '12 min - Prof. Silva', url: '/dashboard/conteudo/guarda-fechada', icon: '📺' },
  { id: 'sr-10', group: 'videos', title: 'Raspagem de Tesoura', subtitle: '8 min - Prof. Santos', url: '/dashboard/conteudo/raspagem-tesoura', icon: '📺' },
  { id: 'sr-11', group: 'videos', title: 'Passagem de Guarda com Pressao', subtitle: '15 min - Prof. Silva', url: '/dashboard/conteudo/passagem-pressao', icon: '📺' },
  // Leads
  { id: 'sr-12', group: 'leads', title: 'Carlos Ferreira', subtitle: 'Interessado em BJJ - 2 dias atras', url: '/admin/leads/carlos-ferreira', icon: '📱' },
  { id: 'sr-13', group: 'leads', title: 'Juliana Martins', subtitle: 'Aula experimental agendada', url: '/admin/leads/juliana-martins', icon: '📱' },
];

export async function mockGlobalSearch(
  query: string,
  _academyId: string,
): Promise<SearchResponse> {
  await delay();
  const lowerQuery = query.toLowerCase();
  const results = ALL_RESULTS.filter(
    (r) =>
      r.title.toLowerCase().includes(lowerQuery) ||
      r.subtitle.toLowerCase().includes(lowerQuery),
  );
  return { results, total: results.length };
}
