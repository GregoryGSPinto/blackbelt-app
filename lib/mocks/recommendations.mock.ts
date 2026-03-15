import type { RecommendedVideo, ContentFeed } from '@/lib/api/recommendations.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const VIDEOS: RecommendedVideo[] = [
  { id: 'rv-1', title: 'Passagem de Guarda — Toreando', duration: 720, reason: 'Baseado na sua avaliação de técnica', score: 95 },
  { id: 'rv-2', title: 'Retenção de Guarda Fechada', duration: 540, reason: 'Popular na sua faixa', score: 88 },
  { id: 'rv-3', title: 'Triângulo dos Fundamentos', duration: 600, reason: 'Recomendação do professor', score: 85 },
  { id: 'rv-4', title: 'Escape de Montada', duration: 480, reason: 'Reforçar ponto fraco', score: 82 },
  { id: 'rv-5', title: 'Raspagem de Gancho', duration: 660, reason: 'Continuação da série', score: 78 },
];

export async function mockGetRecommendations(_studentId: string): Promise<RecommendedVideo[]> {
  await delay();
  return VIDEOS.map((v) => ({ ...v }));
}

export async function mockGetPersonalizedFeed(_studentId: string): Promise<ContentFeed> {
  await delay();
  return {
    recommended: VIDEOS.slice(0, 3),
    newContent: [
      { id: 'nv-1', title: 'Kimura — Setups Avançados', duration: 900, reason: 'Novo conteúdo', score: 90 },
    ],
    trending: [VIDEOS[1], VIDEOS[2]],
    completeSeries: [VIDEOS[4]],
  };
}
