import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';

// ── Types ─────────────────────────────────────────────────────

export interface ZapierTrigger {
  id: string;
  name: string;
  event: string;
  description: string;
  samplePayload: Record<string, unknown>;
}

export interface ZapierAction {
  id: string;
  name: string;
  action: string;
  description: string;
  requiredFields: { key: string; label: string; type: string }[];
}

export interface ZapierTemplate {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  zapUrl: string;
}

// ── Available triggers & actions ──────────────────────────────

export const ZAPIER_TRIGGERS: ZapierTrigger[] = [
  {
    id: 'trg-new-student',
    name: 'Novo Aluno',
    event: 'new_student',
    description: 'Disparado quando um novo aluno é cadastrado',
    samplePayload: { student_id: 's-1', name: 'João Silva', email: 'joao@email.com', belt: 'white', plan: 'Essencial' },
  },
  {
    id: 'trg-check-in',
    name: 'Check-in',
    event: 'check_in',
    description: 'Disparado quando um aluno faz check-in',
    samplePayload: { student_id: 's-1', class_name: 'BJJ Fundamentos', timestamp: '2026-03-17T19:00:00Z' },
  },
  {
    id: 'trg-payment',
    name: 'Pagamento Confirmado',
    event: 'payment',
    description: 'Disparado quando um pagamento é confirmado',
    samplePayload: { student_id: 's-1', amount: 197, method: 'pix', status: 'paid' },
  },
  {
    id: 'trg-belt-promotion',
    name: 'Graduação',
    event: 'belt_promotion',
    description: 'Disparado quando um aluno é graduado',
    samplePayload: { student_id: 's-1', from_belt: 'white', to_belt: 'blue', date: '2026-03-20' },
  },
];

export const ZAPIER_ACTIONS: ZapierAction[] = [
  {
    id: 'act-create-student',
    name: 'Criar Aluno',
    action: 'create_student',
    description: 'Cadastra um novo aluno na academia',
    requiredFields: [
      { key: 'name', label: 'Nome', type: 'string' },
      { key: 'email', label: 'Email', type: 'string' },
    ],
  },
  {
    id: 'act-send-announcement',
    name: 'Enviar Comunicado',
    action: 'send_announcement',
    description: 'Envia um comunicado para todos os alunos',
    requiredFields: [
      { key: 'title', label: 'Título', type: 'string' },
      { key: 'content', label: 'Conteúdo', type: 'string' },
    ],
  },
];

export const ZAPIER_TEMPLATES: ZapierTemplate[] = [
  { id: 'tpl-1', name: 'Novo Aluno → Google Sheets', description: 'Adiciona novo aluno em uma planilha', trigger: 'new_student', action: 'google_sheets', zapUrl: '#' },
  { id: 'tpl-2', name: 'Pagamento → Slack', description: 'Notifica pagamento no Slack', trigger: 'payment', action: 'slack', zapUrl: '#' },
  { id: 'tpl-3', name: 'Check-in → Discord', description: 'Notifica check-in no Discord', trigger: 'check_in', action: 'discord', zapUrl: '#' },
];

// ── Service ───────────────────────────────────────────────────

export async function getZapierApiKey(academyId: string): Promise<{ apiKey: string; createdAt: string }> {
  try {
    if (isMock()) {
      return { apiKey: 'zk_test_bb_' + academyId.slice(0, 8), createdAt: '2026-01-15T00:00:00Z' };
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_settings')
      .select('value')
      .eq('academy_id', academyId)
      .eq('key', 'zapier')
      .single();

    if (error || !data) {
      console.error('[getZapierApiKey] error:', error?.message ?? 'not found');
      return { apiKey: '', createdAt: '' };
    }
    const config = data.value as Record<string, unknown>;
    return { apiKey: (config.apiKey as string) ?? '', createdAt: (config.createdAt as string) ?? '' };
  } catch (error) {
    console.error('[getZapierApiKey] Fallback:', error);
    return { apiKey: '', createdAt: '' };
  }
}

export async function regenerateZapierApiKey(academyId: string): Promise<{ apiKey: string }> {
  try {
    if (isMock()) {
      logger.debug(`[MOCK] Regenerated Zapier API key for ${academyId}`);
      return { apiKey: `zk_test_bb_${Date.now().toString(36)}` };
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const newKey = `zk_bb_${Date.now().toString(36)}`;
    const { error } = await supabase
      .from('academy_settings')
      .upsert({ academy_id: academyId, key: 'zapier', value: { apiKey: newKey, createdAt: new Date().toISOString(), connected: true } }, { onConflict: 'academy_id,key' });

    if (error) {
      console.error('[regenerateZapierApiKey] error:', error.message);
      return { apiKey: '' };
    }
    return { apiKey: newKey };
  } catch (error) {
    console.error('[regenerateZapierApiKey] Fallback:', error);
    return { apiKey: '' };
  }
}
