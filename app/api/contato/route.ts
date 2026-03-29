import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getAdminClient } from '@/lib/supabase/admin';
import { isMock } from '@/lib/env';
import { rateLimit } from '@/lib/utils/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 tentativas por minuto por IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const rateLimitResult = rateLimit(`contato:${ip}`, { limit: 10, windowMs: 60_000 });
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde um momento.' }, { status: 429 });
    }

    const body = await request.json();

    const { nome, email, telefone, assunto, mensagem } = body;

    if (!nome || !email || !mensagem) {
      return NextResponse.json(
        { error: { message: 'nome, email e mensagem sao obrigatorios', status: 400 } },
        { status: 400 },
      );
    }

    if (isMock()) {
      return NextResponse.json({
        data: {
          id: `msg-${Date.now()}`,
          nome,
          email,
          telefone: telefone || null,
          assunto: assunto || null,
          mensagem,
          status: 'novo',
          created_at: new Date().toISOString(),
        },
      }, { status: 201 });
    }

    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        nome,
        email,
        telefone: telefone || null,
        assunto: assunto || null,
        mensagem,
        status: 'novo',
      })
      .select()
      .single();

    if (error) {
      console.error('[api/contato] Supabase error:', error);
      return NextResponse.json(
        { error: { message: 'Erro ao enviar mensagem', status: 500 } },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('[api/contato] Error:', err);
    return NextResponse.json(
      { error: { message: 'Erro interno', status: 500 } },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Auth check — listing messages requires authentication
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return request.cookies.get(name)?.value; }, set() {}, remove() {} } },
    );
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (isMock()) {
      return NextResponse.json({
        data: [
          {
            id: 'msg-1',
            nome: 'Carlos Silva',
            email: 'carlos@email.com',
            assunto: 'Duvida sobre planos',
            mensagem: 'Gostaria de saber mais sobre os planos para academias com mais de 200 alunos.',
            status: 'novo',
            created_at: '2026-03-15T10:00:00Z',
          },
          {
            id: 'msg-2',
            nome: 'Ana Paula',
            email: 'ana@academia.com',
            telefone: '11999887766',
            assunto: 'Migracao de plataforma',
            mensagem: 'Usamos outra plataforma e queremos migrar. Como funciona?',
            status: 'lido',
            created_at: '2026-03-14T14:30:00Z',
          },
        ],
      });
    }

    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[api/contato] Supabase error:', error);
      return NextResponse.json(
        { error: { message: 'Erro ao buscar mensagens', status: 500 } },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[api/contato] Error:', err);
    return NextResponse.json(
      { error: { message: 'Erro interno', status: 500 } },
      { status: 500 },
    );
  }
}
