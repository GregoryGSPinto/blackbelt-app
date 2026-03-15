import type { FeedPost, FeedComment, PostType, FeedHighlights } from '@/lib/api/feed.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const POSTS: FeedPost[] = [
  {
    id: 'fp-1',
    type: 'promotion',
    authorId: 'system',
    authorName: 'Sistema',
    authorAvatar: null,
    authorRole: 'system',
    content: 'Parabens! Joao Silva conquistou a faixa azul apos 2 anos de dedicacao! Continue treinando forte!',
    imageUrl: undefined,
    likes: 24,
    commentCount: 8,
    liked: false,
    comments: [
      { id: 'fc-1a', authorName: 'Ana Costa', content: 'Merecido demais! Parabens Joao!', createdAt: '2026-03-15T10:15:00Z' },
      { id: 'fc-1b', authorName: 'Pedro Lima', content: 'Oss! Inspiracao pra gente!', createdAt: '2026-03-15T10:30:00Z' },
    ],
    createdAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'fp-2',
    type: 'class_photo',
    authorId: 'prof-1',
    authorName: 'Prof. Carlos Silva',
    authorAvatar: null,
    authorRole: 'teacher',
    content: 'Treino intenso hoje! Turma BJJ Avancado mandando ver nas passagens de guarda. Orgulho desse time!',
    imageUrl: '/images/feed/treino-avancado.jpg',
    likes: 18,
    commentCount: 5,
    liked: true,
    comments: [
      { id: 'fc-2a', authorName: 'Bruna Alves', content: 'Treino top demais professor!', createdAt: '2026-03-14T21:00:00Z' },
    ],
    createdAt: '2026-03-14T20:30:00Z',
  },
  {
    id: 'fp-3',
    type: 'milestone',
    authorId: 'system',
    authorName: 'Sistema',
    authorAvatar: null,
    authorRole: 'system',
    content: 'A academia completou 500 check-ins este mes! Novo recorde! Voces sao incriveis!',
    imageUrl: undefined,
    likes: 32,
    commentCount: 12,
    liked: false,
    comments: [],
    createdAt: '2026-03-14T12:00:00Z',
  },
  {
    id: 'fp-4',
    type: 'coach_tip',
    authorId: 'prof-2',
    authorName: 'Prof. Santos',
    authorAvatar: null,
    authorRole: 'teacher',
    content: 'Dica: na guarda fechada, mantenha o controle de quadril antes de buscar a raspagem. Foquem nos detalhes!',
    imageUrl: undefined,
    likes: 15,
    commentCount: 3,
    liked: false,
    comments: [
      { id: 'fc-4a', authorName: 'Lucas Mendes', content: 'Vou aplicar no treino de amanha!', createdAt: '2026-03-13T09:30:00Z' },
    ],
    createdAt: '2026-03-13T09:00:00Z',
  },
  {
    id: 'fp-5',
    type: 'event',
    authorId: 'admin-1',
    authorName: 'Admin',
    authorAvatar: null,
    authorRole: 'admin',
    content: 'Seminario de Guarda com professor convidado dia 22/03! Vagas limitadas. Inscreva-se na pagina de Eventos.',
    imageUrl: undefined,
    likes: 20,
    commentCount: 6,
    liked: false,
    comments: [],
    createdAt: '2026-03-12T14:00:00Z',
  },
  {
    id: 'fp-6',
    type: 'achievement',
    authorId: 'system',
    authorName: 'Sistema',
    authorAvatar: null,
    authorRole: 'system',
    content: 'Ana Costa desbloqueou a conquista "7 Dias Seguidos"! Dedicacao maxima no tatame!',
    imageUrl: undefined,
    likes: 12,
    commentCount: 2,
    liked: false,
    comments: [
      { id: 'fc-6a', authorName: 'Maria Oliveira', content: 'Arrasou Ana! Bora manter!', createdAt: '2026-03-11T18:30:00Z' },
    ],
    createdAt: '2026-03-11T18:00:00Z',
  },
  {
    id: 'fp-7',
    type: 'milestone',
    authorId: 'system',
    authorName: 'Sistema',
    authorAvatar: null,
    authorRole: 'system',
    content: 'Rafael Souza completou 100 treinos na academia! Um verdadeiro guerreiro do tatame!',
    imageUrl: undefined,
    likes: 28,
    commentCount: 9,
    liked: true,
    comments: [],
    createdAt: '2026-03-10T21:00:00Z',
  },
  {
    id: 'fp-8',
    type: 'class_photo',
    authorId: 'admin-1',
    authorName: 'Admin BlackBelt',
    authorAvatar: null,
    authorRole: 'admin',
    content: 'Turma infantil arrasando no treino de sabado! Os pequenos guerreiros estao evoluindo muito. Parabens aos pais pelo apoio!',
    imageUrl: '/images/feed/turma-kids.jpg',
    likes: 35,
    commentCount: 14,
    liked: false,
    comments: [
      { id: 'fc-8a', authorName: 'Mariana Souza', content: 'Meu filho ama os treinos! Obrigada professor!', createdAt: '2026-03-09T16:00:00Z' },
    ],
    createdAt: '2026-03-09T15:00:00Z',
  },
  {
    id: 'fp-9',
    type: 'promotion',
    authorId: 'system',
    authorName: 'Sistema',
    authorAvatar: null,
    authorRole: 'system',
    content: 'Pedro Lima recebeu a 2a faixa no Judo! Progressao constante e merecida!',
    imageUrl: undefined,
    likes: 19,
    commentCount: 7,
    liked: false,
    comments: [],
    createdAt: '2026-03-08T17:00:00Z',
  },
  {
    id: 'fp-10',
    type: 'coach_tip',
    authorId: 'prof-1',
    authorName: 'Prof. Carlos Silva',
    authorAvatar: null,
    authorRole: 'teacher',
    content: 'Lembrem-se: descanso faz parte do treino. Se voce treinou forte a semana toda, descanse no domingo para voltar mais forte na segunda!',
    imageUrl: undefined,
    likes: 22,
    commentCount: 4,
    liked: false,
    comments: [
      { id: 'fc-10a', authorName: 'Joao Silva', content: 'Preciso ouvir isso mais vezes haha!', createdAt: '2026-03-07T20:00:00Z' },
    ],
    createdAt: '2026-03-07T19:00:00Z',
  },
];

const HIGHLIGHTS: FeedHighlights = {
  studentOfTheWeek: {
    name: 'Ana Costa',
    avatar: null,
    reason: '5 treinos esta semana + conquista desbloqueada',
  },
  classHighlight: {
    className: 'BJJ Avancado - Noite',
    stat: '92% presenca esta semana',
  },
  birthdays: [
    { name: 'Lucas Mendes', date: '15/03' },
    { name: 'Fernanda Rocha', date: '16/03' },
    { name: 'Ricardo Santos', date: '18/03' },
  ],
};

export async function mockGetFeed(
  _academyId: string,
  _page: number,
  filter?: PostType,
): Promise<FeedPost[]> {
  await delay();
  const filtered = filter ? POSTS.filter((p) => p.type === filter) : POSTS;
  return filtered.map((p) => ({ ...p, comments: p.comments.map((c) => ({ ...c })) }));
}

export async function mockLikePost(_postId: string): Promise<void> {
  await delay();
}

export async function mockAddComment(
  postId: string,
  content: string,
): Promise<FeedComment> {
  await delay();
  return {
    id: `fc-${Date.now()}`,
    authorName: 'Voce',
    content,
    createdAt: new Date().toISOString(),
  };
}

export async function mockGetHighlights(
  _academyId: string,
): Promise<FeedHighlights> {
  await delay();
  return { ...HIGHLIGHTS };
}
