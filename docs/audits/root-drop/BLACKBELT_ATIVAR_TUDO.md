# BLACKBELT v2 — ATIVAR TUDO NO SUPABASE REAL
## Migration Consolidada + Seed Completo + Verificação End-to-End
## Cobre: MEGA + REAL + MARCA_FINAL + COMPLEMENTAR — tudo funcionando de verdade

> **INSTRUÇÕES DE EXECUÇÃO:**
> - Execute BLOCO a BLOCO, na ordem (B1 → B2 → ... → B10)
> - Cada BLOCO termina com: `pnpm typecheck && pnpm build` → commit → push
> - Este prompt ASSUME que os 4 prompts anteriores já foram executados
> - Todos os services, components, pages, edge functions JÁ EXISTEM
> - Agora vamos: consolidar migrations, rodar seed, trocar mock→real, testar tudo
>
> **PRÉ-VERIFICAÇÃO — rodar ANTES de começar:**
> ```bash
> echo "=== VERIFICAÇÃO DOS 4 PROMPTS ==="
> echo ""
> echo "--- MEGA (usabilidade) ---"
> ls lib/api/family.service.ts 2>/dev/null && echo "✅ family.service" || echo "❌ family.service"
> ls components/parent/AddChildForm.tsx 2>/dev/null && echo "✅ AddChildForm" || echo "❌ AddChildForm"
> ls components/admin/CreateFamilyWizard.tsx 2>/dev/null && echo "✅ CreateFamilyWizard" || echo "❌ CreateFamilyWizard"
> ls lib/api/family-billing.service.ts 2>/dev/null && echo "✅ family-billing" || echo "❌ family-billing"
> ls lib/api/data-health.service.ts 2>/dev/null && echo "✅ data-health" || echo "❌ data-health"
> ls components/admin/EvolveProfileModal.tsx 2>/dev/null && echo "✅ EvolveProfileModal" || echo "❌ EvolveProfileModal"
> ls components/admin/StudentTimeline.tsx 2>/dev/null && echo "✅ StudentTimeline" || echo "❌ StudentTimeline"
> echo ""
> echo "--- REAL (supabase) ---"
> ls scripts/seed-usability.ts 2>/dev/null && echo "✅ seed-usability" || echo "❌ seed-usability"
> echo ""
> echo "--- MARCA_FINAL (compliance) ---"
> ls supabase/functions/delete-account/index.ts 2>/dev/null && echo "✅ delete-account" || echo "❌ delete-account"
> ls components/legal/ParentalConsentFlow.tsx 2>/dev/null && echo "✅ ParentalConsentFlow" || echo "❌ ParentalConsentFlow"
> ls lib/hooks/usePagination.ts 2>/dev/null && echo "✅ usePagination" || echo "❌ usePagination"
> ls lib/hooks/useQuery.ts 2>/dev/null && echo "✅ useQuery" || echo "❌ useQuery"
> ls lib/email/resend.ts 2>/dev/null && echo "✅ resend" || echo "❌ resend"
> ls lib/utils/whatsapp.ts 2>/dev/null && echo "✅ whatsapp" || echo "❌ whatsapp"
> ls lib/utils/rate-limit.ts 2>/dev/null && echo "✅ rate-limit" || echo "❌ rate-limit"
> ls lib/utils/sanitize.ts 2>/dev/null && echo "✅ sanitize" || echo "❌ sanitize"
> echo ""
> echo "--- COMPLEMENTAR (asaas/audit) ---"
> ls lib/payment/asaas.ts 2>/dev/null && echo "✅ asaas SDK" || echo "❌ asaas SDK"
> ls app/api/webhooks/asaas/route.ts 2>/dev/null && echo "✅ asaas webhook" || echo "❌ asaas webhook"
> ls lib/api/audit.service.ts 2>/dev/null && echo "✅ audit service" || echo "❌ audit service"
> ls components/auth/AuthGuard.tsx 2>/dev/null && echo "✅ AuthGuard" || echo "❌ AuthGuard"
> ls components/trial/TrialBanner.tsx 2>/dev/null && echo "✅ TrialBanner" || echo "❌ TrialBanner"
> echo ""
> echo "=== FIM VERIFICAÇÃO ==="
> ```
>
> Se MAIS DE 5 itens deram ❌, PARE e rode os prompts anteriores primeiro.
> Se até 5 deram ❌, anote quais faltam — vamos criar o que falta no B1.

---

## BLOCO 1 — INVENTÁRIO E CRIAÇÃO DO QUE FALTA

### 1A. Inventariar o que realmente existe

```bash
echo "=== MIGRATIONS ==="
ls -la supabase/migrations/*.sql | tail -20
echo ""
echo "=== EDGE FUNCTIONS ==="
ls -d supabase/functions/*/ 2>/dev/null
echo ""
echo "=== SERVICES ==="
ls lib/api/*.service.ts | wc -l
echo "Total services"
echo ""
echo "=== PAGES ==="
find app -name "page.tsx" | wc -l
echo "Total pages"
echo ""
echo "=== PACKAGE.JSON DEPS ==="
grep -E "resend|papaparse|jspdf|axios" package.json || echo "Deps faltando"
```

### 1B. Instalar dependências que faltam

```bash
# Verificar e instalar o que falta
grep -q "resend" package.json || pnpm add resend
grep -q "papaparse" package.json || pnpm add papaparse && pnpm add -D @types/papaparse
grep -q "jspdf" package.json || pnpm add jspdf jspdf-autotable
grep -q "axios" package.json || pnpm add axios
```

### 1C. Se algum arquivo dos 4 prompts não foi criado, criar agora

Para cada ❌ da pré-verificação: criar o arquivo com implementação mínima funcional.
NÃO recrie se já existe (✅). Apenas preencha os gaps.

**Arquivos críticos que DEVEM existir (criar se faltar):**

Se `lib/payment/asaas.ts` não existe → criar com o SDK completo (createCustomer, createPayment, createSubscription, mapAsaasStatus)
Se `app/api/webhooks/asaas/route.ts` não existe → criar webhook handler
Se `lib/api/audit.service.ts` não existe → criar com logAudit
Se `components/auth/AuthGuard.tsx` não existe → criar com role validation
Se `lib/hooks/useQuery.ts` não existe → criar com retry + token refresh
Se `lib/hooks/usePagination.ts` não existe → criar hook de paginação
Se `lib/utils/sanitize.ts` não existe → criar com sanitizeInput, isValidEmail, isValidCPF
Se `lib/utils/rate-limit.ts` não existe → criar rate limiter em memória

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `fix: fill gaps from all 4 prompts — ensure all files exist`

---

## BLOCO 2 — MIGRATION CONSOLIDADA MASTER

Criar UMA migration que cobre TUDO que os 4 prompts precisam.
Se migrations individuais já existem (070, 071, 072...), verificar se cobrem tudo.
Se não cobrem, criar esta migration consolidada.

### 2A. Verificar estado atual das migrations

```bash
# Listar migrations existentes relacionadas a usabilidade
ls supabase/migrations/*people* supabase/migrations/*family* supabase/migrations/*usability* supabase/migrations/*audit* supabase/migrations/*webhook* 2>/dev/null

# Verificar conteúdo
for f in supabase/migrations/07*.sql; do
  echo "=== $f ==="
  head -3 "$f"
  echo "..."
done
```

### 2B. Criar migration consolidada (se necessário)

Se as migrations existentes NÃO cobrem todas as tabelas abaixo, criar:

Arquivo: `supabase/migrations/080_everything_real.sql`

```sql
-- ═══════════════════════════════════════════════════════════════
-- BLACKBELT v2 — MIGRATION CONSOLIDADA MASTER
-- Cobre: MEGA + REAL + MARCA_FINAL + COMPLEMENTAR
-- Rodar no Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════

-- Usar IF NOT EXISTS em tudo para ser idempotente (pode rodar múltiplas vezes)

-- ═══ 1. PEOPLE ═══
CREATE TABLE IF NOT EXISTS people (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name VARCHAR(200) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  birth_date DATE,
  phone VARCHAR(20),
  email VARCHAR(255),
  gender VARCHAR(20) CHECK (gender IS NULL OR gender IN ('masculino', 'feminino', 'outro', 'nao_informado')),
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

-- ═══ 2. FAMILY_LINKS ═══
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

-- ═══ 3. PROFILES — colunas novas ═══
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS person_id UUID REFERENCES people(id);
CREATE INDEX IF NOT EXISTS idx_profiles_person ON profiles(person_id) WHERE person_id IS NOT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lifecycle_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parental_controls JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS needs_password_change BOOLEAN DEFAULT false;

-- ═══ 4. ACADEMY_TEEN_CONFIG ═══
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

-- ═══ 5. PROFILE_EVOLUTION_LOG ═══
CREATE TABLE IF NOT EXISTS profile_evolution_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_role VARCHAR(30) NOT NULL,
  to_role VARCHAR(30) NOT NULL,
  reason TEXT,
  evolved_by UUID REFERENCES profiles(id),
  preserved_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ 6. DATA_HEALTH_ISSUES ═══
CREATE TABLE IF NOT EXISTS data_health_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  category VARCHAR(30) NOT NULL CHECK (category IN ('cadastro', 'financeiro', 'turma', 'familia', 'documento')),
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
  entity_type VARCHAR(30) NOT NULL,
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

-- ═══ 7. FAMILY_INVOICES ═══
CREATE TABLE IF NOT EXISTS family_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  reference_month VARCHAR(7) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  payment_method VARCHAR(30),
  payment_link TEXT,
  line_items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_family_invoices_guardian ON family_invoices(guardian_person_id);
CREATE INDEX IF NOT EXISTS idx_family_invoices_academy ON family_invoices(academy_id, reference_month);

-- ═══ 8. STUDENT_TIMELINE_EVENTS ═══
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

-- ═══ 9. ACCOUNT_DELETION_LOG ═══
CREATE TABLE IF NOT EXISTS account_deletion_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_hash VARCHAR(64) NOT NULL,
  profiles_archived UUID[] DEFAULT '{}',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address VARCHAR(45),
  expires_at TIMESTAMPTZ DEFAULT now() + interval '5 years'
);

-- ═══ 10. AUDIT_LOG ═══
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id),
  user_id UUID REFERENCES auth.users(id),
  profile_id UUID REFERENCES profiles(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_academy ON audit_log(academy_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- ═══ 11. WEBHOOK_LOG ═══
CREATE TABLE IF NOT EXISTS webhook_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source VARCHAR(30) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  external_id VARCHAR(255),
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_webhook_log_source ON webhook_log(source, event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_log_external ON webhook_log(external_id);

-- ═══ 12. PAYMENT_CUSTOMERS ═══
CREATE TABLE IF NOT EXISTS payment_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID REFERENCES people(id),
  academy_id UUID NOT NULL REFERENCES academies(id),
  external_customer_id VARCHAR(255) NOT NULL,
  provider VARCHAR(30) DEFAULT 'asaas',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(person_id, academy_id, provider)
);

-- ═══ 13. SUPPORT_TICKETS ═══
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  academy_id UUID REFERENCES academies(id),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ 14. INVOICES — colunas de pagamento ═══
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS external_payment_id VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS net_value DECIMAL(10,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_link TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pix_qr_code TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pix_payload TEXT;

-- ═══ 15. ANNOUNCEMENTS — colunas de segmentação ═══
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_config JSONB DEFAULT '{}';
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS recipient_count INTEGER DEFAULT 0;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS read_count INTEGER DEFAULT 0;

-- ═══════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION calculate_age(p_birth_date DATE)
RETURNS INTEGER AS $$
  SELECT EXTRACT(YEAR FROM age(CURRENT_DATE, p_birth_date))::INTEGER;
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION get_guardians(p_dependent_id UUID)
RETURNS TABLE(
  guardian_id UUID, guardian_name VARCHAR, relationship VARCHAR,
  is_primary BOOLEAN, is_financial BOOLEAN, can_authorize BOOLEAN,
  receives_notifications BOOLEAN, receives_billing BOOLEAN,
  phone VARCHAR, email VARCHAR
) AS $$
  SELECT p.id, p.full_name, fl.relationship,
    fl.is_primary_guardian, fl.is_financial_responsible,
    fl.can_authorize_events, fl.receives_notifications,
    fl.receives_billing, p.phone, p.email
  FROM family_links fl
  JOIN people p ON p.id = fl.guardian_person_id
  WHERE fl.dependent_person_id = p_dependent_id
  ORDER BY fl.is_primary_guardian DESC;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_dependents(p_guardian_id UUID)
RETURNS TABLE(
  dependent_id UUID, dependent_name VARCHAR, birth_date DATE,
  relationship VARCHAR, phone VARCHAR, email VARCHAR, medical_notes TEXT
) AS $$
  SELECT p.id, p.full_name, p.birth_date,
    fl.relationship, p.phone, p.email, p.medical_notes
  FROM family_links fl
  JOIN people p ON p.id = fl.dependent_person_id
  WHERE fl.guardian_person_id = p_guardian_id
  ORDER BY p.birth_date ASC;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION detect_data_health_issues(p_academy_id UUID)
RETURNS INTEGER AS $$
DECLARE
  issues_found INTEGER := 0;
  v_count INTEGER;
BEGIN
  -- Limpar issues resolvidas antigas
  DELETE FROM data_health_issues
  WHERE academy_id = p_academy_id AND is_resolved = true
    AND resolved_at < now() - interval '30 days';

  -- Alunos menores sem responsável
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT p_academy_id, 'familia', 'high', 'profile', pr.id,
    'Aluno ' || COALESCE(pr.display_name, 'sem nome') || ' é menor mas não tem responsável vinculado',
    'Vincular responsável', '/admin/alunos/' || pr.id
  FROM profiles pr
  WHERE pr.academy_id = p_academy_id
    AND pr.role IN ('aluno_kids', 'aluno_teen')
    AND COALESCE(pr.lifecycle_status, 'active') = 'active'
    AND (pr.person_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM family_links fl WHERE fl.dependent_person_id = pr.person_id
    ))
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.category = 'familia' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  issues_found := issues_found + v_count;

  -- Alunos sem turma
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT p_academy_id, 'turma', 'medium', 'profile', pr.id,
    'Aluno ' || COALESCE(pr.display_name, 'sem nome') || ' não está em nenhuma turma',
    'Definir turma', '/admin/alunos/' || pr.id
  FROM profiles pr
  WHERE pr.academy_id = p_academy_id
    AND pr.role IN ('aluno_adulto', 'aluno_teen', 'aluno_kids')
    AND COALESCE(pr.lifecycle_status, 'active') = 'active'
    AND NOT EXISTS (SELECT 1 FROM class_enrollments ce WHERE ce.student_id = pr.id AND ce.status = 'active')
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.category = 'turma' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  issues_found := issues_found + v_count;

  -- Kids que fizeram 13 anos
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT p_academy_id, 'cadastro', 'low', 'profile', pr.id,
    COALESCE(pr.display_name, 'Aluno') || ' completou 13 anos — considere promover para Teen',
    'Promover para Teen', '/admin/alunos/' || pr.id
  FROM profiles pr
  JOIN people pe ON pe.id = pr.person_id
  WHERE pr.academy_id = p_academy_id
    AND pr.role = 'aluno_kids'
    AND COALESCE(pr.lifecycle_status, 'active') = 'active'
    AND pe.birth_date IS NOT NULL
    AND calculate_age(pe.birth_date) >= 13
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.description LIKE '%completou 13%' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  issues_found := issues_found + v_count;

  -- Teens que fizeram 18 anos
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT p_academy_id, 'cadastro', 'low', 'profile', pr.id,
    COALESCE(pr.display_name, 'Aluno') || ' completou 18 anos — considere promover para Adulto',
    'Promover para Adulto', '/admin/alunos/' || pr.id
  FROM profiles pr
  JOIN people pe ON pe.id = pr.person_id
  WHERE pr.academy_id = p_academy_id
    AND pr.role = 'aluno_teen'
    AND COALESCE(pr.lifecycle_status, 'active') = 'active'
    AND pe.birth_date IS NOT NULL
    AND calculate_age(pe.birth_date) >= 18
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.description LIKE '%completou 18%' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  issues_found := issues_found + v_count;

  RETURN issues_found;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_teen_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_evolution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_health_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deletion_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- People
DROP POLICY IF EXISTS "people_own" ON people;
CREATE POLICY "people_own" ON people FOR SELECT USING (account_id = auth.uid());
DROP POLICY IF EXISTS "people_admin" ON people;
CREATE POLICY "people_admin" ON people FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin'))
);
DROP POLICY IF EXISTS "people_guardian" ON people;
CREATE POLICY "people_guardian" ON people FOR SELECT USING (
  EXISTS (SELECT 1 FROM family_links fl JOIN people gp ON gp.id = fl.guardian_person_id
  WHERE fl.dependent_person_id = people.id AND gp.account_id = auth.uid())
);

-- Family links
DROP POLICY IF EXISTS "fl_guardian" ON family_links;
CREATE POLICY "fl_guardian" ON family_links FOR ALL USING (
  EXISTS (SELECT 1 FROM people p WHERE p.id = family_links.guardian_person_id AND p.account_id = auth.uid())
);
DROP POLICY IF EXISTS "fl_admin" ON family_links;
CREATE POLICY "fl_admin" ON family_links FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin'))
);

-- Academy teen config
DROP POLICY IF EXISTS "tc_admin" ON academy_teen_config;
CREATE POLICY "tc_admin" ON academy_teen_config FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin')
  AND (p.academy_id = academy_teen_config.academy_id OR p.role = 'superadmin'))
);

-- Data health
DROP POLICY IF EXISTS "dh_admin" ON data_health_issues;
CREATE POLICY "dh_admin" ON data_health_issues FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin')
  AND (p.academy_id = data_health_issues.academy_id OR p.role = 'superadmin'))
);

-- Family invoices
DROP POLICY IF EXISTS "fi_guardian" ON family_invoices;
CREATE POLICY "fi_guardian" ON family_invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM people p WHERE p.id = family_invoices.guardian_person_id AND p.account_id = auth.uid())
);
DROP POLICY IF EXISTS "fi_admin" ON family_invoices;
CREATE POLICY "fi_admin" ON family_invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin')
  AND (p.academy_id = family_invoices.academy_id OR p.role = 'superadmin'))
);

-- Timeline
DROP POLICY IF EXISTS "tl_own" ON student_timeline_events;
CREATE POLICY "tl_own" ON student_timeline_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = student_timeline_events.profile_id AND p.user_id = auth.uid())
);
DROP POLICY IF EXISTS "tl_staff" ON student_timeline_events;
CREATE POLICY "tl_staff" ON student_timeline_events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'professor', 'superadmin')
  AND (p.academy_id = student_timeline_events.academy_id OR p.role = 'superadmin'))
);
DROP POLICY IF EXISTS "tl_guardian" ON student_timeline_events;
CREATE POLICY "tl_guardian" ON student_timeline_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles pr JOIN people pe ON pe.id = pr.person_id
    JOIN family_links fl ON fl.dependent_person_id = pe.id
    JOIN people gp ON gp.id = fl.guardian_person_id
    WHERE pr.id = student_timeline_events.profile_id AND gp.account_id = auth.uid()
  )
);

-- Audit log
DROP POLICY IF EXISTS "al_admin" ON audit_log;
CREATE POLICY "al_admin" ON audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin')
  AND (p.academy_id = audit_log.academy_id OR p.role = 'superadmin'))
);
DROP POLICY IF EXISTS "al_insert" ON audit_log;
CREATE POLICY "al_insert" ON audit_log FOR INSERT WITH CHECK (true);

-- Webhook log, deletion log, evolution log, payment customers, support tickets
DROP POLICY IF EXISTS "wl_super" ON webhook_log;
CREATE POLICY "wl_super" ON webhook_log FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'superadmin')
);
DROP POLICY IF EXISTS "dl_super" ON account_deletion_log;
CREATE POLICY "dl_super" ON account_deletion_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'superadmin')
);
DROP POLICY IF EXISTS "el_admin" ON profile_evolution_log;
CREATE POLICY "el_admin" ON profile_evolution_log FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin'))
);
DROP POLICY IF EXISTS "pc_admin" ON payment_customers;
CREATE POLICY "pc_admin" ON payment_customers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin'))
);
DROP POLICY IF EXISTS "st_all" ON support_tickets;
CREATE POLICY "st_all" ON support_tickets FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "st_admin" ON support_tickets;
CREATE POLICY "st_admin" ON support_tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin'))
);
```

### 2C. Salvar e gerar arquivo SQL para o Gregory

Criar `MIGRATION_MASTER_PARA_RODAR.sql` na raiz com o conteúdo acima.
Este é o arquivo que o Gregory vai colar no Supabase SQL Editor.

**Commit:** `feat: consolidated master migration — 15 tables, 4 functions, full RLS`

---

## BLOCO 3 — SEED COMPLETO

### 3A. Criar script de seed master

Criar `scripts/seed-everything.ts`:

Este script deve:
1. Verificar que as tabelas existem (se não, avisar pra rodar a migration primeiro)
2. Buscar o ID da academia "Guerreiros do Tatame"
3. Criar 12 pessoas (4 responsáveis, 4 teens, 4 kids)
4. Criar 7+ vínculos familiares
5. Vincular profiles existentes a people (por email)
6. Criar academy_teen_config com defaults
7. Definir parental_controls nos teens
8. Criar family_invoices (3 meses de faturas)
9. Criar timeline events (matrícula + presenças)
10. Rodar detect_data_health_issues
11. Criar audit_log entries de exemplo
12. Imprimir relatório final com contagem por tabela

```bash
# Estrutura do script:
# import { createClient } from '@supabase/supabase-js';
# const supabase = createClient(url, serviceRoleKey);
#
# async function seed() {
#   // 1. Verificar tabelas
#   // 2. Buscar academy
#   // 3-12. Popular tudo
#   // 13. Relatório
# }
```

IMPORTANTE: Usar os mesmos dados do seed principal que já existe (nomes, emails, credenciais consistentes com os mock users do AuthContext).

### 3B. Script de verificação

Criar `scripts/verify-everything.ts`:

```typescript
// Verificar TODAS as tabelas novas e contar registros:
const tables = [
  'people', 'family_links', 'academy_teen_config',
  'profile_evolution_log', 'data_health_issues',
  'family_invoices', 'student_timeline_events',
  'account_deletion_log', 'audit_log', 'webhook_log',
  'payment_customers', 'support_tickets',
];

for (const table of tables) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  console.log(error ? `❌ ${table}: ${error.message}` : `✅ ${table}: ${count} registros`);
}

// Verificar colunas novas em profiles
const { data: sample } = await supabase.from('profiles').select('person_id, lifecycle_status, parental_controls, needs_password_change').limit(1).single();
console.log('\nColunas em profiles:');
console.log(`  person_id: ${sample?.person_id !== undefined ? '✅' : '❌'}`);
console.log(`  lifecycle_status: ${sample?.lifecycle_status !== undefined ? '✅' : '❌'}`);
console.log(`  parental_controls: ${sample?.parental_controls !== undefined ? '✅' : '❌'}`);
console.log(`  needs_password_change: ${sample?.needs_password_change !== undefined ? '✅' : '❌'}`);

// Verificar colunas novas em invoices
const { data: inv } = await supabase.from('invoices').select('external_payment_id, payment_method, payment_link').limit(1).maybeSingle();
console.log('\nColunas em invoices:');
console.log(`  external_payment_id: ${inv !== null ? '✅' : '⚠️ sem dados'}`);

// Verificar funções
console.log('\nFunções:');
for (const fn of ['get_guardians', 'get_dependents', 'detect_data_health_issues', 'calculate_age']) {
  const { error } = await supabase.rpc(fn, fn === 'calculate_age' ? { p_birth_date: '2000-01-01' } : { [fn === 'detect_data_health_issues' ? 'p_academy_id' : fn === 'get_guardians' ? 'p_dependent_id' : 'p_guardian_id']: '00000000-0000-0000-0000-000000000000' });
  console.log(error?.message?.includes('function') ? `  ❌ ${fn}: NÃO EXISTE` : `  ✅ ${fn}: existe`);
}

// Verificar vínculos familiares
console.log('\nFamílias:');
const { data: links } = await supabase.from('family_links').select('*, guardian:guardian_person_id(full_name), dependent:dependent_person_id(full_name)').limit(10);
for (const l of links || []) {
  console.log(`  👨‍👩‍👧 ${(l.guardian as any)?.full_name} → ${(l.dependent as any)?.full_name} (${l.relationship})`);
}
```

**Commit:** `feat: seed-everything + verify-everything scripts`

---

## BLOCO 4 — TROCAR TODOS OS SERVICES DE MOCK → REAL

### 4A. Listar todos os services que precisam do bloco real

```bash
# Services dos 4 prompts que têm isMock():
grep -rl "isMock()" lib/api/family*.ts lib/api/academy-settings*.ts lib/api/data-health*.ts lib/api/billing*.ts lib/api/family-billing*.ts lib/api/audit*.ts 2>/dev/null
```

### 4B. Para CADA service encontrado:

1. Abrir o arquivo
2. Verificar se o bloco `else` do `isMock()` tem queries reais com `createClient`
3. Se o bloco real está vazio ou incompleto → implementar as queries

**Padrão para bloco real:**

```typescript
if (isMock()) {
  // ... retorna dados mock
}

try {
  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('TABELA')
    .select('*')
    .eq('campo', valor);
  
  if (error) throw error;
  return mapFromDb(data);
} catch (error) {
  throw handleServiceError(error, 'nomeFuncao');
}
```

### 4C. Verificar que NENHUM service está hardcoded como mock-only

```bash
# Encontrar services que retornam no bloco mock SEM ter bloco real
for f in lib/api/family.service.ts lib/api/family-billing.service.ts lib/api/academy-settings.service.ts lib/api/data-health.service.ts lib/api/audit.service.ts lib/api/billing.service.ts; do
  if [ -f "$f" ]; then
    MOCK_COUNT=$(grep -c "isMock()" "$f" 2>/dev/null || echo 0)
    REAL_COUNT=$(grep -c "createClient" "$f" 2>/dev/null || echo 0)
    echo "$f: mock=$MOCK_COUNT, real=$REAL_COUNT"
    if [ "$REAL_COUNT" -eq 0 ] && [ "$MOCK_COUNT" -gt 0 ]; then
      echo "  ⚠️ MOCK-ONLY — precisa de bloco real!"
    fi
  fi
done
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: switch all new services from mock to real Supabase queries`

---

## BLOCO 5 — EDGE FUNCTIONS VERIFICAÇÃO

### 5A. Listar edge functions

```bash
ls -d supabase/functions/*/ 2>/dev/null
```

Esperado (dos 4 prompts):
- `supabase/functions/delete-account/index.ts`
- `supabase/functions/admin-create-user/index.ts`
- `supabase/functions/evolve-profile/index.ts`
- `supabase/functions/process-checkin/index.ts` (já existia)
- `supabase/functions/generate-qr/index.ts` (já existia)

### 5B. Verificar que cada edge function compila

```bash
for dir in supabase/functions/*/; do
  fn=$(basename "$dir")
  if [ -f "$dir/index.ts" ]; then
    echo "✅ $fn — existe"
    head -3 "$dir/index.ts"
  else
    echo "❌ $fn — index.ts não encontrado"
  fi
done
```

### 5C. Se alguma falta, criar

Se `delete-account`, `admin-create-user`, ou `evolve-profile` não existem, criar agora com a implementação dos prompts MARCA_FINAL e COMPLEMENTAR.

### 5D. Gerar instrução de deploy para o Gregory

```markdown
## Deploy de Edge Functions

No terminal do projeto, rodar:

```bash
# Instalar CLI do Supabase (se não tem)
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref tdplmmodmumryzdosmpv

# Deploy de cada function
supabase functions deploy delete-account
supabase functions deploy admin-create-user
supabase functions deploy evolve-profile
supabase functions deploy process-checkin
supabase functions deploy generate-qr
```

Adicionar ao `INSTRUCOES_FINAIS.md`.

**Commit:** `feat: verify and prepare edge functions for deployment`

---

## BLOCO 6 — INTEGRAR AUDIT LOG NOS PONTOS CRÍTICOS

### 6A. Verificar se audit está integrado

```bash
grep -rn "logAudit" app/ lib/ --include="*.ts" --include="*.tsx" | grep -v "audit.service" | head -20
```

### 6B. Se não está integrado, adicionar chamadas

Nos seguintes pontos:
- `app/api/students/create/route.ts` → após criar aluno
- `app/api/webhooks/asaas/route.ts` → após processar webhook
- `app/api/payments/generate/route.ts` → após gerar pagamento
- Edge function `delete-account` → antes de deletar
- Edge function `evolve-profile` → após evoluir
- Formulário de login (AuthContext) → após login bem-sucedido
- Qualquer outro endpoint POST/PUT/DELETE

Padrão:
```typescript
import { logAudit } from '@/lib/api/audit.service';

// Após a operação:
await logAudit({
  academyId: profile.academyId,
  action: 'create',
  entityType: 'student',
  entityId: newStudent.id,
  newData: { name: newStudent.name, email: newStudent.email },
});
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: integrate audit log in all critical operations`

---

## BLOCO 7 — VERIFICAÇÃO FINAL DE SEGURANÇA

### 7A. RLS audit

```bash
# Verificar que TODAS as tabelas públicas têm RLS ativado
cat > /tmp/check-rls.sql << 'EOF'
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY rowsecurity, tablename;
EOF
echo "Cole o SQL acima no Supabase SQL Editor e verifique que TODAS as tabelas têm rowsecurity = true"
```

### 7B. Secrets audit

```bash
echo "=== VERIFICAÇÃO DE SECRETS ==="
# Verificar que não tem secrets hardcoded
grep -rn "eyJ\|sb_secret\|sk_live\|pk_live\|api_key.*=.*['\"]" lib/ app/ --include="*.ts" --include="*.tsx" | grep -v "process.env\|.env\|example\|mock\|test" | head -10

# Se encontrar algo, é URGENTE remover
```

### 7C. Headers de segurança

```bash
cat vercel.json | grep -A2 "X-Content-Type\|X-Frame\|Strict-Transport\|X-XSS"
```

Se não tem headers, adicionar ao `vercel.json`.

### 7D. Rate limiting aplicado

```bash
grep -rn "rateLimit\|rate_limit\|rateLimiter" app/api/ --include="*.ts" | head -10
```

Se não tem rate limiting nos endpoints críticos, adicionar.

**Commit:** `security: final audit — RLS, secrets, headers, rate limiting verified`

---

## BLOCO 8 — GERAR INSTRUÇÃO FINAL CONSOLIDADA PARA O GREGORY

Criar `INSTRUCOES_FINAIS.md`:

```markdown
# BlackBelt v2 — Instruções Finais para Ativação Completa

## Passo 1: Rodar a Migration Master (5 minutos)

1. Abra: https://supabase.com/dashboard → blackbelt-production → SQL Editor
2. Clique "New Query"
3. Cole o conteúdo COMPLETO do arquivo `MIGRATION_MASTER_PARA_RODAR.sql`
4. Clique RUN
5. Deve retornar "Success" sem erros
6. Se der erro de "already exists" → OK, é idempotente

## Passo 2: Rodar o Seed (5 minutos)

No terminal do projeto:
```bash
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE \
NEXT_PUBLIC_SUPABASE_URL=https://tdplmmodmumryzdosmpv.supabase.co \
npx tsx scripts/seed-everything.ts
```

## Passo 3: Verificar (2 minutos)

```bash
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE \
NEXT_PUBLIC_SUPABASE_URL=https://tdplmmodmumryzdosmpv.supabase.co \
npx tsx scripts/verify-everything.ts
```

Todas as linhas devem ser ✅.

## Passo 4: Deploy Edge Functions (5 minutos)

```bash
supabase login
supabase link --project-ref tdplmmodmumryzdosmpv
supabase functions deploy delete-account
supabase functions deploy admin-create-user
supabase functions deploy evolve-profile
```

## Passo 5: Configurar Env Vars na Vercel (5 minutos)

Adicionar no Vercel Dashboard → Settings → Environment Variables:
- RESEND_API_KEY = (criar em resend.com)
- RESEND_DOMAIN = blackbelts.com.br (ou o domínio que comprar)
- ASAAS_API_KEY = (criar em asaas.com → sandbox primeiro)
- ASAAS_SANDBOX = true (trocar pra false quando for produção)
- ASAAS_WEBHOOK_TOKEN = (gerar token único pra validar webhooks)

## Passo 6: Configurar Webhook do Asaas (5 minutos)

No dashboard do Asaas:
1. Vá em Integrações → Webhooks
2. URL: https://blackbelts.com.br/api/webhooks/asaas?access_token=SEU_TOKEN
3. Eventos: PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_REFUNDED
4. Salvar

## Passo 7: Testar no Browser (30 minutos)

Usar o checklist `TESTE_MANUAL_10_FLUXOS.md` que já está na raiz do projeto.

## Passo 8: Redeploy

Após configurar tudo:
1. Vercel Dashboard → Deployments
2. No deploy mais recente → "..." → Redeploy
3. DESMARCAR "Use existing Build Cache"
4. Aguardar build (3-5 min)
5. Testar de novo

## Resumo do que foi ativado:
- 15 tabelas novas no banco
- 4 helper functions SQL
- RLS em todas as tabelas
- 5 edge functions
- Email transacional (Resend)
- Pagamento (Asaas com PIX + Boleto)
- Audit log
- Famílias com vínculos
- Controle parental
- Timeline do aluno
- Painel de inconsistências
- Exclusão de conta (Apple compliance)
- Consentimento parental (Apple compliance)
```

**Commit:** `docs: final consolidated instructions for Gregory`

---

## BLOCO 9 — SCRIPT FINAL-CHECK ATUALIZADO

Atualizar `scripts/final-check.sh` (do MARCA_FINAL) para incluir os itens do COMPLEMENTAR:

Adicionar verificações:
```bash
# Asaas
test -f lib/payment/asaas.ts
check "Asaas SDK"
test -f app/api/webhooks/asaas/route.ts
check "Asaas webhook handler"
test -f app/api/payments/generate/route.ts
check "Payment generation API"

# Audit
test -f lib/api/audit.service.ts
check "Audit service"
grep -q "logAudit" app/api/students/create/route.ts 2>/dev/null
check "Audit integrado no create student"

# AuthGuard
test -f components/auth/AuthGuard.tsx
check "AuthGuard component"

# Edge functions
test -f supabase/functions/delete-account/index.ts
check "Edge: delete-account"
test -f supabase/functions/admin-create-user/index.ts
check "Edge: admin-create-user"
test -f supabase/functions/evolve-profile/index.ts
check "Edge: evolve-profile"

# Migration
test -f MIGRATION_MASTER_PARA_RODAR.sql
check "Migration master SQL"

# Seeds
test -f scripts/seed-everything.ts
check "Seed script"
test -f scripts/verify-everything.ts
check "Verify script"

# Trial
test -f components/trial/TrialBanner.tsx
check "Trial banner"

# Contato
find app -path "*contato*" -name "page.tsx" | grep -q .
check "Contato page"
```

**Commit:** `feat: updated final-check with all 4 prompts coverage`

---

## BLOCO 10 — BUILD FINAL + PUSH

```bash
# Verificação final
pnpm typecheck
pnpm build

# Se zero erros:
git add -A
git commit -m "feat: BlackBelt v2 — everything activated in real Supabase — ready for stores"
git push origin main

# Rodar o check
chmod +x scripts/final-check.sh
./scripts/final-check.sh
```

---

## COMANDO DE RETOMADA

```
Continue de onde parou no BLACKBELT_ATIVAR_TUDO.md. Verifique estado:
ls MIGRATION_MASTER_PARA_RODAR.sql 2>/dev/null && echo "B2 OK" || echo "B2 FALTA"
ls scripts/seed-everything.ts 2>/dev/null && echo "B3 OK" || echo "B3 FALTA"
for f in lib/api/family.service.ts lib/api/family-billing.service.ts lib/api/data-health.service.ts lib/api/audit.service.ts; do
  grep -c "createClient" "$f" 2>/dev/null || echo "0"
done | awk '{s+=$1}END{print "B4: " s " blocos reais"}'
ls supabase/functions/delete-account/index.ts supabase/functions/admin-create-user/index.ts supabase/functions/evolve-profile/index.ts 2>/dev/null | wc -l | xargs echo "B5: edge functions"
grep -c "logAudit" app/api/*/route.ts 2>/dev/null | awk -F: '{s+=$2}END{print "B6: " s " audit integrations"}'
ls INSTRUCOES_FINAIS.md 2>/dev/null && echo "B8 OK" || echo "B8 FALTA"
pnpm typecheck 2>&1 | tail -5
Continue da próxima seção incompleta. ZERO erros. Commit e push.
```
