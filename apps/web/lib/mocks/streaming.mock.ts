// streaming.mock.ts — Complete mock data for streaming service
import type {
  StreamingVideo,
  StreamingSeries,
  StreamingTrail,
  WatchProgress,
  QuizQuestion,
  QuizResult,
  StreamingCertificate,
  EpisodeCompletionResult,
  StreamingLibrary,
  SeriesDetail,
  TrailProgress,
} from '@/lib/types/streaming';

const delay = () => new Promise<void>((r) => setTimeout(r, 250));

// ---------------------------------------------------------------------------
// VIDEOS
// ---------------------------------------------------------------------------

const ALL_VIDEOS: StreamingVideo[] = [
  // ── Series 1: Fundamentos BJJ ──────────────────────────────────────────
  {
    id: 'v-1',
    title: 'Postura base e equilíbrio',
    description:
      'Aprenda a postura fundamental do Jiu-Jitsu, incluindo base, distribuição de peso e como manter o equilíbrio sob pressão.',
    duration_seconds: 480,
    video_url: '',
    thumbnail_url: '',
    gradient_css:
      'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    series_id: 'series-fund',
    order: 1,
    professor_id: 'prof-andre',
    professor_name: 'Prof. André',
    modality: 'BJJ',
    min_belt: 'white',
    tags: ['fundamentos'],
    created_at: '2026-01-05T10:00:00Z',
  },
  {
    id: 'v-2',
    title: 'Fuga de montada',
    description:
      'Duas fugas essenciais da montada: a upa (ponte e rola) e o elbow-knee escape. Domine a defesa antes do ataque.',
    duration_seconds: 720,
    video_url: '',
    thumbnail_url: '',
    gradient_css:
      'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    series_id: 'series-fund',
    order: 2,
    professor_id: 'prof-andre',
    professor_name: 'Prof. André',
    modality: 'BJJ',
    min_belt: 'white',
    tags: ['fundamentos'],
    created_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 'v-3',
    title: 'Raspagem guarda fechada',
    description:
      'Técnicas de raspagem partindo da guarda fechada: tesoura, pendulum e hip bump. Controle o ritmo da luta.',
    duration_seconds: 900,
    video_url: '',
    thumbnail_url: '',
    gradient_css:
      'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)',
    series_id: 'series-fund',
    order: 3,
    professor_id: 'prof-andre',
    professor_name: 'Prof. André',
    modality: 'BJJ',
    min_belt: 'white',
    tags: ['fundamentos'],
    created_at: '2026-01-19T10:00:00Z',
  },
  {
    id: 'v-4',
    title: 'Passagem de guarda básica',
    description:
      'Passagens fundamentais: em pé com controle de calça e passagem de joelho. Aprenda a neutralizar a guarda do oponente.',
    duration_seconds: 600,
    video_url: '',
    thumbnail_url: '',
    gradient_css: 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)',
    series_id: 'series-fund',
    order: 4,
    professor_id: 'prof-andre',
    professor_name: 'Prof. André',
    modality: 'BJJ',
    min_belt: 'white',
    tags: ['fundamentos'],
    created_at: '2026-01-26T10:00:00Z',
  },
  {
    id: 'v-5',
    title: 'Armlock do mount',
    description:
      'O armlock clássico partindo da montada: posicionamento, isolamento do braço e finalização. A primeira submissão que todo faixa branca deve saber.',
    duration_seconds: 480,
    video_url: '',
    thumbnail_url: '',
    gradient_css: 'linear-gradient(135deg, #200122 0%, #6f0000 100%)',
    series_id: 'series-fund',
    order: 5,
    professor_id: 'prof-andre',
    professor_name: 'Prof. André',
    modality: 'BJJ',
    min_belt: 'white',
    tags: ['fundamentos'],
    created_at: '2026-02-02T10:00:00Z',
  },

  // ── Series 2: BJJ Intermediário ────────────────────────────────────────
  {
    id: 'v-6',
    title: 'Guarda De La Riva',
    description:
      'O sistema De La Riva: ganchos, controle de manga e calça, e as principais raspagens. Eleve seu jogo de guarda.',
    duration_seconds: 1080,
    video_url: '',
    thumbnail_url: '',
    gradient_css: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
    series_id: 'series-inter',
    order: 1,
    professor_id: 'prof-andre',
    professor_name: 'Prof. André',
    modality: 'BJJ',
    min_belt: 'blue',
    tags: ['intermediario'],
    created_at: '2026-02-09T10:00:00Z',
  },
  {
    id: 'v-7',
    title: 'Passagem com pressão',
    description:
      'Passagens com pressão: over-under, stack pass e smash pass. Domine o estilo pesado de passar guarda.',
    duration_seconds: 840,
    video_url: '',
    thumbnail_url: '',
    gradient_css:
      'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    series_id: 'series-inter',
    order: 2,
    professor_id: 'prof-andre',
    professor_name: 'Prof. André',
    modality: 'BJJ',
    min_belt: 'blue',
    tags: ['intermediario'],
    created_at: '2026-02-16T10:00:00Z',
  },
  {
    id: 'v-8',
    title: 'Triângulo do guard',
    description:
      'O triângulo partindo da guarda: setup, ângulo, corte de braço e finalização. Detalhes que fazem a diferença.',
    duration_seconds: 720,
    video_url: '',
    thumbnail_url: '',
    gradient_css: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
    series_id: 'series-inter',
    order: 3,
    professor_id: 'prof-andre',
    professor_name: 'Prof. André',
    modality: 'BJJ',
    min_belt: 'blue',
    tags: ['intermediario'],
    created_at: '2026-02-23T10:00:00Z',
  },
  {
    id: 'v-9',
    title: 'Controle das costas',
    description:
      'Domine o controle das costas: ganchos, seatbelt, ajustes e transições para finalização. A posição mais dominante do BJJ.',
    duration_seconds: 960,
    video_url: '',
    thumbnail_url: '',
    gradient_css: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
    series_id: 'series-inter',
    order: 4,
    professor_id: 'prof-andre',
    professor_name: 'Prof. André',
    modality: 'BJJ',
    min_belt: 'blue',
    tags: ['intermediario'],
    created_at: '2026-03-02T10:00:00Z',
  },

  // ── Series 3: Judô para Jiu-Jiteiro ───────────────────────────────────
  {
    id: 'v-10',
    title: 'O-soto-gari',
    description:
      'A queda mais fundamental do Judô: o-soto-gari. Entrada, kuzushi, contato e projeção para o Jiu-Jiteiro.',
    duration_seconds: 600,
    video_url: '',
    thumbnail_url: '',
    gradient_css: 'linear-gradient(135deg, #1e130c 0%, #9a8478 100%)',
    series_id: 'series-judo',
    order: 1,
    professor_id: 'prof-fernanda',
    professor_name: 'Prof. Fernanda',
    modality: 'Judô',
    min_belt: 'white',
    tags: ['fundamentos'],
    created_at: '2026-01-08T10:00:00Z',
  },
  {
    id: 'v-11',
    title: 'Ippon seoi-nage',
    description:
      'Ippon seoi-nage adaptado para quem treina Jiu-Jitsu: entrada rápida, controle de manga e finalização no solo.',
    duration_seconds: 720,
    video_url: '',
    thumbnail_url: '',
    gradient_css: 'linear-gradient(135deg, #0b0b0f 0%, #3a3a5c 100%)',
    series_id: 'series-judo',
    order: 2,
    professor_id: 'prof-fernanda',
    professor_name: 'Prof. Fernanda',
    modality: 'Judô',
    min_belt: 'white',
    tags: ['fundamentos'],
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'v-12',
    title: 'Footwork e pegada',
    description:
      'Movimentação de pés e estratégias de pegada no judogi. A base de tudo em pé começa nos pés e nas mãos.',
    duration_seconds: 480,
    video_url: '',
    thumbnail_url: '',
    gradient_css: 'linear-gradient(135deg, #16222a 0%, #3a6073 100%)',
    series_id: 'series-judo',
    order: 3,
    professor_id: 'prof-fernanda',
    professor_name: 'Prof. Fernanda',
    modality: 'Judô',
    min_belt: 'white',
    tags: ['fundamentos'],
    created_at: '2026-01-22T10:00:00Z',
  },

  // ── Standalone ─────────────────────────────────────────────────────────
  {
    id: 'v-13',
    title: 'Preparação física funcional',
    description:
      'Circuito completo de preparação física funcional voltado para lutadores: explosão, resistência e mobilidade articular.',
    duration_seconds: 1200,
    video_url: '',
    thumbnail_url: '',
    gradient_css: 'linear-gradient(135deg, #1d4350 0%, #a43931 100%)',
    series_id: '',
    order: 0,
    professor_id: 'prof-thiago',
    professor_name: 'Prof. Thiago',
    modality: 'Prep. Física',
    min_belt: 'white',
    tags: ['treino_casa'],
    created_at: '2026-02-05T10:00:00Z',
  },
  {
    id: 'v-14',
    title: 'Aquecimento e alongamento',
    description:
      'Rotina de aquecimento articular e alongamento pré-treino. Previna lesões e melhore a performance no tatame.',
    duration_seconds: 900,
    video_url: '',
    thumbnail_url: '',
    gradient_css: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    series_id: '',
    order: 0,
    professor_id: 'prof-andre',
    professor_name: 'Prof. André',
    modality: 'BJJ',
    min_belt: 'white',
    tags: ['treino_casa'],
    created_at: '2026-02-12T10:00:00Z',
  },
  {
    id: 'v-15',
    title: 'Estratégia de competição',
    description:
      'Como montar um gameplan de competição: estudo do adversário, gestão de tempo, vantagens e quando arriscar.',
    duration_seconds: 1500,
    video_url: '',
    thumbnail_url: '',
    gradient_css: 'linear-gradient(135deg, #4b134f 0%, #c94b4b 100%)',
    series_id: '',
    order: 0,
    professor_id: 'prof-andre',
    professor_name: 'Prof. André',
    modality: 'BJJ',
    min_belt: 'blue',
    tags: ['competicao'],
    created_at: '2026-03-01T10:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// SERIES
// ---------------------------------------------------------------------------

const SERIES_FUND: StreamingSeries = {
  id: 'series-fund',
  title: 'Fundamentos BJJ',
  description:
    'Os fundamentos essenciais do Jiu-Jitsu Brasileiro para iniciantes. Postura, fugas, raspagens, passagens e a primeira submissão.',
  professor_id: 'prof-andre',
  professor_name: 'Prof. André',
  modality: 'BJJ',
  min_belt: 'white',
  total_duration: '53min',
  gradient_css:
    'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  thumbnail_url: '',
  category: 'fundamentos',
  tags: ['fundamentos', 'faixa_branca'],
  videos: ALL_VIDEOS.filter((v) => v.series_id === 'series-fund'),
};

const SERIES_INTER: StreamingSeries = {
  id: 'series-inter',
  title: 'BJJ Intermediário',
  description:
    'Técnicas intermediárias de Jiu-Jitsu: guarda De La Riva, passagens com pressão, triângulo e controle das costas.',
  professor_id: 'prof-andre',
  professor_name: 'Prof. André',
  modality: 'BJJ',
  min_belt: 'blue',
  total_duration: '60min',
  gradient_css: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
  thumbnail_url: '',
  category: 'intermediario',
  tags: ['intermediario', 'faixa_azul'],
  videos: ALL_VIDEOS.filter((v) => v.series_id === 'series-inter'),
};

const SERIES_JUDO: StreamingSeries = {
  id: 'series-judo',
  title: 'Judô para Jiu-Jiteiro',
  description:
    'Quedas e técnicas de Judô adaptadas para praticantes de Jiu-Jitsu. Melhore seu jogo em pé.',
  professor_id: 'prof-fernanda',
  professor_name: 'Prof. Fernanda',
  modality: 'Judô',
  min_belt: 'white',
  total_duration: '30min',
  gradient_css: 'linear-gradient(135deg, #1e130c 0%, #9a8478 100%)',
  thumbnail_url: '',
  category: 'fundamentos',
  tags: ['fundamentos', 'judo'],
  videos: ALL_VIDEOS.filter((v) => v.series_id === 'series-judo'),
};

const ALL_SERIES: StreamingSeries[] = [SERIES_FUND, SERIES_INTER, SERIES_JUDO];

// ---------------------------------------------------------------------------
// TRAILS
// ---------------------------------------------------------------------------

const ALL_TRAILS: StreamingTrail[] = [
  {
    id: 'trail-fund',
    name: 'Fundamentos do BJJ',
    description:
      'Trilha completa de fundamentos do Jiu-Jitsu Brasileiro. Ao concluir, receba seu certificado digital.',
    series: [SERIES_FUND],
    total_videos: 5,
    total_duration: '53min',
    min_belt: 'white',
    gradient_css:
      'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    certificate_available: true,
  },
  {
    id: 'trail-inter',
    name: 'BJJ Intermediário',
    description:
      'Trilha intermediária de Jiu-Jitsu com técnicas avançadas de guarda, passagem e controle.',
    series: [SERIES_INTER],
    total_videos: 4,
    total_duration: '60min',
    min_belt: 'blue',
    gradient_css: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
    certificate_available: true,
  },
  {
    id: 'trail-judo',
    name: 'Judô para Jiu-Jiteiro',
    description:
      'Trilha de Judô adaptada para praticantes de BJJ. Domine as quedas e ganhe vantagem em pé.',
    series: [SERIES_JUDO],
    total_videos: 3,
    total_duration: '30min',
    min_belt: 'white',
    gradient_css: 'linear-gradient(135deg, #1e130c 0%, #9a8478 100%)',
    certificate_available: true,
  },
];

// ---------------------------------------------------------------------------
// QUIZ QUESTIONS — 3 per video, 45 total
// ---------------------------------------------------------------------------

const ALL_QUIZ: QuizQuestion[] = [
  // ── v-1  Postura base e equilíbrio ─────────────────────────────────────
  {
    id: 'q-v1-1',
    video_id: 'v-1',
    question: 'Qual a base ideal para manter o equilíbrio no Jiu-Jitsu?',
    options: [
      'Pés juntos e corpo ereto',
      'Pés na largura dos ombros com joelhos flexionados',
      'Pés cruzados e corpo inclinado',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 1:30',
  },
  {
    id: 'q-v1-2',
    video_id: 'v-1',
    question: 'O que compromete a postura base?',
    options: [
      'Manter os braços próximos ao corpo',
      'Olhar para frente',
      'Ficar com as costas retas demais e rígidas',
    ],
    correct_index: 2,
    timestamp_hint: 'Reveja 3:45',
  },
  {
    id: 'q-v1-3',
    video_id: 'v-1',
    question:
      'Onde deve estar o centro de gravidade para boa estabilidade no solo?',
    options: ['Nos ombros', 'No quadril', 'Nos joelhos'],
    correct_index: 1,
    timestamp_hint: 'Reveja 5:20',
  },

  // ── v-2  Fuga de montada ───────────────────────────────────────────────
  {
    id: 'q-v2-1',
    video_id: 'v-2',
    question: 'Qual o primeiro movimento da fuga upa?',
    options: [
      'Empurrar com as mãos',
      'Pontar com o quadril',
      'Virar de lado',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 2:15',
  },
  {
    id: 'q-v2-2',
    video_id: 'v-2',
    question: 'Quando usar elbow-knee escape?',
    options: ['Quando montado', 'Na guarda', 'Em pé'],
    correct_index: 0,
    timestamp_hint: 'Reveja 5:30',
  },
  {
    id: 'q-v2-3',
    video_id: 'v-2',
    question: 'O que NÃO fazer quando montado?',
    options: [
      'Ficar parado',
      'Proteger o pescoço',
      'Trabalhar a fuga',
    ],
    correct_index: 0,
    timestamp_hint: 'Reveja 1:00',
  },

  // ── v-3  Raspagem guarda fechada ───────────────────────────────────────
  {
    id: 'q-v3-1',
    video_id: 'v-3',
    question:
      'Qual o controle fundamental para iniciar a raspagem tesoura?',
    options: [
      'Controlar o colarinho e a manga',
      'Segurar os dois pulsos',
      'Abraçar o tronco',
    ],
    correct_index: 0,
    timestamp_hint: 'Reveja 2:00',
  },
  {
    id: 'q-v3-2',
    video_id: 'v-3',
    question: 'Na raspagem pendulum, qual perna faz o movimento pendular?',
    options: [
      'A perna de trás',
      'A perna que engancha na perna do oponente',
      'Ambas igualmente',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 6:10',
  },
  {
    id: 'q-v3-3',
    video_id: 'v-3',
    question: 'O hip bump funciona melhor quando o oponente...',
    options: [
      'Está postado com os braços estendidos',
      'Está com a base baixa',
      'Está tentando passar em pé',
    ],
    correct_index: 0,
    timestamp_hint: 'Reveja 10:30',
  },

  // ── v-4  Passagem de guarda básica ─────────────────────────────────────
  {
    id: 'q-v4-1',
    video_id: 'v-4',
    question: 'Qual o primeiro passo da passagem de guarda em pé?',
    options: [
      'Puxar a gola do oponente',
      'Levantar controlando as calças do oponente',
      'Girar para o lado',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 1:45',
  },
  {
    id: 'q-v4-2',
    video_id: 'v-4',
    question: 'Na passagem de joelho, onde deve estar a pressão?',
    options: [
      'No peito do oponente',
      'Na coxa/quadril do oponente',
      'Nos ombros do oponente',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 4:20',
  },
  {
    id: 'q-v4-3',
    video_id: 'v-4',
    question: 'O que NÃO se deve fazer ao passar guarda?',
    options: [
      'Manter a postura',
      'Ficar dentro da guarda fechada tentando passar',
      'Controlar os quadris do oponente',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 7:00',
  },

  // ── v-5  Armlock do mount ──────────────────────────────────────────────
  {
    id: 'q-v5-1',
    video_id: 'v-5',
    question: 'Qual a posição das mãos antes de girar para o armlock?',
    options: [
      'Ambas no pescoço',
      'Uma no pulso e outra controlando a cabeça',
      'Ambas nos joelhos',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 2:00',
  },
  {
    id: 'q-v5-2',
    video_id: 'v-5',
    question:
      'Ao finalizar o armlock, o polegar do oponente deve apontar para...',
    options: ['Baixo', 'Cima', 'O lado'],
    correct_index: 1,
    timestamp_hint: 'Reveja 5:10',
  },
  {
    id: 'q-v5-3',
    video_id: 'v-5',
    question: 'O que mantém o oponente preso durante o armlock?',
    options: [
      'Força dos braços',
      'Pressão dos joelhos e quadril elevado',
      'Peso do corpo sobre o peito',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 6:30',
  },

  // ── v-6  Guarda De La Riva ─────────────────────────────────────────────
  {
    id: 'q-v6-1',
    video_id: 'v-6',
    question: 'Onde se posiciona o gancho na guarda De La Riva?',
    options: [
      'Por dentro da perna, enganchando no quadril',
      'Por fora da perna, enganchando na coxa interna',
      'Nos dois tornozelos',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 3:00',
  },
  {
    id: 'q-v6-2',
    video_id: 'v-6',
    question: 'Qual controle de grip é essencial na DLR?',
    options: [
      'Gola e costas',
      'Manga e tornozelo',
      'Apenas o cinto',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 7:30',
  },
  {
    id: 'q-v6-3',
    video_id: 'v-6',
    question: 'A raspagem bicicleta da DLR usa qual movimento principal?',
    options: [
      'Empurrão com os braços',
      'Puxada circular com as pernas',
      'Rolamento lateral',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 12:00',
  },

  // ── v-7  Passagem com pressão ──────────────────────────────────────────
  {
    id: 'q-v7-1',
    video_id: 'v-7',
    question: 'No over-under pass, onde ficam os braços do passador?',
    options: [
      'Ambos por cima',
      'Um por cima da perna e outro por baixo',
      'Ambos por baixo das pernas',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 2:30',
  },
  {
    id: 'q-v7-2',
    video_id: 'v-7',
    question: 'O stack pass é mais eficiente contra qual tipo de guarda?',
    options: [
      'Guarda aberta com distância',
      'Guarda fechada com controle de quadril',
      'Meia guarda',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 6:00',
  },
  {
    id: 'q-v7-3',
    video_id: 'v-7',
    question: 'Qual o princípio chave da passagem com pressão?',
    options: [
      'Velocidade acima de tudo',
      'Eliminar o espaço entre os quadris',
      'Manter a distância para evitar raspagens',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 10:00',
  },

  // ── v-8  Triângulo do guard ────────────────────────────────────────────
  {
    id: 'q-v8-1',
    video_id: 'v-8',
    question: 'Qual o setup mais comum para o triângulo da guarda?',
    options: [
      'Puxar a cabeça para baixo',
      'Isolar um braço dentro e outro fora',
      'Empurrar ambos os braços para fora',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 2:00',
  },
  {
    id: 'q-v8-2',
    video_id: 'v-8',
    question: 'Para finalizar o triângulo, o ângulo ideal é...',
    options: [
      'Reto, de frente para o oponente',
      'Lateral, cortando em ângulo',
      'De costas para o oponente',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 6:15',
  },
  {
    id: 'q-v8-3',
    video_id: 'v-8',
    question: 'O que fazer se o oponente postura no triângulo?',
    options: [
      'Soltar as pernas',
      'Puxar a cabeça e travar o tornozelo',
      'Empurrar os joelhos',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 9:30',
  },

  // ── v-9  Controle das costas ───────────────────────────────────────────
  {
    id: 'q-v9-1',
    video_id: 'v-9',
    question: 'Qual a pegada padrão ao controlar as costas?',
    options: [
      'Dois ganchos + seatbelt',
      'Apenas um braço no pescoço',
      'Dois braços embaixo dos braços',
    ],
    correct_index: 0,
    timestamp_hint: 'Reveja 3:00',
  },
  {
    id: 'q-v9-2',
    video_id: 'v-9',
    question:
      'O que fazer quando o oponente tenta escapar virando para o lado do braço de baixo?',
    options: [
      'Soltar os ganchos',
      'Rolar junto mantendo o seatbelt e recolocando os ganchos',
      'Empurrar com as pernas',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 8:00',
  },
  {
    id: 'q-v9-3',
    video_id: 'v-9',
    question: 'Qual a finalização principal partindo das costas?',
    options: ['Armlock', 'Mata-leão (RNC)', 'Kimura'],
    correct_index: 1,
    timestamp_hint: 'Reveja 12:30',
  },

  // ── v-10 O-soto-gari ──────────────────────────────────────────────────
  {
    id: 'q-v10-1',
    video_id: 'v-10',
    question: 'O kuzushi do o-soto-gari é feito em qual direção?',
    options: ['Para frente', 'Para trás e para o lado', 'Para baixo'],
    correct_index: 1,
    timestamp_hint: 'Reveja 2:00',
  },
  {
    id: 'q-v10-2',
    video_id: 'v-10',
    question: 'Qual perna executa a ceifa no o-soto-gari?',
    options: [
      'A perna da frente',
      'A perna de trás, que ceifa a perna do oponente',
      'Ambas',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 5:00',
  },
  {
    id: 'q-v10-3',
    video_id: 'v-10',
    question:
      'No contexto do BJJ, após o o-soto-gari bem-sucedido, qual a melhor ação?',
    options: [
      'Soltar e voltar à posição em pé',
      'Acompanhar ao solo e consolidar posição dominante',
      'Recuar para a guarda',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 8:00',
  },

  // ── v-11 Ippon seoi-nage ───────────────────────────────────────────────
  {
    id: 'q-v11-1',
    video_id: 'v-11',
    question: 'Qual a pegada clássica para o ippon seoi-nage?',
    options: [
      'Gola e calça',
      'Manga e gola alta',
      'Ambas as mangas',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 2:30',
  },
  {
    id: 'q-v11-2',
    video_id: 'v-11',
    question: 'Durante a entrada do seoi-nage, os joelhos devem...',
    options: [
      'Ficar estendidos',
      'Flexionar para abaixar o centro de gravidade',
      'Não importa a posição',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 5:45',
  },
  {
    id: 'q-v11-3',
    video_id: 'v-11',
    question:
      'Qual o erro mais comum ao adaptar o seoi-nage para o BJJ?',
    options: [
      'Entrar muito longe do oponente',
      'Dar as costas sem controle de manga',
      'Flexionar demais os joelhos',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 9:00',
  },

  // ── v-12 Footwork e pegada ─────────────────────────────────────────────
  {
    id: 'q-v12-1',
    video_id: 'v-12',
    question: 'Qual o padrão de movimentação básico no Judô?',
    options: [
      'Cruzar os pés ao se mover',
      'Tsugi-ashi (pé deslizante, sem cruzar)',
      'Saltar com os dois pés',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 1:30',
  },
  {
    id: 'q-v12-2',
    video_id: 'v-12',
    question: 'A pegada dominante no Judô geralmente é...',
    options: [
      'Manga e gola no mesmo lado',
      'Manga de um lado e gola do lado oposto',
      'Duas mãos na gola',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 4:00',
  },
  {
    id: 'q-v12-3',
    video_id: 'v-12',
    question:
      'Por que a pegada é importante para o Jiu-Jiteiro que treina Judô?',
    options: [
      'Apenas para estética',
      'Controla a distância e configura quedas e puxadas para guarda',
      'Não tem importância no BJJ',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 6:30',
  },

  // ── v-13 Preparação física funcional ───────────────────────────────────
  {
    id: 'q-v13-1',
    video_id: 'v-13',
    question:
      'Qual qualidade física é mais importante para um lutador de BJJ?',
    options: [
      'Força máxima isolada',
      'Resistência muscular e cardio combinados',
      'Flexibilidade extrema',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 3:00',
  },
  {
    id: 'q-v13-2',
    video_id: 'v-13',
    question: 'O treino funcional para lutadores prioriza...',
    options: [
      'Máquinas de academia',
      'Movimentos compostos com peso corporal e pesos livres',
      'Apenas corrida em esteira',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 8:00',
  },
  {
    id: 'q-v13-3',
    video_id: 'v-13',
    question: 'Qual exercício é mais transferível para o Jiu-Jitsu?',
    options: [
      'Rosca bíceps',
      'Turkish get-up',
      'Extensão de pernas na máquina',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 14:00',
  },

  // ── v-14 Aquecimento e alongamento ─────────────────────────────────────
  {
    id: 'q-v14-1',
    video_id: 'v-14',
    question: 'Qual tipo de alongamento é recomendado ANTES do treino?',
    options: [
      'Alongamento estático prolongado',
      'Alongamento dinâmico e mobilidade articular',
      'Nenhum, é melhor treinar frio',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 2:00',
  },
  {
    id: 'q-v14-2',
    video_id: 'v-14',
    question:
      'Qual articulação precisa de mais atenção no aquecimento para BJJ?',
    options: ['Pulsos', 'Quadril e ombros', 'Cotovelos'],
    correct_index: 1,
    timestamp_hint: 'Reveja 5:30',
  },
  {
    id: 'q-v14-3',
    video_id: 'v-14',
    question: 'Alongamento estático é mais indicado em qual momento?',
    options: [
      'Antes do treino',
      'Após o treino como volta à calma',
      'Durante os drills',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 11:00',
  },

  // ── v-15 Estratégia de competição ──────────────────────────────────────
  {
    id: 'q-v15-1',
    video_id: 'v-15',
    question: 'O que é um gameplan de competição?',
    options: [
      'Apenas uma lista de golpes favoritos',
      'Um plano estratégico com cenários, técnicas preferenciais e gestão de tempo',
      'Decorar as regras do campeonato',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 3:00',
  },
  {
    id: 'q-v15-2',
    video_id: 'v-15',
    question:
      'Quando você está ganhando por vantagem, a melhor estratégia é...',
    options: [
      'Buscar a finalização a todo custo',
      'Controlar o ritmo, manter posição e gerenciar o tempo',
      'Ficar parado esperando o tempo acabar',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 12:00',
  },
  {
    id: 'q-v15-3',
    video_id: 'v-15',
    question: 'Estudar o adversário antes da luta serve para...',
    options: [
      'Apenas intimidar',
      'Identificar padrões, pontos fortes e fracos para adaptar o gameplan',
      'Não tem utilidade real',
    ],
    correct_index: 1,
    timestamp_hint: 'Reveja 18:00',
  },
];

// ---------------------------------------------------------------------------
// WATCH PROGRESS — 7 students
// ---------------------------------------------------------------------------

function prog(
  student_id: string,
  video_id: string,
  progress_seconds: number,
  completed: boolean,
): WatchProgress {
  const video = ALL_VIDEOS.find((v) => v.id === video_id)!;
  return {
    student_id,
    video_id,
    progress_seconds,
    total_seconds: video.duration_seconds,
    completed,
    ...(completed ? { completed_at: '2026-02-20T18:00:00Z' } : {}),
    last_watched_at: '2026-03-10T10:00:00Z',
  };
}

const ALL_PROGRESS: WatchProgress[] = [
  // ── João (stu-1): 12/15 watched ───────────────────────────────────────
  // Fundamentos complete
  prog('stu-1', 'v-1', 480, true),
  prog('stu-1', 'v-2', 720, true),
  prog('stu-1', 'v-3', 900, true),
  prog('stu-1', 'v-4', 600, true),
  prog('stu-1', 'v-5', 480, true),
  // Intermediário: 3 done, watching v-9
  prog('stu-1', 'v-6', 1080, true),
  prog('stu-1', 'v-7', 840, true),
  prog('stu-1', 'v-8', 720, true),
  prog('stu-1', 'v-9', 502, false),
  // Judo complete
  prog('stu-1', 'v-10', 600, true),
  prog('stu-1', 'v-11', 720, true),
  prog('stu-1', 'v-12', 480, true),
  // Standalone all watched
  prog('stu-1', 'v-13', 1200, true),
  prog('stu-1', 'v-14', 900, true),

  // ── Rafael (stu-rafael): 15/15 completed ──────────────────────────────
  ...ALL_VIDEOS.map((v) => prog('stu-rafael', v.id, v.duration_seconds, true)),

  // ── Luciana (stu-luciana): 5/5 fundamentos done ───────────────────────
  prog('stu-luciana', 'v-1', 480, true),
  prog('stu-luciana', 'v-2', 720, true),
  prog('stu-luciana', 'v-3', 900, true),
  prog('stu-luciana', 'v-4', 600, true),
  prog('stu-luciana', 'v-5', 480, true),

  // ── Marcos (stu-marcos): 2/15, stopped at v-3 ─────────────────────────
  prog('stu-marcos', 'v-1', 480, true),
  prog('stu-marcos', 'v-2', 720, true),
  prog('stu-marcos', 'v-3', 190, false),

  // ── Sophia (stu-teen-sophia): 5/15, watching v-4 ──────────────────────
  prog('stu-teen-sophia', 'v-1', 480, true),
  prog('stu-teen-sophia', 'v-2', 720, true),
  prog('stu-teen-sophia', 'v-3', 900, true),
  prog('stu-teen-sophia', 'v-10', 600, true),
  prog('stu-teen-sophia', 'v-4', 240, false),

  // ── Lucas (stu-teen-lucas): 3/15 (v-1, v-2, v-3 completed) ───────────
  prog('stu-teen-lucas', 'v-1', 480, true),
  prog('stu-teen-lucas', 'v-2', 720, true),
  prog('stu-teen-lucas', 'v-3', 900, true),

  // ── Helena (stu-kids-helena): 4 videos (v-1, v-2, v-10, v-14) ────────
  prog('stu-kids-helena', 'v-1', 480, true),
  prog('stu-kids-helena', 'v-2', 720, true),
  prog('stu-kids-helena', 'v-10', 600, true),
  prog('stu-kids-helena', 'v-14', 900, true),
];

// ---------------------------------------------------------------------------
// BELT UTILITIES
// ---------------------------------------------------------------------------

const BELT_RANK: Record<string, number> = {
  white: 0,
  grey: 1,
  yellow: 2,
  orange: 3,
  green: 4,
  blue: 5,
  purple: 6,
  brown: 7,
  black: 8,
};

function beltAllows(studentBelt: string, minBelt: string): boolean {
  return (BELT_RANK[studentBelt] ?? 0) >= (BELT_RANK[minBelt] ?? 0);
}

// ---------------------------------------------------------------------------
// MOCK FUNCTIONS
// ---------------------------------------------------------------------------

export async function mockGetLibrary(
  profileId: string,
  _role: string,
  belt: string,
): Promise<StreamingLibrary> {
  await delay();

  const studentProgress = ALL_PROGRESS.filter(
    (p) => p.student_id === profileId,
  );

  // Featured: first series with incomplete progress
  const incompleteSeries = ALL_SERIES.find((s) => {
    const seriesVideos = ALL_VIDEOS.filter((v) => v.series_id === s.id);
    const completedCount = seriesVideos.filter((v) =>
      studentProgress.some((p) => p.video_id === v.id && p.completed),
    ).length;
    return completedCount > 0 && completedCount < seriesVideos.length;
  });

  const featured = incompleteSeries ?? ALL_SERIES[0];

  // Continue watching: in-progress episodes
  const continueWatching = studentProgress.filter((p) => !p.completed);

  // Recommended: series matching belt
  const recommended = ALL_SERIES.filter((s) => beltAllows(belt, s.min_belt));

  // Recent: last 5 videos by created_at
  const recent = [...ALL_VIDEOS]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  return {
    featured,
    continue_watching: continueWatching,
    recommended,
    trails: ALL_TRAILS,
    all_series: ALL_SERIES,
    recent,
  };
}

export async function mockGetSeriesDetail(
  seriesId: string,
): Promise<SeriesDetail> {
  await delay();

  const series = ALL_SERIES.find((s) => s.id === seriesId) ?? ALL_SERIES[0];
  const videoIds = series.videos.map((v) => v.id);
  const progress = ALL_PROGRESS.filter(
    (p) => p.student_id === 'stu-1' && videoIds.includes(p.video_id),
  );
  const quizzes = ALL_QUIZ.filter((q) => videoIds.includes(q.video_id));
  const quiz_questions: Record<string, QuizQuestion[]> = {};
  quizzes.forEach((q) => {
    if (!quiz_questions[q.video_id]) quiz_questions[q.video_id] = [];
    quiz_questions[q.video_id].push(q);
  });

  return {
    series,
    progress,
    quiz_questions,
  };
}

export async function mockGetEpisode(
  episodeId: string,
): Promise<StreamingVideo> {
  await delay();

  return ALL_VIDEOS.find((v) => v.id === episodeId) ?? ALL_VIDEOS[0];
}

export async function mockGetContinueWatching(
  studentId: string,
): Promise<WatchProgress[]> {
  await delay();

  return ALL_PROGRESS.filter(
    (p) => p.student_id === studentId && !p.completed,
  );
}

export async function mockGetRecommended(
  studentId: string,
): Promise<StreamingSeries[]> {
  await delay();

  const studentProgress = ALL_PROGRESS.filter(
    (p) => p.student_id === studentId,
  );
  const watchedVideoIds = new Set(studentProgress.map((p) => p.video_id));
  const startedSeriesIds = new Set(
    ALL_SERIES.filter((s) => s.videos.some((v) => watchedVideoIds.has(v.id))).map((s) => s.id),
  );

  return ALL_SERIES.filter((s) => !startedSeriesIds.has(s.id));
}

export async function mockTrackProgress(
  _studentId: string,
  _episodeId: string,
  _progressSeconds: number,
): Promise<void> {
  await delay();
}

export async function mockCompleteEpisode(
  _studentId: string,
  episodeId: string,
): Promise<EpisodeCompletionResult> {
  await delay();

  const video = ALL_VIDEOS.find((v) => v.id === episodeId);
  let next_episode: StreamingVideo | null = null;

  if (video && video.series_id) {
    const seriesVideos = ALL_VIDEOS
      .filter((v) => v.series_id === video.series_id)
      .sort((a, b) => a.order - b.order);

    const currentIndex = seriesVideos.findIndex((v) => v.id === episodeId);
    if (currentIndex >= 0 && currentIndex < seriesVideos.length - 1) {
      next_episode = seriesVideos[currentIndex + 1];
    }
  }

  return {
    xp_gained: 10,
    next_episode,
    quiz_available: true,
  };
}

export async function mockSubmitQuiz(
  _studentId: string,
  episodeId: string,
  answers: number[],
): Promise<QuizResult> {
  await delay();

  const questions = ALL_QUIZ.filter((q) => q.video_id === episodeId);
  let score = 0;
  const wrong_answers: { question: string; hint: string }[] = [];

  questions.forEach((q, i) => {
    if (answers[i] === q.correct_index) {
      score++;
    } else {
      wrong_answers.push({
        question: q.question,
        hint: q.timestamp_hint ?? '',
      });
    }
  });

  return {
    score,
    total: 3,
    xp_gained: score * 5,
    passed: score >= 2,
    wrong_answers,
  };
}

export async function mockGetTrails(
  _academyId: string,
  _belt?: string,
): Promise<StreamingTrail[]> {
  await delay();

  return ALL_TRAILS;
}

export async function mockGetTrailProgress(
  studentId: string,
  trailId: string,
): Promise<TrailProgress> {
  await delay();

  const trail = ALL_TRAILS.find((t) => t.id === trailId) ?? ALL_TRAILS[0];
  const trailVideos = trail.series.flatMap((s) => s.videos);
  const studentProg = ALL_PROGRESS.filter(
    (p) =>
      p.student_id === studentId &&
      trailVideos.some((v) => v.id === p.video_id),
  );
  const completedCount = studentProg.filter((p) => p.completed).length;
  const totalCount = trailVideos.length;
  const completedSeriesIds = trail.series
    .filter((s) => s.videos.every((v) => studentProg.some((p) => p.video_id === v.id && p.completed)))
    .map((s) => s.id);
  const quizScores = studentProg.filter((p) => p.completed).length;

  return {
    trail,
    completed_videos: completedCount,
    total_videos: totalCount,
    completed_series: completedSeriesIds,
    average_quiz_score: quizScores > 0 ? 80 : 0,
    certificate: completedCount === totalCount ? {
      id: `cert-${studentId}-${trailId}`,
      student_name: 'Aluno',
      trail_name: trail.name,
      professor_name: 'Prof. André',
      academy_name: 'BlackBelt Academy',
      total_videos: totalCount,
      total_duration: trail.total_duration,
      score: 80,
      issued_at: '2026-03-01T12:00:00Z',
      verification_code: `BB-${trailId}-${studentId}`,
      pdf_url: '',
    } : null,
  };
}

export async function mockGenerateCertificate(
  studentId: string,
  trailId: string,
): Promise<StreamingCertificate> {
  await delay();

  const trail = ALL_TRAILS.find((t) => t.id === trailId) ?? ALL_TRAILS[0];

  return {
    id: `cert-${studentId}-${trailId}`,
    student_name: 'Aluno',
    trail_name: trail.name,
    professor_name: 'Prof. André',
    academy_name: 'BlackBelt Academy',
    total_videos: trail.total_videos,
    total_duration: trail.total_duration,
    score: 80,
    issued_at: new Date().toISOString(),
    verification_code: `BB-${trailId}-${studentId}`,
    pdf_url: '',
  };
}
