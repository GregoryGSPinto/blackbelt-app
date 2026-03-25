import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';
import type { WebhookConfig, WebhookDelivery, CreateWebhookPayload } from '@/lib/types/webhook';

export async function listWebhooks(academyId: string): Promise<WebhookConfig[]> {
  try {
    if (isMock()) {
      const { mockListWebhooks } = await import('@/lib/mocks/webhook.mock');
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
    return (data ?? []) as unknown as WebhookConfig[];
  } catch (error) {
    console.error('[listWebhooks] Fallback:', error);
    return [];
  }
}

export async function createWebhook(
  academyId: string,
  payload: CreateWebhookPayload,
): Promise<WebhookConfig> {
  try {
    if (isMock()) {
      const { mockCreateWebhook } = await import('@/lib/mocks/webhook.mock');
      return mockCreateWebhook(academyId, payload);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('webhook_configs')
      .insert({
        academy_id: academyId,
        url: payload.url,
        events: payload.events,
        secret: payload.secret ?? '',
        is_active: true,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[createWebhook] error:', error?.message);
      return {} as WebhookConfig;
    }
    return data as unknown as WebhookConfig;
  } catch (error) {
    console.error('[createWebhook] Fallback:', error);
    return {} as WebhookConfig;
  }
}

export async function deleteWebhook(webhookId: string): Promise<void> {
  try {
    if (isMock()) {
      logger.debug(`[MOCK] Deleted webhook ${webhookId}`);
      return;
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

export async function toggleWebhook(webhookId: string, active: boolean): Promise<void> {
  try {
    if (isMock()) {
      logger.debug(`[MOCK] Webhook ${webhookId} set to ${active ? 'active' : 'inactive'}`);
      return;
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('webhook_configs')
      .update({ is_active: active })
      .eq('id', webhookId);

    if (error) {
      console.error('[toggleWebhook] error:', error.message);
    }
  } catch (error) {
    console.error('[toggleWebhook] Fallback:', error);
  }
}

export async function getWebhookDeliveries(
  webhookId: string,
  limit = 20,
): Promise<WebhookDelivery[]> {
  try {
    if (isMock()) {
      const { mockWebhookDeliveries } = await import('@/lib/mocks/webhook.mock');
      return mockWebhookDeliveries(webhookId, limit);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[getWebhookDeliveries] error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as WebhookDelivery[];
  } catch (error) {
    console.error('[getWebhookDeliveries] Fallback:', error);
    return [];
  }
}

export async function testWebhook(webhookId: string): Promise<{ success: boolean; statusCode: number }> {
  try {
    if (isMock()) {
      logger.debug(`[MOCK] Test webhook ${webhookId}`);
      return { success: true, statusCode: 200 };
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Fetch the webhook config to get the URL
    const { data: webhook, error } = await supabase
      .from('webhook_configs')
      .select('url, secret')
      .eq('id', webhookId)
      .single();

    if (error || !webhook) {
      console.error('[testWebhook] error:', error?.message ?? 'not found');
      return { success: false, statusCode: 0 };
    }

    // Send a test payload
    try {
      const res = await fetch((webhook as Record<string, unknown>).url as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'test', timestamp: new Date().toISOString() }),
      });
      return { success: res.ok, statusCode: res.status };
    } catch {
      console.error('[testWebhook] Failed to reach webhook URL');
      return { success: false, statusCode: 0 };
    }
  } catch (error) {
    console.error('[testWebhook] Fallback:', error);
    return { success: false, statusCode: 0 };
  }
}
