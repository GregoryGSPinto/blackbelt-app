// BlackBelt v2 — Edge Function: Promote Belt
// Validates promotion rules, creates progression, notifications, achievements

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BELT_ORDER = ['white', 'gray', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'black'];
const MIN_ATTENDANCE = 30;

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { student_id, to_belt } = await req.json();
    if (!student_id || !to_belt) {
      return new Response(JSON.stringify({ error: 'student_id and to_belt are required' }), { status: 400 });
    }

    // Verify professor role
    const { data: professorProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'professor')
      .single();

    if (!professorProfile) {
      return new Response(JSON.stringify({ error: 'Only professors can promote' }), { status: 403 });
    }

    // Get student
    const { data: student } = await supabase
      .from('students')
      .select('id, belt, academy_id, profile_id')
      .eq('id', student_id)
      .single();

    if (!student) {
      return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
    }

    // Validate belt progression
    const currentIdx = BELT_ORDER.indexOf(student.belt);
    const targetIdx = BELT_ORDER.indexOf(to_belt);

    if (targetIdx <= currentIdx) {
      return new Response(JSON.stringify({ error: 'Belt can only go up' }), { status: 400 });
    }

    if (targetIdx !== currentIdx + 1) {
      return new Response(JSON.stringify({ error: 'Can only promote one belt level at a time' }), { status: 400 });
    }

    // Check minimum attendance
    const { count: attendanceCount } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', student_id);

    if ((attendanceCount ?? 0) < MIN_ATTENDANCE) {
      return new Response(JSON.stringify({ error: `Minimum ${MIN_ATTENDANCE} attendances required (has ${attendanceCount})` }), { status: 400 });
    }

    // Create progression
    const { data: progression, error: progError } = await supabase
      .from('progressions')
      .insert({
        student_id,
        evaluated_by: professorProfile.id,
        from_belt: student.belt,
        to_belt,
      })
      .select()
      .single();

    if (progError) {
      return new Response(JSON.stringify({ error: 'Failed to create progression' }), { status: 500 });
    }

    // Update student belt
    await supabase.from('students').update({ belt: to_belt }).eq('id', student_id);

    // Create achievement
    await supabase.from('achievements').insert({
      student_id,
      type: 'belt_promotion',
      granted_by: professorProfile.id,
    });

    // Create notification
    const { data: studentUser } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', student.profile_id)
      .single();

    if (studentUser) {
      await supabase.from('notifications').insert({
        user_id: studentUser.user_id,
        type: 'belt_promotion',
        title: 'Promoção de Faixa!',
        body: `Parabéns! Você foi promovido para faixa ${to_belt}.`,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      progression_id: progression.id,
      from_belt: student.belt,
      to_belt,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('promote-belt error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
