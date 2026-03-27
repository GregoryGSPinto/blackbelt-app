import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { profileId, newRole, reason, createAuth, email, password } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verificar permissão do caller (admin)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller } } = await supabase.auth.getUser(token);
    if (!caller) return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401 });

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('id, role, academy_id')
      .eq('user_id', caller.id)
      .in('role', ['admin', 'superadmin'])
      .single();

    if (!callerProfile) return new Response(JSON.stringify({ error: 'Sem permissão' }), { status: 403 });

    // Buscar perfil atual
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('*, people(*)')
      .eq('id', profileId)
      .single();

    if (!currentProfile) {
      return new Response(JSON.stringify({ error: 'Perfil não encontrado' }), { status: 404 });
    }

    // Verificar se admin tem acesso à academia do perfil
    if (callerProfile.role !== 'superadmin' && callerProfile.academy_id !== currentProfile.academy_id) {
      return new Response(JSON.stringify({ error: 'Sem permissão para esta academia' }), { status: 403 });
    }

    const oldRole = currentProfile.role;

    // Preservar dados relevantes
    const preservedData: Record<string, unknown> = {};
    if (oldRole === 'aluno_kids') {
      preservedData.previousRole = 'aluno_kids';
    }
    if (oldRole === 'aluno_teen') {
      preservedData.previousRole = 'aluno_teen';
    }

    // Se precisa criar auth (Kids→Teen com login)
    let userId = currentProfile.user_id;
    if (createAuth && email && password && !userId) {
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: currentProfile.display_name, role: newRole },
      });

      if (authErr) throw authErr;
      userId = authData.user.id;

      // Vincular person à account
      if (currentProfile.person_id) {
        await supabase.from('people').update({ account_id: userId }).eq('id', currentProfile.person_id);
      }
    }

    // Atualizar role do perfil
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        role: newRole,
        user_id: userId,
        lifecycle_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId);

    if (updateErr) throw updateErr;

    // Log da evolução
    const evolvedById = callerProfile?.id || null;
    await supabase.from('profile_evolution_log').insert({
      profile_id: profileId,
      from_role: oldRole,
      to_role: newRole,
      reason,
      evolved_by: evolvedById,
      preserved_data: preservedData,
    });

    // Timeline event
    await supabase.from('student_timeline_events').insert({
      profile_id: profileId,
      academy_id: currentProfile.academy_id,
      event_type: 'evolucao_perfil',
      title: `Promovido de ${oldRole} para ${newRole}`,
      description: reason,
      metadata: preservedData,
    });

    return new Response(JSON.stringify({
      success: true,
      message: `Perfil evoluído de ${oldRole} para ${newRole}`,
      preservedData,
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
});
