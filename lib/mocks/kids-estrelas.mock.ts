import type { KidsProfile, EstrelaHistorico, RecompensaEstrela } from '@/lib/api/kids-estrelas.service';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function mockGetKidsProfile(_studentId: string): Promise<KidsProfile> {
  await delay();
  return {
    id: 'stu-kids-1',
    nome: 'Helena',
    avatar: '/avatars/helena.png',
    mascote: '\u{1F981}',
    corFavorita: '#facc15',
    faixaAtual: 'Cinza',
    faixaCor: '#9ca3af',
    idadeAnos: 8,
    estrelasTotal: 78,
    estrelasEstaSemana: 12,
    estrelasEsteMes: 34,
    nivel: 5,
    nomeNivel: 'Aventureiro',
    estrelasParaProximoNivel: 3,
    estrelasAtualNoNivel: 12,
    diasSeguidos: 2,
    recordeDiasSeguidos: 5,
    figurinhasColetadas: 15,
    figurinhasTotal: 30,
    tituloAtual: 'Exploradora',
  };
}

export async function mockGetEstrelasHistorico(_studentId: string): Promise<EstrelaHistorico[]> {
  await delay();
  return [
    { data: '2026-03-17', estrelas: 3, motivo: 'Participou da aula de segunda' },
    { data: '2026-03-16', estrelas: 2, motivo: 'Praticou o rolamento completo' },
    { data: '2026-03-14', estrelas: 5, motivo: 'Completou desafio semanal' },
    { data: '2026-03-13', estrelas: 3, motivo: 'Participou da aula de quinta' },
    { data: '2026-03-11', estrelas: 2, motivo: 'Ajudou um colega na aula' },
    { data: '2026-03-10', estrelas: 3, motivo: 'Participou da aula de segunda' },
    { data: '2026-03-07', estrelas: 8, motivo: 'Fez exame de faixa com sucesso' },
    { data: '2026-03-05', estrelas: 8, motivo: 'Conquistou figurinha Aniversariante' },
  ];
}

export async function mockGetRecompensas(_studentId: string): Promise<RecompensaEstrela[]> {
  await delay();
  return [
    {
      id: 'rec-1',
      nome: 'Figurinha Surpresa',
      descricao: 'Ganhe uma figurinha aleat\u00f3ria para o \u00e1lbum',
      icone: '\u{1F3B2}',
      custoEstrelas: 30,
      tipo: 'figurinha_especial',
      disponivel: true,
      jaResgatada: true,
      entregue: true,
    },
    {
      id: 'rec-2',
      nome: 'T\u00edtulo Ninja',
      descricao: 'Desbloqueie o t\u00edtulo especial "Ninja" no seu perfil',
      icone: '\u{1F977}',
      custoEstrelas: 50,
      tipo: 'titulo',
      disponivel: true,
      jaResgatada: true,
      entregue: true,
    },
    {
      id: 'rec-3',
      nome: 'Moldura Dourada',
      descricao: 'Uma moldura dourada brilhante para seu avatar',
      icone: '\u{1F31F}',
      custoEstrelas: 60,
      tipo: 'moldura_avatar',
      disponivel: true,
      jaResgatada: false,
    },
    {
      id: 'rec-4',
      nome: 'Figurinha Rara',
      descricao: 'Ganhe uma figurinha rara garantida',
      icone: '\u2B50',
      custoEstrelas: 75,
      tipo: 'figurinha_especial',
      disponivel: true,
      jaResgatada: false,
    },
    {
      id: 'rec-5',
      nome: 'T\u00edtulo Drag\u00e3o',
      descricao: 'Desbloqueie o t\u00edtulo lend\u00e1rio "Drag\u00e3o"',
      icone: '\u{1F409}',
      custoEstrelas: 100,
      tipo: 'titulo',
      disponivel: false,
      jaResgatada: false,
    },
    {
      id: 'rec-6',
      nome: 'Moldura Arco-\u00edris',
      descricao: 'Moldura multicolorida anim\u00e1vel',
      icone: '\u{1F308}',
      custoEstrelas: 120,
      tipo: 'moldura_avatar',
      disponivel: false,
      jaResgatada: false,
    },
    {
      id: 'rec-7',
      nome: 'Adesivo BlackBelt',
      descricao: 'Adesivo f\u00edsico exclusivo para colar no kimono',
      icone: '\u{1F3AF}',
      custoEstrelas: 150,
      tipo: 'premio_fisico',
      disponivel: false,
      jaResgatada: false,
    },
    {
      id: 'rec-8',
      nome: 'Figurinha Lend\u00e1ria',
      descricao: 'Ganhe uma figurinha lend\u00e1ria \u00fanica',
      icone: '\u{1F48E}',
      custoEstrelas: 200,
      tipo: 'figurinha_especial',
      disponivel: false,
      jaResgatada: false,
    },
    {
      id: 'rec-9',
      nome: 'Chaveiro Marcial',
      descricao: 'Chaveiro personalizado com seu mascote',
      icone: '\u{1F511}',
      custoEstrelas: 300,
      tipo: 'premio_fisico',
      disponivel: false,
      jaResgatada: false,
    },
    {
      id: 'rec-10',
      nome: 'Trof\u00e9u de Ouro',
      descricao: 'Mini trof\u00e9u dourado de conquista m\u00e1xima',
      icone: '\u{1F3C6}',
      custoEstrelas: 500,
      tipo: 'premio_fisico',
      disponivel: false,
      jaResgatada: false,
    },
  ];
}
