import { BeltLevel } from '@/lib/types';
import type {
  StreamingSection,
  StreamingVideoCard,
  VideoProgressDTO,
  TrailDTO,
} from '@/lib/api/streaming.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const BELT_COLORS: Record<string, string> = {
  white: '#F5F5F5', gray: '#9E9E9E', yellow: '#FDD835', orange: '#FB8C00',
  green: '#43A047', blue: '#1E88E5', purple: '#8E24AA', brown: '#6D4C41', black: '#212121',
};

const ALL_VIDEOS: StreamingVideoCard[] = [
  // Continue watching
  { id: 'sv-1', title: 'Guarda Fechada — Fundamentos', thumbnail_url: '', thumbnail_color: BELT_COLORS.white, duration_minutes: 15, professor_name: 'Carlos Silva', professor_avatar: null, belt_level: BeltLevel.White, modality: 'BJJ', progress_percent: 72, is_locked: false, lock_reason: null },
  { id: 'sv-2', title: 'Raspagem de Gancho', thumbnail_url: '', thumbnail_color: BELT_COLORS.white, duration_minutes: 12, professor_name: 'Carlos Silva', professor_avatar: null, belt_level: BeltLevel.White, modality: 'BJJ', progress_percent: 35, is_locked: false, lock_reason: null },
  // Recommended
  { id: 'sv-3', title: 'Passagem Toreando', thumbnail_url: '', thumbnail_color: BELT_COLORS.gray, duration_minutes: 18, professor_name: 'Carlos Silva', professor_avatar: null, belt_level: BeltLevel.Gray, modality: 'BJJ', progress_percent: 0, is_locked: false, lock_reason: null },
  { id: 'sv-4', title: 'Armlock da Guarda', thumbnail_url: '', thumbnail_color: BELT_COLORS.gray, duration_minutes: 10, professor_name: 'Ana Santos', professor_avatar: null, belt_level: BeltLevel.Gray, modality: 'BJJ', progress_percent: 0, is_locked: false, lock_reason: null },
  { id: 'sv-5', title: 'Triângulo — Detalhes Avançados', thumbnail_url: '', thumbnail_color: BELT_COLORS.yellow, duration_minutes: 20, professor_name: 'Carlos Silva', professor_avatar: null, belt_level: BeltLevel.Yellow, modality: 'BJJ', progress_percent: 0, is_locked: false, lock_reason: null },
  // Modality videos
  { id: 'sv-6', title: 'Kimura — Variações Completas', thumbnail_url: '', thumbnail_color: BELT_COLORS.yellow, duration_minutes: 14, professor_name: 'Ana Santos', professor_avatar: null, belt_level: BeltLevel.Yellow, modality: 'BJJ', progress_percent: 0, is_locked: false, lock_reason: null },
  { id: 'sv-7', title: 'Meia-Guarda — Underhook System', thumbnail_url: '', thumbnail_color: BELT_COLORS.orange, duration_minutes: 22, professor_name: 'Roberto Lima', professor_avatar: null, belt_level: BeltLevel.Orange, modality: 'BJJ', progress_percent: 0, is_locked: false, lock_reason: null },
  { id: 'sv-8', title: 'Berimbolo Básico para Iniciantes', thumbnail_url: '', thumbnail_color: BELT_COLORS.green, duration_minutes: 25, professor_name: 'Carlos Silva', professor_avatar: null, belt_level: BeltLevel.Green, modality: 'BJJ', progress_percent: 0, is_locked: false, lock_reason: null },
  { id: 'sv-9', title: 'Jogo de Costas — Controle Total', thumbnail_url: '', thumbnail_color: BELT_COLORS.blue, duration_minutes: 30, professor_name: 'Carlos Silva', professor_avatar: null, belt_level: BeltLevel.Blue, modality: 'BJJ', progress_percent: 40, is_locked: false, lock_reason: null },
  // Locked
  { id: 'sv-10', title: 'Lapel Guard Avançada', thumbnail_url: '', thumbnail_color: BELT_COLORS.purple, duration_minutes: 28, professor_name: 'Carlos Silva', professor_avatar: null, belt_level: BeltLevel.Purple, modality: 'BJJ', progress_percent: 0, is_locked: true, lock_reason: 'Disponível a partir da faixa roxa' },
  { id: 'sv-11', title: 'Leg Lock — Ashi Garami System', thumbnail_url: '', thumbnail_color: BELT_COLORS.purple, duration_minutes: 32, professor_name: 'Fernanda Costa', professor_avatar: null, belt_level: BeltLevel.Purple, modality: 'BJJ', progress_percent: 0, is_locked: true, lock_reason: 'Disponível a partir da faixa roxa' },
  { id: 'sv-12', title: 'Worm Guard — Full System', thumbnail_url: '', thumbnail_color: BELT_COLORS.brown, duration_minutes: 40, professor_name: 'Carlos Silva', professor_avatar: null, belt_level: BeltLevel.Brown, modality: 'BJJ', progress_percent: 0, is_locked: true, lock_reason: 'Disponível a partir da faixa marrom' },
  // Home training
  { id: 'sv-13', title: 'Solo Drills — Aquecimento', thumbnail_url: '', thumbnail_color: '#1E88E5', duration_minutes: 8, professor_name: 'Ana Santos', professor_avatar: null, belt_level: BeltLevel.White, modality: 'Treino em Casa', progress_percent: 100, is_locked: false, lock_reason: null },
  { id: 'sv-14', title: 'Mobilidade para Guarda', thumbnail_url: '', thumbnail_color: '#43A047', duration_minutes: 12, professor_name: 'Roberto Lima', professor_avatar: null, belt_level: BeltLevel.White, modality: 'Treino em Casa', progress_percent: 0, is_locked: false, lock_reason: null },
  { id: 'sv-15', title: 'Cardio Funcional BJJ', thumbnail_url: '', thumbnail_color: '#FB8C00', duration_minutes: 20, professor_name: 'Fernanda Costa', professor_avatar: null, belt_level: BeltLevel.White, modality: 'Treino em Casa', progress_percent: 50, is_locked: false, lock_reason: null },
  // By professor
  { id: 'sv-16', title: 'Estrangulamentos da Montada', thumbnail_url: '', thumbnail_color: BELT_COLORS.blue, duration_minutes: 18, professor_name: 'Fernanda Costa', professor_avatar: null, belt_level: BeltLevel.Blue, modality: 'BJJ', progress_percent: 0, is_locked: false, lock_reason: null },
];

export async function mockGetStreamingHome(_studentId: string): Promise<StreamingSection[]> {
  await delay();

  const continueWatching = ALL_VIDEOS.filter((v) => v.progress_percent > 0 && v.progress_percent < 100);
  const recommended = ALL_VIDEOS.filter((v) => !v.is_locked && v.progress_percent === 0).slice(0, 5);
  const byModality = ALL_VIDEOS.filter((v) => v.modality === 'BJJ' && !v.is_locked);
  const byProfessor = ALL_VIDEOS.filter((v) => v.professor_name === 'Carlos Silva');
  const homeTraining = ALL_VIDEOS.filter((v) => v.modality === 'Treino em Casa');

  const sections: StreamingSection[] = [];

  if (continueWatching.length > 0) {
    sections.push({ id: 'sec-continue', title: 'Continuar Assistindo', type: 'continue', videos: continueWatching });
  }

  sections.push(
    { id: 'sec-recommended', title: 'Recomendado para Você', type: 'recommended', videos: recommended },
    { id: 'sec-trail', title: 'Trilhas Oficiais', type: 'trail', videos: ALL_VIDEOS.filter((v) => !v.is_locked).slice(0, 6) },
    { id: 'sec-modality', title: 'Brazilian Jiu-Jitsu', type: 'modality', videos: byModality },
    { id: 'sec-professor', title: 'Prof. Carlos Silva', type: 'professor', videos: byProfessor },
    { id: 'sec-home', title: 'Treinos em Casa', type: 'home_training', videos: homeTraining },
  );

  return sections;
}

export async function mockGetVideoProgress(_studentId: string, videoId: string): Promise<VideoProgressDTO> {
  await delay();
  const video = ALL_VIDEOS.find((v) => v.id === videoId);
  return {
    video_id: videoId,
    student_id: _studentId,
    progress_percent: video?.progress_percent ?? 0,
    last_watched_at: '2026-03-14T18:30:00Z',
    completed: (video?.progress_percent ?? 0) >= 100,
  };
}

export async function mockGetTrails(_academyId: string): Promise<TrailDTO[]> {
  await delay();
  return [
    { id: 'trail-1', academy_id: _academyId, title: 'Fundamentos Essenciais', description: 'Do zero ao primeiro mês', thumbnail_color: BELT_COLORS.white, belt_level: BeltLevel.White, total_videos: 8, completed_videos: 6, is_completed: false },
    { id: 'trail-2', academy_id: _academyId, title: 'Jogo de Guarda Completo', description: 'Domine todas as posições de guarda', thumbnail_color: BELT_COLORS.blue, belt_level: BeltLevel.Blue, total_videos: 12, completed_videos: 4, is_completed: false },
    { id: 'trail-3', academy_id: _academyId, title: 'Passagem de Guarda', description: 'Técnicas de passagem do branco ao azul', thumbnail_color: BELT_COLORS.green, belt_level: BeltLevel.Green, total_videos: 10, completed_videos: 10, is_completed: true },
    { id: 'trail-4', academy_id: _academyId, title: 'Finalizações Essenciais', description: 'As 20 finalizações que todo faixa azul precisa saber', thumbnail_color: BELT_COLORS.yellow, belt_level: BeltLevel.Yellow, total_videos: 20, completed_videos: 8, is_completed: false },
    { id: 'trail-5', academy_id: _academyId, title: 'Jogo Avançado — Leg Locks', description: 'Sistema completo de leg locks', thumbnail_color: BELT_COLORS.purple, belt_level: BeltLevel.Purple, total_videos: 15, completed_videos: 0, is_completed: false },
  ];
}
