import type { Review, AverageRating } from '@/lib/api/reviews.service';

const delay = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

const REVIEWS: Review[] = [
  { id: 'rev-1', course_id: 'mkt-1', user_id: 'u-1', user_name: 'João Silva', user_belt: 'Azul', rating: 5, text: 'Melhor curso de guarda fechada que já fiz. O professor explica cada detalhe com clareza. Meu jogo evoluiu muito depois desse curso.', created_at: '2026-03-10T08:30:00Z', creator_response: 'Obrigado João! Fico feliz que o conteúdo está te ajudando. Oss!', helpful_count: 24, reported: false },
  { id: 'rev-2', course_id: 'mkt-1', user_id: 'u-2', user_name: 'Maria Santos', user_belt: 'Branca', rating: 5, text: 'Comecei no jiu-jitsu há 6 meses e esse curso foi essencial. Didática impecável e progressão lógica dos temas.', created_at: '2026-03-08T15:00:00Z', helpful_count: 18, reported: false },
  { id: 'rev-3', course_id: 'mkt-1', user_id: 'u-3', user_name: 'Pedro Costa', user_belt: 'Roxa', rating: 4, text: 'Bom conteúdo, mas senti falta de mais variações modernas de guarda fechada. O básico está muito bem coberto.', created_at: '2026-03-05T10:00:00Z', helpful_count: 12, reported: false },
  { id: 'rev-4', course_id: 'mkt-2', user_id: 'u-4', user_name: 'Ana Rodrigues', user_belt: 'Azul', rating: 5, text: 'O sistema de passagem é muito completo. Aprendi a encadear passes de forma que nunca tinha pensado antes.', created_at: '2026-02-28T12:00:00Z', creator_response: 'Ana, que bom! Continue treinando esses encadeamentos. Abraço!', helpful_count: 15, reported: false },
  { id: 'rev-5', course_id: 'mkt-2', user_id: 'u-5', user_name: 'Lucas Mendes', user_belt: 'Marrom', rating: 4, text: 'Excelente para faixas azuis e roxas. Para marrom/preta, o conteúdo poderia ser mais denso em detalhes finos.', created_at: '2026-02-25T09:00:00Z', helpful_count: 8, reported: false },
  { id: 'rev-6', course_id: 'mkt-3', user_id: 'u-6', user_name: 'Fernanda Lima', user_belt: 'Verde', rating: 5, text: 'Sensei Takeshi é incrível! Cada detalhe do Seoi Nage é explicado com precisão. Meu ippon no último torneio veio desse curso.', created_at: '2026-03-01T14:30:00Z', helpful_count: 20, reported: false },
  { id: 'rev-7', course_id: 'mkt-3', user_id: 'u-7', user_name: 'Roberto Tanaka', user_belt: 'Azul', rating: 3, text: 'Conteúdo bom, mas a qualidade do áudio poderia ser melhor em algumas aulas. O técnico é excelente.', created_at: '2026-02-20T16:00:00Z', helpful_count: 5, reported: false },
  { id: 'rev-8', course_id: 'mkt-5', user_id: 'u-8', user_name: 'Thiago Barbosa', user_belt: 'Roxa', rating: 5, text: 'O módulo de berimbolo mudou completamente meu jogo. Professor Ricardo é referência nesse assunto.', created_at: '2026-03-12T11:00:00Z', helpful_count: 32, reported: false },
  { id: 'rev-9', course_id: 'mkt-8', user_id: 'u-9', user_name: 'Carla Souza', user_belt: 'Todas', rating: 4, text: 'Muito bom para quem quer melhorar o clinch. As drills são práticas e fáceis de replicar no treino.', created_at: '2026-03-03T08:00:00Z', helpful_count: 11, reported: false },
  { id: 'rev-10', course_id: 'mkt-9', user_id: 'u-10', user_name: 'Diego Ferreira', user_belt: 'Marrom', rating: 5, text: 'Finalmente um curso completo de leg locks em português. O sistema de entradas é genial. Vale cada centavo.', created_at: '2026-03-07T13:00:00Z', helpful_count: 28, reported: false },
  { id: 'rev-11', course_id: 'mkt-6', user_id: 'u-11', user_name: 'Isabela Martins', user_belt: 'Azul', rating: 5, text: 'Representatividade importa! Professora Kátia aborda questões que nenhum outro curso trata. Essencial para mulheres no BJJ.', created_at: '2026-02-15T10:00:00Z', creator_response: 'Isa, obrigada pelo carinho! Juntas somos mais fortes. Oss!', helpful_count: 35, reported: false },
  { id: 'rev-12', course_id: 'mkt-4', user_id: 'u-12', user_name: 'Marcelo Nunes', user_belt: 'Todas', rating: 2, text: 'Esperava mais conteúdo sobre ground and pound na meia-guarda. A parte de montada está boa, mas o resto é superficial.', created_at: '2026-01-20T17:00:00Z', helpful_count: 3, reported: false },
];

export async function mockCreateReview(courseId: string, userId: string, rating: number, text: string): Promise<Review> {
  await delay();
  const review: Review = {
    id: `rev-${Date.now()}`,
    course_id: courseId,
    user_id: userId,
    user_name: 'Aluno Demo',
    user_belt: 'Azul',
    rating,
    text,
    created_at: new Date().toISOString(),
    helpful_count: 0,
    reported: false,
  };
  REVIEWS.push(review);
  return review;
}

export async function mockGetReviews(courseId: string, page?: number): Promise<{ reviews: Review[]; total: number; page: number }> {
  await delay();
  const filtered = REVIEWS.filter((r) => r.course_id === courseId);
  const p = page || 1;
  const perPage = 5;
  const start = (p - 1) * perPage;
  return {
    reviews: filtered.slice(start, start + perPage),
    total: filtered.length,
    page: p,
  };
}

export async function mockGetAverageRating(courseId: string): Promise<AverageRating> {
  await delay();
  const filtered = REVIEWS.filter((r) => r.course_id === courseId);
  const total = filtered.length;
  const average = total > 0 ? filtered.reduce((s, r) => s + r.rating, 0) / total : 0;
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: filtered.filter((r) => r.rating === stars).length,
  }));
  return { average: Math.round(average * 10) / 10, total, distribution };
}

export async function mockReportReview(_reviewId: string, _reason: string): Promise<void> {
  await delay();
}

export async function mockRespondToReview(reviewId: string, response: string): Promise<Review> {
  await delay();
  const review = REVIEWS.find((r) => r.id === reviewId);
  if (!review) throw new Error('Review not found');
  review.creator_response = response;
  return { ...review };
}
