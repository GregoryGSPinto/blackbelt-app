import type { RecompensaKids, HistoricoResgate } from '@/lib/api/kids-recompensas.service';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function mockGetRecompensasKids(_studentId: string): Promise<RecompensaKids[]> {
  await delay();
  return [
    {
      id: 'rk-1',
      nome: 'Figurinha Surpresa',
      descricao: 'Ganhe uma figurinha aleat\u00f3ria para o \u00e1lbum',
      emoji: '\u{1F3B2}',
      custoEstrelas: 30,
      tipo: 'figurinha_especial',
      disponivel: true,
      jaResgatada: true,
      entregue: true,
      estoque: null,
    },
    {
      id: 'rk-2',
      nome: 'T\u00edtulo Ninja',
      descricao: 'Desbloqueie o t\u00edtulo "Ninja" no seu perfil',
      emoji: '\u{1F977}',
      custoEstrelas: 50,
      tipo: 'titulo',
      disponivel: true,
      jaResgatada: true,
      entregue: true,
      estoque: null,
    },
    {
      id: 'rk-3',
      nome: 'Cor Roxa',
      descricao: 'Desbloqueie a cor roxa para seu perfil',
      emoji: '\u{1F7E3}',
      custoEstrelas: 40,
      tipo: 'cor_perfil',
      disponivel: true,
      jaResgatada: false,
      estoque: null,
    },
    {
      id: 'rk-4',
      nome: 'Moldura Estrelas',
      descricao: 'Moldura com estrelas brilhantes para o avatar',
      emoji: '\u2B50',
      custoEstrelas: 60,
      tipo: 'moldura',
      disponivel: true,
      jaResgatada: false,
      estoque: null,
    },
    {
      id: 'rk-5',
      nome: 'Figurinha Rara Garantida',
      descricao: 'Ganhe uma figurinha rara garantida',
      emoji: '\u{1F31F}',
      custoEstrelas: 75,
      tipo: 'figurinha_especial',
      disponivel: true,
      jaResgatada: false,
      estoque: null,
    },
    {
      id: 'rk-6',
      nome: 'T\u00edtulo Drag\u00e3o',
      descricao: 'Desbloqueie o t\u00edtulo lend\u00e1rio "Drag\u00e3o"',
      emoji: '\u{1F409}',
      custoEstrelas: 100,
      tipo: 'titulo',
      disponivel: false,
      jaResgatada: false,
      estoque: null,
    },
    {
      id: 'rk-7',
      nome: 'Adesivo BlackBelt',
      descricao: 'Adesivo f\u00edsico exclusivo para o kimono',
      emoji: '\u{1F3AF}',
      custoEstrelas: 150,
      tipo: 'premio_fisico',
      disponivel: false,
      jaResgatada: false,
      estoque: 20,
    },
    {
      id: 'rk-8',
      nome: 'Figurinha Lend\u00e1ria',
      descricao: 'Ganhe uma figurinha lend\u00e1ria \u00fanica',
      emoji: '\u{1F48E}',
      custoEstrelas: 200,
      tipo: 'figurinha_especial',
      disponivel: false,
      jaResgatada: false,
      estoque: null,
    },
    {
      id: 'rk-9',
      nome: 'Chaveiro Marcial',
      descricao: 'Chaveiro personalizado com seu mascote',
      emoji: '\u{1F511}',
      custoEstrelas: 300,
      tipo: 'premio_fisico',
      disponivel: false,
      jaResgatada: false,
      estoque: 10,
    },
    {
      id: 'rk-10',
      nome: 'Trof\u00e9u de Ouro',
      descricao: 'Mini trof\u00e9u dourado de conquista m\u00e1xima',
      emoji: '\u{1F3C6}',
      custoEstrelas: 500,
      tipo: 'premio_fisico',
      disponivel: false,
      jaResgatada: false,
      estoque: 5,
    },
  ];
}

export async function mockGetHistoricoResgates(_studentId: string): Promise<HistoricoResgate[]> {
  await delay();
  return [
    {
      id: 'hr-1',
      recompensa: 'Figurinha Surpresa',
      emoji: '\u{1F3B2}',
      custoEstrelas: 30,
      data: '2026-02-20',
      tipo: 'figurinha_especial',
      entregue: true,
    },
    {
      id: 'hr-2',
      recompensa: 'T\u00edtulo Ninja',
      emoji: '\u{1F977}',
      custoEstrelas: 50,
      data: '2026-03-05',
      tipo: 'titulo',
      entregue: true,
    },
  ];
}

export async function mockResgatarRecompensa(_studentId: string, _recompensaId: string): Promise<HistoricoResgate> {
  await delay(600);
  return {
    id: 'hr-3',
    recompensa: 'Recompensa Resgatada',
    emoji: '\u{1F381}',
    custoEstrelas: 0,
    data: new Date().toISOString().split('T')[0],
    tipo: 'figurinha_especial',
    entregue: false,
  };
}
