// ═══════════════════════════════════════════════════════
// Mock — Prospecção de Academias (45 academias em BH)
// ═══════════════════════════════════════════════════════

import type {
  AcademiaProspectada,
  ProspeccaoDashboard,
} from '@/lib/api/prospeccao.service';

// ── Factory ──

function make(
  id: string,
  nome: string,
  bairro: string,
  telefone: string,
  notaGoogle: number,
  totalAvaliacoes: number,
  modalidades: string[],
  scoreGeral: number,
  classificacao: 'quente' | 'morno' | 'frio',
  crmStatus: string,
  overrides?: Partial<AcademiaProspectada>,
): AcademiaProspectada {
  const infraestrutura = Math.round(scoreGeral * 0.25);
  const presencaDigital = Math.round(scoreGeral * 0.27);
  const reputacao = Math.round(scoreGeral * 0.24);
  const potencialConversao = Math.round(scoreGeral * 0.24);
  const alunos = classificacao === 'quente' ? 120 + Math.round(Math.random() * 80) : classificacao === 'morno' ? 50 + Math.round(Math.random() * 60) : 15 + Math.round(Math.random() * 35);
  const ticket = 150 + Math.round(Math.random() * 150);

  return {
    id,
    nome,
    endereco: `Rua ${bairro}, ${100 + Math.round(Math.random() * 900)}, ${bairro}`,
    bairro,
    cidade: 'Belo Horizonte',
    estado: 'MG',
    telefone,
    instagram: `@${nome.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_')}`,
    googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(nome + ' BH')}`,
    notaGoogle,
    totalAvaliacoes,
    modalidades,
    horarioFuncionamento: 'Seg-Sex 6h-22h, Sáb 8h-14h',
    fotos: [],
    score: { geral: scoreGeral, infraestrutura, presencaDigital, reputacao, potencialConversao },
    estimativas: {
      alunosEstimados: alunos,
      faturamentoEstimado: alunos * ticket,
      ticketMedio: ticket,
      marketShare: +(alunos / 5000).toFixed(3),
    },
    reviews: [
      { autor: 'João S.', nota: notaGoogle, texto: `Ótima academia, treino na ${nome} há 2 anos.`, data: '2026-02-15T10:00:00Z', plataforma: 'Google' },
      { autor: 'Maria L.', nota: Math.max(1, notaGoogle - 0.5), texto: 'Bom ambiente, professores dedicados.', data: '2026-01-20T14:00:00Z', plataforma: 'Google' },
    ],
    analise: {
      pontosFortes: ['Localização boa', `${totalAvaliacoes} avaliações no Google`],
      pontosFracos: ['Sem sistema de gestão digital', 'Controle manual de presença'],
      oportunidades: ['Mercado de gestão digital em crescimento', 'Concorrentes sem app'],
      ameacas: ['Crise econômica pode reduzir matrículas'],
    },
    abordagem: {
      canal: 'whatsapp',
      mensagemSugerida: `Olá! Vi que a ${nome} tem ${totalAvaliacoes} avaliações no Google com nota ${notaGoogle} — parabéns! Sou o Gregory do BlackBelt, plataforma de gestão para academias. Check-in por QR, financeiro automático, app pro aluno. Posso mostrar em 10 min? 🥋`,
      melhorHorario: 'Terça ou Quinta, 14h-16h',
      argumentos: ['Check-in digital por QR Code', 'App exclusivo para alunos', 'Controle financeiro automático'],
      objecoesPrevistas: ['Já funciona bem sem sistema', 'Custo mensal'],
    },
    crm: {
      status: crmStatus,
      historicoContatos: [],
      observacoes: [],
      responsavel: 'Gregory',
    },
    classificacao,
    criadoEm: '2026-03-10T10:00:00Z',
    atualizadoEm: '2026-03-17T10:00:00Z',
    ...overrides,
  };
}

// ── 45 Academias de BH ──

export const MOCK_ACADEMIAS_PROSPECTADAS: AcademiaProspectada[] = [
  // ═══ QUENTES (8) — Score 70-90 ═══
  make('p01', 'Academia Tatame BH', 'Funcionários', '(31) 98765-4321', 4.8, 342, ['BJJ', 'No-Gi'], 85, 'quente', 'novo', {
    website: 'https://graciebarra-bh.com.br',
    reviews: [
      { autor: 'Rafael M.', nota: 5, texto: 'Melhor academia de BJJ de BH. Professores excelentes, ambiente top!', data: '2026-03-01T10:00:00Z', plataforma: 'Google' },
      { autor: 'Carla P.', nota: 5, texto: 'Treino aqui há 3 anos, evolução incrível. Recomendo demais!', data: '2026-02-15T14:00:00Z', plataforma: 'Google' },
      { autor: 'Bruno S.', nota: 4, texto: 'Boa academia, só peca na organização. Horários mudam sem avisar.', data: '2026-01-20T08:00:00Z', plataforma: 'Google' },
      { autor: 'Ana R.', nota: 5, texto: 'Meu filho treina aqui e ama. Professores cuidadosos com as crianças.', data: '2025-12-10T16:00:00Z', plataforma: 'Google' },
    ],
    analise: {
      pontosFortes: ['Marca forte (Academia Tatame)', '342 avaliações', 'Localização premium'],
      pontosFracos: ['Sem check-in digital', 'Horários mudam sem avisar', 'Gestão manual'],
      oportunidades: ['Muitos alunos para converter', 'Marca facilita marketing'],
      ameacas: ['Franquia pode impor sistema próprio'],
    },
    abordagem: {
      canal: 'instagram',
      mensagemSugerida: 'Olá! Vi que a Academia Tatame BH tem 342 avaliações no Google — impressionante! Sou o Gregory do BlackBelt, uma plataforma de gestão para academias. Ajudamos a controlar presença, financeiro e comunicação com alunos pelo app. Posso mostrar em 10 min? 🥋',
      melhorHorario: 'Terça-feira, 14h-16h (entre aulas)',
      argumentos: ['Check-in por QR elimina chamada manual', 'App pro aluno com evolução e presença', 'Dashboard financeiro automático'],
      objecoesPrevistas: ['Franquia pode ter sistema próprio', 'Já funciona assim há anos'],
    },
  }),

  make('p02', 'Team Kime BH', 'Savassi', '(31) 99876-5432', 4.7, 280, ['BJJ', 'Muay Thai'], 82, 'quente', 'contactado', {
    website: 'https://alliance-bh.com.br',
    reviews: [
      { autor: 'Pedro H.', nota: 5, texto: 'Estrutura impecável, professores de altíssimo nível. Referência!', data: '2026-02-20T10:00:00Z', plataforma: 'Google' },
      { autor: 'Fernanda C.', nota: 4, texto: 'Muito boa, mas cobrança é confusa. Às vezes não sei se pagou.', data: '2026-01-15T14:00:00Z', plataforma: 'Google' },
      { autor: 'Lucas T.', nota: 5, texto: 'Melhor custo-benefício da Savassi. Top demais!', data: '2025-12-20T08:00:00Z', plataforma: 'Google' },
    ],
    abordagem: {
      canal: 'whatsapp',
      mensagemSugerida: 'Fala! Vi que a Team Kime BH tem nota 4.7 no Google com 280 avaliações — referência na Savassi! Sou o Gregory do BlackBelt. Nosso app resolve aquela confusão de cobrança que alguns alunos mencionam. Posso mostrar em 10 min? 🥋',
      melhorHorario: 'Quarta, 15h',
      argumentos: ['Controle de cobrança automático', 'Notificação de vencimento pro aluno', 'Relatórios financeiros'],
      objecoesPrevistas: ['Já tem pessoa que cuida do financeiro', 'Preço'],
    },
    crm: {
      status: 'contactado',
      ultimoContato: '2026-03-12T14:00:00Z',
      proximoContato: '2026-03-19T10:00:00Z',
      historicoContatos: [{ data: '2026-03-12T14:00:00Z', canal: 'WhatsApp', resumo: 'Enviou mensagem, proprietário pediu para ligar semana que vem', resultado: 'Agendou follow-up' }],
      observacoes: ['Dono se chama Marcos, respondeu rápido'],
      responsavel: 'Gregory',
    },
  }),

  make('p03', 'Atos Team Minas', 'Pampulha', '(31) 97654-3210', 4.6, 195, ['BJJ', 'No-Gi', 'Wrestling'], 78, 'quente', 'interessado', {
    reviews: [
      { autor: 'Thiago A.', nota: 5, texto: 'Competição pesada aqui. Time de atletas é muito forte!', data: '2026-02-10T10:00:00Z', plataforma: 'Google' },
      { autor: 'Amanda F.', nota: 4, texto: 'Boa pra quem quer competir. Difícil controlar presença na correria.', data: '2026-01-05T14:00:00Z', plataforma: 'Google' },
    ],
    abordagem: {
      canal: 'whatsapp',
      mensagemSugerida: 'E aí! A Atos Team Minas é referência em competição — nota 4.6 com 195 avaliações! Sou o Gregory do BlackBelt. Nosso sistema controla presença, evolução técnica e prepara planilha de competição. Bora conversar? 🥋',
      melhorHorario: 'Segunda, 14h',
      argumentos: ['Controle de presença automático', 'Avaliação técnica de atletas', 'Gestão de competições'],
      objecoesPrevistas: ['Foco é competição, não gestão', 'Time pequeno de admin'],
    },
    crm: {
      status: 'interessado',
      ultimoContato: '2026-03-14T10:00:00Z',
      proximoContato: '2026-03-20T14:00:00Z',
      historicoContatos: [
        { data: '2026-03-10T10:00:00Z', canal: 'WhatsApp', resumo: 'Primeiro contato, pediu mais info', resultado: 'Enviou material' },
        { data: '2026-03-14T10:00:00Z', canal: 'WhatsApp', resumo: 'Respondeu com interesse, quer ver demo', resultado: 'Agendar demo' },
      ],
      observacoes: ['Professor André é quem decide', 'Foco em competição, mostrar módulo de campeonato'],
      responsavel: 'Gregory',
    },
  }),

  make('p04', 'Academia Vitória BH', 'Buritis', '(31) 96543-2109', 4.5, 220, ['BJJ', 'MMA'], 76, 'quente', 'demo_agendada', {
    abordagem: {
      canal: 'whatsapp',
      mensagemSugerida: 'Olá! A Academia Vitória BH com 220 avaliações é uma das maiores do Buritis! Sou o Gregory do BlackBelt. Tenho um sistema completo de gestão — check-in, financeiro, app. Demo agendada! 🥋',
      melhorHorario: 'Sexta, 10h',
      argumentos: ['Sistema completo tudo-em-um', 'Preço competitivo', 'Suporte dedicado'],
      objecoesPrevistas: ['Quer ver antes de decidir', 'Precisa consultar sócios'],
    },
    crm: {
      status: 'demo_agendada',
      ultimoContato: '2026-03-15T16:00:00Z',
      proximoContato: '2026-03-21T10:00:00Z',
      historicoContatos: [
        { data: '2026-03-08T10:00:00Z', canal: 'Instagram', resumo: 'DM inicial', resultado: 'Respondeu com interesse' },
        { data: '2026-03-12T14:00:00Z', canal: 'WhatsApp', resumo: 'Conversou sobre funcionalidades', resultado: 'Quer ver demo' },
        { data: '2026-03-15T16:00:00Z', canal: 'WhatsApp', resumo: 'Agendou demo para sexta', resultado: 'Demo agendada 21/03' },
      ],
      observacoes: ['Sócio Carlos, interessado no módulo financeiro'],
      responsavel: 'Gregory',
    },
  }),

  make('p05', 'Titans MMA Academy', 'Centro', '(31) 95432-1098', 4.9, 410, ['MMA', 'BJJ', 'Muay Thai', 'Boxe'], 88, 'quente', 'negociando', {
    website: 'https://titansmma.com.br',
    reviews: [
      { autor: 'Ricardo B.', nota: 5, texto: 'A melhor academia de MMA de Minas! Estrutura de primeiro mundo.', data: '2026-03-05T10:00:00Z', plataforma: 'Google' },
      { autor: 'Juliana M.', nota: 5, texto: 'Ambiente incrível, professores top. Treino MMA e BJJ aqui.', data: '2026-02-18T14:00:00Z', plataforma: 'Google' },
      { autor: 'Diego L.', nota: 4, texto: 'Muito lotado nos horários de pico. Difícil estacionar.', data: '2026-01-25T08:00:00Z', plataforma: 'Google' },
    ],
    abordagem: {
      canal: 'presencial',
      mensagemSugerida: 'A Titans com nota 4.9 e 410 avaliações é a maior de BH! Gregory do BlackBelt aqui. Estamos negociando — proposta enviada com plano Profissional. 🥋',
      melhorHorario: 'Quarta, 11h',
      argumentos: ['Controle de lotação por turma', 'App pro aluno ver agenda', 'Multi-modalidade num só sistema'],
      objecoesPrevistas: ['Quer desconto por volume', 'Precisa integrar com sistema de pagamento atual'],
    },
    crm: {
      status: 'negociando',
      ultimoContato: '2026-03-16T10:00:00Z',
      proximoContato: '2026-03-19T14:00:00Z',
      historicoContatos: [
        { data: '2026-03-01T10:00:00Z', canal: 'Presencial', resumo: 'Visita na academia, mostrou o app', resultado: 'Muito interessado' },
        { data: '2026-03-08T14:00:00Z', canal: 'WhatsApp', resumo: 'Enviou proposta comercial', resultado: 'Pediu desconto' },
        { data: '2026-03-16T10:00:00Z', canal: 'WhatsApp', resumo: 'Negociando valor, quer plano anual', resultado: 'Quase fechando' },
      ],
      observacoes: ['Dono: Roberto. Quer desconto 15% no plano anual. Tem 3 unidades.'],
      responsavel: 'Gregory',
    },
  }),

  make('p06', 'Fight House BH', 'Gutierrez', '(31) 94321-0987', 4.4, 160, ['Muay Thai', 'Boxe', 'MMA'], 74, 'quente', 'negociando', {
    abordagem: {
      canal: 'whatsapp',
      mensagemSugerida: 'Olá! A Fight House é referência em striking no Gutierrez — 160 avaliações e nota 4.4! Sou Gregory do BlackBelt. Vamos fechar a parceria? Proposta especial enviada! 🥋',
      melhorHorario: 'Terça, 16h',
      argumentos: ['Módulo de striking com bag timer', 'Controle de luvas e equipamentos', 'Relatório de treino'],
      objecoesPrevistas: ['Comparando com outro sistema', 'Acha caro'],
    },
    crm: {
      status: 'negociando',
      ultimoContato: '2026-03-15T14:00:00Z',
      historicoContatos: [
        { data: '2026-03-05T10:00:00Z', canal: 'Instagram', resumo: 'DM, pediu info', resultado: 'Migrou pro WhatsApp' },
        { data: '2026-03-10T14:00:00Z', canal: 'WhatsApp', resumo: 'Demo por vídeo-chamada', resultado: 'Gostou, quer proposta' },
        { data: '2026-03-15T14:00:00Z', canal: 'WhatsApp', resumo: 'Enviou proposta', resultado: 'Analisando' },
      ],
      observacoes: ['Proprietário: Felipe. Comparando com Pacto.'],
      responsavel: 'Gregory',
    },
  }),

  make('p07', 'Guerreiros BJJ', 'Santa Efigênia', '(31) 93210-9876', 4.7, 310, ['BJJ'], 90, 'quente', 'fechado', {
    website: 'https://guerreirosbjj.com.br',
    abordagem: {
      canal: 'presencial',
      mensagemSugerida: 'Guerreiros BJJ — cliente BlackBelt! 310 avaliações, nota 4.7. Case de sucesso! 🥋',
      melhorHorario: 'Já é cliente',
      argumentos: ['Já usa o sistema', 'Referência para novos prospects'],
      objecoesPrevistas: [],
    },
    crm: {
      status: 'fechado',
      ultimoContato: '2026-02-01T10:00:00Z',
      historicoContatos: [
        { data: '2026-01-15T10:00:00Z', canal: 'Presencial', resumo: 'Visita, demo ao vivo', resultado: 'Adorou' },
        { data: '2026-01-20T14:00:00Z', canal: 'WhatsApp', resumo: 'Proposta enviada', resultado: 'Aceitou' },
        { data: '2026-02-01T10:00:00Z', canal: 'WhatsApp', resumo: 'Onboarding iniciado', resultado: 'Cliente ativo' },
      ],
      observacoes: ['Plano Pro R$249/mês. Dono: Marcos. Referência!'],
      responsavel: 'Gregory',
    },
  }),

  make('p08', 'Elite Fight Academy', 'Serra', '(31) 92109-8765', 4.6, 250, ['MMA', 'BJJ', 'Muay Thai'], 80, 'quente', 'fechado', {
    abordagem: {
      canal: 'whatsapp',
      mensagemSugerida: 'Elite Fight — cliente BlackBelt! 250 avaliações, nota 4.6. 🥋',
      melhorHorario: 'Já é cliente',
      argumentos: ['Já usa o sistema'],
      objecoesPrevistas: [],
    },
    crm: {
      status: 'fechado',
      ultimoContato: '2026-02-15T10:00:00Z',
      historicoContatos: [
        { data: '2026-02-05T10:00:00Z', canal: 'Instagram', resumo: 'DM, mostrou interesse', resultado: 'Agendou demo' },
        { data: '2026-02-10T14:00:00Z', canal: 'WhatsApp', resumo: 'Demo + proposta', resultado: 'Fechou na hora' },
        { data: '2026-02-15T10:00:00Z', canal: 'WhatsApp', resumo: 'Setup completo', resultado: 'Cliente ativo' },
      ],
      observacoes: ['Plano Pro R$249/mês. Super satisfeito.'],
      responsavel: 'Gregory',
    },
  }),

  // ═══ MORNOS (15) — Score 50-70 ═══
  make('p09', 'Arte Suave Jiu-Jitsu', 'Lourdes', '(31) 91098-7654', 4.3, 120, ['BJJ'], 65, 'morno', 'contactado', {
    abordagem: { canal: 'whatsapp', mensagemSugerida: 'Olá! A Arte Suave tem 120 avaliações e nota 4.3 — ótimo trabalho no Lourdes! Sou Gregory do BlackBelt. Nosso app automatiza presença e cobrança. Posso mostrar? 🥋', melhorHorario: 'Quarta, 14h', argumentos: ['Automação de presença', 'Cobrança automática'], objecoesPrevistas: ['Academia pequena, acha que não precisa'] },
    crm: { status: 'contactado', ultimoContato: '2026-03-13T10:00:00Z', historicoContatos: [{ data: '2026-03-13T10:00:00Z', canal: 'WhatsApp', resumo: 'Mensagem enviada, visualizou', resultado: 'Sem resposta ainda' }], observacoes: [], responsavel: 'Gregory' },
  }),
  make('p10', 'Dragon Force Martial Arts', 'Pampulha', '(31) 90987-6543', 4.2, 95, ['Kung Fu', 'Wushu', 'Tai Chi'], 58, 'morno', 'novo'),
  make('p11', 'Samurai Dojo', 'Mangabeiras', '(31) 99988-7766', 4.4, 110, ['Judô', 'Karatê'], 62, 'morno', 'contactado', {
    abordagem: { canal: 'whatsapp', mensagemSugerida: 'Olá! O Samurai Dojo tem nota 4.4 em Mangabeiras — tradição! Sou Gregory do BlackBelt. Nosso sistema tem módulo de graduação por faixa. Posso mostrar? 🥋', melhorHorario: 'Terça, 15h', argumentos: ['Controle de graduação', 'Histórico de evolução'], objecoesPrevistas: ['Arte marcial tradicional, resiste a tecnologia'] },
    crm: { status: 'contactado', ultimoContato: '2026-03-11T14:00:00Z', historicoContatos: [{ data: '2026-03-11T14:00:00Z', canal: 'WhatsApp', resumo: 'Pediu para enviar material por email', resultado: 'Enviou PDF' }], observacoes: ['Sensei Takeshi, prefere email'], responsavel: 'Gregory' },
  }),
  make('p12', 'Nova Era Fight', 'Santo Agostinho', '(31) 98877-6655', 4.1, 85, ['MMA', 'Muay Thai'], 55, 'morno', 'interessado', {
    crm: { status: 'interessado', ultimoContato: '2026-03-14T10:00:00Z', historicoContatos: [{ data: '2026-03-10T10:00:00Z', canal: 'WhatsApp', resumo: 'Primeiro contato', resultado: 'Interessado' }, { data: '2026-03-14T10:00:00Z', canal: 'WhatsApp', resumo: 'Quer ver demo na semana', resultado: 'Agendar' }], observacoes: [], responsavel: 'Gregory' },
  }),
  make('p13', 'Phoenix BJJ Academy', 'Sion', '(31) 97766-5544', 4.3, 130, ['BJJ', 'No-Gi'], 63, 'morno', 'contactado', {
    crm: { status: 'contactado', ultimoContato: '2026-03-12T14:00:00Z', historicoContatos: [{ data: '2026-03-12T14:00:00Z', canal: 'Instagram', resumo: 'DM enviada', resultado: 'Respondeu com emoji de joinha' }], observacoes: [], responsavel: 'Gregory' },
  }),
  make('p14', 'Leão Dourado Artes Marciais', 'Floresta', '(31) 96655-4433', 4.0, 75, ['Karatê', 'Judô', 'Aikido'], 52, 'morno', 'novo'),
  make('p15', 'Black Belt Academy BH', 'Buritis', '(31) 95544-3322', 4.5, 140, ['BJJ', 'Muay Thai', 'Boxe'], 68, 'morno', 'demo_agendada', {
    crm: { status: 'demo_agendada', ultimoContato: '2026-03-16T10:00:00Z', proximoContato: '2026-03-22T10:00:00Z', historicoContatos: [{ data: '2026-03-08T10:00:00Z', canal: 'WhatsApp', resumo: 'Primeiro contato', resultado: 'Interessado' }, { data: '2026-03-16T10:00:00Z', canal: 'WhatsApp', resumo: 'Agendou demo', resultado: 'Demo 22/03' }], observacoes: ['Nome coincide com a marca, pode ser parceria'], responsavel: 'Gregory' },
  }),
  make('p16', 'Tropa de Elite BJJ', 'Centro', '(31) 94433-2211', 4.2, 100, ['BJJ', 'MMA'], 60, 'morno', 'contactado', {
    crm: { status: 'contactado', ultimoContato: '2026-03-09T10:00:00Z', historicoContatos: [{ data: '2026-03-09T10:00:00Z', canal: 'WhatsApp', resumo: 'Mensagem enviada', resultado: 'Leu mas não respondeu' }], observacoes: ['Tentar de novo na semana'], responsavel: 'Gregory' },
  }),
  make('p17', 'Oss Jiu-Jitsu', 'Pampulha', '(31) 93322-1100', 4.1, 88, ['BJJ'], 56, 'morno', 'novo'),
  make('p18', 'Krav Maga BH Defense', 'Savassi', '(31) 92211-0099', 4.4, 135, ['Krav Maga', 'Defesa Pessoal'], 64, 'morno', 'contactado', {
    crm: { status: 'contactado', ultimoContato: '2026-03-10T10:00:00Z', historicoContatos: [{ data: '2026-03-10T10:00:00Z', canal: 'Instagram', resumo: 'DM, respondeu com dúvidas', resultado: 'Enviou vídeo demo' }], observacoes: ['Público diferente (defesa pessoal), mostrar versatilidade'], responsavel: 'Gregory' },
  }),
  make('p19', 'Capoeira Raízes', 'Barreiro', '(31) 91100-9988', 4.0, 65, ['Capoeira'], 50, 'morno', 'novo'),
  make('p20', 'Iron Fist Boxe', 'Centro', '(31) 90099-8877', 4.3, 105, ['Boxe', 'Kickboxing'], 59, 'morno', 'interessado', {
    crm: { status: 'interessado', ultimoContato: '2026-03-13T14:00:00Z', historicoContatos: [{ data: '2026-03-07T10:00:00Z', canal: 'WhatsApp', resumo: 'Contato inicial', resultado: 'Pediu mais info' }, { data: '2026-03-13T14:00:00Z', canal: 'WhatsApp', resumo: 'Enviou material, gostou', resultado: 'Quer demo' }], observacoes: ['Treinador José, foco em boxe olímpico'], responsavel: 'Gregory' },
  }),
  make('p21', 'Taekwondo Minas', 'Venda Nova', '(31) 99877-8866', 4.2, 90, ['Taekwondo'], 54, 'morno', 'contactado', {
    crm: { status: 'contactado', ultimoContato: '2026-03-11T10:00:00Z', historicoContatos: [{ data: '2026-03-11T10:00:00Z', canal: 'WhatsApp', resumo: 'Contato inicial', resultado: 'Pediu para ligar depois' }], observacoes: [], responsavel: 'Gregory' },
  }),
  make('p22', 'Muay Thai Warriors', 'Gutierrez', '(31) 98766-7755', 4.1, 78, ['Muay Thai'], 53, 'morno', 'interessado', {
    crm: { status: 'interessado', ultimoContato: '2026-03-15T10:00:00Z', historicoContatos: [{ data: '2026-03-12T10:00:00Z', canal: 'WhatsApp', resumo: 'Primeiro contato', resultado: 'Respondeu' }, { data: '2026-03-15T10:00:00Z', canal: 'WhatsApp', resumo: 'Quer ver planos e preços', resultado: 'Enviou proposta' }], observacoes: ['Mestre Kru Somchai, tailandês morando em BH'], responsavel: 'Gregory' },
  }),
  make('p23', 'JJ Combat Team', 'Santa Efigênia', '(31) 97655-6644', 4.0, 70, ['BJJ', 'Wrestling'], 51, 'morno', 'demo_agendada', {
    crm: { status: 'demo_agendada', ultimoContato: '2026-03-16T14:00:00Z', proximoContato: '2026-03-23T10:00:00Z', historicoContatos: [{ data: '2026-03-10T10:00:00Z', canal: 'WhatsApp', resumo: 'Contato, interessou', resultado: 'Agendou demo' }], observacoes: ['Time de competição, foco no módulo de campeonato'], responsavel: 'Gregory' },
  }),

  // ═══ FRIOS (12) — Score 30-50 ═══
  make('p24', 'Academia Faixa Preta', 'Barreiro', '(31) 96544-5533', 3.8, 45, ['BJJ'], 42, 'frio', 'novo'),
  make('p25', 'Centro de Lutas BH', 'Venda Nova', '(31) 95433-4422', 3.5, 30, ['MMA', 'Boxe'], 35, 'frio', 'novo'),
  make('p26', 'Judô Clube Minas', 'Pampulha', '(31) 94322-3311', 4.0, 55, ['Judô'], 45, 'frio', 'novo'),
  make('p27', 'Kick Power', 'Centro', '(31) 93211-2200', 3.7, 40, ['Kickboxing', 'Muay Thai'], 38, 'frio', 'perdido', {
    crm: { status: 'perdido', ultimoContato: '2026-02-20T10:00:00Z', historicoContatos: [{ data: '2026-02-15T10:00:00Z', canal: 'WhatsApp', resumo: 'Contato inicial', resultado: 'Não tem interesse' }, { data: '2026-02-20T10:00:00Z', canal: 'WhatsApp', resumo: 'Follow-up', resultado: 'Disse que não precisa' }], observacoes: [], responsavel: 'Gregory', motivoPerda: 'Não preciso de sistema' },
  }),
  make('p28', 'Shaolin Kung Fu BH', 'Floresta', '(31) 92100-1199', 3.9, 35, ['Kung Fu'], 40, 'frio', 'novo'),
  make('p29', 'Garra MMA', 'Sion', '(31) 91099-0088', 3.6, 28, ['MMA'], 33, 'frio', 'perdido', {
    crm: { status: 'perdido', ultimoContato: '2026-02-25T14:00:00Z', historicoContatos: [{ data: '2026-02-25T14:00:00Z', canal: 'WhatsApp', resumo: 'Contactou', resultado: 'Diz que já tem sistema' }], observacoes: [], responsavel: 'Gregory', motivoPerda: 'Já tem sistema' },
  }),
  make('p30', 'Templo das Artes', 'Lourdes', '(31) 90088-9977', 3.8, 50, ['Karatê', 'Aikido'], 43, 'frio', 'novo'),
  make('p31', 'Spartan Fight', 'Serra', '(31) 99766-8855', 3.5, 22, ['MMA', 'CrossFit Fight'], 30, 'frio', 'novo'),
  make('p32', 'Jiu-Jitsu Raiz', 'Mangabeiras', '(31) 98655-7744', 4.1, 60, ['BJJ'], 48, 'frio', 'novo'),
  make('p33', 'Boxe Clube Mineiro', 'Centro', '(31) 97544-6633', 3.9, 42, ['Boxe'], 41, 'frio', 'novo'),
  make('p34', 'Capoeira Angola BH', 'Santa Teresa', '(31) 96433-5522', 4.2, 38, ['Capoeira'], 44, 'frio', 'novo'),
  make('p35', 'Tiger Muay Thai BH', 'Santo Agostinho', '(31) 95322-4411', 3.7, 32, ['Muay Thai'], 36, 'frio', 'perdido', {
    crm: { status: 'perdido', ultimoContato: '2026-03-01T10:00:00Z', historicoContatos: [{ data: '2026-03-01T10:00:00Z', canal: 'WhatsApp', resumo: 'Contactou', resultado: 'Muito caro' }], observacoes: [], responsavel: 'Gregory', motivoPerda: 'Muito caro' },
  }),

  // ═══ SEM DADOS (5) — Score 10-30 ═══
  make('p36', 'Academia do Zé', 'Barreiro', '(31) 94211-3300', 3.0, 8, ['BJJ'], 15, 'frio', 'novo', {
    analise: { pontosFortes: [], pontosFracos: ['Sem site', 'Sem Instagram', 'Poucas avaliações', 'Sem informações de contato completas'], oportunidades: ['Mercado inexplorado no Barreiro'], ameacas: ['Pode não ter estrutura para investir'] },
  }),
  make('p37', 'Luta Livre Centro', 'Centro', '(31) 93100-2299', 2.8, 5, ['Luta Livre'], 12, 'frio', 'novo', {
    analise: { pontosFortes: [], pontosFracos: ['Nota muito baixa', 'Quase sem avaliações', 'Sem presença digital'], oportunidades: [], ameacas: ['Pode estar fechando'] },
  }),
  make('p38', 'Dojo Sakura', 'Venda Nova', '(31) 92099-1188', 3.2, 12, ['Karatê'], 18, 'frio', 'novo'),
  make('p39', 'Fight Club BH', 'Pampulha', '(31) 91088-0077', 3.5, 15, ['MMA', 'Boxe'], 22, 'frio', 'novo'),
  make('p40', 'Espaço Marcial', 'Floresta', '(31) 90077-9966', 3.3, 10, ['Judô', 'Karatê'], 16, 'frio', 'novo'),

  // ═══ JÁ TEM SISTEMA (5) — Score 15-35 ═══
  make('p41', 'Smart Fit Fight', 'Savassi', '(31) 99655-8844', 4.4, 180, ['Muay Thai', 'Boxe', 'Funcional'], 25, 'frio', 'novo', {
    website: 'https://smartfitfight.com.br',
    analise: { pontosFortes: ['Rede grande', 'Sistema próprio'], pontosFracos: [], oportunidades: [], ameacas: ['Usa sistema corporativo, impossível migrar'] },
    abordagem: { canal: 'whatsapp', mensagemSugerida: 'Smart Fit Fight já usa sistema corporativo — skip.', melhorHorario: '-', argumentos: [], objecoesPrevistas: ['Sistema corporativo obrigatório'] },
  }),
  make('p42', 'Tatame Real BH', 'Funcionários', '(31) 98544-7733', 4.6, 200, ['BJJ'], 30, 'frio', 'novo', {
    website: 'https://tatamereal-bh.com.br',
    analise: { pontosFortes: ['Franquia forte', 'Sistema da franquia'], pontosFracos: [], oportunidades: [], ameacas: ['Franquia impõe sistema próprio'] },
    abordagem: { canal: 'whatsapp', mensagemSugerida: 'Tatame Real usa sistema da franquia — difícil conversão.', melhorHorario: '-', argumentos: [], objecoesPrevistas: ['Obrigado a usar sistema da franquia'] },
  }),
  make('p43', 'CrossFight Academy', 'Buritis', '(31) 97433-6622', 4.3, 150, ['CrossFit Fight', 'MMA'], 28, 'frio', 'novo', {
    website: 'https://crossfight.com.br',
    analise: { pontosFortes: ['Usa Wodify (sistema de CrossFit)'], pontosFracos: [], oportunidades: ['Pode querer algo específico pra artes marciais'], ameacas: ['Já paga Wodify, resistência a outro custo'] },
    abordagem: { canal: 'whatsapp', mensagemSugerida: 'CrossFight usa Wodify. Pode não querer trocar, mas BB é mais completo pra artes marciais.', melhorHorario: 'Terça, 14h', argumentos: ['BlackBelt é feito pra artes marciais, Wodify não'], objecoesPrevistas: ['Já paga Wodify', 'Migração é trabalhosa'] },
  }),
  make('p44', 'Alpha Fit Martial', 'Centro', '(31) 96322-5511', 4.1, 90, ['Funcional', 'MMA'], 20, 'frio', 'novo', {
    analise: { pontosFortes: ['Usa sistema Tecnofit'], pontosFracos: [], oportunidades: [], ameacas: ['Satisfeito com sistema atual'] },
    abordagem: { canal: 'whatsapp', mensagemSugerida: 'Alpha Fit usa Tecnofit — difícil migrar. Monitorar.', melhorHorario: '-', argumentos: [], objecoesPrevistas: ['Já tem Tecnofit e está satisfeito'] },
  }),
  make('p45', 'FitCombat BH', 'Serra', '(31) 95211-4400', 4.2, 110, ['Funcional', 'Boxe', 'Muay Thai'], 22, 'frio', 'novo', {
    analise: { pontosFortes: ['Usa sistema Pacto'], pontosFracos: [], oportunidades: ['Pacto é caro, pode querer alternativa'], ameacas: ['Migração tem custo'] },
    abordagem: { canal: 'whatsapp', mensagemSugerida: 'FitCombat usa Pacto — monitorar insatisfação. Pacto é caro, pode querer trocar.', melhorHorario: 'Quarta, 14h', argumentos: ['BlackBelt mais barato que Pacto', 'Migração assistida'], objecoesPrevistas: ['Migrar dados é trabalhoso', 'Time já aprendeu Pacto'] },
  }),
];

// ── Dashboard ──

export const MOCK_DASHBOARD: ProspeccaoDashboard = {
  totalProspects: 45,
  porStatus: {
    novo: 20,
    contactado: 10,
    interessado: 5,
    demoAgendada: 3,
    negociando: 2,
    fechado: 2,
    perdido: 3,
  },
  taxaConversao: 0.10,
  tempoMedioFechamento: 12,
  mrrClientes: 694,
  ultimasBuscas: [
    { query: 'jiu jitsu Belo Horizonte', resultados: 18, data: '2026-03-17T10:00:00Z' },
    { query: 'muay thai Savassi', resultados: 5, data: '2026-03-16T14:00:00Z' },
    { query: 'MMA Centro BH', resultados: 8, data: '2026-03-15T09:00:00Z' },
    { query: 'academias Pampulha', resultados: 6, data: '2026-03-14T11:00:00Z' },
    { query: 'karate judo BH', resultados: 4, data: '2026-03-13T16:00:00Z' },
  ],
  proximosContatos: [
    { academia: 'Team Kime BH', data: '2026-03-19T10:00:00Z', canal: 'WhatsApp' },
    { academia: 'Titans MMA Academy', data: '2026-03-19T14:00:00Z', canal: 'Presencial' },
    { academia: 'Atos Team Minas', data: '2026-03-20T14:00:00Z', canal: 'WhatsApp' },
    { academia: 'Academia Vitória BH', data: '2026-03-21T10:00:00Z', canal: 'WhatsApp' },
    { academia: 'Black Belt Academy BH', data: '2026-03-22T10:00:00Z', canal: 'WhatsApp' },
  ],
  regioes: [
    { bairro: 'Centro', cidade: 'Belo Horizonte', estado: 'MG', academias: 8, quentes: 1, mornos: 4, frios: 3 },
    { bairro: 'Pampulha', cidade: 'Belo Horizonte', estado: 'MG', academias: 6, quentes: 1, mornos: 2, frios: 3 },
    { bairro: 'Savassi', cidade: 'Belo Horizonte', estado: 'MG', academias: 4, quentes: 1, mornos: 2, frios: 1 },
    { bairro: 'Funcionários', cidade: 'Belo Horizonte', estado: 'MG', academias: 3, quentes: 1, mornos: 0, frios: 2 },
    { bairro: 'Buritis', cidade: 'Belo Horizonte', estado: 'MG', academias: 4, quentes: 1, mornos: 2, frios: 1 },
    { bairro: 'Barreiro', cidade: 'Belo Horizonte', estado: 'MG', academias: 3, quentes: 0, mornos: 0, frios: 3 },
    { bairro: 'Venda Nova', cidade: 'Belo Horizonte', estado: 'MG', academias: 3, quentes: 0, mornos: 1, frios: 2 },
  ],
  funnelData: [
    { stage: 'Novo', count: 20, percentage: 100 },
    { stage: 'Contactado', count: 10, percentage: 50 },
    { stage: 'Interessado', count: 5, percentage: 25 },
    { stage: 'Demo', count: 3, percentage: 15 },
    { stage: 'Negociando', count: 2, percentage: 10 },
    { stage: 'Fechado', count: 2, percentage: 10 },
    { stage: 'Perdido', count: 3, percentage: 15 },
  ],
  weeklyData: [
    { semana: 'Sem 1 Mar', novos: 12, contatos: 8, demos: 1, fechados: 0 },
    { semana: 'Sem 2 Mar', novos: 8, contatos: 6, demos: 2, fechados: 1 },
    { semana: 'Sem 3 Mar', novos: 15, contatos: 10, demos: 2, fechados: 1 },
    { semana: 'Sem 4 Mar', novos: 10, contatos: 5, demos: 1, fechados: 0 },
  ],
  scoreDistribution: [
    { classificacao: 'Quente', count: 8, percentage: 18 },
    { classificacao: 'Morno', count: 15, percentage: 33 },
    { classificacao: 'Frio', count: 22, percentage: 49 },
  ],
  canaisEficacia: [
    { canal: 'WhatsApp', taxaResposta: 0.40, contatos: 25 },
    { canal: 'Instagram', taxaResposta: 0.25, contatos: 10 },
    { canal: 'Email', taxaResposta: 0.10, contatos: 5 },
    { canal: 'Presencial', taxaResposta: 0.60, contatos: 3 },
  ],
  topObjecoes: [
    { motivo: 'Já tenho sistema', percentage: 35, count: 7 },
    { motivo: 'Muito caro', percentage: 25, count: 5 },
    { motivo: 'Não preciso', percentage: 20, count: 4 },
    { motivo: 'Depois vejo', percentage: 20, count: 4 },
  ],
};
