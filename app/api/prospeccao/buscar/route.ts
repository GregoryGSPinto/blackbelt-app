// BlackBelt v2 — Prospecting Search API Route
// POST /api/prospeccao/buscar
// Searches Google Places, enriches with Claude AI, caches in Supabase.

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { searchPlaces, getPlaceDetails } from '@/lib/integrations/google-places';
import { analisarAcademias } from '@/lib/integrations/claude-analysis';
import type { PlaceDetails } from '@/lib/integrations/google-places';
import type { AcademiaParaAnalise, AnaliseIA } from '@/lib/integrations/claude-analysis';

// --- Types ---

interface BuscarBody {
  query: string;
  cidade?: string;
  bairro?: string;
  raioKm?: number;
}

interface MergedProspect {
  google_place_id: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  bairro: string;
  cep: string;
  latitude: number;
  longitude: number;
  telefone: string | null;
  telefone_internacional: string | null;
  site: string | null;
  instagram: string | null;
  google_maps_url: string;
  nota: number;
  total_avaliacoes: number;
  horarios: PlaceDetails['horarios'];
  aberto_agora: boolean;
  reviews: PlaceDetails['reviews'];
  fotos: string[];
  tipos: string[];
  // IA analysis fields
  modalidades: string[];
  estimativa_alunos: number;
  estimativa_faturamento: number;
  tamanho: string;
  tempo_mercado: string;
  sinais_dor: string[];
  sinais_oportunidade: string[];
  pontos_fracos: string[];
  sistema_detectado: string | null;
  score: number;
  score_breakdown: AnaliseIA['scoreBreakdown'];
  classificacao: string;
  motivo_classificacao: string;
  abordagem: AnaliseIA['abordagem'];
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

function mergeData(details: PlaceDetails, analysis: AnaliseIA): MergedProspect {
  return {
    google_place_id: details.placeId,
    nome: details.nome,
    endereco: details.endereco,
    cidade: details.cidade,
    estado: details.estado,
    bairro: details.bairro,
    cep: details.cep,
    latitude: details.latitude,
    longitude: details.longitude,
    telefone: details.telefone ?? null,
    telefone_internacional: details.telefoneInternacional ?? null,
    site: details.site ?? null,
    instagram: details.instagram ?? null,
    google_maps_url: details.googleMapsUrl,
    nota: details.nota,
    total_avaliacoes: details.totalAvaliacoes,
    horarios: details.horarios,
    aberto_agora: details.abertoAgora,
    reviews: details.reviews,
    fotos: details.fotos,
    tipos: details.tipos,
    modalidades: analysis.modalidades,
    estimativa_alunos: analysis.estimativaAlunos,
    estimativa_faturamento: analysis.estimativaFaturamento,
    tamanho: analysis.tamanho,
    tempo_mercado: analysis.tempoMercado,
    sinais_dor: analysis.sinaisDor,
    sinais_oportunidade: analysis.sinaisOportunidade,
    pontos_fracos: analysis.pontosFracos,
    sistema_detectado: analysis.sistemaDetectado,
    score: analysis.score,
    score_breakdown: analysis.scoreBreakdown,
    classificacao: analysis.classificacao,
    motivo_classificacao: analysis.motivoClassificacao,
    abordagem: analysis.abordagem,
  };
}

function mergeDataWithoutAnalysis(details: PlaceDetails): MergedProspect {
  return {
    google_place_id: details.placeId,
    nome: details.nome,
    endereco: details.endereco,
    cidade: details.cidade,
    estado: details.estado,
    bairro: details.bairro,
    cep: details.cep,
    latitude: details.latitude,
    longitude: details.longitude,
    telefone: details.telefone ?? null,
    telefone_internacional: details.telefoneInternacional ?? null,
    site: details.site ?? null,
    instagram: details.instagram ?? null,
    google_maps_url: details.googleMapsUrl,
    nota: details.nota,
    total_avaliacoes: details.totalAvaliacoes,
    horarios: details.horarios,
    aberto_agora: details.abertoAgora,
    reviews: details.reviews,
    fotos: details.fotos,
    tipos: details.tipos,
    modalidades: [],
    estimativa_alunos: 0,
    estimativa_faturamento: 0,
    tamanho: 'media',
    tempo_mercado: 'Desconhecido',
    sinais_dor: [],
    sinais_oportunidade: [],
    pontos_fracos: [],
    sistema_detectado: null,
    score: 0,
    score_breakdown: { tamanho: 0, dorVisivel: 0, capacidadePagamento: 0, acessibilidade: 0 },
    classificacao: 'frio',
    motivo_classificacao: 'Análise IA não disponível',
    abordagem: {
      canalRecomendado: 'WhatsApp',
      mensagemWhatsApp: '',
      mensagemInstagram: '',
      mensagemEmail: '',
      scriptPresencial: '',
      melhorHorario: '',
      gancho: '',
      dicaAbordagem: '',
    },
  };
}

/**
 * Process place details in batches to avoid rate limiting.
 * Max `batchSize` concurrent requests.
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
      // Skip failed detail fetches silently
    }
  }

  return results;
}

function createSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set() {
        // API routes don't set cookies
      },
      remove() {
        // API routes don't remove cookies
      },
    },
  });
}

function formatCacheAge(createdAt: string): string {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays > 0) return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  if (diffHours > 0) return `${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  return 'menos de 1 hora';
}

// --- Route Handler ---

export async function POST(request: NextRequest) {
  try {
    const body: BuscarBody = await request.json();

    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json(
        { error: { message: 'Campo "query" é obrigatório', status: 400 } },
        { status: 400 },
      );
    }

    // --- Step 1: Check Supabase cache ---
    const supabase = createSupabaseClient(request);
    try {
      if (!supabase) throw new Error('Supabase not configured');

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      let cacheQuery = supabase
        .from('prospects')
        .select('*')
        .gte('created_at', sevenDaysAgo);

      if (body.cidade) {
        cacheQuery = cacheQuery.ilike('cidade', `%${body.cidade}%`);
      }
      if (body.bairro) {
        cacheQuery = cacheQuery.ilike('bairro', `%${body.bairro}%`);
      }

      const { data: cached, error: cacheError } = await cacheQuery;

      if (!cacheError && cached && cached.length > 0) {
        const oldestRecord = cached.reduce((oldest, current) => {
          return new Date(current.created_at) < new Date(oldest.created_at) ? current : oldest;
        });

        return NextResponse.json({
          resultados: cached,
          total: cached.length,
          fromCache: true,
          cacheAge: formatCacheAge(oldestRecord.created_at),
        });
      }
    } catch {
      // Supabase cache check failed — continue without cache
      console.warn('[prospeccao/buscar] Cache check failed, proceeding with fresh search');
    }

    // --- Step 2: Search Google Places ---
    const composedQuery = [
      body.query,
      body.bairro,
      body.cidade,
    ].filter(Boolean).join(' ');

    let searchResults;
    try {
      searchResults = await searchPlaces({
        query: composedQuery,
        radius: body.raioKm ? body.raioKm * 1000 : undefined,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar no Google Places';
      return NextResponse.json(
        { error: { message, status: 502 } },
        { status: 502 },
      );
    }

    if (searchResults.length === 0) {
      return NextResponse.json({
        resultados: [],
        total: 0,
        fromCache: false,
        message: 'Nenhuma academia encontrada para esta busca',
      });
    }

    // --- Step 3: Get details for each place (batched) ---
    const placeIds = searchResults.map((r) => r.placeId);
    const allDetails = await getDetailsInBatches(placeIds, 5);

    if (allDetails.length === 0) {
      return NextResponse.json({
        resultados: searchResults.map((r) => ({
          google_place_id: r.placeId,
          nome: r.nome,
          endereco: r.endereco,
          nota: r.nota,
          total_avaliacoes: r.totalAvaliacoes,
        })),
        total: searchResults.length,
        fromCache: false,
        message: 'Detalhes das academias não puderam ser carregados',
      });
    }

    // --- Step 4: Claude AI analysis ---
    let mergedResults: MergedProspect[];

    try {
      const academiasParaAnalise = allDetails.map(placeDetailsToAnaliseInput);
      const analyses = await analisarAcademias(academiasParaAnalise);

      // Merge Google data with IA analysis
      mergedResults = allDetails.map((details, index) => {
        const analysis = analyses[index];
        if (analysis) {
          return mergeData(details, analysis);
        }
        return mergeDataWithoutAnalysis(details);
      });
    } catch {
      // Claude failed — return Google data without analysis
      console.warn('[prospeccao/buscar] Claude analysis failed, returning Google data only');
      mergedResults = allDetails.map(mergeDataWithoutAnalysis);
    }

    // --- Step 5: Upsert to Supabase ---
    try {
      if (supabase) {
        const upsertData = mergedResults.map((prospect) => ({
          ...prospect,
          updated_at: new Date().toISOString(),
        }));

        await supabase
          .from('prospects')
          .upsert(upsertData, { onConflict: 'google_place_id' });
      }
    } catch {
      // Supabase save failed — return results without persisting
      console.warn('[prospeccao/buscar] Failed to save to Supabase, returning results anyway');
    }

    return NextResponse.json({
      resultados: mergedResults,
      total: mergedResults.length,
      fromCache: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno no servidor';
    return NextResponse.json(
      { error: { message, status: 500 } },
      { status: 500 },
    );
  }
}
