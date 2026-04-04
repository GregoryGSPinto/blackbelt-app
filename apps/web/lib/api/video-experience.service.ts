import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// ── Types ──────────────────────────────────────────────────────────────

export interface VideoExperience {
  video: {
    id: string;
    titulo: string;
    descricao: string;
    descricaoCompleta: string;
    videoUrl: string;
    thumbnailUrl: string;
    duracaoSegundos: number;
    duracaoFormatada: string;
    qualidade: string;
    modalidade: string;
    faixa: string;
    categoria: string;
    dificuldade: string;
    tags: string[];
    publicadoEm: string;
    atualizadoEm: string;
  };
  professor: {
    id: string;
    nome: string;
    avatar?: string;
    faixa: string;
    graus: number;
    bio: string;
    totalVideos: number;
    totalAlunos: number;
  };
  serie?: {
    id: string;
    nome: string;
    totalEpisodios: number;
    episodioAtual: number;
    proximoEpisodio?: string;
    episodioAnterior?: string;
  };
  progresso: {
    assistido: boolean;
    progressoSegundos: number;
    progressoPercentual: number;
    ultimoAcessoEm?: string;
    completadoEm?: string;
    tempoTotalAssistido: number;
    vezesAssistido: number;
  };
  social: {
    curtidas: number;
    curtidoPorMim: boolean;
    comentarios: number;
    duvidas: number;
    compartilhamentos: number;
    salvos: number;
    salvoPorMim: boolean;
    mediaAvaliacao: number;
    totalAvaliacoes: number;
    minhaAvaliacao?: number;
  };
  comentarios: Comentario[];
  duvidas: Duvida[];
  tecnicasRelacionadas: {
    id: string;
    nome: string;
    posicao: string;
    categoria: string;
    faixa: string;
    temVideo: boolean;
    videoId?: string;
  }[];
  capitulos: {
    tempo: number;
    tempoFormatado: string;
    titulo: string;
    descricao?: string;
  }[];
  videosRelacionados: {
    id: string;
    titulo: string;
    thumbnail: string;
    duracao: string;
    professor: string;
    categoria: string;
    assistido: boolean;
  }[];
  notasPessoais: NotaPessoal[];
  temQuiz: boolean;
  quizCompletado: boolean;
  quizNota?: number;
  downloadPermitido: boolean;
  downloadUrl?: string;
  tamanhoMB?: number;
  analytics?: {
    visualizacoesTotal: number;
    visualizacoesUnicas: number;
    tempoMedioAssistido: number;
    taxaConclusao: number;
    pontoAbandono: number;
    avaliacaoMedia: number;
    retencaoPorSegundo: number[];
  };
}

export interface Comentario {
  id: string;
  autorId: string;
  autorNome: string;
  autorAvatar?: string;
  autorFaixa: string;
  texto: string;
  curtidas: number;
  curtidoPorMim: boolean;
  respostas: Comentario[];
  criadoEm: string;
  editado: boolean;
  fixado: boolean;
  ehProfessor: boolean;
  timestamp?: number;
}

export interface Duvida {
  id: string;
  alunoId: string;
  alunoNome: string;
  alunoAvatar?: string;
  alunoFaixa: string;
  pergunta: string;
  timestamp?: number;
  timestampFormatado?: string;
  votos: number;
  votadoPorMim: boolean;
  respondida: boolean;
  resposta?: {
    professorNome: string;
    professorAvatar?: string;
    texto: string;
    respondidoEm: string;
    videoResposta?: string;
  };
  criadoEm: string;
}

export interface NotaPessoal {
  id: string;
  videoId: string;
  texto: string;
  timestamp?: number;
  criadaEm: string;
  atualizadaEm: string;
}

// ── Helper: empty fallback objects ─────────────────────────────────────

function emptyVideoExperience(videoId: string): VideoExperience {
  return {
    video: { id: videoId, titulo: '', descricao: '', descricaoCompleta: '', videoUrl: '', thumbnailUrl: '', duracaoSegundos: 0, duracaoFormatada: '0:00', qualidade: '', modalidade: '', faixa: '', categoria: '', dificuldade: '', tags: [], publicadoEm: '', atualizadoEm: '' },
    professor: { id: '', nome: '', faixa: '', graus: 0, bio: '', totalVideos: 0, totalAlunos: 0 },
    progresso: { assistido: false, progressoSegundos: 0, progressoPercentual: 0, tempoTotalAssistido: 0, vezesAssistido: 0 },
    social: { curtidas: 0, curtidoPorMim: false, comentarios: 0, duvidas: 0, compartilhamentos: 0, salvos: 0, salvoPorMim: false, mediaAvaliacao: 0, totalAvaliacoes: 0 },
    comentarios: [],
    duvidas: [],
    tecnicasRelacionadas: [],
    capitulos: [],
    videosRelacionados: [],
    notasPessoais: [],
    temQuiz: false,
    quizCompletado: false,
    downloadPermitido: false,
  };
}

function emptyComentario(texto: string): Comentario {
  return { id: '', autorId: '', autorNome: '', autorFaixa: '', texto, curtidas: 0, curtidoPorMim: false, respostas: [], criadoEm: new Date().toISOString(), editado: false, fixado: false, ehProfessor: false };
}

function emptyDuvida(pergunta: string): Duvida {
  return { id: '', alunoId: '', alunoNome: '', alunoFaixa: '', pergunta, votos: 0, votadoPorMim: false, respondida: false, criadoEm: new Date().toISOString() };
}

function emptyNota(videoId: string, texto: string): NotaPessoal {
  return { id: '', videoId, texto, criadaEm: new Date().toISOString(), atualizadaEm: new Date().toISOString() };
}

// ── Service Functions ──────────────────────────────────────────────────

export async function getVideoExperience(videoId: string): Promise<VideoExperience> {
  try {
    if (isMock()) {
      const { mockGetVideoExperience } = await import('@/lib/mocks/video-experience.mock');
      return mockGetVideoExperience(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('content_videos')
      .select('*')
      .eq('id', videoId)
      .single();
    if (error || !data) {
      logServiceError(error, 'video-experience');
      return emptyVideoExperience(videoId);
    }
    // Map DB row to VideoExperience shape — partial mapping, full experience requires joins
    return {
      ...emptyVideoExperience(videoId),
      video: {
        id: data.id as string,
        titulo: (data.title as string) || '',
        descricao: (data.description as string) || '',
        descricaoCompleta: (data.description as string) || '',
        videoUrl: (data.source_url as string) || '',
        thumbnailUrl: (data.thumbnail_url as string) || '',
        duracaoSegundos: (data.duration_seconds as number) || 0,
        duracaoFormatada: '0:00',
        qualidade: '',
        modalidade: (data.modality as string) || '',
        faixa: (data.min_belt as string) || '',
        categoria: '',
        dificuldade: '',
        tags: (data.tags as string[]) || [],
        publicadoEm: (data.created_at as string) || '',
        atualizadoEm: (data.updated_at as string) || '',
      },
    };
  } catch (error) {
    logServiceError(error, 'video-experience');
    return emptyVideoExperience(videoId);
  }
}

export async function registrarProgresso(videoId: string, segundos: number): Promise<void> {
  try {
    if (isMock()) {
      const { mockRegistrarProgresso } = await import('@/lib/mocks/video-experience.mock');
      return mockRegistrarProgresso(videoId, segundos);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logServiceError(new Error('No authenticated user'), 'video-experience');
      return;
    }
    const { error } = await supabase
      .from('video_progress')
      .upsert({
        video_id: videoId,
        user_id: user.id,
        progress_seconds: segundos,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'video_id,user_id' });
    if (error) {
      logServiceError(error, 'video-experience');
    }
  } catch (error) {
    logServiceError(error, 'video-experience');
  }
}

export async function marcarCompleto(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarcarCompleto } = await import('@/lib/mocks/video-experience.mock');
      return mockMarcarCompleto(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logServiceError(new Error('No authenticated user'), 'video-experience');
      return;
    }
    const { error } = await supabase
      .from('video_progress')
      .upsert({
        video_id: videoId,
        user_id: user.id,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'video_id,user_id' });
    if (error) {
      logServiceError(error, 'video-experience');
    }
  } catch (error) {
    logServiceError(error, 'video-experience');
  }
}

export async function avaliarVideo(videoId: string, nota: number): Promise<void> {
  try {
    if (isMock()) {
      const { mockAvaliarVideo } = await import('@/lib/mocks/video-experience.mock');
      return mockAvaliarVideo(videoId, nota);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logServiceError(new Error('No authenticated user'), 'video-experience');
      return;
    }
    const { error } = await supabase
      .from('video_ratings')
      .upsert({
        video_id: videoId,
        user_id: user.id,
        rating: nota,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'video_id,user_id' });
    if (error) {
      logServiceError(error, 'video-experience');
    }
  } catch (error) {
    logServiceError(error, 'video-experience');
  }
}

export async function curtirVideo(videoId: string): Promise<{ curtidas: number }> {
  try {
    if (isMock()) {
      const { mockCurtirVideo } = await import('@/lib/mocks/video-experience.mock');
      return mockCurtirVideo(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logServiceError(new Error('No authenticated user'), 'video-experience');
      return { curtidas: 0 };
    }
    const { error } = await supabase
      .from('video_likes')
      .insert({ video_id: videoId, user_id: user.id });
    if (error) {
      logServiceError(error, 'video-experience');
    }
    const { count } = await supabase
      .from('video_likes')
      .select('*', { count: 'exact', head: true })
      .eq('video_id', videoId);
    return { curtidas: count ?? 0 };
  } catch (error) {
    logServiceError(error, 'video-experience');
    return { curtidas: 0 };
  }
}

export async function descurtirVideo(videoId: string): Promise<{ curtidas: number }> {
  try {
    if (isMock()) {
      const { mockDescurtirVideo } = await import('@/lib/mocks/video-experience.mock');
      return mockDescurtirVideo(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logServiceError(new Error('No authenticated user'), 'video-experience');
      return { curtidas: 0 };
    }
    const { error } = await supabase
      .from('video_likes')
      .delete()
      .eq('video_id', videoId)
      .eq('user_id', user.id);
    if (error) {
      logServiceError(error, 'video-experience');
    }
    const { count } = await supabase
      .from('video_likes')
      .select('*', { count: 'exact', head: true })
      .eq('video_id', videoId);
    return { curtidas: count ?? 0 };
  } catch (error) {
    logServiceError(error, 'video-experience');
    return { curtidas: 0 };
  }
}

export async function salvarVideo(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockSalvarVideo } = await import('@/lib/mocks/video-experience.mock');
      return mockSalvarVideo(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logServiceError(new Error('No authenticated user'), 'video-experience');
      return;
    }
    const { error } = await supabase
      .from('video_saved')
      .insert({ video_id: videoId, user_id: user.id });
    if (error) {
      logServiceError(error, 'video-experience');
    }
  } catch (error) {
    logServiceError(error, 'video-experience');
  }
}

export async function removerSalvo(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockRemoverSalvo } = await import('@/lib/mocks/video-experience.mock');
      return mockRemoverSalvo(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logServiceError(new Error('No authenticated user'), 'video-experience');
      return;
    }
    const { error } = await supabase
      .from('video_saved')
      .delete()
      .eq('video_id', videoId)
      .eq('user_id', user.id);
    if (error) {
      logServiceError(error, 'video-experience');
    }
  } catch (error) {
    logServiceError(error, 'video-experience');
  }
}

export async function compartilharVideo(videoId: string, canal: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockCompartilharVideo } = await import('@/lib/mocks/video-experience.mock');
      return mockCompartilharVideo(videoId, canal);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logServiceError(new Error('No authenticated user'), 'video-experience');
      return;
    }
    const { error } = await supabase
      .from('video_shares')
      .insert({ video_id: videoId, user_id: user.id, channel: canal });
    if (error) {
      logServiceError(error, 'video-experience');
    }
  } catch (error) {
    logServiceError(error, 'video-experience');
  }
}

export async function getComentarios(videoId: string, pagina?: number): Promise<Comentario[]> {
  try {
    if (isMock()) {
      const { mockGetComentarios } = await import('@/lib/mocks/video-experience.mock');
      return mockGetComentarios(videoId, pagina);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const limit = 20;
    const from = ((pagina ?? 1) - 1) * limit;
    const to = from + limit - 1;
    const { data, error } = await supabase
      .from('video_comments')
      .select('*')
      .eq('video_id', videoId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) {
      logServiceError(error, 'video-experience');
      return [];
    }
    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      autorId: row.user_id as string,
      autorNome: (row.user_name as string) || '',
      autorFaixa: '',
      texto: (row.text as string) || '',
      curtidas: (row.likes as number) || 0,
      curtidoPorMim: false,
      respostas: [],
      criadoEm: (row.created_at as string) || '',
      editado: (row.edited as boolean) || false,
      fixado: (row.pinned as boolean) || false,
      ehProfessor: (row.is_professor as boolean) || false,
      timestamp: row.timestamp as number | undefined,
    }));
  } catch (error) {
    logServiceError(error, 'video-experience');
    return [];
  }
}

export async function addComentario(videoId: string, texto: string, timestamp?: number): Promise<Comentario> {
  try {
    if (isMock()) {
      const { mockAddComentario } = await import('@/lib/mocks/video-experience.mock');
      return mockAddComentario(videoId, texto, timestamp);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logServiceError(new Error('No authenticated user'), 'video-experience');
      return emptyComentario(texto);
    }
    const { data: row, error } = await supabase
      .from('video_comments')
      .insert({ video_id: videoId, user_id: user.id, text: texto, timestamp })
      .select()
      .single();
    if (error || !row) {
      logServiceError(error, 'video-experience');
      return emptyComentario(texto);
    }
    return {
      id: row.id as string,
      autorId: row.user_id as string,
      autorNome: '',
      autorFaixa: '',
      texto: (row.text as string) || '',
      curtidas: 0,
      curtidoPorMim: false,
      respostas: [],
      criadoEm: (row.created_at as string) || '',
      editado: false,
      fixado: false,
      ehProfessor: false,
      timestamp: row.timestamp as number | undefined,
    };
  } catch (error) {
    logServiceError(error, 'video-experience');
    return emptyComentario(texto);
  }
}

export async function editarComentario(comentarioId: string, texto: string): Promise<Comentario> {
  try {
    if (isMock()) {
      const { mockEditarComentario } = await import('@/lib/mocks/video-experience.mock');
      return mockEditarComentario(comentarioId, texto);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('video_comments')
      .update({ text: texto, edited: true, updated_at: new Date().toISOString() })
      .eq('id', comentarioId)
      .select()
      .single();
    if (error || !row) {
      logServiceError(error, 'video-experience');
      return emptyComentario(texto);
    }
    return {
      id: row.id as string,
      autorId: row.user_id as string,
      autorNome: '',
      autorFaixa: '',
      texto: (row.text as string) || '',
      curtidas: (row.likes as number) || 0,
      curtidoPorMim: false,
      respostas: [],
      criadoEm: (row.created_at as string) || '',
      editado: true,
      fixado: (row.pinned as boolean) || false,
      ehProfessor: (row.is_professor as boolean) || false,
    };
  } catch (error) {
    logServiceError(error, 'video-experience');
    return emptyComentario(texto);
  }
}

export async function deletarComentario(comentarioId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeletarComentario } = await import('@/lib/mocks/video-experience.mock');
      return mockDeletarComentario(comentarioId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('video_comments')
      .delete()
      .eq('id', comentarioId);
    if (error) {
      logServiceError(error, 'video-experience');
    }
  } catch (error) {
    logServiceError(error, 'video-experience');
  }
}

export async function curtirComentario(comentarioId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockCurtirComentario } = await import('@/lib/mocks/video-experience.mock');
      return mockCurtirComentario(comentarioId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('video_comments')
      .update({ likes: supabase.rpc ? undefined : 0 })
      .eq('id', comentarioId);
    // Use RPC for atomic increment if available, otherwise just log
    const { error: rpcError } = await supabase.rpc('increment_comment_likes', { comment_id: comentarioId });
    if (rpcError && error) {
      logServiceError(rpcError, 'video-experience');
    }
  } catch (error) {
    logServiceError(error, 'video-experience');
  }
}

export async function responderComentario(comentarioId: string, texto: string): Promise<Comentario> {
  try {
    if (isMock()) {
      const { mockResponderComentario } = await import('@/lib/mocks/video-experience.mock');
      return mockResponderComentario(comentarioId, texto);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logServiceError(new Error('No authenticated user'), 'video-experience');
      return emptyComentario(texto);
    }
    // Get parent comment to know the video_id
    const { data: parent } = await supabase
      .from('video_comments')
      .select('video_id')
      .eq('id', comentarioId)
      .single();
    const { data: row, error } = await supabase
      .from('video_comments')
      .insert({
        video_id: parent?.video_id ?? '',
        user_id: user.id,
        text: texto,
        parent_id: comentarioId,
      })
      .select()
      .single();
    if (error || !row) {
      logServiceError(error, 'video-experience');
      return emptyComentario(texto);
    }
    return {
      id: row.id as string,
      autorId: row.user_id as string,
      autorNome: '',
      autorFaixa: '',
      texto: (row.text as string) || '',
      curtidas: 0,
      curtidoPorMim: false,
      respostas: [],
      criadoEm: (row.created_at as string) || '',
      editado: false,
      fixado: false,
      ehProfessor: false,
    };
  } catch (error) {
    logServiceError(error, 'video-experience');
    return emptyComentario(texto);
  }
}

export async function fixarComentario(comentarioId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockFixarComentario } = await import('@/lib/mocks/video-experience.mock');
      return mockFixarComentario(comentarioId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('video_comments')
      .update({ pinned: true })
      .eq('id', comentarioId);
    if (error) {
      logServiceError(error, 'video-experience');
    }
  } catch (error) {
    logServiceError(error, 'video-experience');
  }
}

export async function getDuvidas(videoId: string): Promise<Duvida[]> {
  try {
    if (isMock()) {
      const { mockGetDuvidas } = await import('@/lib/mocks/video-experience.mock');
      return mockGetDuvidas(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('video_questions')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false });
    if (error) {
      logServiceError(error, 'video-experience');
      return [];
    }
    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      alunoId: row.user_id as string,
      alunoNome: (row.user_name as string) || '',
      alunoFaixa: '',
      pergunta: (row.question as string) || '',
      timestamp: row.timestamp as number | undefined,
      votos: (row.votes as number) || 0,
      votadoPorMim: false,
      respondida: !!(row.answer as string),
      resposta: (row.answer as string) ? {
        professorNome: (row.answered_by_name as string) || '',
        texto: (row.answer as string) || '',
        respondidoEm: (row.answered_at as string) || '',
      } : undefined,
      criadoEm: (row.created_at as string) || '',
    }));
  } catch (error) {
    logServiceError(error, 'video-experience');
    return [];
  }
}

export async function addDuvida(videoId: string, pergunta: string, timestamp?: number): Promise<Duvida> {
  try {
    if (isMock()) {
      const { mockAddDuvida } = await import('@/lib/mocks/video-experience.mock');
      return mockAddDuvida(videoId, pergunta, timestamp);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logServiceError(new Error('No authenticated user'), 'video-experience');
      return emptyDuvida(pergunta);
    }
    const { data: row, error } = await supabase
      .from('video_questions')
      .insert({ video_id: videoId, user_id: user.id, question: pergunta, timestamp })
      .select()
      .single();
    if (error || !row) {
      logServiceError(error, 'video-experience');
      return emptyDuvida(pergunta);
    }
    return {
      id: row.id as string,
      alunoId: row.user_id as string,
      alunoNome: '',
      alunoFaixa: '',
      pergunta: (row.question as string) || '',
      timestamp: row.timestamp as number | undefined,
      votos: 0,
      votadoPorMim: false,
      respondida: false,
      criadoEm: (row.created_at as string) || '',
    };
  } catch (error) {
    logServiceError(error, 'video-experience');
    return emptyDuvida(pergunta);
  }
}

export async function votarDuvida(duvidaId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockVotarDuvida } = await import('@/lib/mocks/video-experience.mock');
      return mockVotarDuvida(duvidaId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase.rpc('increment_question_votes', { question_id: duvidaId });
    if (error) {
      logServiceError(error, 'video-experience');
    }
  } catch (error) {
    logServiceError(error, 'video-experience');
  }
}

export async function responderDuvida(duvidaId: string, resposta: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockResponderDuvida } = await import('@/lib/mocks/video-experience.mock');
      return mockResponderDuvida(duvidaId, resposta);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('video_questions')
      .update({
        answer: resposta,
        answered_by: user?.id ?? '',
        answered_at: new Date().toISOString(),
      })
      .eq('id', duvidaId);
    if (error) {
      logServiceError(error, 'video-experience');
    }
  } catch (error) {
    logServiceError(error, 'video-experience');
  }
}

export async function getNotas(videoId: string): Promise<NotaPessoal[]> {
  try {
    if (isMock()) {
      const { mockGetNotas } = await import('@/lib/mocks/video-experience.mock');
      return mockGetNotas(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logServiceError(new Error('No authenticated user'), 'video-experience');
      return [];
    }
    const { data, error } = await supabase
      .from('video_notes')
      .select('*')
      .eq('video_id', videoId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      logServiceError(error, 'video-experience');
      return [];
    }
    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      videoId: row.video_id as string,
      texto: (row.text as string) || '',
      timestamp: row.timestamp as number | undefined,
      criadaEm: (row.created_at as string) || '',
      atualizadaEm: (row.updated_at as string) || '',
    }));
  } catch (error) {
    logServiceError(error, 'video-experience');
    return [];
  }
}

export async function addNota(videoId: string, texto: string, timestamp?: number): Promise<NotaPessoal> {
  try {
    if (isMock()) {
      const { mockAddNota } = await import('@/lib/mocks/video-experience.mock');
      return mockAddNota(videoId, texto, timestamp);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logServiceError(new Error('No authenticated user'), 'video-experience');
      return emptyNota(videoId, texto);
    }
    const { data: row, error } = await supabase
      .from('video_notes')
      .insert({ video_id: videoId, user_id: user.id, text: texto, timestamp })
      .select()
      .single();
    if (error || !row) {
      logServiceError(error, 'video-experience');
      return emptyNota(videoId, texto);
    }
    return {
      id: row.id as string,
      videoId: row.video_id as string,
      texto: (row.text as string) || '',
      timestamp: row.timestamp as number | undefined,
      criadaEm: (row.created_at as string) || '',
      atualizadaEm: (row.updated_at as string) || '',
    };
  } catch (error) {
    logServiceError(error, 'video-experience');
    return emptyNota(videoId, texto);
  }
}

export async function editarNota(notaId: string, texto: string): Promise<NotaPessoal> {
  try {
    if (isMock()) {
      const { mockEditarNota } = await import('@/lib/mocks/video-experience.mock');
      return mockEditarNota(notaId, texto);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('video_notes')
      .update({ text: texto, updated_at: new Date().toISOString() })
      .eq('id', notaId)
      .select()
      .single();
    if (error || !row) {
      logServiceError(error, 'video-experience');
      return emptyNota('', texto);
    }
    return {
      id: row.id as string,
      videoId: row.video_id as string,
      texto: (row.text as string) || '',
      timestamp: row.timestamp as number | undefined,
      criadaEm: (row.created_at as string) || '',
      atualizadaEm: (row.updated_at as string) || '',
    };
  } catch (error) {
    logServiceError(error, 'video-experience');
    return emptyNota('', texto);
  }
}

export async function deletarNota(notaId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeletarNota } = await import('@/lib/mocks/video-experience.mock');
      return mockDeletarNota(notaId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('video_notes')
      .delete()
      .eq('id', notaId);
    if (error) {
      logServiceError(error, 'video-experience');
    }
  } catch (error) {
    logServiceError(error, 'video-experience');
  }
}

export async function getDownloadUrl(videoId: string): Promise<string | null> {
  try {
    if (isMock()) {
      const { mockGetDownloadUrl } = await import('@/lib/mocks/video-experience.mock');
      return mockGetDownloadUrl(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('content_videos')
      .select('source_url')
      .eq('id', videoId)
      .single();
    if (error || !data) {
      logServiceError(error, 'video-experience');
      return null;
    }
    return (data.source_url as string) || null;
  } catch (error) {
    logServiceError(error, 'video-experience');
    return null;
  }
}

export async function getDuvidasPendentes(): Promise<(Duvida & { videoTitulo: string; videoId: string })[]> {
  try {
    if (isMock()) {
      const { mockGetDuvidasPendentes } = await import('@/lib/mocks/video-experience.mock');
      return mockGetDuvidasPendentes();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('video_questions')
      .select('*, content_videos(id, title)')
      .is('answer', null)
      .order('created_at', { ascending: false });
    if (error) {
      logServiceError(error, 'video-experience');
      return [];
    }
    return (data ?? []).map((row: Record<string, unknown>) => {
      const video = row.content_videos as Record<string, unknown> | null;
      return {
        id: row.id as string,
        alunoId: row.user_id as string,
        alunoNome: (row.user_name as string) || '',
        alunoFaixa: '',
        pergunta: (row.question as string) || '',
        timestamp: row.timestamp as number | undefined,
        votos: (row.votes as number) || 0,
        votadoPorMim: false,
        respondida: false,
        criadoEm: (row.created_at as string) || '',
        videoTitulo: (video?.title as string) || '',
        videoId: (video?.id as string) || (row.video_id as string) || '',
      };
    });
  } catch (error) {
    logServiceError(error, 'video-experience');
    return [];
  }
}

export async function getDuvidasRespondidas(): Promise<(Duvida & { videoTitulo: string; videoId: string })[]> {
  try {
    if (isMock()) {
      const { mockGetDuvidasRespondidas } = await import('@/lib/mocks/video-experience.mock');
      return mockGetDuvidasRespondidas();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('video_questions')
      .select('*, content_videos(id, title)')
      .not('answer', 'is', null)
      .order('answered_at', { ascending: false });
    if (error) {
      logServiceError(error, 'video-experience');
      return [];
    }
    return (data ?? []).map((row: Record<string, unknown>) => {
      const video = row.content_videos as Record<string, unknown> | null;
      return {
        id: row.id as string,
        alunoId: row.user_id as string,
        alunoNome: (row.user_name as string) || '',
        alunoFaixa: '',
        pergunta: (row.question as string) || '',
        timestamp: row.timestamp as number | undefined,
        votos: (row.votes as number) || 0,
        votadoPorMim: false,
        respondida: true,
        resposta: {
          professorNome: (row.answered_by_name as string) || '',
          texto: (row.answer as string) || '',
          respondidoEm: (row.answered_at as string) || '',
        },
        criadoEm: (row.created_at as string) || '',
        videoTitulo: (video?.title as string) || '',
        videoId: (video?.id as string) || (row.video_id as string) || '',
      };
    });
  } catch (error) {
    logServiceError(error, 'video-experience');
    return [];
  }
}
