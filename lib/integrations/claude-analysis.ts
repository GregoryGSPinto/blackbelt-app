// BlackBelt v2 — Claude AI Analysis for Prospecting
// Server-only: uses ANTHROPIC_API_KEY via raw fetch (no SDK).

import { getAnthropicKey } from '@/lib/config/api-keys';

// --- Types ---

export interface AcademiaParaAnalise {
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  nota: number;
  totalAvaliacoes: number;
  telefone?: string;
  site?: string;
  reviews: { autor: string; nota: number; texto: string }[];
  horarios: { dia: string; abre: string; fecha: string }[];
  tipos: string[];
}

export interface AnaliseIA {
  modalidades: string[];
  estimativaAlunos: number;
  estimativaFaturamento: number;
  tamanho: 'pequena' | 'media' | 'grande';
  tempoMercado: string;
  sinaisDor: string[];
  sinaisOportunidade: string[];
  pontosFracos: string[];
  sistemaDetectado: string | null;
  score: number;
  scoreBreakdown: {
    tamanho: number;
    dorVisivel: number;
    capacidadePagamento: number;
    acessibilidade: number;
  };
  classificacao: 'quente' | 'morno' | 'frio';
  motivoClassificacao: string;
  abordagem: {
    canalRecomendado: string;
    mensagemWhatsApp: string;
    mensagemInstagram: string;
    mensagemEmail: string;
    scriptPresencial: string;
    melhorHorario: string;
    gancho: string;
    dicaAbordagem: string;
  };
}

// --- Internal helpers ---

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-sonnet-4-20250514';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: { type: string; text?: string }[];
  model: string;
  stop_reason: string | null;
  usage: { input_tokens: number; output_tokens: number };
}

async function callClaude(
  systemPrompt: string,
  messages: AnthropicMessage[],
  maxTokens = 4096,
): Promise<string> {
  const key = getAnthropicKey();

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Anthropic API failed (${res.status}): ${errorText}`);
  }

  const data: AnthropicResponse = await res.json();

  const textBlock = data.content.find((block) => block.type === 'text');
  if (!textBlock?.text) {
    throw new Error('Anthropic API returned no text content');
  }

  return textBlock.text;
}

function buildAnalysisPrompt(): string {
  return `Você é um consultor especialista em vendas B2B para o setor de academias de artes marciais e luta.
Seu objetivo é analisar academias/escolas de luta encontradas no Google Maps e gerar inteligência comercial para a equipe de vendas do BlackBelt, uma plataforma SaaS de gestão para academias.

Para cada academia, você deve:

1. **Identificar modalidades** oferecidas (BJJ, Muay Thai, Boxe, Judô, Karatê, MMA, Wrestling, Taekwondo, etc.)
2. **Estimar tamanho**: pequena (<50 alunos), media (50-150 alunos), grande (>150 alunos) — baseado em avaliações, fotos, horários
3. **Estimar alunos e faturamento** com base no número de avaliações, horários, e localização
4. **Detectar sinais de dor**: reclamações sobre organização, falta de sistema, problemas de agendamento, comunicação ruim, cobranças manuais, falta de app
5. **Detectar oportunidades**: academia em crescimento, boa reputação, muitos alunos, investindo em infraestrutura
6. **Detectar pontos fracos**: site desatualizado ou inexistente, sem redes sociais, poucos horários, nota baixa
7. **Detectar sistema atual** se mencionado em reviews ou site (Wodify, Glofox, Mindbody, Zen Planner, planilha, caderninho, nenhum)
8. **Gerar score de 0-100** com breakdown:
   - tamanho (0-25): academias maiores = mais receita potencial
   - dorVisivel (0-25): mais sinais de dor = mais chances de venda
   - capacidadePagamento (0-25): localização boa + nota alta + muitos alunos = pode pagar
   - acessibilidade (0-25): tem telefone, site, redes sociais = mais fácil contatar
9. **Classificar**: quente (score>=70), morno (40-69), frio (<40)
10. **Gerar abordagem personalizada** para cada canal com mensagens prontas para usar

IMPORTANTE:
- Analise os REVIEWS com atenção — eles revelam problemas reais
- Considere a LOCALIZAÇÃO (bairro nobre = maior ticket médio)
- Responda SEMPRE em JSON válido
- Seja realista nas estimativas, não exagere

Formato de resposta (array JSON, um objeto por academia na mesma ordem recebida):
[
  {
    "modalidades": ["BJJ", "Muay Thai"],
    "estimativaAlunos": 120,
    "estimativaFaturamento": 48000,
    "tamanho": "media",
    "tempoMercado": "5-10 anos",
    "sinaisDor": ["reclamações sobre agendamento", "sem app próprio"],
    "sinaisOportunidade": ["crescendo rápido", "boa reputação"],
    "pontosFracos": ["site desatualizado", "sem Instagram"],
    "sistemaDetectado": null,
    "score": 75,
    "scoreBreakdown": {
      "tamanho": 20,
      "dorVisivel": 20,
      "capacidadePagamento": 18,
      "acessibilidade": 17
    },
    "classificacao": "quente",
    "motivoClassificacao": "Academia de médio porte com sinais claros de dor operacional e capacidade de pagamento",
    "abordagem": {
      "canalRecomendado": "WhatsApp",
      "mensagemWhatsApp": "Oi [Nome], tudo bem? Vi que a [Academia] tem uma excelente reputação...",
      "mensagemInstagram": "Olá! Acompanho o trabalho da [Academia]...",
      "mensagemEmail": "Assunto: Solução de gestão para a [Academia]...",
      "scriptPresencial": "Bom dia! Meu nome é [Vendedor] e...",
      "melhorHorario": "Terça ou quarta, entre 14h e 16h (horário com menos aulas)",
      "gancho": "Vi nos comentários que alguns alunos mencionaram dificuldade com agendamento...",
      "dicaAbordagem": "Mencionar a nota alta no Google como elogio genuíno antes de falar do produto"
    }
  }
]

Responda APENAS com o array JSON, sem texto antes ou depois. Sem markdown code blocks.`;
}

function formatAcademiasForPrompt(academias: AcademiaParaAnalise[]): string {
  return academias
    .map((a, i) => {
      const reviewsText = a.reviews
        .slice(0, 5)
        .map((r) => `  - ${r.autor} (${r.nota}/5): "${r.texto}"`)
        .join('\n');

      const horariosText = a.horarios
        .map((h) => `  ${h.dia}: ${h.abre} - ${h.fecha}`)
        .join('\n');

      return `--- ACADEMIA ${i + 1} ---
Nome: ${a.nome}
Endereço: ${a.endereco}
Bairro: ${a.bairro}
Cidade: ${a.cidade}
Nota Google: ${a.nota}/5 (${a.totalAvaliacoes} avaliações)
Telefone: ${a.telefone ?? 'Não informado'}
Site: ${a.site ?? 'Não informado'}
Tipos: ${a.tipos.join(', ')}

Horários:
${horariosText || '  Não disponível'}

Reviews recentes:
${reviewsText || '  Nenhuma review disponível'}`;
    })
    .join('\n\n');
}

function parseAnalysisResponse(text: string, count: number): AnaliseIA[] {
  // Try to extract JSON from the response
  let jsonStr = text.trim();

  // Remove markdown code blocks if present
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  const parsed: unknown = JSON.parse(jsonStr);

  if (!Array.isArray(parsed)) {
    throw new Error('Expected array response from Claude');
  }

  // Validate and type-cast each entry
  return parsed.slice(0, count).map((item: Record<string, unknown>) => ({
    modalidades: Array.isArray(item.modalidades) ? (item.modalidades as string[]) : [],
    estimativaAlunos: typeof item.estimativaAlunos === 'number' ? item.estimativaAlunos : 0,
    estimativaFaturamento: typeof item.estimativaFaturamento === 'number' ? item.estimativaFaturamento : 0,
    tamanho: validateTamanho(item.tamanho),
    tempoMercado: typeof item.tempoMercado === 'string' ? item.tempoMercado : 'Desconhecido',
    sinaisDor: Array.isArray(item.sinaisDor) ? (item.sinaisDor as string[]) : [],
    sinaisOportunidade: Array.isArray(item.sinaisOportunidade) ? (item.sinaisOportunidade as string[]) : [],
    pontosFracos: Array.isArray(item.pontosFracos) ? (item.pontosFracos as string[]) : [],
    sistemaDetectado: typeof item.sistemaDetectado === 'string' ? item.sistemaDetectado : null,
    score: typeof item.score === 'number' ? item.score : 50,
    scoreBreakdown: validateScoreBreakdown(item.scoreBreakdown),
    classificacao: validateClassificacao(item.classificacao),
    motivoClassificacao: typeof item.motivoClassificacao === 'string' ? item.motivoClassificacao : '',
    abordagem: validateAbordagem(item.abordagem),
  }));
}

function validateTamanho(value: unknown): 'pequena' | 'media' | 'grande' {
  if (value === 'pequena' || value === 'media' || value === 'grande') return value;
  return 'media';
}

function validateClassificacao(value: unknown): 'quente' | 'morno' | 'frio' {
  if (value === 'quente' || value === 'morno' || value === 'frio') return value;
  return 'morno';
}

function validateScoreBreakdown(value: unknown): AnaliseIA['scoreBreakdown'] {
  const defaultBreakdown = { tamanho: 0, dorVisivel: 0, capacidadePagamento: 0, acessibilidade: 0 };
  if (!value || typeof value !== 'object') return defaultBreakdown;

  const obj = value as Record<string, unknown>;
  return {
    tamanho: typeof obj.tamanho === 'number' ? obj.tamanho : 0,
    dorVisivel: typeof obj.dorVisivel === 'number' ? obj.dorVisivel : 0,
    capacidadePagamento: typeof obj.capacidadePagamento === 'number' ? obj.capacidadePagamento : 0,
    acessibilidade: typeof obj.acessibilidade === 'number' ? obj.acessibilidade : 0,
  };
}

function validateAbordagem(value: unknown): AnaliseIA['abordagem'] {
  const defaultAbordagem = {
    canalRecomendado: 'WhatsApp',
    mensagemWhatsApp: '',
    mensagemInstagram: '',
    mensagemEmail: '',
    scriptPresencial: '',
    melhorHorario: '',
    gancho: '',
    dicaAbordagem: '',
  };
  if (!value || typeof value !== 'object') return defaultAbordagem;

  const obj = value as Record<string, unknown>;
  return {
    canalRecomendado: typeof obj.canalRecomendado === 'string' ? obj.canalRecomendado : 'WhatsApp',
    mensagemWhatsApp: typeof obj.mensagemWhatsApp === 'string' ? obj.mensagemWhatsApp : '',
    mensagemInstagram: typeof obj.mensagemInstagram === 'string' ? obj.mensagemInstagram : '',
    mensagemEmail: typeof obj.mensagemEmail === 'string' ? obj.mensagemEmail : '',
    scriptPresencial: typeof obj.scriptPresencial === 'string' ? obj.scriptPresencial : '',
    melhorHorario: typeof obj.melhorHorario === 'string' ? obj.melhorHorario : '',
    gancho: typeof obj.gancho === 'string' ? obj.gancho : '',
    dicaAbordagem: typeof obj.dicaAbordagem === 'string' ? obj.dicaAbordagem : '',
  };
}

// --- Exported Functions ---

/**
 * Analyze multiple academias in a single Claude call for efficiency.
 */
export async function analisarAcademias(academias: AcademiaParaAnalise[]): Promise<AnaliseIA[]> {
  if (academias.length === 0) return [];

  const systemPrompt = buildAnalysisPrompt();
  const userMessage = formatAcademiasForPrompt(academias);

  const responseText = await callClaude(
    systemPrompt,
    [{ role: 'user', content: `Analise as seguintes ${academias.length} academia(s):\n\n${userMessage}` }],
    8192,
  );

  return parseAnalysisResponse(responseText, academias.length);
}

/**
 * Analyze a single academia.
 */
export async function analisarAcademiaIndividual(academia: AcademiaParaAnalise): Promise<AnaliseIA> {
  const results = await analisarAcademias([academia]);
  if (results.length === 0) {
    throw new Error('Claude analysis returned no results');
  }
  return results[0];
}

/**
 * Regenerate a personalized message for a specific channel.
 */
export async function regenerarMensagem(
  academia: AcademiaParaAnalise,
  canal: string,
  contexto?: string,
): Promise<string> {
  const systemPrompt = `Você é um copywriter especialista em vendas B2B para o setor de academias de artes marciais.
Gere uma mensagem personalizada e persuasiva para o canal especificado.
A mensagem deve ser natural, não parecer template, e usar informações específicas da academia.
Responda APENAS com a mensagem, sem explicações ou formatação adicional.`;

  const academiaInfo = `Academia: ${academia.nome}
Endereço: ${academia.endereco}
Bairro: ${academia.bairro}, ${academia.cidade}
Nota Google: ${academia.nota}/5 (${academia.totalAvaliacoes} avaliações)
Telefone: ${academia.telefone ?? 'Não informado'}
Site: ${academia.site ?? 'Não informado'}
Tipos: ${academia.tipos.join(', ')}

Reviews:
${academia.reviews.slice(0, 3).map((r) => `- ${r.autor} (${r.nota}/5): "${r.texto}"`).join('\n')}`;

  const userMessage = `Gere uma nova mensagem para o canal: ${canal}

Informações da academia:
${academiaInfo}
${contexto ? `\nContexto adicional: ${contexto}` : ''}

Responda apenas com a mensagem pronta para enviar.`;

  return callClaude(
    systemPrompt,
    [{ role: 'user', content: userMessage }],
    1024,
  );
}
