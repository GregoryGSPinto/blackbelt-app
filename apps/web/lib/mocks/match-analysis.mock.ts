import type { MatchAnalysis, ManualAnnotation } from '@/lib/api/match-analysis.service';

const delay = () => new Promise((r) => setTimeout(r, 450));

export async function mockAnalyzeMatch(videoId: string): Promise<MatchAnalysis> {
  await delay();
  return {
    id: `analysis-${videoId}`,
    video_id: videoId,
    duration_sec: 360,
    rounds: 1,
    timeline: [
      { id: 'ev-1', event_type: 'takedown', timestamp_sec: 15, athlete: 'student', description: 'Takedown de dupla perna — 2 pontos', points: 2 },
      { id: 'ev-2', event_type: 'pass', timestamp_sec: 42, athlete: 'student', description: 'Passagem de guarda toreando — 3 pontos', points: 3 },
      { id: 'ev-3', event_type: 'escape', timestamp_sec: 68, athlete: 'opponent', description: 'Oponente recupera a guarda com reenquadramento', points: 0 },
      { id: 'ev-4', event_type: 'sweep', timestamp_sec: 95, athlete: 'opponent', description: 'Raspagem de tesoura pelo oponente — 2 pontos', points: 2 },
      { id: 'ev-5', event_type: 'submission_attempt', timestamp_sec: 120, athlete: 'opponent', description: 'Tentativa de kimura do oponente — defendida', points: 0 },
      { id: 'ev-6', event_type: 'stand_up', timestamp_sec: 145, athlete: 'student', description: 'Retorno à posição em pé', points: 0 },
      { id: 'ev-7', event_type: 'takedown', timestamp_sec: 168, athlete: 'student', description: 'Takedown de corpo a corpo — 2 pontos', points: 2 },
      { id: 'ev-8', event_type: 'pass', timestamp_sec: 195, athlete: 'student', description: 'Passagem de guarda de pressão — 3 pontos', points: 3 },
      { id: 'ev-9', event_type: 'mount', timestamp_sec: 220, athlete: 'student', description: 'Montada conquistada — 4 pontos', points: 4 },
      { id: 'ev-10', event_type: 'submission_attempt', timestamp_sec: 245, athlete: 'student', description: 'Tentativa de armlock da montada — oponente defende', points: 0 },
      { id: 'ev-11', event_type: 'escape', timestamp_sec: 260, athlete: 'opponent', description: 'Fuga da montada para meia-guarda', points: 0 },
      { id: 'ev-12', event_type: 'back_take', timestamp_sec: 290, athlete: 'student', description: 'Pegada de costas a partir da meia-guarda — 4 pontos', points: 4 },
      { id: 'ev-13', event_type: 'submission_attempt', timestamp_sec: 315, athlete: 'student', description: 'Tentativa de mata-leão — quase finaliza', points: 0 },
      { id: 'ev-14', event_type: 'penalty', timestamp_sec: 330, athlete: 'opponent', description: 'Penalidade por fuga da área de luta', points: 0 },
      { id: 'ev-15', event_type: 'submission', timestamp_sec: 348, athlete: 'student', description: 'Finalização por mata-leão!', points: 0 },
    ],
    positions: [
      { position: 'Em pé', athlete: 'neutral', time_spent_sec: 65, percentage: 18.1 },
      { position: 'Guarda do oponente', athlete: 'student', time_spent_sec: 78, percentage: 21.7 },
      { position: 'Guarda do aluno', athlete: 'opponent', time_spent_sec: 42, percentage: 11.7 },
      { position: 'Lateral (student)', athlete: 'student', time_spent_sec: 55, percentage: 15.3 },
      { position: 'Montada', athlete: 'student', time_spent_sec: 40, percentage: 11.1 },
      { position: 'Costas (student)', athlete: 'student', time_spent_sec: 58, percentage: 16.1 },
      { position: 'Meia-guarda', athlete: 'neutral', time_spent_sec: 22, percentage: 6.1 },
    ],
    submission_attempts: [
      { id: 'sub-1', technique: 'Kimura', timestamp_sec: 120, athlete: 'opponent', success: false, defense_used: 'Grip fighting e postura' },
      { id: 'sub-2', technique: 'Armlock da montada', timestamp_sec: 245, athlete: 'student', success: false, defense_used: 'Defesa de mão na mão' },
      { id: 'sub-3', technique: 'Mata-leão', timestamp_sec: 315, athlete: 'student', success: false, defense_used: 'Proteção de pescoço com as mãos' },
      { id: 'sub-4', technique: 'Mata-leão', timestamp_sec: 348, athlete: 'student', success: true, defense_used: null },
    ],
    takedowns: [
      { id: 'td-1', technique: 'Dupla perna', timestamp_sec: 15, athlete: 'student', success: true },
      { id: 'td-2', technique: 'Corpo a corpo', timestamp_sec: 168, athlete: 'student', success: true },
    ],
    points_breakdown: {
      student_total: 18,
      opponent_total: 2,
      student_advantages: 3,
      opponent_advantages: 1,
      student_penalties: 0,
      opponent_penalties: 1,
      categories: [
        { category: 'Takedowns', student: 4, opponent: 0 },
        { category: 'Passagens', student: 6, opponent: 0 },
        { category: 'Raspagens', student: 0, opponent: 2 },
        { category: 'Montada', student: 4, opponent: 0 },
        { category: 'Costas', student: 4, opponent: 0 },
      ],
    },
    tactical_summary: 'Luta dominante com controle superior em todas as fases. O aluno demonstrou excelente jogo de takedown (2/2 bem-sucedidos) e transições eficientes de passagem para controle superior. A estratégia de pressão funcionou bem: passagem → lateral → montada → costas → finalização. Ponto fraco identificado: após conquistar a montada, perdeu a posição antes de finalizar o armlock, indicando necessidade de melhorar controle de quadril na montada. A finalização veio com o mata-leão das costas, após insistência e boa leitura tática. O oponente teve um bom momento com a raspagem de tesoura e tentativa de kimura, mas o aluno soube reagir e retomar o controle.',
    improvement_areas: [
      {
        area: 'Controle na Montada',
        description: 'Perdeu a montada após tentativa de armlock. Precisa melhorar base e controle de quadril antes de atacar.',
        priority: 'high',
        suggested_drills: [
          'Drill de manutenção de montada — 3 min cada lado, parceiro tenta fugir',
          'Transição montada → ataque → reposição — ciclo contínuo',
          'Exercício de base: manter montada com olhos fechados',
        ],
      },
      {
        area: 'Defesa de Raspagem',
        description: 'Tomou raspagem de tesoura — indica base alta ou descuido momentâneo na guarda do oponente.',
        priority: 'medium',
        suggested_drills: [
          'Drill de base na guarda fechada — manter postura 3 min',
          'Situacional: oponente tenta raspar, você mantém base',
          'Estudo de vídeo: prevenção de raspagem de tesoura',
        ],
      },
      {
        area: 'Finalização das Costas',
        description: 'Primeira tentativa de mata-leão não finalizou. Trabalhar o ajuste fino da posição antes de apertar.',
        priority: 'medium',
        suggested_drills: [
          'Drill de ajuste de ganchos nas costas — manter controle',
          'Transição de controle de costas → mata-leão — foco no braço que passa',
          'Sparring posicional: começar com as costas, finalizar em 1 min',
        ],
      },
      {
        area: 'Jogo em Pé',
        description: 'Takedowns eficientes, mas pouco tempo investido em luta em pé. Diversificar entradas.',
        priority: 'low',
        suggested_drills: [
          'Treino de wrestling 2x por semana — entradas de single e double leg',
          'Drill de clinch: variações de queda do corpo a corpo',
          'Footwork: movimentação lateral e mudança de nível',
        ],
      },
    ],
    analyzed_at: new Date().toISOString(),
  };
}

export async function mockAddAnnotation(videoId: string, timestampSec: number, text: string): Promise<ManualAnnotation> {
  await delay();
  return {
    id: `ann-${Date.now()}`,
    video_id: videoId,
    timestamp_sec: timestampSec,
    text,
    author_id: 'prof-1',
    created_at: new Date().toISOString(),
  };
}

export async function mockGetAnnotations(_videoId: string): Promise<ManualAnnotation[]> {
  await delay();
  return [
    { id: 'ann-1', video_id: 'video-1', timestamp_sec: 42, text: 'Boa passagem! Observe como ele controla a manga antes de passar.', author_id: 'prof-1', created_at: '2026-03-14T10:30:00Z' },
    { id: 'ann-2', video_id: 'video-1', timestamp_sec: 95, text: 'Aqui perdeu a base. Cotovelo muito longe do corpo.', author_id: 'prof-1', created_at: '2026-03-14T10:31:00Z' },
    { id: 'ann-3', video_id: 'video-1', timestamp_sec: 290, text: 'Excelente transição para as costas! Referência para treinar.', author_id: 'prof-1', created_at: '2026-03-14T10:33:00Z' },
  ];
}

export async function mockShareAnalysis(_videoId: string, _studentId: string): Promise<{ shared: boolean }> {
  await delay();
  return { shared: true };
}
