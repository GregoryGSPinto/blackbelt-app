// Supabase Edge Function: process-webhook
// Processes incoming payment webhooks from payment gateway

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const payload = await req.json();
    const signature = req.headers.get('x-webhook-signature');

    // In production:
    // 1. Verify webhook signature
    // 2. Parse payment event (paid, failed, refunded)
    // 3. Update payment record in DB
    // 4. If paid: emit NF-e, send receipt, update student status
    // 5. If failed: send retry notification
    // 6. Fire internal webhooks to academy's configured URLs
    console.log(`Processing webhook: ${payload.event}`, { signature: !!signature });

    return new Response(
      JSON.stringify({ success: true, event: payload.event }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
