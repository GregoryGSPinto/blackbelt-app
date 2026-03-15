import type {
  PerformanceAnalysis,
  ClassPlan,
  GeneratedTrainingPlan,
  PlanAdjustment,
  GeneratedPeriodization,
  WeeklyCheckInResult,
} from '@/lib/api/ai-coach.service';

const delay = () => new Promise((r) => setTimeout(r, 500));

export async function mockGetTrainingSuggestion(_studentId: string): Promise<string> {
  await delay();
  return 'Baseado na sua frequência de 3x/semana e avaliação de técnica 82/100, sugiro focar em exercícios de passagem de guarda esta semana. Sua defesa está boa, mas a parte ofensiva pode melhorar com drills específicos de pressão e timing.';
}

export async function mockAnalyzePerformance(_studentId: string): Promise<PerformanceAnalysis> {
  await delay();
  return {
    summary: 'Evolução positiva nos últimos 3 meses. Frequência acima da média da turma. Técnica em crescimento constante.',
    strengths: ['Frequência consistente (3x/semana)', 'Técnica de guarda acima da média', 'Boa atitude em treino'],
    improvements: ['Disciplina pode melhorar (nota 68)', 'Condicionamento para sparring mais longo', 'Variar mais as finalizações'],
    recommendation: 'Participe do desafio semanal de presença e assista os vídeos sobre finalizações da série Fundamentos.',
  };
}

export async function mockGenerateClassPlan(_professorId: string, _classId: string): Promise<ClassPlan> {
  await delay();
  return {
    warmup: '10min: polichinelo, corrida leve, mobilidade de quadril, rolamentos.',
    technique: 'Passagem de guarda toreando — detalhe de grip, postura e timing. 3 variações progressivas.',
    drills: [
      'Drill 1: Passagem toreando com parceiro — 3min cada lado',
      'Drill 2: Guard retention vs passagem — 2min cada lado',
      'Drill 3: Situacional da posição — começar na guarda aberta',
    ],
    sparring: '3 rounds de 5min. Foco: iniciar da guarda aberta.',
    cooldown: '5min: alongamento de quadril, isquiotibiais e lombar.',
  };
}

export async function mockAnswerQuestion(_studentId: string, question: string): Promise<string> {
  await delay();
  const responses: Record<string, string> = {
    default: 'Ótima pergunta! No jiu-jitsu, a chave é treinar com consistência e foco. Sugiro conversar com seu professor sobre pontos específicos de melhoria e assistir os vídeos na seção de conteúdo.',
  };

  if (question.toLowerCase().includes('guarda')) {
    return 'Para melhorar sua guarda, foque em 3 pilares: 1) Controle de distância com os pés no quadril, 2) Grip fighting — controle as mangas antes que o oponente gripe, 3) Mobilidade de quadril para reenquadrar. Pratique o drill de retenção de guarda por 5min no começo de cada treino.';
  }
  if (question.toLowerCase().includes('faixa') || question.toLowerCase().includes('graduação')) {
    return 'A promoção de faixa depende de vários fatores: frequência mínima, avaliação técnica, tempo na faixa atual e maturidade no tatame. Continue treinando com regularidade e foque nas áreas que seu professor indicou para melhoria.';
  }
  return responses.default;
}

export async function mockGenerateTrainingPlan(_studentId: string, goal: string, weeks: number): Promise<GeneratedTrainingPlan> {
  await delay();
  const weekThemes = [
    'Adaptação e fundamentos',
    'Guarda fechada ofensiva',
    'Passagem de guarda',
    'Controle lateral e montada',
    'Finalizações e transições',
    'Takedowns e clinch',
    'Situacional competitivo',
    'Polimento e simulação',
  ];

  return {
    name: `Plano IA: ${goal}`,
    goal,
    duration_weeks: weeks,
    weeks: Array.from({ length: Math.min(weeks, 8) }, (_, i) => ({
      week_number: i + 1,
      theme: weekThemes[i % weekThemes.length],
      sessions: [
        {
          day_of_week: 1,
          label: 'Segunda — Técnica',
          exercises: [
            { name: 'Aquecimento funcional BJJ', duration_min: 10 },
            { name: 'Técnica principal com progressão', sets: 3, reps: '5 cada lado', notes: 'Foco na precisão' },
            { name: 'Drill posicional', duration_min: 15 },
            { name: 'Sparring temático', duration_min: 20, notes: 'Começar da posição trabalhada' },
          ],
        },
        {
          day_of_week: 3,
          label: 'Quarta — Condicionamento',
          exercises: [
            { name: 'Circuito funcional', sets: 4, reps: '40s/20s', notes: 'Sprawl, burpee, animal flow' },
            { name: 'Grip training na barra', sets: 4, reps: '30 segundos' },
            { name: 'Drill de velocidade', duration_min: 10 },
            { name: 'Sparring livre', duration_min: 25, notes: '5 rounds de 5min' },
          ],
        },
        {
          day_of_week: 5,
          label: 'Sexta — Competição',
          exercises: [
            { name: 'Solo drills aquecimento', duration_min: 10 },
            { name: 'Simulação de luta com regras', duration_min: 6, sets: 4 },
            { name: 'Revisão de vídeo com professor', duration_min: 15 },
            { name: 'Recuperação ativa', duration_min: 10 },
          ],
        },
      ],
    })),
    reasoning: `Plano gerado pela IA com base no objetivo "${goal}". Estruturado em ${weeks} semanas com progressão de intensidade. Cada semana tem 3 sessões (técnica, condicionamento, competição) para equilibrar desenvolvimento técnico e físico. Ajuste conforme feedback do aluno.`,
  };
}

export async function mockAdjustPlan(_planId: string, feedback: string): Promise<PlanAdjustment> {
  await delay();
  return {
    changes: [
      { week: 3, description: 'Reduzi volume de sparring baseado no feedback de cansaço excessivo' },
      { week: 4, description: 'Adicionei mais drills de recuperação e mobilidade' },
      { week: 5, description: 'Aumentei tempo de técnica e reduzi condicionamento pesado' },
    ],
    reasoning: `Ajustes realizados com base no feedback: "${feedback}". A IA identificou sinais de overtraining e rebalanceou a carga para priorizar recuperação sem perder progressão técnica.`,
    updated_plan_id: _planId,
  };
}

export async function mockGeneratePeriodization(_studentId: string, competitionDate: string): Promise<GeneratedPeriodization> {
  await delay();
  return {
    competition_name: 'Competição',
    competition_date: competitionDate,
    phases: [
      { name: 'base', weeks: 5, intensity: 4, volume: 8, focus: ['Condicionamento aeróbico', 'Base técnica', 'Mobilidade', 'Hábito de treino'] },
      { name: 'build', weeks: 5, intensity: 7, volume: 7, focus: ['Jogo ofensivo', 'Passagem sob pressão', 'Takedowns', 'Sparring intenso'] },
      { name: 'peak', weeks: 3, intensity: 9, volume: 5, focus: ['Simulação de competição', 'Estratégia', 'Rounds com regra', 'Explosão'] },
      { name: 'taper', weeks: 2, intensity: 4, volume: 3, focus: ['Técnica leve', 'Recuperação', 'Mentalização', 'Controle de peso'] },
      { name: 'recovery', weeks: 1, intensity: 2, volume: 2, focus: ['Descanso ativo', 'Avaliação', 'Planejamento próximo ciclo'] },
    ],
    reasoning: `Periodização de 16 semanas gerada pela IA para competição em ${new Date(competitionDate).toLocaleDateString('pt-BR')}. Modelo clássico linear com fases de base, construção, pico, polimento e recuperação. Intensidade cresce gradualmente até o pico (3 semanas antes) e reduz no taper para chegar descansado na competição.`,
  };
}

export async function mockWeeklyCheckIn(_planId: string): Promise<WeeklyCheckInResult> {
  await delay();
  return {
    summary: 'Semana 3 concluída com 72% de aderência. Você completou 11 de 15 exercícios planejados. Desempenho acima da média para esta fase do plano.',
    adherence_pct: 72,
    highlights: [
      'Completou todas as sessões de técnica (100%)',
      'Sparring: 4 de 5 rounds realizados',
      'Condicionamento: melhora de 15% no circuito funcional',
    ],
    adjustments: [
      'Considere adicionar 5min de mobilidade pós-treino — seu feedback indicou rigidez no quadril',
      'Aumente gradualmente o tempo de sparring para 6min na próxima semana',
    ],
    motivation: 'Você está no caminho certo! Manter 70%+ de aderência nas primeiras semanas é um ótimo sinal. Lembre-se: consistência supera intensidade. Vamos juntos para a semana 4!',
  };
}
