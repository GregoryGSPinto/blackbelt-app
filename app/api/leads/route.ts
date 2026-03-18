import { type NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { isMock } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { nomeAcademia, contatoNome, contatoEmail, contatoTelefone, cidade, estado, modalidades, quantidadeAlunos } = body;

    if (!nomeAcademia || !contatoNome || !contatoEmail) {
      return NextResponse.json(
        { error: { message: 'nomeAcademia, contatoNome e contatoEmail sao obrigatorios', status: 400 } },
        { status: 400 },
      );
    }

    if (isMock()) {
      return NextResponse.json({
        data: {
          id: `lead-${Date.now()}`,
          nomeAcademia,
          contatoNome,
          contatoEmail,
          contatoTelefone: contatoTelefone || null,
          cidade: cidade || null,
          estado: estado || null,
          modalidades: modalidades || [],
          quantidadeAlunos: quantidadeAlunos || null,
          origem: 'site',
          status: 'lead',
          criadoEm: new Date().toISOString(),
        },
      }, { status: 201 });
    }

    const supabase = getAdminClient();

    // Insert into prospects table as a new lead from the website
    const { data, error } = await supabase
      .from('prospects')
      .insert({
        nome: nomeAcademia,
        cidade: cidade || null,
        estado: estado || null,
        telefone: contatoTelefone || null,
        modalidades: modalidades || [],
        alunos_estimados: quantidadeAlunos ? Number(quantidadeAlunos) : null,
        status: 'novo',
        fonte: 'landing_page',
        responsavel: contatoNome,
        observacoes: `Lead via landing page.\nContato: ${contatoNome}\nEmail: ${contatoEmail}\nTelefone: ${contatoTelefone || 'N/A'}`,
      })
      .select()
      .single();

    if (error) {
      console.error('[api/leads] Supabase error:', error);
      return NextResponse.json(
        { error: { message: 'Erro ao salvar lead', status: 500 } },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('[api/leads] Error:', err);
    return NextResponse.json(
      { error: { message: 'Erro interno', status: 500 } },
      { status: 500 },
    );
  }
}
