// BlackBelt v2 — Prospecting Search API Route
// POST /api/prospeccao/buscar
// Searches Google Places, enriches with Claude AI, caches in Supabase.

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/api/v1/auth-guard';
import { getAdminClient } from '@/lib/supabase/admin';
import { searchPlaces, getPlaceDetails } from '@/lib/integrations/google-places';
import { analisarAcademias } from '@/lib/integrations/claude-analysis';
import type { PlaceDetails } from '@/lib/integrations/google-places';
import type { AcademiaParaAnalise, AnaliseIA } from '@/lib/integrations/claude-analysis';
import type { AcademiaProspectada, ResultadoBuscaReal } from '@/lib/api/prospeccao.service';

// --- Types ---

interface BuscarBody {
  query: string;
  cidade?: string;
  bairro?: string;
  raioKm?: number;
  lat?: number;
  lng?: number;
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

function placeDetailsToAnaliseInput(details: PlaceDetails): AcademiaParaAnalise {
  return {
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
}

function buildUpsertRow(
  details: PlaceDetails,
  analysis: AnaliseIA | null,
): Record<string, unknown> {
  return {
    nome: details.nome,
    endereco: details.endereco,
    cidade: details.cidade,
    estado: details.estado,
    bairro: details.bairro,
    telefone: details.telefone ?? null,
    site: details.site ?? null,
    google_maps_url: details.googleMapsUrl,
    google_place_id: details.placeId,
    latitude: details.latitude,
    longitude: details.longitude,
    nota_google: details.nota,
    total_avaliacoes: details.totalAvaliacoes,
    modalidades: analysis?.modalidades ?? [],
    alunos_estimados: analysis?.estimativaAlunos ?? null,
    faturamento_estimado: analysis?.estimativaFaturamento ?? null,
    tamanho: analysis?.tamanho ?? null,
    score_total: analysis?.score ?? 0,
    score_breakdown: analysis?.scoreBreakdown ?? {},
    classificacao: analysis?.classificacao ?? 'frio',
    sinais_dor: analysis?.sinaisDor ?? [],
    sinais_oportunidade: analysis?.sinaisOportunidade ?? [],
    sistema_detectado: analysis?.sistemaDetectado ?? null,
    analise: analysis
      ? { pontosFracos: analysis.pontosFracos, motivoClassificacao: analysis.motivoClassificacao }
      : {},
    abordagem: analysis?.abordagem ?? {},
    fonte: 'google_places',
    buscado_em: new Date().toISOString(),
  };
}

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

/**
 * Process place details in batches to avoid rate limiting.
 */
async function getDetailsInBatches(
  placeIds: string[],
  batchSize = 5,
): Promise<PlaceDetails[]> {
  const results: PlaceDetails[] = [];

  for (let i = 0; i < placeIds.length; i += batchSize) {
    const batch = placeIds.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map((id) => getPlaceDetails(id)),
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    }
  }

  return results;
}

function formatCacheAge(buscadoEm: string): string {
  const diffMs = Date.now() - new Date(buscadoEm).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays > 0) return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  if (diffHours > 0) return `${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  return 'menos de 1 hora';
}

// --- Route Handler ---

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if ('error' in authResult) return authResult.error;

    const body = (await request.json()) as BuscarBody;

    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json(
        { error: 'Campo "query" é obrigatório' },
        { status: 400 },
      );
    }

    // --- Step 1: Check Supabase cache ---
    let supabaseAvailable = true;
    try {
      const supabase = getAdminClient();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      let cacheQuery = supabase
        .from('prospects')
        .select('*')
        .gte('buscado_em', sevenDaysAgo);

      if (body.cidade) {
        cacheQuery = cacheQuery.ilike('cidade', `%${body.cidade}%`);
      }
      if (body.bairro) {
        cacheQuery = cacheQuery.ilike('bairro', `%${body.bairro}%`);
      }

      const { data: cached, error: cacheError } = await cacheQuery;

      if (!cacheError && cached && cached.length > 0) {
        const rows = cached as ProspectRow[];
        const oldestBuscadoEm = rows.reduce(
          (oldest, current) =>
            new Date(current.buscado_em) < new Date(oldest.buscado_em) ? current : oldest,
        ).buscado_em;

        const result: ResultadoBuscaReal = {
          prospects: rows.map(rowToAcademiaProspectada),
          fromCache: true,
          cacheAge: formatCacheAge(oldestBuscadoEm),
          totalEncontrados: rows.length,
          analisadosPorIA: true,
        };

        return NextResponse.json(result);
      }
    } catch {
      supabaseAvailable = false;
      console.warn('[prospeccao/buscar] Cache check failed, proceeding with fresh search');
    }

    // --- Step 2: Build search query and call Google Places ---
    const searchQuery = `${body.query} ${body.bairro ?? ''} ${body.cidade ?? ''}`.trim();

    let searchResults;
    try {
      searchResults = await searchPlaces({
        query: searchQuery,
        location:
          body.lat !== undefined && body.lng !== undefined
            ? { lat: body.lat, lng: body.lng }
            : undefined,
        radius: body.raioKm ? body.raioKm * 1000 : 10000,
      });
    } catch {
      return NextResponse.json(
        { error: 'Falha ao buscar no Google Places. Verifique a API key.' },
        { status: 502 },
      );
    }

    if (searchResults.length === 0) {
      const emptyResult: ResultadoBuscaReal = {
        prospects: [],
        fromCache: false,
        totalEncontrados: 0,
        analisadosPorIA: false,
      };
      return NextResponse.json(emptyResult);
    }

    // --- Step 3: Get details for each place (limit 20, batched by 5) ---
    const placeIds = searchResults.slice(0, 20).map((r) => r.placeId);
    const allDetails = await getDetailsInBatches(placeIds, 5);

    if (allDetails.length === 0) {
      const emptyResult: ResultadoBuscaReal = {
        prospects: [],
        fromCache: false,
        totalEncontrados: searchResults.length,
        analisadosPorIA: false,
      };
      return NextResponse.json(emptyResult);
    }

    // --- Step 4: Claude AI analysis ---
    let analyses: AnaliseIA[] = [];
    let analisadosPorIA = false;

    try {
      const academiasParaAnalise = allDetails.map(placeDetailsToAnaliseInput);
      analyses = await analisarAcademias(academiasParaAnalise);
      analisadosPorIA = analyses.length > 0;
    } catch {
      console.warn('[prospeccao/buscar] Claude analysis failed, returning Google data only');
    }

    // --- Step 5: Merge Google data + IA analysis ---
    const upsertRows = allDetails.map((details, index) => {
      const analysis = analyses[index] ?? null;
      return buildUpsertRow(details, analysis);
    });

    // --- Step 6: Upsert into Supabase ---
    let savedRows: ProspectRow[] = [];
    try {
      if (supabaseAvailable) {
        const supabase = getAdminClient();

        const { data: upserted, error: upsertError } = await supabase
          .from('prospects')
          .upsert(upsertRows, { onConflict: 'google_place_id' })
          .select('*');

        if (!upsertError && upserted) {
          savedRows = upserted as ProspectRow[];
        }
      }
    } catch {
      console.warn('[prospeccao/buscar] Failed to save to Supabase, returning results anyway');
    }

    // --- Step 7: Return merged results in AcademiaProspectada format ---
    let prospects: AcademiaProspectada[];

    if (savedRows.length > 0) {
      prospects = savedRows.map(rowToAcademiaProspectada);
    } else {
      // Build prospects from raw data if Supabase save failed
      prospects = allDetails.map((details, index) => {
        const analysis = analyses[index] ?? null;
        const abordagemIA = analysis?.abordagem;

        return {
          id: details.placeId,
          nome: details.nome,
          endereco: details.endereco,
          bairro: details.bairro,
          cidade: details.cidade,
          estado: details.estado,
          telefone: details.telefone ?? '',
          website: details.site ?? undefined,
          googleMapsUrl: details.googleMapsUrl,
          notaGoogle: details.nota,
          totalAvaliacoes: details.totalAvaliacoes,
          modalidades: analysis?.modalidades ?? [],
          horarioFuncionamento: '',
          fotos: details.fotos,
          score: {
            geral: analysis?.score ?? 0,
            infraestrutura: analysis?.scoreBreakdown.tamanho ?? 0,
            presencaDigital: analysis?.scoreBreakdown.acessibilidade ?? 0,
            reputacao: analysis?.scoreBreakdown.capacidadePagamento ?? 0,
            potencialConversao: analysis?.scoreBreakdown.dorVisivel ?? 0,
          },
          estimativas: {
            alunosEstimados: analysis?.estimativaAlunos ?? 0,
            faturamentoEstimado: analysis?.estimativaFaturamento ?? 0,
            ticketMedio:
              analysis && analysis.estimativaAlunos > 0
                ? Math.round(analysis.estimativaFaturamento / analysis.estimativaAlunos)
                : 0,
            marketShare: 0,
          },
          reviews: details.reviews.map((r) => ({
            autor: r.autor,
            nota: r.nota,
            texto: r.texto,
            data: r.data,
            plataforma: 'Google',
          })),
          analise: {
            pontosFortes: analysis?.sinaisOportunidade ?? [],
            pontosFracos: analysis?.pontosFracos ?? [],
            oportunidades: analysis?.sinaisOportunidade ?? [],
            ameacas: analysis?.sinaisDor ?? [],
          },
          abordagem: {
            canal: abordagemIA?.canalRecomendado ?? 'WhatsApp',
            mensagemSugerida: abordagemIA?.mensagemWhatsApp ?? '',
            melhorHorario: abordagemIA?.melhorHorario ?? '',
            argumentos: [abordagemIA?.gancho, abordagemIA?.dicaAbordagem].filter(
              (s): s is string => Boolean(s),
            ),
            objecoesPrevistas: [],
          },
          crm: {
            status: 'novo',
            historicoContatos: [],
            observacoes: [],
          },
          classificacao: analysis?.classificacao ?? 'frio',
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
        } satisfies AcademiaProspectada;
      });
    }

    const result: ResultadoBuscaReal = {
      prospects,
      fromCache: false,
      totalEncontrados: searchResults.length,
      analisadosPorIA,
    };

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno no servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
