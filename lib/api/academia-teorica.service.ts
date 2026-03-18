import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

// ── Tipos ──────────────────────────────────────────────────────────

export interface ModuloTeorico {
  id: string;
  modalidade: string;
  faixa: string;
  titulo: string;
  descricao: string;
  icone: string;
  ordem: number;
  totalLicoes: number;
  licoesCompletadas: number;
  quizScore?: number;
  certificadoEmitido: boolean;
  bloqueado: boolean;
  categoria: 'requisitos' | 'terminologia' | 'regras' | 'historia' | 'filosofia' | 'saude';
}

export interface Licao {
  id: string;
  moduloId: string;
  titulo: string;
  ordem: number;
  tipo: 'texto' | 'terminologia' | 'regras' | 'historia' | 'quiz';
  conteudo: LicaoConteudo;
  duracao: string;
  concluida: boolean;
  concluidaEm?: string;
}

export interface LicaoConteudo {
  blocos: ConteudoBloco[];
}

export interface ConteudoBloco {
  tipo: 'titulo' | 'paragrafo' | 'lista' | 'destaque' | 'imagem' | 'termo' | 'quiz' | 'dica' | 'curiosidade' | 'video_ref';
  conteudo: string;
  termo?: {
    original: string;
    traducao: string;
    pronuncia: string;
    idioma: string;
    exemplo: string;
  };
  quiz?: QuizPergunta;
  itens?: string[];
  cor?: 'info' | 'warning' | 'success' | 'danger';
}

export interface QuizPergunta {
  id: string;
  pergunta: string;
  tipo: 'multipla_escolha' | 'verdadeiro_falso' | 'completar';
  opcoes?: { texto: string; correta: boolean }[];
  explicacao: string;
}

export interface QuizModulo {
  id: string;
  moduloId: string;
  titulo: string;
  descricao: string;
  perguntas: QuizPergunta[];
  totalPerguntas: number;
  notaMinima: number;
  tentativas: number;
  melhorNota: number;
  ultimaTentativa?: string;
  aprovado: boolean;
}

export interface CertificadoTeorico {
  id: string;
  alunoNome: string;
  moduloTitulo: string;
  modalidade: string;
  faixa: string;
  nota: number;
  emitidoEm: string;
  academiaLogo?: string;
  academiaNome: string;
  professorNome: string;
  qrCodeUrl: string;
  codigoVerificacao: string;
}

export interface TermoArtesMarciais {
  id: string;
  original: string;
  traducao: string;
  pronuncia: string;
  idioma: string;
  modalidade: string;
  categoria: 'posicao' | 'tecnica' | 'comando' | 'graduacao' | 'competicao' | 'etiqueta' | 'anatomia';
  descricao: string;
  exemplo: string;
  faixaMinima: string;
}

export interface ProgressoGeral {
  totalModulos: number;
  completados: number;
  emProgresso: number;
  certificados: number;
  percentual: number;
}

export interface ResultadoQuiz {
  nota: number;
  aprovado: boolean;
  total: number;
  acertos: number;
  explicacoes: { perguntaId: string; correta: boolean; explicacao: string }[];
}

// ── Módulos ────────────────────────────────────────────────────────

export async function getModulos(modalidade?: string, faixa?: string): Promise<ModuloTeorico[]> {
  try {
    if (isMock()) {
      const { mockGetModulos } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetModulos(modalidade, faixa);
    }
    try {
      const params = new URLSearchParams();
      if (modalidade) params.set('modalidade', modalidade);
      if (faixa) params.set('faixa', faixa);
      const res = await fetch(`/api/academia-teorica/modulos?${params}`);
      if (!res.ok) throw new ServiceError(res.status, 'academiaTeorica.getModulos');
      return res.json();
    } catch {
      const { mockGetModulos } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetModulos(modalidade, faixa);
    }
  } catch (error) { handleServiceError(error, 'academiaTeorica.getModulos'); }
}

export async function getModulo(id: string): Promise<ModuloTeorico & { licoes: Licao[] }> {
  try {
    if (isMock()) {
      const { mockGetModulo } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetModulo(id);
    }
    try {
      const res = await fetch(`/api/academia-teorica/modulos/${id}`);
      if (!res.ok) throw new ServiceError(res.status, 'academiaTeorica.getModulo');
      return res.json();
    } catch {
      const { mockGetModulo } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetModulo(id);
    }
  } catch (error) { handleServiceError(error, 'academiaTeorica.getModulo'); }
}

export async function getLicao(id: string): Promise<Licao> {
  try {
    if (isMock()) {
      const { mockGetLicao } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetLicao(id);
    }
    try {
      const res = await fetch(`/api/academia-teorica/licoes/${id}`);
      if (!res.ok) throw new ServiceError(res.status, 'academiaTeorica.getLicao');
      return res.json();
    } catch {
      const { mockGetLicao } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetLicao(id);
    }
  } catch (error) { handleServiceError(error, 'academiaTeorica.getLicao'); }
}

export async function marcarLicaoConcluida(licaoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarcarLicaoConcluida } = await import('@/lib/mocks/academia-teorica.mock');
      return mockMarcarLicaoConcluida(licaoId);
    }
    try {
      const res = await fetch(`/api/academia-teorica/licoes/${licaoId}/concluir`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'academiaTeorica.marcarConcluida');
    } catch {
      const { mockMarcarLicaoConcluida } = await import('@/lib/mocks/academia-teorica.mock');
      return mockMarcarLicaoConcluida(licaoId);
    }
  } catch (error) { handleServiceError(error, 'academiaTeorica.marcarConcluida'); }
}

export async function getProgressoGeral(): Promise<ProgressoGeral> {
  try {
    if (isMock()) {
      const { mockGetProgressoGeral } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetProgressoGeral();
    }
    try {
      const res = await fetch('/api/academia-teorica/progresso');
      if (!res.ok) throw new ServiceError(res.status, 'academiaTeorica.getProgresso');
      return res.json();
    } catch {
      const { mockGetProgressoGeral } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetProgressoGeral();
    }
  } catch (error) { handleServiceError(error, 'academiaTeorica.getProgresso'); }
}

// ── Quiz ───────────────────────────────────────────────────────────

export async function getQuiz(moduloId: string): Promise<QuizModulo> {
  try {
    if (isMock()) {
      const { mockGetQuiz } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetQuiz(moduloId);
    }
    try {
      const res = await fetch(`/api/academia-teorica/modulos/${moduloId}/quiz`);
      if (!res.ok) throw new ServiceError(res.status, 'academiaTeorica.getQuiz');
      return res.json();
    } catch {
      const { mockGetQuiz } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetQuiz(moduloId);
    }
  } catch (error) { handleServiceError(error, 'academiaTeorica.getQuiz'); }
}

export async function submeterQuiz(
  moduloId: string,
  respostas: Record<string, string>,
): Promise<ResultadoQuiz> {
  try {
    if (isMock()) {
      const { mockSubmeterQuiz } = await import('@/lib/mocks/academia-teorica.mock');
      return mockSubmeterQuiz(moduloId, respostas);
    }
    try {
      const res = await fetch(`/api/academia-teorica/modulos/${moduloId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respostas }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'academiaTeorica.submeterQuiz');
      return res.json();
    } catch {
      const { mockSubmeterQuiz } = await import('@/lib/mocks/academia-teorica.mock');
      return mockSubmeterQuiz(moduloId, respostas);
    }
  } catch (error) { handleServiceError(error, 'academiaTeorica.submeterQuiz'); }
}

// ── Terminologia ───────────────────────────────────────────────────

export async function getTermos(
  modalidade?: string,
  categoria?: string,
  faixaMinima?: string,
): Promise<TermoArtesMarciais[]> {
  try {
    if (isMock()) {
      const { mockGetTermos } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetTermos(modalidade, categoria, faixaMinima);
    }
    try {
      const params = new URLSearchParams();
      if (modalidade) params.set('modalidade', modalidade);
      if (categoria) params.set('categoria', categoria);
      if (faixaMinima) params.set('faixaMinima', faixaMinima);
      const res = await fetch(`/api/academia-teorica/glossario?${params}`);
      if (!res.ok) throw new ServiceError(res.status, 'academiaTeorica.getTermos');
      return res.json();
    } catch {
      const { mockGetTermos } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetTermos(modalidade, categoria, faixaMinima);
    }
  } catch (error) { handleServiceError(error, 'academiaTeorica.getTermos'); }
}

export async function buscarTermo(query: string): Promise<TermoArtesMarciais[]> {
  try {
    if (isMock()) {
      const { mockBuscarTermo } = await import('@/lib/mocks/academia-teorica.mock');
      return mockBuscarTermo(query);
    }
    try {
      const res = await fetch(`/api/academia-teorica/glossario/buscar?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new ServiceError(res.status, 'academiaTeorica.buscarTermo');
      return res.json();
    } catch {
      const { mockBuscarTermo } = await import('@/lib/mocks/academia-teorica.mock');
      return mockBuscarTermo(query);
    }
  } catch (error) { handleServiceError(error, 'academiaTeorica.buscarTermo'); }
}

// ── Certificados ───────────────────────────────────────────────────

export async function getCertificados(): Promise<CertificadoTeorico[]> {
  try {
    if (isMock()) {
      const { mockGetCertificados } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetCertificados();
    }
    try {
      const res = await fetch('/api/academia-teorica/certificados');
      if (!res.ok) throw new ServiceError(res.status, 'academiaTeorica.getCertificados');
      return res.json();
    } catch {
      const { mockGetCertificados } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetCertificados();
    }
  } catch (error) { handleServiceError(error, 'academiaTeorica.getCertificados'); }
}

export async function emitirCertificado(moduloId: string): Promise<CertificadoTeorico> {
  try {
    if (isMock()) {
      const { mockEmitirCertificado } = await import('@/lib/mocks/academia-teorica.mock');
      return mockEmitirCertificado(moduloId);
    }
    try {
      const res = await fetch(`/api/academia-teorica/certificados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduloId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'academiaTeorica.emitirCertificado');
      return res.json();
    } catch {
      const { mockEmitirCertificado } = await import('@/lib/mocks/academia-teorica.mock');
      return mockEmitirCertificado(moduloId);
    }
  } catch (error) { handleServiceError(error, 'academiaTeorica.emitirCertificado'); }
}

export async function validarCertificado(code: string): Promise<CertificadoTeorico | null> {
  try {
    if (isMock()) {
      const { mockValidarCertificado } = await import('@/lib/mocks/academia-teorica.mock');
      return mockValidarCertificado(code);
    }
    try {
      const res = await fetch(`/api/academia-teorica/certificados/verificar/${code}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new ServiceError(res.status, 'academiaTeorica.validarCertificado');
      return res.json();
    } catch {
      return null;
    }
  } catch (error) { handleServiceError(error, 'academiaTeorica.validarCertificado'); }
}
