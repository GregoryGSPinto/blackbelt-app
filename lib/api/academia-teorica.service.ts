import { isMock } from '@/lib/env';

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

// ── Helper: empty fallback objects ──────────────────────────────────

function emptyModulo(): ModuloTeorico & { licoes: Licao[] } {
  return { id: '', modalidade: '', faixa: '', titulo: '', descricao: '', icone: '', ordem: 0, totalLicoes: 0, licoesCompletadas: 0, certificadoEmitido: false, bloqueado: false, categoria: 'requisitos', licoes: [] };
}

function emptyLicao(): Licao {
  return { id: '', moduloId: '', titulo: '', ordem: 0, tipo: 'texto', conteudo: { blocos: [] }, duracao: '0', concluida: false };
}

function emptyQuizModulo(moduloId: string): QuizModulo {
  return { id: '', moduloId, titulo: '', descricao: '', perguntas: [], totalPerguntas: 0, notaMinima: 0, tentativas: 0, melhorNota: 0, aprovado: false };
}

function emptyResultadoQuiz(): ResultadoQuiz {
  return { nota: 0, aprovado: false, total: 0, acertos: 0, explicacoes: [] };
}

function emptyCertificado(): CertificadoTeorico {
  return { id: '', alunoNome: '', moduloTitulo: '', modalidade: '', faixa: '', nota: 0, emitidoEm: '', academiaNome: '', professorNome: '', qrCodeUrl: '', codigoVerificacao: '' };
}

// ── Módulos ────────────────────────────────────────────────────────

export async function getModulos(modalidade?: string, faixa?: string): Promise<ModuloTeorico[]> {
  try {
    if (isMock()) {
      const { mockGetModulos } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetModulos(modalidade, faixa);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase
      .from('theoretical_modules')
      .select('*')
      .order('ordem', { ascending: true });

    if (modalidade) query = query.eq('modalidade', modalidade);
    if (faixa) query = query.eq('faixa', faixa);

    const { data, error } = await query;
    if (error) {
      console.error('[getModulos] Query failed:', error.message);
      return [];
    }
    return (data ?? []) as unknown as ModuloTeorico[];
  } catch (error) {
    console.error('[getModulos] Fallback:', error);
    return [];
  }
}

export async function getModulo(id: string): Promise<ModuloTeorico & { licoes: Licao[] }> {
  try {
    if (isMock()) {
      const { mockGetModulo } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetModulo(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('theoretical_modules')
      .select('*, theoretical_lessons(*)')
      .eq('id', id)
      .single();
    if (error || !data) {
      console.error('[getModulo] Query failed:', error?.message);
      return emptyModulo();
    }
    const licoes = ((data.theoretical_lessons as unknown[]) ?? []) as unknown as Licao[];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { theoretical_lessons: _lessons, ...modulo } = data;
    return { ...(modulo as unknown as ModuloTeorico), licoes };
  } catch (error) {
    console.error('[getModulo] Fallback:', error);
    return emptyModulo();
  }
}

export async function getLicao(id: string): Promise<Licao> {
  try {
    if (isMock()) {
      const { mockGetLicao } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetLicao(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('theoretical_lessons')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) {
      console.error('[getLicao] Query failed:', error?.message);
      return emptyLicao();
    }
    return data as unknown as Licao;
  } catch (error) {
    console.error('[getLicao] Fallback:', error);
    return emptyLicao();
  }
}

export async function marcarLicaoConcluida(licaoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarcarLicaoConcluida } = await import('@/lib/mocks/academia-teorica.mock');
      return mockMarcarLicaoConcluida(licaoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[marcarLicaoConcluida] No authenticated user');
      return;
    }
    const { error } = await supabase
      .from('theoretical_lesson_progress')
      .upsert({
        lesson_id: licaoId,
        user_id: user.id,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'lesson_id,user_id' });
    if (error) {
      console.error('[marcarLicaoConcluida] Upsert failed:', error.message);
    }
  } catch (error) {
    console.error('[marcarLicaoConcluida] Fallback:', error);
  }
}

export async function getProgressoGeral(): Promise<ProgressoGeral> {
  try {
    if (isMock()) {
      const { mockGetProgressoGeral } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetProgressoGeral();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[getProgressoGeral] No authenticated user');
      return { totalModulos: 0, completados: 0, emProgresso: 0, certificados: 0, percentual: 0 };
    }
    const [modulosRes, certRes] = await Promise.all([
      supabase.from('theoretical_modules').select('id', { count: 'exact' }),
      supabase.from('theoretical_certificates').select('id', { count: 'exact' }).eq('user_id', user.id),
    ]);
    const totalModulos = modulosRes.count ?? 0;
    const certificados = certRes.count ?? 0;
    return {
      totalModulos,
      completados: certificados,
      emProgresso: Math.max(0, totalModulos - certificados),
      certificados,
      percentual: totalModulos > 0 ? Math.round((certificados / totalModulos) * 100) : 0,
    };
  } catch (error) {
    console.error('[getProgressoGeral] Fallback:', error);
    return { totalModulos: 0, completados: 0, emProgresso: 0, certificados: 0, percentual: 0 };
  }
}

// ── Quiz ───────────────────────────────────────────────────────────

export async function getQuiz(moduloId: string): Promise<QuizModulo> {
  try {
    if (isMock()) {
      const { mockGetQuiz } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetQuiz(moduloId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('theoretical_quizzes')
      .select('*')
      .eq('module_id', moduloId)
      .single();
    if (error || !data) {
      console.error('[getQuiz] Query failed:', error?.message);
      return emptyQuizModulo(moduloId);
    }
    return data as unknown as QuizModulo;
  } catch (error) {
    console.error('[getQuiz] Fallback:', error);
    return emptyQuizModulo(moduloId);
  }
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[submeterQuiz] No authenticated user');
      return emptyResultadoQuiz();
    }
    // Get quiz questions to evaluate
    const { data: quiz } = await supabase
      .from('theoretical_quizzes')
      .select('*')
      .eq('module_id', moduloId)
      .single();
    if (!quiz) {
      console.error('[submeterQuiz] Quiz not found for module:', moduloId);
      return emptyResultadoQuiz();
    }
    const perguntas = ((quiz.perguntas ?? quiz.questions) as QuizPergunta[]) || [];
    const total = perguntas.length;
    let acertos = 0;
    const explicacoes: ResultadoQuiz['explicacoes'] = [];
    for (const p of perguntas) {
      const resposta = respostas[p.id];
      const correta = p.opcoes?.find((o) => o.correta)?.texto === resposta;
      if (correta) acertos++;
      explicacoes.push({ perguntaId: p.id, correta: !!correta, explicacao: p.explicacao });
    }
    const nota = total > 0 ? Math.round((acertos / total) * 100) : 0;
    const notaMinima = (quiz.nota_minima as number) ?? 70;
    const aprovado = nota >= notaMinima;
    // Save attempt
    await supabase.from('theoretical_quiz_attempts').insert({
      quiz_id: quiz.id,
      module_id: moduloId,
      user_id: user.id,
      score: nota,
      passed: aprovado,
      answers: respostas,
    });
    return { nota, aprovado, total, acertos, explicacoes };
  } catch (error) {
    console.error('[submeterQuiz] Fallback:', error);
    return emptyResultadoQuiz();
  }
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase
      .from('martial_arts_terms')
      .select('*')
      .order('original', { ascending: true });

    if (modalidade) query = query.eq('modalidade', modalidade);
    if (categoria) query = query.eq('categoria', categoria);
    if (faixaMinima) query = query.eq('faixa_minima', faixaMinima);

    const { data, error } = await query;
    if (error) {
      console.error('[getTermos] Query failed:', error.message);
      return [];
    }
    return (data ?? []) as unknown as TermoArtesMarciais[];
  } catch (error) {
    console.error('[getTermos] Fallback:', error);
    return [];
  }
}

export async function buscarTermo(query: string): Promise<TermoArtesMarciais[]> {
  try {
    if (isMock()) {
      const { mockBuscarTermo } = await import('@/lib/mocks/academia-teorica.mock');
      return mockBuscarTermo(query);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('martial_arts_terms')
      .select('*')
      .or(`original.ilike.%${query}%,traducao.ilike.%${query}%,descricao.ilike.%${query}%`)
      .order('original', { ascending: true });
    if (error) {
      console.error('[buscarTermo] Query failed:', error.message);
      return [];
    }
    return (data ?? []) as unknown as TermoArtesMarciais[];
  } catch (error) {
    console.error('[buscarTermo] Fallback:', error);
    return [];
  }
}

// ── Certificados ───────────────────────────────────────────────────

export async function getCertificados(): Promise<CertificadoTeorico[]> {
  try {
    if (isMock()) {
      const { mockGetCertificados } = await import('@/lib/mocks/academia-teorica.mock');
      return mockGetCertificados();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[getCertificados] No authenticated user');
      return [];
    }
    const { data, error } = await supabase
      .from('theoretical_certificates')
      .select('*')
      .eq('user_id', user.id)
      .order('emitido_em', { ascending: false });
    if (error) {
      console.error('[getCertificados] Query failed:', error.message);
      return [];
    }
    return (data ?? []) as unknown as CertificadoTeorico[];
  } catch (error) {
    console.error('[getCertificados] Fallback:', error);
    return [];
  }
}

export async function emitirCertificado(moduloId: string): Promise<CertificadoTeorico> {
  try {
    if (isMock()) {
      const { mockEmitirCertificado } = await import('@/lib/mocks/academia-teorica.mock');
      return mockEmitirCertificado(moduloId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[emitirCertificado] No authenticated user');
      return emptyCertificado();
    }
    const codigoVerificacao = crypto.randomUUID().slice(0, 8).toUpperCase();
    const { data: row, error } = await supabase
      .from('theoretical_certificates')
      .insert({
        module_id: moduloId,
        user_id: user.id,
        codigo_verificacao: codigoVerificacao,
        emitido_em: new Date().toISOString(),
      })
      .select()
      .single();
    if (error || !row) {
      console.error('[emitirCertificado] Insert failed:', error?.message);
      return emptyCertificado();
    }
    return row as unknown as CertificadoTeorico;
  } catch (error) {
    console.error('[emitirCertificado] Fallback:', error);
    return emptyCertificado();
  }
}

export async function validarCertificado(code: string): Promise<CertificadoTeorico | null> {
  try {
    if (isMock()) {
      const { mockValidarCertificado } = await import('@/lib/mocks/academia-teorica.mock');
      return mockValidarCertificado(code);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('theoretical_certificates')
      .select('*')
      .eq('codigo_verificacao', code)
      .maybeSingle();
    if (error || !data) {
      console.error('[validarCertificado] Not found or error:', error?.message);
      return null;
    }
    return data as unknown as CertificadoTeorico;
  } catch (error) {
    console.error('[validarCertificado] Fallback:', error);
    return null;
  }
}
