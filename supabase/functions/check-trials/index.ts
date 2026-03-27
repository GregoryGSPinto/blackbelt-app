import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Buscar academias com trial expirado que nao converteram
    const { data: expiredTrials } = await supabase
      .from('academies')
      .select('id, name, billing_email, trial_ends_at, asaas_subscription_id')
      .eq('subscription_status', 'trial')
      .eq('trial_converted', false)
      .lt('trial_ends_at', new Date().toISOString());

    let updated = 0;
    for (const academy of expiredTrials || []) {
      // Marcar como past_due (a cobranca do Asaas ja foi gerada automaticamente)
      await supabase.from('academies').update({
        subscription_status: 'past_due',
      }).eq('id', academy.id);

      updated++;
    }

    return new Response(JSON.stringify({
      checked: expiredTrials?.length || 0,
      updated,
      timestamp: new Date().toISOString(),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
