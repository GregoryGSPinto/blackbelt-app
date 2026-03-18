import type {
  ModuloTeorico,
  Licao,
  QuizModulo,
  ResultadoQuiz,
  CertificadoTeorico,
  TermoArtesMarciais,
  ProgressoGeral,
} from '@/lib/api/academia-teorica.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

// ══════════════════════════════════════════════════════════════════════
// MODULOS
// ══════════════════════════════════════════════════════════════════════

const MOCK_MODULOS: ModuloTeorico[] = [
  // ── BJJ Faixa Branca ────────────────────────────────────────────
  {
    id: 'mod-bjj-branca',
    modalidade: 'bjj',
    faixa: 'branca',
    titulo: 'Fundamentos do Jiu-Jitsu — Faixa Branca',
    descricao:
      'Curso completo para faixas brancas: historia, etiqueta, posicoes, terminologia, regras de competicao e higiene. Domine a base teorica antes de pisar no tatame.',
    icone: 'book-open',
    ordem: 1,
    totalLicoes: 8,
    licoesCompletadas: 5,
    quizScore: 85,
    certificadoEmitido: false,
    bloqueado: false,
    categoria: 'requisitos',
  },
  // ── BJJ Faixa Azul ─────────────────────────────────────────────
  {
    id: 'mod-bjj-azul',
    modalidade: 'bjj',
    faixa: 'azul',
    titulo: 'Aprofundamento Tecnico — Faixa Azul',
    descricao:
      'Conteudo avancado para faixas azuis: sistemas de guarda, conceitos de pressao, estrategias de competicao e estudo de jogo individual.',
    icone: 'graduation-cap',
    ordem: 2,
    totalLicoes: 7,
    licoesCompletadas: 0,
    certificadoEmitido: false,
    bloqueado: true,
    categoria: 'requisitos',
  },
  // ── BJJ Faixa Roxa ─────────────────────────────────────────────
  {
    id: 'mod-bjj-roxa',
    modalidade: 'bjj',
    faixa: 'roxa',
    titulo: 'Maturidade Tecnica — Faixa Roxa',
    descricao:
      'Modulo para faixas roxas: encadeamento de tecnicas, filosofia do jogo, analise de luta e preparacao para faixa marrom.',
    icone: 'brain',
    ordem: 3,
    totalLicoes: 5,
    licoesCompletadas: 0,
    certificadoEmitido: false,
    bloqueado: true,
    categoria: 'filosofia',
  },
  // ── Muay Thai Iniciante ─────────────────────────────────────────
  {
    id: 'mod-mt-iniciante',
    modalidade: 'muay_thai',
    faixa: 'branca',
    titulo: 'Muay Thai — Fundamentos',
    descricao:
      'Introducao ao Muay Thai: historia milenar, as 8 armas, terminologia tailandesa e regras de competicao.',
    icone: 'sword',
    ordem: 4,
    totalLicoes: 5,
    licoesCompletadas: 3,
    quizScore: undefined,
    certificadoEmitido: false,
    bloqueado: false,
    categoria: 'requisitos',
  },
  // ── Judo Faixa Branca ──────────────────────────────────────────
  {
    id: 'mod-judo-branca',
    modalidade: 'judo',
    faixa: 'branca',
    titulo: 'Judo — Faixa Branca',
    descricao:
      'Fundamentos do Judo: principios de Jigoro Kano, kuzushi, ukemi, etiqueta do dojo e regras da IJF.',
    icone: 'shield',
    ordem: 5,
    totalLicoes: 5,
    licoesCompletadas: 0,
    certificadoEmitido: false,
    bloqueado: false,
    categoria: 'requisitos',
  },
];

// ══════════════════════════════════════════════════════════════════════
// LICOES — mod-bjj-branca (8 licoes)
// ══════════════════════════════════════════════════════════════════════

const LICOES_BJJ_BRANCA: Licao[] = [
  // ── Licao 1: Historia do BJJ ────────────────────────────────────
  {
    id: 'lic-bjj-01',
    moduloId: 'mod-bjj-branca',
    titulo: 'O que e Jiu-Jitsu Brasileiro?',
    ordem: 1,
    tipo: 'historia',
    conteudo: {
      blocos: [
        { tipo: 'titulo', conteudo: 'A Historia do Jiu-Jitsu Brasileiro' },
        {
          tipo: 'paragrafo',
          conteudo:
            'O Jiu-Jitsu Brasileiro (BJJ) e uma arte marcial, sistema de defesa pessoal e esporte de combate que se concentra na luta de solo e tecnicas de submissao. Sua historia comeca no Japao, passa pela imigracao japonesa no Brasil e se transforma em uma das artes marciais mais praticadas no mundo.',
        },
        {
          tipo: 'paragrafo',
          conteudo:
            'No inicio do seculo XX, o mestre japones Mitsuyo Maeda, tambem conhecido como Conde Koma, viajou pelo mundo demonstrando a eficacia do Judo e do Jiu-Jitsu japones em desafios de vale-tudo. Maeda chegou ao Brasil em 1914, estabelecendo-se em Belem do Para, onde encontrou apoio do empresario Gastao Gracie.',
        },
        {
          tipo: 'destaque',
          conteudo:
            'Mitsuyo Maeda era um dos maiores lutadores de sua epoca, tendo realizado mais de 1.000 combates ao redor do mundo sem jamais ser derrotado.',
          cor: 'info',
        },
        {
          tipo: 'paragrafo',
          conteudo:
            'Em agradecimento pela ajuda de Gastao, Maeda aceitou ensinar Jiu-Jitsu ao seu filho mais velho, Carlos Gracie. Carlos treinou por varios anos e, em 1925, abriu a primeira academia Gracie no Rio de Janeiro, junto com seus irmaos. Foi ali que o Jiu-Jitsu comecou a se transformar no que conhecemos hoje como BJJ.',
        },
        {
          tipo: 'paragrafo',
          conteudo:
            'O irmao mais novo de Carlos, Helio Gracie, tinha dificuldade em executar algumas tecnicas que exigiam muita forca fisica. Helio adaptou os movimentos, priorizando alavancas, tempo e eficiencia energetica. Essas adaptacoes formaram a base do Jiu-Jitsu Brasileiro moderno — uma arte marcial onde o praticante menor e mais fraco pode vencer um oponente maior.',
        },
        {
          tipo: 'curiosidade',
          conteudo:
            'Helio Gracie lutou contra o japones Masahiko Kimura em 1951, numa luta historica no Maracana. Apesar de perder, Helio ganhou enorme respeito. A tecnica usada para finaliza-lo passou a se chamar "Kimura" em homenagem ao vencedor.',
        },
        {
          tipo: 'paragrafo',
          conteudo:
            'A expansao mundial do BJJ acelerou em 1993, quando Royce Gracie venceu o primeiro UFC (Ultimate Fighting Championship) nos Estados Unidos, derrotando oponentes muito maiores usando apenas tecnicas de Jiu-Jitsu. Isso provou ao mundo a eficacia do BJJ e despertou um interesse global pela arte.',
        },
        {
          tipo: 'paragrafo',
          conteudo:
            'Hoje, o BJJ e praticado em mais de 150 paises, possui federacoes internacionais como a IBJJF (International Brazilian Jiu-Jitsu Federation) e a SJJIF, e e um dos esportes de combate que mais cresce no mundo. Atletas como Roger Gracie, Marcelo Garcia, Andre Galvao e Gordon Ryan continuam a evolucao tecnica da arte.',
        },
        {
          tipo: 'destaque',
          conteudo:
            'O BJJ se baseia no principio de que uma pessoa menor pode se defender contra um oponente maior usando tecnica, alavanca e posicionamento correto no solo.',
          cor: 'success',
        },
      ],
    },
    duracao: '12 min',
    concluida: true,
    concluidaEm: '2026-03-10T14:30:00Z',
  },

  // ── Licao 2: Etiqueta no Tatame ─────────────────────────────────
  {
    id: 'lic-bjj-02',
    moduloId: 'mod-bjj-branca',
    titulo: 'Etiqueta no Tatame',
    ordem: 2,
    tipo: 'texto',
    conteudo: {
      blocos: [
        { tipo: 'titulo', conteudo: 'Regras de Etiqueta e Respeito no Tatame' },
        {
          tipo: 'paragrafo',
          conteudo:
            'O Jiu-Jitsu e muito mais do que tecnicas de luta. E uma pratica que exige disciplina, respeito e humildade. A etiqueta no tatame e parte fundamental da formacao de todo praticante, desde a faixa branca ate a faixa preta.',
        },
        {
          tipo: 'lista',
          conteudo: 'Regras essenciais de etiqueta no tatame',
          itens: [
            'Sempre cumprimente o professor ao chegar e ao sair do tatame, com um aperto de mao firme ou dizendo "Oss"',
            'Nunca pise no tatame de sapatos ou chinelos — entre sempre descalco ou com chinelos ate a borda do tatame',
            'Use o kimono (gi) limpo e em bom estado em todo treino — gi sujo e falta de respeito com os parceiros',
            'Mantenha as unhas das maos e dos pes sempre cortadas — unhas compridas causam arranhoes e lesoes',
            'Respeite o tap (batida) do parceiro imediatamente — quando alguem bate, solte a finalizacao na hora',
            'Nao converse durante a explicacao do professor — preste atencao e guarde as duvidas para o momento adequado',
            'Chegue no horario — atrasos atrapalham a aula e demonstram desrespeito',
            'Cumprimente seu parceiro de treino antes e depois de cada rolar com um aperto de mao',
            'Nao saia do tatame durante o treino sem pedir permissao ao professor',
            'Amarre a faixa corretamente — faixa solta demonstra desleixo',
          ],
        },
        {
          tipo: 'dica',
          conteudo:
            'Se voce esta doente, com febre, gripe ou qualquer infeccao de pele, nao va treinar. Proteger a saude dos seus parceiros de treino tambem e uma forma de respeito.',
        },
        {
          tipo: 'destaque',
          conteudo:
            'O tap e sagrado no Jiu-Jitsu. Quando seu parceiro bate (no tatame, no seu corpo ou verbalmente diz "tapa"), voce deve soltar a finalizacao imediatamente. Ignorar o tap pode causar lesoes graves e e uma das piores faltas de etiqueta.',
          cor: 'danger',
        },
      ],
    },
    duracao: '8 min',
    concluida: true,
    concluidaEm: '2026-03-11T10:00:00Z',
  },

  // ── Licao 3: Sistema de Faixas ──────────────────────────────────
  {
    id: 'lic-bjj-03',
    moduloId: 'mod-bjj-branca',
    titulo: 'Sistema de Faixas do BJJ',
    ordem: 3,
    tipo: 'texto',
    conteudo: {
      blocos: [
        { tipo: 'titulo', conteudo: 'O Sistema de Graduacao do Jiu-Jitsu Brasileiro' },
        {
          tipo: 'paragrafo',
          conteudo:
            'O Jiu-Jitsu Brasileiro utiliza um sistema de faixas coloridas para indicar o nivel tecnico e a experiencia do praticante. Diferente de outras artes marciais, a progressao no BJJ e relativamente lenta, valorizando a maturidade tecnica e o tempo de pratica.',
        },
        {
          tipo: 'lista',
          conteudo: 'Progressao de faixas para adultos (a partir de 16 anos)',
          itens: [
            'Faixa Branca — Iniciante. Sem tempo minimo. Foco em sobrevivencia, posicoes basicas e defesas',
            'Faixa Azul — Intermediario. Tempo minimo: 2 anos na faixa branca. Comeca a desenvolver um jogo proprio',
            'Faixa Roxa — Avancado. Tempo minimo: 1,5 anos na faixa azul. Demonstra maturidade tecnica e capacidade de ensinar basico',
            'Faixa Marrom — Pre-graduado. Tempo minimo: 1 ano na faixa roxa. Refinamento e profundidade do jogo individual',
            'Faixa Preta — Mestre praticante. Tempo minimo: 1 ano na faixa marrom. Em media, leva de 8 a 12 anos para conquistar',
          ],
        },
        {
          tipo: 'destaque',
          conteudo:
            'Cada faixa possui 4 graus (listras), dados pelo professor como forma de reconhecer o progresso do aluno dentro da faixa. Os graus sao marcados com fita adesiva na ponta da faixa.',
          cor: 'info',
        },
        {
          tipo: 'paragrafo',
          conteudo:
            'Alem das faixas para adultos, a IBJJF define um sistema para criancas (4 a 15 anos) com faixas intermediarias: branca, cinza, amarela, laranja e verde. Ao completar 16 anos, a crianca recebe a faixa adulta correspondente ao seu nivel.',
        },
        {
          tipo: 'paragrafo',
          conteudo:
            'Apos a faixa preta, existem graduacoes adicionais de 1o a 6o grau (listras vermelhas na faixa preta), faixa coral (7o e 8o grau) e faixa vermelha (9o e 10o grau). A faixa vermelha de 10o grau e reservada aos pioneiros da arte, como os irmaos Gracie.',
        },
        {
          tipo: 'curiosidade',
          conteudo:
            'Apenas 5 pessoas na historia receberam a faixa vermelha de 10o grau no Jiu-Jitsu Brasileiro. A graduacao e mais sobre legado e contribuicao historica do que tecnica pura.',
        },
      ],
    },
    duracao: '10 min',
    concluida: true,
    concluidaEm: '2026-03-12T09:15:00Z',
  },

  // ── Licao 4: Posicoes Fundamentais ──────────────────────────────
  {
    id: 'lic-bjj-04',
    moduloId: 'mod-bjj-branca',
    titulo: 'Posicoes Fundamentais',
    ordem: 4,
    tipo: 'texto',
    conteudo: {
      blocos: [
        { tipo: 'titulo', conteudo: 'As 6 Posicoes Fundamentais do Jiu-Jitsu' },
        {
          tipo: 'paragrafo',
          conteudo:
            'No Jiu-Jitsu Brasileiro, a hierarquia de posicoes e um conceito central. Cada posicao oferece diferentes graus de controle e oportunidades de finalizacao. Entender essa hierarquia e fundamental para todo praticante.',
        },
        {
          tipo: 'lista',
          conteudo: 'As 6 posicoes fundamentais do BJJ',
          itens: [
            'Guarda (Guard) — Voce esta por baixo, usando as pernas para controlar o oponente. Pode ser fechada (pernas cruzadas), aberta ou meia-guarda. E uma posicao neutra com muitas opcoes ofensivas',
            'Meia-Guarda (Half Guard) — Posicao intermediaria onde voce controla uma das pernas do oponente entre as suas. Oferece opcoes de raspagem e recuperacao de guarda completa',
            'Side Control (Cem Quilos) — Voce esta por cima, ao lado do oponente, controlando com o peito e os bracos. Vale 3 pontos para quem chega a essa posicao por passagem de guarda',
            'Montada (Mount) — Voce esta sentado sobre o torso do oponente. E uma das posicoes mais dominantes, valendo 4 pontos. Oferece muitas opcoes de finalizacao',
            'Costas (Back Mount) — Voce esta nas costas do oponente, controlando com os ganchos (hooks) nas pernas. Considerada a posicao mais dominante, vale 4 pontos. O mata-leao e a finalizacao classica dessa posicao',
            'North-South (Norte-Sul) — Voce esta por cima, com seu corpo invertido em relacao ao oponente (cabeca-pe). Excelente posicao de controle e transicao, embora nao pontue separadamente na competicao',
          ],
        },
        {
          tipo: 'destaque',
          conteudo:
            'Hierarquia de posicoes (da mais dominante para a menos): Costas > Montada > Side Control > Meia-Guarda > Guarda. Lembre-se: "Posicao antes de submissao" — primeiro conquiste uma posicao dominante, depois busque a finalizacao.',
          cor: 'success',
        },
        {
          tipo: 'dica',
          conteudo:
            'Na faixa branca, concentre-se em entender ONDE voce esta em cada momento do rolar. Saber identificar a posicao e o primeiro passo para saber o que fazer.',
        },
      ],
    },
    duracao: '10 min',
    concluida: true,
    concluidaEm: '2026-03-13T11:30:00Z',
  },

  // ── Licao 5: Terminologia Essencial ─────────────────────────────
  {
    id: 'lic-bjj-05',
    moduloId: 'mod-bjj-branca',
    titulo: 'Terminologia Essencial',
    ordem: 5,
    tipo: 'terminologia',
    conteudo: {
      blocos: [
        { tipo: 'titulo', conteudo: 'Glossario Essencial do Jiu-Jitsu — 20 Termos' },
        {
          tipo: 'paragrafo',
          conteudo:
            'O Jiu-Jitsu Brasileiro utiliza termos em japones, portugues e ingles. Conhecer o vocabulario basico e fundamental para entender as instrucoes do professor e se comunicar no tatame.',
        },
        {
          tipo: 'termo',
          conteudo: 'Oss',
          termo: {
            original: 'Oss (Osu)',
            traducao: 'Saudacao de respeito e confirmacao',
            pronuncia: 'oss',
            idioma: 'japones',
            exemplo: 'Ao entrar no tatame, cumprimente com "Oss". Tambem usado para confirmar que entendeu a instrucao.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Shrimp (Fuga de Quadril)',
          termo: {
            original: 'Shrimp',
            traducao: 'Fuga de quadril / Camarao',
            pronuncia: 'shrimp',
            idioma: 'ingles',
            exemplo: 'Use o shrimp para criar espaco quando estiver embaixo do side control.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Sweep (Raspagem)',
          termo: {
            original: 'Sweep',
            traducao: 'Raspagem — reverter a posicao de baixo para cima',
            pronuncia: 'suip',
            idioma: 'ingles',
            exemplo: 'Da guarda fechada, voce pode executar um sweep de tesoura para ficar por cima.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Submission (Finalizacao)',
          termo: {
            original: 'Submission',
            traducao: 'Finalizacao — tecnica que forca o oponente a desistir',
            pronuncia: 'sub-mi-shon',
            idioma: 'ingles',
            exemplo: 'O armbar e uma das submissions mais classicas do BJJ.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Takedown (Queda)',
          termo: {
            original: 'Takedown',
            traducao: 'Queda — levar o oponente ao solo',
            pronuncia: 'teik-daun',
            idioma: 'ingles',
            exemplo: 'Um takedown bem executado vale 2 pontos na competicao.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Passagem de Guarda',
          termo: {
            original: 'Guard Pass',
            traducao: 'Passagem de guarda — superar as pernas do oponente',
            pronuncia: 'gard pass',
            idioma: 'ingles',
            exemplo: 'A passagem de guarda vale 3 pontos e leva voce ao side control.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Drilling',
          termo: {
            original: 'Drilling',
            traducao: 'Repeticao de tecnica',
            pronuncia: 'dri-ling',
            idioma: 'ingles',
            exemplo: 'Faca drilling da armbar pelo menos 30 vezes de cada lado antes de tentar no rolar.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Rolling (Rolar)',
          termo: {
            original: 'Rolling',
            traducao: 'Rolar — treino livre de Jiu-Jitsu',
            pronuncia: 'ro-ling',
            idioma: 'ingles',
            exemplo: 'No fim da aula, vamos rolar 5 rounds de 5 minutos.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Tap (Desistencia)',
          termo: {
            original: 'Tap',
            traducao: 'Batida — sinal de desistencia',
            pronuncia: 'tap',
            idioma: 'ingles',
            exemplo: 'Quando sentir a finalizacao, de o tap batendo no parceiro ou no tatame.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Gi (Kimono)',
          termo: {
            original: 'Gi',
            traducao: 'Kimono — uniforme do BJJ',
            pronuncia: 'gui',
            idioma: 'japones',
            exemplo: 'No treino de gi, voce pode usar o kimono do oponente para controlar e finalizar.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'No-Gi (Sem Kimono)',
          termo: {
            original: 'No-Gi',
            traducao: 'Sem kimono — treino com rashguard e bermuda',
            pronuncia: 'no-gui',
            idioma: 'ingles',
            exemplo: 'No no-gi, as tecnicas precisam se adaptar pois nao ha gola para agarrar.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Base',
          termo: {
            original: 'Base',
            traducao: 'Equilibrio e posicionamento para nao ser derrubado ou raspado',
            pronuncia: 'ba-se',
            idioma: 'portugues',
            exemplo: 'Mantenha uma boa base quando estiver dentro da guarda do oponente.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Hook (Gancho)',
          termo: {
            original: 'Hook',
            traducao: 'Gancho — usar o pe ou calcanhar para controlar',
            pronuncia: 'ruk',
            idioma: 'ingles',
            exemplo: 'Ao pegar as costas, coloque os dois hooks para garantir os 4 pontos.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Frame (Moldura)',
          termo: {
            original: 'Frame',
            traducao: 'Moldura — usar bracos e pernas como estrutura rigida para criar espaco',
            pronuncia: 'freim',
            idioma: 'ingles',
            exemplo: 'Use um frame no pescoço do oponente para evitar que ele se aproxime no side control.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Underhook (Controle por Baixo)',
          termo: {
            original: 'Underhook',
            traducao: 'Controle por baixo da axila do oponente',
            pronuncia: 'an-der-ruk',
            idioma: 'ingles',
            exemplo: 'Conquiste o underhook na meia-guarda para iniciar a raspagem.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Postura',
          termo: {
            original: 'Posture',
            traducao: 'Manter o tronco ereto dentro da guarda do oponente',
            pronuncia: 'pos-tur',
            idioma: 'ingles',
            exemplo: 'Mantenha a postura dentro da guarda fechada para evitar ser puxado e finalizado.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Knee on Belly (Joelho na Barriga)',
          termo: {
            original: 'Knee on Belly',
            traducao: 'Joelho na barriga — posicao de controle que vale 2 pontos',
            pronuncia: 'ni on beli',
            idioma: 'ingles',
            exemplo: 'Do side control, transite para knee on belly para pressionar e abrir opcoes de ataque.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Scramble',
          termo: {
            original: 'Scramble',
            traducao: 'Momento caotico de transicao onde ambos lutam por posicao',
            pronuncia: 'screm-bol',
            idioma: 'ingles',
            exemplo: 'Quando o scramble acontecer, quem tiver melhor reacao e base vai conquistar a posicao.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Open Mat (Tatame Aberto)',
          termo: {
            original: 'Open Mat',
            traducao: 'Treino livre sem instrucao — hora de praticar com parceiros',
            pronuncia: 'o-pen mat',
            idioma: 'ingles',
            exemplo: 'No sabado temos open mat: venha e treine o que quiser, no seu ritmo.',
          },
        },
        {
          tipo: 'destaque',
          conteudo:
            'Nao se preocupe em decorar todos os termos de uma vez. Com a pratica diaria, o vocabulario se torna natural. O mais importante e entender os comandos basicos do professor durante a aula.',
          cor: 'info',
        },
      ],
    },
    duracao: '15 min',
    concluida: true,
    concluidaEm: '2026-03-14T08:45:00Z',
  },

  // ── Licao 6: Regras Basicas de Competicao ───────────────────────
  {
    id: 'lic-bjj-06',
    moduloId: 'mod-bjj-branca',
    titulo: 'Regras Basicas de Competicao',
    ordem: 6,
    tipo: 'regras',
    conteudo: {
      blocos: [
        { tipo: 'titulo', conteudo: 'Regras IBJJF para Competicao de Jiu-Jitsu' },
        {
          tipo: 'paragrafo',
          conteudo:
            'A IBJJF (International Brazilian Jiu-Jitsu Federation) e a maior e mais importante federacao de Jiu-Jitsu do mundo. Suas regras sao o padrao utilizado na maioria dos campeonatos. Conhecer essas regras e essencial, mesmo que voce nao pretenda competir, pois elas refletem a logica do jogo.',
        },
        {
          tipo: 'lista',
          conteudo: 'Pontuacao oficial IBJJF',
          itens: [
            'Takedown (Queda): 2 pontos — Derrubar o oponente e ficar por cima em posicao estavel',
            'Sweep (Raspagem): 2 pontos — Reverter a posicao de baixo (guarda) para cima, ficando em posicao dominante',
            'Knee on Belly (Joelho na barriga): 2 pontos — Posicionar o joelho no abdomen do oponente com controle',
            'Guard Pass (Passagem de guarda): 3 pontos — Superar as pernas do oponente e estabilizar em side control',
            'Mount (Montada): 4 pontos — Montar sobre o torso do oponente com ambos os joelhos no chao',
            'Back Mount (Costas): 4 pontos — Controlar as costas do oponente com ambos os ganchos (hooks)',
          ],
        },
        {
          tipo: 'destaque',
          conteudo:
            'A finalizacao (submission) encerra a luta imediatamente, independente do placar. Se ninguem finalizar, vence quem tiver mais pontos. Em caso de empate em pontos, vencem as vantagens. Se ainda empatar, o arbitro decide.',
          cor: 'info',
        },
        {
          tipo: 'lista',
          conteudo: 'Faltas e penalidades importantes',
          itens: [
            'Falta de combatividade: Se o atleta nao atacar ou evitar a luta, recebe penalizacao',
            'Sair da area de luta: Fugir do tatame intencionalmente e penalizado',
            'Puxar para a guarda sem grip: Puxar guarda sem segurar no oponente pode ser penalizado',
            'Tecnicas proibidas na faixa branca: Chaves de pe (exceto reta no pe), cervicais, slam',
            'Falar com o arbitro: O atleta nao pode questionar diretamente o arbitro durante a luta',
          ],
        },
        {
          tipo: 'paragrafo',
          conteudo:
            'Na faixa branca, os tempos de luta sao de 5 minutos para adultos. As categorias sao divididas por peso, faixa e idade. Existe tambem a categoria absoluto, sem limite de peso.',
        },
        {
          tipo: 'dica',
          conteudo:
            'Antes de competir, assista pelo menos 10 lutas de faixa branca no YouTube para se familiarizar com o ritmo, a pontuacao e as situacoes mais comuns. Conhecer as regras antes da primeira competicao faz enorme diferenca.',
        },
      ],
    },
    duracao: '12 min',
    concluida: false,
  },

  // ── Licao 7: Higiene e Seguranca ────────────────────────────────
  {
    id: 'lic-bjj-07',
    moduloId: 'mod-bjj-branca',
    titulo: 'Higiene e Seguranca',
    ordem: 7,
    tipo: 'texto',
    conteudo: {
      blocos: [
        { tipo: 'titulo', conteudo: 'Higiene e Seguranca no Treino de Jiu-Jitsu' },
        {
          tipo: 'paragrafo',
          conteudo:
            'O Jiu-Jitsu e um esporte de contato intenso. A proximidade entre os praticantes torna a higiene um assunto de saude publica dentro da academia. Negligenciar a higiene pode causar infeccoes, afastar parceiros de treino e ate fechar a academia temporariamente.',
        },
        {
          tipo: 'lista',
          conteudo: 'Cuidados essenciais de higiene',
          itens: [
            'Tome banho ANTES e DEPOIS de cada treino — o suor do dia a dia acumula bacterias',
            'Lave o gi (kimono) apos CADA treino — nunca reutilize sem lavar, mesmo que "nao tenha suado"',
            'Corte unhas das maos e pes toda semana — unhas compridas causam cortes e transmitem fungos',
            'Use protetor bucal se tiver aparelho ortodontico — protege voce e o parceiro',
            'Nao treine com feridas abertas — cubra cortes pequenos com esparadrapo a prova d\'agua',
            'Use chinelos ate a borda do tatame — o chao fora do tatame tem bacterias que causam infeccoes',
            'Tire todos os acessorios antes do treino: aneis, brincos, colares, relogios',
            'Mantenha os cabelos presos — cabelo solto atrapalha a visao e pode ser puxado acidentalmente',
          ],
        },
        {
          tipo: 'destaque',
          conteudo:
            'Doencas de pele como impetigo, micose (ringworm), herpes simples e foliculite sao extremamente contagiosas no tatame. Se voce notar qualquer mancha, bolha ou irritacao na pele, NAO treine e procure um dermatologista imediatamente.',
          cor: 'danger',
        },
        {
          tipo: 'lista',
          conteudo: 'Prevencao de lesoes',
          itens: [
            'Sempre aqueca antes do treino — articulacoes frias lesionam mais facilmente',
            'De o tap cedo — nao espere sentir dor para desistir, especialmente em chaves de braco e pe',
            'Comunique lesoes ao professor — ele pode adaptar o treino e avisar seus parceiros',
            'Nao treine com ego — a faixa branca e para aprender, nao para ganhar de todo mundo',
            'Hidrate-se bem antes, durante e apos o treino',
            'Respeite o descanso — treinar lesionado piora a situacao e pode causar lesoes cronicas',
          ],
        },
        {
          tipo: 'dica',
          conteudo:
            'Tenha um "kit tatame" na bolsa: chinelo, toalha limpa, esparadrapo, sabonete antisseptico e uma troca de roupa. Isso resolve 90% dos problemas de higiene no dia a dia.',
        },
      ],
    },
    duracao: '8 min',
    concluida: false,
  },

  // ── Licao 8: Quiz ───────────────────────────────────────────────
  {
    id: 'lic-bjj-08',
    moduloId: 'mod-bjj-branca',
    titulo: 'Quiz — Faixa Branca',
    ordem: 8,
    tipo: 'quiz',
    conteudo: {
      blocos: [
        { tipo: 'titulo', conteudo: 'Quiz Final: Fundamentos do Jiu-Jitsu — Faixa Branca' },
        {
          tipo: 'paragrafo',
          conteudo:
            'Teste seus conhecimentos sobre tudo que aprendeu neste modulo. Voce precisa de pelo menos 70% de acerto para ser aprovado e receber o certificado.',
        },
      ],
    },
    duracao: '10 min',
    concluida: false,
  },
];

// ══════════════════════════════════════════════════════════════════════
// LICOES — mod-mt-iniciante (3 licoes)
// ══════════════════════════════════════════════════════════════════════

const LICOES_MT_INICIANTE: Licao[] = [
  // ── Licao 1: Historia do Muay Thai ──────────────────────────────
  {
    id: 'lic-mt-01',
    moduloId: 'mod-mt-iniciante',
    titulo: 'Historia do Muay Thai',
    ordem: 1,
    tipo: 'historia',
    conteudo: {
      blocos: [
        { tipo: 'titulo', conteudo: 'A Arte das Oito Armas — Historia do Muay Thai' },
        {
          tipo: 'paragrafo',
          conteudo:
            'O Muay Thai, conhecido como a "Arte das Oito Armas", e a arte marcial nacional da Tailandia. Com origens que remontam a seculos de tradicao guerreira, o Muay Thai evoluiu de tecnica militar para um dos esportes de combate mais respeitados e praticados no mundo.',
        },
        {
          tipo: 'paragrafo',
          conteudo:
            'As raizes do Muay Thai estao no Muay Boran ("boxe antigo"), um sistema de combate desenvolvido pelos guerreiros siameses para defesa do reino contra invasores. Diferente de outras artes marciais, o Muay Boran era projetado para o campo de batalha real, quando as armas eram perdidas no combate.',
        },
        {
          tipo: 'curiosidade',
          conteudo:
            'O guerreiro mais famoso do Muay Thai e Nai Khanomtom. Em 1774, capturado pelos birmaneses, ele derrotou 10 lutadores consecutivos usando apenas Muay Thai, conquistando sua liberdade. Ate hoje, o dia 17 de marco e celebrado como o "Dia do Muay Thai" na Tailandia.',
        },
        {
          tipo: 'paragrafo',
          conteudo:
            'O Muay Thai e chamado de "Arte das Oito Armas" porque utiliza 8 pontos de contato para atacar, diferente do boxe (2 — punhos) e do kickboxing (4 — punhos e pes). As 8 armas sao: dois punhos, dois cotovelos, dois joelhos e duas canelas (chutes).',
        },
        {
          tipo: 'lista',
          conteudo: 'As 8 armas do Muay Thai',
          itens: [
            'Punhos (Chok) — Socos diretos, cruzados, jabs e uppercuts',
            'Cotovelos (Sok) — Golpes cortantes, extremamente perigosos em curta distancia',
            'Joelhos (Ti Khao) — Joelhadas em clinch, salto e em combinacoes',
            'Canelas/Chutes (Te) — Chutes circulares com a canela, a arma mais poderosa do Muay Thai',
          ],
        },
        {
          tipo: 'paragrafo',
          conteudo:
            'No seculo XX, o Muay Thai foi formalizado com regras esportivas: luvas, rounds cronometrados, categorias de peso e arbitragem. Os estadios Lumpinee e Rajadamnern em Bangkok se tornaram os templos sagrados do esporte, onde lutadores de todo o mundo sonham em competir.',
        },
        {
          tipo: 'destaque',
          conteudo:
            'O Muay Thai e considerado uma das bases mais eficazes para o MMA (Mixed Martial Arts) em pe. Muitos campeoes do UFC, como Anderson Silva, Jose Aldo e Valentina Shevchenko, construiram suas carreiras com forte base de Muay Thai.',
          cor: 'success',
        },
      ],
    },
    duracao: '10 min',
    concluida: true,
    concluidaEm: '2026-03-09T16:00:00Z',
  },

  // ── Licao 2: Terminologia do Muay Thai ──────────────────────────
  {
    id: 'lic-mt-02',
    moduloId: 'mod-mt-iniciante',
    titulo: 'Terminologia do Muay Thai',
    ordem: 2,
    tipo: 'terminologia',
    conteudo: {
      blocos: [
        { tipo: 'titulo', conteudo: 'Vocabulario Essencial do Muay Thai' },
        {
          tipo: 'paragrafo',
          conteudo:
            'O Muay Thai utiliza terminologia em tailandes para nomear tecnicas, rituais e elementos da luta. Conhecer esses termos ajuda na compreensao das aulas e aproxima o praticante da cultura tailandesa.',
        },
        {
          tipo: 'termo',
          conteudo: 'Wai Kru',
          termo: {
            original: 'Wai Kru',
            traducao: 'Reverencia ao mestre — ritual antes da luta',
            pronuncia: 'uai-cru',
            idioma: 'tailandes',
            exemplo: 'Antes de cada luta, o Nak Muay executa o Wai Kru para homenagear seu mestre e academia.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Ram Muay',
          termo: {
            original: 'Ram Muay',
            traducao: 'Danca ritual pre-luta',
            pronuncia: 'ram-muai',
            idioma: 'tailandes',
            exemplo: 'O Ram Muay e a danca executada apos o Wai Kru, onde o lutador demonstra seu estilo e academia.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Nak Muay',
          termo: {
            original: 'Nak Muay',
            traducao: 'Praticante / lutador de Muay Thai',
            pronuncia: 'nak-muai',
            idioma: 'tailandes',
            exemplo: 'Todo Nak Muay deve respeitar as tradicoes do esporte e honrar seu Kru.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Teep',
          termo: {
            original: 'Teep',
            traducao: 'Chute frontal com a sola do pe (pistao)',
            pronuncia: 'tip',
            idioma: 'tailandes',
            exemplo: 'Use o teep para manter distancia e controlar o ritmo da luta.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Clinch (Plum)',
          termo: {
            original: 'Clinch / Plum',
            traducao: 'Agarre em pe — controle do pescoço do oponente com as duas maos',
            pronuncia: 'clinch / plam',
            idioma: 'tailandes',
            exemplo: 'No clinch, o Nak Muay puxa a cabeca do oponente para desferir joelhadas.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Kru',
          termo: {
            original: 'Kru',
            traducao: 'Mestre / Professor de Muay Thai',
            pronuncia: 'cru',
            idioma: 'tailandes',
            exemplo: 'O Kru e responsavel por guiar o treinamento e preparar o lutador para as lutas.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Mongkon',
          termo: {
            original: 'Mongkon',
            traducao: 'Coroa sagrada usada na cabeca durante o Wai Kru',
            pronuncia: 'mong-kon',
            idioma: 'tailandes',
            exemplo: 'O Mongkon e colocado pelo Kru e removido antes da luta comecar — ele nunca toca o chao.',
          },
        },
        {
          tipo: 'termo',
          conteudo: 'Pra Jiad',
          termo: {
            original: 'Pra Jiad',
            traducao: 'Braceletes usados nos bracos durante a luta',
            pronuncia: 'pra-jiad',
            idioma: 'tailandes',
            exemplo: 'Os Pra Jiads sao amuletos de sorte e protecao, dados pelo Kru ao lutador.',
          },
        },
        {
          tipo: 'destaque',
          conteudo:
            'Na Tailandia, o Muay Thai e mais que um esporte — e parte da identidade cultural. Os rituais como Wai Kru e Ram Muay sao expressoes de respeito, gratidao e espiritualidade. Todo praticante, mesmo fora da Tailandia, deve conhecer e respeitar essas tradicoes.',
          cor: 'info',
        },
      ],
    },
    duracao: '10 min',
    concluida: true,
    concluidaEm: '2026-03-10T17:30:00Z',
  },

  // ── Licao 3: Regras do Muay Thai ────────────────────────────────
  {
    id: 'lic-mt-03',
    moduloId: 'mod-mt-iniciante',
    titulo: 'Regras do Muay Thai',
    ordem: 3,
    tipo: 'regras',
    conteudo: {
      blocos: [
        { tipo: 'titulo', conteudo: 'Regras de Competicao do Muay Thai' },
        {
          tipo: 'paragrafo',
          conteudo:
            'As regras do Muay Thai profissional sao regulamentadas por organizacoes como a WMC (World Muay Thai Council) e a IFMA (International Federation of Muaythai Associations). Conhecer as regras basicas e fundamental mesmo para quem treina recreativamente.',
        },
        {
          tipo: 'lista',
          conteudo: 'Estrutura de uma luta profissional',
          itens: [
            '5 rounds de 3 minutos cada, com 2 minutos de descanso entre rounds',
            'Uso obrigatorio de luvas de boxe (8oz a 10oz dependendo da categoria)',
            'Protecao obrigatoria: protetor bucal, coquilha e bandagens nas maos',
            'Categorias divididas por peso (minimosca ate superpesado)',
            'Arbitro central dentro do ringue e 3 juizes laterais pontuando',
          ],
        },
        {
          tipo: 'lista',
          conteudo: 'Golpes permitidos',
          itens: [
            'Socos em qualquer parte do corpo (exceto nuca e genitais)',
            'Chutes com a canela em qualquer parte do corpo e pernas',
            'Joelhadas no tronco, cabeca e coxas',
            'Cotoveladas (em competicoes profissionais — podem ser proibidas em amador)',
            'Clinch com joelhadas — tempo limitado a criterio do arbitro',
            'Teep (chute frontal) no tronco e rosto',
          ],
        },
        {
          tipo: 'lista',
          conteudo: 'Golpes proibidos e faltas',
          itens: [
            'Golpes na nuca, coluna e genitais',
            'Cabecadas, mordidas e cuspir no oponente',
            'Arremessar o oponente no chao (permitido apenas derrubar com tecnica)',
            'Ataques com o oponente no chao — a luta e exclusivamente em pe',
            'Segurar as cordas para atacar ou defender',
            'Virar as costas para o oponente (falta de combatividade)',
          ],
        },
        {
          tipo: 'destaque',
          conteudo:
            'No Muay Thai, diferente do boxe, os chutes e joelhadas pontuam MAIS que os socos. Um chute circular bem conectado no corpo pontua muito mais que uma sequencia de jabs. Esse e um conceito fundamental para entender o scoring.',
          cor: 'success',
        },
        {
          tipo: 'paragrafo',
          conteudo:
            'A luta pode ser encerrada por nocaute (KO), nocaute tecnico (TKO — quando o arbitro interrompe), decisao dos juizes (unanime, dividida ou majoritaria), desqualificacao ou desistencia do corner (toalha).',
        },
        {
          tipo: 'dica',
          conteudo:
            'Para iniciantes e competicoes amadoras, as regras sao adaptadas: menos rounds (3x2min), sem cotoveladas, uso de caneleiras e protetor de cabeca obrigatorios.',
        },
      ],
    },
    duracao: '10 min',
    concluida: true,
    concluidaEm: '2026-03-11T18:00:00Z',
  },
];

// ── Todas as licoes combinadas ────────────────────────────────────
const MOCK_LICOES: Licao[] = [...LICOES_BJJ_BRANCA, ...LICOES_MT_INICIANTE];

// ══════════════════════════════════════════════════════════════════════
// TERMOS — Glossario completo (30 termos: 15 BJJ + 10 Judo + 5 Muay Thai)
// ══════════════════════════════════════════════════════════════════════

const MOCK_TERMOS: TermoArtesMarciais[] = [
  // ── BJJ (15 termos) ─────────────────────────────────────────────
  {
    id: 'term-bjj-01',
    original: 'Oss',
    traducao: 'Saudacao de respeito e confirmacao',
    pronuncia: 'oss',
    idioma: 'japones',
    modalidade: 'bjj',
    categoria: 'etiqueta',
    descricao:
      'Saudacao universal no Jiu-Jitsu, usada para cumprimentar, confirmar entendimento ou demonstrar respeito. Derivada do japones "Onegai Shimasu" (por favor, me ensine).',
    exemplo: 'Ao entrar no tatame, cumprimente o professor com "Oss" e uma leve reverencia.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-bjj-02',
    original: 'Guarda',
    traducao: 'Guard — posicao defensiva/ofensiva com as pernas',
    pronuncia: 'gwar-da',
    idioma: 'portugues',
    modalidade: 'bjj',
    categoria: 'posicao',
    descricao:
      'Posicao em que o praticante esta por baixo, usando as pernas para controlar o oponente. Existem dezenas de variacoes: fechada, aberta, aranha, De La Riva, meia-guarda, entre outras.',
    exemplo: 'Jogar na guarda fechada e uma opcao segura para controlar oponentes mais fortes.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-bjj-03',
    original: 'Montada',
    traducao: 'Mount — posicao dominante sentado sobre o oponente',
    pronuncia: 'mon-ta-da',
    idioma: 'portugues',
    modalidade: 'bjj',
    categoria: 'posicao',
    descricao:
      'Posicao onde o praticante esta sentado sobre o torso do oponente, com os joelhos ao lado do corpo. Vale 4 pontos na competicao e oferece muitas opcoes de finalizacao.',
    exemplo: 'Da montada, voce pode atacar com armbar, ezequiel, cross choke ou americana.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-bjj-04',
    original: 'Side Control',
    traducao: 'Cem quilos — controle lateral por cima',
    pronuncia: 'said con-trol',
    idioma: 'ingles',
    modalidade: 'bjj',
    categoria: 'posicao',
    descricao:
      'Posicao em que o praticante esta por cima, ao lado do oponente, com o peito pressionando e controlando com os bracos. Obtida apos passagem de guarda (3 pontos).',
    exemplo: 'Apos passar a guarda, estabilize no side control antes de transitar para a montada.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-bjj-05',
    original: 'Raspagem',
    traducao: 'Sweep — reverter posicao de baixo para cima',
    pronuncia: 'ras-pa-gem',
    idioma: 'portugues',
    modalidade: 'bjj',
    categoria: 'tecnica',
    descricao:
      'Tecnica executada da posicao de guarda (por baixo) para inverter a posicao, ficando por cima do oponente. Vale 2 pontos na competicao.',
    exemplo: 'A raspagem de tesoura (scissor sweep) e uma das primeiras que se aprende na faixa branca.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-bjj-06',
    original: 'Passagem de Guarda',
    traducao: 'Guard Pass — superar as pernas do oponente',
    pronuncia: 'pa-sa-gem de gwar-da',
    idioma: 'portugues',
    modalidade: 'bjj',
    categoria: 'tecnica',
    descricao:
      'Tecnica onde o praticante por cima supera as pernas do oponente e estabiliza em side control. Vale 3 pontos na competicao. E uma das habilidades mais importantes do BJJ.',
    exemplo: 'A passagem de guarda por pressao (pressure pass) e muito eficaz contra guardas abertas.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-bjj-07',
    original: 'Finalizacao',
    traducao: 'Submission — tecnica que encerra a luta',
    pronuncia: 'fi-na-li-za-sao',
    idioma: 'portugues',
    modalidade: 'bjj',
    categoria: 'tecnica',
    descricao:
      'Tecnica que forca o oponente a desistir (tap) por meio de estrangulamento (choke) ou chave articular (joint lock). Encerra a luta imediatamente, independente do placar.',
    exemplo: 'O mata-leao e a finalizacao mais conhecida do Jiu-Jitsu.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-bjj-08',
    original: 'Kimura',
    traducao: 'Chave de ombro rotacional com duas maos',
    pronuncia: 'ki-mu-ra',
    idioma: 'japones',
    modalidade: 'bjj',
    categoria: 'tecnica',
    descricao:
      'Chave de ombro onde se segura o punho do oponente e se aplica rotacao no ombro usando as duas maos. Nomeada em homenagem a Masahiko Kimura, judoca japones que finalizou Helio Gracie em 1951.',
    exemplo: 'A kimura pode ser aplicada de diversas posicoes: guarda, side control, montada e north-south.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-bjj-09',
    original: 'Armbar',
    traducao: 'Chave de braco — hiperextensao do cotovelo',
    pronuncia: 'arm-bar',
    idioma: 'ingles',
    modalidade: 'bjj',
    categoria: 'tecnica',
    descricao:
      'Finalizacao onde o praticante isola o braco do oponente entre as pernas e aplica pressao no cotovelo para hiperextensao. Uma das tecnicas mais fundamentais e eficazes do BJJ.',
    exemplo: 'Da montada, o armbar e uma das finalizacoes mais classicas e com maior percentual de sucesso.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-bjj-10',
    original: 'Triangle',
    traducao: 'Triangulo — estrangulamento com as pernas',
    pronuncia: 'trai-an-gol',
    idioma: 'ingles',
    modalidade: 'bjj',
    categoria: 'tecnica',
    descricao:
      'Estrangulamento onde o praticante forma um triangulo com as pernas ao redor do pescoco e de um braco do oponente, cortando a circulacao sanguinea. Pode ser aplicado da guarda, montada ou costas.',
    exemplo: 'O triangle choke da guarda fechada e uma finalizacao assinatura do BJJ.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-bjj-11',
    original: 'Omoplata',
    traducao: 'Chave de ombro usando as pernas',
    pronuncia: 'o-mo-pla-ta',
    idioma: 'portugues',
    modalidade: 'bjj',
    categoria: 'tecnica',
    descricao:
      'Finalizacao onde o praticante usa as pernas para isolar o braco do oponente e aplicar pressao no ombro. O nome vem do osso "omoplata" (escapula). Alem de finalizar, serve como controle e setup para raspagens.',
    exemplo: 'Quando o triangle nao fecha, a transicao para omoplata e uma excelente alternativa.',
    faixaMinima: 'azul',
  },
  {
    id: 'term-bjj-12',
    original: 'Guillotine',
    traducao: 'Guilhotina — estrangulamento frontal pelo pescoco',
    pronuncia: 'gui-o-ti-na',
    idioma: 'ingles',
    modalidade: 'bjj',
    categoria: 'tecnica',
    descricao:
      'Estrangulamento frontal onde o praticante envolve o pescoco do oponente com o braco e aplica pressao com o antebraco na traqueia ou nas arterias carotidas. Muito comum em defesa de queda.',
    exemplo: 'Quando o oponente abaixa a cabeca para o takedown, a guilhotina e uma finalizacao rapida.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-bjj-13',
    original: 'RNC (Mata-Leao)',
    traducao: 'Rear Naked Choke — estrangulamento pelas costas',
    pronuncia: 'ma-ta le-ao',
    idioma: 'portugues',
    modalidade: 'bjj',
    categoria: 'tecnica',
    descricao:
      'Estrangulamento pelas costas onde o praticante envolve o pescoco do oponente com um braco (formando um "V") e usa o outro braco para fechar atras da cabeca. Considerada a finalizacao mais eficaz do BJJ e do MMA.',
    exemplo: 'Apos conquistar as costas com os dois hooks, busque o mata-leao pelo lado mais exposto.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-bjj-14',
    original: 'Berimbolo',
    traducao: 'Inversao e giro para pegar as costas',
    pronuncia: 'be-rim-bo-lo',
    idioma: 'portugues',
    modalidade: 'bjj',
    categoria: 'tecnica',
    descricao:
      'Tecnica avancada onde o praticante inverte o corpo por baixo do oponente, girando para conquistar as costas. Popularizada pelos irmaos Miyao e Rafael Mendes. E um movimento acrobatico que exige timing e flexibilidade.',
    exemplo: 'Da guarda De La Riva, o berimbolo e uma das entradas mais sofisticadas para as costas.',
    faixaMinima: 'roxa',
  },
  {
    id: 'term-bjj-15',
    original: 'De La Riva',
    traducao: 'Tipo de guarda aberta com gancho no pe',
    pronuncia: 'de la ri-va',
    idioma: 'portugues',
    modalidade: 'bjj',
    categoria: 'posicao',
    descricao:
      'Guarda aberta onde o praticante coloca um pe na frente da perna do oponente (gancho), controlando a perna e criando angulos para raspagens e ataques. Nomeada em homenagem a Ricardo De La Riva, que popularizou a posicao nos anos 80.',
    exemplo: 'A guarda De La Riva e a base para muitas tecnicas modernas como o berimbolo.',
    faixaMinima: 'azul',
  },

  // ── Judo (10 termos) ────────────────────────────────────────────
  {
    id: 'term-judo-01',
    original: 'Ippon',
    traducao: 'Ponto completo — encerra a luta',
    pronuncia: 'i-pon',
    idioma: 'japones',
    modalidade: 'judo',
    categoria: 'competicao',
    descricao:
      'Pontuacao maxima no Judo, que encerra a luta imediatamente. Pode ser obtido por arremesso perfeito (nas costas, com forca e controle), imobilizacao por 20 segundos, finalizacao (choke ou armbar) ou desistencia do oponente.',
    exemplo: 'Um Uchi-mata com rotacao completa e queda de costas resulta em Ippon — luta encerrada.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-judo-02',
    original: 'Waza-ari',
    traducao: 'Meio ponto — quase ippon',
    pronuncia: 'wa-za-a-ri',
    idioma: 'japones',
    modalidade: 'judo',
    categoria: 'competicao',
    descricao:
      'Pontuacao intermediaria no Judo, concedida quando o arremesso nao atende todos os criterios do Ippon (ex: queda de lado, falta de controle). Dois waza-aris equivalem a um Ippon (waza-ari awasete ippon).',
    exemplo: 'O arremesso foi bom, mas o oponente caiu de lado — o arbitro marca Waza-ari.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-judo-03',
    original: 'Hajime',
    traducao: 'Comecar — comando do arbitro para iniciar a luta',
    pronuncia: 'ha-ji-me',
    idioma: 'japones',
    modalidade: 'judo',
    categoria: 'comando',
    descricao:
      'Comando verbal do arbitro para iniciar ou reiniciar o combate. Os lutadores devem permanecer parados ate ouvir "Hajime". E o equivalente a "Lutem!" em outras artes marciais.',
    exemplo: 'Os dois judocas se posicionam, o arbitro levanta a mao e diz "Hajime!" — a luta comeca.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-judo-04',
    original: 'Matte',
    traducao: 'Parar — comando do arbitro para interromper a luta',
    pronuncia: 'ma-te',
    idioma: 'japones',
    modalidade: 'judo',
    categoria: 'comando',
    descricao:
      'Comando verbal do arbitro para interromper o combate temporariamente. Usado para reposicionar os lutadores, quando saem da area ou quando o arbitro precisa avaliar uma situacao. Os lutadores devem parar imediatamente.',
    exemplo: 'Os judocas saem da area, o arbitro grita "Matte!" e eles voltam ao centro.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-judo-05',
    original: 'Kuzushi',
    traducao: 'Desequilibrio — quebra de balanco do oponente',
    pronuncia: 'ku-zu-shi',
    idioma: 'japones',
    modalidade: 'judo',
    categoria: 'tecnica',
    descricao:
      'Principio fundamental do Judo: o desequilibrio do oponente. Sem kuzushi, nenhuma tecnica de arremesso funciona contra um oponente resistente. Existem 8 direcoes de desequilibrio (happo no kuzushi).',
    exemplo: 'Para aplicar o Seoi-nage, primeiro faca o kuzushi puxando o oponente para frente.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-judo-06',
    original: 'Seoi-nage',
    traducao: 'Arremesso por cima do ombro',
    pronuncia: 'se-oi-na-gue',
    idioma: 'japones',
    modalidade: 'judo',
    categoria: 'tecnica',
    descricao:
      'Um dos arremessos mais classicos e populares do Judo. O praticante gira de costas para o oponente, posiciona-o nas costas/ombro e projeta para frente. Existem variacoes: Morote Seoi-nage (com duas maos) e Ippon Seoi-nage (com uma mao).',
    exemplo: 'O Seoi-nage e geralmente a primeira projecao ensinada na faixa branca de Judo.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-judo-07',
    original: 'O-soto-gari',
    traducao: 'Grande ceifada externa — rasteira por fora',
    pronuncia: 'o-so-to-ga-ri',
    idioma: 'japones',
    modalidade: 'judo',
    categoria: 'tecnica',
    descricao:
      'Tecnica de arremesso onde o praticante desequilibra o oponente para tras e ceifa sua perna de apoio por fora com a propria perna, derrubando-o de costas. Uma das tecnicas mais poderosas do Judo.',
    exemplo: 'O O-soto-gari e devastador contra oponentes que recuam ou ficam com peso atras.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-judo-08',
    original: 'Uchi-mata',
    traducao: 'Ceifada interna na coxa',
    pronuncia: 'u-chi-ma-ta',
    idioma: 'japones',
    modalidade: 'judo',
    categoria: 'tecnica',
    descricao:
      'Arremesso onde o praticante levanta a perna do oponente por entre as coxas, usando a coxa interna como alavanca. Considerado um dos arremessos mais espetaculares e eficazes do Judo moderno. Tecnica favorita de muitos campeoes olimpicos.',
    exemplo: 'O Uchi-mata rendeu mais medalhas olimpicas do que qualquer outra tecnica de Judo.',
    faixaMinima: 'azul',
  },
  {
    id: 'term-judo-09',
    original: 'Kesa-gatame',
    traducao: 'Imobilizacao lateral — controle por lenco',
    pronuncia: 'ke-sa-ga-ta-me',
    idioma: 'japones',
    modalidade: 'judo',
    categoria: 'posicao',
    descricao:
      'Tecnica de imobilizacao no solo (osaekomi) onde o praticante controla o oponente de lado, prendendo a cabeca sob a axila e segurando o braco. A imobilizacao por 20 segundos resulta em Ippon.',
    exemplo: 'Apos o arremesso, transite rapidamente para Kesa-gatame para garantir a imobilizacao.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-judo-10',
    original: 'Rei',
    traducao: 'Reverencia / Saudacao formal',
    pronuncia: 'rei',
    idioma: 'japones',
    modalidade: 'judo',
    categoria: 'etiqueta',
    descricao:
      'Reverencia formal no Judo, feita ao entrar e sair do tatame, ao cumprimentar o professor (sensei) e ao iniciar/encerrar cada treino ou combate. Pode ser em pe (ritsurei) ou ajoelhado (zarei). Representa respeito, humildade e gratidao.',
    exemplo: 'Antes de lutar, os dois judocas fazem Rei um para o outro como sinal de respeito mutuo.',
    faixaMinima: 'branca',
  },

  // ── Muay Thai (5 termos) ────────────────────────────────────────
  {
    id: 'term-mt-01',
    original: 'Wai Kru',
    traducao: 'Reverencia ao mestre — ritual pre-luta',
    pronuncia: 'uai-cru',
    idioma: 'tailandes',
    modalidade: 'muay_thai',
    categoria: 'etiqueta',
    descricao:
      'Ritual sagrado executado antes de cada luta de Muay Thai, onde o lutador presta reverencia ao seu mestre (Kru), a sua familia e a sua academia. Inclui movimentos lentos, ajoelhar-se e tocar a testa no chao do ringue.',
    exemplo: 'Todo Nak Muay profissional executa o Wai Kru antes da luta, mesmo em campeonatos internacionais.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-mt-02',
    original: 'Ram Muay',
    traducao: 'Danca ritual pre-luta',
    pronuncia: 'ram-muai',
    idioma: 'tailandes',
    modalidade: 'muay_thai',
    categoria: 'etiqueta',
    descricao:
      'Danca ritualistica executada apos o Wai Kru, onde o lutador demonstra seu estilo, representa sua academia e intimida o oponente. Cada campo de treino (gym) possui seu proprio Ram Muay, como uma assinatura.',
    exemplo: 'Pela coreografia do Ram Muay, e possivel identificar de qual gym o lutador vem.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-mt-03',
    original: 'Nak Muay',
    traducao: 'Praticante / lutador de Muay Thai',
    pronuncia: 'nak-muai',
    idioma: 'tailandes',
    modalidade: 'muay_thai',
    categoria: 'graduacao',
    descricao:
      'Termo tailandes para designar qualquer praticante de Muay Thai. "Nak Muay Farang" e usado para lutadores estrangeiros (nao tailandeses) que praticam Muay Thai. Ser chamado de Nak Muay e um sinal de respeito.',
    exemplo: 'Um Nak Muay dedicado treina pelo menos 5 vezes por semana, incluindo clinch e sparring.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-mt-04',
    original: 'Teep',
    traducao: 'Chute frontal com a sola do pe (pistao)',
    pronuncia: 'tip',
    idioma: 'tailandes',
    modalidade: 'muay_thai',
    categoria: 'tecnica',
    descricao:
      'Chute frontal empurrando com a sola do pe, similar a um "pistao". Usado para manter distancia, desequilibrar o oponente ou interromper ataques. E uma das tecnicas mais versativeis e importantes do Muay Thai.',
    exemplo: 'Use o teep no abdomen do oponente para empurra-lo e manter sua distancia ideal de luta.',
    faixaMinima: 'branca',
  },
  {
    id: 'term-mt-05',
    original: 'Clinch',
    traducao: 'Agarre em pe — controle do pescoco com as duas maos',
    pronuncia: 'clinch',
    idioma: 'ingles',
    modalidade: 'muay_thai',
    categoria: 'tecnica',
    descricao:
      'Tecnica de luta agarrada em pe onde o praticante controla o pescoco do oponente com ambas as maos (posicao "plum") para desferir joelhadas, desequilibrar e dominar o combate em curta distancia. O clinch e uma especialidade do Muay Thai.',
    exemplo: 'No clinch, puxe a cabeca do oponente para baixo e desfira joelhadas no tronco e rosto.',
    faixaMinima: 'branca',
  },
];

// ══════════════════════════════════════════════════════════════════════
// QUIZ — mod-bjj-branca (15 perguntas)
// ══════════════════════════════════════════════════════════════════════

const MOCK_QUIZ: QuizModulo = {
  id: 'quiz-bjj-branca',
  moduloId: 'mod-bjj-branca',
  titulo: 'Quiz Final: Fundamentos do Jiu-Jitsu — Faixa Branca',
  descricao:
    'Teste seus conhecimentos sobre historia, etiqueta, posicoes, terminologia, regras e higiene do BJJ. Minimo de 70% para aprovacao.',
  perguntas: [
    {
      id: 'q-01',
      pergunta: 'Quem trouxe o Jiu-Jitsu para o Brasil?',
      tipo: 'multipla_escolha',
      opcoes: [
        { texto: 'Mitsuyo Maeda', correta: true },
        { texto: 'Jigoro Kano', correta: false },
        { texto: 'Helio Gracie', correta: false },
        { texto: 'Masahiko Kimura', correta: false },
      ],
      explicacao:
        'Mitsuyo Maeda, conhecido como Conde Koma, chegou ao Brasil em 1914 e ensinou Jiu-Jitsu a Carlos Gracie, filho de Gastao Gracie.',
    },
    {
      id: 'q-02',
      pergunta: 'Quantos pontos vale uma passagem de guarda na competicao IBJJF?',
      tipo: 'multipla_escolha',
      opcoes: [
        { texto: '3 pontos', correta: true },
        { texto: '2 pontos', correta: false },
        { texto: '4 pontos', correta: false },
        { texto: '1 ponto', correta: false },
      ],
      explicacao:
        'A passagem de guarda vale 3 pontos na IBJJF. O praticante precisa superar as pernas do oponente e estabilizar em side control por 3 segundos.',
    },
    {
      id: 'q-03',
      pergunta: 'Qual a sequencia correta de faixas no BJJ para adultos?',
      tipo: 'multipla_escolha',
      opcoes: [
        { texto: 'Branca, Azul, Roxa, Marrom, Preta', correta: true },
        { texto: 'Branca, Amarela, Laranja, Verde, Azul', correta: false },
        { texto: 'Branca, Azul, Roxa, Preta', correta: false },
        { texto: 'Branca, Roxa, Azul, Marrom, Preta', correta: false },
      ],
      explicacao:
        'A progressao para adultos (16+) e: Branca, Azul, Roxa, Marrom e Preta. O sistema Amarela/Laranja/Verde e para criancas (4 a 15 anos).',
    },
    {
      id: 'q-04',
      pergunta: 'O que significa "tap" no Jiu-Jitsu?',
      tipo: 'multipla_escolha',
      opcoes: [
        { texto: 'Desistencia — sinal para soltar a finalizacao', correta: true },
        { texto: 'Ponto marcado pelo arbitro', correta: false },
        { texto: 'Tecnica de projecao', correta: false },
        { texto: 'Tipo de guarda', correta: false },
      ],
      explicacao:
        'O tap (batida) e o sinal universal de desistencia. Quando o praticante bate no parceiro, no tatame ou diz "tapa", a finalizacao deve ser solta imediatamente.',
    },
    {
      id: 'q-05',
      pergunta: 'Qual posicao vale mais pontos na competicao IBJJF?',
      tipo: 'multipla_escolha',
      opcoes: [
        { texto: 'Montada (4 pontos)', correta: true },
        { texto: 'Side Control (3 pontos)', correta: false },
        { texto: 'Knee on Belly (2 pontos)', correta: false },
        { texto: 'Guarda (0 pontos)', correta: false },
      ],
      explicacao:
        'A Montada e as Costas sao as posicoes que valem mais pontos: 4 pontos cada. Sao consideradas as posicoes mais dominantes do Jiu-Jitsu.',
    },
    {
      id: 'q-06',
      pergunta: 'O que e "shrimp" no BJJ?',
      tipo: 'multipla_escolha',
      opcoes: [
        { texto: 'Fuga de quadril — movimento para criar espaco', correta: true },
        { texto: 'Tipo de finalizacao', correta: false },
        { texto: 'Posicao de controle', correta: false },
        { texto: 'Tecnica de queda', correta: false },
      ],
      explicacao:
        'O shrimp (camarao / fuga de quadril) e um movimento fundamental onde o praticante desloca o quadril para longe do oponente, criando espaco para escapar de posicoes inferiores.',
    },
    {
      id: 'q-07',
      pergunta: 'Quanto tempo minimo se deve permanecer na faixa azul segundo a IBJJF?',
      tipo: 'multipla_escolha',
      opcoes: [
        { texto: '2 anos', correta: true },
        { texto: '1 ano', correta: false },
        { texto: '3 anos', correta: false },
        { texto: '6 meses', correta: false },
      ],
      explicacao:
        'A IBJJF exige tempo minimo de 2 anos na faixa branca para receber a azul, e 2 anos na azul para receber a roxa. Esses sao tempos minimos — na pratica, muitos praticantes levam mais.',
    },
    {
      id: 'q-08',
      pergunta: 'O que e "drilling" no contexto do treino de BJJ?',
      tipo: 'multipla_escolha',
      opcoes: [
        { texto: 'Repeticao sistematica de uma tecnica para fixacao', correta: true },
        { texto: 'Treino livre de combate (rolar)', correta: false },
        { texto: 'Aquecimento antes da aula', correta: false },
        { texto: 'Treino de condicionamento fisico', correta: false },
      ],
      explicacao:
        'Drilling e a pratica de repetir uma tecnica muitas vezes com um parceiro cooperativo, focando na perfeicao do movimento. E essencial para memorizar os movimentos e torna-los automaticos.',
    },
    {
      id: 'q-09',
      pergunta: 'Que tipo de pontuacao vale 2 pontos na competicao IBJJF?',
      tipo: 'multipla_escolha',
      opcoes: [
        { texto: 'Takedown (queda)', correta: true },
        { texto: 'Passagem de guarda', correta: false },
        { texto: 'Montada', correta: false },
        { texto: 'Finalizacao', correta: false },
      ],
      explicacao:
        'O takedown (queda) vale 2 pontos, assim como a raspagem (sweep) e o knee on belly. A passagem de guarda vale 3 e a montada/costas valem 4.',
    },
    {
      id: 'q-10',
      pergunta: 'O que significa "Oss" no Jiu-Jitsu?',
      tipo: 'multipla_escolha',
      opcoes: [
        { texto: 'Saudacao de respeito e confirmacao', correta: true },
        { texto: 'Comando para iniciar a luta', correta: false },
        { texto: 'Nome de uma finalizacao', correta: false },
        { texto: 'Tipo de posicao', correta: false },
      ],
      explicacao:
        'Oss (ou Osu) e uma saudacao derivada do japones, usada para demonstrar respeito, cumprimentar e confirmar que entendeu uma instrucao. E a palavra mais universal no tatame.',
    },
    {
      id: 'q-11',
      pergunta: 'Qual doenca de pele comum impede o praticante de treinar?',
      tipo: 'multipla_escolha',
      opcoes: [
        { texto: 'Impetigo ou micose (ringworm)', correta: true },
        { texto: 'Acne', correta: false },
        { texto: 'Queimadura solar', correta: false },
        { texto: 'Picada de inseto', correta: false },
      ],
      explicacao:
        'Impetigo, micose (ringworm), herpes e foliculite sao altamente contagiosas no contato direto do tatame. O praticante deve se afastar do treino, tratar e so retornar apos liberacao medica.',
    },
    {
      id: 'q-12',
      pergunta: 'O que e a guarda fechada no BJJ?',
      tipo: 'multipla_escolha',
      opcoes: [
        { texto: 'Posicao com as pernas cruzadas atras das costas do oponente', correta: true },
        { texto: 'Posicao onde voce esta de costas para o oponente', correta: false },
        { texto: 'Posicao em pe com os bracos cruzados', correta: false },
        { texto: 'Posicao com os joelhos no chao', correta: false },
      ],
      explicacao:
        'Na guarda fechada, o praticante de baixo cruza os tornozelos atras das costas do oponente, controlando-o com as pernas. E a guarda mais basica e segura para iniciantes.',
    },
    {
      id: 'q-13',
      pergunta: 'Quantos pontos vale pegar as costas do oponente na competicao IBJJF?',
      tipo: 'multipla_escolha',
      opcoes: [
        { texto: '4 pontos', correta: true },
        { texto: '3 pontos', correta: false },
        { texto: '2 pontos', correta: false },
        { texto: '5 pontos', correta: false },
      ],
      explicacao:
        'Pegar as costas (back mount) com ambos os ganchos (hooks) vale 4 pontos. Junto com a montada, e a posicao de maior pontuacao no BJJ.',
    },
    {
      id: 'q-14',
      pergunta: 'O que e uma raspagem (sweep) no Jiu-Jitsu?',
      tipo: 'multipla_escolha',
      opcoes: [
        { texto: 'Reverter a posicao de baixo para cima, saindo da guarda', correta: true },
        { texto: 'Limpar o tatame antes do treino', correta: false },
        { texto: 'Uma tecnica de estrangulamento', correta: false },
        { texto: 'Um tipo de aquecimento', correta: false },
      ],
      explicacao:
        'A raspagem (sweep) e uma tecnica onde o praticante de baixo (guarda) reverte a posicao, ficando por cima do oponente. Vale 2 pontos na competicao.',
    },
    {
      id: 'q-15',
      pergunta: 'Qual a penalidade por falta de combatividade na competicao IBJJF?',
      tipo: 'multipla_escolha',
      opcoes: [
        { texto: 'Penalizacao pelo arbitro — pode resultar em vantagem ou pontos ao oponente', correta: true },
        { texto: 'Nenhuma — nao existe essa regra', correta: false },
        { texto: 'Apenas uma advertencia verbal', correta: false },
        { texto: 'Desclassificacao imediata', correta: false },
      ],
      explicacao:
        'A falta de combatividade (stalling) e penalizada pelo arbitro. A primeira ocorrencia gera advertencia, a segunda da vantagem ao oponente, e acumulos posteriores resultam em pontos ao adversario ou desclassificacao.',
    },
  ],
  totalPerguntas: 15,
  notaMinima: 70,
  tentativas: 1,
  melhorNota: 85,
  ultimaTentativa: '2026-03-12T15:00:00Z',
  aprovado: true,
};

// ══════════════════════════════════════════════════════════════════════
// CERTIFICADO
// ══════════════════════════════════════════════════════════════════════

const MOCK_CERTIFICADO: CertificadoTeorico = {
  id: 'cert-1',
  alunoNome: 'Joao Silva',
  moduloTitulo: 'Fundamentos do Jiu-Jitsu — Faixa Branca',
  modalidade: 'Jiu-Jitsu Brasileiro',
  faixa: 'Branca',
  nota: 92,
  emitidoEm: '2026-03-12T18:00:00Z',
  academiaNome: 'Academia Tatame Real',
  professorNome: 'Carlos Silva',
  qrCodeUrl: '/verificar/CERT-2026-001',
  codigoVerificacao: 'CERT-2026-001',
};

// ══════════════════════════════════════════════════════════════════════
// EXPORTS — funcoes mock (mesmas assinaturas do service)
// ══════════════════════════════════════════════════════════════════════

export async function mockGetModulos(modalidade?: string, faixa?: string): Promise<ModuloTeorico[]> {
  await delay();
  let result = [...MOCK_MODULOS];
  if (modalidade) result = result.filter((m) => m.modalidade === modalidade);
  if (faixa) result = result.filter((m) => m.faixa === faixa);
  return result;
}

export async function mockGetModulo(id: string): Promise<ModuloTeorico & { licoes: Licao[] }> {
  await delay();
  const modulo = MOCK_MODULOS.find((m) => m.id === id) ?? MOCK_MODULOS[0];
  const licoes = MOCK_LICOES.filter((l) => l.moduloId === id);
  return { ...modulo, licoes };
}

export async function mockGetLicao(id: string): Promise<Licao> {
  await delay();
  return MOCK_LICOES.find((l) => l.id === id) ?? MOCK_LICOES[0];
}

export async function mockMarcarLicaoConcluida(_licaoId: string): Promise<void> {
  await delay();
}

export async function mockGetProgressoGeral(): Promise<ProgressoGeral> {
  await delay();
  return {
    totalModulos: MOCK_MODULOS.length,
    completados: 1,
    emProgresso: 3,
    certificados: 1,
    percentual: 35,
  };
}

export async function mockGetQuiz(_moduloId: string): Promise<QuizModulo> {
  await delay();
  return { ...MOCK_QUIZ };
}

export async function mockSubmeterQuiz(_moduloId: string, _respostas: Record<string, string>): Promise<ResultadoQuiz> {
  await delay();
  return {
    nota: 85,
    aprovado: true,
    total: MOCK_QUIZ.perguntas.length,
    acertos: 13,
    explicacoes: MOCK_QUIZ.perguntas.map((p) => ({
      perguntaId: p.id,
      correta: true,
      explicacao: p.explicacao,
    })),
  };
}

export async function mockGetTermos(modalidade?: string, categoria?: string, _faixaMinima?: string): Promise<TermoArtesMarciais[]> {
  await delay();
  let result = [...MOCK_TERMOS];
  if (modalidade) result = result.filter((t) => t.modalidade === modalidade);
  if (categoria) result = result.filter((t) => t.categoria === categoria);
  return result;
}

export async function mockBuscarTermo(query: string): Promise<TermoArtesMarciais[]> {
  await delay();
  const q = query.toLowerCase();
  return MOCK_TERMOS.filter(
    (t) =>
      t.original.toLowerCase().includes(q) ||
      t.traducao.toLowerCase().includes(q) ||
      t.descricao.toLowerCase().includes(q),
  );
}

export async function mockGetCertificados(): Promise<CertificadoTeorico[]> {
  await delay();
  return [MOCK_CERTIFICADO];
}

export async function mockEmitirCertificado(_moduloId: string): Promise<CertificadoTeorico> {
  await delay();
  return { ...MOCK_CERTIFICADO, id: `cert-${Date.now()}`, emitidoEm: new Date().toISOString() };
}

export async function mockValidarCertificado(code: string): Promise<CertificadoTeorico | null> {
  await delay();
  if (code === MOCK_CERTIFICADO.codigoVerificacao) return MOCK_CERTIFICADO;
  return null;
}
