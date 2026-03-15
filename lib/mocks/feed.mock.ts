import type { FeedPost, PostType } from '@/lib/api/feed.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const POSTS: FeedPost[] = [
  { id: 'fp-1', type: 'achievement', authorName: 'Sistema', authorAvatar: null, content: 'João Silva conquistou faixa azul! Parabéns pela dedicação!', likes: 24, commentCount: 8, liked: false, createdAt: '2026-03-15T10:00:00Z' },
  { id: 'fp-2', type: 'class_photo', authorName: 'Prof. Silva', authorAvatar: null, content: 'Treino top hoje! Turma BJJ Avançado mandando ver na técnica.', likes: 18, commentCount: 5, liked: true, createdAt: '2026-03-14T20:30:00Z' },
  { id: 'fp-3', type: 'milestone', authorName: 'Sistema', authorAvatar: null, content: 'A academia completou 500 check-ins este mês! Novo recorde!', likes: 32, commentCount: 12, liked: false, createdAt: '2026-03-14T12:00:00Z' },
  { id: 'fp-4', type: 'coach_tip', authorName: 'Prof. Santos', authorAvatar: null, content: 'Dica: na guarda fechada, mantenha o controle de quadril antes de buscar a raspagem. Assista o vídeo na seção de conteúdo!', likes: 15, commentCount: 3, liked: false, createdAt: '2026-03-13T09:00:00Z' },
  { id: 'fp-5', type: 'event', authorName: 'Admin', authorAvatar: null, content: 'Seminário de Guarda com professor convidado dia 22/03! Vagas limitadas. Inscreva-se em Eventos.', likes: 20, commentCount: 6, liked: false, createdAt: '2026-03-12T14:00:00Z' },
  { id: 'fp-6', type: 'achievement', authorName: 'Sistema', authorAvatar: null, content: 'Ana Costa desbloqueou a conquista "7 Dias Seguidos"! Dedicação máxima.', likes: 12, commentCount: 2, liked: false, createdAt: '2026-03-11T18:00:00Z' },
  { id: 'fp-7', type: 'student_post', authorName: 'Maria Oliveira', authorAvatar: null, content: 'Consegui finalizar com triângulo pela primeira vez! Obrigada Prof. Silva pelas dicas.', likes: 28, commentCount: 9, liked: true, createdAt: '2026-03-10T21:00:00Z' },
];

export async function mockGetFeed(_academyId: string, _page: number, filter?: PostType): Promise<FeedPost[]> {
  await delay();
  const filtered = filter ? POSTS.filter((p) => p.type === filter) : POSTS;
  return filtered.map((p) => ({ ...p }));
}
