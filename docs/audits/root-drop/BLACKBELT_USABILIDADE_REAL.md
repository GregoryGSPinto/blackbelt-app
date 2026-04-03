# BLACKBELT v2 — ATIVAR USABILIDADE NO SUPABASE REAL
## Migrations, Seeds, RLS, Edge Functions e Teste End-to-End
## Tudo que foi criado no MEGA prompt anterior precisa funcionar de verdade

> **INSTRUÇÕES DE EXECUÇÃO:**
> - Execute BLOCO a BLOCO, na ordem (B1 → B2 → ... → B8)
> - Cada BLOCO termina com: `pnpm typecheck && pnpm build` → commit → push
> - Este prompt ASSUME que o BLACKBELT_USABILIDADE_MEGA.md já foi executado
> - Todos os services, components e pages JÁ EXISTEM em mock
> - Agora vamos: criar migrations SQL, rodar seeds, configurar RLS, e trocar mock→real
>
> **PRÉ-REQUISITO:** Verificar que a base do mega prompt existe:
> ```bash
> ls lib/api/family.service.ts && echo "✅" || echo "❌ PARE — rode o MEGA primeiro"
> ls components/parent/AddChildForm.tsx && echo "✅" || echo "❌ PARE"
> ls components/admin/CreateFamilyWizard.tsx && echo "✅" || echo "❌ PARE"
> ls lib/api/family-billing.service.ts && echo "✅" || echo "❌ PARE"
> ls lib/api/academy-settings.service.ts && echo "✅" || echo "❌ PARE"
> ls lib/api/data-health.service.ts && echo "✅" || echo "❌ PARE"
> ls components/admin/EvolveProfileModal.tsx && echo "✅" || echo "❌ PARE"
> ls components/admin/StudentTimeline.tsx && echo "✅" || echo "❌ PARE"
> ```
> Se algum deu ❌, rode o MEGA primeiro.

---

## BLOCO 1 — VERIFICAR E CONSOLIDAR MIGRATIONS

### 1A. Listar todas as migrations existentes

```bash
ls -la supabase/migrations/*.sql | tail -20
```

Identificar a última migration (ex: `069_xxx.sql`). As novas migrations do MEGA devem ser:
- `070_people_table.sql`
- `071_family_links.sql`
- `072_profiles_person_id.sql`

### 1B. Verificar se as migrations existem e estão corretas

```bash
cat supabase/migrations/070_people_table.sql 2>/dev/null | head -5
cat supabase/migrations/071_family_links.sql 2>/dev/null | head -5
cat supabase/migrations/072_profiles_person_id.sql 2>/dev/null | head -5
```

Se NÃO existem, criar agora. Se existem mas estão incompletas, corrigir.

### 1C. Criar migration consolidada de TODAS as tabelas de usabilidade

Se as migrations 070-072 já existem individualmente, PULE este passo.
Se não existem, criar UMA migration consolidada:

Arquivo: `supabase/migrations/070_usability_tables.sql`

```sql
-- ═══════════════════════════════════════════════════════
-- BLACKBELT v2 — TABELAS DE USABILIDADE
-- People, FamilyLinks, ParentalControls, TeenConfig,
-- ProfileLifecycle, DataHealth, AnnouncementTargets
-- ═══════════════════════════════════════════════════════

-- 1. PEOPLE (pessoa física — pode ou não ter conta Auth)
CREATE TABLE IF NOT EXISTS people (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name VARCHAR(200) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  birth_date DATE,
  phone VARCHAR(20),
  email VARCHAR(255),
  gender VARCHAR(20) CHECK (gender IN ('masculino', 'feminino', 'outro', 'nao_informado')),
  avatar_url TEXT,
  medical_notes TEXT,
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_people_account ON people(account_id);
CREATE INDEX IF NOT EXISTS idx_people_cpf ON people(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_people_email ON people(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_people_phone ON people(phone) WHERE phone IS NOT NULL;

-- 2. FAMILY_LINKS (vínculo familiar)
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

CREATE INDEX IF NOT EXISTS idx_family_links_guardian ON family_links(guardian_person_id);
CREATE INDEX IF NOT EXISTS idx_family_links_dependent ON family_links(dependent_person_id);

-- 3. PROFILES — adicionar person_id e lifecycle_status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS person_id UUID REFERENCES people(id);
CREATE INDEX IF NOT EXISTS idx_profiles_person ON profiles(person_id) WHERE person_id IS NOT NULL;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lifecycle_status VARCHAR(20) DEFAULT 'active'
  CHECK (lifecycle_status IN ('draft', 'pending', 'invited', 'active', 'suspended', 'archived'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parental_controls JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS needs_password_change BOOLEAN DEFAULT false;

-- 4. ACADEMY_TEEN_CONFIG (configuração de autonomia teen por academia)
CREATE TABLE IF NOT EXISTS academy_teen_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  teen_can_view_schedule BOOLEAN DEFAULT true,
  teen_can_self_checkin BOOLEAN DEFAULT true,
  teen_can_receive_direct_notifications BOOLEAN DEFAULT true,
  teen_can_view_payments BOOLEAN DEFAULT false,
  teen_can_edit_personal_data BOOLEAN DEFAULT false,
  teen_can_participate_general_ranking BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(academy_id)
);

-- 5. PROFILE_EVOLUTION_LOG (histórico de transições Kids→Teen→Adulto)
CREATE TABLE IF NOT EXISTS profile_evolution_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_role VARCHAR(30) NOT NULL,
  to_role VARCHAR(30) NOT NULL,
  reason TEXT,
  evolved_by UUID REFERENCES profiles(id), -- quem fez a promoção
  preserved_data JSONB DEFAULT '{}', -- XP, estrelas, etc preservados
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. DATA_HEALTH_ISSUES (inconsistências operacionais)
CREATE TABLE IF NOT EXISTS data_health_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  category VARCHAR(30) NOT NULL CHECK (category IN ('cadastro', 'financeiro', 'turma', 'familia', 'documento')),
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
  entity_type VARCHAR(30) NOT NULL, -- 'profile', 'student', 'invoice', etc
  entity_id UUID NOT NULL,
  description TEXT NOT NULL,
  action_label VARCHAR(100),
  action_route VARCHAR(255),
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_health_academy ON data_health_issues(academy_id, is_resolved);

-- 7. ANNOUNCEMENT_TARGETS (segmentação de comunicados)
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_config JSONB DEFAULT '{}';
-- Formato: { "type": "class", "class_ids": [...], "include_guardians": true, "age_group": "kids" }

ALTER TABLE announcements ADD COLUMN IF NOT EXISTS recipient_count INTEGER DEFAULT 0;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS read_count INTEGER DEFAULT 0;

-- 8. FAMILY_INVOICES (faturas agrupadas por família)
CREATE TABLE IF NOT EXISTS family_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  reference_month VARCHAR(7) NOT NULL, -- '2026-03'
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  payment_method VARCHAR(30),
  payment_link TEXT,
  line_items JSONB DEFAULT '[]',
  -- Formato: [{ "dependent_name": "Sophia", "plan_name": "Kids BJJ", "amount": 149.00 }]
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_family_invoices_guardian ON family_invoices(guardian_person_id);
CREATE INDEX IF NOT EXISTS idx_family_invoices_academy ON family_invoices(academy_id, reference_month);

-- 9. STUDENT_TIMELINE_EVENTS (eventos unificados do aluno)
CREATE TABLE IF NOT EXISTS student_timeline_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  event_type VARCHAR(30) NOT NULL CHECK (event_type IN (
    'matricula', 'presenca', 'troca_turma', 'graduacao', 'pagamento',
    'competicao', 'comunicado', 'nota_professor', 'evolucao_perfil',
    'suspensao', 'reativacao', 'experimental', 'conquista'
  )),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  event_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timeline_profile ON student_timeline_events(profile_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_academy ON student_timeline_events(academy_id, event_type);

-- ═══════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════

-- Buscar responsáveis de um dependente
CREATE OR REPLACE FUNCTION get_guardians(p_dependent_id UUID)
RETURNS TABLE(
  guardian_id UUID,
  guardian_name VARCHAR,
  relationship VARCHAR,
  is_primary BOOLEAN,
  is_financial BOOLEAN,
  can_authorize BOOLEAN,
  receives_notifications BOOLEAN,
  receives_billing BOOLEAN,
  phone VARCHAR,
  email VARCHAR
) AS $$
  SELECT
    p.id, p.full_name, fl.relationship,
    fl.is_primary_guardian, fl.is_financial_responsible,
    fl.can_authorize_events, fl.receives_notifications,
    fl.receives_billing, p.phone, p.email
  FROM family_links fl
  JOIN people p ON p.id = fl.guardian_person_id
  WHERE fl.dependent_person_id = p_dependent_id
  ORDER BY fl.is_primary_guardian DESC;
$$ LANGUAGE sql STABLE;

-- Buscar dependentes de um responsável
CREATE OR REPLACE FUNCTION get_dependents(p_guardian_id UUID)
RETURNS TABLE(
  dependent_id UUID,
  dependent_name VARCHAR,
  birth_date DATE,
  relationship VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  medical_notes TEXT
) AS $$
  SELECT
    p.id, p.full_name, p.birth_date,
    fl.relationship, p.phone, p.email, p.medical_notes
  FROM family_links fl
  JOIN people p ON p.id = fl.dependent_person_id
  WHERE fl.guardian_person_id = p_guardian_id
  ORDER BY p.birth_date ASC;
$$ LANGUAGE sql STABLE;

-- Calcular idade
CREATE OR REPLACE FUNCTION calculate_age(p_birth_date DATE)
RETURNS INTEGER AS $$
  SELECT EXTRACT(YEAR FROM age(CURRENT_DATE, p_birth_date))::INTEGER;
$$ LANGUAGE sql IMMUTABLE;

-- Detectar inconsistências (chamada periódica)
CREATE OR REPLACE FUNCTION detect_data_health_issues(p_academy_id UUID)
RETURNS INTEGER AS $$
DECLARE
  issues_found INTEGER := 0;
BEGIN
  -- Limpar issues resolvidas antigas (>30 dias)
  DELETE FROM data_health_issues
  WHERE academy_id = p_academy_id AND is_resolved = true
    AND resolved_at < now() - interval '30 days';

  -- Alunos menores sem responsável vinculado
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT
    p_academy_id, 'familia', 'high', 'profile', pr.id,
    'Aluno ' || pr.display_name || ' é menor de idade mas não tem responsável vinculado',
    'Vincular responsável',
    '/admin/alunos/' || pr.id
  FROM profiles pr
  LEFT JOIN people pe ON pe.id = pr.person_id
  WHERE pr.academy_id = p_academy_id
    AND pr.role IN ('aluno_kids', 'aluno_teen')
    AND pr.lifecycle_status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM family_links fl WHERE fl.dependent_person_id = pr.person_id
    )
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.category = 'familia' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS issues_found = ROW_COUNT;

  -- Alunos sem turma
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT
    p_academy_id, 'turma', 'medium', 'profile', pr.id,
    'Aluno ' || pr.display_name || ' não está matriculado em nenhuma turma',
    'Definir turma',
    '/admin/alunos/' || pr.id
  FROM profiles pr
  WHERE pr.academy_id = p_academy_id
    AND pr.role IN ('aluno_adulto', 'aluno_teen', 'aluno_kids')
    AND pr.lifecycle_status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM class_enrollments ce WHERE ce.student_id = pr.id AND ce.status = 'active'
    )
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.category = 'turma' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS issues_found = issues_found + ROW_COUNT;

  -- Responsáveis sem dependentes
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT
    p_academy_id, 'familia', 'medium', 'profile', pr.id,
    'Responsável ' || pr.display_name || ' não tem nenhum dependente vinculado',
    'Vincular dependente',
    '/admin/alunos/' || pr.id
  FROM profiles pr
  WHERE pr.academy_id = p_academy_id
    AND pr.role = 'responsavel'
    AND pr.lifecycle_status = 'active'
    AND pr.person_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM family_links fl WHERE fl.guardian_person_id = pr.person_id
    )
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.category = 'familia' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS issues_found = issues_found + ROW_COUNT;

  -- Teens sem ativação (convite enviado mas não aceito há >7 dias)
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT
    p_academy_id, 'cadastro', 'medium', 'profile', pr.id,
    'Teen ' || pr.display_name || ' foi convidado mas não ativou a conta',
    'Reenviar convite',
    '/admin/convites'
  FROM profiles pr
  WHERE pr.academy_id = p_academy_id
    AND pr.role = 'aluno_teen'
    AND pr.lifecycle_status = 'invited'
    AND pr.created_at < now() - interval '7 days'
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.category = 'cadastro' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS issues_found = issues_found + ROW_COUNT;

  -- Cobranças sem pagador definido
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT
    p_academy_id, 'financeiro', 'high', 'profile', pr.id,
    'Aluno menor ' || pr.display_name || ' não tem pagador financeiro definido',
    'Definir pagador',
    '/admin/alunos/' || pr.id
  FROM profiles pr
  WHERE pr.academy_id = p_academy_id
    AND pr.role IN ('aluno_kids', 'aluno_teen')
    AND pr.lifecycle_status = 'active'
    AND pr.person_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM family_links fl
      WHERE fl.dependent_person_id = pr.person_id AND fl.is_financial_responsible = true
    )
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.category = 'financeiro' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS issues_found = issues_found + ROW_COUNT;

  -- Kids que completaram 13 anos (sugestão de evolução)
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT
    p_academy_id, 'cadastro', 'low', 'profile', pr.id,
    pr.display_name || ' completou 13 anos — considere promover para Teen',
    'Promover para Teen',
    '/admin/alunos/' || pr.id
  FROM profiles pr
  JOIN people pe ON pe.id = pr.person_id
  WHERE pr.academy_id = p_academy_id
    AND pr.role = 'aluno_kids'
    AND pr.lifecycle_status = 'active'
    AND pe.birth_date IS NOT NULL
    AND calculate_age(pe.birth_date) >= 13
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.description LIKE '%completou 13%' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS issues_found = issues_found + ROW_COUNT;

  -- Teens que completaram 18 anos
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT
    p_academy_id, 'cadastro', 'low', 'profile', pr.id,
    pr.display_name || ' completou 18 anos — considere promover para Adulto',
    'Promover para Adulto',
    '/admin/alunos/' || pr.id
  FROM profiles pr
  JOIN people pe ON pe.id = pr.person_id
  WHERE pr.academy_id = p_academy_id
    AND pr.role = 'aluno_teen'
    AND pr.lifecycle_status = 'active'
    AND pe.birth_date IS NOT NULL
    AND calculate_age(pe.birth_date) >= 18
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.description LIKE '%completou 18%' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS issues_found = issues_found + ROW_COUNT;

  RETURN issues_found;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════

ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_teen_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_evolution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_health_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_timeline_events ENABLE ROW LEVEL SECURITY;

-- People: pessoa vê a si mesma, admin vê da academia, responsável vê dependentes
CREATE POLICY "people_own" ON people FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "people_admin" ON people FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'superadmin')
  )
);
CREATE POLICY "people_guardian" ON people FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM family_links fl
    JOIN people gp ON gp.id = fl.guardian_person_id
    WHERE fl.dependent_person_id = people.id
      AND gp.account_id = auth.uid()
  )
);

-- Family links: responsável vê seus vínculos, admin vê da academia
CREATE POLICY "family_links_guardian" ON family_links FOR ALL USING (
  EXISTS (
    SELECT 1 FROM people p
    WHERE p.id = family_links.guardian_person_id
      AND p.account_id = auth.uid()
  )
);
CREATE POLICY "family_links_admin" ON family_links FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'superadmin')
  )
);

-- Academy teen config: admin da academia
CREATE POLICY "teen_config_admin" ON academy_teen_config FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'superadmin')
      AND (p.academy_id = academy_teen_config.academy_id OR p.role = 'superadmin')
  )
);

-- Data health: admin da academia
CREATE POLICY "data_health_admin" ON data_health_issues FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'superadmin')
      AND (p.academy_id = data_health_issues.academy_id OR p.role = 'superadmin')
  )
);

-- Family invoices: responsável vê suas, admin vê da academia
CREATE POLICY "family_invoices_guardian" ON family_invoices FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM people p
    WHERE p.id = family_invoices.guardian_person_id
      AND p.account_id = auth.uid()
  )
);
CREATE POLICY "family_invoices_admin" ON family_invoices FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'superadmin')
      AND (p.academy_id = family_invoices.academy_id OR p.role = 'superadmin')
  )
);

-- Timeline: aluno vê a própria, professor/admin vê da academia
CREATE POLICY "timeline_own" ON student_timeline_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = student_timeline_events.profile_id
      AND p.user_id = auth.uid()
  )
);
CREATE POLICY "timeline_staff" ON student_timeline_events FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'professor', 'superadmin')
      AND (p.academy_id = student_timeline_events.academy_id OR p.role = 'superadmin')
  )
);
CREATE POLICY "timeline_guardian" ON student_timeline_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles pr
    JOIN people pe ON pe.id = pr.person_id
    JOIN family_links fl ON fl.dependent_person_id = pe.id
    JOIN people gp ON gp.id = fl.guardian_person_id
    WHERE pr.id = student_timeline_events.profile_id
      AND gp.account_id = auth.uid()
  )
);

-- Profile evolution log: admin e superadmin
CREATE POLICY "evolution_admin" ON profile_evolution_log FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'superadmin')
  )
);
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: usability migration — people, family_links, teen_config, data_health, timeline, RLS`

---

## BLOCO 2 — SEED DE DADOS FAMILIARES REALISTAS

### 2A. Criar script de seed

Arquivo: `scripts/seed-usability.ts`

```typescript
// Este script popula TODAS as tabelas de usabilidade com dados realistas
// da academia demo "Guerreiros do Tatame"
//
// RODAR: npx tsx scripts/seed-usability.ts
// REQUER: SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL no .env.local

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function seed() {
  console.log('🌱 Iniciando seed de usabilidade...\n');

  // ═══ ACADEMY ID ═══
  const { data: academy } = await supabase.from('academies').select('id').eq('name', 'Guerreiros do Tatame').single();
  const ACADEMY_ID = academy?.id;
  if (!ACADEMY_ID) {
    console.error('❌ Academia "Guerreiros do Tatame" não encontrada. Rode o seed principal primeiro.');
    process.exit(1);
  }
  console.log(`✅ Academia: ${ACADEMY_ID}\n`);

  // ═══ 1. PEOPLE ═══
  console.log('👤 Criando pessoas...');

  const people = [
    // Responsáveis
    { full_name: 'Patrícia Oliveira', email: 'patricia@email.com', phone: '(31) 99876-5432', birth_date: '1985-03-15', gender: 'feminino', cpf: '123.456.789-00' },
    { full_name: 'Carlos Pereira', email: 'carlos.resp@email.com', phone: '(31) 99765-4321', birth_date: '1982-07-22', gender: 'masculino', cpf: '987.654.321-00' },
    { full_name: 'Maria Clara Mendes', email: 'maria.resp@email.com', phone: '(31) 99654-3210', birth_date: '1988-11-08', gender: 'feminino' },
    { full_name: 'Renata Costa', email: 'renata@email.com', phone: '(31) 99543-2109', birth_date: '1990-01-25', gender: 'feminino' },
    // Teens
    { full_name: 'Sophia Oliveira', email: 'sophia@email.com', phone: null, birth_date: '2010-05-15', gender: 'feminino', medical_notes: null },
    { full_name: 'Lucas Gabriel Mendes', email: 'lucas.teen@email.com', phone: null, birth_date: '2011-09-03', gender: 'masculino', medical_notes: null },
    { full_name: 'Gabriel Santos', email: 'gabriel.teen@email.com', phone: null, birth_date: '2012-04-18', gender: 'masculino', medical_notes: null },
    { full_name: 'Valentina Costa', email: 'valentina@email.com', phone: null, birth_date: '2009-12-01', gender: 'feminino', medical_notes: null },
    // Kids
    { full_name: 'Miguel Pereira', email: null, phone: null, birth_date: '2016-08-22', gender: 'masculino', medical_notes: 'Alergia a amendoim' },
    { full_name: 'Helena Costa', email: null, phone: null, birth_date: '2018-02-14', gender: 'feminino', medical_notes: null },
    { full_name: 'Arthur Nakamura', email: null, phone: null, birth_date: '2019-06-30', gender: 'masculino', medical_notes: 'Asma leve — sempre ter bombinha disponível' },
    { full_name: 'Laura Almeida', email: null, phone: null, birth_date: '2017-10-05', gender: 'feminino', medical_notes: null },
  ];

  const { data: insertedPeople, error: pErr } = await supabase.from('people').upsert(people, { onConflict: 'cpf' }).select();
  console.log(pErr ? `❌ ${pErr.message}` : `✅ ${insertedPeople?.length} pessoas criadas`);

  // Mapear por nome para usar nos links
  const pMap = new Map<string, string>();
  for (const p of insertedPeople || []) {
    pMap.set(p.full_name, p.id);
  }

  // ═══ 2. FAMILY LINKS ═══
  console.log('\n👨‍👩‍👧 Criando vínculos familiares...');

  const links = [
    // Patrícia é mãe de Sophia (teen) e Miguel (kids)
    { guardian_person_id: pMap.get('Patrícia Oliveira'), dependent_person_id: pMap.get('Sophia Oliveira'), relationship: 'mae', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    { guardian_person_id: pMap.get('Patrícia Oliveira'), dependent_person_id: pMap.get('Miguel Pereira'), relationship: 'mae', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    // Carlos é pai de Gabriel (teen) e Helena (kids)
    { guardian_person_id: pMap.get('Carlos Pereira'), dependent_person_id: pMap.get('Gabriel Santos'), relationship: 'pai', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    { guardian_person_id: pMap.get('Carlos Pereira'), dependent_person_id: pMap.get('Helena Costa'), relationship: 'pai', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    // Maria Clara é mãe de Lucas (teen) — responsável secundário: Roberto (admin)
    { guardian_person_id: pMap.get('Maria Clara Mendes'), dependent_person_id: pMap.get('Lucas Gabriel Mendes'), relationship: 'mae', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    // Renata é mãe de Valentina (teen) e Laura (kids)
    { guardian_person_id: pMap.get('Renata Costa'), dependent_person_id: pMap.get('Valentina Costa'), relationship: 'mae', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
    { guardian_person_id: pMap.get('Renata Costa'), dependent_person_id: pMap.get('Laura Almeida'), relationship: 'mae', is_primary_guardian: true, is_financial_responsible: true, receives_billing: true },
  ].filter(l => l.guardian_person_id && l.dependent_person_id);

  const { error: flErr } = await supabase.from('family_links').upsert(links, { onConflict: 'guardian_person_id,dependent_person_id' });
  console.log(flErr ? `❌ ${flErr.message}` : `✅ ${links.length} vínculos familiares criados`);

  // ═══ 3. VINCULAR PROFILES EXISTENTES A PEOPLE ═══
  console.log('\n🔗 Vinculando profiles a people...');

  // Buscar profiles existentes por email
  const profileEmails = [
    'patricia@email.com', 'carlos.resp@email.com', 'maria.resp@email.com', 'renata@email.com',
    'sophia@email.com', 'lucas.teen@email.com', 'gabriel.teen@email.com', 'valentina@email.com',
  ];

  for (const email of profileEmails) {
    const personId = [...pMap.entries()].find(([, ]) => {
      const person = insertedPeople?.find(p => p.email === email);
      return person !== undefined;
    });

    const matchedPerson = insertedPeople?.find(p => p.email === email);
    if (matchedPerson) {
      const { error } = await supabase
        .from('profiles')
        .update({ person_id: matchedPerson.id })
        .eq('email', email);
      console.log(error ? `  ❌ ${email}: ${error.message}` : `  ✅ ${email} → person_id vinculado`);
    }
  }

  // ═══ 4. ACADEMY TEEN CONFIG ═══
  console.log('\n⚙️ Configurando autonomia teen...');

  const { error: tcErr } = await supabase.from('academy_teen_config').upsert({
    academy_id: ACADEMY_ID,
    teen_can_view_schedule: true,
    teen_can_self_checkin: true,
    teen_can_receive_direct_notifications: true,
    teen_can_view_payments: false,
    teen_can_edit_personal_data: false,
    teen_can_participate_general_ranking: false,
  }, { onConflict: 'academy_id' });
  console.log(tcErr ? `❌ ${tcErr.message}` : '✅ Config teen criada');

  // ═══ 5. PARENTAL CONTROLS ═══
  console.log('\n🔒 Configurando controles parentais...');

  const teenProfiles = ['sophia@email.com', 'lucas.teen@email.com', 'gabriel.teen@email.com', 'valentina@email.com'];
  for (const email of teenProfiles) {
    const { error } = await supabase
      .from('profiles')
      .update({
        parental_controls: {
          canChangeEmail: false,
          canChangePassword: false,
          canViewFinancial: false,
          canSendMessages: true,
          canSelfCheckin: true,
          isSuspended: false,
          suspendedUntil: null,
          suspendedReason: null,
        },
      })
      .eq('email', email);
    console.log(error ? `  ❌ ${email}: ${error.message}` : `  ✅ ${email} — controle parental definido`);
  }

  // ═══ 6. FAMILY INVOICES ═══
  console.log('\n💰 Criando faturas familiares...');

  const months = ['2026-01', '2026-02', '2026-03'];
  const familyInvoices = [];

  for (const month of months) {
    // Patrícia: Sophia (R$149) + Miguel (R$99)
    if (pMap.get('Patrícia Oliveira')) {
      familyInvoices.push({
        guardian_person_id: pMap.get('Patrícia Oliveira'),
        academy_id: ACADEMY_ID,
        reference_month: month,
        total_amount: 248.00,
        status: month === '2026-03' ? 'pending' : 'paid',
        due_date: `${month}-10`,
        paid_at: month === '2026-03' ? null : `${month}-08T10:00:00Z`,
        line_items: JSON.stringify([
          { dependent_name: 'Sophia Oliveira', plan_name: 'BJJ Teen', amount: 149.00 },
          { dependent_name: 'Miguel Pereira', plan_name: 'JiuJitsu Kids', amount: 99.00 },
        ]),
      });
    }
    // Carlos: Gabriel (R$149) + Helena (R$99)
    if (pMap.get('Carlos Pereira')) {
      familyInvoices.push({
        guardian_person_id: pMap.get('Carlos Pereira'),
        academy_id: ACADEMY_ID,
        reference_month: month,
        total_amount: 248.00,
        status: month === '2026-03' ? 'overdue' : 'paid',
        due_date: `${month}-05`,
        paid_at: month === '2026-03' ? null : `${month}-04T14:00:00Z`,
        line_items: JSON.stringify([
          { dependent_name: 'Gabriel Santos', plan_name: 'BJJ Teen', amount: 149.00 },
          { dependent_name: 'Helena Costa', plan_name: 'JiuJitsu Kids', amount: 99.00 },
        ]),
      });
    }
  }

  const { error: fiErr } = await supabase.from('family_invoices').insert(familyInvoices);
  console.log(fiErr ? `❌ ${fiErr.message}` : `✅ ${familyInvoices.length} faturas familiares criadas`);

  // ═══ 7. TIMELINE EVENTS ═══
  console.log('\n📅 Criando eventos na timeline...');

  // Buscar IDs dos profiles pra popular timeline
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, email, display_name, role')
    .eq('academy_id', ACADEMY_ID);

  const timelineEvents = [];
  for (const pr of allProfiles || []) {
    // Matrícula
    timelineEvents.push({
      profile_id: pr.id,
      academy_id: ACADEMY_ID,
      event_type: 'matricula',
      title: `${pr.display_name} se matriculou`,
      description: `Entrada como ${pr.role}`,
      event_date: '2025-06-01T10:00:00Z',
    });

    // Algumas presenças
    for (let i = 0; i < 5; i++) {
      const day = 10 + i * 3;
      timelineEvents.push({
        profile_id: pr.id,
        academy_id: ACADEMY_ID,
        event_type: 'presenca',
        title: 'Check-in realizado',
        description: 'Presença confirmada na turma',
        event_date: `2026-03-${String(day).padStart(2, '0')}T18:00:00Z`,
      });
    }
  }

  const { error: teErr } = await supabase.from('student_timeline_events').insert(timelineEvents.slice(0, 100)); // limitar a 100
  console.log(teErr ? `❌ ${teErr.message}` : `✅ ${Math.min(timelineEvents.length, 100)} eventos de timeline criados`);

  // ═══ 8. DATA HEALTH ═══
  console.log('\n🏥 Detectando inconsistências...');

  const { data: issuesCount, error: dhErr } = await supabase.rpc('detect_data_health_issues', { p_academy_id: ACADEMY_ID });
  console.log(dhErr ? `❌ ${dhErr.message}` : `✅ ${issuesCount} inconsistências detectadas`);

  // ═══ RESUMO ═══
  console.log('\n');
  console.log('🔥 ═══════════════════════════════════════════');
  console.log('🔥 SEED DE USABILIDADE COMPLETO!');
  console.log('🔥 ═══════════════════════════════════════════');
  console.log('');
  console.log('📋 O que foi populado:');
  console.log('   👤 12 pessoas (4 responsáveis, 4 teens, 4 kids)');
  console.log('   👨‍👩‍👧 7 vínculos familiares');
  console.log('   ⚙️ Config de autonomia teen');
  console.log('   🔒 Controles parentais nos 4 teens');
  console.log('   💰 Faturas familiares (jan-mar 2026)');
  console.log('   📅 Eventos de timeline');
  console.log('   🏥 Inconsistências detectadas automaticamente');
  console.log('');
  console.log('🧪 Teste no browser:');
  console.log('   → Login patricia@email.com → ver Central da Família');
  console.log('   → Login admin → ver Painel de Pendências');
  console.log('   → Login admin → Aluno detalhe → ver Timeline');
  console.log('   → Login admin → Configurações → Autonomia Teen');
}

seed().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
```

**Commit:** `feat: usability seed — families, invoices, timeline, data health`

---

## BLOCO 3 — TROCAR SERVICES DE MOCK → REAL

Para cada service criado no MEGA prompt, verificar e implementar o bloco REAL (else do isMock):

### 3A. family.service.ts — já tem bloco real, verificar

```bash
grep -n "isMock\|createClient\|supabase\." lib/api/family.service.ts | head -20
```

Se o bloco real já está implementado (createClient + queries), OK.
Se só tem mock, implementar as queries reais usando os comandos SQL do Bloco 1.

### 3B. family-billing.service.ts — implementar bloco real

```typescript
// No bloco else (real):
const supabase = createClient();
const { data, error } = await supabase
  .from('family_invoices')
  .select('*')
  .eq('guardian_person_id', guardianPersonId)
  .order('reference_month', { ascending: false });
```

### 3C. academy-settings.service.ts — implementar bloco real

```typescript
// getTeenConfig real:
const { data } = await supabase
  .from('academy_teen_config')
  .select('*')
  .eq('academy_id', academyId)
  .maybeSingle();

// Se não existe, retornar defaults e criar registro
if (!data) {
  await supabase.from('academy_teen_config').insert({ academy_id: academyId, ...DEFAULT_TEEN_CONFIG });
  return DEFAULT_TEEN_CONFIG;
}
```

### 3D. data-health.service.ts — implementar bloco real

```typescript
// getDataHealthReport real:
// 1. Chamar RPC detect_data_health_issues para atualizar
await supabase.rpc('detect_data_health_issues', { p_academy_id: academyId });

// 2. Buscar issues não resolvidas
const { data } = await supabase
  .from('data_health_issues')
  .select('*')
  .eq('academy_id', academyId)
  .eq('is_resolved', false)
  .order('severity', { ascending: true });
```

### 3E. Verificar TODOS os services de usabilidade

```bash
# Listar todos os services que foram criados/alterados no MEGA
grep -rl "isMock" lib/api/family*.ts lib/api/academy-settings*.ts lib/api/data-health*.ts 2>/dev/null

# Para cada um, verificar se tem bloco real implementado
for f in lib/api/family.service.ts lib/api/family-billing.service.ts lib/api/academy-settings.service.ts lib/api/data-health.service.ts; do
  echo "=== $f ==="
  grep -c "createClient\|supabase\." "$f" 2>/dev/null || echo "SEM BLOCO REAL"
done
```

Se algum service não tem bloco real, implementar agora seguindo o padrão dos outros services do projeto.

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: switch usability services from mock to real Supabase queries`

---

## BLOCO 4 — EDGE FUNCTION: CRIAR ALUNO PELO ADMIN

### 4A. Edge function para admin.createUser

O admin precisa criar conta Auth para alunos que ele cadastra diretamente. Isso requer `supabase.auth.admin.createUser()` que só funciona com service_role_key (server-side).

Criar `supabase/functions/admin-create-user/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { email, password, name, role, academyId, guardianPersonId, birthDate, phone } = await req.json();

    // Validações
    if (!name) return new Response(JSON.stringify({ error: 'Nome é obrigatório' }), { status: 400 });
    if (!role) return new Response(JSON.stringify({ error: 'Role é obrigatório' }), { status: 400 });
    if (!academyId) return new Response(JSON.stringify({ error: 'Academy ID é obrigatório' }), { status: 400 });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verificar se quem está chamando é admin da academia
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller } } = await supabase.auth.getUser(token);
    if (!caller) return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401 });

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role, academy_id')
      .eq('user_id', caller.id)
      .in('role', ['admin', 'superadmin'])
      .single();

    if (!callerProfile) return new Response(JSON.stringify({ error: 'Sem permissão' }), { status: 403 });
    if (callerProfile.role !== 'superadmin' && callerProfile.academy_id !== academyId) {
      return new Response(JSON.stringify({ error: 'Sem permissão para esta academia' }), { status: 403 });
    }

    // 1. Criar Person
    const { data: person, error: personErr } = await supabase
      .from('people')
      .insert({
        full_name: name,
        email: email || null,
        phone: phone || null,
        birth_date: birthDate || null,
      })
      .select()
      .single();

    if (personErr) throw personErr;

    let userId = null;
    let tempPassword = null;

    // 2. Criar Auth account (se tem email)
    if (email) {
      tempPassword = password || generateTempPassword();
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name, role },
      });

      if (authErr) throw authErr;
      userId = authData.user.id;

      // Vincular person à account
      await supabase.from('people').update({ account_id: userId }).eq('id', person.id);
    }

    // 3. Criar Profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        person_id: person.id,
        academy_id: academyId,
        role,
        display_name: name,
        email: email || null,
        phone: phone || null,
        lifecycle_status: email ? 'active' : 'pending',
        needs_password_change: !!email,
      })
      .select()
      .single();

    if (profileErr) throw profileErr;

    // 4. Criar FamilyLink (se é menor e tem guardianPersonId)
    if (guardianPersonId && ['aluno_kids', 'aluno_teen'].includes(role)) {
      await supabase.from('family_links').insert({
        guardian_person_id: guardianPersonId,
        dependent_person_id: person.id,
        relationship: 'responsavel_legal',
        is_primary_guardian: true,
        is_financial_responsible: true,
        receives_notifications: true,
        receives_billing: true,
      });
    }

    // 5. Criar evento na timeline
    await supabase.from('student_timeline_events').insert({
      profile_id: profile.id,
      academy_id: academyId,
      event_type: 'matricula',
      title: `${name} foi cadastrado`,
      description: `Cadastro realizado por ${callerProfile.role === 'superadmin' ? 'Super Admin' : 'Admin'}`,
    });

    return new Response(JSON.stringify({
      success: true,
      personId: person.id,
      profileId: profile.id,
      userId,
      tempPassword: tempPassword, // só retorna se criou auth
      message: email
        ? `Aluno criado. Senha temporária: ${tempPassword}`
        : 'Aluno criado sem login (sem email)',
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password + '!1'; // garantir maiúscula + número + especial
}
```

### 4B. Edge function para evolução de perfil

Criar `supabase/functions/evolve-profile/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { profileId, newRole, reason, createAuth, email, password } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verificar permissão do caller (admin)
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user: caller } } = await supabase.auth.getUser(token!);

    // Buscar perfil atual
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('*, people(*)')
      .eq('id', profileId)
      .single();

    if (!currentProfile) {
      return new Response(JSON.stringify({ error: 'Perfil não encontrado' }), { status: 404 });
    }

    const oldRole = currentProfile.role;

    // Preservar dados relevantes
    const preservedData: Record<string, unknown> = {};
    if (oldRole === 'aluno_kids') {
      // Buscar estrelas, figurinhas do kids
      preservedData.previousRole = 'aluno_kids';
    }
    if (oldRole === 'aluno_teen') {
      // Buscar XP, level, conquistas do teen
      preservedData.previousRole = 'aluno_teen';
    }

    // Se precisa criar auth (Kids→Teen com login)
    let userId = currentProfile.user_id;
    if (createAuth && email && password && !userId) {
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: currentProfile.display_name, role: newRole },
      });

      if (authErr) throw authErr;
      userId = authData.user.id;

      // Vincular person à account
      if (currentProfile.person_id) {
        await supabase.from('people').update({ account_id: userId }).eq('id', currentProfile.person_id);
      }
    }

    // Atualizar role do perfil
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        role: newRole,
        user_id: userId,
        lifecycle_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId);

    if (updateErr) throw updateErr;

    // Log da evolução
    await supabase.from('profile_evolution_log').insert({
      profile_id: profileId,
      from_role: oldRole,
      to_role: newRole,
      reason,
      evolved_by: caller?.id ? (await supabase.from('profiles').select('id').eq('user_id', caller.id).single()).data?.id : null,
      preserved_data: preservedData,
    });

    // Timeline event
    await supabase.from('student_timeline_events').insert({
      profile_id: profileId,
      academy_id: currentProfile.academy_id,
      event_type: 'evolucao_perfil',
      title: `Promovido de ${oldRole} para ${newRole}`,
      description: reason,
      metadata: preservedData,
    });

    return new Response(JSON.stringify({
      success: true,
      message: `Perfil evoluído de ${oldRole} para ${newRole}`,
      preservedData,
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: edge functions — admin-create-user + evolve-profile`

---

## BLOCO 5 — ATUALIZAR SERVICES PARA CHAMAR EDGE FUNCTIONS

### 5A. family.service.ts — evolveProfile real

No bloco real do `evolveProfile`:
```typescript
const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();

const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/evolve-profile`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`,
  },
  body: JSON.stringify(data),
});

const result = await response.json();
if (!response.ok) throw new Error(result.error);
return result;
```

### 5B. Admin create student — chamar edge function

No componente/página onde admin cria aluno, no bloco real:
```typescript
const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();

const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-create-user`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`,
  },
  body: JSON.stringify({
    email: form.email || null,
    name: form.name,
    role: form.role,
    academyId: profile.academyId,
    guardianPersonId: form.guardianPersonId || null,
    birthDate: form.birthDate || null,
    phone: form.phone || null,
  }),
});
```

### 5C. Check-in com regra por perfil — implementar validação real

No `supabase/functions/process-checkin/index.ts` (que já existe):
Adicionar validação ANTES de processar o check-in:

```typescript
// Buscar role do aluno
const { data: studentProfile } = await supabase
  .from('profiles')
  .select('role, parental_controls, academy_id')
  .eq('id', studentId)
  .single();

if (studentProfile.role === 'aluno_kids') {
  // Kids: verificar se checkin_by é staff ou responsável
  if (!checkinBy || !['admin', 'professor', 'recepcionista', 'responsavel'].includes(checkinBy.role)) {
    return new Response(JSON.stringify({
      error: 'Check-in de aluno Kids deve ser realizado por responsável, professor ou recepção'
    }), { status: 403 });
  }
}

if (studentProfile.role === 'aluno_teen') {
  // Teen: verificar config da academia + controle parental
  const { data: teenConfig } = await supabase
    .from('academy_teen_config')
    .select('teen_can_self_checkin')
    .eq('academy_id', studentProfile.academy_id)
    .single();

  const parentalControls = studentProfile.parental_controls || {};

  if (!teenConfig?.teen_can_self_checkin || parentalControls.isSuspended) {
    if (!checkinBy || checkinBy.role === 'aluno_teen') {
      return new Response(JSON.stringify({
        error: 'Check-in autônomo não permitido para este aluno'
      }), { status: 403 });
    }
  }
}
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: wire services to edge functions — real Supabase operations`

---

## BLOCO 6 — INSTALAR DEPENDÊNCIAS E FINALIZAR PARCIAIS

### 6A. Instalar papaparse para importação CSV

```bash
pnpm add papaparse
pnpm add -D @types/papaparse
```

### 6B. Implementar parse CSV real no wizard de importação

Verificar `app/(admin)/admin/alunos/page.tsx` ou `/admin/wizard`:
- Importar `Papa from 'papaparse'`
- No handler de upload:
```typescript
import Papa from 'papaparse';

function handleFileUpload(file: File) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      const rows = results.data as Record<string, string>[];
      setPreviewData(rows);
      // Validar cada linha
      const validated = rows.map((row, i) => ({
        ...row,
        _valid: !!row.Nome && row.Nome.length >= 3,
        _errors: [
          !row.Nome ? 'Nome obrigatório' : '',
          row.Email && !row.Email.includes('@') ? 'Email inválido' : '',
        ].filter(Boolean),
        _row: i + 1,
      }));
      setValidatedData(validated);
      setValidCount(validated.filter(r => r._valid).length);
      setErrorCount(validated.filter(r => !r._valid).length);
    },
    error: (err) => {
      toast.error(`Erro ao ler arquivo: ${err.message}`);
    },
  });
}
```

### 6C. Verificar que busca de academia pública funciona

Em `app/(auth)/buscar-academia/page.tsx` (se foi criada no MEGA):
- O bloco real deve buscar academias públicas:
```typescript
const { data } = await supabase
  .from('academies')
  .select('id, name, slug, city, state, logo_url, modalities')
  .ilike('name', `%${searchTerm}%`)
  .limit(10);
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: papaparse CSV import + public academy search — real queries`

---

## BLOCO 7 — TESTE END-TO-END E VERIFICAÇÃO

### 7A. Script de verificação completo

Criar `scripts/verify-usability.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function verify() {
  console.log('🔍 Verificando tabelas de usabilidade...\n');

  const tables = [
    'people',
    'family_links',
    'academy_teen_config',
    'profile_evolution_log',
    'data_health_issues',
    'family_invoices',
    'student_timeline_events',
  ];

  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: ${count} registros`);
    }
  }

  // Verificar colunas novas em profiles
  console.log('\n🔍 Verificando colunas novas em profiles...');
  const { data: sampleProfile } = await supabase
    .from('profiles')
    .select('person_id, lifecycle_status, parental_controls, needs_password_change')
    .limit(1)
    .single();

  if (sampleProfile) {
    console.log(`✅ person_id: ${sampleProfile.person_id !== undefined ? 'existe' : 'FALTA'}`);
    console.log(`✅ lifecycle_status: ${sampleProfile.lifecycle_status !== undefined ? 'existe' : 'FALTA'}`);
    console.log(`✅ parental_controls: ${sampleProfile.parental_controls !== undefined ? 'existe' : 'FALTA'}`);
    console.log(`✅ needs_password_change: ${sampleProfile.needs_password_change !== undefined ? 'existe' : 'FALTA'}`);
  }

  // Verificar helper functions
  console.log('\n🔍 Verificando funções...');
  const { data: guardians, error: gErr } = await supabase.rpc('get_guardians', {
    p_dependent_id: '00000000-0000-0000-0000-000000000000' // UUID fake, só pra testar se a função existe
  });
  console.log(gErr?.message?.includes('function') ? '❌ get_guardians: NÃO EXISTE' : '✅ get_guardians: existe');

  const { error: dErr } = await supabase.rpc('get_dependents', {
    p_guardian_id: '00000000-0000-0000-0000-000000000000'
  });
  console.log(dErr?.message?.includes('function') ? '❌ get_dependents: NÃO EXISTE' : '✅ get_dependents: existe');

  const { error: dhErr } = await supabase.rpc('detect_data_health_issues', {
    p_academy_id: '00000000-0000-0000-0000-000000000000'
  });
  console.log(dhErr?.message?.includes('function') ? '❌ detect_data_health_issues: NÃO EXISTE' : '✅ detect_data_health_issues: existe');

  // Verificar vínculos familiares
  console.log('\n🔍 Verificando vínculos familiares...');
  const { data: links } = await supabase
    .from('family_links')
    .select('*, guardian:guardian_person_id(full_name), dependent:dependent_person_id(full_name)')
    .limit(10);

  for (const link of links || []) {
    console.log(`  👨‍👩‍👧 ${(link.guardian as { full_name: string })?.full_name} → ${(link.dependent as { full_name: string })?.full_name} (${link.relationship})`);
  }

  // Verificar edge functions
  console.log('\n🔍 Verificando edge functions...');
  const edgeFunctions = ['admin-create-user', 'evolve-profile'];
  for (const fn of edgeFunctions) {
    const exists = await Deno?.stat?.(`supabase/functions/${fn}/index.ts`).catch(() => null);
    // Fallback: verificar se o arquivo existe localmente
    const fs = await import('fs');
    const localExists = fs.existsSync(`supabase/functions/${fn}/index.ts`);
    console.log(localExists ? `✅ ${fn}: arquivo existe` : `❌ ${fn}: FALTA`);
  }

  console.log('\n🔥 Verificação completa!');
}

verify().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
```

### 7B. Rodar verificação

```bash
npx tsx scripts/verify-usability.ts
```

Se alguma tabela ou função não existe → a migration não foi rodada. Gerar instrução para o Gregory rodar no Supabase SQL Editor.

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: verify-usability script + end-to-end validation`

---

## BLOCO 8 — GERAR INSTRUÇÕES MANUAIS PARA O GREGORY

### 8A. Criar arquivo de instruções

Arquivo: `INSTRUCOES_USABILIDADE.md`

```markdown
# Instruções Manuais — Ativar Usabilidade no Supabase

## 1. Rodar a Migration

Vá em: https://supabase.com/dashboard → blackbelt-production → SQL Editor

Cole o conteúdo completo do arquivo:
`supabase/migrations/070_usability_tables.sql`

Clique RUN. Deve retornar "Success. No rows returned."

## 2. Rodar o Seed

No terminal do projeto:

```bash
SUPABASE_SERVICE_ROLE_KEY=SUA_KEY NEXT_PUBLIC_SUPABASE_URL=https://tdplmmodmumryzdosmpv.supabase.co npx tsx scripts/seed-usability.ts
```

## 3. Verificar

```bash
SUPABASE_SERVICE_ROLE_KEY=SUA_KEY NEXT_PUBLIC_SUPABASE_URL=https://tdplmmodmumryzdosmpv.supabase.co npx tsx scripts/verify-usability.ts
```

## 4. Deploy Edge Functions

```bash
supabase functions deploy admin-create-user
supabase functions deploy evolve-profile
```

## 5. Testar no Browser

- https://blackbelts.com.br/login
- Login: patricia@email.com / BlackBelt@2026 → Central da Família
- Login: admin@guerreiros.com / BlackBelt@2026 → Pendências + Timeline + Config Teen
```

**Commit:** `docs: manual instructions for Supabase usability setup`

---

## COMANDO DE RETOMADA

```
Continue de onde parou no BLACKBELT_USABILIDADE_REAL.md. Verifique estado:
ls supabase/migrations/070_usability_tables.sql 2>/dev/null && echo "B1 OK" || echo "B1 FALTA"
ls scripts/seed-usability.ts 2>/dev/null && echo "B2 OK" || echo "B2 FALTA"
grep -c "createClient" lib/api/family.service.ts 2>/dev/null && echo "B3 OK" || echo "B3 FALTA"
ls supabase/functions/admin-create-user/index.ts 2>/dev/null && echo "B4 OK" || echo "B4 FALTA"
grep -c "edge.*function\|functions/v1" lib/api/family.service.ts 2>/dev/null && echo "B5 OK" || echo "B5 FALTA"
grep "papaparse" package.json 2>/dev/null && echo "B6 OK" || echo "B6 FALTA"
ls scripts/verify-usability.ts 2>/dev/null && echo "B7 OK" || echo "B7 FALTA"
ls INSTRUCOES_USABILIDADE.md 2>/dev/null && echo "B8 OK" || echo "B8 FALTA"
pnpm typecheck 2>&1 | tail -5
Continue da próxima seção incompleta. ZERO erros. Commit e push.
```
