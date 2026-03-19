// BlackBelt v2 — Prospect Message Regeneration API Route
// POST /api/prospeccao/mensagem
// Generates a new personalized outreach message for a specific channel.

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { regenerarMensagem } from '@/lib/integrations/claude-analysis';
import type { AcademiaParaAnalise } from '@/lib/integrations/claude-analysis';

// --- Types ---

interface MensagemBody {
  prospectId: string;
  canal: string;
  contexto?: string;
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
  nota_google: number | null;
  total_avaliacoes: number | null;
  modalidades: string[] | null;
  abordagem: Record<string, unknown> | null;
}

// --- Route Handler ---

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MensagemBody;

    if (!body.prospectId || typeof body.prospectId !== 'string') {
      return NextResponse.json(
        { error: 'Campo "prospectId" é obrigatório' },
        { status: 400 },
      );
    }

    if (!body.canal || typeof body.canal !== 'string') {
      return NextResponse.json(
        { error: 'Campo "canal" é obrigatório' },
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

    // --- Step 2: Build AcademiaParaAnalise from prospect data ---
    const academiaInput: AcademiaParaAnalise = {
      nome: row.nome ?? '',
      endereco: row.endereco ?? '',
      bairro: row.bairro ?? '',
      cidade: row.cidade ?? '',
      nota: row.nota_google ?? 0,
      totalAvaliacoes: row.total_avaliacoes ?? 0,
      telefone: row.telefone ?? undefined,
      site: row.site ?? undefined,
      reviews: [],
      horarios: [],
      tipos: row.modalidades ?? [],
    };

    // --- Step 3: Generate new message ---
    let mensagem: string;
    try {
      mensagem = await regenerarMensagem(academiaInput, body.canal, body.contexto);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao gerar mensagem';
      return NextResponse.json({ error: message }, { status: 502 });
    }

    // --- Step 4: Update prospect's abordagem in Supabase ---
    try {
      const currentAbordagem = (row.abordagem ?? {}) as Record<string, unknown>;
      const canalKey = `mensagem${body.canal}`;

      const updatedAbordagem = {
        ...currentAbordagem,
        [canalKey]: mensagem,
      };

      await supabase
        .from('prospects')
        .update({
          abordagem: updatedAbordagem,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', body.prospectId);
    } catch {
      // Save failed but we still return the generated message
      console.warn('[prospeccao/mensagem] Failed to update abordagem in Supabase');
    }

    return NextResponse.json({ mensagem });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno no servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
