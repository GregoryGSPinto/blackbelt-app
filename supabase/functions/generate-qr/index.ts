// BlackBelt v2 — Edge Function: Generate QR Code for Check-in
// Validates professor owns the class, generates time-limited QR token

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const QR_EXPIRY_MINUTES = 5;

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

    const { class_id } = await req.json();
    if (!class_id) {
      return new Response(JSON.stringify({ error: 'class_id is required' }), { status: 400 });
    }

    // Verify professor owns the class
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, professor_id')
      .eq('id', class_id)
      .single();

    if (classError || !classData) {
      return new Response(JSON.stringify({ error: 'Class not found' }), { status: 404 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'professor')
      .single();

    if (!profile || classData.professor_id !== profile.id) {
      return new Response(JSON.stringify({ error: 'Not authorized for this class' }), { status: 403 });
    }

    // Generate QR token
    const expiresAt = new Date(Date.now() + QR_EXPIRY_MINUTES * 60 * 1000).toISOString();
    const qrPayload = {
      class_id,
      expires_at: expiresAt,
      generated_by: profile.id,
      nonce: crypto.randomUUID(),
    };

    const token = btoa(JSON.stringify(qrPayload));

    return new Response(JSON.stringify({
      token,
      expires_at: expiresAt,
      class_id,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('generate-qr error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
