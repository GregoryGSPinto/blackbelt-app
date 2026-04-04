import type { PersonalContext, AIResponse, DailyBriefing, WeeklyPlan, ChatMessage } from '@/lib/api/personal-ai.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

export async function mockGetPersonalContext(_studentId: string): Promise<PersonalContext> {
  await delay();
  return {
    student_id: 'student-1',
    name: 'Lucas Silva',
    belt: 'azul',
    stripes: 3,
    academy: 'Team Kime Centro',
    frequency_weekly: 4,
    last_class_date: '2026-03-14',
    next_class_date: '2026-03-16',
    next_class_name: 'Turma Avançada - Guarda',
    current_weight_kg: 78.5,
    target_weight_kg: 76.0,
    upcoming_competition: {
      name: 'Copa Regional de Jiu-Jitsu',
      date: '2026-04-12',
      category: 'Adulto Azul Meio-Pesado',
    },
    strengths: ['Guarda fechada', 'Triângulo', 'Raspagem de gancho'],
    weaknesses: ['Passagem de guarda', 'Jogo por cima', 'Takedowns'],
    goals: ['Medalha na Copa Regional', 'Promoção para faixa roxa até dezembro'],
    xp_total: 4250,
    xp_rank: 12,
    streak_days: 8,
  };
}

export async function mockChat(_studentId: string, message: string, _history: ChatMessage[]): Promise<AIResponse> {
  await delay();
  const lower = message.toLowerCase();

  if (lower.includes('plano') || lower.includes('semana')) {
    return {
      message: 'Baseado no seu perfil, sugiro 4 treinos esta semana: segunda e quarta focando passagem de guarda (seu ponto fraco), terça no jogo de baixo (seu forte), e sexta sparring livre para simular competição. Lembre-se da Copa Regional em 28 dias!',
      context_used: ['frequência semanal', 'pontos fracos', 'competição próxima'],
      suggested_actions: [
        { label: 'Ver plano semanal', action: 'weekly-plan' },
        { label: 'Dicas de passagem', action: 'technique-tips' },
      ],
    };
  }

  if (lower.includes('aula') || lower.includes('próxim')) {
    return {
      message: 'Sua próxima aula é a Turma Avançada - Guarda, segunda-feira às 19:30 com Professor Marcos. Como você tem focado em guarda fechada, aproveite para treinar variações de triângulo e armlock do fechado. Chegue 10 min antes para aquecer o quadril!',
      context_used: ['próxima aula', 'pontos fortes', 'histórico de técnicas'],
      suggested_actions: [
        { label: 'Vídeos de triângulo', action: 'videos-triangle' },
        { label: 'Check-in antecipado', action: 'early-checkin' },
      ],
    };
  }

  if (lower.includes('técnica') || lower.includes('dica')) {
    return {
      message: 'Dica do dia: No triângulo do fechado, foque em cortar o ângulo antes de fechar as pernas. Muitos azuis cometem o erro de apertar sem ângulo, perdendo a finalização. Pratique o drill de cortar ângulo 5x de cada lado no aquecimento. Seu triângulo já é bom — com esse ajuste, vai ficar mortal!',
      context_used: ['faixa azul', 'pontos fortes', 'nível técnico'],
      suggested_actions: [
        { label: 'Ver vídeo do drill', action: 'drill-video' },
        { label: 'Mais dicas', action: 'more-tips' },
      ],
    };
  }

  if (lower.includes('peso') || lower.includes('dieta')) {
    return {
      message: 'Você está com 78.5kg, faltam 2.5kg para bater o peso da categoria (76kg) na Copa Regional. Em 28 dias é totalmente viável com ajustes leves: reduza carboidrato no jantar, aumente hidratação para 3L/dia, e faça 2 sessões de cardio leve por semana. Sem corte drástico!',
      context_used: ['peso atual', 'peso alvo', 'competição próxima'],
      suggested_actions: [
        { label: 'Plano nutricional', action: 'nutrition-plan' },
        { label: 'Registrar peso', action: 'log-weight' },
      ],
    };
  }

  return {
    message: 'Boa pergunta, Lucas! Como faixa azul 3 graus na Team Kime, você está em um momento importante da sua evolução. Mantenha a consistência nos treinos (você está com 8 dias de sequência, parabéns!) e foque nos seus objetivos para a Copa Regional. Posso te ajudar com plano de treino, dicas técnicas, controle de peso ou qualquer dúvida sobre sua preparação!',
    context_used: ['perfil geral', 'streak', 'objetivos'],
    suggested_actions: [
      { label: 'Meu plano semanal', action: 'weekly-plan' },
      { label: 'Dica de técnica', action: 'technique-tips' },
      { label: 'Controle de peso', action: 'weight-check' },
    ],
  };
}

export async function mockGetDailyBriefing(_studentId: string): Promise<DailyBriefing> {
  await delay();
  return {
    greeting: 'Bom dia, Lucas! Domingo é dia de descanso ativo. Seu corpo agradece a recuperação.',
    todays_class: {
      name: 'Open Mat Dominical',
      time: '10:00',
      professor: 'Professor Marcos',
    },
    focus_suggestion: 'Hoje no Open Mat, foque em posições que você menos domina: passagem de guarda e jogo por cima. Use os rounds para experimentar sem pressão de resultado.',
    competition_countdown: {
      name: 'Copa Regional de Jiu-Jitsu',
      days_remaining: 28,
    },
    weight_check: {
      current: 78.5,
      target: 76.0,
      diff: 2.5,
    },
    motivational_quote: '"O tatame não mente. Cada treino é um passo mais perto do seu objetivo." — Rickson Gracie',
    streak_info: '8 dias consecutivos treinando! Mantenha o ritmo, campeão.',
  };
}

export async function mockGetWeeklyPlan(_studentId: string): Promise<WeeklyPlan> {
  await delay();
  return {
    week_start: '2026-03-16',
    week_end: '2026-03-22',
    summary: 'Semana de preparação competitiva — foco em pontos fracos e simulação de luta. 4 treinos planejados com intensidade moderada-alta.',
    days: [
      {
        day_of_week: 1,
        date: '2026-03-16',
        label: 'Segunda-feira',
        has_class: true,
        class_name: 'Turma Avançada - Guarda',
        class_time: '19:30',
        focus: 'Passagem de guarda toreando e de pressão',
        tips: ['Chegue 10 min antes para aquecer quadril', 'Foque em manter pressão na passagem'],
      },
      {
        day_of_week: 2,
        date: '2026-03-17',
        label: 'Terça-feira',
        has_class: true,
        class_name: 'Turma Avançada - Livre',
        class_time: '19:30',
        focus: 'Jogo de baixo — triângulo e armlock do fechado',
        tips: ['Pratique corte de ângulo no triângulo', 'Alterne entre ataques do fechado'],
      },
      {
        day_of_week: 3,
        date: '2026-03-18',
        label: 'Quarta-feira',
        has_class: true,
        class_name: 'Condicionamento Específico',
        class_time: '18:00',
        focus: 'Cardio específico para luta + core',
        tips: ['Simule rounds de 6 min no circuito', 'Hidrate bem durante o treino'],
      },
      {
        day_of_week: 4,
        date: '2026-03-19',
        label: 'Quinta-feira',
        has_class: false,
        class_name: null,
        class_time: null,
        focus: 'Descanso ativo — mobilidade e recuperação',
        tips: ['20 min de alongamento', 'Rolo de espuma em quadril e costas'],
      },
      {
        day_of_week: 5,
        date: '2026-03-20',
        label: 'Sexta-feira',
        has_class: true,
        class_name: 'Sparring Competitivo',
        class_time: '19:30',
        focus: 'Simulação de luta com regras de competição',
        tips: ['Faça 4 rounds de 6 min', 'Treine entradas de takedown no início'],
      },
      {
        day_of_week: 6,
        date: '2026-03-21',
        label: 'Sábado',
        has_class: false,
        class_name: null,
        class_time: null,
        focus: 'Cardio leve — corrida ou bike 30 min',
        tips: ['Mantenha FC entre 130-150', 'Ajuda no controle de peso'],
      },
      {
        day_of_week: 0,
        date: '2026-03-22',
        label: 'Domingo',
        has_class: false,
        class_name: null,
        class_time: null,
        focus: 'Descanso completo',
        tips: ['Durma bem', 'Visualize as técnicas trabalhadas na semana'],
      },
    ],
    weekly_goal: 'Completar pelo menos 10 passagens de guarda bem-sucedidas no sparring esta semana.',
    nutrition_tip: 'Reduza carboidratos no jantar e aumente proteína para auxiliar na recuperação muscular e controle de peso. Beba no mínimo 3L de água por dia.',
    recovery_tip: 'Use o rolo de espuma por 10 min após cada treino. Foque em quadril, lombar e panturrilha — áreas que mais sofrem no jiu-jitsu.',
  };
}
