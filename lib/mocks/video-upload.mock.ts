import type {
  UploadedVideo,
  VideoUploadResult,
  StorageStats,
  VideoSeriesData,
  UploadProgress,
  VideoUploadData,
} from '@/lib/api/video-upload.service';

const delay = (ms = 300) => new Promise<void>((r) => setTimeout(r, ms));

// ── Mock data ───────────────────────────────────────────────────────

const MOCK_VIDEOS: UploadedVideo[] = [
  {
    id: 'vupl-1',
    titulo: 'Armlock da Guarda Fechada — Detalhes Essenciais',
    descricao: 'Técnica completa de armlock partindo da guarda fechada com controle de postura.',
    thumbnailUrl: '/mock/thumbs/armlock-guarda.jpg',
    storagePath: 'academies/acad-1/videos/armlock-guarda-fechada.mp4',
    duracao: 487,
    duracaoFormatada: '8:07',
    fileSizeBytes: 156_000_000,
    fileSizeFormatted: '156 MB',
    mimeType: 'video/mp4',
    modalidade: 'BJJ',
    faixaMinima: 'Branca',
    dificuldade: 'iniciante',
    categoria: 'Finalização',
    tags: ['armlock', 'guarda fechada', 'fundamentos', 'finalização'],
    turmas: [
      { id: 'turma-1', nome: 'BJJ Fundamental Manhã' },
      { id: 'turma-2', nome: 'BJJ Fundamental Noite' },
    ],
    publicos: ['adulto', 'teen'],
    isPublished: true,
    publishedAt: '2026-02-15T10:00:00Z',
    uploadedBy: 'prof-1',
    uploadedByName: 'André Nakamura',
    viewsCount: 234,
    likesCount: 47,
    createdAt: '2026-02-14T18:30:00Z',
  },
  {
    id: 'vupl-2',
    titulo: 'Passagem de Guarda Toreando — Variações Modernas',
    descricao: 'Três variações de toreando para gi e no-gi com detalhes de grip e pressão.',
    thumbnailUrl: '/mock/thumbs/toreando-pass.jpg',
    storagePath: 'academies/acad-1/videos/toreando-variacoes.mp4',
    duracao: 723,
    duracaoFormatada: '12:03',
    fileSizeBytes: 245_000_000,
    fileSizeFormatted: '245 MB',
    mimeType: 'video/mp4',
    modalidade: 'BJJ',
    faixaMinima: 'Azul',
    dificuldade: 'intermediario',
    categoria: 'Passagem',
    tags: ['toreando', 'passagem de guarda', 'pressão', 'no-gi'],
    turmas: [
      { id: 'turma-3', nome: 'BJJ Avançado' },
    ],
    publicos: ['adulto'],
    isPublished: true,
    publishedAt: '2026-02-20T14:00:00Z',
    uploadedBy: 'prof-1',
    uploadedByName: 'André Nakamura',
    viewsCount: 189,
    likesCount: 38,
    createdAt: '2026-02-19T22:15:00Z',
  },
  {
    id: 'vupl-3',
    titulo: 'Raspagem de Gancho — Técnica e Timing',
    descricao: 'Como executar a raspagem de gancho com timing correto e controle do oponente.',
    thumbnailUrl: '/mock/thumbs/raspagem-gancho.jpg',
    storagePath: 'academies/acad-1/videos/raspagem-gancho.mp4',
    duracao: 560,
    duracaoFormatada: '9:20',
    fileSizeBytes: 198_000_000,
    fileSizeFormatted: '198 MB',
    mimeType: 'video/mp4',
    modalidade: 'BJJ',
    faixaMinima: 'Branca',
    dificuldade: 'iniciante',
    categoria: 'Raspagem',
    tags: ['raspagem', 'gancho', 'guarda aberta', 'sweep'],
    turmas: [
      { id: 'turma-1', nome: 'BJJ Fundamental Manhã' },
      { id: 'turma-2', nome: 'BJJ Fundamental Noite' },
    ],
    publicos: ['adulto', 'teen'],
    isPublished: true,
    publishedAt: '2026-03-01T09:00:00Z',
    uploadedBy: 'prof-2',
    uploadedByName: 'Fernanda Costa',
    viewsCount: 312,
    likesCount: 64,
    createdAt: '2026-02-28T20:45:00Z',
  },
  {
    id: 'vupl-4',
    titulo: 'Defesa de Queda para Muay Thai — Clinch e Projeção',
    descricao: 'Técnicas de defesa de queda a partir do clinch no Muay Thai.',
    thumbnailUrl: '/mock/thumbs/defesa-queda-mt.jpg',
    storagePath: 'academies/acad-1/videos/defesa-queda-muaythai.mp4',
    duracao: 415,
    duracaoFormatada: '6:55',
    fileSizeBytes: 134_000_000,
    fileSizeFormatted: '134 MB',
    mimeType: 'video/mp4',
    modalidade: 'Muay Thai',
    faixaMinima: 'Branca',
    dificuldade: 'intermediario',
    categoria: 'Defesa',
    tags: ['muay thai', 'clinch', 'defesa de queda', 'projeção'],
    turmas: [
      { id: 'turma-4', nome: 'Muay Thai Intermediário' },
    ],
    publicos: ['adulto'],
    isPublished: true,
    publishedAt: '2026-03-05T16:00:00Z',
    uploadedBy: 'prof-2',
    uploadedByName: 'Fernanda Costa',
    viewsCount: 98,
    likesCount: 21,
    createdAt: '2026-03-04T21:30:00Z',
  },
  {
    id: 'vupl-5',
    titulo: 'O Soto Gari — Projeção Fundamental do Judô',
    descricao: 'Execução passo a passo do O Soto Gari com entrada e kuzushi.',
    thumbnailUrl: '/mock/thumbs/osoto-gari.jpg',
    storagePath: 'academies/acad-1/videos/osoto-gari-judo.mp4',
    duracao: 340,
    duracaoFormatada: '5:40',
    fileSizeBytes: 112_000_000,
    fileSizeFormatted: '112 MB',
    mimeType: 'video/mp4',
    modalidade: 'Judô',
    faixaMinima: 'Branca',
    dificuldade: 'iniciante',
    categoria: 'Fundamentos',
    tags: ['judô', 'o soto gari', 'projeção', 'kuzushi'],
    turmas: [
      { id: 'turma-5', nome: 'Judô Kids' },
      { id: 'turma-6', nome: 'Judô Adulto' },
    ],
    publicos: ['kids', 'adulto'],
    isPublished: false,
    uploadedBy: 'prof-1',
    uploadedByName: 'André Nakamura',
    viewsCount: 0,
    likesCount: 0,
    createdAt: '2026-03-10T11:00:00Z',
  },
  {
    id: 'vupl-6',
    titulo: 'Berimbolo — Entrada e Controle das Costas',
    descricao: 'Setup de berimbolo com transição para controle das costas e finalização.',
    thumbnailUrl: '/mock/thumbs/berimbolo-costas.jpg',
    storagePath: 'academies/acad-1/videos/berimbolo-costas.mp4',
    duracao: 890,
    duracaoFormatada: '14:50',
    fileSizeBytes: 310_000_000,
    fileSizeFormatted: '310 MB',
    mimeType: 'video/mp4',
    modalidade: 'BJJ',
    faixaMinima: 'Roxa',
    dificuldade: 'avancado',
    categoria: 'Ataque',
    tags: ['berimbolo', 'costas', 'inversão', 'competição'],
    turmas: [
      { id: 'turma-3', nome: 'BJJ Avançado' },
    ],
    publicos: ['adulto'],
    isPublished: false,
    uploadedBy: 'prof-2',
    uploadedByName: 'Fernanda Costa',
    viewsCount: 0,
    likesCount: 0,
    createdAt: '2026-03-12T17:20:00Z',
  },
];

const MOCK_SERIES: VideoSeriesData[] = [
  {
    id: 'series-1',
    titulo: 'Fundamentos de Ataque',
    descricao: 'Série completa de técnicas ofensivas para iniciantes e intermediários.',
    thumbnailUrl: '/mock/thumbs/series-ataque.jpg',
    modalidade: 'BJJ',
    faixaMinima: 'Branca',
    publico: 'adulto',
    isPublished: true,
    videos: [
      { id: 'vupl-1', titulo: 'Armlock da Guarda Fechada — Detalhes Essenciais', thumbnail: '/mock/thumbs/armlock-guarda.jpg', duracao: '8:07', sortOrder: 1 },
      { id: 'vupl-2', titulo: 'Passagem de Guarda Toreando — Variações Modernas', thumbnail: '/mock/thumbs/toreando-pass.jpg', duracao: '12:03', sortOrder: 2 },
      { id: 'vupl-3', titulo: 'Raspagem de Gancho — Técnica e Timing', thumbnail: '/mock/thumbs/raspagem-gancho.jpg', duracao: '9:20', sortOrder: 3 },
      { id: 'vupl-6', titulo: 'Berimbolo — Entrada e Controle das Costas', thumbnail: '/mock/thumbs/berimbolo-costas.jpg', duracao: '14:50', sortOrder: 4 },
      { id: 'vupl-extra-1', titulo: 'Triângulo da Guarda — Ajustes Finos', thumbnail: '/mock/thumbs/triangulo-guarda.jpg', duracao: '7:30', sortOrder: 5 },
    ],
  },
  {
    id: 'series-2',
    titulo: 'Defesas Essenciais',
    descricao: 'Aprenda a defender as posições e finalizações mais comuns.',
    thumbnailUrl: '/mock/thumbs/series-defesas.jpg',
    modalidade: 'BJJ',
    faixaMinima: 'Branca',
    publico: 'todos',
    isPublished: true,
    videos: [
      { id: 'vupl-4', titulo: 'Defesa de Queda para Muay Thai — Clinch e Projeção', thumbnail: '/mock/thumbs/defesa-queda-mt.jpg', duracao: '6:55', sortOrder: 1 },
      { id: 'vupl-5', titulo: 'O Soto Gari — Projeção Fundamental do Judô', thumbnail: '/mock/thumbs/osoto-gari.jpg', duracao: '5:40', sortOrder: 2 },
      { id: 'vupl-extra-2', titulo: 'Escape do Mount — Upa e Elbow Escape', thumbnail: '/mock/thumbs/escape-mount.jpg', duracao: '10:15', sortOrder: 3 },
    ],
  },
];

// ── Upload ──────────────────────────────────────────────────────────

export async function mockUploadVideo(
  _academyId: string,
  data: VideoUploadData,
  onProgress?: (p: UploadProgress) => void,
): Promise<VideoUploadResult> {
  const totalBytes = data.file.size || 50_000_000;
  const steps = 5;

  for (let i = 1; i <= steps; i++) {
    await delay(400);
    const bytesUploaded = Math.round((totalBytes * i) / steps);

    let status: UploadProgress['status'] = 'uploading';
    let message = `Enviando... ${Math.round((i / steps) * 100)}%`;

    if (i === steps - 1) {
      status = 'processing_thumbnail';
      message = 'Processando thumbnail...';
    }
    if (i === steps) {
      status = 'saving_metadata';
      message = 'Salvando metadados...';
    }

    onProgress?.({
      percent: Math.round((i / steps) * 100),
      bytesUploaded,
      bytesTotal: totalBytes,
      status,
      message,
    });
  }

  await delay(200);

  const videoId = `vupl-${Date.now()}`;
  const result: VideoUploadResult = {
    videoId,
    storageUrl: `https://mock-storage.supabase.co/academies/acad-1/videos/${videoId}.mp4`,
    thumbnailUrl: `https://mock-storage.supabase.co/academies/acad-1/thumbs/${videoId}.jpg`,
    status: 'processing',
  };

  onProgress?.({
    percent: 100,
    bytesUploaded: totalBytes,
    bytesTotal: totalBytes,
    status: 'ready',
    message: 'Upload concluído!',
  });

  const newVideo: UploadedVideo = {
    id: videoId,
    titulo: data.titulo,
    descricao: data.descricao,
    thumbnailUrl: result.thumbnailUrl,
    storagePath: `academies/acad-1/videos/${videoId}.mp4`,
    duracao: 0,
    duracaoFormatada: '0:00',
    fileSizeBytes: totalBytes,
    fileSizeFormatted: `${Math.round(totalBytes / 1_000_000)} MB`,
    mimeType: data.file.type || 'video/mp4',
    modalidade: data.modalidade,
    faixaMinima: data.faixaMinima,
    dificuldade: data.dificuldade,
    categoria: data.categoria,
    tags: data.tags,
    turmas: data.turmaIds.map((id) => ({ id, nome: `Turma ${id}` })),
    publicos: data.publicos,
    isPublished: false,
    uploadedBy: 'prof-1',
    uploadedByName: 'André Nakamura',
    viewsCount: 0,
    likesCount: 0,
    createdAt: new Date().toISOString(),
  };
  MOCK_VIDEOS.push(newVideo);

  return result;
}

// ── Delete ──────────────────────────────────────────────────────────

export async function mockDeleteUploadedVideo(videoId: string): Promise<void> {
  await delay();
  const idx = MOCK_VIDEOS.findIndex((v) => v.id === videoId);
  if (idx >= 0) MOCK_VIDEOS.splice(idx, 1);

  for (const series of MOCK_SERIES) {
    series.videos = series.videos.filter((v) => v.id !== videoId);
  }
}

// ── Update ──────────────────────────────────────────────────────────

export async function mockUpdateUploadedVideo(
  videoId: string,
  data: Partial<VideoUploadData>,
): Promise<UploadedVideo> {
  await delay();
  const video = MOCK_VIDEOS.find((v) => v.id === videoId);
  if (!video) throw new Error(`Vídeo ${videoId} não encontrado`);

  if (data.titulo !== undefined) video.titulo = data.titulo;
  if (data.descricao !== undefined) video.descricao = data.descricao;
  if (data.modalidade !== undefined) video.modalidade = data.modalidade;
  if (data.faixaMinima !== undefined) video.faixaMinima = data.faixaMinima;
  if (data.dificuldade !== undefined) video.dificuldade = data.dificuldade;
  if (data.categoria !== undefined) video.categoria = data.categoria;
  if (data.tags !== undefined) video.tags = data.tags;
  if (data.turmaIds !== undefined) video.turmas = data.turmaIds.map((id) => ({ id, nome: `Turma ${id}` }));
  if (data.publicos !== undefined) video.publicos = data.publicos;

  return { ...video };
}

// ── Publish / Unpublish ─────────────────────────────────────────────

export async function mockPublishUploadedVideo(videoId: string): Promise<void> {
  await delay();
  const video = MOCK_VIDEOS.find((v) => v.id === videoId);
  if (!video) throw new Error(`Vídeo ${videoId} não encontrado`);
  video.isPublished = true;
  video.publishedAt = new Date().toISOString();
}

export async function mockUnpublishUploadedVideo(videoId: string): Promise<void> {
  await delay();
  const video = MOCK_VIDEOS.find((v) => v.id === videoId);
  if (!video) throw new Error(`Vídeo ${videoId} não encontrado`);
  video.isPublished = false;
  video.publishedAt = undefined;
}

// ── Query: by academy ───────────────────────────────────────────────

export async function mockGetVideosByAcademy(_academyId: string): Promise<UploadedVideo[]> {
  await delay();
  return MOCK_VIDEOS.map((v) => ({ ...v }));
}

// ── Query: by class ─────────────────────────────────────────────────

export async function mockGetVideosByClass(classId: string): Promise<UploadedVideo[]> {
  await delay();
  return MOCK_VIDEOS
    .filter((v) => v.turmas.some((t) => t.id === classId))
    .map((v) => ({ ...v }));
}

// ── Query: by audience ──────────────────────────────────────────────

export async function mockGetVideosByAudience(
  _academyId: string,
  audience: string,
): Promise<UploadedVideo[]> {
  await delay();
  return MOCK_VIDEOS
    .filter((v) => v.publicos.includes(audience) || v.publicos.includes('todos'))
    .map((v) => ({ ...v }));
}

// ── Query: by professor ─────────────────────────────────────────────

export async function mockGetVideosByProfessor(professorId: string): Promise<UploadedVideo[]> {
  await delay();
  return MOCK_VIDEOS
    .filter((v) => v.uploadedBy === professorId)
    .map((v) => ({ ...v }));
}

// ── Series CRUD ─────────────────────────────────────────────────────

export async function mockCreateVideoSeries(
  _academyId: string,
  data: Omit<VideoSeriesData, 'id' | 'videos'>,
): Promise<VideoSeriesData> {
  await delay();
  const newSeries: VideoSeriesData = {
    ...data,
    id: `series-${Date.now()}`,
    videos: [],
  };
  MOCK_SERIES.push(newSeries);
  return { ...newSeries };
}

export async function mockUpdateVideoSeries(
  seriesId: string,
  data: Partial<VideoSeriesData>,
): Promise<VideoSeriesData> {
  await delay();
  const series = MOCK_SERIES.find((s) => s.id === seriesId);
  if (!series) throw new Error(`Série ${seriesId} não encontrada`);

  if (data.titulo !== undefined) series.titulo = data.titulo;
  if (data.descricao !== undefined) series.descricao = data.descricao;
  if (data.thumbnailUrl !== undefined) series.thumbnailUrl = data.thumbnailUrl;
  if (data.modalidade !== undefined) series.modalidade = data.modalidade;
  if (data.faixaMinima !== undefined) series.faixaMinima = data.faixaMinima;
  if (data.publico !== undefined) series.publico = data.publico;
  if (data.isPublished !== undefined) series.isPublished = data.isPublished;
  if (data.videos !== undefined) series.videos = data.videos;

  return { ...series };
}

export async function mockDeleteVideoSeries(seriesId: string): Promise<void> {
  await delay();
  const idx = MOCK_SERIES.findIndex((s) => s.id === seriesId);
  if (idx >= 0) MOCK_SERIES.splice(idx, 1);
}

// ── Series video management ─────────────────────────────────────────

export async function mockAddVideoToSeries(
  seriesId: string,
  videoId: string,
  order: number,
): Promise<void> {
  await delay();
  const series = MOCK_SERIES.find((s) => s.id === seriesId);
  if (!series) throw new Error(`Série ${seriesId} não encontrada`);

  const video = MOCK_VIDEOS.find((v) => v.id === videoId);
  const titulo = video?.titulo ?? 'Vídeo sem título';
  const thumbnail = video?.thumbnailUrl ?? '';
  const duracao = video?.duracaoFormatada ?? '0:00';

  series.videos.push({ id: videoId, titulo, thumbnail, duracao, sortOrder: order });
  series.videos.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function mockRemoveVideoFromSeries(
  seriesId: string,
  videoId: string,
): Promise<void> {
  await delay();
  const series = MOCK_SERIES.find((s) => s.id === seriesId);
  if (!series) throw new Error(`Série ${seriesId} não encontrada`);
  series.videos = series.videos.filter((v) => v.id !== videoId);
}

// ── Query: series by academy ────────────────────────────────────────

export async function mockGetSeriesByAcademy(_academyId: string): Promise<VideoSeriesData[]> {
  await delay();
  return MOCK_SERIES.map((s) => ({ ...s, videos: s.videos.map((v) => ({ ...v })) }));
}

// ── Storage stats ───────────────────────────────────────────────────

export async function mockGetStorageStats(_academyId: string): Promise<StorageStats> {
  await delay();
  return {
    totalVideos: 15,
    totalSizeBytes: 2_254_857_830,
    totalSizeFormatted: '2.1 GB',
    limitBytes: 5_368_709_120,
    limitFormatted: '5 GB',
    usagePercent: 42,
    videosThisMonth: 3,
  };
}

// ── Signed URL ──────────────────────────────────────────────────────

export async function mockGetSignedUrl(storagePath: string): Promise<string> {
  await delay(150);
  return `https://mock-storage.supabase.co/signed/${storagePath}?token=mock-token-${Date.now()}&expires=3600`;
}

// ── Thumbnail generation ────────────────────────────────────────────

export async function mockGenerateThumbnailFromVideo(_videoFile: File): Promise<Blob> {
  await delay(500);
  // Return a minimal 1x1 JPEG blob as mock thumbnail
  const binaryData = new Uint8Array([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0A, 0x0B, 0xFF, 0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03,
    0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7D,
    0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
    0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08,
    0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0, 0x24, 0x33, 0x62, 0x72,
    0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28,
    0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45,
    0x46, 0x47, 0x48, 0x49, 0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
    0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x73, 0x74, 0x75,
    0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
    0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0x7B, 0x94,
    0x11, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xD9,
  ]);
  return new Blob([binaryData], { type: 'image/jpeg' });
}
