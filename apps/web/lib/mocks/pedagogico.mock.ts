import type {
  PedagogicoDashboardDTO,
  AnaliseProfessor,
  CurriculoAcademia,
  ReuniaoPedagogica,
  Ocorrencia,
  RelatorioPedagogicoMensal,
} from '@/lib/api/pedagogico.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

// ── Dashboard Mock ─────────────────────────────────────────────────

const MOCK_DASHBOARD: PedagogicoDashboardDTO = {
  resumo: {
    totalAlunos: 21,
    totalProfessores: 2,
    totalTurmas: 8,
    mediaPresencaGeral: 74,
    mediaEvolucaoGeral: 6.8,
    alunosEvoluidosMes: 3,
    alunosEstagnadosMes: 2,
    graduacoesRealizadasMes: 0,
    graduacoesProntas: 1,
  },
  saudeTurmas: [
    {
      turmaId: 'turma-comp-01',
      turmaNome: 'BJJ Competição',
      professorNome: 'André Nakamura',
      modalidade: 'BJJ',
      alunos: 6,
      presencaMedia: 88,
      evolucaoMedia: 8.2,
      tendencia: 'subindo',
      alertas: [],
      score: 90,
    },
    {
      turmaId: 'turma-inic-01',
      turmaNome: 'BJJ Iniciante',
      professorNome: 'André Nakamura',
      modalidade: 'BJJ',
      alunos: 4,
      presencaMedia: 78,
      evolucaoMedia: 7.0,
      tendencia: 'subindo',
      alertas: [],
      score: 85,
    },
    {
      turmaId: 'turma-mma-01',
      turmaNome: 'MMA',
      professorNome: 'Fernanda Costa',
      modalidade: 'MMA',
      alunos: 3,
      presencaMedia: 80,
      evolucaoMedia: 7.5,
      tendencia: 'subindo',
      alertas: [],
      score: 82,
    },
    {
      turmaId: 'turma-mt-01',
      turmaNome: 'Muay Thai',
      professorNome: 'Fernanda Costa',
      modalidade: 'Muay Thai',
      alunos: 4,
      presencaMedia: 75,
      evolucaoMedia: 7.0,
      tendencia: 'subindo',
      alertas: [],
      score: 80,
    },
    {
      turmaId: 'turma-teen-01',
      turmaNome: 'BJJ Teen',
      professorNome: 'André Nakamura',
      modalidade: 'BJJ',
      alunos: 3,
      presencaMedia: 72,
      evolucaoMedia: 6.5,
      tendencia: 'estavel',
      alertas: [],
      score: 78,
    },
    {
      turmaId: 'turma-avanc-01',
      turmaNome: 'BJJ Avançado',
      professorNome: 'André Nakamura',
      modalidade: 'BJJ',
      alunos: 2,
      presencaMedia: 68,
      evolucaoMedia: 6.0,
      tendencia: 'estavel',
      alertas: [],
      score: 72,
    },
    {
      turmaId: 'turma-nogi-01',
      turmaNome: 'No-Gi',
      professorNome: 'André Nakamura',
      modalidade: 'BJJ No-Gi',
      alunos: 2,
      presencaMedia: 65,
      evolucaoMedia: 5.8,
      tendencia: 'estavel',
      alertas: [],
      score: 70,
    },
    {
      turmaId: 'turma-judo-kids-01',
      turmaNome: 'Judô Kids',
      professorNome: 'Fernanda Costa',
      modalidade: 'Judô',
      alunos: 3,
      presencaMedia: 60,
      evolucaoMedia: 5.0,
      tendencia: 'caindo',
      alertas: ['3 crianças faltando muito nas últimas semanas'],
      score: 65,
    },
  ],
  rankingProfessores: [
    {
      professorId: 'prof-andre-01',
      professorNome: 'André Nakamura',
      faixa: 'Preta 2º grau',
      turmas: 5,
      alunosTotal: 14,
      presencaMediaTurmas: 74,
      evolucaoMediaAlunos: 6.7,
      avaliacoesFeitas: 45,
      avaliacoesPendentes: 3,
      planosAulaEscritos: 12,
      videosSobidos: 8,
      duvidaRespondidas: 22,
      duvidaPendentes: 1,
      ultimaAvaliacao: '2026-03-15T10:00:00Z',
      ultimoPlanoAula: '2026-03-14T08:30:00Z',
      score: 82,
      alertas: ['3 alunos estagnados há mais de 3 meses'],
    },
    {
      professorId: 'prof-fernanda-01',
      professorNome: 'Fernanda Costa',
      faixa: 'Preta 1º grau',
      turmas: 3,
      alunosTotal: 10,
      presencaMediaTurmas: 72,
      evolucaoMediaAlunos: 6.5,
      avaliacoesFeitas: 28,
      avaliacoesPendentes: 5,
      planosAulaEscritos: 8,
      videosSobidos: 4,
      duvidaRespondidas: 15,
      duvidaPendentes: 3,
      ultimaAvaliacao: '2026-03-12T14:00:00Z',
      ultimoPlanoAula: '2026-03-10T09:00:00Z',
      score: 75,
      alertas: ['Judô Kids com presença abaixo de 60%'],
    },
  ],
  alunosAtencao: [
    {
      alunoId: 'aluno-marcos-01',
      alunoNome: 'Marcos Vieira',
      faixa: 'Azul',
      turma: 'BJJ Avançado',
      professor: 'André Nakamura',
      motivo: 'Estagnado há 4 meses sem evolução técnica',
      tipo: 'estagnado',
      urgencia: 'alta',
      acaoSugerida: 'Reunião individual para definir plano de evolução e metas de curto prazo',
    },
    {
      alunoId: 'aluno-matheus-01',
      alunoNome: 'Matheus Rodrigues',
      faixa: 'Branca 4 graus',
      turma: 'BJJ Iniciante',
      professor: 'André Nakamura',
      motivo: 'Presença de apenas 40% no último mês',
      tipo: 'ausente',
      urgencia: 'alta',
      acaoSugerida: 'Entrar em contato para entender motivo das faltas e oferecer horários alternativos',
    },
    {
      alunoId: 'aluno-gabriel-01',
      alunoNome: 'Gabriel Santos',
      faixa: 'Branca',
      turma: 'Judô Kids',
      professor: 'Fernanda Costa',
      motivo: 'Sem avaliação técnica há 4 meses',
      tipo: 'nao_avaliado',
      urgencia: 'media',
      acaoSugerida: 'Agendar avaliação técnica e conversar com responsáveis sobre progresso',
    },
    {
      alunoId: 'aluno-valentina-01',
      alunoNome: 'Valentina Almeida',
      faixa: 'Cinza',
      turma: 'BJJ Teen',
      professor: 'André Nakamura',
      motivo: 'Nota de evolução caiu de 7.5 para 5.2 nos últimos 2 meses',
      tipo: 'regressao',
      urgencia: 'media',
      acaoSugerida: 'Investigar causa da regressão — possível desmotivação ou dificuldade específica',
    },
    {
      alunoId: 'aluno-lucas-01',
      alunoNome: 'Lucas Ferreira',
      faixa: 'Cinza',
      turma: 'BJJ Teen',
      professor: 'André Nakamura',
      motivo: 'Tempo na faixa atual: 14 meses (média da academia: 8 meses)',
      tipo: 'tempo_faixa',
      urgencia: 'baixa',
      acaoSugerida: 'Avaliar se está pronto para graduação ou se precisa de reforço em técnicas específicas',
    },
  ],
  timeline: [
    {
      data: '2026-03-18T09:00:00Z',
      tipo: 'alerta',
      descricao: 'Judô Kids: 3 crianças com mais de 3 faltas consecutivas',
    },
    {
      data: '2026-03-17T16:30:00Z',
      tipo: 'avaliacao',
      descricao: 'André Nakamura avaliou 4 alunos da turma BJJ Competição',
    },
    {
      data: '2026-03-15T10:00:00Z',
      tipo: 'plano_aula',
      descricao: 'André Nakamura criou plano de aula: "Passagem de guarda — semana 12"',
    },
    {
      data: '2026-03-14T14:00:00Z',
      tipo: 'reuniao',
      descricao: 'Reunião pedagógica mensal realizada — 2 participantes',
    },
    {
      data: '2026-03-12T11:00:00Z',
      tipo: 'graduacao',
      descricao: 'Pedro Almeida aprovado para graduação: Azul → Roxa',
    },
    {
      data: '2026-03-10T08:00:00Z',
      tipo: 'ocorrencia',
      descricao: 'Ocorrência positiva registrada: Gabriel Santos — destaque em sparring',
    },
  ],
};

// ── Análise de Professores ─────────────────────────────────────────

const MOCK_ANALISE_ANDRE: AnaliseProfessor = {
  professorId: 'prof-andre-01',
  professorNome: 'André Nakamura',
  faixa: 'Preta 2º grau',
  metricas: {
    presencaMedia: 74,
    evolucaoMedia: 6.7,
    retencao: 92,
    avaliacoesMes: 12,
    planosAulaMes: 4,
    frequenciaAvaliacao: 40,
  },
  evolucaoAlunos: [
    { alunoId: 'aluno-01', alunoNome: 'Pedro Almeida', faixa: 'Roxa', notaAtual: 8.5, notaAnterior: 7.8, tendencia: 'subindo', presenca: 92 },
    { alunoId: 'aluno-02', alunoNome: 'Ricardo Lima', faixa: 'Azul', notaAtual: 7.2, notaAnterior: 6.9, tendencia: 'subindo', presenca: 85 },
    { alunoId: 'aluno-marcos-01', alunoNome: 'Marcos Vieira', faixa: 'Azul', notaAtual: 5.5, notaAnterior: 5.5, tendencia: 'estavel', presenca: 55 },
    { alunoId: 'aluno-matheus-01', alunoNome: 'Matheus Rodrigues', faixa: 'Branca 4 graus', notaAtual: 6.0, notaAnterior: 6.2, tendencia: 'caindo', presenca: 40 },
    { alunoId: 'aluno-valentina-01', alunoNome: 'Valentina Almeida', faixa: 'Cinza', notaAtual: 5.2, notaAnterior: 7.5, tendencia: 'caindo', presenca: 70 },
  ],
  comparativo: [
    { metrica: 'Presença média das turmas', valor: 74, mediaAcademia: 74 },
    { metrica: 'Evolução média dos alunos', valor: 6.7, mediaAcademia: 6.8 },
    { metrica: 'Retenção de alunos (%)', valor: 92, mediaAcademia: 88 },
    { metrica: 'Avaliações por mês', valor: 12, mediaAcademia: 10 },
    { metrica: 'Planos de aula por mês', valor: 4, mediaAcademia: 3 },
  ],
  pontosFortes: [
    'Avalia alunos a cada 40 dias em média — acima da meta de 45 dias',
    'Retenção de 92% — a maior da academia',
    'Turma BJJ Competição com score 90 — excelente engajamento',
    'Planos de aula consistentes e detalhados',
  ],
  pontosAMelhorar: [
    '3 alunos estagnados há mais de 3 meses sem plano de ação',
    'Turma BJJ Avançado com presença abaixo de 70%',
    'Valentina (Teen) com regressão acentuada — investigar causa',
  ],
  acoesSugeridas: [
    'Criar plano individualizado para Marcos Vieira e Matheus Rodrigues',
    'Investigar queda de Valentina — conversa com família e revisão de método para teen',
    'Considerar mudança de horário da turma BJJ Avançado para melhorar presença',
  ],
};

const MOCK_ANALISE_FERNANDA: AnaliseProfessor = {
  professorId: 'prof-fernanda-01',
  professorNome: 'Fernanda Costa',
  faixa: 'Preta 1º grau',
  metricas: {
    presencaMedia: 72,
    evolucaoMedia: 6.5,
    retencao: 85,
    avaliacoesMes: 8,
    planosAulaMes: 3,
    frequenciaAvaliacao: 55,
  },
  evolucaoAlunos: [
    { alunoId: 'aluno-05', alunoNome: 'Camila Souza', faixa: 'Azul', notaAtual: 7.8, notaAnterior: 7.0, tendencia: 'subindo', presenca: 88 },
    { alunoId: 'aluno-06', alunoNome: 'Diego Martins', faixa: 'Branca 3 graus', notaAtual: 6.5, notaAnterior: 6.3, tendencia: 'subindo', presenca: 80 },
    { alunoId: 'aluno-gabriel-01', alunoNome: 'Gabriel Santos', faixa: 'Branca', notaAtual: 0, notaAnterior: 0, tendencia: 'estavel', presenca: 55 },
  ],
  comparativo: [
    { metrica: 'Presença média das turmas', valor: 72, mediaAcademia: 74 },
    { metrica: 'Evolução média dos alunos', valor: 6.5, mediaAcademia: 6.8 },
    { metrica: 'Retenção de alunos (%)', valor: 85, mediaAcademia: 88 },
    { metrica: 'Avaliações por mês', valor: 8, mediaAcademia: 10 },
    { metrica: 'Planos de aula por mês', valor: 3, mediaAcademia: 3 },
  ],
  pontosFortes: [
    'MMA com presença de 80% e tendência de subida',
    'Muay Thai com evolução consistente dos alunos',
    'Boa relação com alunos — zero ocorrências de disciplina',
  ],
  pontosAMelhorar: [
    'Judô Kids com presença abaixo de 60% — necessita atenção urgente',
    'Gabriel Santos (Kids) sem avaliação há 4 meses',
    'Frequência de avaliação acima de 55 dias — meta é 45 dias',
  ],
  acoesSugeridas: [
    'Revisar dinâmica das aulas de Judô Kids — tornar mais lúdicas para engajar crianças',
    'Avaliar Gabriel Santos imediatamente e notificar responsáveis',
    'Aumentar frequência de avaliações — utilizar formato rápido para turmas Kids',
  ],
};

// ── Currículos ─────────────────────────────────────────────────────

const MOCK_CURRICULOS: CurriculoAcademia[] = [
  {
    id: 'curriculo-bjj-01',
    academyId: 'academy-guerreiros-01',
    modalidade: 'BJJ',
    nome: 'Currículo BJJ — Faixa Branca a Azul',
    descricao: 'Programa completo de desenvolvimento para alunos de faixa branca até azul, com foco em fundamentos e posições básicas.',
    modulos: [
      {
        id: 'mod-bjj-01',
        nome: 'Fundamentos de Solo',
        descricao: 'Movimentação básica, postura e escapes',
        faixa: 'Branca',
        ordem: 1,
        tecnicas: [
          { id: 'tec-01', nome: 'Fuga de montada (upa)', descricao: 'Escape básico da posição de montada usando ponte e giro', faixaMinima: 'Branca', posicao: 'Montada (baixo)', videoUrl: null },
          { id: 'tec-02', nome: 'Fuga de montada (elbow-knee)', descricao: 'Escape da montada criando espaço com cotovelo e joelho', faixaMinima: 'Branca', posicao: 'Montada (baixo)', videoUrl: null },
          { id: 'tec-03', nome: 'Fuga lateral (recuperar guarda)', descricao: 'Escape da posição lateral voltando para guarda fechada', faixaMinima: 'Branca', posicao: 'Lateral (baixo)', videoUrl: null },
          { id: 'tec-04', nome: 'Postura na guarda fechada', descricao: 'Postura correta dentro da guarda fechada do oponente', faixaMinima: 'Branca', posicao: 'Guarda fechada (cima)', videoUrl: null },
        ],
      },
      {
        id: 'mod-bjj-02',
        nome: 'Guardas Básicas',
        descricao: 'Guarda fechada, meia-guarda e defesas',
        faixa: 'Branca',
        ordem: 2,
        tecnicas: [
          { id: 'tec-05', nome: 'Guarda fechada — controle básico', descricao: 'Controle do oponente usando guarda fechada com quebra de postura', faixaMinima: 'Branca', posicao: 'Guarda fechada (baixo)', videoUrl: null },
          { id: 'tec-06', nome: 'Armlock da guarda fechada', descricao: 'Finalização de braço partindo da guarda fechada', faixaMinima: 'Branca', posicao: 'Guarda fechada (baixo)', videoUrl: null },
          { id: 'tec-07', nome: 'Triângulo da guarda fechada', descricao: 'Finalização com as pernas partindo da guarda fechada', faixaMinima: 'Branca', posicao: 'Guarda fechada (baixo)', videoUrl: null },
        ],
      },
      {
        id: 'mod-bjj-03',
        nome: 'Passagem de Guarda',
        descricao: 'Técnicas básicas de passagem de guarda',
        faixa: 'Branca 4 graus',
        ordem: 3,
        tecnicas: [
          { id: 'tec-08', nome: 'Passagem de guarda em pé', descricao: 'Passagem levantando na guarda fechada e abrindo as pernas', faixaMinima: 'Branca 4 graus', posicao: 'Guarda fechada (cima)', videoUrl: null },
          { id: 'tec-09', nome: 'Passagem de joelho (knee cut)', descricao: 'Passagem cortando com o joelho pela meia-guarda', faixaMinima: 'Branca 4 graus', posicao: 'Meia-guarda (cima)', videoUrl: null },
        ],
      },
    ],
    progressoTurmas: [
      { turmaId: 'turma-inic-01', turmaNome: 'BJJ Iniciante', moduloAtual: 'Guardas Básicas', percentualConcluido: 65 },
      { turmaId: 'turma-teen-01', turmaNome: 'BJJ Teen', moduloAtual: 'Passagem de Guarda', percentualConcluido: 40 },
    ],
    criadoEm: '2026-01-10T08:00:00Z',
    atualizadoEm: '2026-03-05T14:00:00Z',
  },
  {
    id: 'curriculo-muaythai-01',
    academyId: 'academy-guerreiros-01',
    modalidade: 'Muay Thai',
    nome: 'Currículo Muay Thai — Iniciante',
    descricao: 'Programa de desenvolvimento para praticantes iniciantes de Muay Thai, com foco em golpes básicos e defesas.',
    modulos: [
      {
        id: 'mod-mt-01',
        nome: 'Golpes Básicos',
        descricao: 'Jab, direto, gancho, uppercut',
        faixa: 'Iniciante',
        ordem: 1,
        tecnicas: [
          { id: 'tec-mt-01', nome: 'Jab', descricao: 'Golpe reto com a mão da frente', faixaMinima: 'Iniciante', posicao: 'Em pé', videoUrl: null },
          { id: 'tec-mt-02', nome: 'Direto (cross)', descricao: 'Golpe reto com a mão de trás', faixaMinima: 'Iniciante', posicao: 'Em pé', videoUrl: null },
          { id: 'tec-mt-03', nome: 'Low kick', descricao: 'Chute circular na coxa do oponente', faixaMinima: 'Iniciante', posicao: 'Em pé', videoUrl: null },
        ],
      },
      {
        id: 'mod-mt-02',
        nome: 'Defesas e Esquivas',
        descricao: 'Bloqueios, esquivas e check de chutes',
        faixa: 'Iniciante',
        ordem: 2,
        tecnicas: [
          { id: 'tec-mt-04', nome: 'Bloqueio de jab', descricao: 'Defesa do jab com a palma da mão', faixaMinima: 'Iniciante', posicao: 'Em pé', videoUrl: null },
          { id: 'tec-mt-05', nome: 'Check de low kick', descricao: 'Defesa do chute na coxa levantando a canela', faixaMinima: 'Iniciante', posicao: 'Em pé', videoUrl: null },
        ],
      },
    ],
    progressoTurmas: [
      { turmaId: 'turma-mt-01', turmaNome: 'Muay Thai', moduloAtual: 'Defesas e Esquivas', percentualConcluido: 50 },
    ],
    criadoEm: '2026-02-01T08:00:00Z',
    atualizadoEm: '2026-03-08T10:00:00Z',
  },
];

// ── Reuniões Pedagógicas ───────────────────────────────────────────

const MOCK_REUNIOES: ReuniaoPedagogica[] = [
  {
    id: 'reuniao-01',
    academyId: 'academy-guerreiros-01',
    data: '2026-03-14T14:00:00Z',
    titulo: 'Reunião Pedagógica Mensal — Março',
    status: 'concluida',
    participantes: [
      { professorId: 'prof-andre-01', professorNome: 'André Nakamura', presente: true },
      { professorId: 'prof-fernanda-01', professorNome: 'Fernanda Costa', presente: true },
    ],
    pauta: [
      { titulo: 'Revisão de presença geral', descricao: 'Analisar presença média de todas as turmas e identificar turmas com queda', responsavel: 'André Nakamura', status: 'resolvido' },
      { titulo: 'Judô Kids — plano de ação', descricao: 'Presença abaixo de 60% e crianças faltando muito. Definir estratégia de engajamento', responsavel: 'Fernanda Costa', status: 'resolvido' },
      { titulo: 'Graduações pendentes', descricao: 'Pedro Almeida pronto para promoção à faixa roxa. Definir data da cerimônia', responsavel: 'André Nakamura', status: 'resolvido' },
    ],
    ata: 'Reunião iniciada às 14h com André e Fernanda presentes. Discutida a presença geral — média de 74% está adequada mas Judô Kids precisa de ação. Fernanda vai reestruturar aulas Kids com mais dinâmicas lúdicas. Pedro Almeida aprovado para graduação à faixa roxa — cerimônia marcada para 28/03. Encerrada às 15h30.',
    decisoes: [
      { descricao: 'Reestruturar aulas de Judô Kids com atividades lúdicas a partir da semana 13', aprovadoPor: ['André Nakamura', 'Fernanda Costa'] },
      { descricao: 'Graduação de Pedro Almeida marcada para 28/03', aprovadoPor: ['André Nakamura', 'Fernanda Costa'] },
      { descricao: 'Implementar avaliação rápida quinzenal para turmas Kids', aprovadoPor: ['Fernanda Costa'] },
    ],
    acoesDefinidas: [
      { descricao: 'Fernanda: criar novo plano de aula lúdico para Judô Kids', responsavel: 'Fernanda Costa', prazo: '2026-03-21', status: 'em_andamento' },
      { descricao: 'André: preparar cerimônia de graduação e comunicar família do Pedro', responsavel: 'André Nakamura', prazo: '2026-03-25', status: 'pendente' },
      { descricao: 'André: criar plano individualizado para Marcos Vieira (estagnado)', responsavel: 'André Nakamura', prazo: '2026-03-22', status: 'pendente' },
    ],
    criadoPor: 'André Nakamura',
    criadoEm: '2026-03-14T14:00:00Z',
  },
  {
    id: 'reuniao-02',
    academyId: 'academy-guerreiros-01',
    data: '2026-02-14T14:00:00Z',
    titulo: 'Reunião Pedagógica Mensal — Fevereiro',
    status: 'concluida',
    participantes: [
      { professorId: 'prof-andre-01', professorNome: 'André Nakamura', presente: true },
      { professorId: 'prof-fernanda-01', professorNome: 'Fernanda Costa', presente: true },
    ],
    pauta: [
      { titulo: 'Planejamento do trimestre', descricao: 'Definir metas e foco pedagógico para março-maio', responsavel: 'André Nakamura', status: 'resolvido' },
      { titulo: 'Novos alunos', descricao: 'Integração dos 3 novos alunos matriculados em fevereiro', responsavel: 'Fernanda Costa', status: 'resolvido' },
    ],
    ata: 'Reunião de planejamento trimestral. Definidas metas de presença (mínimo 75%) e avaliação (máximo 45 dias). Novos alunos integrados com sucesso.',
    decisoes: [
      { descricao: 'Meta de presença mínima: 75% por turma', aprovadoPor: ['André Nakamura', 'Fernanda Costa'] },
    ],
    acoesDefinidas: [
      { descricao: 'Atualizar currículo BJJ com novas técnicas de passagem', responsavel: 'André Nakamura', prazo: '2026-03-01', status: 'concluida' },
    ],
    criadoPor: 'André Nakamura',
    criadoEm: '2026-02-14T14:00:00Z',
  },
  {
    id: 'reuniao-03',
    academyId: 'academy-guerreiros-01',
    data: '2026-04-11T14:00:00Z',
    titulo: 'Reunião Pedagógica Mensal — Abril',
    status: 'agendada',
    participantes: [
      { professorId: 'prof-andre-01', professorNome: 'André Nakamura', presente: false },
      { professorId: 'prof-fernanda-01', professorNome: 'Fernanda Costa', presente: false },
    ],
    pauta: [
      { titulo: 'Follow-up Judô Kids', descricao: 'Avaliar resultado das mudanças nas aulas de Judô Kids', responsavel: 'Fernanda Costa', status: 'pendente' },
      { titulo: 'Preparação para campeonato interno', descricao: 'Planejamento do campeonato interno de maio', responsavel: 'André Nakamura', status: 'pendente' },
    ],
    ata: '',
    decisoes: [],
    acoesDefinidas: [],
    criadoPor: 'André Nakamura',
    criadoEm: '2026-03-15T10:00:00Z',
  },
];

// ── Ocorrências ────────────────────────────────────────────────────

const MOCK_OCORRENCIAS: Ocorrencia[] = [
  {
    id: 'ocorrencia-01',
    academyId: 'academy-guerreiros-01',
    alunoId: 'aluno-gabriel-01',
    alunoNome: 'Gabriel Santos',
    turmaId: 'turma-judo-kids-01',
    turmaNome: 'Judô Kids',
    professorId: 'prof-fernanda-01',
    professorNome: 'Fernanda Costa',
    tipo: 'positiva',
    gravidade: 'leve',
    descricao: 'Gabriel se destacou no sparring de hoje, demonstrou evolução técnica e ajudou colegas menores.',
    acaoTomada: 'Elogiado publicamente na turma e registro para acompanhamento de evolução.',
    responsavelNotificado: false,
    data: '2026-03-10T16:00:00Z',
    criadoEm: '2026-03-10T16:30:00Z',
  },
  {
    id: 'ocorrencia-02',
    academyId: 'academy-guerreiros-01',
    alunoId: 'aluno-08',
    alunoNome: 'Davi Oliveira',
    turmaId: 'turma-judo-kids-01',
    turmaNome: 'Judô Kids',
    professorId: 'prof-fernanda-01',
    professorNome: 'Fernanda Costa',
    tipo: 'comportamento',
    gravidade: 'moderada',
    descricao: 'Davi não respeitou o comando de parar durante o treino e continuou aplicando técnica no colega após o sinal.',
    acaoTomada: 'Conversa individual com o aluno sobre respeito e segurança. Ficou sentado observando os últimos 10 minutos.',
    responsavelNotificado: true,
    data: '2026-03-08T15:30:00Z',
    criadoEm: '2026-03-08T16:00:00Z',
  },
  {
    id: 'ocorrencia-03',
    academyId: 'academy-guerreiros-01',
    alunoId: 'aluno-09',
    alunoNome: 'Henrique Barros',
    turmaId: 'turma-comp-01',
    turmaNome: 'BJJ Competição',
    professorId: 'prof-andre-01',
    professorNome: 'André Nakamura',
    tipo: 'seguranca',
    gravidade: 'grave',
    descricao: 'Henrique sofreu torção leve no joelho durante sparring. Parou o treino imediatamente.',
    acaoTomada: 'Aplicado gelo, orientado a procurar ortopedista. Afastado por 1 semana preventivamente.',
    responsavelNotificado: true,
    data: '2026-03-05T20:00:00Z',
    criadoEm: '2026-03-05T20:15:00Z',
  },
  {
    id: 'ocorrencia-04',
    academyId: 'academy-guerreiros-01',
    alunoId: 'aluno-10',
    alunoNome: 'Sofia Mendes',
    turmaId: 'turma-mt-01',
    turmaNome: 'Muay Thai',
    professorId: 'prof-fernanda-01',
    professorNome: 'Fernanda Costa',
    tipo: 'observacao',
    gravidade: 'leve',
    descricao: 'Sofia está treinando com protetor bucal quebrado. Precisa trocar antes do próximo treino.',
    acaoTomada: 'Avisada para trazer novo protetor. Informado que não poderá participar de sparring sem protetor adequado.',
    responsavelNotificado: false,
    data: '2026-03-12T19:00:00Z',
    criadoEm: '2026-03-12T19:30:00Z',
  },
  {
    id: 'ocorrencia-05',
    academyId: 'academy-guerreiros-01',
    alunoId: 'aluno-valentina-01',
    alunoNome: 'Valentina Almeida',
    turmaId: 'turma-teen-01',
    turmaNome: 'BJJ Teen',
    professorId: 'prof-andre-01',
    professorNome: 'André Nakamura',
    tipo: 'observacao',
    gravidade: 'leve',
    descricao: 'Valentina pareceu desmotivada nas últimas aulas. Treina sem energia e evita sparring.',
    acaoTomada: 'Conversa reservada — aluna relatou dificuldade na escola. Sugerido conversa com responsáveis.',
    responsavelNotificado: false,
    data: '2026-03-16T18:00:00Z',
    criadoEm: '2026-03-16T18:30:00Z',
  },
  {
    id: 'ocorrencia-06',
    academyId: 'academy-guerreiros-01',
    alunoId: 'aluno-11',
    alunoNome: 'Rafael Pereira',
    turmaId: 'turma-mma-01',
    turmaNome: 'MMA',
    professorId: 'prof-fernanda-01',
    professorNome: 'Fernanda Costa',
    tipo: 'disciplina',
    gravidade: 'moderada',
    descricao: 'Rafael chegou atrasado pela terceira vez consecutiva e atrapalhou o aquecimento da turma.',
    acaoTomada: 'Conversa sobre compromisso e pontualidade. Avisado que na próxima vez não poderá participar da aula.',
    responsavelNotificado: false,
    data: '2026-03-17T19:15:00Z',
    criadoEm: '2026-03-17T19:45:00Z',
  },
];

// ── Relatório Mensal ───────────────────────────────────────────────

const MOCK_RELATORIO_MARCO: RelatorioPedagogicoMensal = {
  id: 'relatorio-2026-03',
  academyId: 'academy-guerreiros-01',
  mes: '2026-03',
  resumoExecutivo: 'Março foi um mês de consolidação. A presença média se manteve em 74%, ligeiramente abaixo da meta de 75%. A turma BJJ Competição continua sendo destaque com score 90. O principal ponto de atenção é o Judô Kids, com presença em queda e 3 crianças faltando sistematicamente. Pedro Almeida está pronto para graduação à faixa roxa. Dois alunos precisam de acompanhamento urgente: Marcos Vieira (estagnado) e Matheus Rodrigues (ausências).',
  metricas: {
    totalAlunos: 21,
    presencaMedia: 74,
    evolucaoMedia: 6.8,
    graduacoes: 0,
    novasMatriculas: 1,
    evasoes: 0,
    retencao: 100,
  },
  porProfessor: [
    {
      professorId: 'prof-andre-01',
      professorNome: 'André Nakamura',
      turmas: 5,
      alunos: 14,
      presencaMedia: 74,
      avaliacoesFeitas: 12,
      planosEntregues: 4,
      score: 82,
    },
    {
      professorId: 'prof-fernanda-01',
      professorNome: 'Fernanda Costa',
      turmas: 3,
      alunos: 10,
      presencaMedia: 72,
      avaliacoesFeitas: 8,
      planosEntregues: 3,
      score: 75,
    },
  ],
  alunosDestaque: [
    { alunoId: 'aluno-01', alunoNome: 'Pedro Almeida', motivo: 'Pronto para graduação à faixa roxa — evolução consistente e presença de 92%' },
    { alunoId: 'aluno-05', alunoNome: 'Camila Souza', motivo: 'Maior evolução do mês na turma MMA — nota subiu de 7.0 para 7.8' },
    { alunoId: 'aluno-gabriel-01', alunoNome: 'Gabriel Santos', motivo: 'Destaque no sparring e ajudou colegas menores (ocorrência positiva)' },
  ],
  alunosAtencao: [
    { alunoId: 'aluno-marcos-01', alunoNome: 'Marcos Vieira', motivo: 'Estagnado há 4 meses', acaoSugerida: 'Plano individualizado de evolução' },
    { alunoId: 'aluno-matheus-01', alunoNome: 'Matheus Rodrigues', motivo: 'Presença de apenas 40%', acaoSugerida: 'Contato para entender motivo das faltas' },
    { alunoId: 'aluno-valentina-01', alunoNome: 'Valentina Almeida', motivo: 'Regressão na nota — caiu de 7.5 para 5.2', acaoSugerida: 'Conversa com família e acompanhamento' },
  ],
  metaProximoMes: [
    { descricao: 'Elevar presença média para 75%', responsavel: 'André Nakamura', prazo: '2026-04-30' },
    { descricao: 'Reestruturar aulas de Judô Kids', responsavel: 'Fernanda Costa', prazo: '2026-04-15' },
    { descricao: 'Realizar graduação de Pedro Almeida', responsavel: 'André Nakamura', prazo: '2026-03-28' },
    { descricao: 'Reduzir frequência de avaliação para máximo 45 dias', responsavel: 'Fernanda Costa', prazo: '2026-04-30' },
  ],
  geradoEm: '2026-03-18T10:00:00Z',
};

// ── Exported mock functions ────────────────────────────────────────

export async function mockGetPedagogicoDashboard(_academyId: string): Promise<PedagogicoDashboardDTO> {
  await delay();
  return JSON.parse(JSON.stringify(MOCK_DASHBOARD));
}

export async function mockGetAnaliseProfessor(professorId: string): Promise<AnaliseProfessor> {
  await delay();
  if (professorId === 'prof-fernanda-01') {
    return JSON.parse(JSON.stringify(MOCK_ANALISE_FERNANDA));
  }
  return JSON.parse(JSON.stringify(MOCK_ANALISE_ANDRE));
}

export async function mockGetCurriculos(_academyId: string): Promise<CurriculoAcademia[]> {
  await delay();
  return JSON.parse(JSON.stringify(MOCK_CURRICULOS));
}

export async function mockGetCurriculo(id: string): Promise<CurriculoAcademia> {
  await delay();
  const found = MOCK_CURRICULOS.find((c) => c.id === id);
  if (!found) {
    return JSON.parse(JSON.stringify(MOCK_CURRICULOS[0]));
  }
  return JSON.parse(JSON.stringify(found));
}

export async function mockCreateCurriculo(data: Partial<CurriculoAcademia>): Promise<CurriculoAcademia> {
  await delay();
  const novo: CurriculoAcademia = {
    id: `curriculo-${Date.now()}`,
    academyId: data.academyId ?? 'academy-guerreiros-01',
    modalidade: data.modalidade ?? 'BJJ',
    nome: data.nome ?? 'Novo Currículo',
    descricao: data.descricao ?? '',
    modulos: data.modulos ?? [],
    progressoTurmas: data.progressoTurmas ?? [],
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };
  MOCK_CURRICULOS.push(novo);
  return JSON.parse(JSON.stringify(novo));
}

export async function mockUpdateCurriculo(id: string, data: Partial<CurriculoAcademia>): Promise<CurriculoAcademia> {
  await delay();
  const idx = MOCK_CURRICULOS.findIndex((c) => c.id === id);
  if (idx >= 0) {
    MOCK_CURRICULOS[idx] = {
      ...MOCK_CURRICULOS[idx],
      ...data,
      id: MOCK_CURRICULOS[idx].id,
      atualizadoEm: new Date().toISOString(),
    };
    return JSON.parse(JSON.stringify(MOCK_CURRICULOS[idx]));
  }
  return JSON.parse(JSON.stringify(MOCK_CURRICULOS[0]));
}

export async function mockGetReunioes(_academyId: string): Promise<ReuniaoPedagogica[]> {
  await delay();
  return JSON.parse(JSON.stringify(MOCK_REUNIOES));
}

export async function mockCreateReuniao(data: Partial<ReuniaoPedagogica>): Promise<ReuniaoPedagogica> {
  await delay();
  const nova: ReuniaoPedagogica = {
    id: `reuniao-${Date.now()}`,
    academyId: data.academyId ?? 'academy-guerreiros-01',
    data: data.data ?? new Date().toISOString(),
    titulo: data.titulo ?? 'Nova Reunião',
    status: data.status ?? 'agendada',
    participantes: data.participantes ?? [],
    pauta: data.pauta ?? [],
    ata: data.ata ?? '',
    decisoes: data.decisoes ?? [],
    acoesDefinidas: data.acoesDefinidas ?? [],
    criadoPor: data.criadoPor ?? 'André Nakamura',
    criadoEm: new Date().toISOString(),
  };
  MOCK_REUNIOES.push(nova);
  return JSON.parse(JSON.stringify(nova));
}

export async function mockUpdateReuniao(id: string, data: Partial<ReuniaoPedagogica>): Promise<ReuniaoPedagogica> {
  await delay();
  const idx = MOCK_REUNIOES.findIndex((r) => r.id === id);
  if (idx >= 0) {
    MOCK_REUNIOES[idx] = {
      ...MOCK_REUNIOES[idx],
      ...data,
      id: MOCK_REUNIOES[idx].id,
    };
    return JSON.parse(JSON.stringify(MOCK_REUNIOES[idx]));
  }
  return JSON.parse(JSON.stringify(MOCK_REUNIOES[0]));
}

export async function mockGetOcorrencias(_academyId: string): Promise<Ocorrencia[]> {
  await delay();
  return JSON.parse(JSON.stringify(MOCK_OCORRENCIAS));
}

export async function mockCreateOcorrencia(data: Partial<Ocorrencia>): Promise<Ocorrencia> {
  await delay();
  const nova: Ocorrencia = {
    id: `ocorrencia-${Date.now()}`,
    academyId: data.academyId ?? 'academy-guerreiros-01',
    alunoId: data.alunoId ?? '',
    alunoNome: data.alunoNome ?? '',
    turmaId: data.turmaId ?? '',
    turmaNome: data.turmaNome ?? '',
    professorId: data.professorId ?? '',
    professorNome: data.professorNome ?? '',
    tipo: data.tipo ?? 'observacao',
    gravidade: data.gravidade ?? 'leve',
    descricao: data.descricao ?? '',
    acaoTomada: data.acaoTomada ?? '',
    responsavelNotificado: data.responsavelNotificado ?? false,
    data: data.data ?? new Date().toISOString(),
    criadoEm: new Date().toISOString(),
  };
  MOCK_OCORRENCIAS.push(nova);
  return JSON.parse(JSON.stringify(nova));
}

export async function mockGerarRelatorioPedagogico(_academyId: string, _mes: string): Promise<RelatorioPedagogicoMensal> {
  await delay();
  return JSON.parse(JSON.stringify(MOCK_RELATORIO_MARCO));
}
