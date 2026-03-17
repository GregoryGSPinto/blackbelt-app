import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export type TipoComunicado = 'informativo' | 'manutencao' | 'novidade' | 'urgente' | 'promocao';
export type StatusComunicado = 'rascunho' | 'agendado' | 'enviado';
export type CanalComunicado = 'email' | 'push' | 'in_app';

export interface SegmentacaoComunicado {
  tipo: 'todos' | 'por_plano' | 'por_health' | 'por_feature' | 'manual';
  filtro?: string;
  academiasIds?: string[];
}

export interface MetricasComunicado {
  totalDestinatarios: number;
  entregues: number;
  abertos: number;
  clicados: number;
}

export interface ComunicadoSaaS {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: TipoComunicado;
  segmentacao: SegmentacaoComunicado;
  canal: CanalComunicado[];
  status: StatusComunicado;
  agendadoPara?: string;
  enviadoEm?: string;
  metricas: MetricasComunicado;
  criadoEm: string;
  criadoPor: string;
}

export interface CreateComunicadoPayload {
  titulo: string;
  mensagem: string;
  tipo: TipoComunicado;
  segmentacao: SegmentacaoComunicado;
  canal: CanalComunicado[];
}

export async function listComunicados(status?: StatusComunicado): Promise<ComunicadoSaaS[]> {
  try {
    if (isMock()) {
      const { mockListComunicados } = await import('@/lib/mocks/superadmin-comunicacao.mock');
      return mockListComunicados(status);
    }
    try {
      const params = status ? `?status=${status}` : '';
      const res = await fetch(`/api/superadmin/comunicacao${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[superadmin-comunicacao.listComunicados] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'superadmin-comunicacao.list'); }
}

export async function createComunicado(data: CreateComunicadoPayload): Promise<ComunicadoSaaS> {
  try {
    if (isMock()) {
      const { mockCreateComunicado } = await import('@/lib/mocks/superadmin-comunicacao.mock');
      return mockCreateComunicado(data);
    }
    try {
      const res = await fetch('/api/superadmin/comunicacao', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[superadmin-comunicacao.createComunicado] API not available, using fallback');
      return {} as ComunicadoSaaS;
    }
  } catch (error) { handleServiceError(error, 'superadmin-comunicacao.create'); }
}

export async function enviarComunicado(id: string): Promise<ComunicadoSaaS> {
  try {
    if (isMock()) {
      const { mockEnviarComunicado } = await import('@/lib/mocks/superadmin-comunicacao.mock');
      return mockEnviarComunicado(id);
    }
    try {
      const res = await fetch(`/api/superadmin/comunicacao/${id}/enviar`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[superadmin-comunicacao.enviarComunicado] API not available, using fallback');
      return {} as ComunicadoSaaS;
    }
  } catch (error) { handleServiceError(error, 'superadmin-comunicacao.enviar'); }
}

export async function deleteComunicado(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteComunicado } = await import('@/lib/mocks/superadmin-comunicacao.mock');
      return mockDeleteComunicado(id);
    }
    try {
      const res = await fetch(`/api/superadmin/comunicacao/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      console.warn('[superadmin-comunicacao.deleteComunicado] API not available, using fallback');
    }
  } catch (error) { handleServiceError(error, 'superadmin-comunicacao.delete'); }
}
