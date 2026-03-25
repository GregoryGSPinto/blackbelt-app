import { isMock } from '@/lib/env';

export type WebhookEvent =
  | 'student.created' | 'student.updated'
  | 'attendance.created'
  | 'invoice.created' | 'invoice.paid' | 'invoice.overdue'
  | 'progression.created'
  | 'subscription.created' | 'subscription.cancelled';

export interface OutgoingWebhook {
  id: string;
  academyId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  status: 'success' | 'failed' | 'pending';
  responseCode: number | null;
  attemptCount: number;
  createdAt: string;
}

export interface WebhookTestResult {
  success: boolean;
  responseCode: number;
  responseTime: number;
  error: string | null;
}

export async function registerWebhook(academyId: string, url: string, events: WebhookEvent[]): Promise<OutgoingWebhook> {
  try {
    if (isMock()) {
      const { mockRegisterWebhook } = await import('@/lib/mocks/webhooks-outgoing.mock');
      return mockRegisterWebhook(academyId, url, events);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const secret = `whsec_${Date.now().toString(36)}`;
    const { data, error } = await supabase
      .from('webhook_configs')
      .insert({ academy_id: academyId, url, events, secret, is_active: true })
      .select()
      .single();

    if (error || !data) {
      console.error('[registerWebhook] error:', error?.message);
      return { id: '', academyId, url, events, secret: '', active: true, createdAt: new Date().toISOString() };
    }
    return data as unknown as OutgoingWebhook;
  } catch (error) {
    console.error('[registerWebhook] Fallback:', error);
    return { id: '', academyId, url, events, secret: '', active: true, createdAt: new Date().toISOString() };
  }
}

export async function listWebhooks(academyId: string): Promise<OutgoingWebhook[]> {
  try {
    if (isMock()) {
      const { mockListWebhooks } = await import('@/lib/mocks/webhooks-outgoing.mock');
      return mockListWebhooks(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('webhook_configs')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[listWebhooks] error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as OutgoingWebhook[];
  } catch (error) {
    console.error('[listWebhooks] Fallback:', error);
    return [];
  }
}

export async function deleteWebhook(webhookId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteWebhook } = await import('@/lib/mocks/webhooks-outgoing.mock');
      return mockDeleteWebhook(webhookId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('webhook_configs')
      .delete()
      .eq('id', webhookId);

    if (error) {
      console.error('[deleteWebhook] error:', error.message);
    }
  } catch (error) {
    console.error('[deleteWebhook] Fallback:', error);
  }
}

export async function testWebhook(webhookId: string): Promise<WebhookTestResult> {
  try {
    if (isMock()) {
      const { mockTestWebhook } = await import('@/lib/mocks/webhooks-outgoing.mock');
      return mockTestWebhook(webhookId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: webhook, error } = await supabase
      .from('webhook_configs')
      .select('url')
      .eq('id', webhookId)
      .single();

    if (error || !webhook) {
      console.error('[testWebhook] error:', error?.message ?? 'not found');
      return { success: false, responseCode: 0, responseTime: 0, error: 'Webhook not found' };
    }

    const start = Date.now();
    try {
      const res = await fetch((webhook as Record<string, unknown>).url as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'test', timestamp: new Date().toISOString() }),
      });
      const responseTime = Date.now() - start;
      return { success: res.ok, responseCode: res.status, responseTime, error: res.ok ? null : `HTTP ${res.status}` };
    } catch (err) {
      const responseTime = Date.now() - start;
      console.error('[testWebhook] Failed to reach webhook URL');
      return { success: false, responseCode: 0, responseTime, error: err instanceof Error ? err.message : 'Connection failed' };
    }
  } catch (error) {
    console.error('[testWebhook] Fallback:', error);
    return { success: false, responseCode: 0, responseTime: 0, error: 'Unknown error' };
  }
}

export async function getDeliveryLog(webhookId: string): Promise<WebhookDelivery[]> {
  try {
    if (isMock()) {
      const { mockGetDeliveryLog } = await import('@/lib/mocks/webhooks-outgoing.mock');
      return mockGetDeliveryLog(webhookId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[getDeliveryLog] error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as WebhookDelivery[];
  } catch (error) {
    console.error('[getDeliveryLog] Fallback:', error);
    return [];
  }
}
