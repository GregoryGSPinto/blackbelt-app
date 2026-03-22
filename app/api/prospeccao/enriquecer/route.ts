// BlackBelt v2 — Prospect Enrichment API Route
// POST /api/prospeccao/enriquecer
// Re-fetches Google Places details and runs fresh Claude analysis for a single prospect.

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/api/v1/auth-guard';
import { getAdminClient } from '@/lib/supabase/admin';
import { getPlaceDetails } from '@/lib/integrations/google-places';
import { analisarAcademiaIndividual } from '@/lib/integrations/claude-analysis';
import type { AcademiaParaAnalise } from '@/lib/integrations/claude-analysis';
import type { AcademiaProspectada } from '@/lib/api/prospeccao.service';

// --- Types ---

interface EnriquecerBody {
  prospectId: string;
}

interface ProspectRow {
  id: string;
  nome: string;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  bairro: string | null;
  telefone: string | null;
  site: string | null;
  google_maps_url: string | null;
  google_place_id: string | null;
  latitude: number | null;
  longitude: number | null;
  nota_google: number | null;
  total_avaliacoes: number | null;
  instagram: string | null;
  instagram_seguidores: number | null;
  facebook: string | null;
  modalidades: string[] | null;
  alunos_estimados: number | null;
  faturamento_estimado: number | null;
  tamanho: string | null;
  score_total: number | null;
  score_breakdown: Record<string, number> | null;
  classificacao: string | null;
  sinais_dor: string[] | null;
  sinais_oportunidade: string[] | null;
  sistema_detectado: string | null;
  analise: Record<string, unknown> | null;
  abordagem: Record<string, unknown> | null;
  status: string | null;
  ultimo_contato: string | null;
  proximo_contato: string | null;
  canal_contato: string | null;
  observacoes: string | null;
  responsavel: string | null;
  motivo_perda: string | null;
  academy_id: string | null;
  fonte: string | null;
  buscado_em: string;
  atualizado_em: string;
  created_at: string;
}

// --- Helpers ---

function rowToAcademiaProspectada(row: ProspectRow): AcademiaProspectada {
  const abordagem = (row.abordagem ?? {}) as Record<string, string>;
  const analise = (row.analise ?? {}) as Record<string, unknown>;
  const scoreBreakdown = (row.score_breakdown ?? {}) as Record<string, number>;

  return {
    id: row.id,
    nome: row.nome,
    endereco: row.endereco ?? '',
    bairro: row.bairro ?? '',
    cidade: row.cidade ?? '',
    estado: row.estado ?? '',
    telefone: row.telefone ?? '',
    website: row.site ?? undefined,
    instagram: row.instagram ?? undefined,
    googleMapsUrl: row.google_maps_url ?? undefined,
    notaGoogle: row.nota_google ?? 0,
    totalAvaliacoes: row.total_avaliacoes ?? 0,
    modalidades: row.modalidades ?? [],
    horarioFuncionamento: '',
    fotos: [],
    score: {
      geral: row.score_total ?? 0,
      infraestrutura: scoreBreakdown.tamanho ?? 0,
      presencaDigital: scoreBreakdown.acessibilidade ?? 0,
      reputacao: scoreBreakdown.capacidadePagamento ?? 0,
      potencialConversao: scoreBreakdown.dorVisivel ?? 0,
    },
    estimativas: {
      alunosEstimados: row.alunos_estimados ?? 0,
      faturamentoEstimado: row.faturamento_estimado ?? 0,
      ticketMedio:
        row.alunos_estimados && row.faturamento_estimado
          ? Math.round(row.faturamento_estimado / row.alunos_estimados)
          : 0,
      marketShare: 0,
    },
    reviews: [],
    analise: {
      pontosFortes: row.sinais_oportunidade ?? [],
      pontosFracos: Array.isArray(analise.pontosFracos) ? (analise.pontosFracos as string[]) : [],
      oportunidades: row.sinais_oportunidade ?? [],
      ameacas: row.sinais_dor ?? [],
    },
    abordagem: {
      canal: abordagem.canalRecomendado ?? 'WhatsApp',
      mensagemSugerida: abordagem.mensagemWhatsApp ?? '',
      melhorHorario: abordagem.melhorHorario ?? '',
      argumentos: [abordagem.gancho, abordagem.dicaAbordagem].filter(Boolean),
      objecoesPrevistas: [],
    },
    crm: {
      status: row.status ?? 'novo',
      ultimoContato: row.ultimo_contato ?? undefined,
      proximoContato: row.proximo_contato ?? undefined,
      historicoContatos: [],
      observacoes: row.observacoes ? [row.observacoes] : [],
      responsavel: row.responsavel ?? undefined,
      motivoPerda: row.motivo_perda ?? undefined,
    },
    classificacao: (row.classificacao as 'quente' | 'morno' | 'frio') ?? 'frio',
    criadoEm: row.created_at,
    atualizadoEm: row.atualizado_em,
  };
}

// --- Route Handler ---

export async function POST(request: NextRequest) {
  try {
    const result = await authenticateRequest(request);
    if ('error' in result) return result.error;

    const body = (await request.json()) as EnriquecerBody;

    if (!body.prospectId || typeof body.prospectId !== 'string') {
      return NextResponse.json(
        { error: 'Campo "prospectId" é obrigatório' },
        { status: 400 },
      );
    }

    const supabase = getAdminClient();

    // --- Step 1: Fetch prospect from Supabase ---
    const { data: prospect, error: fetchError } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', body.prospectId)
      .single();

    if (fetchError || !prospect) {
      return NextResponse.json(
        { error: `Prospect ${body.prospectId} não encontrado` },
        { status: 404 },
      );
    }

    const row = prospect as ProspectRow;
    const googlePlaceId = row.google_place_id;

    if (!googlePlaceId) {
      return NextResponse.json(
        { error: 'Prospect não possui google_place_id para enriquecimento' },
        { status: 400 },
      );
    }

    // --- Step 2: Re-fetch Google Places details ---
    let details;
    try {
      details = await getPlaceDetails(googlePlaceId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar detalhes no Google Places';
      return NextResponse.json({ error: message }, { status: 502 });
    }

    // --- Step 3: Run Claude analysis ---
    let analysis;
    try {
      const academiaInput: AcademiaParaAnalise = {
        nome: details.nome,
        endereco: details.endereco,
        bairro: details.bairro,
        cidade: details.cidade,
        nota: details.nota,
        totalAvaliacoes: details.totalAvaliacoes,
        telefone: details.telefone,
        site: details.site,
        reviews: details.reviews.map((r) => ({
          autor: r.autor,
          nota: r.nota,
          texto: r.texto,
        })),
        horarios: details.horarios,
        tipos: details.tipos,
      };

      analysis = await analisarAcademiaIndividual(academiaInput);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro na análise IA';
      return NextResponse.json({ error: message }, { status: 502 });
    }

    // --- Step 4: Update prospect in Supabase ---
    const updatedData = {
      nome: details.nome,
      endereco: details.endereco,
      cidade: details.cidade,
      estado: details.estado,
      bairro: details.bairro,
      telefone: details.telefone ?? null,
      site: details.site ?? null,
      google_maps_url: details.googleMapsUrl,
      latitude: details.latitude,
      longitude: details.longitude,
      nota_google: details.nota,
      total_avaliacoes: details.totalAvaliacoes,
      modalidades: analysis.modalidades,
      alunos_estimados: analysis.estimativaAlunos,
      faturamento_estimado: analysis.estimativaFaturamento,
      tamanho: analysis.tamanho,
      score_total: analysis.score,
      score_breakdown: analysis.scoreBreakdown,
      classificacao: analysis.classificacao,
      sinais_dor: analysis.sinaisDor,
      sinais_oportunidade: analysis.sinaisOportunidade,
      sistema_detectado: analysis.sistemaDetectado,
      analise: {
        pontosFracos: analysis.pontosFracos,
        motivoClassificacao: analysis.motivoClassificacao,
      },
      abordagem: analysis.abordagem,
      buscado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };

    const { data: updated, error: updateError } = await supabase
      .from('prospects')
      .update(updatedData)
      .eq('id', body.prospectId)
      .select('*')
      .single();

    if (updateError || !updated) {
      // Return enriched data even if Supabase update fails
      console.warn('[prospeccao/enriquecer] Failed to update Supabase:', updateError?.message);
      const mergedRow: ProspectRow = { ...row, ...updatedData } as ProspectRow;
      return NextResponse.json(rowToAcademiaProspectada(mergedRow));
    }

    return NextResponse.json(rowToAcademiaProspectada(updated as ProspectRow));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno no servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
