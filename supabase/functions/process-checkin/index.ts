// BlackBelt v2 — Edge Function: Process Check-in
// Validates QR token, creates attendance record, checks achievements

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    const { token, class_id, method = 'qr_code' } = await req.json();

    // If QR method, validate token
    if (method === 'qr_code' && token) {
      try {
        const payload = JSON.parse(atob(token));
        if (new Date(payload.expires_at) < new Date()) {
          return new Response(JSON.stringify({ error: 'QR code expired' }), { status: 400 });
        }
        if (payload.class_id !== class_id) {
          return new Response(JSON.stringify({ error: 'QR code mismatch' }), { status: 400 });
        }
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid QR code' }), { status: 400 });
      }
    }

    // Get student profile
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', (await supabase.from('profiles').select('id').eq('user_id', user.id).single()).data?.id)
      .single();

    if (!student) {
      return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
    }

    // Check for duplicate (1 per student per class per day)
    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('student_id', student.id)
      .eq('class_id', class_id)
      .gte('checked_at', `${today}T00:00:00`)
      .lt('checked_at', `${today}T23:59:59`);

    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ error: 'Already checked in today', already_checked: true }), { status: 409 });
    }

    // Create attendance record
    const { data: attendance, error: insertError } = await supabase
      .from('attendance')
      .insert({
        student_id: student.id,
        class_id,
        method,
        checked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: 'Failed to create attendance' }), { status: 500 });
    }

    // Check for streak achievements
    const { count } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', student.id);

    const achievements: string[] = [];
    const milestones = [10, 50, 100, 200, 500];
    for (const milestone of milestones) {
      if (count === milestone) {
        const { error: achError } = await supabase
          .from('achievements')
          .insert({
            student_id: student.id,
            type: 'class_milestone',
            granted_by: student.id,
          });
        if (!achError) achievements.push(`${milestone} aulas!`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      attendance_id: attendance.id,
      achievements,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('process-checkin error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
