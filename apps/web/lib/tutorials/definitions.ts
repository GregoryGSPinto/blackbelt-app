// ── Tutorial Type Definitions ─────────────────────────────────────────────

export interface TutorialStep {
  id: string;
  targetSelector: string;
  targetPosition?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  titulo: string;
  descricao: string;
  icone?: string;
  acao?: {
    tipo: 'click' | 'navigate' | 'observe' | 'input';
    label: string;
    targetUrl?: string;
  };
  spotlightPadding?: number;
  overlayOpacity?: number;
  tooltipWidth?: number;
}

export interface TutorialDefinition {
  id: string;
  perfil: string;
  nome: string;
  descricao: string;
  emoji: string;
  steps: TutorialStep[];
  estimativaMinutos: number;
  obrigatorio: boolean;
  completionItems: string[];
}

// ── Role → Tutorial ID mapping ──────────────────────────────────────────

export const ROLE_TUTORIAL_MAP: Record<string, string> = {
  superadmin: 'tutorial-superadmin',
  admin: 'tutorial-admin',
  professor: 'tutorial-professor',
  aluno_adulto: 'tutorial-aluno-adulto',
  aluno_teen: 'tutorial-teen',
  aluno_kids: 'tutorial-kids',
  responsavel: 'tutorial-responsavel',
  recepcao: 'tutorial-recepcao',
  franqueador: 'tutorial-franqueador',
};

// ── TUTORIAL 1: SUPER ADMIN ─────────────────────────────────────────────

const TUTORIAL_SUPERADMIN: TutorialStep[] = [
  {
    id: 'sa-1',
    targetSelector: '#superadmin-sidebar',
    titulo: '🏢 Seu Painel de Comando',
    descricao: 'Aqui você gerencia TODA a plataforma BlackBelt. Academias, receita, features e mais.',
    acao: { tipo: 'observe', label: 'Veja o menu lateral' },
  },
  {
    id: 'sa-2',
    targetSelector: '#mission-control-kpis',
    titulo: '📊 Mission Control',
    descricao: 'KPIs em tempo real: MRR, academias ativas, alunos na plataforma, churn rate. Tudo num olhar.',
    acao: { tipo: 'observe', label: 'Estes são seus números' },
  },
  {
    id: 'sa-3',
    targetSelector: '#sidebar-link-pipeline',
    titulo: '📈 Pipeline Comercial',
    descricao: 'Funil de aquisição de academias. De lead até ativo. Acompanhe cada negociação.',
    acao: { tipo: 'observe', label: 'Clique para ver o pipeline' },
  },
  {
    id: 'sa-4',
    targetSelector: '#sidebar-link-academias',
    titulo: '🏟️ Academias',
    descricao: 'Todas as academias da plataforma. Health score, compliance, dados. Clique numa para ver detalhes.',
    acao: { tipo: 'observe', label: 'Veja suas academias' },
  },
  {
    id: 'sa-5',
    targetSelector: '#sidebar-link-receita',
    titulo: '💰 Centro de Receita',
    descricao: 'MRR, ARR, cohort de retenção, LTV/CAC, projeções. Tudo que investidor pergunta.',
    acao: { tipo: 'observe', label: 'Explore a receita' },
  },
  {
    id: 'sa-6',
    targetSelector: '#sidebar-link-planos',
    titulo: '💳 Planos e Preços',
    descricao: 'Gerencie faixas, módulos e pacotes. CRUD completo de precificação.',
    acao: { tipo: 'observe', label: 'Veja os planos' },
  },
  {
    id: 'sa-7',
    targetSelector: '#sidebar-link-features',
    titulo: '⚙️ Feature Flags',
    descricao: 'Liga/desliga funcionalidades por academia ou plano. Controle granular sem deploy.',
    acao: { tipo: 'observe', label: 'Controle total' },
  },
  {
    id: 'sa-8',
    targetSelector: '#sidebar-link-comunicacao',
    titulo: '📢 Comunicação',
    descricao: 'Envie avisos para todas as academias. Segmentado por plano, health score ou manual.',
    acao: { tipo: 'observe', label: 'Fale com a rede' },
  },
  {
    id: 'sa-9',
    targetSelector: '#sidebar-link-analytics',
    titulo: '📊 Product Analytics',
    descricao: 'Quais features são mais usadas? Quais academias mais engajam? Dados para o roadmap.',
    acao: { tipo: 'observe', label: 'Dados do produto' },
  },
  {
    id: 'sa-10',
    targetSelector: '#sidebar-link-onboarding',
    titulo: '🚀 Onboarding',
    descricao: 'Gere links para novas academias se cadastrarem. O começo de tudo.',
    acao: { tipo: 'observe', label: 'Crie academias' },
  },
];

// ── TUTORIAL 2: ADMIN ───────────────────────────────────────────────────

const TUTORIAL_ADMIN: TutorialStep[] = [
  {
    id: 'ad-1',
    targetSelector: '#admin-dashboard-header',
    titulo: '👋 Bem-vindo ao seu Painel!',
    descricao: 'Este é o comando da sua academia. Tudo que você precisa, num lugar só.',
    acao: { tipo: 'observe', label: 'Vamos conhecer' },
  },
  {
    id: 'ad-2',
    targetSelector: '#dashboard-kpis',
    titulo: '📊 Seus Números',
    descricao: 'Alunos ativos, receita do mês, presença média e inadimplência. Atualizado em tempo real.',
    acao: { tipo: 'observe', label: 'Estes são seus KPIs' },
  },
  {
    id: 'ad-3',
    targetSelector: '#dashboard-painel-dia',
    titulo: '📅 Painel do Dia',
    descricao: 'Aulas de hoje, aniversariantes, pagamentos vencendo e graduações prontas. Ação imediata.',
    acao: { tipo: 'observe', label: 'O que importa HOJE' },
  },
  {
    id: 'ad-4',
    targetSelector: '#sidebar-link-turmas',
    titulo: '📚 Turmas',
    descricao: 'Crie e gerencie turmas. Defina horários, professor, modalidade e capacidade.',
    acao: { tipo: 'observe', label: 'Veja suas turmas' },
  },
  {
    id: 'ad-5',
    targetSelector: '#sidebar-link-alunos',
    titulo: '👥 Alunos',
    descricao: 'Todos os alunos da academia. Busque por nome, filtre por faixa, veja progresso.',
    acao: { tipo: 'observe', label: 'Veja seus alunos' },
  },
  {
    id: 'ad-6',
    targetSelector: '#sidebar-link-financeiro',
    titulo: '💰 Financeiro',
    descricao: 'Mensalidades, cobranças, inadimplência. Controle total do dinheiro.',
    acao: { tipo: 'observe', label: 'Veja o financeiro' },
  },
  {
    id: 'ad-7',
    targetSelector: '#sidebar-link-aula-experimental',
    titulo: '🧪 Aula Experimental',
    descricao: 'Seu funil de vendas. Agende, confirme, acompanhe conversão. É assim que a academia cresce.',
    acao: { tipo: 'observe', label: 'Leads e vendas' },
  },
  {
    id: 'ad-8',
    targetSelector: '#sidebar-link-convites',
    titulo: '🔗 Convites',
    descricao: 'Gere links de cadastro para alunos e professores. Cada link já vem com a academia certa.',
    acao: { tipo: 'observe', label: 'Gere um convite' },
  },
  {
    id: 'ad-9',
    targetSelector: '#sidebar-link-graduacoes',
    titulo: '🥋 Graduações',
    descricao: 'Promoções de faixa. Veja quem está pronto, aprove promoções, registre histórico.',
    acao: { tipo: 'observe', label: 'Evolução dos alunos' },
  },
  {
    id: 'ad-10',
    targetSelector: '#sidebar-link-conteudo',
    titulo: '📺 Conteúdo',
    descricao: 'Biblioteca de vídeos. Seus alunos assistem aulas online, trilhas e certificados.',
    acao: { tipo: 'observe', label: 'Netflix da academia' },
  },
  {
    id: 'ad-11',
    targetSelector: '#sidebar-link-meu-plano',
    titulo: '💎 Meu Plano',
    descricao: 'Gerencie sua assinatura. Ative módulos, veja uso, faça upgrade.',
    acao: { tipo: 'observe', label: 'Veja seu plano' },
  },
  {
    id: 'ad-12',
    targetSelector: '#sidebar-link-configuracoes',
    titulo: '⚙️ Configurações',
    descricao: 'Personalize sua academia. Logo, cores, dados, equipe. Tudo aqui.',
    acao: { tipo: 'observe', label: 'Configure tudo' },
  },
];

// ── TUTORIAL 3: PROFESSOR ───────────────────────────────────────────────

const TUTORIAL_PROFESSOR: TutorialStep[] = [
  {
    id: 'pr-1',
    targetSelector: '#professor-dashboard',
    titulo: '🥋 Bem-vindo, Professor!',
    descricao: 'Este é seu painel. Aulas, alunos, avaliações e planejamento — tudo aqui.',
    acao: { tipo: 'observe', label: 'Vamos conhecer' },
  },
  {
    id: 'pr-2',
    targetSelector: '#dashboard-proxima-aula',
    titulo: '📅 Próxima Aula',
    descricao: 'Sua próxima aula aparece aqui com countdown. Um clique para iniciar o modo aula.',
    acao: { tipo: 'observe', label: 'Sua agenda' },
  },
  {
    id: 'pr-3',
    targetSelector: '#dashboard-alertas',
    titulo: '⚠️ Alertas',
    descricao: 'Alunos em risco, graduações prontas, aniversários. O que precisa da sua atenção.',
    acao: { tipo: 'observe', label: 'Fique atento' },
  },
  {
    id: 'pr-4',
    targetSelector: '#sidebar-link-turma-ativa',
    titulo: '🎯 Modo Aula',
    descricao: 'Tela fullscreen para usar durante a aula. Chamada, QR code, alertas de alunos.',
    acao: { tipo: 'observe', label: 'Conheça o modo aula' },
  },
  {
    id: 'pr-5',
    targetSelector: '#sidebar-link-alunos',
    titulo: '👥 Seus Alunos',
    descricao: 'Visão 360° de cada aluno. Presença, avaliações, restrições médicas, notas.',
    acao: { tipo: 'observe', label: 'Conheça seus alunos' },
  },
  {
    id: 'pr-6',
    targetSelector: '#sidebar-link-avaliacoes',
    titulo: '📊 Avaliações',
    descricao: 'Avaliação técnica com radar chart. 8 critérios. Evolução ao longo do tempo.',
    acao: { tipo: 'observe', label: 'Avalie seus alunos' },
  },
  {
    id: 'pr-7',
    targetSelector: '#sidebar-link-diario',
    titulo: '📓 Diário de Aulas',
    descricao: 'Registre o que ensinou em cada aula. Meses depois, tem histórico completo.',
    acao: { tipo: 'observe', label: 'Seu caderno digital' },
  },
  {
    id: 'pr-8',
    targetSelector: '#sidebar-link-plano-aula',
    titulo: '📝 Plano de Aula',
    descricao: 'Planeje a semana. Aquecimento, técnica, sparring. Banco de técnicas integrado.',
    acao: { tipo: 'observe', label: 'Planeje suas aulas' },
  },
  {
    id: 'pr-9',
    targetSelector: '#sidebar-link-tecnicas',
    titulo: '🥋 Banco de Técnicas',
    descricao: '60+ técnicas de BJJ, Muay Thai e Judô. Organizadas por posição e faixa.',
    acao: { tipo: 'observe', label: 'Sua biblioteca técnica' },
  },
  {
    id: 'pr-10',
    targetSelector: '#sidebar-link-mensagens',
    titulo: '💬 Mensagens',
    descricao: 'Converse com alunos e responsáveis. Comunicação direta e privada.',
    acao: { tipo: 'observe', label: 'Fale com seus alunos' },
  },
];

// ── TUTORIAL 4: ALUNO ADULTO ────────────────────────────────────────────

const TUTORIAL_ALUNO_ADULTO: TutorialStep[] = [
  {
    id: 'al-1',
    targetSelector: '#aluno-dashboard-header',
    titulo: '🥋 Bem-vindo, Guerreiro!',
    descricao: 'Este é seu app de artes marciais. Treinos, evolução, conquistas — tudo na palma da mão.',
    acao: { tipo: 'observe', label: 'Sua jornada começa aqui' },
  },
  {
    id: 'al-2',
    targetSelector: '#dashboard-proxima-aula',
    titulo: '📅 Sua Próxima Aula',
    descricao: 'Veja quando é seu próximo treino. Turma, horário, professor — tudo aqui.',
    acao: { tipo: 'observe', label: 'Nunca perca um treino' },
  },
  {
    id: 'al-3',
    targetSelector: '#dashboard-progresso-faixa',
    titulo: '🥋 Progresso de Faixa',
    descricao: 'Acompanhe quanto falta para sua próxima graduação. Presenças, avaliação e tempo.',
    acao: { tipo: 'observe', label: 'Sua evolução' },
  },
  {
    id: 'al-4',
    targetSelector: '#dashboard-streak',
    titulo: '🔥 Streak de Treino',
    descricao: 'Quantos dias seguidos você treinou. Mantenha a sequência e ganhe conquistas!',
    acao: { tipo: 'observe', label: 'Não quebre o streak!' },
  },
  {
    id: 'al-5',
    targetSelector: '#nav-checkin',
    titulo: '📱 Check-in',
    descricao: 'Chegou na academia? Faça check-in pelo QR code. Rápido e registra sua presença.',
    acao: { tipo: 'observe', label: 'Faça seu primeiro check-in' },
  },
  {
    id: 'al-6',
    targetSelector: '#nav-conquistas',
    titulo: '🏆 Conquistas',
    descricao: 'Desbloqueie badges treinando. Da primeira aula ao Streak 365. Algumas são lendárias!',
    acao: { tipo: 'observe', label: 'Colecione conquistas' },
  },
  {
    id: 'al-7',
    targetSelector: '#nav-biblioteca',
    titulo: '📺 Biblioteca de Vídeos',
    descricao: 'Assista aulas online. Trilhas por faixa, quiz, certificados. Estude fora do tatame.',
    acao: { tipo: 'observe', label: 'Netflix do tatame' },
  },
  {
    id: 'al-8',
    targetSelector: '#nav-perfil',
    titulo: '👤 Seu Perfil',
    descricao: 'Sua jornada completa. Timeline de marcos, heatmap de presença, carteirinha digital.',
    acao: { tipo: 'observe', label: 'Seu histórico' },
  },
];

// ── TUTORIAL 5: TEEN ────────────────────────────────────────────────────

const TUTORIAL_TEEN: TutorialStep[] = [
  {
    id: 'te-1',
    targetSelector: '#teen-xp-bar',
    titulo: '⚡ Sua Barra de XP!',
    descricao: 'Tudo que você faz ganha XP. Treinar, assistir vídeo, completar desafios. Suba de level!',
    acao: { tipo: 'observe', label: 'XP é vida!' },
  },
  {
    id: 'te-2',
    targetSelector: '#teen-ranking',
    titulo: '🏆 Ranking',
    descricao: 'Sua posição entre todos os teens da academia. Quem ganha mais XP fica no topo!',
    acao: { tipo: 'observe', label: 'Compete!' },
  },
  {
    id: 'te-3',
    targetSelector: '#teen-season',
    titulo: '🐉 Season Pass',
    descricao: 'Cada temporada tem tema, recompensas e ranking próprio. Complete níveis e ganhe prêmios!',
    acao: { tipo: 'observe', label: 'Veja a temporada' },
  },
  {
    id: 'te-4',
    targetSelector: '#nav-desafios',
    titulo: '🎯 Desafios',
    descricao: 'Desafios semanais e mensais. Complete e ganhe XP bônus + badges exclusivos.',
    acao: { tipo: 'observe', label: 'Aceite um desafio' },
  },
  {
    id: 'te-5',
    targetSelector: '#nav-conquistas',
    titulo: '🏅 Conquistas',
    descricao: 'Badges com raridade: Comum, Raro, Épico, Lendário. As lendárias brilham dourado!',
    acao: { tipo: 'observe', label: 'Colecione badges' },
  },
  {
    id: 'te-6',
    targetSelector: '#nav-checkin',
    titulo: '📱 Check-in = +15 XP!',
    descricao: 'Cada check-in dá XP. Streak dá bônus. Quanto mais treina, mais sobe.',
    acao: { tipo: 'observe', label: 'Treina e ganha' },
  },
  {
    id: 'te-7',
    targetSelector: '#nav-biblioteca',
    titulo: '📺 Vídeos = +XP!',
    descricao: 'Assista vídeos e ganhe XP. Quiz no final dá bônus. Desafio semanal: 2 vídeos = +30 XP.',
    acao: { tipo: 'observe', label: 'Aprenda e ganhe' },
  },
  {
    id: 'te-8',
    targetSelector: '#nav-perfil',
    titulo: '🎮 Seu Perfil Gamer',
    descricao: 'Escolha seu título, veja seus stats, mostre suas conquistas. É a sua identidade!',
    acao: { tipo: 'observe', label: 'Personalize seu perfil' },
  },
];

// ── TUTORIAL 6: KIDS (max 6 steps, max 12 words) ───────────────────────

const TUTORIAL_KIDS: TutorialStep[] = [
  {
    id: 'ki-1',
    targetSelector: '#kids-mascote',
    titulo: '🦁 Oi! Eu sou seu mascote!',
    descricao: 'Vou te acompanhar no tatame!',
    acao: { tipo: 'observe', label: 'Legal!' },
  },
  {
    id: 'ki-2',
    targetSelector: '#kids-estrelas',
    titulo: '⭐ Suas Estrelas!',
    descricao: 'Treina e ganha estrelas!',
    acao: { tipo: 'observe', label: 'Que demais!' },
  },
  {
    id: 'ki-3',
    targetSelector: '#nav-figurinhas',
    titulo: '🎯 Álbum de Figurinhas!',
    descricao: 'Colecione todas! São 30!',
    acao: { tipo: 'observe', label: 'Quero ver!' },
  },
  {
    id: 'ki-4',
    targetSelector: '#nav-aventuras',
    titulo: '📺 Aventuras!',
    descricao: 'Vídeos super divertidos!',
    acao: { tipo: 'observe', label: 'Assistir!' },
  },
  {
    id: 'ki-5',
    targetSelector: '#nav-recompensas',
    titulo: '🎁 Troque Estrelas!',
    descricao: 'Estrelas viram prêmios!',
    acao: { tipo: 'observe', label: 'Quero prêmios!' },
  },
  {
    id: 'ki-6',
    targetSelector: '#nav-perfil',
    titulo: '😊 Seu Perfil!',
    descricao: 'Escolha seu mascote favorito!',
    acao: { tipo: 'observe', label: 'Escolher!' },
  },
];

// ── TUTORIAL 7: RESPONSÁVEL ─────────────────────────────────────────────

const TUTORIAL_RESPONSAVEL: TutorialStep[] = [
  {
    id: 're-1',
    targetSelector: '#parent-dashboard',
    titulo: '👨‍👩‍👧 Olá! Este é seu painel familiar.',
    descricao: 'Acompanhe a evolução dos seus filhos na academia. Presenças, notas e mais.',
    acao: { tipo: 'observe', label: 'Vamos ver' },
  },
  {
    id: 're-2',
    targetSelector: '#parent-seletor-filho',
    titulo: '👤 Seletor de Filhos',
    descricao: 'Se tem mais de um filho, alterne entre eles aqui. Cada um tem seu painel.',
    acao: { tipo: 'observe', label: 'Selecione o filho' },
  },
  {
    id: 're-3',
    targetSelector: '#parent-resumo-filho',
    titulo: '📊 Resumo do Filho',
    descricao: 'Presença, última aula, evolução, pagamento. Tudo num card.',
    acao: { tipo: 'observe', label: 'Visão rápida' },
  },
  {
    id: 're-4',
    targetSelector: '#nav-agenda',
    titulo: '📅 Agenda Familiar',
    descricao: 'Calendário com as aulas de TODOS os filhos. Saiba quando levar e buscar.',
    acao: { tipo: 'observe', label: 'Veja a agenda' },
  },
  {
    id: 're-5',
    targetSelector: '#nav-mensagens',
    titulo: '💬 Mensagens com Professor',
    descricao: 'Canal direto com quem cuida do seu filho no tatame. Pergunte, acompanhe.',
    acao: { tipo: 'observe', label: 'Fale com o professor' },
  },
  {
    id: 're-6',
    targetSelector: '#nav-pagamentos',
    titulo: '💳 Pagamentos',
    descricao: 'Faturas, boletos, PIX. Tudo consolidado por filho. Sem surpresa.',
    acao: { tipo: 'observe', label: 'Veja os pagamentos' },
  },
  {
    id: 're-7',
    targetSelector: '#nav-autorizacoes',
    titulo: '✅ Autorizações',
    descricao: 'Campeonatos, eventos, viagens. Autorize pelo app. Controle total.',
    acao: { tipo: 'observe', label: 'Você decide' },
  },
  {
    id: 're-8',
    targetSelector: '#nav-relatorios',
    titulo: '📄 Relatório Mensal',
    descricao: 'Todo mês, um resumo da evolução de cada filho. Compartilhe no WhatsApp.',
    acao: { tipo: 'observe', label: 'Acompanhe a evolução' },
  },
];

// ── TUTORIAL 8: RECEPCIONISTA ───────────────────────────────────────────

const TUTORIAL_RECEPCAO: TutorialStep[] = [
  {
    id: 'rc-1',
    targetSelector: '#recepcao-dashboard',
    titulo: '🛎️ Sua Central de Operação!',
    descricao: 'Tudo que acontece na academia hoje: aulas, check-ins, pendências, experimentais.',
    acao: { tipo: 'observe', label: 'Seu painel do dia' },
  },
  {
    id: 'rc-2',
    targetSelector: '#dashboard-agenda-dia',
    titulo: '📅 Agenda do Dia',
    descricao: 'Todas as aulas de hoje em ordem. Quem está dando aula, quantos alunos esperados.',
    acao: { tipo: 'observe', label: 'O que rola hoje' },
  },
  {
    id: 'rc-3',
    targetSelector: '#dashboard-pendencias',
    titulo: '⚠️ Pendências',
    descricao: 'Pagamentos atrasados, experimentais chegando, contratos pra assinar. Ação rápida.',
    acao: { tipo: 'observe', label: 'Resolva agora' },
  },
  {
    id: 'rc-4',
    targetSelector: '#sidebar-link-atendimento',
    titulo: '🔍 Busca de Aluno',
    descricao: 'Aluno chegou no balcão? Busque por nome, telefone ou CPF. Ações rápidas em 1 clique.',
    acao: { tipo: 'observe', label: 'Busque um aluno' },
  },
  {
    id: 'rc-5',
    targetSelector: '#sidebar-link-cadastro',
    titulo: '📝 Cadastro Rápido',
    descricao: 'Walk-in na porta? Cadastre em 2 minutos. Matrícula, experimental ou lead.',
    acao: { tipo: 'observe', label: 'Cadastre alguém' },
  },
  {
    id: 'rc-6',
    targetSelector: '#sidebar-link-caixa',
    titulo: '💰 Caixa do Dia',
    descricao: 'Tudo que entrou hoje. PIX, cartão, dinheiro. Feche o caixa no final do dia.',
    acao: { tipo: 'observe', label: 'Controle financeiro' },
  },
  {
    id: 'rc-7',
    targetSelector: '#sidebar-link-experimentais',
    titulo: '🧪 Aulas Experimentais',
    descricao: 'Agendamentos do dia. Confirmou? Chegou? Matriculou? Acompanhe o funil.',
    acao: { tipo: 'observe', label: 'Converta leads' },
  },
  {
    id: 'rc-8',
    targetSelector: '#sidebar-link-mensagens',
    titulo: '📱 Mensagens Rápidas',
    descricao: 'Templates de WhatsApp prontos. Cobrança, confirmação, lembrete. 1 clique.',
    acao: { tipo: 'observe', label: 'Comunicação rápida' },
  },
];

// ── TUTORIAL 9: FRANQUEADOR ─────────────────────────────────────────────

const TUTORIAL_FRANQUEADOR: TutorialStep[] = [
  {
    id: 'fr-1',
    targetSelector: '#franqueador-dashboard',
    titulo: '🌐 Comando da Rede',
    descricao: 'Visão consolidada de todas as unidades. KPIs, ranking, alertas, crescimento.',
    acao: { tipo: 'observe', label: 'Sua rede inteira' },
  },
  {
    id: 'fr-2',
    targetSelector: '#sidebar-link-unidades',
    titulo: '🏢 Unidades',
    descricao: 'Cada unidade da rede com dados detalhados. Compliance, financeiro, evolução.',
    acao: { tipo: 'observe', label: 'Veja suas unidades' },
  },
  {
    id: 'fr-3',
    targetSelector: '#sidebar-link-royalties',
    titulo: '💰 Royalties',
    descricao: 'Cobranças mensais. Quem pagou, quem está atrasado. Gere cobranças com 1 clique.',
    acao: { tipo: 'observe', label: 'Controle financeiro' },
  },
  {
    id: 'fr-4',
    targetSelector: '#sidebar-link-padroes',
    titulo: '📋 Padrões e Compliance',
    descricao: '40 itens de padronização. Visual, operacional, pedagógico. Quem está conforme?',
    acao: { tipo: 'observe', label: 'Qualidade da rede' },
  },
  {
    id: 'fr-5',
    targetSelector: '#sidebar-link-expansao',
    titulo: '🚀 Expansão',
    descricao: 'Pipeline de novas franquias. De lead até inauguração.',
    acao: { tipo: 'observe', label: 'Cresça a rede' },
  },
  {
    id: 'fr-6',
    targetSelector: '#sidebar-link-comunicacao',
    titulo: '📢 Comunicação',
    descricao: 'Envie comunicados para toda a rede. Novos padrões, materiais, treinamentos.',
    acao: { tipo: 'observe', label: 'Fale com a rede' },
  },
  {
    id: 'fr-7',
    targetSelector: '#sidebar-link-curriculo',
    titulo: '📚 Currículo',
    descricao: 'Currículo padronizado da rede. Todas as unidades ensinam o mesmo.',
    acao: { tipo: 'observe', label: 'Padronize o ensino' },
  },
];

// ── ALL TUTORIALS ───────────────────────────────────────────────────────

export const ALL_TUTORIALS: TutorialDefinition[] = [
  {
    id: 'tutorial-superadmin',
    perfil: 'superadmin',
    nome: 'Conheça o Comando da Plataforma',
    descricao: 'Descubra como gerenciar todas as academias, receita, features e mais.',
    emoji: '🏢',
    steps: TUTORIAL_SUPERADMIN,
    estimativaMinutos: 3,
    obrigatorio: false,
    completionItems: [
      'Navegar pelo Mission Control',
      'Conhecer o Pipeline Comercial',
      'Explorar centro de Receita',
      'Entender Feature Flags',
    ],
  },
  {
    id: 'tutorial-admin',
    perfil: 'admin',
    nome: 'Conheça seu Painel de Gestão',
    descricao: 'Aprenda a gerenciar sua academia: turmas, alunos, financeiro e mais.',
    emoji: '🥋',
    steps: TUTORIAL_ADMIN,
    estimativaMinutos: 3,
    obrigatorio: false,
    completionItems: [
      'Ver seus KPIs',
      'Gerenciar turmas',
      'Acompanhar alunos',
      'Controlar financeiro',
    ],
  },
  {
    id: 'tutorial-professor',
    perfil: 'professor',
    nome: 'Seu Painel de Ensino',
    descricao: 'Conheça as ferramentas para gerenciar aulas, alunos e avaliações.',
    emoji: '🥋',
    steps: TUTORIAL_PROFESSOR,
    estimativaMinutos: 3,
    obrigatorio: false,
    completionItems: [
      'Conhecer o Modo Aula',
      'Avaliar alunos',
      'Usar o Diário de Aulas',
      'Planejar suas aulas',
    ],
  },
  {
    id: 'tutorial-aluno-adulto',
    perfil: 'aluno_adulto',
    nome: 'Sua Jornada no Tatame',
    descricao: 'Descubra como acompanhar seus treinos, evolução e conquistas.',
    emoji: '🥋',
    steps: TUTORIAL_ALUNO_ADULTO,
    estimativaMinutos: 2,
    obrigatorio: false,
    completionItems: [
      'Ver sua próxima aula',
      'Acompanhar progresso de faixa',
      'Fazer check-in',
      'Ver conquistas',
    ],
  },
  {
    id: 'tutorial-teen',
    perfil: 'aluno_teen',
    nome: 'Bem-vindo à Arena!',
    descricao: 'Bora descobrir como ganhar XP, subir de level e dominar o ranking!',
    emoji: '⚡',
    steps: TUTORIAL_TEEN,
    estimativaMinutos: 2,
    obrigatorio: false,
    completionItems: [
      'Entender a barra de XP',
      'Ver o ranking',
      'Conhecer os desafios',
      'Explorar o Season Pass',
    ],
  },
  {
    id: 'tutorial-kids',
    perfil: 'aluno_kids',
    nome: 'Aventura no Tatame!',
    descricao: 'Vamos brincar!',
    emoji: '🦁',
    steps: TUTORIAL_KIDS,
    estimativaMinutos: 1,
    obrigatorio: false,
    completionItems: [
      'Conhecer o mascote',
      'Ganhar estrelas',
      'Ver o álbum',
    ],
  },
  {
    id: 'tutorial-responsavel',
    perfil: 'responsavel',
    nome: 'Acompanhe seus Filhos',
    descricao: 'Veja como acompanhar a evolução dos seus filhos na academia.',
    emoji: '👨‍👩‍👧',
    steps: TUTORIAL_RESPONSAVEL,
    estimativaMinutos: 2,
    obrigatorio: false,
    completionItems: [
      'Ver resumo dos filhos',
      'Acompanhar presença',
      'Conversar com professor',
      'Ver pagamentos',
    ],
  },
  {
    id: 'tutorial-recepcao',
    perfil: 'recepcao',
    nome: 'Sua Central de Atendimento',
    descricao: 'Conheça as ferramentas para o dia a dia na recepção.',
    emoji: '🛎️',
    steps: TUTORIAL_RECEPCAO,
    estimativaMinutos: 2,
    obrigatorio: false,
    completionItems: [
      'Usar o painel do dia',
      'Buscar alunos',
      'Fazer cadastros',
      'Controlar o caixa',
    ],
  },
  {
    id: 'tutorial-franqueador',
    perfil: 'franqueador',
    nome: 'Comando da Rede',
    descricao: 'Descubra como gerenciar todas as unidades da sua rede.',
    emoji: '🌐',
    steps: TUTORIAL_FRANQUEADOR,
    estimativaMinutos: 2,
    obrigatorio: false,
    completionItems: [
      'Ver visão consolidada',
      'Gerenciar unidades',
      'Acompanhar royalties',
      'Planejar expansão',
    ],
  },
];

export function getTutorialById(id: string): TutorialDefinition | undefined {
  return ALL_TUTORIALS.find((t) => t.id === id);
}

export function getTutorialByRole(role: string): TutorialDefinition | undefined {
  const tutorialId = ROLE_TUTORIAL_MAP[role];
  if (!tutorialId) return undefined;
  return getTutorialById(tutorialId);
}
