import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    // API not yet implemented — use mock
    const { mockGetTemplates } = await import('@/lib/mocks/recepcao-mensagens.mock');
      return mockGetTemplates();
  } catch (error) {
    handleServiceError(error, 'recepcao-mensagens.templates');
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
    const res = await fetch('/api/recepcao/mensagens/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'recepcao-mensagens.enviar');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'recepcao-mensagens.enviar');
  }
}

export async function getHistoricoEnvios(): Promise<EnvioMensagem[]> {
  try {
    if (isMock()) {
      const { mockGetHistoricoEnvios } = await import('@/lib/mocks/recepcao-mensagens.mock');
      return mockGetHistoricoEnvios();
    }
    // API not yet implemented — use mock
    const { mockGetHistoricoEnvios } = await import('@/lib/mocks/recepcao-mensagens.mock');
      return mockGetHistoricoEnvios();
  } catch (error) {
    handleServiceError(error, 'recepcao-mensagens.historico');
  }
}
