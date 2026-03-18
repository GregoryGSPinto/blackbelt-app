import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
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
    try {
      const res = await fetch('/api/nfe/emit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[nfe.emitNFe] API not available, using fallback');
      return { id: '', paymentId: '', studentName: '', number: '', value: 0, status: 'pending', pdfUrl: null, emittedAt: null, error: null } as NFeDocument;
    }
  } catch (error) {
    handleServiceError(error, 'nfe.emit');
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
    try {
      const res = await fetch(`/api/nfe?academyId=${academyId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[nfe.listNFes] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'nfe.list');
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
    try {
      const res = await fetch(`/api/nfe/config?academyId=${academyId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[nfe.getNFeConfig] API not available, using fallback');
      return { cnpj: '', inscricaoMunicipal: '', razaoSocial: '', certificateUploaded: false, autoEmit: false } as NFeConfig;
    }
  } catch (error) {
    handleServiceError(error, 'nfe.getConfig');
  }
}

export async function updateNFeConfig(academyId: string, config: Partial<NFeConfig>): Promise<void> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] NF-e config updated', { config });
      return;
    }
    try {
      const res = await fetch('/api/nfe/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyId, ...config }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      console.warn('[nfe.updateNFeConfig] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'nfe.updateConfig');
  }
}
