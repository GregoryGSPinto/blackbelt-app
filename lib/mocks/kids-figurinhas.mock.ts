import type { AlbumFigurinhas, Figurinha } from '@/lib/api/kids-figurinhas.service';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

function fig(
  id: string,
  nome: string,
  emoji: string,
  tema: Figurinha['tema'],
  raridade: Figurinha['raridade'],
  descricao: string,
  comoConseguir: string,
  coletada: boolean,
  brilho: boolean,
  coletadaEm?: string,
): Figurinha {
  return { id, nome, emoji, tema, raridade, descricao, comoConseguir, coletada, coletadaEm, brilho };
}

const animaisMarciais: Figurinha[] = [
  fig('fig-am-1', 'Le\u00e3o', '\u{1F981}', 'animais_marciais', 'comum', 'O le\u00e3o corajoso do tatame', 'Participe de 5 aulas', true, true, '2026-03-16'),
  fig('fig-am-2', 'Drag\u00e3o', '\u{1F409}', 'animais_marciais', 'rara', 'O drag\u00e3o guardião das artes marciais', 'Complete 3 desafios', true, false, '2026-03-05'),
  fig('fig-am-3', '\u00c1guia', '\u{1F985}', 'animais_marciais', 'comum', 'A \u00e1guia veloz dos golpes r\u00e1pidos', 'Fa\u00e7a 10 check-ins', true, false, '2026-03-02'),
  fig('fig-am-4', 'Urso', '\u{1F43B}', 'animais_marciais', 'rara', 'O urso forte da defesa', 'Pratique 3 t\u00e9cnicas de defesa', true, true, '2026-03-15'),
  fig('fig-am-5', 'Pantera', '\u{1F408}\u200D\u2B1B', 'animais_marciais', 'super_rara', 'A pantera \u00e1gil e silenciosa', 'Ganhe 50 estrelas em uma semana', false, false),
  fig('fig-am-6', 'Tubar\u00e3o', '\u{1F988}', 'animais_marciais', 'lendaria', 'O tubar\u00e3o impar\u00e1vel do ground', 'Vença 3 desafios seguidos', false, false),
];

const golpesEspeciais: Figurinha[] = [
  fig('fig-ge-1', 'Rolamento', '\u{1F938}', 'golpes_especiais', 'comum', 'O rolamento perfeito!', 'Execute um rolamento na aula', true, false, '2026-02-28'),
  fig('fig-ge-2', 'Chute', '\u{1F94B}', 'golpes_especiais', 'comum', 'O chute poderoso!', 'Pratique chutes por 3 aulas', true, false, '2026-03-01'),
  fig('fig-ge-3', 'Abra\u00e7o', '\u{1F917}', 'golpes_especiais', 'rara', 'A imobiliza\u00e7\u00e3o amig\u00e1vel', 'Aprenda uma imobiliza\u00e7\u00e3o', true, false, '2026-02-10'),
  fig('fig-ge-4', 'Esquiva', '\u{1F4A8}', 'golpes_especiais', 'rara', 'A esquiva rel\u00e2mpago', 'Participe de 10 aulas de esquiva', true, false, '2026-02-18'),
  fig('fig-ge-5', 'Rel\u00e2mpago', '\u26A1', 'golpes_especiais', 'super_rara', 'O golpe rel\u00e2mpago!', 'Ganhe medalha de velocidade', false, false),
  fig('fig-ge-6', 'Furac\u00e3o', '\u{1F32A}\uFE0F', 'golpes_especiais', 'lendaria', 'O furac\u00e3o do tatame!', 'Complete todas as t\u00e9cnicas de giro', false, false),
];

const faixasColoridas: Figurinha[] = [
  fig('fig-fc-1', 'Branca', '\u{1F90D}', 'faixas_coloridas', 'comum', 'A primeira faixa da jornada', 'Receba sua faixa branca', true, false, '2025-08-10'),
  fig('fig-fc-2', 'Cinza', '\u{1FA76}', 'faixas_coloridas', 'comum', 'A faixa da persist\u00eancia', 'Receba sua faixa cinza', true, false, '2026-01-15'),
  fig('fig-fc-3', 'Amarela', '\u{1F49B}', 'faixas_coloridas', 'rara', 'A faixa do brilho solar', 'Receba sua faixa amarela', false, false),
  fig('fig-fc-4', 'Laranja', '\u{1F9E1}', 'faixas_coloridas', 'rara', 'A faixa da energia', 'Receba sua faixa laranja', false, false),
  fig('fig-fc-5', 'Verde', '\u{1F49A}', 'faixas_coloridas', 'super_rara', 'A faixa da natureza', 'Receba sua faixa verde', false, false),
  fig('fig-fc-6', 'Azul', '\u{1F499}', 'faixas_coloridas', 'lendaria', 'A faixa do c\u00e9u', 'Receba sua faixa azul', false, false),
];

const heroisTatame: Figurinha[] = [
  fig('fig-ht-1', 'Super Rolador', '\u{1F9B8}', 'herois_tatame', 'comum', 'O her\u00f3i dos rolamentos', 'Fa\u00e7a 20 rolamentos', true, false, '2026-02-20'),
  fig('fig-ht-2', 'Guardi\u00e3', '\u{1F6E1}\uFE0F', 'herois_tatame', 'comum', 'A protetora do tatame', 'Ajude 5 colegas na aula', true, false, '2026-03-08'),
  fig('fig-ht-3', 'Mestre', '\u{1F9D9}', 'herois_tatame', 'rara', 'O mestre das t\u00e9cnicas', 'Domine 10 t\u00e9cnicas', true, false, '2026-02-25'),
  fig('fig-ht-4', 'Invenc\u00edvel', '\u{1F4AA}', 'herois_tatame', 'super_rara', 'Nada pode par\u00e1-lo!', 'N\u00e3o perca nenhuma aula por 1 m\u00eas', false, false),
  fig('fig-ht-5', 'Rei', '\u{1F451}', 'herois_tatame', 'super_rara', 'O rei do tatame', 'Fique em 1\u00ba no ranking por 2 semanas', false, false),
  fig('fig-ht-6', 'Lenda', '\u{1F3C6}', 'herois_tatame', 'lendaria', 'A lenda viva das artes marciais', 'Complete todo o \u00e1lbum', false, false),
];

const especiais: Figurinha[] = [
  fig('fig-es-1', 'Aniversariante', '\u{1F382}', 'especial', 'super_rara', 'Parab\u00e9ns! Figurinha de anivers\u00e1rio!', 'Fa\u00e7a anivers\u00e1rio treinando', true, true, '2026-03-15'),
  fig('fig-es-2', 'Natal', '\u{1F384}', 'especial', 'rara', 'Figurinha especial de Natal', 'Treine na semana do Natal', true, false, '2025-12-23'),
  fig('fig-es-3', 'Halloween', '\u{1F383}', 'especial', 'rara', 'Figurinha assustadoramente legal', 'Treine na semana do Halloween', false, false),
  fig('fig-es-4', 'Campeonato', '\u{1F3C5}', 'especial', 'super_rara', 'Participou de um campeonato!', 'Participe de um campeonato', false, false),
  fig('fig-es-5', 'Medalha', '\u{1F947}', 'especial', 'super_rara', 'Ganhou medalha no campeonato!', 'Ganhe uma medalha', false, false),
  fig('fig-es-6', 'Diamante', '\u{1F48E}', 'especial', 'lendaria', 'A figurinha mais rara de todas', 'Colete todas as outras figurinhas especiais', false, false),
];

export async function mockGetAlbum(_studentId: string): Promise<AlbumFigurinhas> {
  await delay();
  return {
    totalFigurinhas: 30,
    coletadas: 15,
    temas: [
      {
        nome: 'Animais Marciais',
        emoji: '\u{1F981}',
        total: 6,
        coletadas: 4,
        figurinhas: animaisMarciais,
      },
      {
        nome: 'Golpes Especiais',
        emoji: '\u{1F94B}',
        total: 6,
        coletadas: 4,
        figurinhas: golpesEspeciais,
      },
      {
        nome: 'Faixas Coloridas',
        emoji: '\u{1F3A8}',
        total: 6,
        coletadas: 2,
        figurinhas: faixasColoridas,
      },
      {
        nome: 'Her\u00f3is do Tatame',
        emoji: '\u{1F9B8}',
        total: 6,
        coletadas: 3,
        figurinhas: heroisTatame,
      },
      {
        nome: 'Especiais',
        emoji: '\u2728',
        total: 6,
        coletadas: 2,
        figurinhas: especiais,
      },
    ],
    proximaFigurinha: {
      nome: 'Pantera',
      emoji: '\u{1F408}\u200D\u2B1B',
      falta: 'Ganhe 50 estrelas em uma semana',
    },
  };
}
