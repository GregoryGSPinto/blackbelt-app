import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

export interface AccessResult {
  allowed: boolean;
  reason?: string;
  student_name: string;
  photo_url: string;
  belt: string;
  academy: string;
  membership_active: boolean;
}

export interface AccessEvent {
  id: string;
  student_id: string;
  student_name: string;
  photo_url: string;
  unit_id: string;
  timestamp: string;
  direction: 'entry' | 'exit';
  method: 'qr_code' | 'proximity' | 'manual';
  allowed: boolean;
  reason?: string;
}

export interface AccessRule {
  id: string;
  unit_id: string;
  name: string;
  type: 'allowed_hours' | 'max_daily_access' | 'block_overdue';
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface StudentCard {
  student_id: string;
  student_name: string;
  photo_url: string;
  belt: string;
  academy: string;
  unit: string;
  modalities: string[];
  member_since: string;
  membership_active: boolean;
  membership_expires: string;
  qr_code_token: string;
  qr_code_expires: string;
}

export async function validateAccess(studentId: string, unitId: string): Promise<AccessResult> {
  try {
    if (isMock()) {
      const { mockValidateAccess } = await import('@/lib/mocks/access-control.mock');
      return mockValidateAccess(studentId, unitId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Check student membership
    const { data: student, error } = await supabase
      .from('students')
      .select('id, display_name, photo_url, belt, academy_id, academies(name), memberships(status)')
      .eq('id', studentId)
      .single();

    if (error || !student) {
      logServiceError(error, 'access-control');
      return { allowed: false, reason: 'Aluno não encontrado', student_name: '', photo_url: '', belt: '', academy: '', membership_active: false };
    }

    const s = student as Record<string, unknown>;
    const academy = s.academies as Record<string, unknown> | null;
    const memberships = s.memberships as Array<Record<string, unknown>> | null;
    const active = memberships?.some(m => m.status === 'active') ?? false;

    // Log access event
    await supabase.from('access_events').insert({
      student_id: studentId,
      unit_id: unitId,
      direction: 'entry',
      method: 'qr_code',
      allowed: active,
      reason: active ? undefined : 'Matrícula inativa',
    });

    return {
      allowed: active,
      reason: active ? undefined : 'Matrícula inativa',
      student_name: (s.display_name as string) ?? '',
      photo_url: (s.photo_url as string) ?? '',
      belt: (s.belt as string) ?? '',
      academy: (academy?.name as string) ?? '',
      membership_active: active,
    };
  } catch (error) {
    logServiceError(error, 'access-control');
    return { allowed: false, reason: 'Erro ao validar acesso', student_name: '', photo_url: '', belt: '', academy: '', membership_active: false };
  }
}

export async function getAccessLog(unitId: string, date?: string): Promise<AccessEvent[]> {
  try {
    if (isMock()) {
      const { mockGetAccessLog } = await import('@/lib/mocks/access-control.mock');
      return mockGetAccessLog(unitId, date);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('access_events')
      .select('*, students(display_name, photo_url)')
      .eq('unit_id', unitId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (date) {
      query = query.gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59`);
    }

    const { data, error } = await query;

    if (error) {
      logServiceError(error, 'access-control');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => {
      const student = row.students as Record<string, unknown> | null;
      return {
        id: row.id as string,
        student_id: row.student_id as string,
        student_name: (student?.display_name as string) ?? '',
        photo_url: (student?.photo_url as string) ?? '',
        unit_id: row.unit_id as string,
        timestamp: row.created_at as string,
        direction: (row.direction as 'entry' | 'exit') ?? 'entry',
        method: (row.method as 'qr_code' | 'proximity' | 'manual') ?? 'manual',
        allowed: (row.allowed as boolean) ?? true,
        reason: row.reason as string | undefined,
      };
    });
  } catch (error) {
    logServiceError(error, 'access-control');
    return [];
  }
}

export async function configureAccessRules(unitId: string, rules: Partial<AccessRule>[]): Promise<AccessRule[]> {
  try {
    if (isMock()) {
      const { mockConfigureAccessRules } = await import('@/lib/mocks/access-control.mock');
      return mockConfigureAccessRules(unitId, rules);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const inserts = rules.map(r => ({ unit_id: unitId, name: r.name ?? '', type: r.type ?? 'allowed_hours', enabled: r.enabled ?? true, config: r.config ?? {} }));
    const { data, error } = await supabase
      .from('access_rules')
      .upsert(inserts, { onConflict: 'id' })
      .select();

    if (error) {
      logServiceError(error, 'access-control');
      return [];
    }
    return (data ?? []) as unknown as AccessRule[];
  } catch (error) {
    logServiceError(error, 'access-control');
    return [];
  }
}

export async function getAccessRules(unitId: string): Promise<AccessRule[]> {
  try {
    if (isMock()) {
      const { mockGetAccessRules } = await import('@/lib/mocks/access-control.mock');
      return mockGetAccessRules(unitId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('access_rules')
      .select('*')
      .eq('unit_id', unitId);

    if (error) {
      logServiceError(error, 'access-control');
      return [];
    }
    return (data ?? []) as unknown as AccessRule[];
  } catch (error) {
    logServiceError(error, 'access-control');
    return [];
  }
}

export async function getStudentCard(studentId: string): Promise<StudentCard> {
  try {
    if (isMock()) {
      const { mockGetStudentCard } = await import('@/lib/mocks/access-control.mock');
      return mockGetStudentCard(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('students')
      .select('id, display_name, photo_url, belt, academy_id, created_at, academies(name), memberships(status, expires_at), modalities:student_modalities(modality_name)')
      .eq('id', studentId)
      .single();

    if (error || !data) {
      logServiceError(error, 'access-control');
      return { student_id: studentId, student_name: '', photo_url: '', belt: '', academy: '', unit: '', modalities: [], member_since: '', membership_active: false, membership_expires: '', qr_code_token: '', qr_code_expires: '' };
    }

    const s = data as Record<string, unknown>;
    const academy = s.academies as Record<string, unknown> | null;
    const memberships = s.memberships as Array<Record<string, unknown>> | null;
    const activeMembership = memberships?.find(m => m.status === 'active');
    const mods = s.modalities as Array<Record<string, unknown>> | null;

    return {
      student_id: s.id as string,
      student_name: (s.display_name as string) ?? '',
      photo_url: (s.photo_url as string) ?? '',
      belt: (s.belt as string) ?? '',
      academy: (academy?.name as string) ?? '',
      unit: '',
      modalities: mods?.map(m => m.modality_name as string) ?? [],
      member_since: (s.created_at as string) ?? '',
      membership_active: !!activeMembership,
      membership_expires: (activeMembership?.expires_at as string) ?? '',
      qr_code_token: studentId,
      qr_code_expires: new Date(Date.now() + 3600000).toISOString(),
    };
  } catch (error) {
    logServiceError(error, 'access-control');
    return { student_id: studentId, student_name: '', photo_url: '', belt: '', academy: '', unit: '', modalities: [], member_since: '', membership_active: false, membership_expires: '', qr_code_token: '', qr_code_expires: '' };
  }
}
