import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('devedores')
      .select('*')
      .eq('academy_id', academyId)
      .order('dias_atraso', { ascending: false });

    if (error || !data) {
      console.warn('[getDevedores] Supabase error:', error?.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      alunoId: String(row.aluno_id ?? ''),
      alunoNome: String(row.aluno_nome ?? ''),
      alunoAvatar: row.aluno_avatar ? String(row.aluno_avatar) : undefined,
      alunoTelefone: String(row.aluno_telefone ?? ''),
      alunoEmail: String(row.aluno_email ?? ''),
      valorDevido: Number(row.valor_devido ?? 0),
      diasAtraso: Number(row.dias_atraso ?? 0),
      ultimoPagamento: String(row.ultimo_pagamento ?? ''),
      plano: String(row.plano ?? ''),
      ultimoContato: row.ultimo_contato ? (row.ultimo_contato as Devedor['ultimoContato']) : undefined,
      statusCobranca: (row.status_cobranca ?? 'pendente') as StatusCobranca,
    }));
  } catch (error) {
    console.warn('[getDevedores] Fallback:', error);
    return [];
  }
}

export async function getInadimplenciaMetrics(academyId: string): Promise<InadimplenciaMetrics> {
  try {
    if (isMock()) {
      const { mockGetInadimplenciaMetrics } = await import('@/lib/mocks/inadimplencia.mock');
      return mockGetInadimplenciaMetrics(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('devedores')
      .select('valor_devido, dias_atraso')
      .eq('academy_id', academyId);

    if (error || !data) {
      console.warn('[getInadimplenciaMetrics] Supabase error:', error?.message);
      return { totalDevedores: 0, valorTotalDevido: 0, mediaAtraso: 0, recuperadoMes: 0 };
    }

    const rows = data as Record<string, unknown>[];
    const total = rows.length;
    const valorTotal = rows.reduce((acc, r) => acc + Number(r.valor_devido ?? 0), 0);
    const mediaAtraso = total > 0 ? Math.round(rows.reduce((acc, r) => acc + Number(r.dias_atraso ?? 0), 0) / total) : 0;

    return { totalDevedores: total, valorTotalDevido: valorTotal, mediaAtraso, recuperadoMes: 0 };
  } catch (error) {
    console.warn('[getInadimplenciaMetrics] Fallback:', error);
    return { totalDevedores: 0, valorTotalDevido: 0, mediaAtraso: 0, recuperadoMes: 0 };
  }
}

export async function registrarContato(devedorId: string, tipo: ContatoTipo, resultado: ContatoResultado, observacao: string): Promise<ContatoRegistro> {
  try {
    if (isMock()) {
      const { mockRegistrarContato } = await import('@/lib/mocks/inadimplencia.mock');
      return mockRegistrarContato(devedorId, tipo, resultado, observacao);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('contatos_cobranca')
      .insert({ devedor_id: devedorId, tipo, resultado, observacao })
      .select()
      .single();

    if (error || !data) {
      console.warn('[registrarContato] Supabase error:', error?.message);
      return { id: '', devedorId, tipo, resultado, observacao, data: new Date().toISOString() };
    }

    return {
      id: String(data.id),
      devedorId: String(data.devedor_id ?? devedorId),
      tipo: (data.tipo ?? tipo) as ContatoTipo,
      resultado: (data.resultado ?? resultado) as ContatoResultado,
      observacao: String(data.observacao ?? ''),
      data: String(data.created_at ?? new Date().toISOString()),
    };
  } catch (error) {
    console.warn('[registrarContato] Fallback:', error);
    return { id: '', devedorId, tipo, resultado, observacao, data: new Date().toISOString() };
  }
}

export async function getHistoricoContatos(devedorId: string): Promise<ContatoRegistro[]> {
  try {
    if (isMock()) {
      const { mockGetHistoricoContatos } = await import('@/lib/mocks/inadimplencia.mock');
      return mockGetHistoricoContatos(devedorId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('contatos_cobranca')
      .select('*')
      .eq('devedor_id', devedorId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('[getHistoricoContatos] Supabase error:', error?.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      devedorId: String(row.devedor_id ?? ''),
      tipo: (row.tipo ?? 'whatsapp') as ContatoTipo,
      resultado: (row.resultado ?? 'sem_resposta') as ContatoResultado,
      observacao: String(row.observacao ?? ''),
      data: String(row.created_at ?? ''),
    }));
  } catch (error) {
    console.warn('[getHistoricoContatos] Fallback:', error);
    return [];
  }
}
