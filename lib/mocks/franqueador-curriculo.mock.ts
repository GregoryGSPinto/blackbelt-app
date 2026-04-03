import type { CurriculoRede, CurriculoOverview, TecnicaCurriculo } from '@/lib/api/franqueador-curriculo.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

function tecnica(
  id: string,
  name: string,
  category: TecnicaCurriculo['category'],
  description: string,
  required: boolean,
  video_url: string | null = null,
): TecnicaCurriculo {
  return { id, name, category, description, video_url, required };
}

const CURRICULOS: CurriculoRede[] = [
  {
    id: 'curr-1',
    modality: 'BJJ',
    belt_level: 'branca',
    name: 'Fundamentos - Faixa Branca',
    description: 'Curriculo basico para alunos iniciantes. Foco em posicionamento, defesa e movimentos fundamentais do Jiu-Jitsu.',
    min_classes_required: 60,
    evaluation_criteria: [
      'Demonstrar postura base correta',
      'Executar 3 finalizacoes basicas',
      'Conhecer as posicoes fundamentais',
      'Realizar rolamento completo com parceiro',
    ],
    techniques: [
      tecnica('t-1-1', 'Postura Base', 'fundamento', 'Posicionamento correto dos pes, quadril e maos na guarda fechada e aberta.', true),
      tecnica('t-1-2', 'Fuga de Quadril (Shrimp)', 'fundamento', 'Movimento de fuga lateral usando o quadril para criar espaco.', true),
      tecnica('t-1-3', 'Rolamento para Frente', 'fundamento', 'Rolamento basico para transicao e recuperacao de guarda.', true),
      tecnica('t-1-4', 'Guarda Fechada - Controle', 'fundamento', 'Manter o oponente controlado dentro da guarda fechada.', true),
      tecnica('t-1-5', 'Armlock da Guarda', 'fundamento', 'Finalizacao de braco a partir da guarda fechada.', true),
      tecnica('t-1-6', 'Triangulo da Guarda', 'fundamento', 'Estrangulamento triangular a partir da guarda fechada.', true, 'https://blackbeltv2.vercel.app/videos/bjj/triangulo-guarda'),
      tecnica('t-1-7', 'Raspagem Tesoura', 'fundamento', 'Raspagem basica usando as pernas em tesoura.', false),
      tecnica('t-1-8', 'Defesa de Montada', 'fundamento', 'Tecnicas de fuga quando o oponente esta montado.', true),
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2025-11-20T14:30:00Z',
  },
  {
    id: 'curr-2',
    modality: 'BJJ',
    belt_level: 'branca-4graus',
    name: 'Avancado - Faixa Branca 4 Graus',
    description: 'Curriculo avancado para faixas brancas prontos para a transicao. Introducao a guarda aberta e passagens.',
    min_classes_required: 40,
    evaluation_criteria: [
      'Demonstrar 2 passagens de guarda diferentes',
      'Executar transicoes entre posicoes dominantes',
      'Aplicar finalizacoes de costas',
      'Demonstrar defesa contra passagem de guarda',
    ],
    techniques: [
      tecnica('t-2-1', 'Passagem de Guarda Toreando', 'fundamento', 'Passagem classica controlando os joelhos do oponente.', true),
      tecnica('t-2-2', 'Passagem de Guarda Pressao', 'fundamento', 'Passagem usando pressao de ombro sobre o quadril.', true),
      tecnica('t-2-3', 'Pegada de Costas', 'avancado', 'Transicao para controle de costas a partir de diversas posicoes.', true),
      tecnica('t-2-4', 'Mata-Leao (RNC)', 'avancado', 'Estrangulamento pelas costas - rear naked choke.', true, 'https://blackbeltv2.vercel.app/videos/bjj/mata-leao'),
      tecnica('t-2-5', 'Kimura da Meia-Guarda', 'avancado', 'Finalizacao de ombro a partir da meia-guarda superior.', false),
      tecnica('t-2-6', 'Raspagem de Meia-Guarda', 'fundamento', 'Raspagem basica usando underhook na meia-guarda.', true),
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2025-12-05T09:00:00Z',
  },
  {
    id: 'curr-3',
    modality: 'BJJ',
    belt_level: 'azul',
    name: 'Curriculo - Faixa Azul',
    description: 'Nivel intermediario com foco em guarda aberta, jogo de pernas e estrategia competitiva.',
    min_classes_required: 120,
    evaluation_criteria: [
      'Demonstrar jogo de guarda aberta completo',
      'Executar 3 raspagens de guarda aberta',
      'Aplicar finalizacoes de pernas (permitidas)',
      'Demonstrar estrategia de competicao com pontos',
      'Encadear ataques em sequencia',
    ],
    techniques: [
      tecnica('t-3-1', 'De La Riva Guard', 'avancado', 'Guarda aberta usando gancho de De La Riva para controle e raspagem.', true),
      tecnica('t-3-2', 'Spider Guard', 'avancado', 'Guarda aberta com controle de mangas e pes nos biceps.', true, 'https://blackbeltv2.vercel.app/videos/bjj/spider-guard'),
      tecnica('t-3-3', 'X-Guard Sweep', 'avancado', 'Raspagem a partir da X-Guard levantando o oponente.', true),
      tecnica('t-3-4', 'Berimbolo', 'competicao', 'Inversao para pegada de costas a partir da De La Riva.', false, 'https://blackbeltv2.vercel.app/videos/bjj/berimbolo'),
      tecnica('t-3-5', 'Reta de Pe (Straight Ankle Lock)', 'competicao', 'Finalizacao de tornozelo permitida para faixas azuis.', true),
      tecnica('t-3-6', 'Guilhotina', 'avancado', 'Estrangulamento frontal com controle de cabeca.', true),
      tecnica('t-3-7', 'Loop Choke', 'avancado', 'Estrangulamento usando a lapela durante passagem de guarda.', false),
      tecnica('t-3-8', 'Defesa de Leg Lock', 'defesa_pessoal', 'Tecnicas de defesa e escape contra ataques de perna.', true),
    ],
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2026-01-10T16:00:00Z',
  },
  {
    id: 'curr-4',
    modality: 'BJJ',
    belt_level: 'azul-4graus',
    name: 'Avancado - Faixa Azul 4 Graus',
    description: 'Preparacao para faixa roxa. Jogo completo, defesa pessoal e capacidade de ensinar fundamentos.',
    min_classes_required: 80,
    evaluation_criteria: [
      'Demonstrar jogo completo em pe e no chao',
      'Executar sequencias de ataque encadeadas',
      'Aplicar tecnicas de defesa pessoal',
      'Capacidade de explicar fundamentos para iniciantes',
      'Demonstrar controle posicional avancado',
    ],
    techniques: [
      tecnica('t-4-1', 'Queda Osoto Gari', 'competicao', 'Queda classica do Judo aplicada no contexto do BJJ.', true),
      tecnica('t-4-2', 'Arm Drag para Costas', 'avancado', 'Puxada de braco para transicionar diretamente para as costas.', true, 'https://blackbeltv2.vercel.app/videos/bjj/arm-drag'),
      tecnica('t-4-3', 'Worm Guard', 'avancado', 'Guarda moderna usando a lapela enrolada na perna.', false),
      tecnica('t-4-4', 'Defesa contra Faca', 'defesa_pessoal', 'Tecnica de desarme e controle contra ataque com faca.', true),
      tecnica('t-4-5', 'Defesa contra Soco em Pe', 'defesa_pessoal', 'Clinch e queda a partir de agressao em pe.', true),
      tecnica('t-4-6', 'Montada Tecnica - Transicoes', 'avancado', 'Transicoes fluidas entre montada, S-mount e armlock.', true),
      tecnica('t-4-7', 'Calf Slicer', 'competicao', 'Finalizacao de panturrilha a partir do truck ou meia-guarda.', false),
    ],
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2026-02-18T11:30:00Z',
  },
];

export async function mockGetCurriculos(_franchiseId: string): Promise<CurriculoRede[]> {
  await delay();
  return CURRICULOS;
}

export async function mockGetCurriculoOverview(_franchiseId: string): Promise<CurriculoOverview> {
  await delay();
  const modalities = [...new Set(CURRICULOS.map((c) => c.modality))];
  const totalTechniques = CURRICULOS.reduce((s, c) => s + c.techniques.length, 0);
  return {
    modalities,
    total_curriculos: CURRICULOS.length,
    total_techniques: totalTechniques,
  };
}

export async function mockGetCurriculoDetail(curriculoId: string): Promise<CurriculoRede> {
  await delay();
  const curriculo = CURRICULOS.find((c) => c.id === curriculoId);
  if (!curriculo) throw new Error(`Curriculo ${curriculoId} nao encontrado`);
  return curriculo;
}
