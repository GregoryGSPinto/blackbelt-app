import type {
  VideoExperience,
  Comentario,
  Duvida,
  NotaPessoal,
} from '@/lib/api/video-experience.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

// ── Professor ──────────────────────────────────────────────────────────

const PROFESSOR: VideoExperience['professor'] = {
  id: 'prof-nakamura-001',
  nome: 'André Nakamura',
  avatar: '/mock/avatars/prof-nakamura.jpg',
  faixa: 'preta',
  graus: 3,
  bio: 'Faixa preta 3° grau com mais de 20 anos de experiência em Jiu-Jitsu Brasileiro. Formado pela Alliance, competidor internacional e referência no ensino de fundamentos. Especialista em guarda fechada e jogo por cima.',
  totalVideos: 45,
  totalAlunos: 180,
};

// ── Serie ──────────────────────────────────────────────────────────────

const SERIE: NonNullable<VideoExperience['serie']> = {
  id: 'serie-fund-ataque-001',
  nome: 'Fundamentos de Ataque',
  totalEpisodios: 8,
  episodioAtual: 3,
  proximoEpisodio: 'vid-004',
  episodioAnterior: 'vid-002',
};

// ── Videos ─────────────────────────────────────────────────────────────

const VIDEOS: Record<string, VideoExperience['video']> = {
  'vid-001': {
    id: 'vid-001',
    titulo: 'Armbar da Guarda Fechada — Passo a Passo',
    descricao: 'Aprenda a finalização mais clássica do Jiu-Jitsu partindo da guarda fechada.',
    descricaoCompleta: 'Nesta aula completa, o Professor André Nakamura ensina o armbar (chave de braço) partindo da guarda fechada. Você vai aprender desde o controle de postura do oponente, passando pelo isolamento do braço, pivotamento do quadril, até a finalização com a hiperextensão do cotovelo. A técnica é demonstrada em ritmo lento com repetições, e depois em velocidade real contra resistência. Inclui as 3 variações mais comuns e os erros mais frequentes dos iniciantes.',
    videoUrl: '/mock/videos/armbar-guarda-fechada.mp4',
    thumbnailUrl: '/mock/thumbs/armbar-guarda-fechada.jpg',
    duracaoSegundos: 754,
    duracaoFormatada: '12:34',
    qualidade: '1080p',
    modalidade: 'BJJ',
    faixa: 'Branca+',
    categoria: 'Finalização',
    dificuldade: 'Iniciante',
    tags: ['armbar', 'guarda fechada', 'finalização', 'braço', 'fundamentos', 'iniciante'],
    publicadoEm: '2026-01-15T10:00:00Z',
    atualizadoEm: '2026-02-20T14:30:00Z',
  },
  'vid-002': {
    id: 'vid-002',
    titulo: 'Triângulo da Guarda — Setup e Finalização',
    descricao: 'Domine o triângulo (triangle choke) com os melhores setups da guarda fechada e aberta.',
    descricaoCompleta: 'O triângulo é uma das finalizações mais versáteis do Jiu-Jitsu. Nesta aula, o Professor André Nakamura mostra 4 entradas diferentes para o triângulo, os ajustes finos que fazem a diferença entre um triângulo apertado e um que escapa, e como combinar o triângulo com o armbar para criar um ataque duplo letal. Cobrimos também a defesa mais comum e como neutralizá-la.',
    videoUrl: '/mock/videos/triangulo-guarda.mp4',
    thumbnailUrl: '/mock/thumbs/triangulo-guarda.jpg',
    duracaoSegundos: 920,
    duracaoFormatada: '15:20',
    qualidade: '1080p',
    modalidade: 'BJJ',
    faixa: 'Branca+',
    categoria: 'Finalização',
    dificuldade: 'Iniciante',
    tags: ['triângulo', 'triangle', 'estrangulamento', 'guarda', 'fundamentos'],
    publicadoEm: '2026-01-22T10:00:00Z',
    atualizadoEm: '2026-02-22T11:00:00Z',
  },
  'vid-003': {
    id: 'vid-003',
    titulo: 'Passagem de Guarda com Pressão',
    descricao: 'Técnicas de passagem de guarda usando pressão e controle de quadril para faixas azuis.',
    descricaoCompleta: 'Para faixas azuis que querem evoluir seu jogo por cima, esta aula cobre as 3 passagens de pressão mais eficientes: toreando com pressão, over-under pass e leg weave. O Professor André Nakamura explica os princípios de pressão — ângulo, peso e timing — que se aplicam a qualquer passagem. Inclui drilling sequences e situational sparring.',
    videoUrl: '/mock/videos/passagem-pressao.mp4',
    thumbnailUrl: '/mock/thumbs/passagem-pressao.jpg',
    duracaoSegundos: 645,
    duracaoFormatada: '10:45',
    qualidade: '1080p',
    modalidade: 'BJJ',
    faixa: 'Azul+',
    categoria: 'Passagem',
    dificuldade: 'Intermediário',
    tags: ['passagem', 'pressão', 'guarda', 'toreando', 'over-under', 'jogo por cima'],
    publicadoEm: '2026-01-29T10:00:00Z',
    atualizadoEm: '2026-03-01T09:00:00Z',
  },
  'vid-004': {
    id: 'vid-004',
    titulo: 'Raspagem de Tesoura — Clássico do BJJ',
    descricao: 'A raspagem mais fundamental do Jiu-Jitsu: scissor sweep da guarda fechada.',
    descricaoCompleta: 'A raspagem de tesoura (scissor sweep) é a primeira raspagem que todo praticante de BJJ deve dominar. O Professor André Nakamura detalha cada componente: o grip correto na manga e gola, o posicionamento da perna de cima como barreira, o corte com a perna de baixo na canela, e o timing do movimento de tesoura. Mostra também 3 combinações quando o oponente defende a tesoura: hip bump, guilhotina e triângulo.',
    videoUrl: '/mock/videos/raspagem-tesoura.mp4',
    thumbnailUrl: '/mock/thumbs/raspagem-tesoura.jpg',
    duracaoSegundos: 510,
    duracaoFormatada: '8:30',
    qualidade: '1080p',
    modalidade: 'BJJ',
    faixa: 'Branca+',
    categoria: 'Raspagem',
    dificuldade: 'Iniciante',
    tags: ['raspagem', 'tesoura', 'scissor sweep', 'guarda fechada', 'fundamentos'],
    publicadoEm: '2026-02-05T10:00:00Z',
    atualizadoEm: '2026-03-05T15:00:00Z',
  },
  'vid-005': {
    id: 'vid-005',
    titulo: 'Defesa de Finalização — Escapes Essenciais',
    descricao: 'Os escapes fundamentais que todo praticante precisa dominar para sobreviver.',
    descricaoCompleta: 'Saber escapar é tão importante quanto saber atacar. Nesta aula, o Professor André Nakamura ensina os escapes essenciais: defesa do armbar (empilhar, girar, esconder o braço), defesa do triângulo (postura, mãos no quadril, passagem), defesa da guilhotina (von Flue choke, passagem lateral) e defesa do mata-leão (proteger o pescoço, derrubar de costas, escape pelo quadril). Cada escape é mostrado em 3 cenários: prevenção, reação e último recurso.',
    videoUrl: '/mock/videos/defesa-finalizacao.mp4',
    thumbnailUrl: '/mock/thumbs/defesa-finalizacao.jpg',
    duracaoSegundos: 675,
    duracaoFormatada: '11:15',
    qualidade: '1080p',
    modalidade: 'BJJ',
    faixa: 'Branca+',
    categoria: 'Defesa',
    dificuldade: 'Iniciante',
    tags: ['defesa', 'escape', 'finalização', 'sobrevivência', 'fundamentos'],
    publicadoEm: '2026-02-12T10:00:00Z',
    atualizadoEm: '2026-03-10T12:00:00Z',
  },
};

// ── Chapters per video ─────────────────────────────────────────────────

const CHAPTERS_BY_VIDEO: Record<string, VideoExperience['capitulos']> = {
  'vid-001': [
    { tempo: 0, tempoFormatado: '0:00', titulo: 'Introdução', descricao: 'Apresentação da técnica e contexto no Jiu-Jitsu' },
    { tempo: 45, tempoFormatado: '0:45', titulo: 'Controle de postura', descricao: 'Como quebrar a postura do oponente na guarda fechada' },
    { tempo: 120, tempoFormatado: '2:00', titulo: 'Isolamento do braço', descricao: 'Técnicas para isolar o braço alvo do oponente' },
    { tempo: 195, tempoFormatado: '3:15', titulo: 'Pivô do quadril', descricao: 'O movimento de quadril que cria o ângulo correto' },
    { tempo: 270, tempoFormatado: '4:30', titulo: 'Posição das pernas', descricao: 'Onde posicionar as pernas para controle máximo' },
    { tempo: 345, tempoFormatado: '5:45', titulo: 'Finalização', descricao: 'Hiperextensão do cotovelo — detalhes finos' },
    { tempo: 420, tempoFormatado: '7:00', titulo: 'Variação 1: Armbar cruzado', descricao: 'Quando o oponente defende com a mão oposta' },
    { tempo: 510, tempoFormatado: '8:30', titulo: 'Variação 2: Armbar com triângulo', descricao: 'Combinação armbar + triângulo quando ele resiste' },
    { tempo: 600, tempoFormatado: '10:00', titulo: 'Erros comuns', descricao: 'Os 5 erros mais frequentes dos iniciantes' },
    { tempo: 690, tempoFormatado: '11:30', titulo: 'Drilling e revisão', descricao: 'Sequência de treino e resumo final' },
  ],
  'vid-002': [
    { tempo: 0, tempoFormatado: '0:00', titulo: 'Introdução ao triângulo' },
    { tempo: 60, tempoFormatado: '1:00', titulo: 'Setup 1: Controle de manga' },
    { tempo: 150, tempoFormatado: '2:30', titulo: 'Setup 2: Overhook entry' },
    { tempo: 240, tempoFormatado: '4:00', titulo: 'Setup 3: Hip bump para triângulo' },
    { tempo: 330, tempoFormatado: '5:30', titulo: 'Setup 4: Da guarda aberta' },
    { tempo: 420, tempoFormatado: '7:00', titulo: 'Ajustes finos: ângulo e aperto' },
    { tempo: 540, tempoFormatado: '9:00', titulo: 'Combinação triângulo + armbar' },
    { tempo: 660, tempoFormatado: '11:00', titulo: 'Defesas comuns e contra-ataques' },
    { tempo: 780, tempoFormatado: '13:00', titulo: 'Drilling em dupla' },
    { tempo: 870, tempoFormatado: '14:30', titulo: 'Resumo e dicas finais' },
  ],
  'vid-003': [
    { tempo: 0, tempoFormatado: '0:00', titulo: 'Princípios de pressão' },
    { tempo: 50, tempoFormatado: '0:50', titulo: 'Ângulo e distribuição de peso' },
    { tempo: 120, tempoFormatado: '2:00', titulo: 'Toreando com pressão' },
    { tempo: 200, tempoFormatado: '3:20', titulo: 'Over-under pass detalhado' },
    { tempo: 290, tempoFormatado: '4:50', titulo: 'Leg weave pass' },
    { tempo: 370, tempoFormatado: '6:10', titulo: 'Consolidação do side control' },
    { tempo: 430, tempoFormatado: '7:10', titulo: 'Contra-ataques comuns e soluções' },
    { tempo: 500, tempoFormatado: '8:20', titulo: 'Drilling sequences' },
    { tempo: 570, tempoFormatado: '9:30', titulo: 'Situational sparring' },
    { tempo: 620, tempoFormatado: '10:20', titulo: 'Revisão final' },
  ],
  'vid-004': [
    { tempo: 0, tempoFormatado: '0:00', titulo: 'Introdução à raspagem de tesoura' },
    { tempo: 40, tempoFormatado: '0:40', titulo: 'Grips: manga e gola' },
    { tempo: 100, tempoFormatado: '1:40', titulo: 'Perna de cima como barreira' },
    { tempo: 160, tempoFormatado: '2:40', titulo: 'Corte com a perna de baixo' },
    { tempo: 220, tempoFormatado: '3:40', titulo: 'Timing do movimento de tesoura' },
    { tempo: 280, tempoFormatado: '4:40', titulo: 'Combinação 1: Hip bump' },
    { tempo: 340, tempoFormatado: '5:40', titulo: 'Combinação 2: Guilhotina' },
    { tempo: 390, tempoFormatado: '6:30', titulo: 'Combinação 3: Triângulo' },
    { tempo: 440, tempoFormatado: '7:20', titulo: 'Erros comuns e correções' },
    { tempo: 480, tempoFormatado: '8:00', titulo: 'Drilling e resumo' },
  ],
  'vid-005': [
    { tempo: 0, tempoFormatado: '0:00', titulo: 'Introdução aos escapes' },
    { tempo: 55, tempoFormatado: '0:55', titulo: 'Defesa do armbar: empilhar' },
    { tempo: 130, tempoFormatado: '2:10', titulo: 'Defesa do armbar: girar e esconder' },
    { tempo: 205, tempoFormatado: '3:25', titulo: 'Defesa do triângulo: postura' },
    { tempo: 280, tempoFormatado: '4:40', titulo: 'Defesa do triângulo: passagem' },
    { tempo: 350, tempoFormatado: '5:50', titulo: 'Defesa da guilhotina: Von Flue' },
    { tempo: 420, tempoFormatado: '7:00', titulo: 'Defesa do mata-leão: proteger pescoço' },
    { tempo: 500, tempoFormatado: '8:20', titulo: 'Escape de último recurso' },
    { tempo: 580, tempoFormatado: '9:40', titulo: 'Princípios gerais de sobrevivência' },
    { tempo: 650, tempoFormatado: '10:50', titulo: 'Drilling e revisão final' },
  ],
};

// ── Related techniques per video ───────────────────────────────────────

const TECNICAS_BY_VIDEO: Record<string, VideoExperience['tecnicasRelacionadas']> = {
  'vid-001': [
    { id: 'tec-001', nome: 'Armbar da Montada', posicao: 'Montada', categoria: 'Finalização', faixa: 'Branca', temVideo: true, videoId: 'vid-010' },
    { id: 'tec-002', nome: 'Triângulo da Guarda Fechada', posicao: 'Guarda Fechada', categoria: 'Finalização', faixa: 'Branca', temVideo: true, videoId: 'vid-002' },
    { id: 'tec-003', nome: 'Kimura da Guarda Fechada', posicao: 'Guarda Fechada', categoria: 'Finalização', faixa: 'Branca', temVideo: false },
    { id: 'tec-004', nome: 'Omoplata', posicao: 'Guarda Fechada', categoria: 'Finalização', faixa: 'Azul', temVideo: true, videoId: 'vid-011' },
    { id: 'tec-005', nome: 'Hip Bump Sweep', posicao: 'Guarda Fechada', categoria: 'Raspagem', faixa: 'Branca', temVideo: true, videoId: 'vid-012' },
  ],
  'vid-002': [
    { id: 'tec-001', nome: 'Armbar da Guarda Fechada', posicao: 'Guarda Fechada', categoria: 'Finalização', faixa: 'Branca', temVideo: true, videoId: 'vid-001' },
    { id: 'tec-006', nome: 'Triângulo Invertido', posicao: 'Montada', categoria: 'Finalização', faixa: 'Roxa', temVideo: false },
    { id: 'tec-007', nome: 'Gogoplata', posicao: 'Guarda Fechada', categoria: 'Finalização', faixa: 'Marrom', temVideo: false },
    { id: 'tec-003', nome: 'Kimura da Guarda Fechada', posicao: 'Guarda Fechada', categoria: 'Finalização', faixa: 'Branca', temVideo: false },
    { id: 'tec-004', nome: 'Omoplata', posicao: 'Guarda Fechada', categoria: 'Finalização', faixa: 'Azul', temVideo: true, videoId: 'vid-011' },
  ],
  'vid-003': [
    { id: 'tec-008', nome: 'Toreando Clássico', posicao: 'Em pé / Guarda', categoria: 'Passagem', faixa: 'Branca', temVideo: true, videoId: 'vid-013' },
    { id: 'tec-009', nome: 'Knee Cut Pass', posicao: 'Meia-Guarda', categoria: 'Passagem', faixa: 'Azul', temVideo: true, videoId: 'vid-014' },
    { id: 'tec-010', nome: 'Leg Drag', posicao: 'Guarda Aberta', categoria: 'Passagem', faixa: 'Azul', temVideo: false },
    { id: 'tec-011', nome: 'Stack Pass', posicao: 'Guarda Fechada', categoria: 'Passagem', faixa: 'Branca', temVideo: true, videoId: 'vid-015' },
    { id: 'tec-012', nome: 'X-Pass', posicao: 'Guarda Aberta', categoria: 'Passagem', faixa: 'Azul', temVideo: false },
  ],
  'vid-004': [
    { id: 'tec-013', nome: 'Hip Bump Sweep', posicao: 'Guarda Fechada', categoria: 'Raspagem', faixa: 'Branca', temVideo: true, videoId: 'vid-012' },
    { id: 'tec-014', nome: 'Flower Sweep', posicao: 'Guarda Fechada', categoria: 'Raspagem', faixa: 'Branca', temVideo: false },
    { id: 'tec-015', nome: 'Pendulum Sweep', posicao: 'Guarda Fechada', categoria: 'Raspagem', faixa: 'Azul', temVideo: false },
    { id: 'tec-001', nome: 'Armbar da Guarda Fechada', posicao: 'Guarda Fechada', categoria: 'Finalização', faixa: 'Branca', temVideo: true, videoId: 'vid-001' },
    { id: 'tec-002', nome: 'Triângulo da Guarda Fechada', posicao: 'Guarda Fechada', categoria: 'Finalização', faixa: 'Branca', temVideo: true, videoId: 'vid-002' },
  ],
  'vid-005': [
    { id: 'tec-001', nome: 'Armbar da Guarda Fechada', posicao: 'Guarda Fechada', categoria: 'Finalização', faixa: 'Branca', temVideo: true, videoId: 'vid-001' },
    { id: 'tec-002', nome: 'Triângulo da Guarda Fechada', posicao: 'Guarda Fechada', categoria: 'Finalização', faixa: 'Branca', temVideo: true, videoId: 'vid-002' },
    { id: 'tec-016', nome: 'Guilhotina Standing', posicao: 'Em pé', categoria: 'Finalização', faixa: 'Branca', temVideo: false },
    { id: 'tec-017', nome: 'Mata-Leão', posicao: 'Costas', categoria: 'Finalização', faixa: 'Branca', temVideo: true, videoId: 'vid-016' },
    { id: 'tec-018', nome: 'Bridge and Roll', posicao: 'Montada (inferior)', categoria: 'Escape', faixa: 'Branca', temVideo: false },
  ],
};

// ── Related videos ─────────────────────────────────────────────────────

const VIDEOS_RELACIONADOS: VideoExperience['videosRelacionados'] = [
  { id: 'vid-002', titulo: 'Triângulo da Guarda — Setup e Finalização', thumbnail: '/mock/thumbs/triangulo-guarda.jpg', duracao: '15:20', professor: 'André Nakamura', categoria: 'Finalização', assistido: true },
  { id: 'vid-003', titulo: 'Passagem de Guarda com Pressão', thumbnail: '/mock/thumbs/passagem-pressao.jpg', duracao: '10:45', professor: 'André Nakamura', categoria: 'Passagem', assistido: false },
  { id: 'vid-004', titulo: 'Raspagem de Tesoura — Clássico do BJJ', thumbnail: '/mock/thumbs/raspagem-tesoura.jpg', duracao: '8:30', professor: 'André Nakamura', categoria: 'Raspagem', assistido: false },
  { id: 'vid-005', titulo: 'Defesa de Finalização — Escapes Essenciais', thumbnail: '/mock/thumbs/defesa-finalizacao.jpg', duracao: '11:15', professor: 'André Nakamura', categoria: 'Defesa', assistido: false },
  { id: 'vid-010', titulo: 'Armbar da Montada — Controle Total', thumbnail: '/mock/thumbs/armbar-montada.jpg', duracao: '9:45', professor: 'André Nakamura', categoria: 'Finalização', assistido: false },
  { id: 'vid-011', titulo: 'Omoplata — Da Guarda à Finalização', thumbnail: '/mock/thumbs/omoplata.jpg', duracao: '13:10', professor: 'André Nakamura', categoria: 'Finalização', assistido: true },
  { id: 'vid-012', titulo: 'Hip Bump Sweep + Guilhotina', thumbnail: '/mock/thumbs/hip-bump.jpg', duracao: '7:20', professor: 'André Nakamura', categoria: 'Raspagem', assistido: false },
  { id: 'vid-020', titulo: 'Kimura da Meia-Guarda — Setup Profundo', thumbnail: '/mock/thumbs/kimura-meia.jpg', duracao: '14:00', professor: 'Carlos Mendes', categoria: 'Finalização', assistido: false },
];

// ── Comments (video 1) — 10 comments ──────────────────────────────────

const COMENTARIOS_VIDEO_001: Comentario[] = [
  {
    id: 'com-001',
    autorId: 'prof-nakamura-001',
    autorNome: 'André Nakamura',
    autorAvatar: '/mock/avatars/prof-nakamura.jpg',
    autorFaixa: 'preta',
    texto: 'Pessoal, prestem atenção especial no detalhe do pivô de quadril aos 3:15. Esse é o ponto que mais faz diferença na hora de apertar o armbar. Se tiverem dúvidas, comentem com o timestamp que eu respondo!',
    curtidas: 23,
    curtidoPorMim: false,
    respostas: [
      {
        id: 'com-001-r1',
        autorId: 'aluno-007',
        autorNome: 'Felipe Santos',
        autorAvatar: '/mock/avatars/felipe-santos.jpg',
        autorFaixa: 'branca',
        texto: 'Professor, muito obrigado pela dica! Estava errando exatamente nesse ponto. Depois de ajustar o pivô, consegui finalizar 3 vezes no treino de hoje.',
        curtidas: 5,
        curtidoPorMim: false,
        respostas: [],
        criadoEm: '2026-02-16T15:30:00Z',
        editado: false,
        fixado: false,
        ehProfessor: false,
      },
      {
        id: 'com-001-r2',
        autorId: 'aluno-012',
        autorNome: 'Mariana Costa',
        autorAvatar: '/mock/avatars/mariana-costa.jpg',
        autorFaixa: 'azul',
        texto: 'Verdade! Esse detalhe do quadril mudou completamente meu armbar. Antes eu tentava puxar o braço com força, agora entendi que é o quadril que faz o trabalho.',
        curtidas: 3,
        curtidoPorMim: true,
        respostas: [],
        criadoEm: '2026-02-17T09:15:00Z',
        editado: false,
        fixado: false,
        ehProfessor: false,
      },
    ],
    criadoEm: '2026-02-15T10:00:00Z',
    editado: false,
    fixado: true,
    ehProfessor: true,
    timestamp: 195,
  },
  {
    id: 'com-002',
    autorId: 'aluno-001',
    autorNome: 'Lucas Oliveira',
    autorAvatar: '/mock/avatars/lucas-oliveira.jpg',
    autorFaixa: 'branca',
    texto: 'Melhor vídeo de armbar que já vi! A explicação do Professor André é muito clara. Estou no primeiro mês de treino e já consegui aplicar no sparring. Valeu demais!',
    curtidas: 15,
    curtidoPorMim: true,
    respostas: [],
    criadoEm: '2026-02-16T08:30:00Z',
    editado: false,
    fixado: false,
    ehProfessor: false,
  },
  {
    id: 'com-003',
    autorId: 'aluno-002',
    autorNome: 'Beatriz Ferreira',
    autorAvatar: '/mock/avatars/beatriz-ferreira.jpg',
    autorFaixa: 'azul',
    texto: 'No minuto 5:45, quando o professor mostra a finalização, ele fala sobre "apertar os joelhos". Alguém mais sentiu que esse detalhe fez toda a diferença? Eu estava fazendo o armbar com os joelhos abertos e o pessoal escapava fácil.',
    curtidas: 8,
    curtidoPorMim: false,
    respostas: [
      {
        id: 'com-003-r1',
        autorId: 'prof-nakamura-001',
        autorNome: 'André Nakamura',
        autorAvatar: '/mock/avatars/prof-nakamura.jpg',
        autorFaixa: 'preta',
        texto: 'Exatamente, Beatriz! Os joelhos apertados no braço do oponente são essenciais. Pense nos joelhos como um "trilho" que guia o braço dele para a posição correta. Sem isso, ele consegue girar o cotovelo e escapar. Boa observação!',
        curtidas: 12,
        curtidoPorMim: false,
        respostas: [],
        criadoEm: '2026-02-18T11:20:00Z',
        editado: false,
        fixado: false,
        ehProfessor: true,
      },
    ],
    criadoEm: '2026-02-18T10:00:00Z',
    editado: false,
    fixado: false,
    ehProfessor: false,
    timestamp: 345,
  },
  {
    id: 'com-004',
    autorId: 'aluno-003',
    autorNome: 'Rafael Mendes',
    autorAvatar: '/mock/avatars/rafael-mendes.jpg',
    autorFaixa: 'roxa',
    texto: 'Já treino há 5 anos e ainda aprendi detalhes novos nesse vídeo. A variação do armbar cruzado aos 7:00 é matadora. Usei no campeonato regional e finalizei 2 adversários com ela.',
    curtidas: 11,
    curtidoPorMim: false,
    respostas: [],
    criadoEm: '2026-02-20T14:00:00Z',
    editado: false,
    fixado: false,
    ehProfessor: false,
    timestamp: 420,
  },
  {
    id: 'com-005',
    autorId: 'aluno-004',
    autorNome: 'Amanda Silva',
    autorAvatar: '/mock/avatars/amanda-silva.jpg',
    autorFaixa: 'branca',
    texto: 'Sou iniciante e estava com medo de não entender, mas a didática é incrível. Assisti 3 vezes e cada vez pego um detalhe novo. Obrigada por compartilhar, Professor!',
    curtidas: 7,
    curtidoPorMim: false,
    respostas: [],
    criadoEm: '2026-02-22T16:45:00Z',
    editado: false,
    fixado: false,
    ehProfessor: false,
  },
  {
    id: 'com-006',
    autorId: 'aluno-005',
    autorNome: 'Pedro Augusto',
    autorAvatar: '/mock/avatars/pedro-augusto.jpg',
    autorFaixa: 'azul',
    texto: 'Professor, uma dúvida: quando o oponente agarra a própria mão para defender (defesa de "mão na mão"), qual a melhor saída? Tentei empurrar os quadris pra cima mas não consigo quebrar o grip.',
    curtidas: 6,
    curtidoPorMim: false,
    respostas: [
      {
        id: 'com-006-r1',
        autorId: 'prof-nakamura-001',
        autorNome: 'André Nakamura',
        autorAvatar: '/mock/avatars/prof-nakamura.jpg',
        autorFaixa: 'preta',
        texto: 'Ótima pergunta, Pedro! Quando ele agarra mão com mão, você tem 3 opções: 1) Triângulo — já que ele comprometeu os dois braços; 2) Wrist lock — torça o pulso dele; 3) Ataque de duas pernas — controle o pulso com as duas mãos e eleve o quadril. Vou fazer um vídeo específico sobre isso na semana que vem!',
        curtidas: 9,
        curtidoPorMim: false,
        respostas: [],
        criadoEm: '2026-02-24T10:30:00Z',
        editado: false,
        fixado: false,
        ehProfessor: true,
      },
    ],
    criadoEm: '2026-02-24T09:00:00Z',
    editado: false,
    fixado: false,
    ehProfessor: false,
  },
  {
    id: 'com-007',
    autorId: 'aluno-008',
    autorNome: 'Thiago Nascimento',
    autorAvatar: '/mock/avatars/thiago-nascimento.jpg',
    autorFaixa: 'branca',
    texto: 'Treinei o armbar seguindo esse vídeo por 2 semanas. Ontem finalizei pela primeira vez no sparring! O segredo realmente é o pivô do quadril. Muito obrigado, Professor André!',
    curtidas: 4,
    curtidoPorMim: false,
    respostas: [],
    criadoEm: '2026-02-26T18:00:00Z',
    editado: false,
    fixado: false,
    ehProfessor: false,
  },
  {
    id: 'com-008',
    autorId: 'aluno-009',
    autorNome: 'Carolina Dias',
    autorAvatar: '/mock/avatars/carolina-dias.jpg',
    autorFaixa: 'azul',
    texto: 'Alguém mais notou que a combinação armbar + triângulo (8:30) funciona incrivelmente bem? Quando o oponente empurra pra defender o armbar, o triângulo entra limpo. Genius!',
    curtidas: 10,
    curtidoPorMim: false,
    respostas: [],
    criadoEm: '2026-03-01T11:00:00Z',
    editado: false,
    fixado: false,
    ehProfessor: false,
    timestamp: 510,
  },
  {
    id: 'com-009',
    autorId: 'aluno-010',
    autorNome: 'Gabriel Rocha',
    autorAvatar: '/mock/avatars/gabriel-rocha.jpg',
    autorFaixa: 'branca',
    texto: 'A parte dos erros comuns (10:00) me ajudou muito. Eu estava cometendo o erro #2 — não puxar a cabeça do oponente antes de abrir a guarda. Agora corrigi e o armbar ficou muito mais tight.',
    curtidas: 6,
    curtidoPorMim: false,
    respostas: [],
    criadoEm: '2026-03-05T09:30:00Z',
    editado: true,
    fixado: false,
    ehProfessor: false,
    timestamp: 600,
  },
  {
    id: 'com-010',
    autorId: 'aluno-011',
    autorNome: 'Juliana Martins',
    autorFaixa: 'roxa',
    texto: 'Competidora aqui! Esse vídeo virou minha referência antes de campeonatos. Reviso sempre os detalhes finos da finalização. A qualidade técnica do Professor André é impecável. Mais vídeos assim, por favor!',
    curtidas: 14,
    curtidoPorMim: false,
    respostas: [],
    criadoEm: '2026-03-08T20:00:00Z',
    editado: false,
    fixado: false,
    ehProfessor: false,
  },
];

// ── Questions (video 1) — 5 questions ─────────────────────────────────

const DUVIDAS_VIDEO_001: Duvida[] = [
  {
    id: 'duv-001',
    alunoId: 'aluno-001',
    alunoNome: 'Lucas Oliveira',
    alunoAvatar: '/mock/avatars/lucas-oliveira.jpg',
    alunoFaixa: 'branca',
    pergunta: 'Professor, quando eu abro a guarda para pivotar o quadril, o oponente sempre levanta e sai. Como posso manter o controle nesse momento de transição?',
    timestamp: 195,
    timestampFormatado: '3:15',
    votos: 18,
    votadoPorMim: true,
    respondida: true,
    resposta: {
      professorNome: 'André Nakamura',
      professorAvatar: '/mock/avatars/prof-nakamura.jpg',
      texto: 'Ótima pergunta, Lucas! O segredo é manter o controle da manga ou do pulso antes de abrir a guarda. Nunca abra a guarda sem ter pelo menos um grip sólido. Além disso, use a perna que vai por cima do rosto dele para puxar a cabeça pra baixo — isso impede que ele posture. Pense em "abrir a guarda e imediatamente pivotar", sem dar tempo para ele reagir. É uma questão de timing, não de força.',
      respondidoEm: '2026-02-16T14:00:00Z',
    },
    criadoEm: '2026-02-16T10:00:00Z',
  },
  {
    id: 'duv-002',
    alunoId: 'aluno-004',
    alunoNome: 'Amanda Silva',
    alunoAvatar: '/mock/avatars/amanda-silva.jpg',
    alunoFaixa: 'branca',
    pergunta: 'Tenho braços curtos e sinto dificuldade em fazer o pivô completo. Existe alguma adaptação do armbar para quem tem membros mais curtos?',
    votos: 12,
    votadoPorMim: false,
    respondida: true,
    resposta: {
      professorNome: 'André Nakamura',
      professorAvatar: '/mock/avatars/prof-nakamura.jpg',
      texto: 'Amanda, com braços mais curtos, o mais importante é compensar com ângulo de quadril. Ao invés de tentar puxar o braço dele pra você, pivote o quadril mais (quase 90 graus) e use suas pernas para trazer o braço em direção ao seu corpo. Outra dica: use o grip na manga ao invés do pulso, isso dá mais controle com menos alcance. Vou cobrir adaptações para biotipos diferentes em um vídeo futuro!',
      respondidoEm: '2026-02-23T15:00:00Z',
    },
    criadoEm: '2026-02-23T08:30:00Z',
  },
  {
    id: 'duv-003',
    alunoId: 'aluno-005',
    alunoNome: 'Pedro Augusto',
    alunoAvatar: '/mock/avatars/pedro-augusto.jpg',
    alunoFaixa: 'azul',
    pergunta: 'Na variação do armbar cruzado (7:00), qual o melhor momento para trocar de braço? Devo esperar ele defender ou já ir direto para o braço oposto?',
    timestamp: 420,
    timestampFormatado: '7:00',
    votos: 9,
    votadoPorMim: false,
    respondida: true,
    resposta: {
      professorNome: 'André Nakamura',
      professorAvatar: '/mock/avatars/prof-nakamura.jpg',
      texto: 'Pedro, o ideal é ameaçar o primeiro braço com convicção. Quando ele reage puxando o braço, o braço oposto fica exposto naturalmente. Não pense em "trocar" — pense em "ameaçar e reagir". Se ele defender forte, o cruzado está ali. Se ele não defender, finalize o original. É um jogo de ação-reação, não de decisão prévia.',
      respondidoEm: '2026-02-28T11:00:00Z',
    },
    criadoEm: '2026-02-28T09:00:00Z',
  },
  {
    id: 'duv-004',
    alunoId: 'aluno-009',
    alunoNome: 'Carolina Dias',
    alunoAvatar: '/mock/avatars/carolina-dias.jpg',
    alunoFaixa: 'azul',
    pergunta: 'Professor, quando treino com oponentes mais pesados (+20kg), não consigo quebrar a postura de jeito nenhum. Alguma dica para usar o armbar contra oponentes muito maiores?',
    timestamp: 45,
    timestampFormatado: '0:45',
    votos: 15,
    votadoPorMim: true,
    respondida: true,
    resposta: {
      professorNome: 'André Nakamura',
      professorAvatar: '/mock/avatars/prof-nakamura.jpg',
      texto: 'Carolina, contra oponentes maiores, o segredo não é força — é alavanca. 3 dicas: 1) Use os dois pés no quadril dele para criar distância e depois puxar; 2) Não tente puxar ele inteiro, puxe um braço de cada vez; 3) Use o "arm drag" — puxe o braço pelo tríceps para quebrar a postura unilateralmente. E lembre: se não conseguir quebrar a postura, parta para o triângulo ou a raspagem de tesoura. O Jiu-Jitsu é sobre alternativas!',
      respondidoEm: '2026-03-03T16:00:00Z',
    },
    criadoEm: '2026-03-03T12:00:00Z',
  },
  {
    id: 'duv-005',
    alunoId: 'aluno-010',
    alunoNome: 'Gabriel Rocha',
    alunoAvatar: '/mock/avatars/gabriel-rocha.jpg',
    alunoFaixa: 'branca',
    pergunta: 'Consigo chegar na posição do armbar mas na hora de finalizar o oponente sempre gira o cotovelo pra dentro e escapa. O que estou fazendo de errado?',
    timestamp: 345,
    timestampFormatado: '5:45',
    votos: 7,
    votadoPorMim: false,
    respondida: false,
    criadoEm: '2026-03-12T14:00:00Z',
  },
];

// ── Personal notes (video 1) — 3 notes ────────────────────────────────

const NOTAS_VIDEO_001: NotaPessoal[] = [
  {
    id: 'nota-001',
    videoId: 'vid-001',
    texto: 'Lembrar de apertar os joelhos ANTES de elevar o quadril. Sequência: pivô -> joelhos -> quadril. Treinei isso 20x e fez toda a diferença.',
    timestamp: 345,
    criadaEm: '2026-02-18T20:00:00Z',
    atualizadaEm: '2026-02-18T20:00:00Z',
  },
  {
    id: 'nota-002',
    videoId: 'vid-001',
    texto: 'O detalhe de puxar a cabeça do oponente com a mão antes de abrir a guarda é essencial. Sem isso ele postura e escapa. Revisar esse ponto no próximo treino.',
    timestamp: 195,
    criadaEm: '2026-02-20T15:30:00Z',
    atualizadaEm: '2026-02-21T10:00:00Z',
  },
  {
    id: 'nota-003',
    videoId: 'vid-001',
    texto: 'Combinação armbar + triângulo: quando ele empurra pra sair do armbar, encaixar o triângulo. Funciona muito bem contra oponentes que resistem com os braços esticados. Testar nas próximas 3 aulas.',
    criadaEm: '2026-03-01T22:00:00Z',
    atualizadaEm: '2026-03-01T22:00:00Z',
  },
];

// ── Progress per video ─────────────────────────────────────────────────

const PROGRESSO_BY_VIDEO: Record<string, VideoExperience['progresso']> = {
  'vid-001': {
    assistido: false,
    progressoSegundos: 490,
    progressoPercentual: 65,
    ultimoAcessoEm: '2026-03-15T19:30:00Z',
    tempoTotalAssistido: 1850,
    vezesAssistido: 3,
  },
  'vid-002': {
    assistido: true,
    progressoSegundos: 920,
    progressoPercentual: 100,
    ultimoAcessoEm: '2026-03-10T14:00:00Z',
    completadoEm: '2026-03-10T14:00:00Z',
    tempoTotalAssistido: 2100,
    vezesAssistido: 2,
  },
  'vid-003': {
    assistido: false,
    progressoSegundos: 200,
    progressoPercentual: 31,
    ultimoAcessoEm: '2026-03-08T20:00:00Z',
    tempoTotalAssistido: 200,
    vezesAssistido: 1,
  },
  'vid-004': {
    assistido: false,
    progressoSegundos: 0,
    progressoPercentual: 0,
    tempoTotalAssistido: 0,
    vezesAssistido: 0,
  },
  'vid-005': {
    assistido: false,
    progressoSegundos: 0,
    progressoPercentual: 0,
    tempoTotalAssistido: 0,
    vezesAssistido: 0,
  },
};

// ── Social stats per video ─────────────────────────────────────────────

const SOCIAL_BY_VIDEO: Record<string, VideoExperience['social']> = {
  'vid-001': {
    curtidas: 142,
    curtidoPorMim: true,
    comentarios: 38,
    duvidas: 12,
    compartilhamentos: 25,
    salvos: 67,
    salvoPorMim: true,
    mediaAvaliacao: 4.7,
    totalAvaliacoes: 89,
    minhaAvaliacao: 5,
  },
  'vid-002': {
    curtidas: 118,
    curtidoPorMim: false,
    comentarios: 24,
    duvidas: 8,
    compartilhamentos: 19,
    salvos: 52,
    salvoPorMim: false,
    mediaAvaliacao: 4.6,
    totalAvaliacoes: 73,
  },
  'vid-003': {
    curtidas: 87,
    curtidoPorMim: false,
    comentarios: 15,
    duvidas: 6,
    compartilhamentos: 12,
    salvos: 34,
    salvoPorMim: false,
    mediaAvaliacao: 4.5,
    totalAvaliacoes: 45,
  },
  'vid-004': {
    curtidas: 95,
    curtidoPorMim: false,
    comentarios: 20,
    duvidas: 5,
    compartilhamentos: 14,
    salvos: 41,
    salvoPorMim: false,
    mediaAvaliacao: 4.8,
    totalAvaliacoes: 56,
  },
  'vid-005': {
    curtidas: 110,
    curtidoPorMim: false,
    comentarios: 18,
    duvidas: 9,
    compartilhamentos: 22,
    salvos: 58,
    salvoPorMim: false,
    mediaAvaliacao: 4.6,
    totalAvaliacoes: 62,
  },
};

// ── Helper: build full video experience ────────────────────────────────

function buildVideoExperience(videoId: string): VideoExperience {
  const video = VIDEOS[videoId] ?? VIDEOS['vid-001'];
  const actualId = VIDEOS[videoId] ? videoId : 'vid-001';

  const serieMap: Record<string, number> = {
    'vid-001': 3,
    'vid-002': 2,
    'vid-003': 4,
    'vid-004': 5,
  };

  return {
    video,
    professor: PROFESSOR,
    serie: serieMap[actualId] !== undefined
      ? { ...SERIE, episodioAtual: serieMap[actualId] }
      : undefined,
    progresso: PROGRESSO_BY_VIDEO[actualId] ?? PROGRESSO_BY_VIDEO['vid-001'],
    social: SOCIAL_BY_VIDEO[actualId] ?? SOCIAL_BY_VIDEO['vid-001'],
    comentarios: actualId === 'vid-001' ? COMENTARIOS_VIDEO_001 : [],
    duvidas: actualId === 'vid-001' ? DUVIDAS_VIDEO_001 : [],
    tecnicasRelacionadas: TECNICAS_BY_VIDEO[actualId] ?? TECNICAS_BY_VIDEO['vid-001'],
    capitulos: CHAPTERS_BY_VIDEO[actualId] ?? CHAPTERS_BY_VIDEO['vid-001'],
    videosRelacionados: VIDEOS_RELACIONADOS.filter((v) => v.id !== actualId),
    notasPessoais: actualId === 'vid-001' ? NOTAS_VIDEO_001 : [],
    temQuiz: actualId === 'vid-001' || actualId === 'vid-002',
    quizCompletado: actualId === 'vid-002',
    quizNota: actualId === 'vid-002' ? 90 : undefined,
    downloadPermitido: true,
    downloadUrl: `/mock/downloads/${actualId}.mp4`,
    tamanhoMB: actualId === 'vid-001' ? 245
      : actualId === 'vid-002' ? 310
      : actualId === 'vid-003' ? 180
      : actualId === 'vid-004' ? 140
      : 195,
    analytics: {
      visualizacoesTotal: 1247,
      visualizacoesUnicas: 892,
      tempoMedioAssistido: 580,
      taxaConclusao: 0.72,
      pontoAbandono: 420,
      avaliacaoMedia: 4.7,
      retencaoPorSegundo: Array.from({ length: 50 }, (_, i) => {
        if (i < 5) return 100;
        if (i < 15) return 95 - i * 0.5;
        if (i < 30) return 88 - (i - 15) * 1.2;
        if (i < 40) return 70 - (i - 30) * 2;
        return 50 - (i - 40) * 1.5;
      }),
    },
  };
}

// ── Exported mock functions ────────────────────────────────────────────

export async function mockGetVideoExperience(videoId: string): Promise<VideoExperience> {
  await delay();
  return buildVideoExperience(videoId);
}

export async function mockRegistrarProgresso(_videoId: string, _segundos: number): Promise<void> {
  await delay();
}

export async function mockMarcarCompleto(_videoId: string): Promise<void> {
  await delay();
}

export async function mockAvaliarVideo(_videoId: string, _nota: number): Promise<void> {
  await delay();
}

export async function mockCurtirVideo(_videoId: string): Promise<{ curtidas: number }> {
  await delay();
  return { curtidas: 143 };
}

export async function mockDescurtirVideo(_videoId: string): Promise<{ curtidas: number }> {
  await delay();
  return { curtidas: 141 };
}

export async function mockSalvarVideo(_videoId: string): Promise<void> {
  await delay();
}

export async function mockRemoverSalvo(_videoId: string): Promise<void> {
  await delay();
}

export async function mockCompartilharVideo(_videoId: string, _canal: string): Promise<void> {
  await delay();
}

export async function mockGetComentarios(videoId: string, _pagina?: number): Promise<Comentario[]> {
  await delay();
  if (videoId === 'vid-001') return COMENTARIOS_VIDEO_001;
  return [];
}

export async function mockAddComentario(_videoId: string, texto: string, timestamp?: number): Promise<Comentario> {
  await delay();
  return {
    id: `com-new-${Date.now()}`,
    autorId: 'current-user',
    autorNome: 'Você',
    autorAvatar: '/mock/avatars/current-user.jpg',
    autorFaixa: 'branca',
    texto,
    curtidas: 0,
    curtidoPorMim: false,
    respostas: [],
    criadoEm: new Date().toISOString(),
    editado: false,
    fixado: false,
    ehProfessor: false,
    timestamp,
  };
}

export async function mockEditarComentario(comentarioId: string, texto: string): Promise<Comentario> {
  await delay();
  return {
    id: comentarioId,
    autorId: 'current-user',
    autorNome: 'Você',
    autorAvatar: '/mock/avatars/current-user.jpg',
    autorFaixa: 'branca',
    texto,
    curtidas: 0,
    curtidoPorMim: false,
    respostas: [],
    criadoEm: new Date().toISOString(),
    editado: true,
    fixado: false,
    ehProfessor: false,
  };
}

export async function mockDeletarComentario(_comentarioId: string): Promise<void> {
  await delay();
}

export async function mockCurtirComentario(_comentarioId: string): Promise<void> {
  await delay();
}

export async function mockResponderComentario(_comentarioId: string, texto: string): Promise<Comentario> {
  await delay();
  return {
    id: `com-reply-${Date.now()}`,
    autorId: 'current-user',
    autorNome: 'Você',
    autorAvatar: '/mock/avatars/current-user.jpg',
    autorFaixa: 'branca',
    texto,
    curtidas: 0,
    curtidoPorMim: false,
    respostas: [],
    criadoEm: new Date().toISOString(),
    editado: false,
    fixado: false,
    ehProfessor: false,
  };
}

export async function mockFixarComentario(_comentarioId: string): Promise<void> {
  await delay();
}

export async function mockGetDuvidas(videoId: string): Promise<Duvida[]> {
  await delay();
  if (videoId === 'vid-001') return DUVIDAS_VIDEO_001;
  return [];
}

export async function mockAddDuvida(_videoId: string, pergunta: string, timestamp?: number): Promise<Duvida> {
  await delay();
  return {
    id: `duv-new-${Date.now()}`,
    alunoId: 'current-user',
    alunoNome: 'Você',
    alunoAvatar: '/mock/avatars/current-user.jpg',
    alunoFaixa: 'branca',
    pergunta,
    timestamp,
    timestampFormatado: timestamp
      ? `${Math.floor(timestamp / 60)}:${String(timestamp % 60).padStart(2, '0')}`
      : undefined,
    votos: 0,
    votadoPorMim: false,
    respondida: false,
    criadoEm: new Date().toISOString(),
  };
}

export async function mockVotarDuvida(_duvidaId: string): Promise<void> {
  await delay();
}

export async function mockResponderDuvida(_duvidaId: string, _resposta: string): Promise<void> {
  await delay();
}

export async function mockGetNotas(videoId: string): Promise<NotaPessoal[]> {
  await delay();
  if (videoId === 'vid-001') return NOTAS_VIDEO_001;
  return [];
}

export async function mockAddNota(videoId: string, texto: string, timestamp?: number): Promise<NotaPessoal> {
  await delay();
  const now = new Date().toISOString();
  return {
    id: `nota-new-${Date.now()}`,
    videoId,
    texto,
    timestamp,
    criadaEm: now,
    atualizadaEm: now,
  };
}

export async function mockEditarNota(notaId: string, texto: string): Promise<NotaPessoal> {
  await delay();
  const existing = NOTAS_VIDEO_001.find((n) => n.id === notaId);
  return {
    id: notaId,
    videoId: existing?.videoId ?? 'vid-001',
    texto,
    timestamp: existing?.timestamp,
    criadaEm: existing?.criadaEm ?? new Date().toISOString(),
    atualizadaEm: new Date().toISOString(),
  };
}

export async function mockDeletarNota(_notaId: string): Promise<void> {
  await delay();
}

export async function mockGetDownloadUrl(videoId: string): Promise<string | null> {
  await delay();
  if (VIDEOS[videoId]) return `/mock/downloads/${videoId}.mp4`;
  return null;
}

// ── Professor Q&A mocks ────────────────────────────────────────────────

export async function mockGetDuvidasPendentes(): Promise<(Duvida & { videoTitulo: string; videoId: string })[]> {
  await delay();
  const pendentes = DUVIDAS_VIDEO_001.filter((d) => !d.respondida);
  return pendentes.map((d) => ({
    ...d,
    videoTitulo: 'Armbar da Guarda Fechada — Passo a Passo',
    videoId: 'vid-001',
  }));
}

export async function mockGetDuvidasRespondidas(): Promise<(Duvida & { videoTitulo: string; videoId: string })[]> {
  await delay();
  const respondidas = DUVIDAS_VIDEO_001.filter((d) => d.respondida);
  return respondidas.map((d) => ({
    ...d,
    videoTitulo: 'Armbar da Guarda Fechada — Passo a Passo',
    videoId: 'vid-001',
  }));
}
