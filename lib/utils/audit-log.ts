// ── Convenience audit-log helper ────────────────────────────────
// Fire-and-forget action logger. For full audit CRUD, use lib/api/audit.service.ts.

import { isMock } from '@/lib/env';

export async function logAction(action: string, details: Record<string, unknown> = {}): Promise<void> {
  if (isMock()) {
    console.info('[audit-mock]', action, details);
    return;
  }
  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action,
      details,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Audit failure should never break the app
  }
}
