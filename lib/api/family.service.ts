import { isMock } from '@/lib/env';
import type { Person, FamilyLink, FamilyRelationship } from '@/lib/types/domain';

// ────────────────────────────────────────────────────────────
// Helpers (DB → TS mapping)
// ────────────────────────────────────────────────────────────

function mapPersonFromDb(row: Record<string, unknown>): Person {
  return {
    id: row.id as string,
    accountId: (row.account_id as string) ?? null,
    fullName: row.full_name as string,
    cpf: (row.cpf as string) ?? null,
    birthDate: (row.birth_date as string) ?? null,
    phone: (row.phone as string) ?? null,
    email: (row.email as string) ?? null,
    gender: (row.gender as Person['gender']) ?? null,
    avatarUrl: (row.avatar_url as string) ?? null,
    medicalNotes: (row.medical_notes as string) ?? null,
    emergencyContactName: (row.emergency_contact_name as string) ?? null,
    emergencyContactPhone: (row.emergency_contact_phone as string) ?? null,
    createdAt: row.created_at as string,
  };
}

function mapFamilyLinkFromDb(row: Record<string, unknown>): FamilyLink {
  return {
    id: row.id as string,
    guardianPersonId: row.guardian_person_id as string,
    dependentPersonId: row.dependent_person_id as string,
    relationship: row.relationship as FamilyRelationship,
    isPrimaryGuardian: row.is_primary_guardian as boolean,
    isFinancialResponsible: row.is_financial_responsible as boolean,
    canAuthorizeEvents: row.can_authorize_events as boolean,
    receivesNotifications: row.receives_notifications as boolean,
    receivesBilling: row.receives_billing as boolean,
    notes: (row.notes as string) ?? null,
  };
}

// ────────────────────────────────────────────────────────────
// PERSON
// ────────────────────────────────────────────────────────────

export interface CreatePersonInput {
  fullName: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  cpf?: string;
  gender?: string;
  medicalNotes?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  accountId?: string;
}

export async function createPerson(data: CreatePersonInput): Promise<Person> {
  if (isMock()) {
    return {
      id: `person-${Date.now()}`,
      accountId: data.accountId ?? null,
      fullName: data.fullName,
      cpf: data.cpf ?? null,
      birthDate: data.birthDate ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      gender: (data.gender as Person['gender']) ?? null,
      avatarUrl: null,
      medicalNotes: data.medicalNotes ?? null,
      emergencyContactName: data.emergencyContactName ?? null,
      emergencyContactPhone: data.emergencyContactPhone ?? null,
      createdAt: new Date().toISOString(),
    };
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data: person, error } = await supabase
    .from('people')
    .insert({
      full_name: data.fullName,
      birth_date: data.birthDate,
      phone: data.phone,
      email: data.email,
      cpf: data.cpf,
      gender: data.gender,
      medical_notes: data.medicalNotes,
      emergency_contact_name: data.emergencyContactName,
      emergency_contact_phone: data.emergencyContactPhone,
      account_id: data.accountId,
    })
    .select()
    .single();

  if (error) {
    console.error('[createPerson] error:', error.message);
    throw new Error(error.message);
  }
  return mapPersonFromDb(person);
}

export async function getPersonByAccountId(accountId: string): Promise<Person | null> {
  if (isMock()) return null;

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('account_id', accountId)
    .maybeSingle();

  if (error) {
    console.error('[getPersonByAccountId] error:', error.message);
    return null;
  }
  return data ? mapPersonFromDb(data) : null;
}

export async function getPersonById(personId: string): Promise<Person | null> {
  if (isMock()) return null;

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('id', personId)
    .maybeSingle();

  if (error) {
    console.error('[getPersonById] error:', error.message);
    return null;
  }
  return data ? mapPersonFromDb(data) : null;
}

// ────────────────────────────────────────────────────────────
// FAMILY LINKS
// ────────────────────────────────────────────────────────────

export interface CreateFamilyLinkInput {
  guardianPersonId: string;
  dependentPersonId: string;
  relationship: FamilyRelationship;
  isPrimaryGuardian?: boolean;
  isFinancialResponsible?: boolean;
  canAuthorizeEvents?: boolean;
  receivesNotifications?: boolean;
  receivesBilling?: boolean;
}

export async function createFamilyLink(data: CreateFamilyLinkInput): Promise<FamilyLink> {
  if (isMock()) {
    return {
      id: `fl-${Date.now()}`,
      guardianPersonId: data.guardianPersonId,
      dependentPersonId: data.dependentPersonId,
      relationship: data.relationship,
      isPrimaryGuardian: data.isPrimaryGuardian ?? true,
      isFinancialResponsible: data.isFinancialResponsible ?? true,
      canAuthorizeEvents: data.canAuthorizeEvents ?? true,
      receivesNotifications: data.receivesNotifications ?? true,
      receivesBilling: data.receivesBilling ?? false,
      notes: null,
    };
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data: link, error } = await supabase
    .from('family_links')
    .insert({
      guardian_person_id: data.guardianPersonId,
      dependent_person_id: data.dependentPersonId,
      relationship: data.relationship,
      is_primary_guardian: data.isPrimaryGuardian ?? true,
      is_financial_responsible: data.isFinancialResponsible ?? true,
      can_authorize_events: data.canAuthorizeEvents ?? true,
      receives_notifications: data.receivesNotifications ?? true,
      receives_billing: data.receivesBilling ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error('[createFamilyLink] error:', error.message);
    throw new Error(error.message);
  }
  return mapFamilyLinkFromDb(link);
}

export interface GuardianInfo extends FamilyLink {
  guardianName: string;
  guardianPhone?: string;
  guardianEmail?: string;
}

export async function getGuardians(dependentPersonId: string): Promise<GuardianInfo[]> {
  if (isMock()) {
    return [
      {
        id: 'fl-mock-1',
        guardianPersonId: 'person-patricia',
        dependentPersonId,
        relationship: 'mae',
        isPrimaryGuardian: true,
        isFinancialResponsible: true,
        canAuthorizeEvents: true,
        receivesNotifications: true,
        receivesBilling: true,
        notes: null,
        guardianName: 'Patricia Oliveira',
        guardianPhone: '(31) 99876-5432',
        guardianEmail: 'patricia@email.com',
      },
    ];
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc('get_guardians', { p_dependent_id: dependentPersonId });

  if (error) {
    console.error('[getGuardians] error:', error.message);
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: '',
    guardianPersonId: row.guardian_id as string,
    dependentPersonId,
    relationship: row.relationship as FamilyRelationship,
    isPrimaryGuardian: row.is_primary as boolean,
    isFinancialResponsible: row.is_financial as boolean,
    canAuthorizeEvents: true,
    receivesNotifications: true,
    receivesBilling: row.is_financial as boolean,
    notes: null,
    guardianName: row.guardian_name as string,
    guardianPhone: (row.phone as string) ?? undefined,
    guardianEmail: (row.email as string) ?? undefined,
  }));
}

export interface DependentInfo extends Person {
  relationship: FamilyRelationship;
}

export async function getDependents(guardianPersonId: string): Promise<DependentInfo[]> {
  if (isMock()) {
    return [
      {
        id: 'person-sophia',
        accountId: null,
        fullName: 'Sophia Oliveira',
        cpf: null,
        birthDate: '2010-05-15',
        phone: null,
        email: null,
        gender: 'feminino',
        avatarUrl: null,
        medicalNotes: null,
        emergencyContactName: null,
        emergencyContactPhone: null,
        createdAt: '2025-01-01',
        relationship: 'mae',
      },
      {
        id: 'person-miguel',
        accountId: null,
        fullName: 'Miguel Pereira',
        cpf: null,
        birthDate: '2016-08-22',
        phone: null,
        email: null,
        gender: 'masculino',
        avatarUrl: null,
        medicalNotes: 'Alergia a amendoim',
        emergencyContactName: null,
        emergencyContactPhone: null,
        createdAt: '2025-03-01',
        relationship: 'mae',
      },
    ];
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc('get_dependents', { p_guardian_id: guardianPersonId });

  if (error) {
    console.error('[getDependents] error:', error.message);
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.dependent_id as string,
    accountId: null,
    fullName: row.dependent_name as string,
    cpf: null,
    birthDate: (row.birth_date as string) ?? null,
    phone: (row.phone as string) ?? null,
    email: (row.email as string) ?? null,
    gender: null,
    avatarUrl: null,
    medicalNotes: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    createdAt: '',
    relationship: row.relationship as FamilyRelationship,
  }));
}

// ────────────────────────────────────────────────────────────
// EVOLUCAO DE CICLO DE VIDA
// ────────────────────────────────────────────────────────────

export async function evolveProfile(data: {
  profileId: string;
  newRole: string;
  reason: string;
  createAuth?: boolean;
  email?: string;
  password?: string;
}): Promise<{ success: boolean; message: string }> {
  if (isMock()) {
    return { success: true, message: `Perfil evoluido para ${data.newRole}` };
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      role: data.newRole,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.profileId);

  if (error) {
    console.error('[evolveProfile] error:', error.message);
    throw new Error(error.message);
  }

  return { success: true, message: `Perfil evoluido para ${data.newRole}` };
}

// ────────────────────────────────────────────────────────────
// RESOLUCAO DE DESTINATARIOS (comunicacao por vinculo)
// ────────────────────────────────────────────────────────────

export interface ResolvedRecipient {
  personId: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  isGuardian: boolean;
}

export async function resolveRecipients(data: {
  targetType: 'turma' | 'modalidade' | 'aluno' | 'all';
  targetId?: string;
  academyId: string;
}): Promise<ResolvedRecipient[]> {
  if (isMock()) {
    return [
      { personId: 'p-1', name: 'Joao Silva', email: 'joao@email.com', phone: '(31)99999-0001', role: 'aluno_adulto', isGuardian: false },
      { personId: 'p-2', name: 'Patricia Oliveira', email: 'patricia@email.com', phone: '(31)99876-5432', role: 'responsavel', isGuardian: true },
      { personId: 'p-3', name: 'Carlos Mendes', email: 'carlos@email.com', phone: '(31)99888-1234', role: 'aluno_adulto', isGuardian: false },
    ];
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  // Buscar profiles da academia
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, role, display_name, person_id')
    .eq('academy_id', data.academyId);

  if (error) {
    console.error('[resolveRecipients] error:', error.message);
    return [];
  }

  const recipients: ResolvedRecipient[] = [];

  for (const profile of profiles ?? []) {
    const role = profile.role as string;

    // Se e kids ou teen, buscar responsaveis
    if ((role === 'aluno_kids' || role === 'aluno_teen') && profile.person_id) {
      const guardians = await getGuardians(profile.person_id as string);
      for (const g of guardians) {
        if (g.receivesNotifications) {
          recipients.push({
            personId: g.guardianPersonId,
            name: g.guardianName,
            email: g.guardianEmail,
            phone: g.guardianPhone,
            role: 'responsavel',
            isGuardian: true,
          });
        }
      }
      // Teen tambem recebe se configurado
      if (role === 'aluno_teen') {
        recipients.push({
          personId: (profile.person_id as string) || (profile.id as string),
          name: profile.display_name as string,
          role: 'aluno_teen',
          isGuardian: false,
        });
      }
    } else {
      // Adulto recebe diretamente
      recipients.push({
        personId: (profile.person_id as string) || (profile.id as string),
        name: profile.display_name as string,
        role,
        isGuardian: false,
      });
    }
  }

  // Deduplicar por personId
  const unique = new Map<string, ResolvedRecipient>();
  for (const r of recipients) {
    if (!unique.has(r.personId)) unique.set(r.personId, r);
  }

  return Array.from(unique.values());
}
