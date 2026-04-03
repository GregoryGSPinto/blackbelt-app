import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// ── Types ──────────────────────────────────────────────────────────

export interface ChampionshipAnalytics {
  totalInscritos: number;
  totalConfirmados: number;
  totalPresentes: number;
  taxaComparecimento: number;
  receitaTotal: number; // centavos
  receitaColetada: number; // centavos
  inscricoesPorDia: { date: string; count: number }[];
  porCategoria: { categoria: string; count: number }[];
  porFaixa: { faixa: string; count: number }[];
  topAcademias: { nome: string; atletas: number }[];
  statusLutas: { pendentes: number; emAndamento: number; finalizadas: number };
  porGenero: { genero: string; count: number }[];
}

// ── Mock data ──────────────────────────────────────────────────────

function getMockAnalytics(_championshipId: string): ChampionshipAnalytics {
  return {
    totalInscritos: 87,
    totalConfirmados: 72,
    totalPresentes: 68,
    taxaComparecimento: 94.4,
    receitaTotal: 1305000,
    receitaColetada: 1188000,
    inscricoesPorDia: [
      { date: '2026-03-01', count: 5 },
      { date: '2026-03-05', count: 12 },
      { date: '2026-03-10', count: 18 },
      { date: '2026-03-15', count: 25 },
      { date: '2026-03-20', count: 15 },
      { date: '2026-03-25', count: 8 },
      { date: '2026-03-28', count: 4 },
    ],
    porCategoria: [
      { categoria: 'Adulto Masculino', count: 34 },
      { categoria: 'Adulto Feminino', count: 18 },
      { categoria: 'Juvenil', count: 22 },
      { categoria: 'Master', count: 13 },
    ],
    porFaixa: [
      { faixa: 'Branca', count: 28 },
      { faixa: 'Azul', count: 22 },
      { faixa: 'Roxa', count: 18 },
      { faixa: 'Marrom', count: 12 },
      { faixa: 'Preta', count: 7 },
    ],
    topAcademias: [
      { nome: 'Guerreiros do Tatame', atletas: 15 },
      { nome: 'Alliance BJJ', atletas: 12 },
      { nome: 'Gracie Barra', atletas: 10 },
      { nome: 'Nova Uniao', atletas: 8 },
      { nome: 'Atos BJJ', atletas: 7 },
    ],
    statusLutas: { pendentes: 12, emAndamento: 0, finalizadas: 45 },
    porGenero: [
      { genero: 'Masculino', count: 56 },
      { genero: 'Feminino', count: 31 },
    ],
  };
}

// ── Service ────────────────────────────────────────────────────────

export async function getChampionshipAnalytics(
  championshipId: string,
): Promise<ChampionshipAnalytics> {
  if (isMock()) {
    return getMockAnalytics(championshipId);
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase.rpc('get_championship_analytics', {
      p_tournament_id: championshipId,
    });

    if (error) throw error;
    return data as ChampionshipAnalytics;
  } catch (err) {
    logServiceError(err, 'championship-analytics');
    return getMockAnalytics(championshipId);
  }
}
