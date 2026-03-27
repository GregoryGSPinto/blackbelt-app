import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { email, password, name, role, academyId, guardianPersonId, birthDate, phone } = await req.json();

    // Validações
    if (!name) return new Response(JSON.stringify({ error: 'Nome é obrigatório' }), { status: 400 });
    if (!role) return new Response(JSON.stringify({ error: 'Role é obrigatório' }), { status: 400 });
    if (!academyId) return new Response(JSON.stringify({ error: 'Academy ID é obrigatório' }), { status: 400 });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verificar se quem está chamando é admin da academia
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller } } = await supabase.auth.getUser(token);
    if (!caller) return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401 });

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role, academy_id')
      .eq('user_id', caller.id)
      .in('role', ['admin', 'superadmin'])
      .single();

    if (!callerProfile) return new Response(JSON.stringify({ error: 'Sem permissão' }), { status: 403 });
    if (callerProfile.role !== 'superadmin' && callerProfile.academy_id !== academyId) {
      return new Response(JSON.stringify({ error: 'Sem permissão para esta academia' }), { status: 403 });
    }

    // 1. Criar Person
    const { data: person, error: personErr } = await supabase
      .from('people')
      .insert({
        full_name: name,
        email: email || null,
        phone: phone || null,
        birth_date: birthDate || null,
      })
      .select()
      .single();

    if (personErr) throw personErr;

    let userId = null;
    let tempPassword = null;

    // 2. Criar Auth account (se tem email)
    if (email) {
      tempPassword = password || generateTempPassword();
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name, role },
      });

      if (authErr) throw authErr;
      userId = authData.user.id;

      // Vincular person à account
      await supabase.from('people').update({ account_id: userId }).eq('id', person.id);
    }

    // 3. Criar Profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        person_id: person.id,
        academy_id: academyId,
        role,
        display_name: name,
        email: email || null,
        phone: phone || null,
        lifecycle_status: email ? 'active' : 'pending',
        needs_password_change: !!email,
      })
      .select()
      .single();

    if (profileErr) throw profileErr;

    // 4. Criar FamilyLink (se é menor e tem guardianPersonId)
    if (guardianPersonId && ['aluno_kids', 'aluno_teen'].includes(role)) {
      await supabase.from('family_links').insert({
        guardian_person_id: guardianPersonId,
        dependent_person_id: person.id,
        relationship: 'responsavel_legal',
        is_primary_guardian: true,
        is_financial_responsible: true,
        receives_notifications: true,
        receives_billing: true,
      });
    }

    // 5. Criar evento na timeline
    await supabase.from('student_timeline_events').insert({
      profile_id: profile.id,
      academy_id: academyId,
      event_type: 'matricula',
      title: `${name} foi cadastrado`,
      description: `Cadastro realizado por ${callerProfile.role === 'superadmin' ? 'Super Admin' : 'Admin'}`,
    });

    return new Response(JSON.stringify({
      success: true,
      personId: person.id,
      profileId: profile.id,
      userId,
      tempPassword: tempPassword,
      message: email
        ? `Aluno criado. Senha temporária: ${tempPassword}`
        : 'Aluno criado sem login (sem email)',
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
});

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password + '!1'; // garantir maiúscula + número + especial
}
