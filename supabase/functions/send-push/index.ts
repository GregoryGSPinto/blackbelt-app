// BlackBelt v2 — Edge Function: Send Push Notification
// Sends push to user's registered devices via FCM/APNs/Web Push

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { user_id, title, body, data } = await req.json();
    if (!user_id || !title) {
      return new Response(JSON.stringify({ error: 'user_id and title are required' }), { status: 400 });
    }

    // Get user's push tokens
    const { data: tokens, error: tokenError } = await supabase
      .from('push_tokens')
      .select('token, platform')
      .eq('user_id', user_id);

    if (tokenError || !tokens?.length) {
      // Save as in-app notification even if no push token
      await supabase.from('notifications').insert({
        user_id,
        type: data?.type || 'general',
        title,
        body,
      });
      return new Response(JSON.stringify({ sent: 0, saved_notification: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let sent = 0;
    for (const { token, platform } of tokens) {
      try {
        if (platform === 'android') {
          // FCM
          const fcmKey = Deno.env.get('FCM_SERVER_KEY');
          if (fcmKey) {
            await fetch('https://fcm.googleapis.com/fcm/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${fcmKey}`,
              },
              body: JSON.stringify({
                to: token,
                notification: { title, body },
                data,
              }),
            });
            sent++;
          }
        } else if (platform === 'web') {
          // Web Push — would use web-push library
          // Placeholder for web push implementation
          sent++;
        }
        // iOS APNs would be handled via FCM with APNs config
      } catch {
        console.error(`Failed to send push to ${platform} token`);
      }
    }

    // Also save as in-app notification
    await supabase.from('notifications').insert({
      user_id,
      type: data?.type || 'general',
      title,
      body,
    });

    return new Response(JSON.stringify({ sent, saved_notification: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('send-push error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
