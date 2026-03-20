import { isMock } from '@/lib/env';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface Autorizacao {
  id: string;
  student_id: string;
  student_name: string;
  type: 'evento' | 'viagem' | 'foto' | 'saida_sozinho' | 'contato_emergencia';
  title: string;
  description: string;
  status: 'pendente' | 'autorizado' | 'negado';
  requested_at: string;
  responded_at: string | null;
}

export interface ParentalPermission {
  key: string;
  label: string;
  enabled: boolean;
  description: string;
}

export interface ControleParental {
  student_id: string;
  student_name: string;
  permissions: ParentalPermission[];
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getAutorizacoes(guardianId: string): Promise<Autorizacao[]> {
  try {
    if (isMock()) {
      const { mockGetAutorizacoes } = await import('@/lib/mocks/responsavel-autorizacoes.mock');
      return mockGetAutorizacoes(guardianId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('authorizations')
      .select('*, students!inner(display_name)')
      .eq('guardian_id', guardianId)
      .order('requested_at', { ascending: false });

    if (error) {
      console.warn('[getAutorizacoes] error:', error.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => {
      const student = row.students as Record<string, unknown> | null;
      return {
        id: row.id as string,
        student_id: row.student_id as string,
        student_name: (student?.display_name as string) ?? '',
        type: row.type as Autorizacao['type'],
        title: row.title as string,
        description: row.description as string,
        status: row.status as Autorizacao['status'],
        requested_at: row.requested_at as string,
        responded_at: (row.responded_at as string) ?? null,
      };
    });
  } catch (error) {
    console.warn('[getAutorizacoes] Fallback:', error);
    return [];
  }
}

export async function respondAutorizacao(
  id: string,
  status: 'autorizado' | 'negado',
): Promise<Autorizacao> {
  try {
    if (isMock()) {
      const { mockRespondAutorizacao } = await import('@/lib/mocks/responsavel-autorizacoes.mock');
      return mockRespondAutorizacao(id, status);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('authorizations')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, students!inner(display_name)')
      .single();

    if (error) {
      console.warn('[respondAutorizacao] error:', error.message);
      return {} as Autorizacao;
    }

    const student = (data as Record<string, unknown>).students as Record<string, unknown> | null;
    return {
      id: data.id,
      student_id: data.student_id,
      student_name: (student?.display_name as string) ?? '',
      type: data.type,
      title: data.title,
      description: data.description,
      status: data.status,
      requested_at: data.requested_at,
      responded_at: data.responded_at,
    } as Autorizacao;
  } catch (error) {
    console.warn('[respondAutorizacao] Fallback:', error);
    return {} as Autorizacao;
  }
}

export async function getControleParental(studentId: string): Promise<ControleParental> {
  try {
    if (isMock()) {
      const { mockGetControleParental } = await import('@/lib/mocks/responsavel-autorizacoes.mock');
      return mockGetControleParental(studentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, display_name')
      .eq('id', studentId)
      .single();

    if (studentError) {
      console.warn('[getControleParental] error fetching student:', studentError.message);
      return { student_id: studentId, student_name: '', permissions: [] };
    }

    const { data: perms, error: permsError } = await supabase
      .from('parental_permissions')
      .select('*')
      .eq('student_id', studentId);

    if (permsError) {
      console.warn('[getControleParental] error fetching permissions:', permsError.message);
    }

    const permissions: ParentalPermission[] = (perms ?? []).map((p: Record<string, unknown>) => ({
      key: p.key as string,
      label: p.label as string,
      enabled: p.enabled as boolean,
      description: p.description as string,
    }));

    return {
      student_id: studentId,
      student_name: (student as Record<string, unknown>)?.display_name as string ?? '',
      permissions,
    };
  } catch (error) {
    console.warn('[getControleParental] Fallback:', error);
    return { student_id: studentId, student_name: '', permissions: [] };
  }
}

export async function updatePermission(
  studentId: string,
  key: string,
  enabled: boolean,
): Promise<void> {
  try {
    if (isMock()) {
      const { mockUpdatePermission } = await import('@/lib/mocks/responsavel-autorizacoes.mock');
      return mockUpdatePermission(studentId, key, enabled);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('parental_permissions')
      .update({ enabled })
      .eq('student_id', studentId)
      .eq('key', key);

    if (error) {
      console.warn('[updatePermission] error:', error.message);
    }
  } catch (error) {
    console.warn('[updatePermission] Fallback:', error);
  }
}
