import { BeltLevel } from '@/lib/types';
import type { VideoCardDTO, VideoDetail, SeriesDTO, VideoFilters } from '@/lib/api/content.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const BELT_COLORS: Record<string, string> = {
  white: '#F5F5F5', gray: '#9E9E9E', yellow: '#FDD835', orange: '#FB8C00',
  green: '#43A047', blue: '#1E88E5', purple: '#8E24AA', brown: '#6D4C41', black: '#212121',
};

const MOCK_VIDEOS: VideoCardDTO[] = [
  { id: 'vid-1', title: 'Guarda Fechada — Fundamentos', duration: 15, belt_level: BeltLevel.White, thumbnail_color: BELT_COLORS.white, professor_name: 'Carlos Silva', progress: 80, is_locked: false },
  { id: 'vid-2', title: 'Raspagem de Gancho', duration: 12, belt_level: BeltLevel.White, thumbnail_color: BELT_COLORS.white, professor_name: 'Carlos Silva', is_locked: false },
  { id: 'vid-3', title: 'Passagem Toreando', duration: 18, belt_level: BeltLevel.Gray, thumbnail_color: BELT_COLORS.gray, professor_name: 'Carlos Silva', is_locked: false },
  { id: 'vid-4', title: 'Armlock da Guarda', duration: 10, belt_level: BeltLevel.Gray, thumbnail_color: BELT_COLORS.gray, professor_name: 'Ana Santos', is_locked: false },
  { id: 'vid-5', title: 'Triângulo — Detalhes', duration: 20, belt_level: BeltLevel.Yellow, thumbnail_color: BELT_COLORS.yellow, professor_name: 'Carlos Silva', is_locked: false },
  { id: 'vid-6', title: 'Kimura — Variações', duration: 14, belt_level: BeltLevel.Yellow, thumbnail_color: BELT_COLORS.yellow, professor_name: 'Ana Santos', is_locked: false },
  { id: 'vid-7', title: 'Meia-Guarda — Underhook', duration: 22, belt_level: BeltLevel.Orange, thumbnail_color: BELT_COLORS.orange, professor_name: 'Roberto Lima', is_locked: false },
  { id: 'vid-8', title: 'Berimbolo Básico', duration: 25, belt_level: BeltLevel.Green, thumbnail_color: BELT_COLORS.green, professor_name: 'Carlos Silva', is_locked: false },
  { id: 'vid-9', title: 'Passagem Leg Drag', duration: 16, belt_level: BeltLevel.Green, thumbnail_color: BELT_COLORS.green, professor_name: 'Fernanda Costa', is_locked: false },
  { id: 'vid-10', title: 'Back Take — Spider Guard', duration: 30, belt_level: BeltLevel.Blue, thumbnail_color: BELT_COLORS.blue, professor_name: 'Carlos Silva', progress: 40, is_locked: false },
  { id: 'vid-11', title: 'De La Riva — Sweep System', duration: 35, belt_level: BeltLevel.Blue, thumbnail_color: BELT_COLORS.blue, professor_name: 'Carlos Silva', is_locked: false },
  { id: 'vid-12', title: 'Lapel Guard Avançada', duration: 28, belt_level: BeltLevel.Purple, thumbnail_color: BELT_COLORS.purple, professor_name: 'Carlos Silva', is_locked: true },
  { id: 'vid-13', title: 'Leg Lock — Ashi Garami', duration: 32, belt_level: BeltLevel.Purple, thumbnail_color: BELT_COLORS.purple, professor_name: 'Fernanda Costa', is_locked: true },
  { id: 'vid-14', title: 'Worm Guard System', duration: 40, belt_level: BeltLevel.Brown, thumbnail_color: BELT_COLORS.brown, professor_name: 'Carlos Silva', is_locked: true },
  { id: 'vid-15', title: 'Competition Strategy', duration: 45, belt_level: BeltLevel.Black, thumbnail_color: BELT_COLORS.black, professor_name: 'Carlos Silva', is_locked: true },
];

const MOCK_SERIES: SeriesDTO[] = [
  { id: 'series-1', title: 'Fundamentos do BJJ', video_count: 6, belt_level: BeltLevel.White, thumbnail_color: BELT_COLORS.white },
  { id: 'series-2', title: 'Jogo Intermediário', video_count: 5, belt_level: BeltLevel.Green, thumbnail_color: BELT_COLORS.green },
  { id: 'series-3', title: 'Técnicas Avançadas', video_count: 4, belt_level: BeltLevel.Purple, thumbnail_color: BELT_COLORS.purple },
];

export async function mockListVideos(_academyId: string, filters?: VideoFilters): Promise<VideoCardDTO[]> {
  await delay();
  let result = MOCK_VIDEOS;
  if (filters?.belt) result = result.filter((v) => v.belt_level === filters.belt);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((v) => v.title.toLowerCase().includes(q));
  }
  return result;
}

export async function mockGetVideo(id: string): Promise<VideoDetail> {
  await delay();
  const card = MOCK_VIDEOS.find((v) => v.id === id);
  if (!card) throw new Error('Vídeo não encontrado');
  return {
    id: card.id,
    academy_id: 'academy-1',
    title: card.title,
    url: `https://example.com/videos/${card.id}`,
    belt_level: card.belt_level,
    duration: card.duration,
    description: `Neste vídeo, ${card.professor_name} ensina os detalhes e variações de ${card.title}. Ideal para praticantes de faixa ${card.belt_level} ou superior.`,
    professor_name: card.professor_name,
    modality_name: 'Brazilian Jiu-Jitsu',
    related_videos: MOCK_VIDEOS.filter((v) => v.id !== id && v.belt_level === card.belt_level).slice(0, 3),
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
  };
}

export async function mockGetSeries(_academyId: string): Promise<SeriesDTO[]> {
  await delay();
  return MOCK_SERIES;
}
