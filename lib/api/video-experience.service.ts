import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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

// ── Service Functions ──────────────────────────────────────────────────

export async function getVideoExperience(videoId: string): Promise<VideoExperience> {
  try {
    if (isMock()) {
      const { mockGetVideoExperience } = await import('@/lib/mocks/video-experience.mock');
      return mockGetVideoExperience(videoId);
    }
    const res = await fetch(`/api/video/${videoId}/experience`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.get');
    console.warn('[video-experience] getVideoExperience: API not available, using mock');
    const { mockGetVideoExperience } = await import('@/lib/mocks/video-experience.mock');
    return mockGetVideoExperience(videoId);
  }
}

export async function registrarProgresso(videoId: string, segundos: number): Promise<void> {
  try {
    if (isMock()) {
      const { mockRegistrarProgresso } = await import('@/lib/mocks/video-experience.mock');
      return mockRegistrarProgresso(videoId, segundos);
    }
    const res = await fetch(`/api/video/${videoId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ segundos }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.registrarProgresso');
    console.warn('[video-experience] registrarProgresso: API not available, using mock');
    const { mockRegistrarProgresso } = await import('@/lib/mocks/video-experience.mock');
    return mockRegistrarProgresso(videoId, segundos);
  }
}

export async function marcarCompleto(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarcarCompleto } = await import('@/lib/mocks/video-experience.mock');
      return mockMarcarCompleto(videoId);
    }
    const res = await fetch(`/api/video/${videoId}/complete`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.marcarCompleto');
    console.warn('[video-experience] marcarCompleto: API not available, using mock');
    const { mockMarcarCompleto } = await import('@/lib/mocks/video-experience.mock');
    return mockMarcarCompleto(videoId);
  }
}

export async function avaliarVideo(videoId: string, nota: number): Promise<void> {
  try {
    if (isMock()) {
      const { mockAvaliarVideo } = await import('@/lib/mocks/video-experience.mock');
      return mockAvaliarVideo(videoId, nota);
    }
    const res = await fetch(`/api/video/${videoId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nota }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.avaliarVideo');
    console.warn('[video-experience] avaliarVideo: API not available, using mock');
    const { mockAvaliarVideo } = await import('@/lib/mocks/video-experience.mock');
    return mockAvaliarVideo(videoId, nota);
  }
}

export async function curtirVideo(videoId: string): Promise<{ curtidas: number }> {
  try {
    if (isMock()) {
      const { mockCurtirVideo } = await import('@/lib/mocks/video-experience.mock');
      return mockCurtirVideo(videoId);
    }
    const res = await fetch(`/api/video/${videoId}/like`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.curtirVideo');
    console.warn('[video-experience] curtirVideo: API not available, using mock');
    const { mockCurtirVideo } = await import('@/lib/mocks/video-experience.mock');
    return mockCurtirVideo(videoId);
  }
}

export async function descurtirVideo(videoId: string): Promise<{ curtidas: number }> {
  try {
    if (isMock()) {
      const { mockDescurtirVideo } = await import('@/lib/mocks/video-experience.mock');
      return mockDescurtirVideo(videoId);
    }
    const res = await fetch(`/api/video/${videoId}/unlike`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.descurtirVideo');
    console.warn('[video-experience] descurtirVideo: API not available, using mock');
    const { mockDescurtirVideo } = await import('@/lib/mocks/video-experience.mock');
    return mockDescurtirVideo(videoId);
  }
}

export async function salvarVideo(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockSalvarVideo } = await import('@/lib/mocks/video-experience.mock');
      return mockSalvarVideo(videoId);
    }
    const res = await fetch(`/api/video/${videoId}/save`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.salvarVideo');
    console.warn('[video-experience] salvarVideo: API not available, using mock');
    const { mockSalvarVideo } = await import('@/lib/mocks/video-experience.mock');
    return mockSalvarVideo(videoId);
  }
}

export async function removerSalvo(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockRemoverSalvo } = await import('@/lib/mocks/video-experience.mock');
      return mockRemoverSalvo(videoId);
    }
    const res = await fetch(`/api/video/${videoId}/unsave`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.removerSalvo');
    console.warn('[video-experience] removerSalvo: API not available, using mock');
    const { mockRemoverSalvo } = await import('@/lib/mocks/video-experience.mock');
    return mockRemoverSalvo(videoId);
  }
}

export async function compartilharVideo(videoId: string, canal: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockCompartilharVideo } = await import('@/lib/mocks/video-experience.mock');
      return mockCompartilharVideo(videoId, canal);
    }
    const res = await fetch(`/api/video/${videoId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canal }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.compartilharVideo');
    console.warn('[video-experience] compartilharVideo: API not available, using mock');
    const { mockCompartilharVideo } = await import('@/lib/mocks/video-experience.mock');
    return mockCompartilharVideo(videoId, canal);
  }
}

export async function getComentarios(videoId: string, pagina?: number): Promise<Comentario[]> {
  try {
    if (isMock()) {
      const { mockGetComentarios } = await import('@/lib/mocks/video-experience.mock');
      return mockGetComentarios(videoId, pagina);
    }
    const url = pagina
      ? `/api/video/${videoId}/comments?page=${pagina}`
      : `/api/video/${videoId}/comments`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.getComentarios');
    console.warn('[video-experience] getComentarios: API not available, using mock');
    const { mockGetComentarios } = await import('@/lib/mocks/video-experience.mock');
    return mockGetComentarios(videoId, pagina);
  }
}

export async function addComentario(videoId: string, texto: string, timestamp?: number): Promise<Comentario> {
  try {
    if (isMock()) {
      const { mockAddComentario } = await import('@/lib/mocks/video-experience.mock');
      return mockAddComentario(videoId, texto, timestamp);
    }
    const res = await fetch(`/api/video/${videoId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto, timestamp }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.addComentario');
    console.warn('[video-experience] addComentario: API not available, using mock');
    const { mockAddComentario } = await import('@/lib/mocks/video-experience.mock');
    return mockAddComentario(videoId, texto, timestamp);
  }
}

export async function editarComentario(comentarioId: string, texto: string): Promise<Comentario> {
  try {
    if (isMock()) {
      const { mockEditarComentario } = await import('@/lib/mocks/video-experience.mock');
      return mockEditarComentario(comentarioId, texto);
    }
    const res = await fetch(`/api/video/comments/${comentarioId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.editarComentario');
    console.warn('[video-experience] editarComentario: API not available, using mock');
    const { mockEditarComentario } = await import('@/lib/mocks/video-experience.mock');
    return mockEditarComentario(comentarioId, texto);
  }
}

export async function deletarComentario(comentarioId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeletarComentario } = await import('@/lib/mocks/video-experience.mock');
      return mockDeletarComentario(comentarioId);
    }
    const res = await fetch(`/api/video/comments/${comentarioId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.deletarComentario');
    console.warn('[video-experience] deletarComentario: API not available, using mock');
    const { mockDeletarComentario } = await import('@/lib/mocks/video-experience.mock');
    return mockDeletarComentario(comentarioId);
  }
}

export async function curtirComentario(comentarioId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockCurtirComentario } = await import('@/lib/mocks/video-experience.mock');
      return mockCurtirComentario(comentarioId);
    }
    const res = await fetch(`/api/video/comments/${comentarioId}/like`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.curtirComentario');
    console.warn('[video-experience] curtirComentario: API not available, using mock');
    const { mockCurtirComentario } = await import('@/lib/mocks/video-experience.mock');
    return mockCurtirComentario(comentarioId);
  }
}

export async function responderComentario(comentarioId: string, texto: string): Promise<Comentario> {
  try {
    if (isMock()) {
      const { mockResponderComentario } = await import('@/lib/mocks/video-experience.mock');
      return mockResponderComentario(comentarioId, texto);
    }
    const res = await fetch(`/api/video/comments/${comentarioId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.responderComentario');
    console.warn('[video-experience] responderComentario: API not available, using mock');
    const { mockResponderComentario } = await import('@/lib/mocks/video-experience.mock');
    return mockResponderComentario(comentarioId, texto);
  }
}

export async function fixarComentario(comentarioId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockFixarComentario } = await import('@/lib/mocks/video-experience.mock');
      return mockFixarComentario(comentarioId);
    }
    const res = await fetch(`/api/video/comments/${comentarioId}/pin`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.fixarComentario');
    console.warn('[video-experience] fixarComentario: API not available, using mock');
    const { mockFixarComentario } = await import('@/lib/mocks/video-experience.mock');
    return mockFixarComentario(comentarioId);
  }
}

export async function getDuvidas(videoId: string): Promise<Duvida[]> {
  try {
    if (isMock()) {
      const { mockGetDuvidas } = await import('@/lib/mocks/video-experience.mock');
      return mockGetDuvidas(videoId);
    }
    const res = await fetch(`/api/video/${videoId}/questions`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.getDuvidas');
    console.warn('[video-experience] getDuvidas: API not available, using mock');
    const { mockGetDuvidas } = await import('@/lib/mocks/video-experience.mock');
    return mockGetDuvidas(videoId);
  }
}

export async function addDuvida(videoId: string, pergunta: string, timestamp?: number): Promise<Duvida> {
  try {
    if (isMock()) {
      const { mockAddDuvida } = await import('@/lib/mocks/video-experience.mock');
      return mockAddDuvida(videoId, pergunta, timestamp);
    }
    const res = await fetch(`/api/video/${videoId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pergunta, timestamp }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.addDuvida');
    console.warn('[video-experience] addDuvida: API not available, using mock');
    const { mockAddDuvida } = await import('@/lib/mocks/video-experience.mock');
    return mockAddDuvida(videoId, pergunta, timestamp);
  }
}

export async function votarDuvida(duvidaId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockVotarDuvida } = await import('@/lib/mocks/video-experience.mock');
      return mockVotarDuvida(duvidaId);
    }
    const res = await fetch(`/api/video/questions/${duvidaId}/vote`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.votarDuvida');
    console.warn('[video-experience] votarDuvida: API not available, using mock');
    const { mockVotarDuvida } = await import('@/lib/mocks/video-experience.mock');
    return mockVotarDuvida(duvidaId);
  }
}

export async function responderDuvida(duvidaId: string, resposta: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockResponderDuvida } = await import('@/lib/mocks/video-experience.mock');
      return mockResponderDuvida(duvidaId, resposta);
    }
    const res = await fetch(`/api/video/questions/${duvidaId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resposta }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.responderDuvida');
    console.warn('[video-experience] responderDuvida: API not available, using mock');
    const { mockResponderDuvida } = await import('@/lib/mocks/video-experience.mock');
    return mockResponderDuvida(duvidaId, resposta);
  }
}

export async function getNotas(videoId: string): Promise<NotaPessoal[]> {
  try {
    if (isMock()) {
      const { mockGetNotas } = await import('@/lib/mocks/video-experience.mock');
      return mockGetNotas(videoId);
    }
    const res = await fetch(`/api/video/${videoId}/notes`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.getNotas');
    console.warn('[video-experience] getNotas: API not available, using mock');
    const { mockGetNotas } = await import('@/lib/mocks/video-experience.mock');
    return mockGetNotas(videoId);
  }
}

export async function addNota(videoId: string, texto: string, timestamp?: number): Promise<NotaPessoal> {
  try {
    if (isMock()) {
      const { mockAddNota } = await import('@/lib/mocks/video-experience.mock');
      return mockAddNota(videoId, texto, timestamp);
    }
    const res = await fetch(`/api/video/${videoId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto, timestamp }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.addNota');
    console.warn('[video-experience] addNota: API not available, using mock');
    const { mockAddNota } = await import('@/lib/mocks/video-experience.mock');
    return mockAddNota(videoId, texto, timestamp);
  }
}

export async function editarNota(notaId: string, texto: string): Promise<NotaPessoal> {
  try {
    if (isMock()) {
      const { mockEditarNota } = await import('@/lib/mocks/video-experience.mock');
      return mockEditarNota(notaId, texto);
    }
    const res = await fetch(`/api/video/notes/${notaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.editarNota');
    console.warn('[video-experience] editarNota: API not available, using mock');
    const { mockEditarNota } = await import('@/lib/mocks/video-experience.mock');
    return mockEditarNota(notaId, texto);
  }
}

export async function deletarNota(notaId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeletarNota } = await import('@/lib/mocks/video-experience.mock');
      return mockDeletarNota(notaId);
    }
    const res = await fetch(`/api/video/notes/${notaId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.deletarNota');
    console.warn('[video-experience] deletarNota: API not available, using mock');
    const { mockDeletarNota } = await import('@/lib/mocks/video-experience.mock');
    return mockDeletarNota(notaId);
  }
}

export async function getDownloadUrl(videoId: string): Promise<string | null> {
  try {
    if (isMock()) {
      const { mockGetDownloadUrl } = await import('@/lib/mocks/video-experience.mock');
      return mockGetDownloadUrl(videoId);
    }
    const res = await fetch(`/api/video/${videoId}/download`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.url ?? null;
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.getDownloadUrl');
    console.warn('[video-experience] getDownloadUrl: API not available, using mock');
    const { mockGetDownloadUrl } = await import('@/lib/mocks/video-experience.mock');
    return mockGetDownloadUrl(videoId);
  }
}

export async function getDuvidasPendentes(): Promise<(Duvida & { videoTitulo: string; videoId: string })[]> {
  try {
    if (isMock()) {
      const { mockGetDuvidasPendentes } = await import('@/lib/mocks/video-experience.mock');
      return mockGetDuvidasPendentes();
    }
    const res = await fetch('/api/video/questions/pending');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.getDuvidasPendentes');
    console.warn('[video-experience] getDuvidasPendentes: API not available, using mock');
    const { mockGetDuvidasPendentes } = await import('@/lib/mocks/video-experience.mock');
    return mockGetDuvidasPendentes();
  }
}

export async function getDuvidasRespondidas(): Promise<(Duvida & { videoTitulo: string; videoId: string })[]> {
  try {
    if (isMock()) {
      const { mockGetDuvidasRespondidas } = await import('@/lib/mocks/video-experience.mock');
      return mockGetDuvidasRespondidas();
    }
    const res = await fetch('/api/video/questions/answered');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    if (isMock()) handleServiceError(error, 'videoExperience.getDuvidasRespondidas');
    console.warn('[video-experience] getDuvidasRespondidas: API not available, using mock');
    const { mockGetDuvidasRespondidas } = await import('@/lib/mocks/video-experience.mock');
    return mockGetDuvidasRespondidas();
  }
}
