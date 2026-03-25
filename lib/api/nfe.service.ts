import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';

// ── Types ─────────────────────────────────────────────────────

export interface NFeConfig {
  cnpj: string;
  inscricaoMunicipal: string;
  razaoSocial: string;
  certificateUploaded: boolean;
  autoEmit: boolean;
}

export interface NFeDocument {
  id: string;
  paymentId: string;
  studentName: string;
  number: string;
  value: number;
  status: 'pending' | 'emitted' | 'cancelled' | 'error';
  pdfUrl: string | null;
  emittedAt: string | null;
  error: string | null;
}

// ── Service ───────────────────────────────────────────────────

export async function emitNFe(paymentId: string): Promise<NFeDocument> {
  try {
    if (isMock()) {
      logger.debug(`[MOCK] Emitting NF-e for payment ${paymentId}`);
      return {
        id: `nfe-${Date.now()}`,
        paymentId,
        studentName: 'Aluno Mock',
        number: `NF-${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`,
        value: 197.0,
        status: 'emitted',
        pdfUrl: '/mock/nfe-sample.pdf',
        emittedAt: new Date().toISOString(),
        error: null,
      };
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Check if NFe provider is configured
    const { data: config } = await supabase
      .from('academy_settings')
      .select('value')
      .eq('key', 'nfe_config')
      .single();

    if (!config) {
      console.error('[emitNFe] NFe provider not configured');
      return {
        id: '',
        paymentId,
        studentName: '',
        number: '',
        value: 0,
        status: 'error',
        pdfUrl: null,
        emittedAt: null,
        error: 'Emissão de NFe não configurada. Configure em Configurações → Fiscal.',
      };
    }

    // Record the NFe request
    const { data, error } = await supabase
      .from('nfe_records')
      .insert({ payment_id: paymentId, status: 'pending' })
      .select()
      .single();

    if (error) {
      console.error('[emitNFe] error:', error.message);
      return { id: '', paymentId, studentName: '', number: '', value: 0, status: 'pending', pdfUrl: null, emittedAt: null, error: null };
    }

    return data as unknown as NFeDocument;
  } catch (error) {
    console.error('[emitNFe] Fallback:', error);
    return { id: '', paymentId: '', studentName: '', number: '', value: 0, status: 'pending', pdfUrl: null, emittedAt: null, error: null };
  }
}

export async function listNFes(academyId: string): Promise<NFeDocument[]> {
  try {
    if (isMock()) {
      return [
        { id: 'nfe-1', paymentId: 'pay-1', studentName: 'Lucas Ferreira', number: 'NF-00123', value: 197, status: 'emitted', pdfUrl: '/mock/nfe.pdf', emittedAt: '2026-03-15T10:00:00Z', error: null },
        { id: 'nfe-2', paymentId: 'pay-2', studentName: 'Ana Clara', number: 'NF-00124', value: 347, status: 'emitted', pdfUrl: '/mock/nfe.pdf', emittedAt: '2026-03-15T11:00:00Z', error: null },
        { id: 'nfe-3', paymentId: 'pay-3', studentName: 'Marcos Oliveira', number: '', value: 197, status: 'error', pdfUrl: null, emittedAt: null, error: 'CNPJ inválido' },
      ];
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('nfe_records')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[listNFes] error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as NFeDocument[];
  } catch (error) {
    console.error('[listNFes] Fallback:', error);
    return [];
  }
}

export async function getNFeConfig(academyId: string): Promise<NFeConfig> {
  try {
    if (isMock()) {
      return {
        cnpj: '12.345.678/0001-90',
        inscricaoMunicipal: '1234567',
        razaoSocial: 'Guerreiros BJJ LTDA',
        certificateUploaded: true,
        autoEmit: true,
      };
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_settings')
      .select('value')
      .eq('academy_id', academyId)
      .eq('key', 'nfe_config')
      .single();

    if (error || !data) {
      console.error('[getNFeConfig] error:', error?.message ?? 'not found');
      return { cnpj: '', inscricaoMunicipal: '', razaoSocial: '', certificateUploaded: false, autoEmit: false };
    }
    return data.value as unknown as NFeConfig;
  } catch (error) {
    console.error('[getNFeConfig] Fallback:', error);
    return { cnpj: '', inscricaoMunicipal: '', razaoSocial: '', certificateUploaded: false, autoEmit: false };
  }
}

export async function updateNFeConfig(academyId: string, config: Partial<NFeConfig>): Promise<void> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] NF-e config updated', { config });
      return;
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('academy_settings')
      .upsert({ academy_id: academyId, key: 'nfe_config', value: config }, { onConflict: 'academy_id,key' });

    if (error) {
      console.error('[updateNFeConfig] error:', error.message);
    }
  } catch (error) {
    console.error('[updateNFeConfig] Fallback:', error);
  }
}
