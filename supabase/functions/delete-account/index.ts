import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Apple App Store Review Guideline 5.1.1(v) — Account Deletion
serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Nao autorizado' }), { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Token invalido' }), { status: 401 });
    }

    const { confirmation } = await req.json();
    if (confirmation !== 'EXCLUIR MINHA CONTA') {
      return new Response(
        JSON.stringify({ error: 'Confirmacao invalida. Digite "EXCLUIR MINHA CONTA".' }),
        { status: 400 }
      );
    }

    // 1. Buscar todos os profiles do usuario
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, academy_id, role')
      .eq('user_id', user.id);

    const profileIds = (profiles || []).map((p: { id: string }) => p.id);

    // 2. Log de auditoria antes de deletar
    for (const profile of profiles || []) {
      await supabase.from('audit_log').insert({
        academy_id: profile.academy_id,
        user_id: user.id,
        profile_id: profile.id,
        action: 'delete_account',
        entity_type: 'account',
        entity_id: user.id,
        old_data: { email: user.email, role: profile.role },
      });
    }

    // 3. Registrar na tabela de exclusoes
    const crypto = globalThis.crypto;
    const encoder = new TextEncoder();
    const emailData = encoder.encode(user.email || '');
    const hashBuffer = await crypto.subtle.digest('SHA-256', emailData);
    const emailHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    await supabase.from('account_deletion_log').insert({
      user_id: user.id,
      email_hash: emailHash,
      profiles_archived: profileIds,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || null,
    });

    // 4. Anonimizar dados pessoais em people
    const { data: peopleRows } = await supabase
      .from('people')
      .select('id')
      .eq('account_id', user.id);

    for (const person of peopleRows || []) {
      await supabase
        .from('people')
        .update({
          full_name: '[Conta Excluida]',
          cpf: null,
          phone: null,
          email: null,
          avatar_url: null,
          medical_notes: null,
          emergency_contact_name: null,
          emergency_contact_phone: null,
          account_id: null,
        })
        .eq('id', person.id);
    }

    // 5. Marcar profiles como excluidos
    for (const pid of profileIds) {
      await supabase
        .from('profiles')
        .update({
          display_name: '[Conta Excluida]',
          email: null,
          phone: null,
          avatar_url: null,
          lifecycle_status: 'deleted',
        })
        .eq('id', pid);
    }

    // 6. Remover family_links
    if (peopleRows && peopleRows.length > 0) {
      const personIds = peopleRows.map((p: { id: string }) => p.id);
      await supabase.from('family_links').delete().in('guardian_person_id', personIds);
      await supabase.from('family_links').delete().in('dependent_person_id', personIds);
    }

    // 7. Deletar usuario do Auth (irrecuperavel)
    const { error: deleteErr } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteErr) throw deleteErr;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Conta excluida com sucesso. Todos os dados pessoais foram removidos.',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('[delete-account]', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500 }
    );
  }
});
