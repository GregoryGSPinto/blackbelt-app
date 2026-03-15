import type { TrainingVideoDTO, VideoAnnotation, UploadVideoPayload } from '@/lib/api/training-video.service';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

const ANNOTATIONS: VideoAnnotation[] = [
  { id: 'ann-1', video_id: 'vid-1', author_id: 'prof-1', author_name: 'Prof. Carlos Silva', timestamp_sec: 12, type: 'circle', color: 'red', content: 'Postura do quadril muito alta — abaixar para manter a base', x: 45, y: 60, created_at: '2026-03-10T14:30:00Z' },
  { id: 'ann-2', video_id: 'vid-1', author_id: 'prof-1', author_name: 'Prof. Carlos Silva', timestamp_sec: 28, type: 'arrow', color: 'green', content: 'Excelente encaixe do underhook!', x: 50, y: 40, created_at: '2026-03-10T14:31:00Z' },
  { id: 'ann-3', video_id: 'vid-2', author_id: 'prof-2', author_name: 'Prof. Ana Ribeiro', timestamp_sec: 8, type: 'text', color: 'yellow', content: 'Faltou pressão no joelho durante a passagem — revisar drill de toreando', x: 30, y: 55, created_at: '2026-03-11T10:15:00Z' },
];

const VIDEOS: TrainingVideoDTO[] = [
  {
    id: 'vid-1', student_id: 'student-1', student_name: 'João Pedro Mendes', class_id: 'class-1', class_name: 'BJJ Fundamental', uploaded_by: 'prof-1', uploaded_by_name: 'Prof. Carlos Silva',
    file_url: '/mock/videos/armbar-drill.mp4', thumbnail_url: '/mock/thumbs/armbar-drill.jpg', duration: 94, file_size: 24_500_000, status: 'ready',
    annotations: [ANNOTATIONS[0], ANNOTATIONS[1]],
    ai_analysis: { overall_score: 78, posture_score: 72, balance_score: 80, technique_score: 82, summary: 'Boa execução geral do armbar da guarda fechada. Precisa melhorar a elevação do quadril no momento da finalização.', highlights: ['Bom controle de postura do oponente', 'Transição suave da guarda fechada para o armbar'], corrections: ['Elevar mais o quadril no momento da finalização', 'Manter o calcanhar mais próximo do pescoço do oponente'], analyzed_at: '2026-03-10T15:00:00Z' },
    created_at: '2026-03-10T14:00:00Z', updated_at: '2026-03-10T15:00:00Z',
  },
  {
    id: 'vid-2', student_id: 'student-2', student_name: 'Maria Clara Santos', class_id: 'class-1', class_name: 'BJJ Fundamental', uploaded_by: 'prof-2', uploaded_by_name: 'Prof. Ana Ribeiro',
    file_url: '/mock/videos/guard-pass.mp4', thumbnail_url: '/mock/thumbs/guard-pass.jpg', duration: 67, file_size: 18_200_000, status: 'ready',
    annotations: [ANNOTATIONS[2]],
    ai_analysis: { overall_score: 85, posture_score: 88, balance_score: 82, technique_score: 85, summary: 'Passagem de guarda toreando com bom timing. Pressão lateral precisa de ajuste.', highlights: ['Ótimo grip no gi', 'Timing de passagem preciso'], corrections: ['Aumentar pressão lateral após a passagem', 'Consolidar side control mais rápido'], analyzed_at: '2026-03-11T11:00:00Z' },
    created_at: '2026-03-11T10:00:00Z', updated_at: '2026-03-11T11:00:00Z',
  },
  {
    id: 'vid-3', student_id: 'student-3', student_name: 'Lucas Ferreira', class_id: 'class-2', class_name: 'BJJ Avançado', uploaded_by: 'prof-1', uploaded_by_name: 'Prof. Carlos Silva',
    file_url: '/mock/videos/berimbolo.mp4', thumbnail_url: '/mock/thumbs/berimbolo.jpg', duration: 120, file_size: 32_100_000, status: 'ready',
    annotations: [],
    ai_analysis: null,
    created_at: '2026-03-12T09:00:00Z', updated_at: '2026-03-12T09:00:00Z',
  },
  {
    id: 'vid-4', student_id: 'student-1', student_name: 'João Pedro Mendes', class_id: 'class-2', class_name: 'BJJ Avançado', uploaded_by: 'prof-1', uploaded_by_name: 'Prof. Carlos Silva',
    file_url: '/mock/videos/triangle-setup.mp4', thumbnail_url: '/mock/thumbs/triangle-setup.jpg', duration: 85, file_size: 22_800_000, status: 'ready',
    annotations: [],
    ai_analysis: { overall_score: 91, posture_score: 90, balance_score: 88, technique_score: 95, summary: 'Setup de triângulo muito bem executado. Ângulo de corte excelente.', highlights: ['Controle de postura impecável', 'Ângulo de corte perfeito', 'Boa transição para o ajuste final'], corrections: ['Puxar a cabeça com mais ênfase no ajuste'], analyzed_at: '2026-03-12T16:00:00Z' },
    created_at: '2026-03-12T15:00:00Z', updated_at: '2026-03-12T16:00:00Z',
  },
  {
    id: 'vid-5', student_id: 'student-4', student_name: 'Ana Beatriz Costa', class_id: 'class-3', class_name: 'Muay Thai', uploaded_by: 'prof-3', uploaded_by_name: 'Prof. Roberto Lima',
    file_url: '/mock/videos/sweep-drill.mp4', thumbnail_url: '/mock/thumbs/sweep-drill.jpg', duration: 45, file_size: 12_400_000, status: 'processing',
    annotations: [],
    ai_analysis: null,
    created_at: '2026-03-13T08:30:00Z', updated_at: '2026-03-13T08:30:00Z',
  },
  {
    id: 'vid-6', student_id: 'student-5', student_name: 'Ricardo Almeida', class_id: 'class-1', class_name: 'BJJ Fundamental', uploaded_by: 'prof-1', uploaded_by_name: 'Prof. Carlos Silva',
    file_url: '/mock/videos/failed-upload.mp4', thumbnail_url: '', duration: 0, file_size: 5_000_000, status: 'failed',
    annotations: [],
    ai_analysis: null,
    created_at: '2026-03-13T11:00:00Z', updated_at: '2026-03-13T11:01:00Z',
  },
];

export async function mockUploadTrainingVideo(payload: UploadVideoPayload): Promise<TrainingVideoDTO> {
  await delay(500);
  const newVideo: TrainingVideoDTO = {
    id: `vid-${Date.now()}`, student_id: payload.student_id, student_name: 'Aluno Selecionado', class_id: payload.class_id, class_name: 'BJJ Fundamental',
    uploaded_by: payload.uploaded_by, uploaded_by_name: 'Prof. Carlos Silva',
    file_url: `/mock/videos/${payload.file.name}`, thumbnail_url: `/mock/thumbs/${payload.file.name}.jpg`,
    duration: 60, file_size: payload.file.size, status: 'processing',
    annotations: [], ai_analysis: null,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  VIDEOS.push(newVideo);
  return newVideo;
}

export async function mockListTrainingVideos(filters?: { student_id?: string; class_id?: string; professor_id?: string }): Promise<TrainingVideoDTO[]> {
  await delay(200);
  let result = VIDEOS.map((v) => ({ ...v }));
  if (filters?.student_id) result = result.filter((v) => v.student_id === filters.student_id);
  if (filters?.class_id) result = result.filter((v) => v.class_id === filters.class_id);
  if (filters?.professor_id) result = result.filter((v) => v.uploaded_by === filters.professor_id);
  return result;
}

export async function mockGetTrainingVideoById(videoId: string): Promise<TrainingVideoDTO> {
  await delay(200);
  const video = VIDEOS.find((v) => v.id === videoId);
  if (!video) throw new Error('Vídeo não encontrado');
  return { ...video };
}

export async function mockDeleteTrainingVideo(videoId: string): Promise<void> {
  await delay(300);
  const idx = VIDEOS.findIndex((v) => v.id === videoId);
  if (idx >= 0) VIDEOS.splice(idx, 1);
}

export async function mockAddAnnotation(videoId: string, annotation: Omit<VideoAnnotation, 'id' | 'video_id' | 'created_at'>): Promise<VideoAnnotation> {
  await delay(200);
  const video = VIDEOS.find((v) => v.id === videoId);
  if (!video) throw new Error('Vídeo não encontrado');
  const newAnnotation: VideoAnnotation = {
    ...annotation, id: `ann-${Date.now()}`, video_id: videoId, created_at: new Date().toISOString(),
  };
  video.annotations.push(newAnnotation);
  return newAnnotation;
}
