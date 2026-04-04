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
  // Comunicados
  { id: 'sr-14', group: 'comunicados', title: 'Horario especial feriado', subtitle: 'Publicado em 10/03/2026', url: '/admin/comunicados', icon: '📢' },
  { id: 'sr-15', group: 'comunicados', title: 'Campeonato interno de BJJ', subtitle: 'Publicado em 05/03/2026', url: '/admin/comunicados', icon: '📢' },
  { id: 'sr-16', group: 'comunicados', title: 'Seminario com mestre visitante', subtitle: 'Publicado em 28/02/2026', url: '/admin/comunicados', icon: '📢' },
  // Paginas
  { id: 'sr-17', group: 'paginas', title: 'Dashboard', subtitle: 'Painel principal', url: '/admin', icon: '📊' },
  { id: 'sr-18', group: 'paginas', title: 'Financeiro', subtitle: 'Gestao financeira', url: '/admin/financeiro', icon: '💰' },
  { id: 'sr-19', group: 'paginas', title: 'Relatorios', subtitle: 'Relatorios e metricas', url: '/admin/relatorios', icon: '📈' },
  { id: 'sr-20', group: 'paginas', title: 'Calendario', subtitle: 'Calendario de eventos', url: '/admin/calendario', icon: '📅' },
  { id: 'sr-21', group: 'paginas', title: 'Retencao', subtitle: 'Analise de retencao de alunos', url: '/admin/retencao', icon: '🎯' },
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
