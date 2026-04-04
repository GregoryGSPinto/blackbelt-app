import type {
  Announcement,
  AnnouncementStats,
  CreateAnnouncementPayload,
} from '@/lib/types/announcement';

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    academy_id: 'academy-1',
    title: 'Seminário de Jiu-Jitsu com Professor Visitante',
    content:
      'Informamos que no próximo sábado, dia 22/03, teremos um seminário especial de Jiu-Jitsu com o Professor Marcos Almeida, faixa preta 3º grau. Vagas limitadas a 40 participantes. Valor: R$ 80 para alunos da academia.',
    author_id: 'prof-1',
    author_name: 'Roberto Silva',
    status: 'published',
    target_audience: 'all',
    target_class_id: null,
    target_class_name: null,
    scheduled_at: null,
    published_at: '2026-03-10T10:30:00Z',
    created_at: '2026-03-10T10:00:00Z',
    attachments: [],
    read_count: 134,
    total_recipients: 172,
  },
  {
    id: 'ann-2',
    academy_id: 'academy-1',
    title: 'Alteração de Horários — Abril 2026',
    content:
      'A partir de 01/04 teremos novos horários para as turmas de Muay Thai e Jiu-Jitsu infantil. Confira a grade atualizada no mural da academia ou no app.',
    author_id: 'admin-1',
    author_name: 'Roberto Silva',
    status: 'scheduled',
    target_audience: 'all',
    target_class_id: null,
    target_class_name: null,
    scheduled_at: '2026-03-25T09:00:00Z',
    published_at: null,
    created_at: '2026-03-14T08:00:00Z',
    attachments: [
      {
        id: 'att-1',
        name: 'grade-abril-2026.pdf',
        url: '#',
        type: 'application/pdf',
        size_bytes: 245_000,
      },
    ],
    read_count: 0,
    total_recipients: 172,
  },
  {
    id: 'ann-3',
    academy_id: 'academy-1',
    title: 'Campeonato Interno Guerreiros Open',
    content:
      'Estão abertas as inscrições para o Campeonato Interno Guerreiros Open 2026! O evento será no dia 12/04, com categorias para todas as faixas. Inscrição gratuita para alunos ativos.',
    author_id: 'prof-2',
    author_name: 'Carlos Mendes',
    status: 'published',
    target_audience: 'students',
    target_class_id: null,
    target_class_name: null,
    scheduled_at: null,
    published_at: '2026-03-08T14:15:00Z',
    created_at: '2026-03-08T14:00:00Z',
    attachments: [],
    read_count: 98,
    total_recipients: 160,
  },
  {
    id: 'ann-4',
    academy_id: 'academy-1',
    title: 'Manutenção do Tatame — Área 2',
    content:
      'Informamos que a Área 2 do tatame estará em manutenção nos dias 18 e 19/03. As aulas serão redistribuídas para a Área 1 e Área 3.',
    author_id: 'admin-1',
    author_name: 'Roberto Silva',
    status: 'draft',
    target_audience: 'all',
    target_class_id: null,
    target_class_name: null,
    scheduled_at: null,
    published_at: null,
    created_at: '2026-03-15T16:00:00Z',
    attachments: [],
    read_count: 0,
    total_recipients: 172,
  },
  {
    id: 'ann-5',
    academy_id: 'academy-1',
    title: 'Reunião de Pais — Turma Kids',
    content:
      'Convidamos os responsáveis dos alunos da turma Kids para uma reunião no dia 28/03 às 19h. Abordaremos o progresso dos alunos e planejamento do semestre.',
    author_id: 'prof-3',
    author_name: 'Ana Oliveira',
    status: 'scheduled',
    target_audience: 'parents',
    target_class_id: null,
    target_class_name: null,
    scheduled_at: '2026-03-20T08:00:00Z',
    published_at: null,
    created_at: '2026-03-12T11:00:00Z',
    attachments: [],
    read_count: 0,
    total_recipients: 45,
  },
  {
    id: 'ann-6',
    academy_id: 'academy-1',
    title: 'Nova série de vídeos: Raspagens da Guarda',
    content:
      'Professor André lançou uma nova série de 8 vídeos sobre raspagens da guarda fechada. Disponível na aba Conteúdo para alunos faixa azul+.',
    author_id: 'prof-2',
    author_name: 'André Moreira',
    status: 'published',
    target_audience: 'students',
    target_class_id: null,
    target_class_name: null,
    scheduled_at: null,
    published_at: '2026-03-05T12:00:00Z',
    created_at: '2026-03-05T11:30:00Z',
    attachments: [],
    read_count: 112,
    total_recipients: 160,
  },
  {
    id: 'ann-7',
    academy_id: 'academy-1',
    title: 'Treinamento de professores — Metodologia Kids',
    content:
      'Atenção professores: teremos um treinamento sobre metodologia de ensino para turmas Kids no dia 30/03, das 14h às 17h. Presença obrigatória.',
    author_id: 'admin-1',
    author_name: 'Roberto Silva',
    status: 'published',
    target_audience: 'professors',
    target_class_id: null,
    target_class_name: null,
    scheduled_at: null,
    published_at: '2026-03-13T09:00:00Z',
    created_at: '2026-03-13T08:30:00Z',
    attachments: [],
    read_count: 10,
    total_recipients: 12,
  },
  {
    id: 'ann-8',
    academy_id: 'academy-1',
    title: 'Aula especial BJJ Fundamentos',
    content:
      'Neste sábado teremos aula especial de revisão para a turma BJJ Fundamentos. Foco em posições básicas e passagem de guarda.',
    author_id: 'prof-1',
    author_name: 'Roberto Silva',
    status: 'draft',
    target_audience: 'specific_class',
    target_class_id: 'class-1',
    target_class_name: 'BJJ Fundamentos',
    scheduled_at: null,
    published_at: null,
    created_at: '2026-03-16T10:00:00Z',
    attachments: [],
    read_count: 0,
    total_recipients: 28,
  },
];

export function mockListAnnouncements(
  _academyId: string,
  filters?: { status?: string; audience?: string },
): Announcement[] {
  let result = MOCK_ANNOUNCEMENTS;

  if (filters?.status) {
    result = result.filter((a) => a.status === filters.status);
  }
  if (filters?.audience) {
    result = result.filter((a) => a.target_audience === filters.audience);
  }

  return result.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function mockGetAnnouncement(id: string): Announcement | null {
  return MOCK_ANNOUNCEMENTS.find((a) => a.id === id) ?? null;
}

export function mockCreateAnnouncement(
  _academyId: string,
  payload: CreateAnnouncementPayload,
): Announcement {
  return {
    id: `ann-${Date.now()}`,
    academy_id: _academyId,
    title: payload.title,
    content: payload.content,
    author_id: 'admin-1',
    author_name: 'Roberto Silva',
    status: payload.scheduled_at ? 'scheduled' : 'draft',
    target_audience: payload.target_audience,
    target_class_id: payload.target_class_id ?? null,
    target_class_name: payload.target_class_id ? 'BJJ Fundamentos' : null,
    scheduled_at: payload.scheduled_at ?? null,
    published_at: null,
    created_at: new Date().toISOString(),
    attachments: [],
    read_count: 0,
    total_recipients: 172,
  };
}

export function mockPublishAnnouncement(id: string): Announcement {
  const ann = MOCK_ANNOUNCEMENTS.find((a) => a.id === id);
  if (!ann) throw new Error('Announcement not found');
  return { ...ann, status: 'published', published_at: new Date().toISOString() };
}

export function mockGetAnnouncementStats(_academyId: string): AnnouncementStats {
  const total = MOCK_ANNOUNCEMENTS.length;
  const published = MOCK_ANNOUNCEMENTS.filter((a) => a.status === 'published').length;
  const scheduled = MOCK_ANNOUNCEMENTS.filter((a) => a.status === 'scheduled').length;
  const drafts = MOCK_ANNOUNCEMENTS.filter((a) => a.status === 'draft').length;

  const publishedAnns = MOCK_ANNOUNCEMENTS.filter((a) => a.status === 'published');
  const avgRate =
    publishedAnns.length > 0
      ? publishedAnns.reduce(
          (sum, a) =>
            sum + (a.total_recipients > 0 ? (a.read_count / a.total_recipients) * 100 : 0),
          0,
        ) / publishedAnns.length
      : 0;

  return { total, published, scheduled, drafts, avg_read_rate: Math.round(avgRate * 10) / 10 };
}

export function mockMarkAnnouncementAsRead(_id: string): void {
  // no-op in mock
}
