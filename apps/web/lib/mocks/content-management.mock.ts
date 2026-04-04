import type {
  ExtractedVideoInfo,
  VideoFormData,
  SeriesFormData,
  TrailFormData,
  AcademicMaterial,
  AcademicMaterialInput,
  ContentStats,
  VideoAnalytics,
  ContentVideo,
  QuizQuestionInput,
  VideoSource,
} from '@/lib/types/content-management';
import type {
  StreamingSeries,
  StreamingTrail,
  QuizQuestion,
} from '@/lib/types/streaming';

const delay = (ms = 250) => new Promise<void>((r) => setTimeout(r, ms));

// ── Gradient presets ────────────────────────────────────────────────

export const GRADIENT_PRESETS = [
  { name: 'Oceano', css: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { name: 'Sangue', css: 'linear-gradient(135deg, #200122 0%, #6f0000 100%)' },
  { name: 'Floresta', css: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #43A047 100%)' },
  { name: 'Noite', css: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)' },
  { name: 'Por do sol', css: 'linear-gradient(135deg, #4b134f 0%, #c94b4b 100%)' },
  { name: 'Aco', css: 'linear-gradient(135deg, #263238 0%, #37474F 50%, #455A64 100%)' },
  { name: 'Roxo', css: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)' },
  { name: 'Turquesa', css: 'linear-gradient(135deg, #00B894 0%, #00CEC9 100%)' },
  { name: 'Fogo', css: 'linear-gradient(135deg, #B71C1C 0%, #C62828 50%, #D32F2F 100%)' },
  { name: 'Terra', css: 'linear-gradient(135deg, #1e130c 0%, #9a8478 100%)' },
  { name: 'Cyber', css: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)' },
  { name: 'Ouro', css: 'linear-gradient(135deg, #FDCB6E 0%, #F39C12 100%)' },
];

// ── Mock content videos (extends streaming data) ────────────────────

const VIDEO_VIEWS: Record<string, { views: number; completions: number }> = {
  'v-1': { views: 167, completions: 157 },
  'v-2': { views: 245, completions: 218 },
  'v-3': { views: 134, completions: 98 },
  'v-4': { views: 112, completions: 89 },
  'v-5': { views: 98, completions: 76 },
  'v-6': { views: 198, completions: 150 },
  'v-7': { views: 87, completions: 40 },
  'v-8': { views: 76, completions: 51 },
  'v-9': { views: 56, completions: 38 },
  'v-10': { views: 43, completions: 32 },
  'v-11': { views: 21, completions: 14 },
  'v-12': { views: 10, completions: 7 },
  'v-13': { views: 0, completions: 0 },
  'v-14': { views: 0, completions: 0 },
  'v-15': { views: 0, completions: 0 },
};

let MOCK_VIDEOS: ContentVideo[] = [
  // Series 1: Fundamentos BJJ
  { id: 'v-1', title: 'Postura base e equilibrio', description: 'Aprenda a postura fundamental do Jiu-Jitsu, incluindo base, distribuicao de peso e como manter o equilibrio sob pressao.', source: 'youtube', source_url: 'https://www.youtube.com/watch?v=abc123', embed_url: 'https://www.youtube.com/embed/abc123', source_video_id: 'abc123', thumbnail_url: 'https://img.youtube.com/vi/abc123/maxresdefault.jpg', duration_seconds: 480, original_title: 'BJJ Postura Base Tutorial', modality: 'BJJ', min_belt: 'white', tags: ['fundamentos', 'postura'], series_id: 'series-fund', series_title: 'Fundamentos BJJ', order: 1, is_published: true, is_free: false, professor_id: 'prof-andre', professor_name: 'Prof. Andre', views: 167, completions: 157, quiz_count: 3, created_at: '2026-01-05T10:00:00Z', updated_at: '2026-01-05T10:00:00Z' },
  { id: 'v-2', title: 'Fuga de montada', description: 'Duas fugas essenciais da montada: a upa (ponte e rola) e o elbow-knee escape.', source: 'youtube', source_url: 'https://www.youtube.com/watch?v=def456', embed_url: 'https://www.youtube.com/embed/def456', source_video_id: 'def456', thumbnail_url: 'https://img.youtube.com/vi/def456/maxresdefault.jpg', duration_seconds: 720, original_title: 'Mount Escape Complete Guide', modality: 'BJJ', min_belt: 'white', tags: ['fundamentos', 'montada', 'fuga'], series_id: 'series-fund', series_title: 'Fundamentos BJJ', order: 2, is_published: true, is_free: true, professor_id: 'prof-andre', professor_name: 'Prof. Andre', views: 245, completions: 218, quiz_count: 3, created_at: '2026-01-12T10:00:00Z', updated_at: '2026-01-12T10:00:00Z' },
  { id: 'v-3', title: 'Raspagem guarda fechada', description: 'Tecnicas de raspagem partindo da guarda fechada: tesoura, pendulum e hip bump.', source: 'youtube', source_url: 'https://www.youtube.com/watch?v=ghi789', embed_url: 'https://www.youtube.com/embed/ghi789', source_video_id: 'ghi789', thumbnail_url: 'https://img.youtube.com/vi/ghi789/maxresdefault.jpg', duration_seconds: 900, original_title: 'Closed Guard Sweeps', modality: 'BJJ', min_belt: 'white', tags: ['fundamentos', 'guarda', 'raspagem'], series_id: 'series-fund', series_title: 'Fundamentos BJJ', order: 3, is_published: true, is_free: false, professor_id: 'prof-andre', professor_name: 'Prof. Andre', views: 134, completions: 98, quiz_count: 3, created_at: '2026-01-19T10:00:00Z', updated_at: '2026-01-19T10:00:00Z' },
  { id: 'v-4', title: 'Passagem de guarda basica', description: 'Passagens fundamentais: em pe com controle de calca e passagem de joelho.', source: 'youtube', source_url: 'https://www.youtube.com/watch?v=jkl012', embed_url: 'https://www.youtube.com/embed/jkl012', source_video_id: 'jkl012', thumbnail_url: 'https://img.youtube.com/vi/jkl012/maxresdefault.jpg', duration_seconds: 600, original_title: 'Basic Guard Passing', modality: 'BJJ', min_belt: 'white', tags: ['fundamentos', 'passagem'], series_id: 'series-fund', series_title: 'Fundamentos BJJ', order: 4, is_published: true, is_free: false, professor_id: 'prof-andre', professor_name: 'Prof. Andre', views: 112, completions: 89, quiz_count: 3, created_at: '2026-01-26T10:00:00Z', updated_at: '2026-01-26T10:00:00Z' },
  { id: 'v-5', title: 'Armlock do mount', description: 'O armlock classico partindo da montada: posicionamento, isolamento do braco e finalizacao.', source: 'youtube', source_url: 'https://www.youtube.com/watch?v=mno345', embed_url: 'https://www.youtube.com/embed/mno345', source_video_id: 'mno345', thumbnail_url: 'https://img.youtube.com/vi/mno345/maxresdefault.jpg', duration_seconds: 480, original_title: 'Armbar from Mount Tutorial', modality: 'BJJ', min_belt: 'white', tags: ['fundamentos', 'finalizacao'], series_id: 'series-fund', series_title: 'Fundamentos BJJ', order: 5, is_published: true, is_free: false, professor_id: 'prof-andre', professor_name: 'Prof. Andre', views: 98, completions: 76, quiz_count: 3, created_at: '2026-02-02T10:00:00Z', updated_at: '2026-02-02T10:00:00Z' },
  // Series 2: BJJ Intermediario
  { id: 'v-6', title: 'Guarda De La Riva', description: 'O sistema De La Riva: ganchos, controle de manga e calca, e as principais raspagens.', source: 'youtube', source_url: 'https://www.youtube.com/watch?v=pqr678', embed_url: 'https://www.youtube.com/embed/pqr678', source_video_id: 'pqr678', thumbnail_url: 'https://img.youtube.com/vi/pqr678/maxresdefault.jpg', duration_seconds: 1080, original_title: 'De La Riva Guard System', modality: 'BJJ', min_belt: 'blue', tags: ['intermediario', 'guarda', 'DLR'], series_id: 'series-inter', series_title: 'BJJ Intermediario', order: 1, is_published: true, is_free: false, professor_id: 'prof-andre', professor_name: 'Prof. Andre', views: 198, completions: 150, quiz_count: 3, created_at: '2026-02-09T10:00:00Z', updated_at: '2026-02-09T10:00:00Z' },
  { id: 'v-7', title: 'Passagem com pressao', description: 'Passagens com pressao: over-under, stack pass e smash pass.', source: 'youtube', source_url: 'https://www.youtube.com/watch?v=stu901', embed_url: 'https://www.youtube.com/embed/stu901', source_video_id: 'stu901', thumbnail_url: 'https://img.youtube.com/vi/stu901/maxresdefault.jpg', duration_seconds: 840, original_title: 'Pressure Passing BJJ', modality: 'BJJ', min_belt: 'blue', tags: ['intermediario', 'passagem', 'pressao'], series_id: 'series-inter', series_title: 'BJJ Intermediario', order: 2, is_published: true, is_free: false, professor_id: 'prof-andre', professor_name: 'Prof. Andre', views: 87, completions: 40, quiz_count: 3, created_at: '2026-02-16T10:00:00Z', updated_at: '2026-02-16T10:00:00Z' },
  { id: 'v-8', title: 'Controle das costas', description: 'Como chegar, manter e finalizar das costas: seatbelt grip, ganchos e RNC.', source: 'youtube', source_url: 'https://www.youtube.com/watch?v=vwx234', embed_url: 'https://www.youtube.com/embed/vwx234', source_video_id: 'vwx234', thumbnail_url: 'https://img.youtube.com/vi/vwx234/maxresdefault.jpg', duration_seconds: 960, original_title: 'Back Control and Submissions', modality: 'BJJ', min_belt: 'blue', tags: ['intermediario', 'costas', 'controle'], series_id: 'series-inter', series_title: 'BJJ Intermediario', order: 3, is_published: true, is_free: false, professor_id: 'prof-andre', professor_name: 'Prof. Andre', views: 76, completions: 51, quiz_count: 3, created_at: '2026-02-23T10:00:00Z', updated_at: '2026-02-23T10:00:00Z' },
  { id: 'v-9', title: 'Leg lock fundamentals', description: 'Introducao ao jogo de perna: straight ankle lock, regras IBJJF e entradas basicas.', source: 'youtube', source_url: 'https://www.youtube.com/watch?v=yza567', embed_url: 'https://www.youtube.com/embed/yza567', source_video_id: 'yza567', thumbnail_url: 'https://img.youtube.com/vi/yza567/maxresdefault.jpg', duration_seconds: 780, original_title: 'Leg Lock Fundamentals BJJ', modality: 'BJJ', min_belt: 'blue', tags: ['intermediario', 'leglock', 'finalizacao'], series_id: 'series-inter', series_title: 'BJJ Intermediario', order: 4, is_published: true, is_free: false, professor_id: 'prof-andre', professor_name: 'Prof. Andre', views: 56, completions: 38, quiz_count: 3, created_at: '2026-03-02T10:00:00Z', updated_at: '2026-03-02T10:00:00Z' },
  // Series 3: Judo para Jiu-Jiteiro
  { id: 'v-10', title: 'Osoto-gari para BJJ', description: 'A projecao mais eficiente pra quem treina BJJ: osoto-gari com grip fighting adaptado.', source: 'youtube', source_url: 'https://www.youtube.com/watch?v=bcd890', embed_url: 'https://www.youtube.com/embed/bcd890', source_video_id: 'bcd890', thumbnail_url: 'https://img.youtube.com/vi/bcd890/maxresdefault.jpg', duration_seconds: 720, original_title: 'Osoto-gari for BJJ Fighters', modality: 'Judo', min_belt: 'white', tags: ['judo', 'projecao'], series_id: 'series-judo', series_title: 'Judo para Jiu-Jiteiro', order: 1, is_published: true, is_free: false, professor_id: 'prof-fernanda', professor_name: 'Prof. Fernanda', views: 43, completions: 32, quiz_count: 3, created_at: '2026-03-05T10:00:00Z', updated_at: '2026-03-05T10:00:00Z' },
  { id: 'v-11', title: 'Seoi-nage e variantes', description: 'O classico seoi-nage e suas adaptacoes modernas: morote, ippon e drop seoi.', source: 'youtube', source_url: 'https://www.youtube.com/watch?v=efg123', embed_url: 'https://www.youtube.com/embed/efg123', source_video_id: 'efg123', thumbnail_url: 'https://img.youtube.com/vi/efg123/maxresdefault.jpg', duration_seconds: 660, original_title: 'Seoi-nage Variations', modality: 'Judo', min_belt: 'white', tags: ['judo', 'projecao'], series_id: 'series-judo', series_title: 'Judo para Jiu-Jiteiro', order: 2, is_published: true, is_free: false, professor_id: 'prof-fernanda', professor_name: 'Prof. Fernanda', views: 21, completions: 14, quiz_count: 3, created_at: '2026-03-08T10:00:00Z', updated_at: '2026-03-08T10:00:00Z' },
  { id: 'v-12', title: 'Ouchi-gari combinacoes', description: 'O ouchi-gari como tecnica principal e setup pra outras projecoes.', source: 'youtube', source_url: 'https://www.youtube.com/watch?v=hij456', embed_url: 'https://www.youtube.com/embed/hij456', source_video_id: 'hij456', thumbnail_url: 'https://img.youtube.com/vi/hij456/maxresdefault.jpg', duration_seconds: 540, original_title: 'Ouchi-gari Combos', modality: 'Judo', min_belt: 'white', tags: ['judo', 'projecao', 'combinacao'], series_id: 'series-judo', series_title: 'Judo para Jiu-Jiteiro', order: 3, is_published: true, is_free: false, professor_id: 'prof-fernanda', professor_name: 'Prof. Fernanda', views: 10, completions: 7, quiz_count: 3, created_at: '2026-03-10T10:00:00Z', updated_at: '2026-03-10T10:00:00Z' },
  // Standalone (drafts)
  { id: 'v-13', title: 'Preparacao fisica para competicao', description: 'Treino de forca e resistencia especifico pra campeonatos.', source: 'youtube', source_url: 'https://www.youtube.com/watch?v=klm789', embed_url: 'https://www.youtube.com/embed/klm789', source_video_id: 'klm789', thumbnail_url: 'https://img.youtube.com/vi/klm789/maxresdefault.jpg', duration_seconds: 1500, original_title: 'Competition Prep Workout', modality: 'BJJ', min_belt: 'blue', tags: ['preparacao', 'competicao'], series_id: null, series_title: null, order: 0, is_published: false, is_free: false, professor_id: 'prof-andre', professor_name: 'Prof. Andre', views: 0, completions: 0, quiz_count: 0, created_at: '2026-03-12T10:00:00Z', updated_at: '2026-03-12T10:00:00Z' },
  { id: 'v-14', title: 'Aquecimento funcional', description: 'Rotina de aquecimento de 15min antes do treino.', source: 'youtube', source_url: 'https://www.youtube.com/watch?v=nop012', embed_url: 'https://www.youtube.com/embed/nop012', source_video_id: 'nop012', thumbnail_url: 'https://img.youtube.com/vi/nop012/maxresdefault.jpg', duration_seconds: 900, original_title: 'Functional Warmup BJJ', modality: 'BJJ', min_belt: 'white', tags: ['aquecimento', 'funcional'], series_id: null, series_title: null, order: 0, is_published: false, is_free: true, professor_id: 'prof-andre', professor_name: 'Prof. Andre', views: 0, completions: 0, quiz_count: 0, created_at: '2026-03-14T10:00:00Z', updated_at: '2026-03-14T10:00:00Z' },
  { id: 'v-15', title: 'Estrategia de competicao', description: 'Como montar sua estrategia: game plan, pontuacao e gestao de tempo.', source: 'youtube', source_url: 'https://www.youtube.com/watch?v=qrs345', embed_url: 'https://www.youtube.com/embed/qrs345', source_video_id: 'qrs345', thumbnail_url: 'https://img.youtube.com/vi/qrs345/maxresdefault.jpg', duration_seconds: 1200, original_title: 'Competition Strategy BJJ', modality: 'BJJ', min_belt: 'blue', tags: ['competicao', 'estrategia'], series_id: null, series_title: null, order: 0, is_published: false, is_free: false, professor_id: 'prof-andre', professor_name: 'Prof. Andre', views: 0, completions: 0, quiz_count: 0, created_at: '2026-03-15T10:00:00Z', updated_at: '2026-03-15T10:00:00Z' },
];

// ── Mock series ─────────────────────────────────────────────────────

let MOCK_SERIES: StreamingSeries[] = [
  {
    id: 'series-fund', title: 'Fundamentos BJJ', description: 'Os 5 movimentos essenciais que todo faixa branca precisa dominar.',
    thumbnail_url: '', gradient_css: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    professor_id: 'prof-andre', professor_name: 'Prof. Andre', modality: 'BJJ', min_belt: 'white',
    videos: [], total_duration: '53min', category: 'fundamentos', tags: ['fundamentos', 'branca'],
  },
  {
    id: 'series-inter', title: 'BJJ Intermediario', description: 'Tecnicas avancadas para faixas azul e acima.',
    thumbnail_url: '', gradient_css: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
    professor_id: 'prof-andre', professor_name: 'Prof. Andre', modality: 'BJJ', min_belt: 'blue',
    videos: [], total_duration: '61min', category: 'intermediario', tags: ['intermediario', 'azul'],
  },
  {
    id: 'series-judo', title: 'Judo para Jiu-Jiteiro', description: 'Projecoes de Judo adaptadas para praticantes de BJJ.',
    thumbnail_url: '', gradient_css: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #43A047 100%)',
    professor_id: 'prof-fernanda', professor_name: 'Prof. Fernanda', modality: 'Judo', min_belt: 'white',
    videos: [], total_duration: '32min', category: 'fundamentos', tags: ['judo', 'projecao'],
  },
];

// ── Mock trails ─────────────────────────────────────────────────────

let MOCK_TRAILS: StreamingTrail[] = [
  {
    id: 'trail-1', name: 'Fundamentos do BJJ', description: 'Trilha completa de fundamentos para iniciantes.',
    gradient_css: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    series: [MOCK_SERIES[0]], total_videos: 5, total_duration: '53min',
    min_belt: 'white', certificate_available: true,
  },
  {
    id: 'trail-2', name: 'BJJ Completo', description: 'Fundamentos + intermediario em uma trilha so.',
    gradient_css: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
    series: [MOCK_SERIES[0], MOCK_SERIES[1]], total_videos: 9, total_duration: '114min',
    min_belt: 'white', certificate_available: true,
  },
  {
    id: 'trail-3', name: 'Judo + BJJ', description: 'Combinacao de projecoes e jogo de chao.',
    gradient_css: 'linear-gradient(135deg, #1B5E20 0%, #43A047 100%)',
    series: [MOCK_SERIES[2], MOCK_SERIES[0]], total_videos: 8, total_duration: '85min',
    min_belt: 'white', certificate_available: false,
  },
];

// ── Mock quiz questions ─────────────────────────────────────────────

const MOCK_QUIZZES: Record<string, QuizQuestion[]> = {
  'v-1': [
    { id: 'q-1-1', video_id: 'v-1', question: 'Qual a base correta no BJJ?', options: ['Pes juntos', 'Pes na largura dos ombros', 'Um pe na frente'], correct_index: 1, timestamp_hint: 'Reveja 1:20' },
    { id: 'q-1-2', video_id: 'v-1', question: 'O que manter baixo para equilibrio?', options: ['Os bracos', 'O centro de gravidade', 'A cabeca'], correct_index: 1, timestamp_hint: 'Reveja 3:45' },
    { id: 'q-1-3', video_id: 'v-1', question: 'Quando ajustar a base?', options: ['Nunca', 'Sempre que perder equilibrio', 'So em pe'], correct_index: 1, timestamp_hint: 'Reveja 6:10' },
  ],
  'v-2': [
    { id: 'q-2-1', video_id: 'v-2', question: 'Qual o primeiro movimento da fuga upa?', options: ['Empurrar com as maos', 'Pontar com o quadril', 'Virar de lado'], correct_index: 1, timestamp_hint: 'Reveja 2:15' },
    { id: 'q-2-2', video_id: 'v-2', question: 'Quando usar elbow-knee escape?', options: ['Quando montado', 'Na guarda', 'Em pe'], correct_index: 0, timestamp_hint: 'Reveja 5:30' },
    { id: 'q-2-3', video_id: 'v-2', question: 'O que fazer apos a fuga?', options: ['Ficar deitado', 'Recompor a guarda', 'Levantar e correr'], correct_index: 1, timestamp_hint: 'Reveja 9:00' },
  ],
  'v-6': [
    { id: 'q-6-1', video_id: 'v-6', question: 'Onde posicionar o gancho DLR?', options: ['Na coxa interna', 'Atras do joelho', 'No tornozelo'], correct_index: 1, timestamp_hint: 'Reveja 2:00' },
    { id: 'q-6-2', video_id: 'v-6', question: 'Qual grip essencial na DLR?', options: ['Manga e calca', 'So a gola', 'Punho e cotovelo'], correct_index: 0, timestamp_hint: 'Reveja 4:30' },
    { id: 'q-6-3', video_id: 'v-6', question: 'Melhor raspagem da DLR?', options: ['Berimbolo', 'Tomada de costas', 'Ambas sao eficientes'], correct_index: 2, timestamp_hint: 'Reveja 12:00' },
  ],
};

// Fill remaining videos with quiz data
for (let i = 3; i <= 12; i++) {
  const vid = `v-${i}`;
  if (!MOCK_QUIZZES[vid]) {
    MOCK_QUIZZES[vid] = [
      { id: `q-${i}-1`, video_id: vid, question: `Pergunta 1 do video ${i}?`, options: ['Opcao A', 'Opcao B', 'Opcao C'], correct_index: 0, timestamp_hint: 'Reveja 2:00' },
      { id: `q-${i}-2`, video_id: vid, question: `Pergunta 2 do video ${i}?`, options: ['Opcao A', 'Opcao B', 'Opcao C'], correct_index: 1, timestamp_hint: 'Reveja 5:00' },
      { id: `q-${i}-3`, video_id: vid, question: `Pergunta 3 do video ${i}?`, options: ['Opcao A', 'Opcao B', 'Opcao C'], correct_index: 2, timestamp_hint: 'Reveja 8:00' },
    ];
  }
}

// ── Mock materials ──────────────────────────────────────────────────

let MOCK_MATERIALS: AcademicMaterial[] = [
  { id: 'mat-1', title: 'Plano de Aula — Fundamentos Semana 1', description: 'Plano detalhado para a primeira semana de fundamentos com exercicios e progressoes.', type: 'lesson_plan', file_url: '/mock/plano-aula-fund-s1.pdf', file_size_bytes: 2_400_000, modality: 'BJJ', min_belt: 'white', tags: ['plano-aula', 'fundamentos'], series_id: 'series-fund', downloads: 34, is_published: true, created_by: 'prof-andre', created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'mat-2', title: 'Regras IBJJF 2026', description: 'Documento oficial com as regras atualizadas da IBJJF para 2026.', type: 'pdf', file_url: '/mock/regras-ibjjf-2026.pdf', file_size_bytes: 5_100_000, modality: 'BJJ', min_belt: 'white', tags: ['regras', 'ibjjf', 'competicao'], series_id: null, downloads: 67, is_published: true, created_by: 'prof-andre', created_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z' },
  { id: 'mat-3', title: 'Diagrama de Posicoes BJJ', description: 'Mapa visual com todas as posicoes do BJJ e transicoes entre elas.', type: 'image', file_url: '/mock/diagrama-posicoes.png', file_size_bytes: 1_800_000, modality: 'BJJ', min_belt: 'white', tags: ['diagrama', 'posicoes', 'visual'], series_id: null, downloads: 45, is_published: true, created_by: 'prof-andre', created_at: '2026-02-01T10:00:00Z', updated_at: '2026-02-01T10:00:00Z' },
  { id: 'mat-4', title: 'Guia de Graduacao de Faixas', description: 'Criterios e requisitos para progressao de faixa na academia.', type: 'document', file_url: '/mock/guia-graduacao.docx', file_size_bytes: 980_000, modality: 'BJJ', min_belt: 'white', tags: ['graduacao', 'faixas'], series_id: null, downloads: 23, is_published: true, created_by: 'prof-andre', created_at: '2026-02-10T10:00:00Z', updated_at: '2026-02-10T10:00:00Z' },
  { id: 'mat-5', title: 'Canal do Prof. Andre no YouTube', description: 'Link para o canal oficial com conteudo extra e demonstracoes ao vivo.', type: 'link', file_url: 'https://youtube.com/@profandrebjj', file_size_bytes: 0, modality: 'BJJ', min_belt: 'white', tags: ['youtube', 'canal', 'extra'], series_id: null, downloads: 89, is_published: true, created_by: 'prof-andre', created_at: '2026-02-20T10:00:00Z', updated_at: '2026-02-20T10:00:00Z' },
];

// ── Mock implementations ────────────────────────────────────────────

export async function mockExtractVideoInfo(url: string): Promise<ExtractedVideoInfo> {
  await delay(600);

  let source: VideoSource = 'youtube';
  let videoId = 'dQw4w9WgXcQ';

  if (url.includes('vimeo.com')) {
    source = 'vimeo';
    const match = url.match(/vimeo\.com\/(\d+)/);
    videoId = match?.[1] ?? '123456789';
    return {
      source, source_url: url, embed_url: `https://player.vimeo.com/video/${videoId}`,
      source_video_id: videoId, thumbnail_url: 'https://via.placeholder.com/640x360?text=Vimeo+Video',
      duration_seconds: 480, original_title: 'Tecnica de BJJ — Video Vimeo',
    };
  }

  if (url.includes('drive.google.com')) {
    source = 'gdrive';
    const match = url.match(/\/d\/([^/]+)/);
    videoId = match?.[1] ?? 'file-id-123';
    return {
      source, source_url: url, embed_url: `https://drive.google.com/file/d/${videoId}/preview`,
      source_video_id: videoId, thumbnail_url: 'https://via.placeholder.com/640x360?text=Google+Drive',
      duration_seconds: 600, original_title: 'Tecnica de BJJ — Google Drive',
    };
  }

  // YouTube
  const ytMatch = url.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) videoId = ytMatch[1];

  return {
    source, source_url: url, embed_url: `https://www.youtube.com/embed/${videoId}`,
    source_video_id: videoId, thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    duration_seconds: 480, original_title: 'Tecnica de BJJ — Fuga de Montada Completa',
  };
}

export async function mockCreateVideo(
  _academyId: string, professorId: string, data: VideoFormData,
): Promise<ContentVideo> {
  await delay();
  const newId = `v-${Date.now()}`;
  const video: ContentVideo = {
    id: newId, title: data.title, description: data.description,
    source: data.source, source_url: data.source_url, embed_url: data.embed_url,
    source_video_id: data.source_video_id, thumbnail_url: data.thumbnail_url,
    duration_seconds: data.duration_seconds, original_title: data.original_title,
    modality: data.modality, min_belt: data.min_belt, tags: data.tags,
    series_id: data.series_id, series_title: data.series_id ? MOCK_SERIES.find(s => s.id === data.series_id)?.title ?? null : null,
    order: data.order, is_published: data.is_published, is_free: data.is_free,
    professor_id: professorId, professor_name: 'Prof. Andre',
    views: 0, completions: 0, quiz_count: data.quiz_questions.length,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  MOCK_VIDEOS = [video, ...MOCK_VIDEOS];
  if (data.quiz_questions.length > 0) {
    MOCK_QUIZZES[newId] = data.quiz_questions.map((q, i) => ({
      id: `q-${newId}-${i}`, video_id: newId, question: q.question,
      options: q.options, correct_index: q.correct_index, timestamp_hint: q.timestamp_hint,
    }));
  }
  return video;
}

export async function mockUpdateVideo(
  videoId: string, updates: Partial<VideoFormData>,
): Promise<ContentVideo> {
  await delay();
  MOCK_VIDEOS = MOCK_VIDEOS.map(v => v.id === videoId ? { ...v, ...updates, updated_at: new Date().toISOString() } as ContentVideo : v);
  return MOCK_VIDEOS.find(v => v.id === videoId)!;
}

export async function mockDeleteVideo(videoId: string): Promise<void> {
  await delay();
  MOCK_VIDEOS = MOCK_VIDEOS.filter(v => v.id !== videoId);
  delete MOCK_QUIZZES[videoId];
}

export async function mockListVideos(
  _academyId: string,
  filters?: {
    modality?: string; min_belt?: string; series_id?: string;
    is_published?: boolean; search?: string; page?: number; limit?: number;
  },
): Promise<{ videos: ContentVideo[]; total: number }> {
  await delay();
  let result = [...MOCK_VIDEOS];
  if (filters?.modality) result = result.filter(v => v.modality === filters.modality);
  if (filters?.min_belt) result = result.filter(v => v.min_belt === filters.min_belt);
  if (filters?.series_id) result = result.filter(v => v.series_id === filters.series_id);
  if (filters?.is_published !== undefined) result = result.filter(v => v.is_published === filters.is_published);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(v => v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q));
  }
  const total = result.length;
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 50;
  return { videos: result.slice((page - 1) * limit, page * limit), total };
}

export async function mockPublishVideo(videoId: string): Promise<void> {
  await delay(150);
  MOCK_VIDEOS = MOCK_VIDEOS.map(v => v.id === videoId ? { ...v, is_published: true } : v);
}

export async function mockUnpublishVideo(videoId: string): Promise<void> {
  await delay(150);
  MOCK_VIDEOS = MOCK_VIDEOS.map(v => v.id === videoId ? { ...v, is_published: false } : v);
}

export async function mockDuplicateVideo(videoId: string): Promise<ContentVideo> {
  await delay();
  const original = MOCK_VIDEOS.find(v => v.id === videoId)!;
  const dup: ContentVideo = {
    ...original, id: `v-dup-${Date.now()}`, title: `${original.title} (copia)`,
    is_published: false, views: 0, completions: 0,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  MOCK_VIDEOS = [dup, ...MOCK_VIDEOS];
  return dup;
}

// ── Series ──────────────────────────────────────────────────────────

export async function mockCreateSeries(
  _academyId: string, professorId: string, data: SeriesFormData,
): Promise<StreamingSeries> {
  await delay();
  const s: StreamingSeries = {
    id: `series-${Date.now()}`, title: data.title, description: data.description,
    thumbnail_url: '', gradient_css: data.gradient_css,
    professor_id: professorId, professor_name: 'Prof. Andre',
    modality: data.modality, min_belt: data.min_belt,
    videos: [], total_duration: '0min', category: data.category, tags: data.tags,
  };
  MOCK_SERIES = [s, ...MOCK_SERIES];
  return s;
}

export async function mockUpdateSeries(
  seriesId: string, updates: Partial<SeriesFormData>,
): Promise<StreamingSeries> {
  await delay();
  MOCK_SERIES = MOCK_SERIES.map(s => s.id === seriesId ? { ...s, ...updates } as StreamingSeries : s);
  return MOCK_SERIES.find(s => s.id === seriesId)!;
}

export async function mockDeleteSeries(seriesId: string): Promise<void> {
  await delay();
  MOCK_VIDEOS = MOCK_VIDEOS.map(v => v.series_id === seriesId ? { ...v, series_id: null, series_title: null } : v);
  MOCK_SERIES = MOCK_SERIES.filter(s => s.id !== seriesId);
}

export async function mockListSeries(_academyId: string): Promise<StreamingSeries[]> {
  await delay();
  return MOCK_SERIES.map(s => ({
    ...s,
    videos: MOCK_VIDEOS.filter(v => v.series_id === s.id).map(v => ({
      id: v.id, title: v.title, description: v.description, duration_seconds: v.duration_seconds,
      thumbnail_url: v.thumbnail_url, video_url: v.embed_url, gradient_css: '',
      professor_id: v.professor_id, professor_name: v.professor_name,
      modality: v.modality, min_belt: v.min_belt, order: v.order,
      series_id: v.series_id ?? '', tags: v.tags, created_at: v.created_at,
    })),
  }));
}

// ── Trails ──────────────────────────────────────────────────────────

export async function mockCreateTrail(
  _academyId: string, data: TrailFormData,
): Promise<StreamingTrail> {
  await delay();
  const seriesList = MOCK_SERIES.filter(s => data.series_ids.includes(s.id));
  const t: StreamingTrail = {
    id: `trail-${Date.now()}`, name: data.name, description: data.description,
    gradient_css: 'linear-gradient(135deg, #0f0c29 0%, #302b63 100%)',
    series: seriesList, total_videos: seriesList.reduce((s, sr) => s + sr.videos.length, 0),
    total_duration: '0min', min_belt: data.min_belt, certificate_available: data.certificate_available,
  };
  MOCK_TRAILS = [t, ...MOCK_TRAILS];
  return t;
}

export async function mockUpdateTrail(
  trailId: string, updates: Partial<TrailFormData>,
): Promise<StreamingTrail> {
  await delay();
  MOCK_TRAILS = MOCK_TRAILS.map(t => {
    if (t.id !== trailId) return t;
    const updated = { ...t };
    if (updates.name) updated.name = updates.name;
    if (updates.description) updated.description = updates.description;
    if (updates.min_belt) updated.min_belt = updates.min_belt;
    if (updates.certificate_available !== undefined) updated.certificate_available = updates.certificate_available;
    if (updates.series_ids) {
      updated.series = MOCK_SERIES.filter(s => updates.series_ids!.includes(s.id));
    }
    return updated;
  });
  return MOCK_TRAILS.find(t => t.id === trailId)!;
}

export async function mockDeleteTrail(trailId: string): Promise<void> {
  await delay();
  MOCK_TRAILS = MOCK_TRAILS.filter(t => t.id !== trailId);
}

export async function mockListTrails(_academyId: string): Promise<StreamingTrail[]> {
  await delay();
  return MOCK_TRAILS;
}

// ── Quiz ────────────────────────────────────────────────────────────

export async function mockSetQuizForVideo(
  videoId: string, questions: QuizQuestionInput[],
): Promise<QuizQuestion[]> {
  await delay();
  const quizzes = questions.map((q, i) => ({
    id: `q-${videoId}-${i}`, video_id: videoId,
    question: q.question, options: q.options, correct_index: q.correct_index,
    timestamp_hint: q.timestamp_hint,
  }));
  MOCK_QUIZZES[videoId] = quizzes;
  MOCK_VIDEOS = MOCK_VIDEOS.map(v => v.id === videoId ? { ...v, quiz_count: quizzes.length } : v);
  return quizzes;
}

export async function mockGetQuizForVideo(videoId: string): Promise<QuizQuestion[]> {
  await delay();
  return MOCK_QUIZZES[videoId] ?? [];
}

export async function mockDeleteQuizForVideo(videoId: string): Promise<void> {
  await delay();
  delete MOCK_QUIZZES[videoId];
  MOCK_VIDEOS = MOCK_VIDEOS.map(v => v.id === videoId ? { ...v, quiz_count: 0 } : v);
}

// ── Materials ───────────────────────────────────────────────────────

export async function mockCreateMaterial(
  _academyId: string, professorId: string, data: AcademicMaterialInput,
): Promise<AcademicMaterial> {
  await delay();
  const m: AcademicMaterial = {
    id: `mat-${Date.now()}`, title: data.title, description: data.description,
    type: data.type, file_url: data.file_url, file_size_bytes: 1_000_000,
    modality: data.modality, min_belt: data.min_belt, tags: data.tags,
    series_id: data.series_id, downloads: 0, is_published: data.is_published,
    created_by: professorId, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  MOCK_MATERIALS = [m, ...MOCK_MATERIALS];
  return m;
}

export async function mockUpdateMaterial(
  materialId: string, updates: Partial<AcademicMaterialInput>,
): Promise<AcademicMaterial> {
  await delay();
  MOCK_MATERIALS = MOCK_MATERIALS.map(m => m.id === materialId ? { ...m, ...updates, updated_at: new Date().toISOString() } as AcademicMaterial : m);
  return MOCK_MATERIALS.find(m => m.id === materialId)!;
}

export async function mockDeleteMaterial(materialId: string): Promise<void> {
  await delay();
  MOCK_MATERIALS = MOCK_MATERIALS.filter(m => m.id !== materialId);
}

export async function mockListMaterials(
  _academyId: string,
): Promise<{ materials: AcademicMaterial[]; total: number }> {
  await delay();
  return { materials: MOCK_MATERIALS, total: MOCK_MATERIALS.length };
}

// ── Stats ───────────────────────────────────────────────────────────

export async function mockGetContentStats(_academyId: string): Promise<ContentStats> {
  await delay();
  const published = MOCK_VIDEOS.filter(v => v.is_published).length;
  const drafts = MOCK_VIDEOS.filter(v => !v.is_published).length;
  const totalViews = Object.values(VIDEO_VIEWS).reduce((s, v) => s + v.views, 0);
  const totalCompletions = Object.values(VIDEO_VIEWS).reduce((s, v) => s + v.completions, 0);
  const totalQuiz = Object.values(MOCK_QUIZZES).reduce((s, q) => s + q.length, 0);
  return {
    total_videos: MOCK_VIDEOS.length,
    published_videos: published,
    draft_videos: drafts,
    total_series: MOCK_SERIES.length,
    total_trails: MOCK_TRAILS.length,
    total_materials: MOCK_MATERIALS.length,
    total_quiz_questions: totalQuiz,
    total_views: totalViews,
    total_completions: totalCompletions,
    avg_quiz_score: 78,
  };
}

export async function mockGetVideoAnalytics(videoId: string): Promise<VideoAnalytics> {
  await delay();
  const data = VIDEO_VIEWS[videoId] ?? { views: 0, completions: 0 };
  return {
    views: data.views,
    completions: data.completions,
    avg_watch_time: 512,
    quiz_avg_score: videoId === 'v-7' ? 45 : videoId === 'v-8' ? 52 : 78,
  };
}
