# BLACKBELT v2 — MEGA PROMPT DE USABILIDADE
## Implementação dos 28 Gaps Identificados na Auditoria
## Ordem: Fundação → Família → Permissões → Cadastro → Comunicação → Polimento

> **INSTRUÇÕES DE EXECUÇÃO:**
> - Execute SEÇÃO a SEÇÃO, na ordem (S1 → S2 → ... → S10)
> - Cada SEÇÃO termina com: `pnpm typecheck && pnpm build` → commit → push
> - NÃO pule nenhuma seção. NÃO avance se o build falhar.
> - Preservar `isMock()` em TODOS os services — bloco mock e bloco real coexistem
> - Preservar `handleServiceError` em todos os catch blocks
> - CSS: `var(--bb-*)` — zero cores hardcoded
> - Nomes brasileiros nos mocks
> - PT-BR em todos os textos, toasts, labels
> - Tempo estimado: 6-10 horas de execução contínua

---

## SEÇÃO 1 — FUNDAÇÃO: Entidade Person + FamilyLink (DEPENDÊNCIA DE TUDO)

A auditoria identificou que o modelo atual é Profile → user_id (Auth). Não existe camada "Pessoa" separada. Isso impede pessoa sem conta (kids sem email), vínculo familiar, e cobrança por família.

### 1A. Criar migration para tabela `people`

Arquivo: `supabase/migrations/070_people_table.sql`

```sql
-- Tabela: people (pessoa física — pode ou não ter conta Auth)
CREATE TABLE IF NOT EXISTS people (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- nullable: kids não tem conta
  full_name VARCHAR(200) NOT NULL,
  cpf VARCHAR(14) UNIQUE, -- formato 000.000.000-00, nullable
  birth_date DATE,
  phone VARCHAR(20),
  email VARCHAR(255), -- pode diferir do email da conta Auth
  gender VARCHAR(20) CHECK (gender IN ('masculino', 'feminino', 'outro', 'nao_informado')),
  avatar_url TEXT,
  medical_notes TEXT, -- alergias, condições médicas
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_people_account ON people(account_id);
CREATE INDEX idx_people_cpf ON people(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_people_email ON people(email) WHERE email IS NOT NULL;
CREATE INDEX idx_people_phone ON people(phone) WHERE phone IS NOT NULL;

ALTER TABLE people ENABLE ROW LEVEL SECURITY;
```

### 1B. Criar migration para tabela `family_links`

Arquivo: `supabase/migrations/071_family_links.sql`

```sql
-- Tabela: family_links (vínculo familiar entre pessoas)
CREATE TABLE IF NOT EXISTS family_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  dependent_person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  relationship VARCHAR(30) NOT NULL CHECK (relationship IN (
    'pai', 'mae', 'avo', 'avo_materna', 'tio', 'tia',
    'padrasto', 'madrasta', 'responsavel_legal', 'outro'
  )),
  is_primary_guardian BOOLEAN DEFAULT false,
  is_financial_responsible BOOLEAN DEFAULT false,
  can_authorize_events BOOLEAN DEFAULT true,
  receives_notifications BOOLEAN DEFAULT true,
  receives_billing BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(guardian_person_id, dependent_person_id)
);

CREATE INDEX idx_family_links_guardian ON family_links(guardian_person_id);
CREATE INDEX idx_family_links_dependent ON family_links(dependent_person_id);

ALTER TABLE family_links ENABLE ROW LEVEL SECURITY;

-- Helper: dado um person_id de criança, retorna os responsáveis
CREATE OR REPLACE FUNCTION get_guardians(p_dependent_id UUID)
RETURNS TABLE(
  guardian_id UUID,
  guardian_name VARCHAR,
  relationship VARCHAR,
  is_primary BOOLEAN,
  is_financial BOOLEAN,
  phone VARCHAR,
  email VARCHAR
) AS $$
  SELECT
    p.id, p.full_name, fl.relationship,
    fl.is_primary_guardian, fl.is_financial_responsible,
    p.phone, p.email
  FROM family_links fl
  JOIN people p ON p.id = fl.guardian_person_id
  WHERE fl.dependent_person_id = p_dependent_id
  ORDER BY fl.is_primary_guardian DESC;
$$ LANGUAGE sql STABLE;

-- Helper: dado um person_id de responsável, retorna os dependentes
CREATE OR REPLACE FUNCTION get_dependents(p_guardian_id UUID)
RETURNS TABLE(
  dependent_id UUID,
  dependent_name VARCHAR,
  birth_date DATE,
  relationship VARCHAR,
  phone VARCHAR,
  email VARCHAR
) AS $$
  SELECT
    p.id, p.full_name, p.birth_date,
    fl.relationship, p.phone, p.email
  FROM family_links fl
  JOIN people p ON p.id = fl.dependent_person_id
  WHERE fl.guardian_person_id = p_guardian_id
  ORDER BY p.birth_date ASC;
$$ LANGUAGE sql STABLE;
```

### 1C. Adicionar coluna person_id à tabela profiles

Arquivo: `supabase/migrations/072_profiles_person_id.sql`

```sql
-- Adicionar referência de profiles → people
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS person_id UUID REFERENCES people(id);
CREATE INDEX IF NOT EXISTS idx_profiles_person ON profiles(person_id) WHERE person_id IS NOT NULL;

-- Adicionar status lifecycle completo
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_status') THEN
    CREATE TYPE profile_status AS ENUM ('draft', 'pending', 'invited', 'active', 'suspended', 'archived');
  END IF;
END $$;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lifecycle_status profile_status DEFAULT 'active';

-- Adicionar campo de controle parental
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parental_controls JSONB DEFAULT '{}';
-- Formato: { "can_change_email": false, "can_change_password": false, "is_suspended": false, "suspended_until": null, "suspended_reason": null }
```

### 1D. Criar types TypeScript

Abrir `lib/types/domain.ts`. ADICIONAR (não substituir os types existentes):

```typescript
// === PESSOA FÍSICA ===
export interface Person {
  id: string;
  accountId?: string | null;
  fullName: string;
  cpf?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  email?: string | null;
  gender?: 'masculino' | 'feminino' | 'outro' | 'nao_informado' | null;
  avatarUrl?: string | null;
  medicalNotes?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  createdAt: string;
}

// === VÍNCULO FAMILIAR ===
export type FamilyRelationship = 'pai' | 'mae' | 'avo' | 'avo_materna' | 'tio' | 'tia' | 'padrasto' | 'madrasta' | 'responsavel_legal' | 'outro';

export interface FamilyLink {
  id: string;
  guardianPersonId: string;
  dependentPersonId: string;
  relationship: FamilyRelationship;
  isPrimaryGuardian: boolean;
  isFinancialResponsible: boolean;
  canAuthorizeEvents: boolean;
  receivesNotifications: boolean;
  receivesBilling: boolean;
  notes?: string | null;
}

// === STATUS DO PERFIL ===
export type ProfileLifecycleStatus = 'draft' | 'pending' | 'invited' | 'active' | 'suspended' | 'archived';

// === CONTROLE PARENTAL ===
export interface ParentalControlConfig {
  canChangeEmail: boolean;
  canChangePassword: boolean;
  canViewFinancial: boolean;
  canSendMessages: boolean;
  canSelfCheckin: boolean;
  isSuspended: boolean;
  suspendedUntil?: string | null;
  suspendedReason?: string | null;
}

// === AUTONOMIA DO TEEN (configurável por academia) ===
export interface TeenAutonomyConfig {
  canViewSchedule: boolean;
  canSelfCheckin: boolean;
  canReceiveDirectNotifications: boolean;
  canViewPayments: boolean;
  canEditPersonalData: boolean;
  canParticipateGeneralRanking: boolean;
}
```

### 1E. Criar service de pessoas e famílias

Arquivo: `lib/api/family.service.ts`

```typescript
import { isMock } from '@/lib/utils/mock';
import { handleServiceError } from '@/lib/utils/error';
import type { Person, FamilyLink, FamilyRelationship } from '@/lib/types/domain';

// === PERSON ===

export async function createPerson(data: {
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
}): Promise<Person> {
  if (isMock()) {
    return {
      id: `person-${Date.now()}`,
      accountId: data.accountId || null,
      fullName: data.fullName,
      cpf: data.cpf || null,
      birthDate: data.birthDate || null,
      phone: data.phone || null,
      email: data.email || null,
      gender: (data.gender as Person['gender']) || null,
      avatarUrl: null,
      medicalNotes: data.medicalNotes || null,
      emergencyContactName: data.emergencyContactName || null,
      emergencyContactPhone: data.emergencyContactPhone || null,
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
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

    if (error) throw error;
    return mapPersonFromDb(person);
  } catch (error) {
    throw handleServiceError(error, 'createPerson');
  }
}

export async function getPersonByAccountId(accountId: string): Promise<Person | null> {
  if (isMock()) return null;

  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('account_id', accountId)
      .maybeSingle();

    if (error) throw error;
    return data ? mapPersonFromDb(data) : null;
  } catch (error) {
    throw handleServiceError(error, 'getPersonByAccountId');
  }
}

// === FAMILY LINKS ===

export async function createFamilyLink(data: {
  guardianPersonId: string;
  dependentPersonId: string;
  relationship: FamilyRelationship;
  isPrimaryGuardian?: boolean;
  isFinancialResponsible?: boolean;
  canAuthorizeEvents?: boolean;
  receivesNotifications?: boolean;
  receivesBilling?: boolean;
}): Promise<FamilyLink> {
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

  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
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

    if (error) throw error;
    return mapFamilyLinkFromDb(link);
  } catch (error) {
    throw handleServiceError(error, 'createFamilyLink');
  }
}

export async function getGuardians(dependentPersonId: string): Promise<(FamilyLink & { guardianName: string; guardianPhone?: string; guardianEmail?: string })[]> {
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
        guardianName: 'Patrícia Oliveira',
        guardianPhone: '(31) 99876-5432',
        guardianEmail: 'patricia@email.com',
      },
    ];
  }

  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_guardians', { p_dependent_id: dependentPersonId });
    if (error) throw error;
    return (data || []).map((row: Record<string, unknown>) => ({
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
      guardianPhone: row.phone as string | undefined,
      guardianEmail: row.email as string | undefined,
    }));
  } catch (error) {
    throw handleServiceError(error, 'getGuardians');
  }
}

export async function getDependents(guardianPersonId: string): Promise<(Person & { relationship: FamilyRelationship })[]> {
  if (isMock()) {
    return [
      {
        id: 'person-sophia',
        accountId: null,
        fullName: 'Sophia Oliveira',
        cpf: null,
        birthDate: '2010-05-15',
        phone: null,
        email: 'sophia@email.com',
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

  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_dependents', { p_guardian_id: guardianPersonId });
    if (error) throw error;
    return (data || []).map((row: Record<string, unknown>) => ({
      id: row.dependent_id as string,
      accountId: null,
      fullName: row.dependent_name as string,
      cpf: null,
      birthDate: row.birth_date as string | null,
      phone: row.phone as string | null,
      email: row.email as string | null,
      gender: null,
      avatarUrl: null,
      medicalNotes: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      createdAt: '',
      relationship: row.relationship as FamilyRelationship,
    }));
  } catch (error) {
    throw handleServiceError(error, 'getDependents');
  }
}

// === EVOLUÇÃO DE CICLO DE VIDA ===

export async function evolveProfile(data: {
  profileId: string;
  newRole: string;
  reason: string;
  createAuth?: boolean; // true quando Kids→Teen precisa de login
  email?: string;
  password?: string;
}): Promise<{ success: boolean; message: string }> {
  if (isMock()) {
    return { success: true, message: `Perfil evoluído para ${data.newRole}` };
  }

  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    // Atualizar role do perfil
    const { error } = await supabase
      .from('profiles')
      .update({
        role: data.newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.profileId);

    if (error) throw error;

    // Se Kids→Teen e precisa criar auth
    if (data.createAuth && data.email && data.password) {
      // Criar entrada no Auth (admin API via edge function)
      // TODO: implementar edge function para admin.createUser
    }

    return { success: true, message: `Perfil evoluído para ${data.newRole}` };
  } catch (error) {
    throw handleServiceError(error, 'evolveProfile');
  }
}

// === RESOLUÇÃO DE DESTINATÁRIOS (comunicação por vínculo) ===

export async function resolveRecipients(data: {
  targetType: 'turma' | 'modalidade' | 'aluno' | 'all';
  targetId?: string;
  academyId: string;
}): Promise<{ personId: string; name: string; email?: string; phone?: string; role: string; isGuardian: boolean }[]> {
  if (isMock()) {
    return [
      { personId: 'p-1', name: 'João Silva', email: 'joao@email.com', phone: '(31)99999-0001', role: 'aluno_adulto', isGuardian: false },
      { personId: 'p-2', name: 'Patrícia Oliveira', email: 'patricia@email.com', phone: '(31)99876-5432', role: 'responsavel', isGuardian: true },
    ];
  }

  try {
    // Na implementação real:
    // 1. Buscar alunos do target (turma/modalidade/all)
    // 2. Para cada aluno Kids/Teen: substituir/adicionar responsável(is)
    // 3. Deduplicar (mesmo responsável de 2 filhos = 1 notificação)
    // 4. Retornar lista final
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    // Buscar profiles da turma/academia
    let query = supabase.from('profiles').select('*, people(*)').eq('academy_id', data.academyId);

    if (data.targetType === 'turma' && data.targetId) {
      // Join com enrollments
      query = query.eq('enrollments.class_id', data.targetId);
    }

    const { data: profiles, error } = await query;
    if (error) throw error;

    const recipients: { personId: string; name: string; email?: string; phone?: string; role: string; isGuardian: boolean }[] = [];

    for (const profile of profiles || []) {
      const role = profile.role as string;

      // Se é kids ou teen menor, buscar responsáveis
      if (role === 'aluno_kids' || role === 'aluno_teen') {
        if (profile.person_id) {
          const guardians = await getGuardians(profile.person_id);
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
        }
        // Teen também recebe se tiver notificação direta habilitada
        if (role === 'aluno_teen') {
          recipients.push({
            personId: profile.person_id || profile.id,
            name: profile.display_name,
            email: profile.email,
            phone: profile.phone,
            role: 'aluno_teen',
            isGuardian: false,
          });
        }
      } else {
        // Adulto recebe diretamente
        recipients.push({
          personId: profile.person_id || profile.id,
          name: profile.display_name,
          email: profile.email,
          phone: profile.phone,
          role,
          isGuardian: false,
        });
      }
    }

    // Deduplicar por personId
    const unique = new Map<string, typeof recipients[0]>();
    for (const r of recipients) {
      if (!unique.has(r.personId)) unique.set(r.personId, r);
    }

    return Array.from(unique.values());
  } catch (error) {
    throw handleServiceError(error, 'resolveRecipients');
  }
}

// === HELPERS ===

function mapPersonFromDb(row: Record<string, unknown>): Person {
  return {
    id: row.id as string,
    accountId: row.account_id as string | null,
    fullName: row.full_name as string,
    cpf: row.cpf as string | null,
    birthDate: row.birth_date as string | null,
    phone: row.phone as string | null,
    email: row.email as string | null,
    gender: row.gender as Person['gender'],
    avatarUrl: row.avatar_url as string | null,
    medicalNotes: row.medical_notes as string | null,
    emergencyContactName: row.emergency_contact_name as string | null,
    emergencyContactPhone: row.emergency_contact_phone as string | null,
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
    notes: row.notes as string | null,
  };
}
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: add Person entity, FamilyLink, evolveProfile, resolveRecipients — usability foundation`

---

## SEÇÃO 2 — RESPONSÁVEL CRIA KIDS + TEEN

### 2A. Componente AddChildForm

Criar `components/parent/AddChildForm.tsx`:

Formulário "Adicionar Filho" com:
- Nome completo (obrigatório)
- Data de nascimento (obrigatório, valida: 5-17 anos)
- Gênero (opcional: masculino/feminino/outro/não informado)
- Observações médicas / alergias (textarea, opcional)
- Contato de emergência (nome + telefone, opcional)
- Turma desejada (dropdown com turmas Kids ou Teen da academia, baseado na idade)
- Parentesco (dropdown: pai, mãe, avô, responsável legal, etc)

**Lógica de idade:**
- 5-12 anos → `role: 'aluno_kids'`, NÃO mostra campos de email/senha
- 13-17 anos → `role: 'aluno_teen'`, mostra toggle "Meu filho terá login próprio?"
  - Se sim → mostra email + senha (pai define)
  - Se não → funciona como Kids (acesso pelo app do pai)
- <5 ou >17 → mensagem "Idade fora da faixa para cadastro de dependente"

**Ao submeter (mock mode):**
```typescript
import { createPerson, createFamilyLink } from '@/lib/api/family.service';

const person = await createPerson({
  fullName: form.name,
  birthDate: form.birthDate,
  gender: form.gender,
  medicalNotes: form.medicalNotes,
  emergencyContactName: form.emergencyContact?.name,
  emergencyContactPhone: form.emergencyContact?.phone,
});

const link = await createFamilyLink({
  guardianPersonId: currentUser.personId, // do AuthContext
  dependentPersonId: person.id,
  relationship: form.relationship,
  isPrimaryGuardian: true,
  isFinancialResponsible: true,
});

toast.success(`${form.name} cadastrado com sucesso!`);
```

### 2B. Página /parent/filhos/novo

Criar `app/(parent)/parent/filhos/novo/page.tsx`:
- Header: "Adicionar Filho"
- Renderiza `<AddChildForm />`
- Botão voltar para `/parent/configuracoes`
- Sucesso redireciona para `/parent` com toast

### 2C. Botão "Adicionar Filho" no painel do responsável

Em `app/(parent)/parent/configuracoes/page.tsx`, na tab "Meus Filhos":
- Adicionar botão "➕ Adicionar Filho" que navega para `/parent/filhos/novo`
- Abaixo da lista de filhos existentes

Em `app/(parent)/parent/page.tsx` (dashboard):
- Adicionar card de ação rápida "Adicionar Filho" se o responsável tem <5 filhos

### 2D. Seletor de dependente no Responsável

Criar `components/parent/DependentSelector.tsx`:
- Dropdown ou tabs horizontais com nome + avatar de cada filho
- Ao selecionar, atualiza contexto `activeDependentId` no AuthContext ou contexto local
- Mostra indicador visual de qual filho está selecionado
- Se tem 1 filho, mostra fixo sem dropdown
- Se tem 2+, mostra seletor

Integrar no `components/shell/ParentShell.tsx` (ou equivalente):
- Posicionar logo abaixo do header
- Todas as páginas do responsável que mostram dados de filho devem respeitar o `activeDependentId`

### 2E. Controle parental para Teen

Criar `components/parent/ParentalControlPanel.tsx`:
- Toggles por filho teen:
  - Pode alterar email: ✅/❌
  - Pode alterar senha: ✅/❌
  - Pode ver financeiro: ✅/❌
  - Pode enviar mensagens: ✅/❌
  - Pode fazer check-in sozinho: ✅/❌
  - Suspender acesso temporariamente: toggle + data limite + motivo
- Salvar no campo `parental_controls` JSONB do profile do teen

Adicionar na página `/parent/configuracoes` como tab "Controle Parental" (visível apenas se tem filho teen).

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: add child creation flow, dependent selector, parental controls for teen`

---

## SEÇÃO 3 — AUTONOMIA DO TEEN CONFIGURÁVEL POR ACADEMIA

### 3A. Configuração por academia

Criar `lib/api/academy-settings.service.ts` (ou adicionar ao service existente):

```typescript
export interface AcademyTeenConfig {
  teenCanViewSchedule: boolean;
  teenCanSelfCheckin: boolean;
  teenCanReceiveDirectNotifications: boolean;
  teenCanViewPayments: boolean;
  teenCanEditPersonalData: boolean;
  teenCanParticipateGeneralRanking: boolean;
}

export const DEFAULT_TEEN_CONFIG: AcademyTeenConfig = {
  teenCanViewSchedule: true,
  teenCanSelfCheckin: true,
  teenCanReceiveDirectNotifications: true,
  teenCanViewPayments: false,
  teenCanEditPersonalData: false,
  teenCanParticipateGeneralRanking: false,
};

export async function getTeenConfig(academyId: string): Promise<AcademyTeenConfig> { ... }
export async function updateTeenConfig(academyId: string, config: Partial<AcademyTeenConfig>): Promise<AcademyTeenConfig> { ... }
```

### 3B. Página de configuração no Admin

Em `/admin/configuracoes` (ou criar subpágina `/admin/configuracoes/teen`):
- Seção "Permissões de Adolescentes"
- Toggles para cada item do AcademyTeenConfig
- Descrições claras: "Permitir que adolescentes façam check-in sem a presença do responsável"

### 3C. Aplicar permissões no TeenShell

No `components/shell/TeenShell.tsx`:
- Carregar `getTeenConfig(academyId)` + `parental_controls` do profile
- Combinar: a permissão mais restritiva vence (academia OU pai bloqueou = bloqueado)
- Esconder/desabilitar itens do menu/sidebar conforme permissões
- Tooltip nos itens bloqueados: "Seu responsável ou a academia limitou esta funcionalidade"

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: teen autonomy config per academy + parental control merge`

---

## SEÇÃO 4 — CADASTRO "CRIAR FAMÍLIA" (wizard)

### 4A. Componente CreateFamilyWizard

Criar `components/admin/CreateFamilyWizard.tsx`:

Stepper de 6 etapas com barra de progresso:

**Step 1 — Responsável**
- Nome, email, telefone, CPF (opcional)
- Parentesco padrão: "Pai" ou "Mãe" (dropdown)
- Checkbox "Este responsável também é aluno" (se sim, cria perfil aluno junto)

**Step 2 — Dependente 1**
- Nome, data nascimento
- Sistema calcula idade e mostra role automático: "Kids (9 anos)" ou "Teen (15 anos)"
- Se Teen: toggle "Terá login próprio?" + campos email/senha
- Observações médicas
- Botão "+ Adicionar outro filho"

**Step 3 — Dependente 2+ (opcional)**
- Mesmos campos do Step 2
- Campos pré-preenchidos: responsável, endereço (duplicação inteligente — item 4.9)
- Máximo 5 dependentes

**Step 4 — Turma/Modalidade**
- Para cada dependente, dropdown de turmas compatíveis com a faixa etária
- Se Kids: só mostra turmas Kids
- Se Teen: mostra turmas Teen + turmas gerais marcadas como "aberta a teens"

**Step 5 — Financeiro**
- Quem paga: Responsável 1 (pré-selecionado) ou "Outro pagador"
- Plano por dependente (dropdown de planos da academia)
- Total mensal calculado automaticamente
- Se tem 2+ dependentes: sugerir Plano Família se existir

**Step 6 — Revisão e Envio**
- Resumo de tudo: responsável, dependentes com turma e plano, total mensal
- Checkbox: "Enviar convite por email ao responsável"
- Checkbox: "Enviar convite por email ao(s) teen(s)"
- Botão "Confirmar Cadastro"

### 4B. Ao confirmar:
```typescript
// 1. Criar Person do responsável
// 2. Criar Auth account do responsável (se email fornecido)
// 3. Criar Profile do responsável (role: 'responsavel')
// 4. Para cada dependente:
//    a. Criar Person
//    b. Se teen com login: criar Auth account
//    c. Criar Profile (role: 'aluno_kids' ou 'aluno_teen')
//    d. Criar FamilyLink
//    e. Criar Enrollment na turma
// 5. Criar Invoice(s) do primeiro mês
// 6. Enviar convites (se marcado)
```

### 4C. Integrar no Admin

Em `app/(admin)/admin/alunos/page.tsx`:
- Adicionar botão "👨‍👩‍👧‍👦 Criar Família" ao lado de "Cadastrar Aluno"
- Abre modal com `<CreateFamilyWizard />` ou navega para `/admin/cadastro-familia`

Criar página `app/(admin)/admin/cadastro-familia/page.tsx` que renderiza o wizard.

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: create family wizard — 6-step enrollment with sibling duplication`

---

## SEÇÃO 5 — COBRANÇA FAMILIAR

### 5A. Service de cobrança familiar

Criar `lib/api/family-billing.service.ts`:

```typescript
export interface FamilyBilling {
  familyId: string; // guardianPersonId
  guardianName: string;
  totalMonthly: number;
  status: 'em_dia' | 'parcial' | 'atrasado';
  dependents: {
    personId: string;
    name: string;
    planName: string;
    monthlyAmount: number;
    status: 'em_dia' | 'atrasado' | 'vencendo_hoje';
    nextDueDate: string;
    daysOverdue?: number;
  }[];
  invoices: {
    id: string;
    dependentName: string;
    reference: string; // "Março/2026"
    amount: number;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue' | 'cancelled';
    paidAt?: string;
    paymentLink?: string;
  }[];
  familyPlanSuggestion?: {
    currentTotal: number;
    suggestedPlan: string;
    suggestedAmount: number;
    annualSavings: number;
  };
}

export async function getFamilyBilling(guardianPersonId: string): Promise<FamilyBilling> { ... }
```

### 5B. Atualizar página /parent/pagamentos

Reescrever para usar `getFamilyBilling`:
- Card consolidado: "Total mensal: R$ 248" com breakdown por filho
- Card de economia: "Com Plano Família você economiza R$ 468/ano"
- Tabela de faturas com filtro por filho
- Botões "Pagar agora" com link de pagamento

### 5C. Visão admin do financeiro familiar

Na página de detalhe do aluno (`/admin/alunos/[id]`):
- Se aluno é menor: mostrar seção "Família" com nome do responsável financeiro e faturas consolidadas
- Link para "Ver todas as faturas da família"

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: family billing — grouped invoices, family plan suggestion, parent payment view`

---

## SEÇÃO 6 — COMUNICAÇÃO ORIENTADA POR VÍNCULO

### 6A. Integrar resolveRecipients no envio de comunicados

Em `lib/api/announcement.service.ts` (ou equivalente):
- Antes de enviar comunicado, chamar `resolveRecipients(target)` para resolver destinatários
- Se o comunicado é para turma Kids → destinatários são os responsáveis (não as crianças)
- Se é para turma Teen → destinatários são teens + responsáveis
- Preview: "Este comunicado será enviado para 23 pessoas (incluindo 8 responsáveis)"

### 6B. Segmentação na UI de comunicados

Em `/admin/comunicados/novo` (ou equivalente):
- Dropdown "Enviar para": Todos / Turma / Modalidade / Faixa etária / Responsáveis / Inadimplentes / Faltosos
- Ao selecionar turma: dropdown com turmas
- Preview de destinatários antes de enviar
- Checkbox "Incluir responsáveis automaticamente" (pré-marcado)

### 6C. Lógica de roteamento por vínculo

No service de notificações:
```typescript
// Regras:
// 1. Aviso de turma Kids → responsável(eis) que têm receives_notifications=true
// 2. Aviso de turma Teen → teen + responsável(eis)
// 3. Cobrança → APENAS responsável com is_financial_responsible=true
// 4. Resultado de competição → atleta + responsável(eis) se menor
// 5. Emergência → TODOS os responsáveis vinculados (primary + secondary)
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: communication by family link — resolveRecipients + segmented announcements`

---

## SEÇÃO 7 — EVOLUÇÃO DE CICLO DE VIDA

### 7A. Componente de evolução

Criar `components/admin/EvolveProfileModal.tsx`:
- Modal que mostra: perfil atual, novo role proposto, o que será preservado
- Para Kids→Teen:
  - "Lucas fez 13 anos. Deseja promover para Aluno Teen?"
  - Checkbox: "Criar login próprio para o teen"
  - Se sim: campos email + senha
  - "Histórico preservado: 92 estrelas, 18 figurinhas, 156 presenças"
- Para Teen→Adulto:
  - "Sophia fez 18 anos. Promover para Aluno Adulto?"
  - "XP e ranking teen serão migrados para conquistas adulto"
- Para Aluno→Professor:
  - "Ana recebeu sua faixa preta. Adicionar perfil Professor?"
  - "O perfil Aluno será mantido (multi-perfil)"

### 7B. Notificação automática de aniversário relevante

No cron de aniversários (que já existe):
- Se aluno Kids faz 13 anos → notificação para admin: "Lucas completou 13 anos — promover para Teen?"
- Se aluno Teen faz 18 anos → notificação para admin: "Sophia completou 18 anos — promover para Adulto?"
- Notificação com botão de ação direta que abre o EvolveProfileModal

### 7C. Integrar no admin

Em `/admin/alunos/[id]` (detalhe do aluno):
- Se idade cruza limite (13 ou 18): mostrar banner amarelo "Este aluno pode ser promovido para [novo role]"
- Botão "Promover" abre o modal

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: lifecycle evolution — Kids→Teen→Adult transitions preserving history`

---

## SEÇÃO 8 — POLIMENTO DE PARCIAIS CRÍTICOS

### 8A. Cadastro rápido na recepção (4.3)

Em `app/(recepcao)/recepcao/cadastro/page.tsx`:
- Adicionar toggle no topo: "Cadastro Rápido" vs "Cadastro Completo"
- Cadastro Rápido: apenas Nome + Telefone + Turma (3 campos)
- Salva como profile com status `draft`
- Toast: "Cadastro rápido salvo! Complete os dados quando possível."
- Na lista de pendências da recepção: "2 cadastros incompletos" com botão "Completar"

### 8B. Admin cadastrar aluno direto (4.1)

Em `app/(admin)/admin/alunos/page.tsx`:
- Adicionar botão "➕ Cadastrar Aluno" visível no topo da lista
- Abre modal com formulário: Nome, Email (opcional), Telefone, Data Nascimento, Turma, Plano
- Se email fornecido: cria conta Auth + envia email com senha temporária
- Se sem email: cria profile com status `pending` (sem auth account)
- Adicionar flag `needs_password_change: true` no metadata do auth user

### 8C. Check-in com regra por perfil (9.1)

Em `lib/api/access-control.service.ts` ou `supabase/functions/process-checkin/index.ts`:
- Adicionar validação por role antes de processar check-in:
  ```typescript
  if (role === 'aluno_kids') {
    // Verificar se quem fez o check-in é responsável ou recepcionista
    if (!checkinBy || !['responsavel', 'recepcionista', 'professor'].includes(checkinBy.role)) {
      throw new Error('Check-in de aluno Kids deve ser feito por responsável, professor ou recepção');
    }
  }
  if (role === 'aluno_teen') {
    // Verificar config da academia
    const teenConfig = await getTeenConfig(academyId);
    if (!teenConfig.teenCanSelfCheckin) {
      // Verificar se quem fez é responsável/staff
      if (!checkinBy || checkinBy.role === 'aluno_teen') {
        throw new Error('Esta academia não permite check-in autônomo de adolescentes');
      }
    }
  }
  ```

### 8D. Entrada pela store (4.10)

Em `app/(auth)/login/page.tsx` ou criar `app/(auth)/welcome/page.tsx`:
- ANTES do formulário de login, mostrar 4 cards de escolha:
  - "🥋 Sou Academia" → `/cadastro` (wizard de criação de academia)
  - "👤 Sou Aluno" → `/buscar-academia` (nova página)
  - "👨‍👩‍👧 Sou Responsável" → `/buscar-academia` (com flag `?role=responsavel`)
  - "📨 Tenho Convite" → campo para colar código/link
  - "Já tenho conta? Fazer login" → expande formulário de login

### 8E. Busca de academia pública (4.11)

Criar `app/(auth)/buscar-academia/page.tsx`:
- Campo de busca: nome ou cidade
- Lista de resultados com: logo, nome, cidade, modalidades
- Ao selecionar: mostra página pública da academia com botão "Cadastrar-se nesta academia"
- Alternativa: "Entrar por código" → campo para digitar código da academia (ex: GUERREIROS2026)
- Usar o slug que já existe (`/g/[slug]`)

### 8F. Importação CSV funcional (4.6)

Instalar papaparse:
```bash
pnpm add papaparse
pnpm add -D @types/papaparse
```

Em `app/(admin)/admin/alunos/page.tsx` ou `/admin/wizard`:
- Botão "Importar Planilha" abre modal
- Upload de .csv
- Parse com Papaparse
- Preview: tabela com dados + validação por linha (nome vazio? email duplicado? data inválida?)
- Botão "Importar X alunos válidos"
- Progress bar durante batch insert
- Relatório final: "147 importados, 3 com erro"

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: polished partials — quick register, admin create student, role-based checkin, store entry, CSV import`

---

## SEÇÃO 9 — TIMELINE UNIFICADA + PAINEL DE INCONSISTÊNCIAS

### 9A. Timeline unificada do aluno (7.4)

Criar `components/admin/StudentTimeline.tsx`:
- Timeline vertical com eventos de TODOS os tipos:
  - 📝 Matrícula (data de entrada)
  - ✅ Presenças (agrupadas por semana)
  - 🔄 Troca de turma
  - 🥋 Graduação/promoção de faixa
  - 💰 Pagamentos (pago/atrasado)
  - 🏆 Competições (inscrição + resultado)
  - 📢 Comunicados relevantes
  - 👨‍🏫 Notas do professor
- Filtros: tipo de evento, período (mês/trimestre/ano)
- Scroll infinito ou paginação

Integrar em `app/(admin)/admin/alunos/[id]/page.tsx` como tab "Timeline".
Integrar em `app/(professor)/professor/alunos/[id]/page.tsx` (versão resumida).

### 9B. Painel de inconsistências (7.2)

Criar `app/(admin)/admin/pendencias/page.tsx`:
- Header: "Corrigir Pendências"
- Agrupado por categoria com contagem:
  - 👤 Cadastro: "3 alunos sem responsável", "2 teens sem ativação"
  - 💰 Financeiro: "5 cobranças sem pagador definido"
  - 📚 Turma: "4 alunos sem turma"
  - 👨‍👩‍👧 Família: "2 responsáveis sem dependente"
- Cada item tem botão de ação direta: "Vincular responsável", "Definir turma"
- Progresso geral: "23/30 resolvidas (77%)"

Criar `lib/api/data-health.service.ts`:
```typescript
export interface DataHealthReport {
  totalIssues: number;
  resolvedIssues: number;
  categories: {
    name: string;
    icon: string;
    issues: {
      id: string;
      description: string;
      severity: 'high' | 'medium' | 'low';
      actionLabel: string;
      actionRoute: string;
      entityId: string;
    }[];
  }[];
}

export async function getDataHealthReport(academyId: string): Promise<DataHealthReport> { ... }
```

### 9C. Badge de pendências no menu admin

No `AdminShell.tsx`:
- Ao lado do item "Pendências" no menu: badge com contagem total
- Cor: vermelho se >5, amarelo se 1-5, verde se 0

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: student timeline + data health panel with action badges`

---

## SEÇÃO 10 — SEGMENTAÇÃO DE COMUNICADOS + STATUS DE PERFIL

### 10A. Segmentação fina nos comunicados (8.1)

Em `lib/types/announcement.ts`:
```typescript
export interface AnnouncementTarget {
  type: 'all' | 'class' | 'modality' | 'belt' | 'age_group' | 'status' | 'custom';
  classIds?: string[];
  modalityIds?: string[];
  beltLevels?: string[];
  ageGroup?: 'kids' | 'teen' | 'adult';
  paymentStatus?: 'em_dia' | 'inadimplente';
  inactivityDays?: number; // alunos que não vieram há X dias
  includeGuardians?: boolean; // incluir responsáveis automaticamente
}
```

Atualizar UI de criação de comunicados com esses filtros.

### 10B. Status lifecycle completo (4.5)

Atualizar `MembershipStatus` ou usar `ProfileLifecycleStatus`:
```typescript
type ProfileLifecycleStatus = 'draft' | 'pending' | 'invited' | 'active' | 'suspended' | 'archived';
```

- Draft: cadastro rápido na recepção (só nome + telefone)
- Pending: dados completos, aguardando aprovação ou pagamento
- Invited: convite enviado, aguardando aceite
- Active: usando o sistema normalmente
- Suspended: bloqueado (inadimplência, disciplina, controle parental)
- Archived: saiu da academia, dados preservados

Atualizar listas de alunos no admin para mostrar badges de status.

### 10C. Documentos por família (10.2)

Em `app/(parent)/parent/configuracoes` ou nova subpágina `/parent/documentos`:
- Seção "Documentos da Família"
- Upload de atestados médicos por filho
- Visualização de contratos assinados por filho
- Autorizações assinadas (histórico)
- Status: "Contrato de Sophia: ✅ Assinado" / "Atestado médico de Miguel: ⚠️ Pendente"

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: announcement segmentation, profile lifecycle, family documents`

---

## COMANDO DE RETOMADA

Se a execução parar em qualquer ponto:

```
Continue de onde parou no BLACKBELT_USABILIDADE_MEGA.md. Verifique estado:
ls lib/api/family.service.ts 2>/dev/null && echo "S1 OK" || echo "S1 FALTA"
ls components/parent/AddChildForm.tsx 2>/dev/null && echo "S2 OK" || echo "S2 FALTA"
ls lib/api/academy-settings.service.ts 2>/dev/null && echo "S3 OK" || echo "S3 FALTA"
ls components/admin/CreateFamilyWizard.tsx 2>/dev/null && echo "S4 OK" || echo "S4 FALTA"
ls lib/api/family-billing.service.ts 2>/dev/null && echo "S5 OK" || echo "S5 FALTA"
grep -l "resolveRecipients" lib/api/ 2>/dev/null && echo "S6 OK" || echo "S6 FALTA"
ls components/admin/EvolveProfileModal.tsx 2>/dev/null && echo "S7 OK" || echo "S7 FALTA"
grep -l "papaparse\|Papaparse" package.json 2>/dev/null && echo "S8 OK" || echo "S8 FALTA"
ls components/admin/StudentTimeline.tsx 2>/dev/null && echo "S9 OK" || echo "S9 FALTA"
grep -l "AnnouncementTarget" lib/types/ 2>/dev/null && echo "S10 OK" || echo "S10 FALTA"
pnpm typecheck 2>&1 | tail -5
Continue da próxima seção incompleta. ZERO erros. Commit e push.
```
