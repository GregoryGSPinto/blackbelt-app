import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type StatusCobranca = 'pendente' | 'contatado' | 'negociando' | 'promessa' | 'perdido';
export type ContatoTipo = 'ligacao' | 'whatsapp' | 'email' | 'presencial';
export type ContatoResultado = 'sem_resposta' | 'negociando' | 'promessa_pagamento' | 'recusa';

export interface Devedor {
  id: string;
  alunoId: string;
  alunoNome: string;
  alunoAvatar?: string;
  alunoTelefone: string;
  alunoEmail: string;
  valorDevido: number;
  diasAtraso: number;
  ultimoPagamento: string;
  plano: string;
  ultimoContato?: { data: string; tipo: string; resultado: string };
  statusCobranca: StatusCobranca;
}

export interface InadimplenciaMetrics {
  totalDevedores: number;
  valorTotalDevido: number;
  mediaAtraso: number;
  recuperadoMes: number;
}

export interface ContatoRegistro {
  id: string;
  devedorId: string;
  tipo: ContatoTipo;
  resultado: ContatoResultado;
  observacao: string;
  data: string;
}

export async function getDevedores(academyId: string): Promise<Devedor[]> {
  try {
    if (isMock()) {
      const { mockGetDevedores } = await import('@/lib/mocks/inadimplencia.mock');
      return mockGetDevedores(academyId);
    }
    // API not yet implemented — use mock
    const { mockGetDevedores } = await import('@/lib/mocks/inadimplencia.mock');
      return mockGetDevedores(academyId);
  } catch (error) { handleServiceError(error, 'inadimplencia.devedores'); }
}

export async function getInadimplenciaMetrics(academyId: string): Promise<InadimplenciaMetrics> {
  try {
    if (isMock()) {
      const { mockGetInadimplenciaMetrics } = await import('@/lib/mocks/inadimplencia.mock');
      return mockGetInadimplenciaMetrics(academyId);
    }
    // API not yet implemented — use mock
    const { mockGetInadimplenciaMetrics } = await import('@/lib/mocks/inadimplencia.mock');
      return mockGetInadimplenciaMetrics(academyId);
  } catch (error) { handleServiceError(error, 'inadimplencia.metrics'); }
}

export async function registrarContato(devedorId: string, tipo: ContatoTipo, resultado: ContatoResultado, observacao: string): Promise<ContatoRegistro> {
  try {
    if (isMock()) {
      const { mockRegistrarContato } = await import('@/lib/mocks/inadimplencia.mock');
      return mockRegistrarContato(devedorId, tipo, resultado, observacao);
    }
    try {
      const res = await fetch(`/api/inadimplencia/${devedorId}/contato`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo, resultado, observacao }) });
      if (!res.ok) throw new ServiceError(res.status, 'inadimplencia.contato');
      return res.json();
    } catch {
      console.warn('[inadimplencia.registrarContato] API not available, using mock fallback');
      const { mockRegistrarContato } = await import('@/lib/mocks/inadimplencia.mock');
      return mockRegistrarContato(devedorId, tipo, resultado, observacao);
    }
  } catch (error) { handleServiceError(error, 'inadimplencia.contato'); }
}

export async function getHistoricoContatos(devedorId: string): Promise<ContatoRegistro[]> {
  try {
    if (isMock()) {
      const { mockGetHistoricoContatos } = await import('@/lib/mocks/inadimplencia.mock');
      return mockGetHistoricoContatos(devedorId);
    }
    // API not yet implemented — use mock
    const { mockGetHistoricoContatos } = await import('@/lib/mocks/inadimplencia.mock');
      return mockGetHistoricoContatos(devedorId);
  } catch (error) { handleServiceError(error, 'inadimplencia.historico'); }
}
