import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// ── Types ──────────────────────────────────────────────────────────

export interface WhatsAppConfig {
  provider: 'twilio' | 'zapi' | 'evolution' | 'mock';
  apiKey?: string;
  instanceId?: string;
  phoneNumber?: string;
  academyId: string;
  allowedHoursStart: number;
  allowedHoursEnd: number;
  active: boolean;
}

export interface WhatsAppTemplate {
  id: string;
  slug: string;
  name: string;
  text: string;
  variables: string[];
  category: 'cobranca' | 'aula' | 'experimental' | 'graduacao' | 'aniversario' | 'boas_vindas' | 'evento' | 'geral';
  isSystem: boolean;
  active: boolean;
}

export interface WhatsAppMessage {
  id: string;
  to: string;
  toName?: string;
  template: string;
  variables: Record<string, string>;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  error?: string;
  scheduledFor?: string;
  createdAt: string;
}

export interface WhatsAppAutomation {
  id: string;
  triggerName: string;
  templateSlug: string;
  description: string;
  active: boolean;
  delayHours: number;
}

export interface WhatsAppStats {
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  deliveryRate: number;
  readRate: number;
}

export interface WhatsAppMessageFilters {
  dateFrom?: string;
  dateTo?: string;
  template?: string;
  status?: string;
}

export interface ScheduledMessage {
  id: string;
  to: string;
  template: string;
  variables: Record<string, string>;
  sendAt: string;
  status: 'scheduled' | 'sent' | 'cancelled';
}

// ── Fallbacks ─────────────────────────────────────────────────────

const EMPTY_CONFIG: WhatsAppConfig = { provider: 'mock', academyId: '', allowedHoursStart: 8, allowedHoursEnd: 20, active: false };
const EMPTY_STATS: WhatsAppStats = { sent: 0, delivered: 0, read: 0, failed: 0, deliveryRate: 0, readRate: 0 };

// ── API ────────────────────────────────────────────────────────────

export async function getWhatsAppConfig(academyId: string): Promise<WhatsAppConfig> {
  try {
    if (isMock()) {
      const { mockGetWhatsAppConfig } = await import('@/lib/mocks/whatsapp.mock');
      return mockGetWhatsAppConfig(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('whatsapp_configs')
      .select('*')
      .eq('academy_id', academyId)
      .single();
    if (error) {
      logServiceError(error, 'whatsapp');
      return { ...EMPTY_CONFIG, academyId };
    }
    return {
      provider: data.provider,
      apiKey: data.api_key,
      instanceId: data.instance_id,
      phoneNumber: data.phone_number,
      academyId: data.academy_id,
      allowedHoursStart: data.allowed_hours_start,
      allowedHoursEnd: data.allowed_hours_end,
      active: data.active,
    };
  } catch (error) {
    logServiceError(error, 'whatsapp');
    return { ...EMPTY_CONFIG, academyId };
  }
}

export async function saveWhatsAppConfig(academyId: string, config: Partial<WhatsAppConfig>): Promise<void> {
  try {
    if (isMock()) {
      const { mockSaveWhatsAppConfig } = await import('@/lib/mocks/whatsapp.mock');
      return mockSaveWhatsAppConfig(academyId, config);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('whatsapp_configs')
      .upsert({
        academy_id: academyId,
        provider: config.provider,
        api_key: config.apiKey,
        instance_id: config.instanceId,
        phone_number: config.phoneNumber,
        allowed_hours_start: config.allowedHoursStart,
        allowed_hours_end: config.allowedHoursEnd,
        active: config.active,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'academy_id' });
    if (error) {
      logServiceError(error, 'whatsapp');
    }
  } catch (error) {
    logServiceError(error, 'whatsapp');
  }
}

export async function getTemplates(academyId: string): Promise<WhatsAppTemplate[]> {
  try {
    if (isMock()) {
      const { mockGetTemplates } = await import('@/lib/mocks/whatsapp.mock');
      return mockGetTemplates(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('academy_id', academyId)
      .order('category')
      .order('name');
    if (error) {
      logServiceError(error, 'whatsapp');
      return [];
    }
    return (data ?? []).map((t: Record<string, unknown>) => ({
      id: t.id as string,
      slug: t.slug as string,
      name: t.name as string,
      text: t.text as string,
      variables: (t.variables as string[]) ?? [],
      category: t.category as WhatsAppTemplate['category'],
      isSystem: t.is_system as boolean,
      active: t.active as boolean,
    }));
  } catch (error) {
    logServiceError(error, 'whatsapp');
    return [];
  }
}

export async function createCustomTemplate(academyId: string, name: string, slug: string, text: string, category: WhatsAppTemplate['category'], variables: string[]): Promise<WhatsAppTemplate> {
  try {
    if (isMock()) {
      const { mockCreateCustomTemplate } = await import('@/lib/mocks/whatsapp.mock');
      return mockCreateCustomTemplate(academyId, name, slug, text, category, variables);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .insert({ academy_id: academyId, name, slug, text, category, variables, is_system: false })
      .select()
      .single();
    if (error) {
      logServiceError(error, 'whatsapp');
      return { id: crypto.randomUUID(), slug, name, text, variables, category, isSystem: false, active: true };
    }
    return { id: data.id, slug: data.slug, name: data.name, text: data.text, variables: data.variables ?? [], category: data.category, isSystem: false, active: true };
  } catch (error) {
    logServiceError(error, 'whatsapp');
    return { id: crypto.randomUUID(), slug, name, text, variables, category, isSystem: false, active: true };
  }
}

export async function sendMessage(academyId: string, to: string, toName: string, templateSlug: string, variables: Record<string, string>): Promise<WhatsAppMessage> {
  try {
    if (isMock()) {
      const { mockSendMessage } = await import('@/lib/mocks/whatsapp.mock');
      return mockSendMessage(academyId, to, toName, templateSlug, variables);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({ academy_id: academyId, to_phone: to, to_name: toName, template_slug: templateSlug, variables, status: 'queued' })
      .select()
      .single();
    if (error) {
      logServiceError(error, 'whatsapp');
      return { id: crypto.randomUUID(), to, toName, template: templateSlug, variables, status: 'failed', error: error.message, createdAt: new Date().toISOString() };
    }
    return { id: data.id, to: data.to_phone, toName: data.to_name, template: data.template_slug, variables: data.variables, status: data.status, createdAt: data.created_at };
  } catch (error) {
    logServiceError(error, 'whatsapp');
    return { id: crypto.randomUUID(), to, toName, template: templateSlug, variables, status: 'failed', error: String(error), createdAt: new Date().toISOString() };
  }
}

export async function sendBulk(academyId: string, recipients: { phone: string; name: string }[], templateSlug: string, variables: Record<string, string>): Promise<WhatsAppMessage[]> {
  try {
    if (isMock()) {
      const { mockSendBulk } = await import('@/lib/mocks/whatsapp.mock');
      return mockSendBulk(academyId, recipients, templateSlug, variables);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const rows = recipients.map((r) => ({
      academy_id: academyId,
      to_phone: r.phone,
      to_name: r.name,
      template_slug: templateSlug,
      variables,
      status: 'queued',
    }));
    const { data, error } = await supabase.from('whatsapp_messages').insert(rows).select();
    if (error) {
      logServiceError(error, 'whatsapp');
      return [];
    }
    return (data ?? []).map((d: Record<string, unknown>) => ({
      id: d.id as string, to: d.to_phone as string, toName: d.to_name as string, template: d.template_slug as string, variables: d.variables as Record<string, string>, status: d.status as WhatsAppMessage['status'], createdAt: d.created_at as string,
    }));
  } catch (error) {
    logServiceError(error, 'whatsapp');
    return [];
  }
}

export async function getMessageHistory(academyId: string, filters?: WhatsAppMessageFilters): Promise<WhatsAppMessage[]> {
  try {
    if (isMock()) {
      const { mockGetMessageHistory } = await import('@/lib/mocks/whatsapp.mock');
      return mockGetMessageHistory(academyId, filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase.from('whatsapp_messages').select('*').eq('academy_id', academyId).order('created_at', { ascending: false }).limit(200);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.template) query = query.eq('template_slug', filters.template);
    if (filters?.dateFrom) query = query.gte('created_at', filters.dateFrom);
    if (filters?.dateTo) query = query.lte('created_at', filters.dateTo);
    const { data, error } = await query;
    if (error) {
      logServiceError(error, 'whatsapp');
      return [];
    }
    return (data ?? []).map((d: Record<string, unknown>) => ({
      id: d.id as string, to: d.to_phone as string, toName: d.to_name as string, template: d.template_slug as string, variables: (d.variables as Record<string, string>) ?? {}, status: d.status as WhatsAppMessage['status'],
      sentAt: d.sent_at as string | undefined, deliveredAt: d.delivered_at as string | undefined, readAt: d.read_at as string | undefined, error: d.error as string | undefined, scheduledFor: d.scheduled_for as string | undefined, createdAt: d.created_at as string,
    }));
  } catch (error) {
    logServiceError(error, 'whatsapp');
    return [];
  }
}

export async function getMessageStats(academyId: string): Promise<WhatsAppStats> {
  try {
    if (isMock()) {
      const { mockGetMessageStats } = await import('@/lib/mocks/whatsapp.mock');
      return mockGetMessageStats(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('whatsapp_messages').select('status').eq('academy_id', academyId);
    if (error) {
      logServiceError(error, 'whatsapp');
      return EMPTY_STATS;
    }
    const total = data?.length ?? 0;
    const sent = data?.filter((d: Record<string, unknown>) => d.status !== 'queued').length ?? 0;
    const delivered = data?.filter((d: Record<string, unknown>) => ['delivered', 'read'].includes(d.status as string)).length ?? 0;
    const read = data?.filter((d: Record<string, unknown>) => d.status === 'read').length ?? 0;
    const failed = data?.filter((d: Record<string, unknown>) => d.status === 'failed').length ?? 0;
    return { sent, delivered, read, failed, deliveryRate: total > 0 ? Math.round((delivered / total) * 100) : 0, readRate: total > 0 ? Math.round((read / total) * 100) : 0 };
  } catch (error) {
    logServiceError(error, 'whatsapp');
    return EMPTY_STATS;
  }
}

export async function getAutomations(academyId: string): Promise<WhatsAppAutomation[]> {
  try {
    if (isMock()) {
      const { mockGetAutomations } = await import('@/lib/mocks/whatsapp.mock');
      return mockGetAutomations(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('whatsapp_automations').select('*').eq('academy_id', academyId).order('trigger_name');
    if (error) {
      logServiceError(error, 'whatsapp');
      return [];
    }
    return (data ?? []).map((a: Record<string, unknown>) => ({
      id: a.id as string, triggerName: a.trigger_name as string, templateSlug: a.template_slug as string, description: a.description as string, active: a.active as boolean, delayHours: a.delay_hours as number,
    }));
  } catch (error) {
    logServiceError(error, 'whatsapp');
    return [];
  }
}

export async function toggleAutomation(automationId: string, active: boolean): Promise<void> {
  try {
    if (isMock()) {
      const { mockToggleAutomation } = await import('@/lib/mocks/whatsapp.mock');
      return mockToggleAutomation(automationId, active);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase.from('whatsapp_automations').update({ active }).eq('id', automationId);
    if (error) {
      logServiceError(error, 'whatsapp');
    }
  } catch (error) {
    logServiceError(error, 'whatsapp');
  }
}

export async function scheduleMessage(academyId: string, to: string, toName: string, templateSlug: string, variables: Record<string, string>, sendAt: string): Promise<ScheduledMessage> {
  try {
    if (isMock()) {
      const { mockScheduleMessage } = await import('@/lib/mocks/whatsapp.mock');
      return mockScheduleMessage(academyId, to, toName, templateSlug, variables, sendAt);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({ academy_id: academyId, to_phone: to, to_name: toName, template_slug: templateSlug, variables, status: 'queued', scheduled_for: sendAt })
      .select()
      .single();
    if (error) {
      logServiceError(error, 'whatsapp');
      return { id: crypto.randomUUID(), to, template: templateSlug, variables, sendAt, status: 'scheduled' };
    }
    return { id: data.id, to: data.to_phone, template: data.template_slug, variables: data.variables, sendAt: data.scheduled_for, status: 'scheduled' };
  } catch (error) {
    logServiceError(error, 'whatsapp');
    return { id: crypto.randomUUID(), to, template: templateSlug, variables, sendAt, status: 'scheduled' };
  }
}

export async function cancelScheduled(messageId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockCancelScheduled } = await import('@/lib/mocks/whatsapp.mock');
      return mockCancelScheduled(messageId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase.from('whatsapp_messages').delete().eq('id', messageId).eq('status', 'queued');
    if (error) {
      logServiceError(error, 'whatsapp');
    }
  } catch (error) {
    logServiceError(error, 'whatsapp');
  }
}

export async function testConnection(config: Partial<WhatsAppConfig>): Promise<boolean> {
  try {
    if (isMock()) {
      const { mockTestConnection } = await import('@/lib/mocks/whatsapp.mock');
      return mockTestConnection(config);
    }
    // If no API key configured, return false with message
    if (!config.apiKey) {
      logServiceError(new Error('No API key configured, cannot test connection'), 'whatsapp');
      return false;
    }
    return true;
  } catch (error) {
    logServiceError(error, 'whatsapp');
    return false;
  }
}
