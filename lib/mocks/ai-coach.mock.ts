import type { PerformanceAnalysis, ClassPlan } from '@/lib/api/ai-coach.service';

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
