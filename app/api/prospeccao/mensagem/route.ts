// BlackBelt v2 — Prospect Message Regeneration API Route
// POST /api/prospeccao/mensagem
// Generates a new personalized outreach message for a specific channel.

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { regenerarMensagem } from '@/lib/integrations/claude-analysis';
import type { AcademiaParaAnalise } from '@/lib/integrations/claude-analysis';

// --- Types ---

interface MensagemBody {
  prospectId: string;
  canal: string;
  contexto?: string;
}

const CANAIS_VALIDOS = ['WhatsApp', 'Instagram', 'Email', 'Presencial', 'Telefone'];

// --- Route Handler ---

export async function POST(request: NextRequest) {
  try {
    const body: MensagemBody = await request.json();

    if (!body.prospectId || typeof body.prospectId !== 'string') {
      return NextResponse.json(
        { error: { message: 'Campo "prospectId" é obrigatório', status: 400 } },
        { status: 400 },
      );
    }

    if (!body.canal || typeof body.canal !== 'string') {
      return NextResponse.json(
        { error: { message: 'Campo "canal" é obrigatório', status: 400 } },
        { status: 400 },
      );
    }

    if (!CANAIS_VALIDOS.includes(body.canal)) {
      return NextResponse.json(
        { error: { message: `Canal inválido. Canais válidos: ${CANAIS_VALIDOS.join(', ')}`, status: 400 } },
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

    // --- Step 2: Build academia input from prospect data ---
    const academiaInput: AcademiaParaAnalise = {
      nome: (prospect.nome as string) ?? '',
      endereco: (prospect.endereco as string) ?? '',
      bairro: (prospect.bairro as string) ?? '',
      cidade: (prospect.cidade as string) ?? '',
      nota: (prospect.nota as number) ?? 0,
      totalAvaliacoes: (prospect.total_avaliacoes as number) ?? 0,
      telefone: (prospect.telefone as string) ?? undefined,
      site: (prospect.site as string) ?? undefined,
      reviews: Array.isArray(prospect.reviews)
        ? (prospect.reviews as { autor: string; nota: number; texto: string }[]).map((r) => ({
            autor: r.autor ?? '',
            nota: r.nota ?? 0,
            texto: r.texto ?? '',
          }))
        : [],
      horarios: Array.isArray(prospect.horarios)
        ? (prospect.horarios as { dia: string; abre: string; fecha: string }[]).map((h) => ({
            dia: h.dia ?? '',
            abre: h.abre ?? '',
            fecha: h.fecha ?? '',
          }))
        : [],
      tipos: Array.isArray(prospect.tipos) ? (prospect.tipos as string[]) : [],
    };

    // --- Step 3: Generate new message ---
    let mensagem: string;
    try {
      mensagem = await regenerarMensagem(academiaInput, body.canal, body.contexto);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao gerar mensagem';
      return NextResponse.json(
        { error: { message, status: 502 } },
        { status: 502 },
      );
    }

    // --- Step 4: Update prospect's abordagem in Supabase ---
    try {
      const currentAbordagem = (prospect.abordagem as Record<string, unknown>) ?? {};
      const canalKey = `mensagem${body.canal}` as string;

      const updatedAbordagem = {
        ...currentAbordagem,
        [canalKey]: mensagem,
      };

      await supabase
        .from('prospects')
        .update({
          abordagem: updatedAbordagem,
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.prospectId);
    } catch {
      // Save failed but we still return the generated message
      console.warn('[prospeccao/mensagem] Failed to update abordagem in Supabase');
    }

    return NextResponse.json({
      mensagem,
      canal: body.canal,
      prospectId: body.prospectId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno no servidor';
    return NextResponse.json(
      { error: { message, status: 500 } },
      { status: 500 },
    );
  }
}
