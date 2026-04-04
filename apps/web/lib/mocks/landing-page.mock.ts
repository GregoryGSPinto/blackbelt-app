import type { LandingPageData, LeadFormData, LeadResult } from '@/lib/api/landing-page.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const MOCK_LANDING: LandingPageData = {
  nome: 'Guerreiros do Tatame',
  slug: 'guerreiros-tatame',
  logo: '/images/demo-logo.png',
  descricao: 'A melhor academia de artes marciais de Belo Horizonte. Desde 2018, formando campeões no tatame e na vida. Aulas para todas as idades.',
  endereco: 'Rua dos Campeões, 456 — Savassi',
  cidade: 'Belo Horizonte — MG',
  telefone: '(31) 3333-4444',
  whatsapp: '5531999998888',
  email: 'contato@guerreirosdotatame.com.br',
  instagram: '@guerreirosdotatame',
  facebook: 'guerreirosdotatame',
  youtube: 'guerreirosdotatame',
  fotos: [
    { url: '/images/demo/academia-1.jpg', legenda: 'Nosso tatame principal' },
    { url: '/images/demo/academia-2.jpg', legenda: 'Área de musculação' },
    { url: '/images/demo/academia-3.jpg', legenda: 'Espaço kids' },
  ],
  modalidades: [
    {
      nome: 'Jiu-Jitsu Brasileiro',
      icone: '🥋',
      descricao: 'Arte marcial focada em técnicas de solo, alavancas e finalizações. Para todos os níveis.',
      professores: [
        { nome: 'André Nakamura', faixa: 'Preta 3° grau' },
        { nome: 'Roberto Lima', faixa: 'Preta 1° grau' },
      ],
    },
    {
      nome: 'Muay Thai',
      icone: '🥊',
      descricao: 'A arte dos oito membros. Treinamento completo de strikes com técnica tailandesa.',
      professores: [
        { nome: 'Carlos Eduardo', faixa: 'Kru' },
      ],
    },
    {
      nome: 'Judô',
      icone: '🥋',
      descricao: 'Arte marcial olímpica focada em projeções e técnicas de imobilização.',
      professores: [
        { nome: 'Tatiana Oliveira', faixa: 'Preta 2° dan' },
      ],
    },
    {
      nome: 'Wrestling',
      icone: '🤼',
      descricao: 'Luta olímpica com foco em takedowns e controle. Complemento perfeito para BJJ.',
      professores: [
        { nome: 'André Nakamura', faixa: 'Preta 3° grau' },
      ],
    },
    {
      nome: 'Kids (4-12 anos)',
      icone: '👶',
      descricao: 'Programa especial para crianças com foco em disciplina, coordenação e diversão.',
      professores: [
        { nome: 'Roberto Lima', faixa: 'Preta 1° grau' },
        { nome: 'Tatiana Oliveira', faixa: 'Preta 2° dan' },
      ],
    },
  ],
  grade: [
    { turma: 'BJJ Iniciante', modalidade: 'Jiu-Jitsu', diaSemana: 'Seg/Qua/Sex', horario: '07:00 - 08:00', professor: 'André Nakamura', vagasDisponiveis: 5 },
    { turma: 'BJJ Avançado', modalidade: 'Jiu-Jitsu', diaSemana: 'Seg/Qua/Sex', horario: '19:00 - 20:30', professor: 'André Nakamura', vagasDisponiveis: 3 },
    { turma: 'BJJ Feminino', modalidade: 'Jiu-Jitsu', diaSemana: 'Ter/Qui', horario: '10:00 - 11:00', professor: 'Roberto Lima', vagasDisponiveis: 8 },
    { turma: 'Muay Thai', modalidade: 'Muay Thai', diaSemana: 'Ter/Qui/Sab', horario: '18:00 - 19:00', professor: 'Carlos Eduardo', vagasDisponiveis: 6 },
    { turma: 'Judô Adulto', modalidade: 'Judô', diaSemana: 'Ter/Qui', horario: '20:00 - 21:00', professor: 'Tatiana Oliveira', vagasDisponiveis: 10 },
    { turma: 'Wrestling', modalidade: 'Wrestling', diaSemana: 'Sab', horario: '10:00 - 11:30', professor: 'André Nakamura', vagasDisponiveis: 12 },
    { turma: 'Kids BJJ', modalidade: 'Kids', diaSemana: 'Seg/Qua/Sex', horario: '16:00 - 17:00', professor: 'Roberto Lima', vagasDisponiveis: 4 },
    { turma: 'Kids Judô', modalidade: 'Kids', diaSemana: 'Ter/Qui', horario: '16:00 - 17:00', professor: 'Tatiana Oliveira', vagasDisponiveis: 7 },
  ],
  planos: [
    { nome: 'Básico', preco: 149, periodo: 'mês', beneficios: ['1 modalidade', '3x por semana', 'App BlackBelt'], destaque: false },
    { nome: 'Completo', preco: 199, periodo: 'mês', beneficios: ['2 modalidades', 'Acesso ilimitado', 'App BlackBelt', 'Open Mat sábado'], destaque: true },
    { nome: 'Premium', preco: 279, periodo: 'mês', beneficios: ['Todas as modalidades', 'Acesso ilimitado', 'App BlackBelt', 'Vídeo-aulas', 'Personal 1x/mês', 'Kimono incluso'], destaque: false },
    { nome: 'Família', preco: 399, periodo: 'mês', beneficios: ['2 membros da família', 'Todas as modalidades', 'App BlackBelt', 'Open Mat sábado'], destaque: false },
  ],
  depoimentos: [
    { nome: 'João Mendes', faixa: 'Azul', texto: 'Comecei há 2 anos sem saber nada. Hoje sou faixa azul e o jiu-jitsu mudou minha vida. Os professores são incríveis!', nota: 5 },
    { nome: 'Maria Santos', faixa: 'Branca 4 graus', texto: 'Ambiente acolhedor, especialmente para mulheres. Me sinto segura e motivada em cada treino.', nota: 5 },
    { nome: 'Carlos Pereira', faixa: 'Roxa', texto: 'Treino aqui há 5 anos. A técnica do professor André é de altíssimo nível. Melhor academia de BH.', nota: 5 },
    { nome: 'Ana Souza', faixa: 'Azul', texto: 'Meus dois filhos treinam no programa Kids e adoram. A disciplina e o respeito que aprenderam são notáveis.', nota: 5 },
    { nome: 'Thiago Rocha', faixa: 'Branca 2 graus', texto: 'Vim pela aula experimental e nunca mais saí. A energia do grupo é contagiante!', nota: 4 },
  ],
  stats: {
    alunosAtivos: 86,
    anosExistencia: 8,
    modalidades: 5,
    notaGoogle: 4.8,
  },
  visual: {
    corPrimaria: '#C62828',
    corSecundaria: '#1A1A2E',
    tema: 'escuro',
    heroBanner: '/images/demo/hero-banner.jpg',
  },
  experimentalAtiva: true,
  turmasExperimental: ['BJJ Iniciante', 'Muay Thai', 'Judô Adulto', 'Kids BJJ'],
};

export async function mockGetLandingPage(slug: string): Promise<LandingPageData | null> {
  await delay();
  if (slug === 'guerreiros-tatame') return MOCK_LANDING;
  return null;
}

export async function mockGetLandingPageByAcademy(_academyId: string): Promise<LandingPageData | null> {
  await delay();
  return MOCK_LANDING;
}

export async function mockUpdateLandingPage(_academyId: string, _data: Partial<LandingPageData>): Promise<void> {
  await delay();
}

export async function mockAgendarExperimental(_slug: string, _lead: LeadFormData): Promise<LeadResult> {
  await delay();
  return { success: true, mensagem: 'Aula experimental agendada com sucesso! Entraremos em contato pelo WhatsApp para confirmar.' };
}
