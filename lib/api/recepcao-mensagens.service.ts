import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface TemplateMensagem {
  id: string;
  nome: string;
  categoria: 'cobranca' | 'confirmacao' | 'lembrete' | 'follow_up' | 'boas_vindas';
  texto: string;
  variaveis: string[];
}

export interface EnvioMensagem {
  id: string;
  horario: string;
  alunoNome: string;
  templateNome: string;
  canal: 'whatsapp' | 'sms' | 'email';
  status: 'enviado' | 'entregue' | 'lido' | 'erro';
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getTemplates(): Promise<TemplateMensagem[]> {
  try {
    if (isMock()) {
      const { mockGetTemplates } = await import('@/lib/mocks/recepcao-mensagens.mock');
      return mockGetTemplates();
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      logServiceError(error, 'recepcao-mensagens');
      return [];
    }

    return (data ?? []).map((t: Record<string, unknown>) => ({
      id: t.id as string,
      nome: (t.name as string) ?? '',
      categoria: (t.category as TemplateMensagem['categoria']) ?? 'lembrete',
      texto: (t.body as string) ?? '',
      variaveis: (t.variables as string[]) ?? [],
    }));
  } catch (error) {
    logServiceError(error, 'recepcao-mensagens');
    return [];
  }
}

export async function enviarMensagemTemplate(data: {
  alunoNome: string;
  templateId: string;
  canal: string;
}): Promise<{ ok: boolean }> {
  try {
    if (isMock()) {
      const { mockEnviarMensagem } = await import('@/lib/mocks/recepcao-mensagens.mock');
      return mockEnviarMensagem(data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('message_sends')
      .insert({
        student_name: data.alunoNome,
        template_id: data.templateId,
        channel: data.canal,
        status: 'enviado',
      });

    if (error) {
      logServiceError(error, 'recepcao-mensagens');
      return { ok: false };
    }

    return { ok: true };
  } catch (error) {
    logServiceError(error, 'recepcao-mensagens');
    return { ok: false };
  }
}

export async function getHistoricoEnvios(): Promise<EnvioMensagem[]> {
  try {
    if (isMock()) {
      const { mockGetHistoricoEnvios } = await import('@/lib/mocks/recepcao-mensagens.mock');
      return mockGetHistoricoEnvios();
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('message_sends')
      .select('*, message_templates!inner(name)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      logServiceError(error, 'recepcao-mensagens');
      return [];
    }

    return (data ?? []).map((s: Record<string, unknown>) => {
      const template = s.message_templates as Record<string, unknown> | null;
      return {
        id: s.id as string,
        horario: s.created_at as string,
        alunoNome: (s.student_name as string) ?? '',
        templateNome: (template?.name as string) ?? '',
        canal: (s.channel as EnvioMensagem['canal']) ?? 'email',
        status: (s.status as EnvioMensagem['status']) ?? 'enviado',
      };
    });
  } catch (error) {
    logServiceError(error, 'recepcao-mensagens');
    return [];
  }
}
