import type {
  LessonPlanDTO,
  LessonPlanTemplateDTO,
  ClassNoteDTO,
  CreateLessonPlanPayload,
  SaveClassNotePayload,
} from '@/lib/api/plano-aula.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGetLessonPlans(_classId: string): Promise<LessonPlanDTO[]> {
  await delay();
  return [
    {
      id: 'lp-1',
      class_id: 'class-bjj-noite',
      date: '2026-03-15',
      theme: 'Passagem de Guarda - Toreando',
      warmup: 'Corrida leve 5min, mobilidade articular, shrimping 3x percurso, granby roll 3x percurso',
      technique_1: {
        name: 'Passagem Toreando classica',
        description: 'Grip nos joelhos, controlar quadril, pressionar lateral. Demonstrar 3x, treinar em dupla 5min cada.',
        duration_minutes: 15,
      },
      technique_2: {
        name: 'Variacao com grip no colarinho',
        description: 'Mesmo conceito do toreando, mas com controle do colarinho. Demonstrar transicao para side control.',
        duration_minutes: 15,
      },
      drilling: 'Drilling de passagem toreando em cadeia: 5 repeticoes cada lado, trocar parceiro. 3 rounds de 3min.',
      sparring: 'Sparring posicional: guardeiro vs passador. 3min cada, troca de posicao. 4 rounds.',
      notes: 'Foco em principios de pressao e controle de quadril.',
      professor_name: 'Carlos Silva',
      created_at: '2026-03-14T20:00:00Z',
    },
    {
      id: 'lp-2',
      class_id: 'class-bjj-noite',
      date: '2026-03-13',
      theme: 'Raspagens da Guarda Fechada',
      warmup: 'Pular corda 5min, alongamento dinamico, hip escape drill 3x percurso',
      technique_1: {
        name: 'Raspagem de tesoura (scissor sweep)',
        description: 'Da guarda fechada, quebrar postura, grip na manga e colarinho, perna na cintura, puxar e girar.',
        duration_minutes: 15,
      },
      technique_2: {
        name: 'Raspagem pendulo (pendulum sweep)',
        description: 'Variacao quando adversario base forte. Underhook na perna, balancear e inverter.',
        duration_minutes: 15,
      },
      drilling: 'Drilling combinado: tentar scissor, se defender ir para pendulum. 5 rep cada lado, 3 rounds.',
      sparring: 'Sparring posicional da guarda fechada. Guardeiro tenta raspar, passador tenta passar. 3min cada.',
      notes: 'Alunos intermediarios. Enfatizar timing da raspagem.',
      professor_name: 'Carlos Silva',
      created_at: '2026-03-12T20:00:00Z',
    },
    {
      id: 'lp-3',
      class_id: 'class-bjj-noite',
      date: '2026-03-11',
      theme: 'Defesa de Finalizacoes - Arm Lock',
      warmup: 'Aquecimento geral 5min, ukemi (quedas) 3x cada lado, bridge and roll 3x percurso',
      technique_1: {
        name: 'Defesa do arm lock da montada',
        description: 'Reconhecer o ataque cedo, grip na propria lapela, virar para o cotovelo atacado, escapar quadril.',
        duration_minutes: 15,
      },
      technique_2: {
        name: 'Contra-ataque: inversao para guarda',
        description: 'A partir da defesa, usar o momentum para inverter e recuperar guarda ou ir para cima.',
        duration_minutes: 15,
      },
      drilling: 'Progressivo: parceiro ataca arm lock lentamente, defender e contra-atacar. Aumentar velocidade gradualmente.',
      sparring: 'Sparring: comeca na montada, debaixo defende e tenta escapar. Cima ataca finalizacoes. 3min cada.',
      notes: 'Importante: seguranca primeiro. Bater (tap) sempre que necessario.',
      professor_name: 'Carlos Silva',
      created_at: '2026-03-10T20:00:00Z',
    },
  ];
}

export async function mockCreateLessonPlan(data: CreateLessonPlanPayload): Promise<LessonPlanDTO> {
  await delay();
  return {
    id: `lp-${Date.now()}`,
    class_id: data.class_id,
    date: data.date,
    theme: data.theme,
    warmup: data.warmup,
    technique_1: data.technique_1,
    technique_2: data.technique_2,
    drilling: data.drilling,
    sparring: data.sparring,
    notes: data.notes,
    professor_name: 'Carlos Silva',
    created_at: new Date().toISOString(),
  };
}

export async function mockGetTemplates(): Promise<LessonPlanTemplateDTO[]> {
  await delay();
  return [
    {
      id: 'tpl-1',
      name: 'Aula Padrao BJJ - Tecnica + Drilling',
      theme: '',
      warmup: 'Corrida leve 5min, mobilidade articular, exercicios especificos de solo 3x percurso',
      technique_1: {
        name: '',
        description: 'Demonstrar tecnica 3x. Treinar em dupla 5min cada lado.',
        duration_minutes: 15,
      },
      technique_2: {
        name: '',
        description: 'Variacao ou complemento da tecnica 1. Demonstrar transicoes.',
        duration_minutes: 15,
      },
      drilling: 'Drilling especifico das tecnicas do dia. 5 repeticoes cada lado, 3 rounds de 3min.',
      sparring: 'Sparring posicional focado no tema do dia. 3min cada, 4 rounds.',
      notes: '',
    },
    {
      id: 'tpl-2',
      name: 'Aula de Competicao',
      theme: 'Preparacao Competitiva',
      warmup: 'Aquecimento intenso 10min: corrida, burpees, sprawls. Mobilidade rapida.',
      technique_1: {
        name: '',
        description: 'Revisao de tecnica competitiva com enfase em velocidade e precisao.',
        duration_minutes: 10,
      },
      technique_2: {
        name: '',
        description: 'Combinacao e encadeamento de tecnicas sob pressao.',
        duration_minutes: 10,
      },
      drilling: 'Drilling de alta intensidade. Rounds curtos (2min) com troca rapida de parceiro.',
      sparring: 'Sparring livre com rounds de 5min. Simular ritmo de competicao.',
      notes: 'Incentivar intensidade competitiva. Hidratar bem.',
    },
    {
      id: 'tpl-3',
      name: 'Aula Fundamentos (Iniciantes)',
      theme: 'Fundamentos Basicos',
      warmup: 'Caminhada e corrida leve 5min, exercicios de queda (ukemi), rolamentos basicos',
      technique_1: {
        name: '',
        description: 'Tecnica basica com explicacao detalhada de cada passo. Demonstrar 5x lentamente.',
        duration_minutes: 20,
      },
      technique_2: {
        name: '',
        description: 'Variacao simples da tecnica 1 ou defesa basica correspondente.',
        duration_minutes: 15,
      },
      drilling: 'Drilling leve focado em mecanica do movimento. Sem resistencia. 3 rounds de 3min.',
      sparring: 'Sparring leve e controlado. Foco em posicionamento, nao em finalizacao. 3min cada.',
      notes: 'Paciencia com novatos. Reforcar etiqueta do tatame.',
    },
  ];
}

export async function mockGetClassNotes(_classId: string): Promise<ClassNoteDTO[]> {
  await delay();
  return [
    {
      id: 'note-1',
      class_id: 'class-bjj-noite',
      date: '2026-03-15',
      content: 'Turma engajada hoje. Joao Mendes demonstrou boa evolucao na passagem toreando. Pedro Santos ainda tem dificuldade com o grip, precisa de atencao individual. Maria Oliveira ajudou os mais novos - excelente lideranca.',
      student_highlights: [
        { student_id: 'stu-1', student_name: 'Joao Mendes', note: 'Boa evolucao na passagem' },
        { student_id: 'stu-3', student_name: 'Pedro Santos', note: 'Dificuldade com grips' },
        { student_id: 'stu-2', student_name: 'Maria Oliveira', note: 'Lideranca com novatos' },
      ],
      attendance_count: 12,
      professor_name: 'Carlos Silva',
      created_at: '2026-03-15T21:00:00Z',
    },
    {
      id: 'note-2',
      class_id: 'class-bjj-noite',
      date: '2026-03-13',
      content: 'Aula de raspagens foi bem recebida. Turma com 10 alunos. Lucas Ferreira se destacou no drilling. Rafael Souza precisa melhorar a base na guarda.',
      student_highlights: [
        { student_id: 'stu-5', student_name: 'Lucas Ferreira', note: 'Destaque no drilling' },
        { student_id: 'stu-7', student_name: 'Rafael Souza', note: 'Melhorar base na guarda' },
      ],
      attendance_count: 10,
      professor_name: 'Carlos Silva',
      created_at: '2026-03-13T21:00:00Z',
    },
  ];
}

export async function mockSaveClassNote(data: SaveClassNotePayload): Promise<ClassNoteDTO> {
  await delay();
  const now = new Date().toISOString();
  return {
    id: `note-${Date.now()}`,
    class_id: data.class_id,
    date: data.date,
    content: data.content,
    student_highlights: data.student_highlights,
    attendance_count: data.attendance_count,
    professor_name: 'Carlos Silva',
    created_at: now,
  };
}
