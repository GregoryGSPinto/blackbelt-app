import type { ProductAnalytics } from '@/lib/api/superadmin-analytics.service';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const DATA: ProductAnalytics = {
  featureRanking: [
    { feature: 'Dashboard', slug: 'dashboard', sessoesMes: 950, usuariosUnicos: 58, tempoMedioMinutos: 8, tendencia: 12 },
    { feature: 'Turmas', slug: 'turmas', sessoesMes: 820, usuariosUnicos: 56, tempoMedioMinutos: 15, tendencia: 5 },
    { feature: 'Financeiro', slug: 'financeiro', sessoesMes: 680, usuariosUnicos: 52, tempoMedioMinutos: 12, tendencia: 8 },
    { feature: 'Check-in QR', slug: 'checkin_qr', sessoesMes: 540, usuariosUnicos: 48, tempoMedioMinutos: 3, tendencia: 15 },
    { feature: 'Loja', slug: 'loja', sessoesMes: 280, usuariosUnicos: 20, tempoMedioMinutos: 10, tendencia: 22 },
    { feature: 'Streaming', slug: 'streaming', sessoesMes: 195, usuariosUnicos: 14, tempoMedioMinutos: 25, tendencia: 45 },
    { feature: 'Eventos', slug: 'eventos', sessoesMes: 165, usuariosUnicos: 13, tempoMedioMinutos: 18, tendencia: -5 },
    { feature: 'Gamificação', slug: 'gamificacao', sessoesMes: 120, usuariosUnicos: 12, tempoMedioMinutos: 7, tendencia: 30 },
    { feature: 'Contratos', slug: 'contratos', sessoesMes: 85, usuariosUnicos: 6, tempoMedioMinutos: 20, tendencia: 60 },
    { feature: 'Periodização', slug: 'periodizacao', sessoesMes: 65, usuariosUnicos: 5, tempoMedioMinutos: 22, tendencia: 18 },
    { feature: 'IA Análise', slug: 'ia_analise', sessoesMes: 52, usuariosUnicos: 4, tempoMedioMinutos: 30, tendencia: 35 },
    { feature: 'NPS', slug: 'nps', sessoesMes: 45, usuariosUnicos: 3, tempoMedioMinutos: 5, tendencia: -20 },
  ],
  engajamento: {
    dau: 35,
    wau: 52,
    mau: 58,
    dauMauRatio: 0.60,
    sessoesMediaDia: 85,
    tempoMedioSessao: 12,
  },
  nuncaUsaram: [
    { feature: 'Gamificação', slug: 'gamificacao', academias: [
      { id: 'ac-s1', nome: 'Guerreiros BJJ', plano: 'Pro', temAcesso: true },
      { id: 'ac-s3', nome: 'Sparta Gym', plano: 'Pro', temAcesso: true },
      { id: 'ac-s5', nome: 'Águia Real MMA', plano: 'Pro', temAcesso: true },
      { id: 'ac-s7', nome: 'Combat Zone', plano: 'Pro', temAcesso: true },
      { id: 'ac-s9', nome: 'Strike Force', plano: 'Pro', temAcesso: true },
      { id: 'ac-s11', nome: 'Nova Geração', plano: 'Pro', temAcesso: true },
      { id: 'ac-s13', nome: 'Champions BJJ', plano: 'Pro', temAcesso: true },
      { id: 'ac-s15', nome: 'Vitória Fight', plano: 'Pro', temAcesso: true },
      { id: 'ac-s17', nome: 'Gladiadores', plano: 'Pro', temAcesso: true },
      { id: 'ac-s19', nome: 'Faixa Preta', plano: 'Pro', temAcesso: true },
      { id: 'ac-r5', nome: 'Muay Thai Center', plano: 'Pro', temAcesso: true },
      { id: 'ac-r7', nome: 'Ringue Central', plano: 'Pro', temAcesso: true },
    ] },
    { feature: 'Contratos', slug: 'contratos', academias: [
      { id: 'ac-e3', nome: 'BlackBelt HQ', plano: 'Black Belt', temAcesso: true },
      { id: 'ac-e4', nome: 'Coliseu Fight', plano: 'Black Belt', temAcesso: true },
      { id: 'ac-e5', nome: 'Guerreiro Nômade', plano: 'Black Belt', temAcesso: true },
      { id: 'ac-e8', nome: 'Gracie Barra', plano: 'Pro', temAcesso: false },
      { id: 'ac-e9', nome: 'Força Bruta', plano: 'Pro', temAcesso: false },
      { id: 'ac-e10', nome: 'Tiger Muay Thai', plano: 'Pro', temAcesso: false },
      { id: 'ac-e11', nome: 'Top Team BR', plano: 'Enterprise', temAcesso: true },
      { id: 'ac-e12', nome: 'Alliance BJJ', plano: 'Enterprise', temAcesso: true },
    ] },
    { feature: 'Streaming', slug: 'streaming', academias: [
      { id: 'ac-s2', nome: 'Iron Fist Academy', plano: 'Pro', temAcesso: true },
      { id: 'ac-s4', nome: 'Tropa de Elite', plano: 'Pro', temAcesso: true },
      { id: 'ac-s6', nome: 'Phoenix Fighters', plano: 'Pro', temAcesso: true },
      { id: 'ac-s8', nome: 'Tatami Club', plano: 'Pro', temAcesso: true },
      { id: 'ac-s10', nome: 'Leão Dourado', plano: 'Pro', temAcesso: true },
      { id: 'ac-s12', nome: 'Ronin Dojo', plano: 'Pro', temAcesso: true },
    ] },
  ],
  horariosPico: [
    { hora: 0, sessoes: 2 }, { hora: 1, sessoes: 1 }, { hora: 2, sessoes: 0 }, { hora: 3, sessoes: 0 },
    { hora: 4, sessoes: 1 }, { hora: 5, sessoes: 3 }, { hora: 6, sessoes: 12 }, { hora: 7, sessoes: 45 },
    { hora: 8, sessoes: 62 }, { hora: 9, sessoes: 48 }, { hora: 10, sessoes: 35 }, { hora: 11, sessoes: 28 },
    { hora: 12, sessoes: 15 }, { hora: 13, sessoes: 18 }, { hora: 14, sessoes: 22 }, { hora: 15, sessoes: 25 },
    { hora: 16, sessoes: 32 }, { hora: 17, sessoes: 55 }, { hora: 18, sessoes: 68 }, { hora: 19, sessoes: 52 },
    { hora: 20, sessoes: 38 }, { hora: 21, sessoes: 22 }, { hora: 22, sessoes: 10 }, { hora: 23, sessoes: 5 },
  ],
  dispositivos: [
    { tipo: 'mobile', percentual: 72 },
    { tipo: 'desktop', percentual: 25 },
    { tipo: 'tablet', percentual: 3 },
  ],
};

export async function mockGetProductAnalytics(): Promise<ProductAnalytics> {
  await delay(500);
  return JSON.parse(JSON.stringify(DATA));
}
