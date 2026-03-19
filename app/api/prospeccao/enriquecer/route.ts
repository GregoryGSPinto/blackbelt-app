// BlackBelt v2 — Prospect Enrichment API Route
// POST /api/prospeccao/enriquecer
// Re-fetches Google Places details and runs fresh Claude analysis for a single prospect.

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getPlaceDetails } from '@/lib/integrations/google-places';
import { analisarAcademiaIndividual } from '@/lib/integrations/claude-analysis';
import type { AcademiaParaAnalise } from '@/lib/integrations/claude-analysis';

// --- Types ---

interface EnriquecerBody {
  prospectId: string;
}

// --- Route Handler ---

export async function POST(request: NextRequest) {
  try {
    const body: EnriquecerBody = await request.json();

    if (!body.prospectId || typeof body.prospectId !== 'string') {
      return NextResponse.json(
        { error: { message: 'Campo "prospectId" é obrigatório', status: 400 } },
        { status: 400 },
      );
    }

    // --- Step 1: Get prospect from Supabase ---
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: { message: 'Supabase não configurado', status: 500 } },
        { status: 500 },
      );
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set() { /* API routes don't set cookies */ },
        remove() { /* API routes don't remove cookies */ },
      },
    });

    const { data: prospect, error: fetchError } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', body.prospectId)
      .single();

    if (fetchError || !prospect) {
      return NextResponse.json(
        { error: { message: `Prospect ${body.prospectId} não encontrado`, status: 404 } },
        { status: 404 },
      );
    }

    const googlePlaceId = prospect.google_place_id as string;
    if (!googlePlaceId) {
      return NextResponse.json(
        { error: { message: 'Prospect não possui google_place_id', status: 400 } },
        { status: 400 },
      );
    }

    // --- Step 2: Re-fetch Google Places details ---
    let details;
    try {
      details = await getPlaceDetails(googlePlaceId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar detalhes no Google Places';
      return NextResponse.json(
        { error: { message, status: 502 } },
        { status: 502 },
      );
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
      return NextResponse.json(
        { error: { message, status: 502 } },
        { status: 502 },
      );
    }

    // --- Step 4: Update prospect in Supabase ---
    const updatedData = {
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
      instagram: null,
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
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error: updateError } = await supabase
      .from('prospects')
      .update(updatedData)
      .eq('id', body.prospectId)
      .select()
      .single();

    if (updateError) {
      // Return enriched data even if Supabase update fails
      console.warn('[prospeccao/enriquecer] Failed to update Supabase:', updateError.message);
      return NextResponse.json({
        prospect: { ...prospect, ...updatedData },
        savedToDb: false,
      });
    }

    return NextResponse.json({
      prospect: updated,
      savedToDb: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno no servidor';
    return NextResponse.json(
      { error: { message, status: 500 } },
      { status: 500 },
    );
  }
}
